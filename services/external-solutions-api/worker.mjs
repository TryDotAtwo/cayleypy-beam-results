const COMPETITION = "cayley-py-555-cube";
const MAX_BYTES = 256 * 1024;
const MAX_BATCH = 24;
const MAX_PATH = 1024;
const MAX_MOVES = 3000;
const MOVE = /^-?[A-Za-z][A-Za-z0-9_]{0,23}$/;
const HASH = /^[0-9a-f]{64}$/;
const METHODS = new Set(["exact_enumeration", "team_submission", "algebraic", "search", "other"]);
const encoder = new TextEncoder();

function json(value, status = 200, extra = {}) {
  return Response.json(value, {status, headers: {"Cache-Control":"no-store", "X-Content-Type-Options":"nosniff", ...extra}});
}
function fail(error, status, index) {
  return json(index === undefined ? {error} : {error,index}, status, status===401 ? {"WWW-Authenticate":'Bearer realm="external-solutions"'} : {});
}
function hasKeys(o, required, extra = []) {
  return o && Object.getPrototypeOf(o) === Object.prototype &&
    required.every(k => Object.hasOwn(o,k)) &&
    Object.keys(o).every(k => required.includes(k) || extra.includes(k));
}
function short(s, max) {
  return typeof s === "string" && s.length > 0 && s.length <= max &&
    s === s.trim() && !/[\u0000-\u001f\u007f]/.test(s);
}
async function sha(s) {
  const raw = await crypto.subtle.digest("SHA-256", encoder.encode(s));
  return Array.from(new Uint8Array(raw), x=>x.toString(16).padStart(2,"0")).join("");
}
async function authorized(req, token) {
  const h = req.headers.get("Authorization");
  if (typeof token !== "string" || token.length < 32 || !h?.startsWith("Bearer ") || h.length > 512) return false;
  const [a,b] = await Promise.all([sha(token),sha(h.slice(7))]);
  let delta = 0;
  for(let i=0;i<a.length;i++) delta |= a.charCodeAt(i)^b.charCodeAt(i);
  return delta === 0;
}
async function readBody(req) {
  if (Number(req.headers.get("Content-Length")) > MAX_BYTES) throw new Error("BODY_TOO_LARGE");
  if (req.headers.get("Content-Encoding") && req.headers.get("Content-Encoding") !== "identity") throw new Error("CONTENT_ENCODING");
  const reader=req.body?.getReader();
  if (!reader) throw new Error("INVALID_JSON");
  let total=0, out="";
  const decoder=new TextDecoder("utf-8",{fatal:true});
  while (true) {
    const {done,value}=await reader.read();
    if (done) break;
    total+=value.byteLength;
    if (total>MAX_BYTES) { await reader.cancel(); throw new Error("BODY_TOO_LARGE"); }
    out+=decoder.decode(value,{stream:true});
  }
  return JSON.parse(out+decoder.decode());
}
function sourceRecord(s) {
  if (!hasKeys(s,["method","url","version","credit","license"],["label"]) ||
      !METHODS.has(s.method) || !short(s.url,600) || !short(s.version,80) ||
      !short(s.credit,200) || !short(s.license,80) || (s.label!==undefined && !short(s.label,120))) return null;
  let url;
  try { url = new URL(s.url); } catch { return null; }
  // Store only public attribution URLs, not signed links, credentials or fragment tokens.
  if(url.protocol!=="https:" || url.username || url.password || url.search || url.hash || url.port) return null;
  return {method:s.method,url:url.href,version:s.version,credit:s.credit,license:s.license,...(s.label?{label:s.label}:{})};
}
async function add(req, env) {
  if (!(await authorized(req,env.UPLOAD_TOKEN))) return fail("UNAUTHORIZED",401);
  if (req.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") return fail("CONTENT_TYPE",415);
  let body;
  try { body=await readBody(req); } catch(e) {
    if(e.message==="BODY_TOO_LARGE") return fail("BODY_TOO_LARGE",413);
    if(e.message==="CONTENT_ENCODING") return fail("CONTENT_ENCODING",415);
    return fail("INVALID_JSON",400);
  }
  if (!hasKeys(body,["competition","solutions"]) || body.competition!==COMPETITION ||
      !Array.isArray(body.solutions) || !body.solutions.length || body.solutions.length>MAX_BATCH) return fail("INVALID_BATCH",400);
  let total=0;
  const items=[];
  for(const [i,x] of body.solutions.entries()){
    if(!hasKeys(x,["puzzle_id","path","source"]) || !Number.isInteger(x.puzzle_id) || x.puzzle_id<0 || x.puzzle_id>1034 ||
        !Array.isArray(x.path) || x.path.length>MAX_PATH || x.path.some(m=>typeof m!=="string" || !MOVE.test(m)))return fail("INVALID_SOLUTION",400,i);
    const source=sourceRecord(x.source);
    if(!source)return fail("INVALID_SOURCE",400,i);
    total+=x.path.length;
    if(total>MAX_MOVES)return fail("TOO_MANY_MOVES",400,i);
    items.push({...x,source});
  }
  const ids=[...new Set(items.map(x=>x.puzzle_id))];
  // D1 context is seeded administratively from a pinned puzzle snapshot; never accept context from the caller.
  const {results:rows}=await env.DB.prepare(
    `SELECT c.puzzle_id,c.start_json,c.goal_json,c.kind,m.moves_json
      FROM contexts c JOIN move_sets m ON m.version=c.version AND m.kind=c.kind
      WHERE c.version=? AND c.puzzle_id IN (${ids.map(()=>"?").join(",")})`
  ).bind(env.CONTEXT_VERSION,...ids).all();
  const trusted=new Map(), moveSets=new Map();
  for(const r of rows){
    if(!moveSets.has(r.kind)) moveSets.set(r.kind,JSON.parse(r.moves_json));
    trusted.set(r.puzzle_id,{start:JSON.parse(r.start_json),goal:JSON.parse(r.goal_json),moves:moveSets.get(r.kind)});
  }
  for(const [i,x] of items.entries()){
    const c=trusted.get(x.puzzle_id);
    if(!c)return fail("UNKNOWN_PUZZLE",422,i);
    let state=c.start, tmp=new Array(state.length), previous=state;
    for(const move of x.path){
      if(!Object.hasOwn(c.moves,move))return fail("UNKNOWN_MOVE",422,i);
      const permutation=c.moves[move];
      for(let j=0;j<state.length;j++) tmp[j]=state[permutation[j]];
      previous=state; state=tmp; tmp=previous===c.start ? new Array(state.length) : previous;
    }
    if(state.length!==c.goal.length || state.some((v,j)=>v!==c.goal[j]))return fail("TARGET_MISMATCH",422,i);
  }
  const prepared=await Promise.all(items.map(async x=>{
    const path=JSON.stringify(x.path), source=JSON.stringify(x.source);
    const [id,sourceId]=await Promise.all([sha(JSON.stringify([COMPETITION,env.CONTEXT_VERSION,x.puzzle_id,x.path])),sha(source)]);
    return {id,sourceId,source,path,puzzle:x.puzzle_id,length:x.path.length};
  }));
  const statements=prepared.flatMap(x=>[
    env.DB.prepare("INSERT INTO solutions VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING")
      .bind(x.id,env.CONTEXT_VERSION,x.puzzle,x.path,x.length),
    env.DB.prepare("INSERT INTO provenances VALUES (?, ?, ?) ON CONFLICT(solution_id,source_id) DO NOTHING")
      .bind(x.id,x.sourceId,x.source),
  ]);
  const writes=await env.DB.batch(statements);
  const results=prepared.map((x,i)=>({id:x.id,status:writes[2*i].meta.changes?"created":writes[2*i+1].meta.changes?"source_added":"existing"}));
  return json({context_version:env.CONTEXT_VERSION,results},results.some(x=>x.status!=="existing")?201:200);
}
function rowOutput(r) {
  return {id:r.id,competition:COMPETITION,context_version:r.version,puzzle_id:r.puzzle_id,
          path:JSON.parse(r.path_json),length:r.length,verification:"replay_passed"};
}
async function list(url,env) {
  const params=url.searchParams;
  const puzzle=params.get("puzzle_id")??"", after=params.get("after")??"", n=params.get("limit")??"24";
  if(params.get("competition")!==COMPETITION || !/^(0|[1-9][0-9]{0,3})$/.test(puzzle) || Number(puzzle)>1034 ||
     (after&&!HASH.test(after)) || !/^[1-9][0-9]?$/.test(n) || Number(n)>50 || [...params.keys()].some(k=>!["competition","puzzle_id","after","limit"].includes(k) || params.getAll(k).length!==1))return fail("INVALID_QUERY",400);
  const {results}=await env.DB.prepare("SELECT * FROM solutions WHERE version=? AND puzzle_id=? AND id>? ORDER BY id LIMIT ?")
      .bind(env.CONTEXT_VERSION,Number(puzzle),after,Number(n)+1).all();
  const page=results.slice(0,Number(n));
  return json({solutions:page.map(rowOutput),next_cursor:results.length>page.length?page.at(-1).id:null});
}
async function read(id,url,env) {
  const after=url.searchParams.get("source_after")??"";
  if((after&&!HASH.test(after)) || [...url.searchParams.keys()].some(k=>k!=="source_after" || url.searchParams.getAll(k).length!==1))return fail("INVALID_QUERY",400);
  const r=await env.DB.prepare("SELECT * FROM solutions WHERE id=?").bind(id).first();
  if(!r)return fail("NOT_FOUND",404);
  const {results}=await env.DB.prepare("SELECT source_id,source_json FROM provenances WHERE solution_id=? AND source_id>? ORDER BY source_id LIMIT 51").bind(id,after).all();
  const page=results.slice(0,50);
  return json({...rowOutput(r),sources:page.map(p=>JSON.parse(p.source_json)),next_source_cursor:results.length>page.length?page.at(-1).source_id:null});
}
export default {async fetch(req,env) {
  const url=new URL(req.url);
  try {
    if(url.pathname==="/healthz"&&req.method==="GET"){
      const r=await env.DB.prepare("SELECT COUNT(*) AS count FROM contexts WHERE version=?").bind(env.CONTEXT_VERSION).first();
      return json({status:r.count===1035?"ready":"context_incomplete",context_version:env.CONTEXT_VERSION,puzzles:r.count},r.count===1035?200:503);
    }
    if(url.pathname==="/v1/solutions"){
      if(req.method==="POST")return await add(req,env);
      if(req.method==="GET")return await list(url,env);
      return json({error:"METHOD_NOT_ALLOWED"},405,{Allow:"GET, POST"});
    }
    const id=url.pathname.match(/^\/v1\/solutions\/([0-9a-f]{64})$/)?.[1];
    if(id&&req.method==="GET")return await read(id,url,env);
    return fail("NOT_FOUND",404);
  } catch { return fail("SERVICE_UNAVAILABLE",503); }
}};

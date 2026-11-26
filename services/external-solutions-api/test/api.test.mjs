import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Miniflare } from "miniflare";

const key = "test-upload-key-not-a-production-secret";
const source = {
  method: "exact_enumeration",
  url: "https://www.kaggle.com/datasets/example/cube555/data",
  version: "1", credit: "Dataset contributor", license: "CC0-1.0"
};
const competition = "cayley-py-555-cube";
const set = {competition, context_version:"fixture-v1", solutions: [{puzzle_id: 35, path: ["r0"], source}]};
let mf;
let d1;

before(async () => {
  mf = new Miniflare({
    modules: true, scriptPath: "./worker.mjs", compatibilityDate: "2026-07-28",
    d1Databases: ["DB"], bindings: {UPLOAD_TOKEN: key, CONTEXT_VERSION: "fixture-v1"}
  });
  d1 = await mf.getD1Database("DB");
  const sql = await readFile("./migrations/0001_external.sql", "utf8");
  for (const s of sql.split(";").map(x => x.trim()).filter(Boolean)) await d1.prepare(s).run();
  const target = Array.from({length:150}, (_,i) => i);
  const order = target.slice();
  [order[0],order[1]] = [1,0];
  await d1.prepare("INSERT INTO competitions VALUES (?, ?, ?)").bind(competition,"fixture-v1",1).run();
  await d1.prepare("INSERT INTO move_sets VALUES (?, ?, ?, ?)").bind(competition,"fixture-v1","cube",JSON.stringify({r0:order})).run();
  await d1.prepare("INSERT INTO contexts VALUES (?, ?, ?, ?, ?, ?)").bind(competition,"fixture-v1", 35, JSON.stringify(order), JSON.stringify(target), "cube").run();
});
after(async () => mf?.dispose());

async function post(data, token=key, headers={}) {
  return mf.dispatchFetch("https://api.test/v1/solutions", {
    method: "POST", headers: {"Content-Type":"application/json", ...(token ? {Authorization:"Bearer "+token}: {}),...headers},
    body: typeof data==="string" ? data : JSON.stringify(data)
  });
}
const get = (path) => mf.dispatchFetch("https://api.test"+path);

test("requires authorization before processing body", async () => {
  assert.equal((await post(set,null)).status, 401);
  assert.equal((await post(set,"wrong")).status, 401);
});
test("checks the trusted target and rejects entire invalid batch", async () => {
  const b = await post({...set,solutions:[set.solutions[0],{puzzle_id:35,path:[],source}]});
  assert.equal(b.status,422);
  assert.deepEqual(await b.json(),{error:"TARGET_MISMATCH",index:1});
  assert.equal((await d1.prepare("SELECT count(*) AS n FROM solutions").first()).n,0);
});
test("rejects invented puzzle, unknown move, extra metadata and insecure URLs", async () => {
  for (const [row,error,status] of [
    [{puzzle_id:36,path:["r0"],source},"UNKNOWN_PUZZLE",422],
    [{puzzle_id:35,path:["nope"],source},"UNKNOWN_MOVE",422],
    [{puzzle_id:35,path:["r0"],source,gpu_count:0},"INVALID_SOLUTION",400],
    [{puzzle_id:35,path:["r0"],source:{...source,url:"http://example.org"}},"INVALID_SOURCE",400],
    [{puzzle_id:35,path:["r0"],source:{...source,url:"https://user:secret@example.org/"}},"INVALID_SOURCE",400]
  ]) {
    const r=await post({...set,solutions:[row]});
    assert.equal(r.status,status);
    assert.equal((await r.json()).error,error);
  }
});
test("stores a verified path exactly once but keeps distinct provenance", async () => {
  const r=await post(set); assert.equal(r.status,201);
  const {results:[first]}=await r.json(); assert.equal(first.status,"created");
  const dup=await post(set); assert.equal(dup.status,200);
  assert.deepEqual((await dup.json()).results,[{...first,status:"existing"}]);
  const other=await post({...set,solutions:[{...set.solutions[0],source:{...source,method:"team_submission"}}]});
  assert.equal(other.status,201);
  assert.deepEqual((await other.json()).results,[{...first,status:"source_added"}]);
  const list=await get("/v1/solutions?competition="+competition+"&context_version=fixture-v1&puzzle_id=35");
  assert.equal(list.status,200); assert.equal((await list.json()).solutions.length,1);
  const one=await get("/v1/solutions/"+first.id);
  const record=await one.json();
  assert.equal(record.verification,"replay_passed");
  assert.equal(record.sources.length,2);
  assert.deepEqual(record.path,["r0"]);
  assert.ok(!("optimal" in record));
});
test("bounds request bytes, moves, list filters, and duplicate rows in same request", async () => {
  assert.equal((await post(" ".repeat(256*1024+1))).status,413);
  assert.equal((await post({...set,solutions:Array(25).fill(set.solutions[0])})).status,400);
  assert.equal((await post({...set,solutions:[{...set.solutions[0],path:Array(1025).fill("r0")}]})).status,400);
  assert.equal((await get("/v1/solutions?competition="+competition+"&context_version=fixture-v1&puzzle_id=035")).status,400);
  const r=await post({...set,solutions:[set.solutions[0],set.solutions[0]]});
  assert.equal(r.status,200); assert.equal((await r.json()).results.length,2);
});

test("registers another puzzle family without a server change and isolates competition/version", async () => {
  const {execFileSync}=await import("node:child_process");
  const {createHash}=await import("node:crypto");
  const {mkdtemp,writeFile,rm}=await import("node:fs/promises");
  const {tmpdir}=await import("node:os");
  const {join}=await import("node:path");
  const p=await mkdtemp(join(tmpdir(),"external-context-test-"));
  try {
    const manifest={competition:"permutation-three",context_version:"fixture-v1",
      move_sets:{row:{r0:[1,0,2]}},puzzles:[{puzzle_id:35,kind:"row",start:[1,0,0],target:[0,1,0]},
        {puzzle_id:9000,kind:"row",start:[1,0,0],target:[0,1,0]}]};
    const raw=JSON.stringify(manifest);
    const sha=createHash("sha256").update(raw).digest("hex");
    await writeFile(join(p,"manifest.json"),raw);
    assert.throws(()=>execFileSync("python",["seed_context.py",join(p,"manifest.json"),"--sha256","0".repeat(64),join(p,"bad.sql")],{stdio:"pipe"}),/SHA256 mismatch/);
    execFileSync("python",["seed_context.py",join(p,"manifest.json"),"--sha256",sha,join(p,"out.sql")]);
    for (const sql of (await readFile(join(p,"out.sql"),"utf8")).split(";").map(s=>s.trim()).filter(Boolean)) await d1.prepare(sql).run();
    const other=await post({...set,competition:"permutation-three"}); assert.equal(other.status,201);
    const otherId=(await other.json()).results[0].id;
    const cube=await post(set); assert.notEqual((await cube.json()).results[0].id,otherId);
    assert.equal((await post({...set,context_version:"unknown-version"})).status,422);
    assert.equal((await post({...set,competition:"permutation-three",solutions:[{...set.solutions[0],puzzle_id:9000}]})).status,201);
    const list=await get("/v1/contexts");
    assert.deepEqual((await list.json()).contexts.map(x=>x.competition),[competition,"permutation-three"]);
  } finally {await rm(p,{recursive:true,force:true});}
});

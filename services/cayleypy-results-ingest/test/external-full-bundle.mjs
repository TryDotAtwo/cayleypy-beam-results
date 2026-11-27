import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
const [bundle, seed, csv, importer, migration, checkpoint] = process.argv.slice(2);
const key = "local-full-dataset-test-token-000000";
const mf = new Miniflare({
 modules: [{type:"ESModule",path:"entry.mjs",contents:"export {default, GitHubWriter} from './bundle.mjs';"},{type:"ESModule",path:"bundle.mjs",contents:await readFile(bundle,"utf8")}],
 compatibilityDate:"2026-07-28",d1Databases:["EXTERNAL_SOLUTIONS_DB"],
 bindings:{EXTERNAL_SOLUTIONS_UPLOAD_TOKEN:key,INGEST_MODE:"normal"}
});
try {
 const db=await mf.getD1Database("EXTERNAL_SOLUTIONS_DB");
 const sql=((await readFile(migration,"utf8"))+"\n"+(await readFile(seed,"utf8"))).split(";").map(x=>x.trim()).filter(Boolean);
 for(let i=0;i<sql.length;i+=50) await db.batch(sql.slice(i,i+50).map(x=>db.prepare(x)));
 const base=await mf.ready;
 const get=p=>fetch(new URL(p,base)).then(x=>x.json());
 assert.equal((await get("/healthz")).status,"ok");
 assert.deepEqual((await get("/v1/contexts")).contexts,[{competition:"cayley-py-555-cube",context_version:"cube555-kaggle-v1",puzzle_count:1035}]);
 const proc=spawn("python",[importer,csv,"--endpoint",new URL("/v1/solutions",base).href,"--state",checkpoint],{stdio:"inherit",env:{...process.env,EXTERNAL_SOLUTIONS_UPLOAD_TOKEN:key}});
 const [ec]=await once(proc,"exit"); assert.equal(ec,0);
 const counts=await db.prepare("SELECT COUNT(*) AS paths,COUNT(DISTINCT puzzle_id) AS puzzles FROM solutions").first();
 assert.deepEqual(counts,{paths:15311,puzzles:1035});
 const {sources}=await db.prepare("SELECT COUNT(*) AS sources FROM provenances").first();
 assert.equal(sources,15311);
 console.log(JSON.stringify({...counts,sources,scope:"combined worker, local D1 HTTP"}));
} finally { await mf.dispose(); }

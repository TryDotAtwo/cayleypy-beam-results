import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";

const [seed,csv] = process.argv.slice(2);
if (!seed || !csv) throw new Error("usage: node test/full-dataset.mjs seed.sql solutions_table.csv");
const key = "local-full-dataset-test-token-000000";
const mf = new Miniflare({
    modules:true,scriptPath:"./worker.mjs",compatibilityDate:"2026-07-28",
    d1Databases:["DB"],bindings:{UPLOAD_TOKEN:key, CONTEXT_VERSION:"cube555-kaggle-v1"}
});
const scratch=await mkdtemp(join(tmpdir(),"cube555-upload-audit-"));
try {
  const d1=await mf.getD1Database("DB");
  const schema=await readFile("./migrations/0001_external.sql","utf8");
  const parts=(schema+"\n"+(await readFile(seed,"utf8"))).split(";").map(x=>x.trim()).filter(Boolean);
  for(let i=0;i<parts.length;i+=50) await d1.batch(parts.slice(i,i+50).map(x=>d1.prepare(x)));
  const base=await mf.ready;
  const health=await (await fetch(new URL("/healthz",base))).json();
  assert.equal(health.contexts,1);
  assert.equal(health.status,"ready");
  const child=spawn("python",["import_antonina.py",resolve(csv),"--endpoint",new URL("/v1/solutions",base).href,"--state",join(scratch,"checkpoint.json")],{
    stdio:"inherit",env:{...process.env,EXTERNAL_SOLUTIONS_UPLOAD_TOKEN:key}
  });
  const [ec]=await once(child,"exit");
  assert.equal(ec,0);
  const row=await d1.prepare("SELECT COUNT(*) AS paths,COUNT(DISTINCT puzzle_id) AS puzzles FROM solutions").first();
  assert.equal(row.paths,15311);
  assert.equal(row.puzzles,1035);
  const attribution=await d1.prepare("SELECT COUNT(*) AS sources FROM provenances").first();
  assert.equal(attribution.sources,15311);
  console.log(JSON.stringify({...row,...attribution,scope:"local Miniflare/D1 HTTP only"}));
} finally {
  await mf.dispose();
  await rm(scratch,{recursive:true,force:true});
}

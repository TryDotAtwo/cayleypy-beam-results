import { Miniflare } from "miniflare";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const mf = new Miniflare({
 modules: [{type:"ESModule",path:"entry.mjs",contents:"export {default, GitHubWriter} from './bundle.mjs';"},{type:"ESModule",path:"bundle.mjs",contents:await readFile(process.argv[2],"utf8")}], compatibilityDate: "2026-07-28",
 d1Databases: ["EXTERNAL_SOLUTIONS_DB"],
 bindings: { INGEST_MODE: "normal", EXTERNAL_SOLUTIONS_UPLOAD_TOKEN: "valid-test-key-12345678901234567890" },
});
test("installed ingress entry point serves external rows and retains original health", async () => {
 try {
  const db = await mf.getD1Database("EXTERNAL_SOLUTIONS_DB");
  await db.prepare("CREATE TABLE competitions (slug TEXT, version TEXT, puzzle_count INTEGER)").run();
  await db.prepare("INSERT INTO competitions VALUES ('test-external', 'v1', 1)").run();
  const res = await mf.dispatchFetch("https://worker.test/v1/contexts");
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {contexts:[{competition:"test-external",context_version:"v1",puzzle_count:1}],truncated:false});
  const denied = await mf.dispatchFetch("https://worker.test/v1/solutions", {method:"POST",body:"{}"});
  assert.equal(denied.status, 401);
  const old = await mf.dispatchFetch("https://worker.test/healthz");
  assert.equal(old.status, 200);
  assert.equal((await old.json()).status, "ok");
 } finally { await mf.dispose(); }
});

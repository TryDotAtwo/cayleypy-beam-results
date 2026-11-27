import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {nextAcceptedBatch} from "../accepted-export.mjs";

const h = x => createHash("sha256").update(JSON.stringify(x)).digest("hex");
function sample() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../migrations/0001_external.sql",import.meta.url),"utf8"));
  db.prepare("INSERT INTO competitions VALUES ('toy','v1',1)").run();
  db.prepare("INSERT INTO move_sets VALUES ('toy','v1','sample','{}')").run();
  db.prepare("INSERT INTO contexts VALUES ('toy','v1',7,'[]','[]','sample')").run();
  const path=["swap"];
  const id=h(["toy","v1",7,path]);
  db.prepare("INSERT INTO solutions VALUES (?, 'toy','v1',7,?,1)").run(id,JSON.stringify(path));
  for (const label of ["first","second"]) {
    const src={method:"exact_enumeration",url:"https://example.org/result",version:"1",credit:"Test",license:"CC0-1.0",label};
    db.prepare("INSERT INTO provenances VALUES (?,?,?)").run(id,h(src),JSON.stringify(src));
  }
  const wrap={prepare(sql){return {bind(...params){return {async all(){return {results:db.prepare(sql).all(...params)}}}}}}};
  return {db, wrap};
}

test("paginates by provenance, exports exact moves and preserves retries", async () => {
  const {db,wrap}=sample();
  try {
    const a=await nextAcceptedBatch(wrap,0,1);
    assert.deepEqual(a,await nextAcceptedBatch(wrap,0,1));
    assert.equal(a.nextCursor,1);
    const b=await nextAcceptedBatch(wrap,a.nextCursor,1);
    assert.equal(b.nextCursor,2);
    assert.equal(await nextAcceptedBatch(wrap,b.nextCursor),null);
    assert.equal(JSON.parse(a.content).source.label,"first");
    assert.equal(JSON.parse(b.content).source.label,"second");
    assert.deepEqual(JSON.parse(b.content).path,["swap"]);
    assert.equal(b.path,"external-solutions/accepted/0000000000000002-0000000000000002.jsonl");
  } finally {db.close()}
});
test("fails closed if accepted content no longer matches its IDs", async () => {
  const {db,wrap}=sample();
  try {
    db.exec("UPDATE solutions SET path_json='[\"altered\"]'");
    await assert.rejects(nextAcceptedBatch(wrap,0),/external_integrity_mismatch/);
    await assert.rejects(nextAcceptedBatch(wrap,-1),/external_invalid_cursor/);
  } finally {db.close()}
});

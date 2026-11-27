/** Incremental export of immutable, replay-verified D1 provenance records. */
const QUERY = `SELECT p.rowid AS sequence, s.id, s.competition, s.version AS context_version,
 s.puzzle_id, s.path_json, s.length, p.source_id, p.source_json
 FROM provenances AS p JOIN solutions AS s ON s.id = p.solution_id
 WHERE p.rowid > ? ORDER BY p.rowid LIMIT ?`;
const DIGEST = /^[a-f0-9]{64}$/;
const LIMIT = 24;
const MAX_BYTES = 128 * 1024;
const enc = new TextEncoder();
const sha256 = async value => Array.from(
  new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value))),
  byte => byte.toString(16).padStart(2, "0"),
).join("");

/** A deterministic bounded batch. Stage it in Git before persisting nextCursor. */
export async function nextAcceptedBatch(db, cursor, limit = LIMIT) {
  if (!Number.isSafeInteger(cursor) || cursor < 0 || !Number.isSafeInteger(limit)
      || limit < 1 || limit > LIMIT) throw new Error("external_invalid_cursor");
  const queried = await db.prepare(QUERY).bind(cursor, limit).all();
  if (!Array.isArray(queried.results)) throw new Error("external_query_failed");
  const records = [];
  let bytes = 0, nextCursor = cursor;
  for (const row of queried.results) {
    if (!Number.isSafeInteger(row.sequence) || row.sequence <= nextCursor
        || !DIGEST.test(row.id) || !DIGEST.test(row.source_id)
        || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(row.competition)
        || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(row.context_version)
        || !Number.isInteger(row.puzzle_id) || row.puzzle_id < 0 || row.puzzle_id > 2147483647) {
      throw new Error("external_invalid_record");
    }
    const path = JSON.parse(row.path_json), source = JSON.parse(row.source_json);
    if (!Array.isArray(path) || path.length !== row.length || path.length > 1024
        || path.some(m => typeof m !== "string" || !/^-?[A-Za-z][A-Za-z0-9_]{0,23}$/.test(m))
        || await sha256(JSON.stringify([row.competition,row.context_version,row.puzzle_id,path])) !== row.id
        || await sha256(JSON.stringify(source)) !== row.source_id) {
      throw new Error("external_integrity_mismatch");
    }
    const line = JSON.stringify({
      sequence: row.sequence, id: row.id, source_id: row.source_id,
      competition: row.competition, context_version: row.context_version,
      puzzle_id: row.puzzle_id, path, source, verification: "replay_passed",
    }) + "\n";
    const n = enc.encode(line).byteLength;
    if (bytes + n > MAX_BYTES) {
      if (records.length === 0) throw new Error("external_oversized_record");
      break;
    }
    bytes += n;
    records.push(line);
    nextCursor = row.sequence;
  }
  if (!records.length) return null;
  const start = JSON.parse(records[0]).sequence;
  const pad = num => String(num).padStart(16, "0");
  return { nextCursor, count: records.length,
    path: `external-solutions/accepted/${pad(start)}-${pad(nextCursor)}.jsonl`,
    content: records.join("") };
}

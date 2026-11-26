# External Cube555 solutions

This Cloudflare Worker is a separate import and read API. It does not change the existing ML beam-search submission API, the GitHub publication workflow, or the existing catalog. It stores external solutions in a separate D1 database and serves the verified catalog by puzzle ID.

`POST /v1/solutions` uses a dedicated owner-issued bearer token. Only submit paths and provenance that may be published. Read endpoints are intentionally public. Example (the moves are schematic; the API replays the actual path):

```json
{"competition":"cayley-py-555-cube","solutions":[{"puzzle_id":35,"path":["r0","-d1"],"source":{"method":"exact_enumeration","url":"https://example.org/public-result","version":"1","credit":"Dataset compiler","license":"CC0-1.0"}}]}
```

Methods: `exact_enumeration`, `team_submission`, `algebraic`, `search`, `other`. An optional `label` preserves the original source label. The link must be public HTTPS without a query, fragment or credentials. Version, credit and license are attribution claims, not independently verified authorship. GPU, model, runtime and score are not accepted fields. The server uses only its pinned start states, target and generators, verifies the complete path, and rejects the whole request before any writes if a path fails. It does not assert optimality or exhaustiveness. Repeating the same path and provenance returns `existing`; a new provenance for that path returns `source_added`. Limits: 24 paths, 3,000 total moves and 256 KiB per request, 1,024 moves per path.

- `GET /v1/solutions?competition=cayley-py-555-cube&puzzle_id=35`: paginate via `next_cursor` / `after`; optional `limit` (1–50).
- `GET /v1/solutions/<id>`: includes sources, with `next_source_cursor` / `source_after` if more than 50.
- `GET /healthz`: ready only after 1,035 official contexts are seeded.

## Deploy and seed

1. In this directory, use Node.js 24 and run `npm ci && npm test && npm run dry-run`.
2. Create a **separate** empty Cloudflare D1 database called `cayleypy-external-solutions`. Set its actual UUID in `wrangler.jsonc` (the checked-in zero UUID is a placeholder; never use the existing ingest database). Use the account's authorized Wrangler session. Apply `npx wrangler d1 migrations apply DB --remote`.
3. Use authorized copies of Kaggle's `test.csv` and `puzzle_info.json`; do not commit raw competition files or the generated SQL. Run `python seed_cube555.py <official-input-dir> cube555-seed.sql`, which pins both file hashes. Run `npx wrangler d1 execute DB --remote --file=cube555-seed.sql` once. Never replace a seeded context in place: a different official snapshot requires a new context version.
4. Deploy the independent Worker with `npx wrangler deploy` and set a new, random, at-least-32-character secret with `npx wrangler secret put UPLOAD_TOKEN`. The API refuses uploads until this is present. Check /healthz, then submit a genuine public path and retry it once to validate deduplication. Do not attach this Worker to the old ingress domain. The dry run does not allocate resources.

## Load the public v1 dataset

Inspect counts without the network:
`python import_antonina.py solutions_table.csv`

With the verified Worker URL and `EXTERNAL_SOLUTIONS_UPLOAD_TOKEN` set privately:
`python import_antonina.py solutions_table.csv --endpoint https://<worker>/v1/solutions`

The importer pins the CSV's SHA-256, keeps the original labels and credits the dataset compiler (not as the author of each path), verifies response receipts, batches requests and advances its checkpoint only after an acknowledgment. Repeating a run with the same checkpoint resumes safely. The external catalog deduplicates internally; a path that also appears in the ML catalog remains independently attributable in this API.

Do not commit credentials, the uploader checkpoint, SQL generated from official inputs, or the downloaded archive.

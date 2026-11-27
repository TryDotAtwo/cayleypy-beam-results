# External CayleyPy solutions

These import and read routes run on the existing staging ingest Worker. They do not change the ML beam-search submission API, the GitHub publication workflow, or the existing ML catalog. It stores external solutions in a separate D1 database and serves the verified catalog by competition, context version, and puzzle ID.

`POST /v1/solutions` uses a dedicated owner-issued bearer token. Only submit paths and provenance that may be published. Read endpoints are intentionally public. Example (the moves are schematic; the API replays the actual path):

```json
{"competition":"cayley-py-555-cube","context_version":"cube555-kaggle-v1","solutions":[{"puzzle_id":35,"path":["r0","-d1"],"source":{"method":"exact_enumeration","url":"https://example.org/public-result","version":"1","credit":"Dataset compiler","license":"CC0-1.0"}}]}
```

Methods: `exact_enumeration`, `team_submission`, `algebraic`, `search`, `bfs`, `beam_search`, `human`, `other`. An optional `label` preserves the original source label. The link must be public HTTPS without a query, fragment or credentials. Version, credit and license are attribution claims, not independently verified authorship. GPU, model, runtime and score are not accepted fields. The server uses only its pinned start states, target and generators, verifies the complete path, and rejects the whole request before any writes if a path fails. It does not assert optimality or exhaustiveness. Repeating the same path and provenance returns `existing`; a new provenance for that path returns `source_added`. Limits: 24 paths, 3,000 total moves and 256 KiB per request, 1,024 moves per path.

- `GET /v1/solutions?competition=cayley-py-555-cube&context_version=cube555-kaggle-v1&puzzle_id=35`: paginate via `next_cursor` / `after`; optional `limit` (1–50).
- `GET /v1/solutions/<id>`: includes sources, with `next_source_cursor` / `source_after` if more than 50.
- `GET /v1/contexts`: lists up to 100 registered competition versions.
- `GET /healthz`: existing ingest Worker health check; use `/v1/contexts` to check external catalog readiness.

## Register a new puzzle family

No Worker change required. Use a reviewed JSON manifest with a known SHA-256 and run `python seed_context.py manifest.json --sha256 <approved-sha256> family-seed.sql`. Apply the reviewed seed to the API database. Upload requests cannot define or alter contexts. Each version has independent IDs and solutions; use a new version for changed rules. Supported now: exact-target permutation puzzles, including repeated labels (up to 512 positions and 256 named permutations per move set). Other transition rules or goals, such as up-to-symmetry matching, require a separately implemented verifier.

```json
{"competition":"toy-demo","context_version":"v1","move_sets":{"tiny":{"swap":[1,0,2]}},"puzzles":[{"puzzle_id":7,"kind":"tiny","start":[1,0,0],"target":[0,1,0]}]}
```

## Deploy and seed

Use the existing `cayleypy-results-ingest-staging` Worker and `../cayleypy-results-ingest/wrangler.github-staging.jsonc`. Keep the external `EXTERNAL_SOLUTIONS_DB` separate from the legacy `RESULTS_DB`. Use a dedicated `EXTERNAL_SOLUTIONS_UPLOAD_TOKEN` secret and preserve existing bindings and secrets when uploading a version.

From `services/cayleypy-results-ingest`, run `npm ci` and `npm run ci:cloudflare`. Apply `0001_external.sql` only to the new external D1 database. Use authorized copies of the Kaggle `test.csv` and `puzzle_info.json` with `python seed_cube555.py <official-input-dir> cube555-seed.sql`, which pins both input hashes. Apply the generated SQL to `EXTERNAL_SOLUTIONS_DB` only. A different input snapshot requires a new context version.

Upload a version before shifting the existing Worker traffic. Run a context-read, unauthorized-write and valid-write/read-back smoke test. When version URLs are unavailable because the Worker implements a Durable Object, test through a version override with the new version at 0% of default traffic. Do not enable automatic builds as part of deployment.
## Load the public v1 dataset

Inspect counts without the network:
`python import_antonina.py solutions_table.csv`

With the verified Worker URL and `EXTERNAL_SOLUTIONS_UPLOAD_TOKEN` set privately:
`python import_antonina.py solutions_table.csv --endpoint https://<worker>/v1/solutions`

The importer pins the CSV's SHA-256, keeps the original labels and credits the dataset compiler (not as the author of each path), verifies response receipts, batches requests and advances its checkpoint only after an acknowledgment. Repeating a run with the same checkpoint resumes safely. The external catalog deduplicates internally; a path that also appears in the ML catalog remains independently attributable in this API.

Do not commit credentials, the uploader checkpoint, SQL generated from official inputs, or the downloaded archive.

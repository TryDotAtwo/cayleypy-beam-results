# Publication protocol

`main` is the only branch. The mutable `ingest/staging` **tag** is a service checkpoint, not a release tag. Users read all published solutions from `main`.

The existing Cloudflare service validates each submission and appends immutable records to the service tag. Trusted App tag pushes trigger `validate-ingest`. Promotion validates append-only paths, schemas, hashes, replay and duplicates, rebuilds TSV/JSON and browsing pages, and compares a second clean rebuild byte-for-byte. It creates `cayleypy-results/exact-candidate` on the exact candidate before advancing `main`.

Both refs use compare-and-swap leases. Main updates must be fast-forward descendants of the current main; conflicts retry. A scheduled reconciliation every ten minutes recovers missed events. No temporary branches or publication PRs are created.

Keep the required `cayleypy-results/exact-candidate` check (GitHub Actions App) and strict up-to-date checking on main. The old zero-review PR-only requirement is replaced by checked fast-forward publication. Do not disable the status check. The publisher App needs only Contents write and Metadata read; it cannot write to main without the required check.

The live Worker bundle was migrated by changing exactly its two Git ref API routes from heads to tags. All modules, runtime settings, resource bindings and secret bindings were preserved. The code patch and sanitized hashes are recorded in the migration report.

Canonical records: `results/v1/<competition>/<puzzle-type>/<puzzle-id>/<date>/<uuid>.json` and `data/v2/slurm/<competition>/<puzzle-type>/<date>/<uuid>.json`. They are immutable. Generated files are owned by `tools/build_indexes.py`; the manifest lists browsing derivatives.

Author metadata is a producer claim, not identity verification. Acceptance by the service is not confirmation that a result has reached main: CLI callers should use `--wait` and check the final publication receipt.

Local verification: `python -m pytest tests plugins/cayleypy-results-publisher/tests -q`, `python tools/build_indexes.py --results results --out data`, and `python tools/validate_result.py --base <base> --head <candidate> --allow-generated-indexes`.

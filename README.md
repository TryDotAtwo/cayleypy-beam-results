# CayleyPy Beam Results

This repository is the public, append-only record store for canonical CayleyPy v1 results. `ingest/staging` is the trusted publication branch; `main` contains only fully validated, exactly indexed publications.

## Record contract

Normal producer commits may add only regular files at:

```
results/v1/<safe-competition>/<safe-puzzle-type>/<puzzle-id>/<UTC-date>/<uuidv7>.json
```

Existing records are immutable: edits, deletions, renames, symlinks, executable files, malformed wrappers, non-canonical JSON, duplicate submission/idempotency keys, and oversized envelopes are rejected. The validator applies the v1 JSON Schema, canonical SHA-256/idempotency checks, bounded permutation replay, reflection provenance/inverse checks, model-head parity, and a complete `HEAD` duplicate scan.

Only the promotion system may modify these deterministic derivatives:

```
data/index.tsv
data/by_author.tsv
data/best_solutions.tsv
data/runs.json
data/.human-results-manifest.json
data/<competition-slug>/index.tsv
data/<competition-slug>/puzzles/pNNNN/solutions.tsv
data/<competition-slug>/puzzles/pNNNN/best_solution.tsv
data/<competition-slug>/puzzles/pNNNN/metadata.json
data/<competition-slug>/puzzles/pNNNN/summary.md
```

They are rebuilt from the complete `results/` tree. Each competition `index.tsv` contains every solution for every puzzle; `best_solution.tsv` contains the deterministic shortest winner for its puzzle. Long Kaggle competition slugs are preserved as directory names, while detailed provenance remains in `metadata.json`. Promotion mode permits only this allowlist and byte-compares every checked-in derivative with a fresh rebuild. Legacy `data/` subdirectories and every `results/v1` record remain untouched.

## Trusted publisher and authorship

Only the configured GitHub App may publish normal staging commits. Before reading a record, the push workflow verifies the repository/ref, `GITHUB_ACTOR == RESULTS_INGEST_APP_LOGIN`, and that the event sender is a GitHub `Bot` whose numeric ID equals `RESULTS_INGEST_BOT_ID`.

This authenticates the publishing App, not a human author. Author metadata inside a record remains a producer claim and is not identity proof.

The producer service routes every validated submission through one Durable Object queue. Pending IDs are durable and deduplicated; GitHub ref conflicts retain work for retry rather than dropping it. The App writes ordinary non-force commits. Promotion uses explicit `--force-with-lease` compare-and-swap writes only for deterministic index/reconciliation commits, so concurrent publishers cannot overwrite an accepted record.

## Exact-candidate promotion

For each trusted App push, `validate-ingest` validates the append-only range. When enabled, the reusable `promote-ingest` workflow then:

1. Fetches the latest staging and main heads and retries when the triggering commit is no longer an ancestor of staging.
2. Reconciles staging with `main` using a regular merge when necessary, validates the merged range, and rebuilds all indexes and human-readable puzzle views deterministically.
3. Publishes only with a lease, then re-fetches and re-validates the exact candidate SHA.
4. Byte-compares all generated files with a clean rebuild and creates the completed Check Run `cayleypy-results/exact-candidate` on that SHA.
5. Creates or updates the same-repository `ingest/staging` to `main` PR, applies `cayleypy-ingest-approved`, and performs a regular merge guarded by `--match-head-commit`.

A concurrent publication changes the head lease or PR head and causes a retry; it cannot merge a stale candidate. After a successful regular merge, staging is fast-forwarded to the published main commit when its lease still matches. Scheduled reconciliation runs every ten minutes, and `workflow_dispatch` is available for manual recovery.

The exact-candidate Check Run is the protection check for the final generated SHA. `validate-ingest / validate` belongs to the incoming App-push SHA and must not be required for `main`.

## Deployment prerequisites

Before enabling promotion:

1. Set repository variables: `RESULTS_INGEST_APP_LOGIN` (App bot login), `RESULTS_INGEST_BOT_ID` (numeric GitHub bot ID), and `ENABLE_CAYLEYPY_AUTO_MERGE=true`.
2. Allow the configured GitHub App to append normal commits to `ingest/staging`.
3. Allow the GitHub Actions repository token to write/reconcile `ingest/staging`, create/update PRs and labels, create Check Runs, and merge the approved PR. Configure only the narrow Actions/bot bypass required if branch protection otherwise blocks these operations.
4. Protect `main` by requiring the exact check name `cayleypy-results/exact-candidate` on the PR head. Do not require `validate-ingest / validate` for `main`.
5. Keep the workflows on the default branch so scheduled and manual reconciliation remain available.

## Local verification

```bash
python -m pip install -r requirements.txt
python tools/validate_result.py --base <trusted-base-sha> --head <candidate-head-sha>
```

Promotion-mode validation permits only the generated global indexes and manifest-owned competition/puzzle views in addition to append-only records:

```bash
python tools/validate_result.py --base <main-sha> --head <candidate-sha> --allow-generated-indexes
python tools/build_indexes.py --results results --out data
```

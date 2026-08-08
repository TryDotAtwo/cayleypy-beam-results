# Native v2 promotion verification - 2026-08-08

## Root cause

The promotion workflow built checked-in indexes with `--out data`, so the
builder discovered native records at `data/v2/slurm`. Its exact verification
rebuilt into a temporary output directory, causing the same output-relative
lookup to omit every native v2 record and fail the first silent byte compare.

## Compatibility contract

- `--native-results` is optional; existing callers retain the prior
  output-relative default.
- GitHub promotion passes `data/v2/slurm` explicitly for both rebuilds.
- Public ingest JSON, schemas, endpoint configuration, and Kaggle notebook
  configuration are unchanged.

## Verification

- Regression test was observed failing before implementation because `build`
  did not accept an independent native input path.
- Focused compatibility and workflow tests: `3 passed`.
- Full repository suite: `38 passed`.
- `git diff --check`: clean.

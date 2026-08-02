# Unified wide TSV verification — 2026-08-02

## Outcome

- All generated TSV views use the same 43-column schema.
- The first nine columns are: `puzzle_id`, `solution_length`, `solution`, `beam_effective`, `final_orientation`, `touch_radius`, `model_class`, `author_name`, `submitted_at`.
- Current canonical store: 645 Kaggle records, 5 competitions, 88 competition/puzzle pairs.
- Builder also accepts and validates native SLURM schema v2 records under `data/v2/slurm/`; the checked-in store currently contains no native v2 records.
- Full nested metadata remains available in per-puzzle `metadata.json` and global `runs.json`.

## Verification

- Focused validation and builder tests: `30 passed`.
- Promotion/workflow contract tests: `7 passed`.
- Full test suite: `37 passed`.
- Generated TSV audit: 184 files, 2,756 rows across views, 43 columns, zero header or row-width mismatches.
- Determinism: two consecutive full rebuilds produced no second-pass changes.
- Public clean scan: no local Windows paths, Cloudflare/GitHub token names, bearer headers, or GitHub token patterns in generated data and README.
- `git diff --check`: clean.

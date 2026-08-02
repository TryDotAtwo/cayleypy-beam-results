# Wide Human-Readable CayleyPy TSV Design

Date: 2026-08-02

## Goal

Make every generated TSV use one deterministic, analysis-friendly wide schema. A reader must be able to compare solutions immediately, while complete immutable JSON records remain the source of truth.

## Files in scope

The same ordered header is used for:

- `data/index.tsv`
- `data/by_author.tsv`
- `data/best_solutions.tsv`
- `data/<competition>/index.tsv`
- `data/<competition>/puzzles/pNNNN/solutions.tsv`
- `data/<competition>/puzzles/pNNNN/best_solution.tsv`

Every file contains the same columns. Files differ only in row selection and deterministic sort order. Existing `metadata.json`, `summary.md`, `runs.json`, and manifest outputs remain separate formats.

## Column order

The first nine columns are a stable public contract:

1. `puzzle_id`
2. `solution_length`
3. `solution`
4. `beam_effective`
5. `final_orientation`
6. `touch_radius`
7. `model_class`
8. `author_name`
9. `submitted_at`

The remaining columns follow in this exact order:

10. `competition`
11. `puzzle_type`
12. `beam_requested`
13. `beam_alignment_delta`
14. `solution_mode`
15. `collection_status`
16. `collection_index`
17. `solved_depth`
18. `touch_depth`
19. `max_depth`
20. `max_collected_solutions`
21. `model_id`
22. `model_filename`
23. `model_sha256`
24. `model_format`
25. `model_dtype`
26. `model_output_dim`
27. `platform`
28. `gpu_names`
29. `gpu_count`
30. `world_size`
31. `native_sm`
32. `vram_mib_per_gpu`
33. `solve_us`
34. `wall_us`
35. `profile_id`
36. `profile_power`
37. `profile_status`
38. `run_id`
39. `submission_id`
40. `idempotency_key`
41. `solver_commit`
42. `producer_url`
43. `record_path`

## Field derivation

- `solution` joins canonical move tokens with `.`.
- `beam_effective`, `beam_requested`, and `beam_alignment_delta` come from the selected profile.
- `touch_radius` is `runtime.touch_bfs_radius`.
- `model_id` is `<model_filename>@<first 12 lowercase hex characters of model_sha256>`.
- `gpu_names` joins the ordered hardware names with `|`.
- `producer_url` is the Kaggle run URL for v1. Native SLURM v2 leaves it empty because private cluster paths and hostnames are forbidden.
- `profile_id` and `profile_status` normalize the differently named v1/v2 profile evidence fields.
- `solver_commit` comes from the v1 envelope or v2 SLURM provenance.
- Optional or schema-inapplicable values are encoded as an empty TSV cell, never as `null`, `None`, or a fabricated value.

The current formula-injection and control-character escaping remains mandatory for every cell.

## Row selection and sorting

- `index.tsv` and puzzle `solutions.tsv` contain every canonical solution record.
- `best_solutions.tsv` and puzzle `best_solution.tsv` use the existing deterministic winner rule: shortest solution first, then the existing stable tie-break.
- `by_author.tsv` retains its author-oriented deterministic ordering but no longer changes the header shape.
- Rebuilding from the same immutable records must remain byte-identical.

## Detailed metadata

`metadata.json` and `runs.json` continue to preserve the complete validated envelope, including all low-level runtime parameters (`b_micro`, shards, ring slots, Stream 4 batch/trigger/slots, capacity scale), full model and notebook/release provenance, hardware details, hashes, and solver commit. The wide TSV intentionally promotes only fields useful for filtering, comparison, and attribution.

Puzzle `summary.md` keeps the concise best-solution presentation and adds a compact facts block containing effective beam, final orientation, touch radius, model ID/class, author, and submission timestamp. It links to the wide TSV and full metadata rather than duplicating all runtime fields.

## Compatibility and failure behavior

- Existing v1 Kaggle records remain valid and receive fully populated v1-relevant columns.
- Valid v2 SLURM records use the same header and populate native hardware/profile/provenance columns.
- Missing optional or version-inapplicable fields yield empty cells.
- Missing required fields, wrong types, malformed SHA values, or inconsistent derived values fail the deterministic build closed.
- Generated-file allowlists and exact-rebuild checks must be updated together; immutable source records are never modified.

## Verification

Tests cover exact header equality and order, all six TSV output families, v1 and v2 mappings, optional blanks, `model_id`, solution and GPU-name joining, deterministic rebuilds, best/tie selection, spreadsheet-injection escaping, summary facts, manifest coverage, and unchanged immutable input hashes.

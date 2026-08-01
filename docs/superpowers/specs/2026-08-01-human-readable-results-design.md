# Human-readable CayleyPy results design

## Goal

Make the public results repository useful to a person who primarily needs to answer two questions: which competition and puzzle is this, and what is the solution? Preserve the canonical append-only records under results/v1 as the verification source.

## Generated layout

For every exact Kaggle competition slug and puzzle ID, promotion generates:

~~~text
data/<competition-slug>/
  index.tsv
  puzzles/
    p<zero-padded-puzzle-id>/
      solutions.tsv
      best_solution.tsv
      metadata.json
      summary.md
~~~

Competition directory names are the exact canonical Kaggle competition slugs from the result envelope. Puzzle directories use p plus at least four decimal digits, for example p0000, p0010, and p10000.

Existing legacy directories are preserved. Generated competition directories are owned by the deterministic index builder only when their names correspond to competitions present under results/v1.

## Human-facing files

### solutions.tsv

One row per canonical result for the puzzle. Human-critical columns come first:

1. solution_path
2. solution_length
3. puzzle_id
4. final_orientation
5. author_name
6. submitted_at
7. submission_id
8. run_id
9. solver_commit
10. record_path

solution_path is the dot-joined move sequence exactly as a person would paste it. Rows are ordered by solution length, solved depth, submission ID, and canonical record path.

### best_solution.tsv

Contains the same header and exactly one data row: the deterministic winner for the puzzle.

Winner ordering is:

1. shortest solution length;
2. lowest solved depth;
3. lexicographically lowest submission ID;
4. lexicographically lowest canonical record path.

### metadata.json

Contains non-primary details grouped by result submission: model, profile, runtime, hardware, timing, Kaggle provenance, hashes, and canonical record path. JSON is canonical, deterministic, and newline-terminated.

### summary.md

A compact GitHub-readable page containing competition slug, puzzle ID, number of solutions, best length, the best solution in a code block, and links to the three detailed files.

## Competition index

data/<competition-slug>/index.tsv contains one row per puzzle:

- puzzle_id
- best_solution
- best_length
- solution_count
- puzzle_directory

Rows are ordered numerically by puzzle ID.

## Global indexes

The existing data/index.tsv and data/best_solutions.tsv gain a solution_path column immediately after solved_depth. Existing provenance columns remain available after the human-critical fields.

data/by_author.tsv and data/runs.json retain their current contracts.

## Determinism and safety

All generated paths use validated competition slugs and integer puzzle IDs. TSV values continue using the existing spreadsheet-injection protection. The builder writes through temporary files and replaces complete outputs. Stale generated puzzle files and directories are removed only inside exact generated competition directories; unrelated legacy directories are never modified.

Promotion validates that only these generated paths, the four existing global indexes, and append-only canonical records change.

## Testing

Tests cover:

- visible solution paths in global indexes;
- exact per-competition and per-puzzle layout;
- all-solutions and best-solution contents;
- deterministic winner selection;
- zero-padding for puzzle IDs;
- canonical metadata JSON;
- spreadsheet-safe TSV encoding;
- deterministic rebuilds;
- stale generated-file removal without touching legacy directories;
- promotion allowlist enforcement.

Implementation follows red-green-refactor: each behavior receives a failing test before production code changes.

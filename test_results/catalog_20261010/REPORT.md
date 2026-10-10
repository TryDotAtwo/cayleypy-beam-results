# Results repository cleanup — 2026-10-10

## Browsing

The root README now links directly to Cube 4×4×4, Cube 5×5×5, Megaminx, Professor Tetraminx and IHES Cube. Generated family pages list instance IDs, shortest recorded lengths and counts, with links to the existing per-instance summary and all-solutions TSV. Existing TSV/JSON paths and legacy folders are preserved. The complete catalog also identifies toy examples separately.

The publisher CLI, templates and Codex plugin previously kept on a separate branch are now available on main. Clone instructions no longer require selecting that branch.

## Preservation and repaired publication

The old staging branch contained 46 unpublished records. Forty-two valid Cube 5×5×5 records are included in the regenerated tables. Four MoLab records declared v1 while using MoLab provenance and one GPU; the v1 schema requires Kaggle provenance and two GPUs. They blocked a full index rebuild. Those four originals are preserved byte-for-byte in `archive/unvalidated/`, with original paths and SHA-256 hashes. They are not presented as validated solutions. Original commits remain in history.

The resulting validated index has 3,914 solution records. See `verification.json` for preservation and link checks. All 60 CPU tests pass, covering schemas/replay, generated tables, publisher behavior, catalogs and the fail-closed Worker route patch.

## One branch and protected publication

Main is the sole branch after consolidation. Old branch heads are recorded in `branches-before.json` and retained as ancestors of the published main history. `ingest/staging` becomes a mutable **service tag**, not a release version or a user-facing branch. It preserves the existing queue and exact-candidate promotion model.

The existing live Worker bundle was changed in exactly two places: `/git/ref/heads/` → `/git/ref/tags/` and `/git/refs/heads/` → `/git/refs/tags/`. The patch helper is `tools/worker_tag_patch.py`. The before/after SHA-256 values are `648495338997d858289b3db847616c23b3d2509e658e7c19c83f7339065ce5b4` and `7b0972a378ce59595f883160427d0e1ad4e70fb7bcc1fb79b3232ead81a4315f`. No older source checkout was rebuilt or deployed; resource bindings and secrets were retained.

App tag pushes are still gated by exact App login, numeric Bot sender ID and sender type. Promotion validates immutable additions, rebuilds indexes, compares a clean rebuild, creates the existing exact-candidate check, then advances main with a fast-forward ancestry guard and compare-and-swap lease. Scheduled recovery remains enabled. It does not create temporary branches or PRs.

The required `cayleypy-results/exact-candidate` GitHub Actions check and strict up-to-date setting remain on main. Only the former zero-approval PR-only requirement is removed to permit checked single-branch promotion. No human review requirement was removed.

This cleanup does not rerun puzzle solving or establish solution optimality. Numeric best lengths remain shortest submitted records under each competition's conventions.

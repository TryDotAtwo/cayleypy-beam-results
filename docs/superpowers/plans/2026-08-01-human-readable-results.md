# Human-readable Results Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Generate complete, human-readable competition and puzzle result views with visible solution paths while retaining canonical results/v1 records.

**Architecture:** Extend the deterministic index builder with human-first row projections and dynamic per-competition payloads. Keep canonical records immutable, make generated directory ownership explicit, and extend promotion validation and byte-comparison to cover the new tree.

**Tech Stack:** Python 3.12, pytest, JSON Schema, TSV, GitHub Actions.

## Global Constraints

- Directory names use exact validated Kaggle competition slugs.
- Puzzle directories use p plus at least four decimal digits.
- Competition index.tsv contains every solution for every puzzle.
- Canonical results/v1 records remain append-only and unchanged.
- Existing unrelated legacy data directories are preserved.
- Every behavior follows red-green-refactor.

---

### Task 1: Visible solution paths in existing global indexes

**Files:**
- Modify: tools/build_indexes.py
- Modify: tests/test_build_indexes.py

**Interfaces:**
- Produces: ResultRow.solution_path -> str, derived by dot-joining solution.path.
- Changes: INDEX_HEADER adds solution_path immediately after solved_depth.

- [ ] **Step 1: Write failing tests**

Add assertions that data/index.tsv and data/best_solutions.tsv contain a solution_path header and the expected dot-joined path.

- [ ] **Step 2: Verify RED**

Run: python -m pytest -q tests/test_build_indexes.py
Expected: FAIL because solution_path is absent.

- [ ] **Step 3: Implement minimal projection**

Add:

~~~python
@property
def solution_path(self) -> str:
    path = self.solution.get("path")
    if not isinstance(path, list) or not all(isinstance(move, str) for move in path):
        raise IndexBuildError("PROVENANCE")
    return ".".join(path)
~~~

Insert it into index_tuple immediately after solved_depth.

- [ ] **Step 4: Verify GREEN**

Run: python -m pytest -q tests/test_build_indexes.py
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: feat: expose solution paths in global indexes

### Task 2: Per-competition and per-puzzle payload generation

**Files:**
- Modify: tools/build_indexes.py
- Modify: tests/test_build_indexes.py

**Interfaces:**
- Produces: build_human_payloads(rows: list[ResultRow]) -> dict[str, bytes].
- Output paths: <competition>/index.tsv and <competition>/puzzles/pNNNN/{solutions.tsv,best_solution.tsv,metadata.json,summary.md} relative to data/.

- [ ] **Step 1: Write failing layout and content tests**

Construct multiple rows spanning two puzzles and assert:
- exact Kaggle slug directories;
- competition index contains every row;
- puzzle solutions contains every candidate;
- best_solution contains one deterministic winner;
- solution_path is the first column;
- p0000, p0010, and p10000 formatting;
- metadata is canonical JSON;
- summary includes the best path.

- [ ] **Step 2: Verify RED**

Run: python -m pytest -q tests/test_build_indexes.py
Expected: FAIL because build_human_payloads and paths do not exist.

- [ ] **Step 3: Implement grouping and human rows**

Add HUMAN_HEADER, ResultRow.human_tuple(), puzzle_directory(), metadata projection, summary renderer, and build_human_payloads(). Reuse the existing winner ordering and tsv_payload protection.

- [ ] **Step 4: Verify GREEN**

Run: python -m pytest -q tests/test_build_indexes.py
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: feat: generate human-readable puzzle views

### Task 3: Deterministic filesystem synchronization

**Files:**
- Modify: tools/build_indexes.py
- Modify: tests/test_build_indexes.py

**Interfaces:**
- Changes: build(results: Path, out: Path) writes both fixed global payloads and dynamic human payloads.
- Owns only exact competition directories returned by build_human_payloads.

- [ ] **Step 1: Write failing rebuild tests**

Generate data twice and assert byte equality. Remove a canonical row, rebuild, and assert its stale generated puzzle files disappear while a legacy sentinel directory remains untouched.

- [ ] **Step 2: Verify RED**

Run: python -m pytest -q tests/test_build_indexes.py
Expected: FAIL because dynamic files are not synchronized or cleaned.

- [ ] **Step 3: Implement staged directory replacement**

Write dynamic output under temporary sibling directories, then replace only generated competition directories. Preserve directories not represented by current canonical competitions.

- [ ] **Step 4: Verify GREEN**

Run: python -m pytest -q tests/test_build_indexes.py
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: fix: synchronize generated competition views

### Task 4: Promotion contract and workflow

**Files:**
- Modify: tools/validate_result.py
- Modify: .github/workflows/merge-ingest.yml
- Modify: tests/test_promotion_contract.py
- Modify: tests/test_workflow_static.py

**Interfaces:**
- Changes: promotion mode permits validated generated paths under data/<competition>/index.tsv and data/<competition>/puzzles/pNNNN/{solutions.tsv,best_solution.tsv,metadata.json,summary.md}.
- Workflow stages and byte-compares the complete generated data tree.

- [ ] **Step 1: Write failing allowlist and workflow tests**

Assert valid generated paths pass promotion mode, unexpected files fail, and workflow compares a clean generated tree rather than four hard-coded files.

- [ ] **Step 2: Verify RED**

Run: python -m pytest -q tests/test_promotion_contract.py tests/test_workflow_static.py
Expected: FAIL on dynamic generated paths and old workflow checks.

- [ ] **Step 3: Implement fail-closed generated-path matcher and workflow comparison**

Add a strict generated path regular expression bound to safe competition slugs and pNNNN directories. Update workflow to stage permitted generated files and recursively byte-compare clean output while rejecting unrelated changes.

- [ ] **Step 4: Verify GREEN**

Run: python -m pytest -q tests/test_promotion_contract.py tests/test_workflow_static.py
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: fix: validate generated human result views

### Task 5: Full regeneration and publication

**Files:**
- Regenerate: data/index.tsv
- Regenerate: data/best_solutions.tsv
- Regenerate: data/by_author.tsv
- Regenerate: data/runs.json
- Generate: data/<competition-slug>/...

**Interfaces:**
- Consumes all prior tasks.
- Produces the final public data tree.

- [ ] **Step 1: Run the builder**

Run: python tools/build_indexes.py --results results --out data

- [ ] **Step 2: Run complete verification**

Run: python -m pytest -q
Run: python tools/validate_result.py --base origin/main --head HEAD --allow-generated-indexes
Run: git diff --check
Expected: all pass.

- [ ] **Step 3: Inspect human outputs**

Confirm the latest 444, Megaminx, IHES, and Tetraminx solution paths appear in competition indexes and puzzle best_solution.tsv files.

- [ ] **Step 4: Commit generated outputs**

Commit message: chore: publish human-readable result indexes

- [ ] **Step 5: Push, merge, and verify promotion**

Push the feature branch, create a PR, merge after checks, run promote-ingest, and require main and ingest/staging to converge on one SHA with the generated files visible.

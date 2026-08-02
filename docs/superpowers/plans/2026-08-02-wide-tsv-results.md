# Wide Human-Readable CayleyPy TSV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate every public TSV with one deterministic 43-column schema whose first nine columns are the approved solution comparison fields.

**Architecture:** Extend the existing `ResultRow` adapter so all TSVs consume one `wide_tuple()` and one `WIDE_HEADER`; row selection and sorting remain separate from row serialization. Preserve full records in JSON metadata/runs, enrich summaries with a compact facts block, and make the builder discover both immutable v1 Kaggle records and validated v2 SLURM records without treating generated files as input.

**Tech Stack:** Python 3.12, standard library `csv/json/pathlib`, `jsonschema`, pytest, GitHub Actions deterministic promotion.

## Global Constraints

- All TSV outputs use exactly the same ordered 43-column header.
- The first nine columns are `puzzle_id`, `solution_length`, `solution`, `beam_effective`, `final_orientation`, `touch_radius`, `model_class`, `author_name`, `submitted_at`.
- Missing optional or schema-inapplicable values are empty cells; required malformed data fails closed.
- Existing canonical JSON records are immutable and generated outputs are byte-deterministic.
- Preserve formula-injection and control-character escaping.
- Do not change solver, CUDA, model inference, or beam-search architecture.

---

### Task 1: One wide v1 row contract

**Files:**
- Modify: `tools/build_indexes.py`
- Modify: `tests/test_build_indexes.py`

**Interfaces:**
- Produces: `WIDE_HEADER: tuple[str, ...]`
- Produces: `ResultRow.wide_tuple() -> tuple[Any, ...]`
- Consumes: canonical v1 envelope fields already exposed by `ResultRow`

- [ ] **Step 1: Write failing exact-header and mapping tests**

Add a test asserting `builder.WIDE_HEADER` equals the 43-column sequence in the approved design, every global TSV uses it, and a v1 golden maps beam, touch, model, hardware, timing, producer URL, and model ID exactly. Assert inapplicable `native_sm` and `vram_mib_per_gpu` are empty.

- [ ] **Step 2: Run the focused test and preserve RED**

Run: `python -m pytest tests/test_build_indexes.py -k wide -q`

Expected: FAIL because `WIDE_HEADER` and `wide_tuple()` do not exist and existing global headers differ.

- [ ] **Step 3: Implement typed field adapters and the shared tuple**

Add strict helpers for optional integers/strings, properties for runtime, hardware, timings, model manifest, profile, model ID, platform, joined GPU names, normalized profile ID/status, solver commit, and producer URL. Define `WIDE_HEADER` once and make `wide_tuple()` return fields in exactly that order.

- [ ] **Step 4: Route all global TSVs through the shared contract**

Use `tsv_payload(WIDE_HEADER, ...)` for `index.tsv`, `by_author.tsv`, and `best_solutions.tsv`. Preserve author-oriented and winner sort/selection logic without adding columns such as `candidate_count` that would violate header equality.

- [ ] **Step 5: Run focused and complete builder tests**

Run: `python -m pytest tests/test_build_indexes.py -q`

Expected: PASS with exact headers and unchanged deterministic winner behavior.

- [ ] **Step 6: Commit the v1 wide contract**

```bash
git add tools/build_indexes.py tests/test_build_indexes.py
git commit -m "Unify global CayleyPy TSV columns"
```

### Task 2: Competition and puzzle views plus summaries

**Files:**
- Modify: `tools/build_indexes.py`
- Modify: `tests/test_build_indexes.py`

**Interfaces:**
- Consumes: `WIDE_HEADER`, `ResultRow.wide_tuple()`
- Produces: identical headers for competition index, puzzle solutions, and puzzle best solution
- Produces: `summary.md` compact facts block

- [ ] **Step 1: Write failing all-family header test**

Build two puzzles with multiple solutions and assert all six TSV families have `WIDE_HEADER`, the first nine fields are stable, and row counts/selection remain correct.

- [ ] **Step 2: Write failing summary facts test**

Assert the winner summary contains effective beam, final orientation, touch radius, model ID/class, author, and UTC submitted timestamp, plus existing links.

- [ ] **Step 3: Run focused tests and preserve RED**

Run: `python -m pytest tests/test_build_indexes.py -k "human_views or summary" -q`

Expected: FAIL on the old short human header and missing facts block.

- [ ] **Step 4: Replace human tuples with the wide row**

Remove `HUMAN_HEADER` and `_human_tuple`; serialize competition/puzzle rows with `WIDE_HEADER` and `wide_tuple()`. Keep `_human_sort_key`, deterministic winner selection, manifest cleanup, and metadata JSON.

- [ ] **Step 5: Add the concise summary facts block**

Render stable lines for `Effective beam`, `Orientation`, `Touch radius`, `Model`, `Model class`, `Author`, and `Submitted at`, escaping Markdown-sensitive presentation by placing values in inline code where appropriate.

- [ ] **Step 6: Run complete tests and commit**

Run: `python -m pytest tests/test_build_indexes.py -q`

```bash
git add tools/build_indexes.py tests/test_build_indexes.py
git commit -m "Use wide columns in puzzle result views"
```

### Task 3: Native SLURM v2 records in the same indexes

**Files:**
- Create: `schemas/result-v2.schema.json`
- Modify: `tools/validate_result.py`
- Modify: `tools/build_indexes.py`
- Modify: `tests/test_validate_result.py`
- Modify: `tests/test_build_indexes.py`
- Modify: `.github/workflows/validate-ingest.yml`
- Modify: `.github/workflows/merge-ingest.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: immutable v2 path `data/v2/slurm/<competition>/<puzzle_type>/<yyyy-mm-dd>/<submission_id>.json`
- Produces: validated `ResultRow` values normalized into `WIDE_HEADER`
- Preserves: v1 `results/v1/...` validation and generated-data allowlist

- [ ] **Step 1: Add v2 fixture and failing validator/index tests**

Copy the canonical original/reflected v2 goldens from the ingest service into test fixtures. Assert valid v2 acceptance, invalid hardware/replay/idempotency rejection, exact path derivation, duplicate detection across v1/v2, and normalized wide columns including native SM, VRAM, profile evidence, SLURM solver commit, and empty producer URL.

- [ ] **Step 2: Run v2 tests and preserve RED**

Run: `python -m pytest tests/test_validate_result.py tests/test_build_indexes.py -k v2 -q`

Expected: FAIL because the repository currently validates and scans only v1.

- [ ] **Step 3: Add strict v2 schema and version dispatch**

Add the checked-in schema v2 and dispatch schema/integrity/path validation by `schema_version`. Keep v1 functions callable for compatibility and reject unknown versions.

- [ ] **Step 4: Scan immutable v2 sources separately from generated views**

Extend `build()` with an optional native source rooted at `<out>/v2/slurm`; scan only exact v2 record paths, never generated competition directories. Normalize v2 author, provenance, hardware, profile, model, runtime, solution, and timings into the same `ResultRow` properties.

- [ ] **Step 5: Update promotion validation and allowlists**

Allow append-only v2 source records at the exact namespace while keeping generated paths promotion-only. Ensure exact rebuild includes v2 rows and never deletes or overwrites v2 source files.

- [ ] **Step 6: Run validator, workflow, and builder suites**

Run: `python -m pytest tests/test_validate_result.py tests/test_build_indexes.py tests/test_workflow_static.py tests/test_promotion_contract.py tests/test_protected_promotion.py -q`

Expected: PASS for mixed v1/v2 inputs and unchanged v1 regression fixtures.

- [ ] **Step 7: Commit v2 indexing support**

```bash
git add schemas/result-v2.schema.json tools/validate_result.py tools/build_indexes.py tests .github/workflows README.md
git commit -m "Index native SLURM results with Kaggle records"
```

### Task 4: Rebuild, documentation, and exact verification

**Files:**
- Modify: `README.md`
- Modify: generated `data/**` files covered by `.human-results-manifest.json`
- Create: `test_results/wide_tsv_results_2026-08-02.md`

**Interfaces:**
- Consumes: complete immutable v1/v2 record tree
- Produces: deterministic checked-in wide TSV and summary artifacts

- [ ] **Step 1: Rebuild all generated outputs**

Run: `python tools/build_indexes.py --results results --out data`

Run it twice and byte-compare the complete manifest and all generated paths; the second run must produce no diff.

- [ ] **Step 2: Verify public shape and forbidden content**

Assert every TSV header equals `WIDE_HEADER`, all first nine columns match the contract, no row width differs, no CR bytes exist, and no private paths, tokens, logs, weights, or secret field names appear in generated public artifacts.

- [ ] **Step 3: Run the full repository gate**

Run: `python -m pytest -q`

Run: `git diff --check`

Expected: all tests pass and no whitespace errors.

- [ ] **Step 4: Record evidence and commit**

Write exact test counts, representative v1/v2 rows, generated file counts, deterministic rebuild evidence, and secret-scan outcome to the test report.

```bash
git add README.md data test_results/wide_tsv_results_2026-08-02.md
git commit -m "Rebuild public wide result tables"
```

- [ ] **Step 5: Push and verify GitHub checks**

Push `codex/human-readable-results`, verify validation and exact-candidate workflows, inspect rendered TSV/summary files on GitHub, and report exact commit/check status. Do not merge to `main` unless the existing trusted promotion workflow performs its normal validated merge.

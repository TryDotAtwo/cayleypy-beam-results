from __future__ import annotations

import copy
from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import sys

import pytest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "build_indexes", ROOT / "tools" / "build_indexes.py"
)
assert SPEC and SPEC.loader
builder = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = builder
SPEC.loader.exec_module(builder)
GOLDENS = json.loads(
    (ROOT / "tests" / "fixtures" / "golden.json").read_text(encoding="utf-8")
)["cases"]
V2_GOLDENS = json.loads(
    (ROOT / "tests" / "fixtures" / "v2-golden.json").read_text(encoding="utf-8")
)["cases"]
EXPECTED_WIDE_HEADER = (
    "puzzle_id", "solution_length", "solution", "beam_effective",
    "final_orientation", "touch_radius", "model_class", "author_name",
    "submitted_at", "competition", "puzzle_type", "beam_requested",
    "beam_alignment_delta", "solution_mode", "collection_status",
    "collection_index", "solved_depth", "touch_depth", "max_depth",
    "max_collected_solutions", "model_id", "model_filename",
    "model_sha256", "model_format", "model_dtype", "model_output_dim",
    "platform", "gpu_names", "gpu_count", "world_size", "native_sm",
    "vram_mib_per_gpu", "solve_us", "wall_us", "profile_id",
    "profile_power", "profile_status", "run_id", "submission_id",
    "idempotency_key", "solver_commit", "producer_url", "record_path",
)

def envelope(name: str = "original_unicode_author") -> dict:
    return copy.deepcopy(
        next(case["envelope"] for case in GOLDENS if case["name"] == name)
    )


def record(name: str = "original_unicode_author") -> dict:
    item = envelope(name)
    return {"submission_id": item["client_submission_id"], "envelope": item}


def rehash(item: dict) -> None:
    value = item["envelope"]
    semantic = {
        key: part
        for key, part in value.items()
        if key
        not in {
            "client_submission_id",
            "run_id",
            "idempotency_key",
            "submitted_at",
        }
    }
    value["idempotency_key"] = sha256(
        builder.canonical(semantic).encode("utf-8")
    ).hexdigest()


def reidentify(
    item: dict,
    submission_id: str,
    run_id: str,
    submitted_at: str,
) -> None:
    item["submission_id"] = submission_id
    item["envelope"].update(
        client_submission_id=submission_id,
        run_id=run_id,
        submitted_at=submitted_at,
    )


def relative(item: dict) -> str:
    value = item["envelope"]
    return (
        f"results/v1/{builder.safe_segment(value['competition'])}/"
        f"{builder.safe_segment(value['puzzle_type'])}/{value['puzzle_id']}/"
        f"{value['submitted_at'][:10]}/{item['submission_id']}.json"
    )


def put(root: Path, item: dict) -> Path:
    path = root / relative(item)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(builder.canonical(item), encoding="utf-8")
    return path


def output_bytes(root: Path) -> dict[str, bytes]:
    return {name: (root / name).read_bytes() for name in builder.OUTPUT_NAMES}


def fingerprint(paths: list[Path]) -> list[str]:
    return [sha256(path.read_bytes()).hexdigest() for path in paths]


def test_wide_header_and_v1_mapping_for_all_global_tsvs(tmp_path: Path) -> None:
    item = record()
    put(tmp_path, item)
    builder.build(tmp_path / "results", tmp_path / "data")

    assert builder.WIDE_HEADER == EXPECTED_WIDE_HEADER
    for name in ("index.tsv", "by_author.tsv", "best_solutions.tsv"):
        lines = (tmp_path / "data" / name).read_text(encoding="utf-8").splitlines()
        assert tuple(lines[0].split("\t")) == EXPECTED_WIDE_HEADER
        assert len(lines[1].split("\t")) == len(EXPECTED_WIDE_HEADER)

    fields = (tmp_path / "data" / "index.tsv").read_text(encoding="utf-8").splitlines()[1].split("\t")
    values = dict(zip(EXPECTED_WIDE_HEADER, fields, strict=True))
    envelope = item["envelope"]
    assert values["beam_effective"] == str(envelope["profile"]["effective_beam"])
    assert values["beam_requested"] == str(envelope["profile"]["requested_beam"])
    assert values["touch_radius"] == str(envelope["runtime"]["touch_bfs_radius"])
    assert values["model_class"] == envelope["profile"]["model_class"]
    assert values["model_id"] == f"{envelope['model']['filename']}@{envelope['model']['sha256'][:12]}"
    assert values["gpu_names"] == "|".join(envelope["hardware"]["gpu_names"])
    assert values["producer_url"] == envelope["kaggle"]["run_url"]
    assert values["native_sm"] == ""
    assert values["vram_mib_per_gpu"] == ""

def test_v2_slurm_record_uses_the_same_wide_header(tmp_path: Path) -> None:
    envelope = copy.deepcopy(V2_GOLDENS[0]["envelope"])
    submission_id = envelope["client_submission_id"]
    relative_path = (
        Path("data/v2/slurm")
        / builder.safe_segment(envelope["competition"])
        / builder.safe_segment(envelope["puzzle_type"])
        / envelope["submitted_at"][:10]
        / f"{submission_id}.json"
    )
    path = tmp_path / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        builder.canonical({"submission_id": submission_id, "envelope": envelope}),
        encoding="utf-8",
    )

    builder.build(tmp_path / "results", tmp_path / "data")
    lines = (tmp_path / "data/index.tsv").read_text(encoding="utf-8").splitlines()
    assert tuple(lines[0].split("\t")) == EXPECTED_WIDE_HEADER
    values = dict(zip(EXPECTED_WIDE_HEADER, lines[1].split("\t"), strict=True))
    assert values["platform"] == "slurm"
    assert values["native_sm"] == "90"
    assert values["vram_mib_per_gpu"] == "81559"
    assert values["world_size"] == "4"
    assert values["profile_id"] == "h100x4-megaminx-p30-v1"
    assert values["profile_status"] == "measured"
    assert values["producer_url"] == ""
    assert values["solver_commit"] == envelope["provenance"]["solver_commit"]


def test_v2_input_is_independent_from_output_directory(tmp_path: Path) -> None:
    envelope = copy.deepcopy(V2_GOLDENS[0]["envelope"])
    submission_id = envelope["client_submission_id"]
    native_results = tmp_path / "repository" / "data" / "v2" / "slurm"
    relative_path = (
        Path(builder.safe_segment(envelope["competition"]))
        / builder.safe_segment(envelope["puzzle_type"])
        / envelope["submitted_at"][:10]
        / f"{submission_id}.json"
    )
    path = native_results / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        builder.canonical({"submission_id": submission_id, "envelope": envelope}),
        encoding="utf-8",
    )

    generated = tmp_path / "generated"
    builder.build(
        tmp_path / "repository" / "results",
        generated,
        native_results=native_results,
    )

    index = (generated / "index.tsv").read_text(encoding="utf-8")
    assert submission_id in index

def test_deterministic_rebuild_best_tie_and_raw_immutability(
    tmp_path: Path,
) -> None:
    first = record()
    second = copy.deepcopy(first)
    reidentify(
        second,
        "018f7a24-8f6b-7c8e-9d1b-2a3b4c5d6e80",
        "run-tie",
        "2026-07-29T10:31:00.000Z",
    )
    second["envelope"]["author"]["name"] = "tie-author"
    rehash(second)

    roots = [tmp_path / "forward", tmp_path / "reverse"]
    paths_forward = [put(roots[0], item) for item in (first, second)]
    paths_reverse = [put(roots[1], item) for item in (second, first)]
    before = fingerprint(paths_forward + paths_reverse)

    for root in roots:
        legacy = root / "data" / "legacy" / "keep.txt"
        legacy.parent.mkdir(parents=True, exist_ok=True)
        legacy.write_text("keep\n", encoding="utf-8")
        builder.build(root / "results", root / "data")
        initial = output_bytes(root / "data")
        builder.build(root / "results", root / "data")
        assert output_bytes(root / "data") == initial
        assert legacy.read_text(encoding="utf-8") == "keep\n"

    assert output_bytes(roots[0] / "data") == output_bytes(roots[1] / "data")
    assert fingerprint(paths_forward + paths_reverse) == before
    winner = min(first["submission_id"], second["submission_id"])
    best = (roots[0] / "data" / "best_solutions.tsv").read_text(
        encoding="utf-8"
    )
    assert winner in best
    assert len(best.splitlines()) == 2
    index_lines = (roots[0] / "data" / "index.tsv").read_text(
        encoding="utf-8"
    ).splitlines()
    header = index_lines[0].split("\t")
    assert tuple(header) == EXPECTED_WIDE_HEADER
    assert ".".join(first["envelope"]["solution"]["path"]) in index_lines[1]
    best_header = best.splitlines()[0].split("\t")
    assert tuple(best_header) == EXPECTED_WIDE_HEADER
    for payload in output_bytes(roots[0] / "data").values():
        assert b"\r" not in payload


def test_duplicate_submission_and_idempotency_fail_closed(
    tmp_path: Path,
) -> None:
    first = record()
    duplicate_id = copy.deepcopy(first)
    duplicate_id["envelope"]["competition"] = "other-competition"
    duplicate_id["envelope"]["submitted_at"] = "2026-07-30T00:00:00.000Z"
    rehash(duplicate_id)
    put(tmp_path / "submission", first)
    put(tmp_path / "submission", duplicate_id)
    with pytest.raises(builder.IndexBuildError, match="DUPLICATE_SUBMISSION"):
        builder.build(
            tmp_path / "submission" / "results",
            tmp_path / "submission" / "data",
        )

    second = copy.deepcopy(first)
    reidentify(
        second,
        "018f7a24-8f6b-7c8e-9d1b-2a3b4c5d6e80",
        "duplicate-transport",
        "2026-07-29T10:32:00.000Z",
    )
    put(tmp_path / "idempotency", first)
    put(tmp_path / "idempotency", second)
    with pytest.raises(builder.IndexBuildError, match="DUPLICATE_IDEMPOTENCY"):
        builder.build(
            tmp_path / "idempotency" / "results",
            tmp_path / "idempotency" / "data",
        )


def test_run_conflict_and_maximal_run_provenance(tmp_path: Path) -> None:
    first = record()
    second = copy.deepcopy(first)
    reidentify(
        second,
        "018f7a24-8f6b-7c8e-9d1b-2a3b4c5d6e80",
        first["envelope"]["run_id"],
        "2026-07-29T10:33:00.000Z",
    )
    second["envelope"]["puzzle_id"] = 2
    rehash(second)
    put(tmp_path / "valid", first)
    put(tmp_path / "valid", second)
    builder.build(tmp_path / "valid" / "results", tmp_path / "valid" / "data")
    runs = json.loads(
        (tmp_path / "valid" / "data" / "runs.json").read_text(encoding="utf-8")
    )
    run = runs["runs"][first["envelope"]["run_id"]]
    assert set(run["provenance"]) == {
        "author",
        "hardware",
        "kaggle",
        "model",
        "profile",
        "solver_commit",
    }
    assert len(run["records"]) == 2
    assert {
        "orientation",
        "profile",
        "proof_hashes",
        "runtime",
        "solution",
        "timings",
    } <= set(run["records"][0])

    conflicting = copy.deepcopy(second)
    conflicting["envelope"]["profile"][
        "selected_profile"
    ] = "conflicting-profile"
    rehash(conflicting)
    conflict_root = tmp_path / "conflict"
    put(conflict_root, first)
    put(conflict_root, conflicting)
    with pytest.raises(builder.IndexBuildError, match="RUN_CONFLICT"):
        builder.build(conflict_root / "results", conflict_root / "data")


def test_tsv_escaping_and_by_author_shape(tmp_path: Path) -> None:
    item = record()
    item["envelope"]["author"]["name"] = "\u2003=SUM(1,1)\tline\nnext"
    rehash(item)
    put(tmp_path, item)
    builder.build(tmp_path / "results", tmp_path / "data")
    lines = (tmp_path / "data" / "by_author.tsv").read_text(
        encoding="utf-8"
    ).splitlines()
    assert len(lines) == 2
    assert tuple(lines[0].split("\t")) == EXPECTED_WIDE_HEADER
    fields = lines[1].split("\t")
    assert fields[EXPECTED_WIDE_HEADER.index("author_name")] == (
        "'\u2003=SUM(1,1)\\u0009line\\u000anext"
    )


def test_standalone_builder_rejects_invalid_proof_and_noncanonical_wrapper(
    tmp_path: Path,
) -> None:
    invalid = record()
    invalid["envelope"]["solution"]["length"] = 99
    rehash(invalid)
    put(tmp_path / "invalid", invalid)
    with pytest.raises(builder.IndexBuildError, match="RECORD_SOLUTION_LENGTH"):
        builder.build(
            tmp_path / "invalid" / "results",
            tmp_path / "invalid" / "data",
        )

    noncanonical = record()
    path = put(tmp_path / "noncanonical", noncanonical)
    path.write_text(json.dumps(noncanonical, indent=2), encoding="utf-8")
    with pytest.raises(builder.IndexBuildError, match="RECORD_CANONICAL"):
        builder.build(
            tmp_path / "noncanonical" / "results",
            tmp_path / "noncanonical" / "data",
        )


@pytest.mark.parametrize("relative_name", ("unexpected.txt", "wrong.json"))
def test_unexpected_or_malformed_result_file_fails_closed(
    tmp_path: Path,
    relative_name: str,
) -> None:
    path = tmp_path / "results" / relative_name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("{}", encoding="utf-8")
    with pytest.raises(builder.IndexBuildError, match="RESULT_PATH"):
        builder.build(tmp_path / "results", tmp_path / "data")


def test_human_views_include_every_solution_and_best_per_puzzle(tmp_path: Path) -> None:
    first = record()
    second = copy.deepcopy(first)
    reidentify(
        second,
        "018f7a24-8f6b-7c8e-9d1b-2a3b4c5d6e80",
        "run-second",
        "2026-07-29T10:31:00.000Z",
    )
    second["envelope"]["author"]["name"] = "second-author"
    rehash(second)
    third = copy.deepcopy(first)
    reidentify(
        third,
        "018f7a24-8f6b-7c8e-9d1b-2a3b4c5d6e81",
        "run-third",
        "2026-07-29T10:32:00.000Z",
    )
    third["envelope"]["puzzle_id"] = 10
    rehash(third)
    for item in (first, second, third):
        put(tmp_path, item)

    builder.build(tmp_path / "results", tmp_path / "data")
    competition = first["envelope"]["competition"]
    competition_root = tmp_path / "data" / competition
    competition_lines = (competition_root / "index.tsv").read_text(
        encoding="utf-8"
    ).splitlines()
    assert len(competition_lines) == 4
    assert tuple(competition_lines[0].split("\t")) == EXPECTED_WIDE_HEADER
    assert [line.split("\t")[0] for line in competition_lines[1:]] == [
        "1",
        "1",
        "10",
    ]

    puzzle_root = competition_root / "puzzles" / "p0001"
    solutions = (puzzle_root / "solutions.tsv").read_text(
        encoding="utf-8"
    ).splitlines()
    best = (puzzle_root / "best_solution.tsv").read_text(
        encoding="utf-8"
    ).splitlines()
    assert len(solutions) == 3
    assert len(best) == 2
    assert tuple(solutions[0].split("\t")) == EXPECTED_WIDE_HEADER
    assert tuple(best[0].split("\t")) == EXPECTED_WIDE_HEADER
    assert best[1].split("\t")[2] == "clockwise"
    metadata = json.loads(
        (puzzle_root / "metadata.json").read_text(encoding="utf-8")
    )
    assert len(metadata["solutions"]) == 2
    assert metadata["solutions"][0]["record_path"].startswith("results/v1/")
    summary = (puzzle_root / "summary.md").read_text(encoding="utf-8")
    assert competition in summary
    assert "Puzzle 1" in summary
    assert "clockwise" in summary
    assert "Effective beam: `65536`" in summary
    assert "Orientation: `original`" in summary
    assert "Touch radius: `0`" in summary
    assert "Model: `toy-model.pt@dddddddddddd`" in summary
    assert "Model class: `output_move_count`" in summary
    assert "Author: `Алиса Δ`" in summary
    assert "Submitted at: `2026-07-29T09:30:00.000Z`" in summary
    assert all(line == line.rstrip() for line in summary.splitlines())
    assert (competition_root / "puzzles" / "p0010" / "solutions.tsv").is_file()


def test_human_view_manifest_removes_stale_generated_files(tmp_path: Path) -> None:
    item = record()
    put(tmp_path, item)
    builder.build(tmp_path / "results", tmp_path / "data")
    competition = item["envelope"]["competition"]
    stale = tmp_path / "data" / competition / "puzzles" / "p9999" / "summary.md"
    stale.parent.mkdir(parents=True)
    stale.write_text("stale\n", encoding="utf-8")
    manifest_path = tmp_path / "data" / builder.HUMAN_MANIFEST
    builder.build(tmp_path / "results", tmp_path / "data")

    assert not stale.exists()
    rebuilt = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert rebuilt["paths"] == sorted(rebuilt["paths"])
    assert all((tmp_path / "data" / path).is_file() for path in rebuilt["paths"])

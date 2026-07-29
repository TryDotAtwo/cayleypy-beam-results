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
    assert best.endswith("\t2\n")
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
    assert lines[0].split("\t") == [
        "author_name",
        "kaggle_username",
        "run_id",
        "competition",
        "puzzle_type",
        "puzzle_id",
        "solution_length",
        "submission_id",
        "idempotency_key",
        "submitted_at",
        "record_path",
    ]
    assert lines[1].startswith(
        "'\u2003=SUM(1,1)\\u0009line\\u000anext\t"
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

from __future__ import annotations

import copy
import importlib.util
import json
import shutil
import subprocess
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "validator", ROOT / "tools/validate_result.py"
)
assert SPEC and SPEC.loader
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)
CASES = json.loads(
    (ROOT / "tests/fixtures/golden.json").read_text(encoding="utf-8")
)["cases"]


def record() -> dict:
    envelope = copy.deepcopy(CASES[0]["envelope"])
    return {
        "submission_id": envelope["client_submission_id"],
        "envelope": envelope,
    }


def relative(item: dict) -> str:
    envelope = item["envelope"]
    return (
        "results/v1/"
        f"{validator.safe_segment(envelope['competition'])}/"
        f"{validator.safe_segment(envelope['puzzle_type'])}/"
        f"{envelope['puzzle_id']}/{envelope['submitted_at'][:10]}/"
        f"{item['submission_id']}.json"
    )


def commit(repo: Path, message: str) -> str:
    subprocess.run(["git", "-C", repo, "add", "."], check=True)
    subprocess.run(
        ["git", "-C", repo, "commit", "-qm", message], check=True
    )
    return subprocess.check_output(
        ["git", "-C", repo, "rev-parse", "HEAD"], text=True
    ).strip()


def repository(tmp_path: Path) -> tuple[Path, str]:
    repo = tmp_path / "repo"
    repo.mkdir()
    (repo / "schemas").mkdir()
    shutil.copy(
        ROOT / "schemas/result-v1.schema.json",
        repo / "schemas/result-v1.schema.json",
    )
    subprocess.run(["git", "init", "-q", repo], check=True)
    subprocess.run(
        ["git", "-C", repo, "config", "user.email", "test@example.invalid"],
        check=True,
    )
    subprocess.run(
        ["git", "-C", repo, "config", "user.name", "Test"], check=True
    )
    (repo / "README.md").write_text("base\n", encoding="utf-8")
    return repo, commit(repo, "base")


def test_generated_indexes_need_explicit_promotion_mode(tmp_path: Path):
    repo, base = repository(tmp_path)
    item = record()
    path = repo / relative(item)
    path.parent.mkdir(parents=True)
    path.write_text(validator.canonical(item), encoding="utf-8")
    (repo / "data").mkdir()
    (repo / "data/index.tsv").write_text("derived\n", encoding="utf-8")
    indexed_head = commit(repo, "raw and derived")

    with pytest.raises(validator.ValidationError, match="DIFF_APPEND_ONLY"):
        validator.validate_range(repo, base, indexed_head)

    validator.validate_range(
        repo, base, indexed_head, allow_generated_indexes=True
    )
    human = repo / "data/toy-cayley/puzzles/p0001/solutions.tsv"
    human.parent.mkdir(parents=True)
    human.write_text("solution_path\nclockwise\n", encoding="utf-8")
    human_head = commit(repo, "human view")
    validator.validate_range(
        repo, indexed_head, human_head, allow_generated_indexes=True
    )

    (repo / "data/unexpected.tsv").write_text(
        "not allowlisted\n", encoding="utf-8"
    )
    bad_head = commit(repo, "unexpected derived file")
    with pytest.raises(validator.ValidationError, match="DIFF_APPEND_ONLY"):
        validator.validate_range(
            repo, base, bad_head, allow_generated_indexes=True
        )


def test_workflow_promotes_only_exact_indexed_head_without_self_wait():
    validate = (
        ROOT / ".github/workflows/validate-ingest.yml"
    ).read_text(encoding="utf-8")
    promote = (
        ROOT / ".github/workflows/merge-ingest.yml"
    ).read_text(encoding="utf-8")

    assert "RESULTS_INGEST_BOT_ID" in validate
    assert "github.event.sender.type" in validate
    assert "github.event.sender.id" in validate
    assert "--allow-generated-indexes" in promote
    assert "git push --force-with-lease" in promote
    assert "workflow_call:" in promote
    assert "--match-head-commit" in promote
    assert "gh pr checks" not in promote
    assert "pull_request:" not in promote
    assert "pull_request_target" not in promote

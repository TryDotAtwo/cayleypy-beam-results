from __future__ import annotations

import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def git(repo: Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", "-C", repo, *args], text=True
    ).strip()


def run(repo: Path, *args: str) -> None:
    subprocess.run(["git", "-C", repo, *args], check=True)


def commit_file(repo: Path, relative: str, body: str, message: str) -> str:
    target = repo / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(body, encoding="utf-8")
    run(repo, "add", relative)
    run(repo, "commit", "-qm", message)
    return git(repo, "rev-parse", "HEAD")


def test_regular_merge_allows_staging_to_rejoin_main_without_losing_next_result(
    tmp_path: Path,
):
    repo = tmp_path / "repo"
    repo.mkdir()
    run(repo, "init", "-q", "-b", "main")
    run(repo, "config", "user.email", "test@example.invalid")
    run(repo, "config", "user.name", "Test")
    commit_file(repo, "README.md", "base\n", "base")

    run(repo, "checkout", "-qb", "ingest/staging")
    first = commit_file(repo, "results/one.json", "one\n", "first")
    run(repo, "checkout", "main")
    run(repo, "merge", "--no-ff", "-m", "publish first", first)

    run(repo, "checkout", "ingest/staging")
    commit_file(repo, "results/two.json", "two\n", "second")
    run(repo, "merge", "--no-edit", "main")

    assert (
        subprocess.run(
            ["git", "-C", repo, "merge-base", "--is-ancestor", "main", "HEAD"]
        ).returncode
        == 0
    )
    assert git(repo, "diff", "--name-only", "main..HEAD") == "results/two.json"


def test_exact_candidate_check_and_periodic_reconciler_are_declared():
    validate = (
        ROOT / ".github/workflows/validate-ingest.yml"
    ).read_text(encoding="utf-8")
    promote = (
        ROOT / ".github/workflows/merge-ingest.yml"
    ).read_text(encoding="utf-8")

    assert "checks: write" in validate
    assert "checks: write" in promote
    assert "schedule:" in promote
    assert "cron:" in promote
    assert "cayleypy-results/exact-candidate" in promote
    assert "/check-runs" in promote
    assert '"head_sha":"$candidate"' in promote
    assert "--merge" in promote
    assert "--squash" not in promote
    assert 'git merge --no-edit "$base"' in promote
    assert "refs/heads/$STAGING_BRANCH:$candidate" in promote

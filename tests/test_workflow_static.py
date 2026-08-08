from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def workflows() -> tuple[str, str]:
    validate = (
        ROOT / ".github/workflows/validate-ingest.yml"
    ).read_text(encoding="utf-8")
    promote = (
        ROOT / ".github/workflows/merge-ingest.yml"
    ).read_text(encoding="utf-8")
    return validate, promote


def test_workflows_pin_actions_and_default_to_no_permissions():
    validate, promote = workflows()
    for workflow in (validate, promote):
        assert "permissions: {}" in workflow
        assert (
            "actions/checkout@"
            "11bd71901bbe5b1630ceea73d27597364c9af683"
        ) in workflow
        assert (
            "actions/setup-python@"
            "e797f83bcb11b83ae66e0230d6156d7c80228e7c"
        ) in workflow
        assert "pull_request_target" not in workflow
        assert "workflow_run" not in workflow
        assert "concurrency:" not in workflow
        assert ("github" + "_pat_") not in workflow
        assert ("gh" + "p_") not in workflow


def test_app_push_gate_uses_exact_login_sender_type_and_numeric_id():
    validate, _promote = workflows()
    assert "RESULTS_INGEST_APP_LOGIN" in validate
    assert "RESULTS_INGEST_BOT_ID" in validate
    assert "github.event.sender.type" in validate
    assert "github.event.sender.id" in validate
    assert 'test "$GITHUB_ACTOR" = "$EXPECTED_APP_LOGIN"' in validate
    assert 'test "$SENDER_TYPE" = "Bot"' in validate
    assert 'test "$SENDER_ID" = "$EXPECTED_BOT_ID"' in validate
    assert 'test "$GITHUB_REF" = "refs/heads/ingest/staging"' in validate
    assert "git merge-base --is-ancestor" in validate


def test_promotion_rebuilds_and_matches_the_exact_remote_head():
    _validate, promote = workflows()
    assert "workflow_call:" in promote
    assert "ENABLE_CAYLEYPY_AUTO_MERGE == 'true'" in promote
    assert "--allow-generated-indexes" in promote
    assert "git push" in promote
    assert "--force-with-lease=" in promote
    assert "--native-results data/v2/slurm" in promote
    assert "cmp --silent" not in promote
    assert '"index.tsv",' in promote
    assert 'f"generated payload mismatch: {relative}"' in promote
    assert "data/.human-results-manifest.json" in promote
    assert 'payload["paths"]' in promote
    assert "--match-head-commit" in promote
    assert "gh pr checks" not in promote
    assert "pull_request:" not in promote
    assert "cayleypy-ingest-approved" in promote

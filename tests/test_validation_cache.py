import copy
import json
import shutil
from pathlib import Path

import pytest
from tools import validate_result as validator

ROOT = Path(__file__).resolve().parents[1]


def setup_cache(tmp_path, monkeypatch):
    shutil.copytree(ROOT / "schemas", tmp_path / "schemas")
    monkeypatch.setenv("CAYLEYPY_VALIDATION_CACHE", str(tmp_path / "receipt.json"))
    envelope = json.loads((ROOT / "tests/fixtures/golden.json").read_text(encoding="utf-8"))["cases"][0]["envelope"]
    return envelope, validator.ValidationCache(tmp_path)


def test_receipt_reuses_only_identical_validated_envelope(tmp_path, monkeypatch):
    envelope, cache = setup_cache(tmp_path, monkeypatch)
    cache.validate(envelope)
    cache.save()
    reused = validator.ValidationCache(tmp_path)
    reused.validate(envelope)
    assert (reused.hits, reused.misses) == (1, 0)
    changed = copy.deepcopy(envelope)
    changed["solution"]["length"] += 1
    with pytest.raises(validator.ValidationError):
        reused.validate(changed)
    assert validator.digest(changed) not in reused.entries


def test_schema_change_invalidates_all_receipts(tmp_path, monkeypatch):
    envelope, cache = setup_cache(tmp_path, monkeypatch)
    cache.validate(envelope)
    cache.save()
    schema = tmp_path / "schemas/result-v1.schema.json"
    schema.write_bytes(schema.read_bytes() + b"\n")
    refreshed = validator.ValidationCache(tmp_path)
    refreshed.validate(envelope)
    assert (refreshed.hits, refreshed.misses) == (0, 1)


def test_cache_is_opt_in_and_corruption_falls_back(tmp_path, monkeypatch):
    envelope, cache = setup_cache(tmp_path, monkeypatch)
    cache.path.write_text("broken")
    refreshed = validator.ValidationCache(tmp_path)
    refreshed.validate(envelope)
    assert refreshed.misses == 1
    monkeypatch.delenv("CAYLEYPY_VALIDATION_CACHE")
    standalone = validator.ValidationCache(tmp_path)
    standalone.validate(envelope)
    standalone.validate(envelope)
    assert standalone.misses == 2


def test_workflows_seed_only_from_main_and_compare_receipt():
    for name in ("validate-ingest.yml", "merge-ingest.yml"):
        workflow = (ROOT / ".github/workflows" / name).read_text()
        assert 'git show "origin/main:data/.validation-cache.json"' in workflow
        assert "${{ runner.temp }}/semantic-validation.json" in workflow
    workflow = (ROOT / ".github/workflows/merge-ingest.yml").read_text()
    assert '".validation-cache.json",' in workflow
    assert ': > "$CAYLEYPY_VALIDATION_CACHE"' in workflow


@pytest.mark.parametrize("status,path", [
    ("M", "results/v1/record.json"),
    ("D", "results/v1/record.json"),
    ("M", "data/v2/slurm/record.json"),
    ("A", "data/.validation-cache.json"),
])
def test_source_review_rejects_raw_rewrite_and_receipt_injection(monkeypatch, status, path):
    from tools import verify_catalog
    monkeypatch.setattr(verify_catalog, "diff_changes", lambda *args: [(status, path)])
    with pytest.raises(validator.ValidationError):
        verify_catalog.validate_source_changes(ROOT, "base")


def test_source_review_allows_code_and_new_records(monkeypatch):
    from tools import verify_catalog
    monkeypatch.setattr(verify_catalog, "diff_changes", lambda *args: [
        ("M", "tools/validate_result.py"),
        ("A", "results/v1/example/cube/1/2026-10-11/018f7a24-8f6b-7c8e-9d1b-2a3b4c5d6e80.json"),
    ])
    verify_catalog.validate_source_changes(ROOT, "base")

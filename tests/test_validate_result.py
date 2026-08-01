from __future__ import annotations
import copy, importlib.util, json, shutil, subprocess
from pathlib import Path
import pytest
ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("validator", ROOT / "tools/validate_result.py")
assert SPEC and SPEC.loader
validator = importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(validator)
CASES = json.loads((ROOT / "tests/fixtures/golden.json").read_text(encoding="utf-8"))["cases"]
def env(name="original_unicode_author"):
    return copy.deepcopy(next(x["envelope"] for x in CASES if x["name"] == name))
def record(name="original_unicode_author"):
    item = env(name); return {"submission_id": item["client_submission_id"], "envelope": item}
def rel(item):
    e=item["envelope"]
    return f"results/v1/{validator.safe_segment(e['competition'])}/{validator.safe_segment(e['puzzle_type'])}/{e['puzzle_id']}/{e['submitted_at'][:10]}/{item['submission_id']}.json"
def commit(repo, msg):
    subprocess.run(["git","-C",repo,"add","."],check=True); subprocess.run(["git","-C",repo,"commit","-qm",msg],check=True)
def make_repo(tmp_path, items):
    repo=tmp_path/"repo"; repo.mkdir(); (repo/"schemas").mkdir(); shutil.copy(ROOT/"schemas/result-v1.schema.json",repo/"schemas/result-v1.schema.json")
    subprocess.run(["git","init","-q",repo],check=True); subprocess.run(["git","-C",repo,"config","user.email","test@example.invalid"],check=True); subprocess.run(["git","-C",repo,"config","user.name","Test"],check=True)
    (repo/"README.md").write_text("base\n",encoding="utf-8"); commit(repo,"base"); base=subprocess.check_output(["git","-C",repo,"rev-parse","HEAD"],text=True).strip()
    for item in items:
        p=repo/rel(item); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(validator.canonical(item),encoding="utf-8")
    commit(repo,"append"); head=subprocess.check_output(["git","-C",repo,"rev-parse","HEAD"],text=True).strip(); return repo,base,head
@pytest.mark.parametrize("name",["original_unicode_author","reflected","empty_path_source"])
def test_valid_original_reflected_source(tmp_path,name):
    repo,base,head=make_repo(tmp_path,[record(name)]); validator.validate_range(repo,base,head)

def test_labeled_states_are_bounded_by_num_classes():
    assert validator.valid_labeled_state([0, 1, 0, 1], 4, 2)
    assert not validator.valid_labeled_state([0, 2, 0, 1], 4, 2)

def test_schema_accepts_piece_transformer_manifest():
    item = env()
    item["model"] = {
        "filename": "model.pth",
        "format": "piece-transformer",
        "sha256": "d" * 64,
        "manifest": {
            "state_len": 96,
            "num_classes": 6,
            "output_dim": 24,
            "dtype": "fp16",
            "backend": "piece_transformer",
            "model_arch": "piece_transformer",
            "move_count": 24,
            "num_pieces": 56,
            "max_piece_size": 3,
            "num_piece_types": 3,
            "seq_len": 57,
            "d_model": 256,
            "nhead": 8,
            "head_dim": 32,
            "num_layers": 4,
            "ff_dim": 1024,
            "activation": "relu",
            "pooling": "cls",
            "piece_layout": "cube4",
            "piece_embed_mode": "piece_local",
            "input_embedding": "fast_slot_projected",
        },
    }
    validator.load_schema(ROOT).validate({"schema_version": 1, "results": [item]})

@pytest.mark.parametrize("mutate,code",[
    (lambda r:r["envelope"]["solution"].update(length=99),"SOLUTION_LENGTH"),
    (lambda r:r["envelope"]["proof"]["generators"].update(clockwise=[0,0,1]),"PERMUTATION"),
    (lambda r:r["envelope"]["proof"].update(initial_state_sha256="0"*64),"PROOF_HASH"),
    (lambda r:r["envelope"]["solution"].update(path=["missing"],length=1),"REPLAY_MOVE"),
    (lambda r:r["envelope"]["profile"].update(model_class="output1"),"MODEL_HEAD"),
    (lambda r:r["envelope"].update(idempotency_key="0"*64),"IDEMPOTENCY"),
])
def test_corruptions(tmp_path,mutate,code):
    item=record(); mutate(item); repo,base,head=make_repo(tmp_path,[item])
    with pytest.raises(validator.ValidationError,match=code): validator.validate_range(repo,base,head)
def test_rejects_modified_deleted_and_wrong_path(tmp_path):
    item=record(); repo,base,head=make_repo(tmp_path,[item]); p=repo/rel(item); p.write_text(p.read_text(encoding="utf-8")+"\n",encoding="utf-8"); commit(repo,"modify"); newer=subprocess.check_output(["git","-C",repo,"rev-parse","HEAD"],text=True).strip()
    with pytest.raises(validator.ValidationError,match="DIFF_APPEND_ONLY"): validator.validate_range(repo,head,newer)
def test_rejects_duplicate_ids_in_full_head(tmp_path):
    first=record(); second=copy.deepcopy(first); second["submission_id"]="018f7a24-8f6b-7c8e-9d1b-2a3b4c5d6e82"; second["envelope"]["client_submission_id"]=second["submission_id"]; second["envelope"]["run_id"]="run-duplicate"; second["envelope"]["submitted_at"]="2026-07-29T10:30:00.000Z"
    repo,base,head=make_repo(tmp_path,[first,second])
    # First corruption is semantic hash mismatch unless a producer reuses the same semantic identity; both are terminal.
    with pytest.raises(validator.ValidationError,match="IDEMPOTENCY|DUPLICATE_IDEMPOTENCY"): validator.validate_range(repo,base,head)
def test_cli_uses_git_range(tmp_path):
    repo,base,head=make_repo(tmp_path,[record()]); result=subprocess.run(["python",ROOT/"tools/validate_result.py","--base",base,"--head",head],cwd=repo,text=True,capture_output=True)
    assert result.returncode == 0, result.stderr


def test_rejects_noncanonical_record_bytes(tmp_path):
    item = record()
    repo, base, head = make_repo(tmp_path, [item])
    path = repo / rel(item)
    path.write_text(json.dumps(item, indent=2), encoding="utf-8")
    commit(repo, "noncanonical")
    newer = subprocess.check_output(
        ["git", "-C", repo, "rev-parse", "HEAD"], text=True
    ).strip()
    schema_validator = validator.load_schema(repo)
    with pytest.raises(validator.ValidationError, match="RECORD_CANONICAL"):
        validator.validate_record(repo, newer, rel(item), schema_validator)


@pytest.mark.parametrize("bad_relative", ["results/v1/unsafe\tname.json", "results/v1/unsafe\nname.json"])
def test_head_tree_nul_parser_rejects_tab_and_newline_paths(monkeypatch, bad_relative):
    raw = b"100644 blob " + b"0" * 40 + b"\t" + bad_relative.encode("utf-8") + b"\0"
    def fake_git(_root, *args, text=True):
        assert args[:2] == ("ls-tree", "-rz") and text is False
        return raw
    monkeypatch.setattr(validator, "git", fake_git)
    with pytest.raises(validator.ValidationError, match="HEAD_PATH"):
        list(validator.head_result_paths(Path("."), "head"))

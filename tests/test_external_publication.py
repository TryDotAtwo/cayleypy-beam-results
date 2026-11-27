import pytest
from tools.validate_external_publication import canonical, hash_json, validate_batch

def fixture():
    path = ["-f0"]
    source = {"method":"exact_enumeration","url":"https://example.org/public-path","version":"1","credit":"Антонина","license":"CC0-1.0"}
    obj = {"sequence":17,"id":hash_json(["toy","v1",35,path]),"source_id":hash_json(source),
           "competition":"toy","context_version":"v1","puzzle_id":35,"path":path,"source":source,"verification":"replay_passed"}
    return "external-solutions/accepted/0000000000000017-0000000000000017.jsonl", obj

def encode(obj):
    return (canonical(obj)+"\n").encode()

def test_valid_replay_attestation():
    path, obj = fixture()
    validate_batch(path, encode(obj))

@pytest.mark.parametrize("kind", ["moves","source","sequence","verified","extra"])
def test_fails_closed(kind):
    path, obj = fixture()
    if kind == "moves": obj["path"] = ["f0"]
    if kind == "source": obj["source"]["url"] += "?secret=example"
    if kind == "sequence": obj["sequence"] += 1
    if kind == "verified": obj["verification"] = "unknown"
    if kind == "extra": obj["model"] = "invented"
    with pytest.raises(ValueError):
        validate_batch(path, encode(obj))

def test_rejects_duplicate_json_key():
    path, obj = fixture()
    raw = encode(obj).replace(b'"sequence":17',b'"sequence":17,"sequence":17')
    with pytest.raises(ValueError, match="duplicate JSON key"):
        validate_batch(path, raw)

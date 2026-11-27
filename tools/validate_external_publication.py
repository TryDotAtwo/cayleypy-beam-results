"""Verify immutable, replay-attested artifacts from the trusted external ingest tag."""
from hashlib import sha256
import json
import re
from urllib.parse import urlsplit

PATH = re.compile(r"external-solutions/accepted/([0-9]{16})-([0-9]{16})\.jsonl")
DIGEST = re.compile(r"[a-f0-9]{64}")
COMP = re.compile(r"[a-z0-9][a-z0-9-]{0,79}")
VERSION = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,79}")
MOVE = re.compile(r"-?[A-Za-z][A-Za-z0-9_]{0,23}")
METHODS = {"exact_enumeration", "team_submission", "algebraic", "search", "bfs",
           "beam_search", "human", "other"}
FIELDS = {"sequence", "id", "source_id", "competition", "context_version",
          "puzzle_id", "path", "source", "verification"}
SOURCE = {"method", "url", "version", "credit", "license"}

def canonical(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"), allow_nan=False)

def hash_json(obj):
    return sha256(canonical(obj).encode()).hexdigest()

def matches(regex, value):
    return isinstance(value, str) and regex.fullmatch(value) is not None

def unique_object(pairs):
    obj = dict(pairs)
    if len(obj) != len(pairs):
        raise ValueError("duplicate JSON key")
    return obj

def valid_source(source):
    if type(source) is not dict or frozenset(source) not in (SOURCE, SOURCE | {"label"}):
        return False
    lims = {"url": 600, "version": 80, "credit": 200, "license": 80, "label": 120}
    for k, limit in lims.items():
        if k not in source:
            continue
        s = source[k]
        if not isinstance(s, str) or not 0 < len(s) <= limit or s.strip() != s or re.search(r"[\x00-\x1f\x7f]", s):
            return False
    u = urlsplit(source["url"])
    return (isinstance(source["method"], str) and source["method"] in METHODS
            and u.scheme == "https" and u.hostname and not any(
                (u.username, u.password, u.port, u.query, u.fragment)
            ))

def validate_batch(relative, raw):
    m = PATH.fullmatch(relative)
    if not m or not 0 < len(raw) <= 128 * 1024 or not raw.endswith(b"\n"):
        raise ValueError("invalid external batch path or size")
    first, last = map(int, m.groups())
    lines = raw[:-1].decode("utf-8").split("\n")
    if not 1 <= len(lines) <= 24:
        raise ValueError("invalid external batch count")
    cursor = 0
    seen = set()
    for line in lines:
        obj = json.loads(line, object_pairs_hook=unique_object)
        if type(obj) is not dict or obj.keys() != FIELDS or canonical(obj) != line:
            raise ValueError("invalid external batch JSON")
        seq, puzzle, path = obj["sequence"], obj["puzzle_id"], obj["path"]
        if (type(seq) is not int or not max(first-1, cursor) < seq <= last
                or seq > 9007199254740991 or (cursor == 0 and seq != first)
                or type(puzzle) is not int or not 0 <= puzzle <= 2147483647
                or obj["verification"] != "replay_passed"
                or not matches(COMP,obj["competition"]) or not matches(VERSION,obj["context_version"])
                or not matches(DIGEST,obj["id"]) or not matches(DIGEST,obj["source_id"])
                or type(path) is not list or len(path) > 1024 or not all(matches(MOVE,x) for x in path)
                or not valid_source(obj["source"])):
            raise ValueError("invalid external record")
        cursor = seq
        pair = obj["id"], obj["source_id"]
        if (pair in seen or pair[0] != hash_json([obj["competition"],obj["context_version"],puzzle,path])
                or pair[1] != hash_json(obj["source"])):
            raise ValueError("duplicate or incorrect external digest")
        seen.add(pair)
    if cursor != last:
        raise ValueError("external batch end differs from name")

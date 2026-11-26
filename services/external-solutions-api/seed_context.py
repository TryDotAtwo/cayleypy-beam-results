"""Build a D1 seed from a reviewed permutation-puzzle JSON manifest, pinned by SHA-256."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import sys

def expect(condition, reason):
    if not condition:
        raise ValueError(reason)

def canonical(value):
    return json.dumps(value, ensure_ascii=True, separators=(",", ":"), sort_keys=True)

def quoted(value):
    return "'" + value.replace("'", "''") + "'"

def state(value):
    return isinstance(value, list) and 1 <= len(value) <= 512 and all(
        type(i) is int and 0 <= i <= 2147483647 for i in value)

def build(raw, expected):
    expect(hashlib.sha256(raw).hexdigest() == expected, "trusted manifest SHA256 mismatch")
    def unique(pairs):
        o = dict(pairs)
        expect(len(o) == len(pairs), "duplicate JSON property")
        return o
    x = json.loads(raw, object_pairs_hook=unique)
    expect(set(x) == {"competition","context_version","move_sets","puzzles"},"invalid manifest fields")
    competition, version, sets, rows = (x[k] for k in ("competition","context_version","move_sets","puzzles"))
    expect(re.fullmatch(r"[a-z0-9][a-z0-9-]{0,79}",competition) and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,79}",version),"invalid context ID")
    expect(isinstance(sets,dict) and 1 <= len(sets) <= 500 and 1 <= len(rows) <= 100000,"invalid manifest size")
    sizes={}
    for kind, moves in sets.items():
        expect(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,79}",kind) and isinstance(moves,dict) and 1 <= len(moves) <= 256,"invalid move set")
        n=len(next(iter(moves.values())))
        expect(1<=n<=512,"invalid move dimension")
        expect(all(re.fullmatch(r"-?[A-Za-z][A-Za-z0-9_]{0,23}",m) and state(v) and sorted(v)==list(range(n)) for m,v in moves.items()),"invalid permutation")
        sizes[kind]=n
    seen=set()
    expect(isinstance(rows,list),"invalid puzzles")
    for r in rows:
        expect(set(r)=={"puzzle_id","kind","start","target"},"invalid puzzle")
        pid, kind, start, target = (r[k] for k in ("puzzle_id","kind","start","target"))
        expect(type(pid) is int and 0<=pid<=2147483647 and pid not in seen and kind in sizes,"invalid puzzle ID or move set")
        expect(state(start) and state(target) and len(start)==len(target)==sizes[kind] and Counter(start)==Counter(target),"invalid start or target")
        seen.add(pid)
    cv=quoted(competition)+","+quoted(version)
    out=[f"INSERT INTO competitions VALUES ({cv},{len(rows)});"]
    out += [f"INSERT INTO move_sets VALUES ({cv},{quoted(k)},{quoted(canonical(m))});" for k,m in sorted(sets.items())]
    out += [f"INSERT INTO contexts VALUES ({cv},{r['puzzle_id']},{quoted(canonical(r['start']))},{quoted(canonical(r['target']))},{quoted(r['kind'])});" for r in sorted(rows, key=lambda r:r["puzzle_id"])]
    return "\n".join(out)+"\n"

if __name__=="__main__":
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("manifest",type=Path); p.add_argument("--sha256",required=True); p.add_argument("output",type=Path)
    a=p.parse_args()
    try:
        data=build(a.manifest.read_bytes(),a.sha256)
        with a.output.open("x",encoding="utf8",newline="\n") as f: f.write(data)
        print("seed_sha256="+hashlib.sha256(data.encode()).hexdigest())
    except (ValueError,TypeError,AttributeError,OSError,KeyError) as e: sys.exit(str(e))

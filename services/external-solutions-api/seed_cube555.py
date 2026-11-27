"""Convert the pinned official Cube555 inputs to a local D1 seed. Never commit the inputs."""
import argparse
from collections import Counter
import csv
import hashlib
import json
from pathlib import Path
import re
import sys

COMPETITION = "cayley-py-555-cube"
VERSION = "cube555-kaggle-v1"
EXPECTED = {
    "test.csv": "c9e4d5f61378af1940be5501c581e9c898a1a29eba040035c3dd50ca75139e9d",
    "puzzle_info.json": "01c616cb943d574d1b63109f350b30c7710656e53e2a5eaebb5d50ed0e495ff0",
}

def state(x):
    a = [int(v) for v in x.split(",")] if isinstance(x, str) else x
    if not isinstance(a,list) or len(a) != 150 or any(type(v) is not int or not 0 <= v < 150 for v in a):
        raise ValueError("invalid Cube555 state")
    return a

def j(x):
    return json.dumps(x, ensure_ascii=True, separators=(",", ":"), sort_keys=True)

def sql(x):
    return "'" + x.replace("'", "''") + "'"

def seed(inputs, output):
    for name, expected in EXPECTED.items():
        if hashlib.sha256((inputs/name).read_bytes()).hexdigest() != expected:
            raise ValueError("SHA256 mismatch: " + name)
    raw = json.loads((inputs/"puzzle_info.json").read_text(encoding="utf-8-sig"))
    goal, moves = state(raw["central_state"]), raw["generators"]
    if len(moves) != 30 or any(not re.fullmatch(r"-?[A-Za-z][A-Za-z0-9_]{0,23}", k) or sorted(state(v)) != list(range(150)) for k,v in moves.items()):
        raise ValueError("invalid official generators")
    with (inputs/"test.csv").open(encoding="utf-8-sig",newline="") as f:
        rows = [(int(r["initial_state_id"]), state(r["initial_state"])) for r in csv.DictReader(f)]
    if sorted(i for i,_ in rows) != list(range(1035)) or any(Counter(a) != Counter(goal) for _,a in rows):
        raise ValueError("invalid official puzzle coverage")
    # Fail if this version exists, rather than silently accepting a different context.
    with output.open("x",encoding="utf8",newline="\n") as f:
        f.write(f"INSERT INTO competitions VALUES ({sql(COMPETITION)},{sql(VERSION)},{len(rows)});\n")
        f.write(f"INSERT INTO move_sets VALUES ({sql(COMPETITION)},{sql(VERSION)},'cube555',{sql(j(moves))});\n")
        g=sql(j(goal))
        for i,a in sorted(rows):
            f.write(f"INSERT INTO contexts VALUES ({sql(COMPETITION)},{sql(VERSION)},{i},{sql(j(a))},{g},'cube555');\n")
    print(j({"version":VERSION,"puzzles":len(rows),"generators":len(moves),"sql_sha256":hashlib.sha256(output.read_bytes()).hexdigest()}))

if __name__=="__main__":
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("inputs",type=Path); p.add_argument("output",type=Path)
    a=p.parse_args()
    try: seed(a.inputs,a.output)
    except (ValueError,OSError,KeyError) as e: sys.exit(str(e))

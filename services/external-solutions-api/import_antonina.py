"""Upload Antonina's versioned public Cube555 CSV with resumable, idempotent batches."""
import argparse
from collections import Counter
import csv
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

COMP = "cayley-py-555-cube"
CSV_SHA = "aa3a4eeb5d4359599c0c0ada2af5debcaf6dcc742f33862df1903ab218c2d63c"
METHOD = {"team_submission":"team_submission","geodesics":"exact_enumeration",
          "algebraic_reduce":"algebraic","resmlp_q":"search","transformer_q":"search"}
SOURCE = {"url":"https://www.kaggle.com/datasets/antoninadolgorukova/cube555-solutions/data",
          "version":"1","credit":"Antonina Dolgorukova (dataset compiler)","license":"CC0-1.0"}

def normalized(pid, word, label, length):
    path=word.split(".") if word else []
    if not 0<=pid<=1034 or len(path)!=length or length>1024 or any(not re.fullmatch(r"-?[A-Za-z][A-Za-z0-9_]{0,23}", m) for m in path):
        raise ValueError(f"invalid solution for {pid}")
    return {"puzzle_id":pid,"path":path,"source":{**SOURCE,"method":METHOD[label],"label":label}}

def read_csv(path):
    if hashlib.sha256(path.read_bytes()).hexdigest()!=CSV_SHA: raise ValueError("CSV is not the pinned dataset v1")
    with path.open(encoding="utf-8-sig",newline="") as f:
        return [normalized(int(r["initial_state_id"]),r["solution"],r["source"],int(r["solution_length"])) for r in csv.DictReader(f)]

def batches(rows, offset):
    batch=[]; moves=0
    for i,r in enumerate(rows[offset:],offset):
        n=len(r["path"])
        if batch and (len(batch)==24 or moves+n>3000):
            yield i,batch
            batch=[]; moves=0
        batch.append(r); moves+=n
    if batch: yield len(rows),batch

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): return None

def send(url, rows, token):
    data=json.dumps({"competition":COMP,"context_version":"cube555-kaggle-v1","solutions":rows},separators=(",",":")).encode()
    opener=urllib.request.build_opener(NoRedirect)
    for attempt in range(5):
        try:
            with opener.open(urllib.request.Request(url,data,{"Authorization":"Bearer "+token,"Content-Type":"application/json"}),timeout=30) as r:
                obj=json.load(r)
            if obj["context_version"]!="cube555-kaggle-v1" or len(obj["results"])!=len(rows):
                raise ValueError("unexpected receipt")
            if not all(re.fullmatch(r"[0-9a-f]{64}",x["id"]) and x["status"] in {"created","source_added","existing"} for x in obj["results"]):
                raise ValueError("invalid receipt")
            return Counter(x["status"] for x in obj["results"])
        except urllib.error.HTTPError as e:
            if e.code not in {429,500,502,503,504} or attempt==4:
                raise ValueError(f"HTTP {e.code}: "+e.read(1024).decode(errors="replace")) from None
        except (urllib.error.URLError,TimeoutError) as e:
            if attempt==4: raise ValueError("upload timed out or connection failed") from e
        time.sleep(min(2**attempt,16))

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("csv",type=Path)
    p.add_argument("--endpoint",help="Full /v1/solutions URL; omit for preflight only")
    p.add_argument("--state",type=Path,default=Path("cube555-upload-checkpoint.json"))
    a=p.parse_args(); rows=read_csv(a.csv)
    if not a.endpoint:
        print(json.dumps({"rows":len(rows),"batches":sum(1 for _ in batches(rows,0)),
                          "source_counts":Counter(r["source"]["label"] for r in rows),"uploaded":False},sort_keys=True))
        return
    url=urllib.parse.urlsplit(a.endpoint)
    if (url.scheme!="https" and not (url.scheme=="http" and url.hostname in {"localhost","127.0.0.1"})) or not url.hostname or url.username or url.password or url.path!="/v1/solutions" or url.query or url.fragment:
        raise ValueError("use an HTTPS URL ending in /v1/solutions")
    token=os.environ.get("EXTERNAL_SOLUTIONS_UPLOAD_TOKEN","")
    if len(token)<32: raise ValueError("set EXTERNAL_SOLUTIONS_UPLOAD_TOKEN")
    expected={"csv_sha256":CSV_SHA,"endpoint":a.endpoint}
    old=json.loads(a.state.read_text()) if a.state.exists() else {**expected,"offset":0}
    if any(old[k]!=v for k,v in expected.items()) or type(old["offset"]) is not int or not 0<=old["offset"]<=len(rows):
        raise ValueError("checkpoint does not match this import")
    counts=Counter(old.get("counts",{}))
    for next_offset, batch in batches(rows,old["offset"]):
        counts.update(send(a.endpoint,batch,token))
        tmp=a.state.with_name(a.state.name+".tmp")
        tmp.write_text(json.dumps({**expected,"offset":next_offset,"counts":counts}),encoding="utf8")
        tmp.replace(a.state)
        if next_offset==len(rows) or next_offset//1000>(next_offset-len(batch))//1000:
            print(json.dumps({"offset":next_offset,"total":len(rows),"counts":counts}),flush=True)
    print(json.dumps({"total":len(rows),"counts":counts,"completed":True}),flush=True)

if __name__=="__main__":
    try: main()
    except (ValueError,OSError,KeyError) as e: sys.exit(str(e))

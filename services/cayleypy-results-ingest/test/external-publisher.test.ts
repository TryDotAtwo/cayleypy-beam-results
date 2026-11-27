import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { publishAcceptedExternal } from "../src/external-publisher.js";

describe("external publication", () => {
  it("is disabled without a verified initial cursor", async () => {
    const call = vi.fn();
    await publishAcceptedExternal({}, {} as never, call, call);
    expect(call).not.toHaveBeenCalled();
  });
  it("preserves pending bytes on a lost update and confirms the same Git content on retry", async () => {
    const path = ["-f0"];
    const source = {method:"exact_enumeration",url:"https://example.org/public",version:"1",credit:"Test",license:"CC0-1.0"};
    const hash = (x:unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
    const row = {sequence:17,id:hash(["toy","v1",35,path]),source_id:hash(source),competition:"toy",context_version:"v1",puzzle_id:35,path_json:JSON.stringify(path),length:1,source_json:JSON.stringify(source)};
    const db = {prepare: () => ({bind: () => ({all: async () => ({results:[row]})})})};
    const kv = new Map();
    const storage = {get: async(k:string)=>kv.get(k),put:async(k:string,v:unknown)=>{kv.set(k,v)},delete:async(k:string)=>kv.delete(k)};
    const env = {EXTERNAL_SOLUTIONS_PUBLISH_AFTER:"16",EXTERNAL_SOLUTIONS_DB:db as never,REPO_OWNER:"Example",REPO_NAME:"catalog"};
    const head = "1".repeat(40); const target = "2".repeat(40);
    const requests = vi.fn().mockResolvedValueOnce({status:200,body:{object:{sha:head}}})
      .mockResolvedValueOnce({status:404})
      .mockResolvedValueOnce({status:200,body:{tree:{sha:head}}})
      .mockResolvedValueOnce({status:201,body:{sha:target}})
      .mockResolvedValueOnce({status:201,body:{sha:target}})
      .mockResolvedValueOnce({status:409});
    const token = vi.fn().mockResolvedValue("test");
    await expect(publishAcceptedExternal(env,storage as never,requests,token)).rejects.toThrow("external_github_ref_conflict");
    expect(kv.get("external-v1/cursor")).toBeUndefined();
    const pending = kv.get("external-v1/pending");
    expect(pending.nextCursor).toBe(17);
    const retry = vi.fn().mockResolvedValueOnce({status:200,body:{object:{sha:target}}})
      .mockResolvedValueOnce({status:200,body:{encoding:"base64",content:btoa(pending.content)}});
    await publishAcceptedExternal(env,storage as never,retry,token);
    expect(kv.get("external-v1/cursor")).toBe(17);
    expect(kv.has("external-v1/pending")).toBe(false);
    expect(retry).toHaveBeenCalledTimes(2);
  });
});

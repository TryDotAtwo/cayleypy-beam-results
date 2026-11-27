import { nextAcceptedBatch, type AcceptedBatch } from "../../external-solutions-api/accepted-export.mjs";
import { githubRequest, getInstallationToken, type GitHubAppConfig } from "./github-app.js";

const TAG = "ingest/staging";
const CURSOR = "external-v1/cursor";
const PENDING = "external-v1/pending";
const validSha = /^[a-f0-9]{40}$/;
interface ExternalPublishEnv extends GitHubAppConfig {
  EXTERNAL_SOLUTIONS_DB?: D1Database;
  EXTERNAL_SOLUTIONS_PUBLISH_AFTER?: string;
}
function sha(input: unknown): string {
  const value = (input as {sha?: unknown} | null)?.sha;
  if (typeof value !== "string" || !validSha.test(value)) throw new Error("external_github_sha_invalid");
  return value;
}
function segment(input: unknown): string {
  if (typeof input !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}$/.test(input)) throw new Error("external_github_repo_invalid");
  return encodeURIComponent(input);
}
function decodeContent(v: unknown): string {
  const record = v as {content?: unknown; encoding?: unknown} | null;
  if (record?.encoding !== "base64" || typeof record.content !== "string") throw new Error("external_github_content_invalid");
  return new TextDecoder("utf-8", {fatal:true}).decode(Uint8Array.from(atob(record.content), v => v.charCodeAt(0)));
}
export async function publishAcceptedExternal(
  env: ExternalPublishEnv,
  storage: Pick<DurableObjectStorage, "get" | "put" | "delete">,
  request = githubRequest,
  tokenFor = getInstallationToken,
): Promise<void> {
  const raw = env.EXTERNAL_SOLUTIONS_PUBLISH_AFTER;
  if (raw === undefined) return; // Require an operator-verified initial checkpoint.
  if (!/^(0|[1-9][0-9]{0,15})$/.test(raw) || !Number.isSafeInteger(Number(raw)) || !env.EXTERNAL_SOLUTIONS_DB) {
    throw new Error("external_publisher_config_invalid");
  }
  const initial = Number(raw);
  const cursor = (await storage.get<number>(CURSOR)) ?? initial;
  let batch = await storage.get<AcceptedBatch>(PENDING);
  if (batch && batch.nextCursor <= cursor) {
    await storage.delete(PENDING);
    batch = undefined;
  }
  if (!batch) {
    const next = await nextAcceptedBatch(env.EXTERNAL_SOLUTIONS_DB, cursor);
    if (!next) return;
    batch = next;
    await storage.put(PENDING, batch); // Stable boundaries across ambiguous requests.
  }

  const root = "/repos/" + segment(env.REPO_OWNER) + "/" + segment(env.REPO_NAME);
  const token = await tokenFor(env);
  const tag = "tags/" + TAG;
  const ref = await request(env, root + "/git/ref/" + tag, {token});
  if (ref.status !== 200) throw new Error("external_github_ref_unavailable");
  const head = sha((ref.body as {object?: unknown} | null)?.object);
  const prior = await request(env, root + "/contents/" + batch.path + "?ref=" + head, {token});
  if (prior.status === 200) {
    if (decodeContent(prior.body) !== batch.content) throw new Error("external_github_path_conflict");
  } else {
    if (prior.status !== 404) throw new Error("external_github_contents_unavailable");
    const commit = await request(env, root + "/git/commits/" + head, {token});
    if (commit.status !== 200) throw new Error("external_github_commit_unavailable");
    const tree = await request(env, root + "/git/trees", {token,method:"POST",body:{
      base_tree:sha((commit.body as {tree?: unknown} | null)?.tree),
      tree:[{path:batch.path,mode:"100644",type:"blob",content:batch.content}],
    }});
    if (tree.status !== 201) throw new Error("external_github_tree_failed");
    const next = await request(env, root + "/git/commits", {token,method:"POST",body:{
      message:"ingest: stage replay-verified external CayleyPy solutions",
      tree:sha(tree.body),parents:[head],
    }});
    if (next.status !== 201) throw new Error("external_github_commit_failed");
    const updated = await request(env, root + "/git/refs/" + tag, {token,method:"PATCH",body:{sha:sha(next.body),force:false}});
    if (updated.status !== 200) throw new Error("external_github_ref_conflict");
  }
  await storage.put(CURSOR, batch.nextCursor);
  await storage.delete(PENDING);
}

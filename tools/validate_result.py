#!/usr/bin/env python3
"""Fail-closed validator for append-only CayleyPy v1 staging records."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

from jsonschema import Draft202012Validator, FormatChecker

MAX_ENVELOPE_BYTES = 256 * 1024
MAX_STATE_LENGTH = 120
MAX_MOVE_COUNT = 256
MAX_PATH_LENGTH = 4096
UUID7 = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
RESULT_PATH = re.compile(
    r"^results/v1/([a-z0-9._-]{1,128})/([a-z0-9._-]{1,128})/"
    r"(0|[1-9][0-9]*)/(\d{4}-\d{2}-\d{2})/([0-9a-f-]{36})\.json$"
)
RESULT_PATH_V2 = re.compile(
    r"^data/v2/slurm/([a-z0-9._-]{1,128})/([a-z0-9._-]{1,128})/"
    r"(\d{4}-\d{2}-\d{2})/([0-9a-f-]{36})\.json$"
)
GENERATED_INDEX_PATHS = {
    "data/index.tsv",
    "data/by_author.tsv",
    "data/best_solutions.tsv",
    "data/runs.json",
}GENERATED_HUMAN_PATH = re.compile(
    r"^data/[a-z0-9._-]{1,128}/(?:index\.tsv|puzzles/p[0-9]{4,}/"
    r"(?:solutions\.tsv|best_solution\.tsv|metadata\.json|summary\.md))$"
)


def is_generated_path(relative: str) -> bool:
    return (
        relative in GENERATED_INDEX_PATHS
        or relative == "data/.human-results-manifest.json"
        or GENERATED_HUMAN_PATH.fullmatch(relative) is not None
    )


class ValidationError(Exception):
    def __init__(self, code: str, detail: str = "") -> None:
        self.code, self.detail = code, detail
        super().__init__(f"{code}{': ' + detail if detail else ''}")


def canonical(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    )


def digest(value: Any) -> str:
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def digest_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def safe_segment(value: str) -> str:
    out = re.sub(r"[^a-z0-9._-]+", "-", value.lower()).strip("-")
    if not out or len(out) > 128:
        raise ValidationError("PATH_SEGMENT")
    return out


def error(code: str, detail: str = "") -> None:
    raise ValidationError(code, detail)


def load_schema(root: Path, version: int = 1) -> Draft202012Validator:
    if version not in {1, 2}:
        error("SCHEMA_VERSION")
    schema = json.loads(
        (root / f"schemas/result-v{version}.schema.json").read_text(encoding="utf-8")
    )
    return Draft202012Validator(schema, format_checker=FormatChecker())


def validate_schema(
    envelope: Any, validator: Draft202012Validator
) -> None:
    issues = sorted(
        validator.iter_errors(
            {"schema_version": envelope.get("schema_version"), "results": [envelope]}
        ),
        key=lambda issue: list(issue.absolute_path),
    )
    if issues:
        issue = issues[0]
        location = "/".join(
            str(part) for part in issue.absolute_path
        )
        error("SCHEMA", f"{location}:{issue.validator}")


def valid_state(values: Any, n: int) -> bool:
    return (
        isinstance(values, list)
        and len(values) == n
        and all(type(value) is int and 0 <= value < n for value in values)
    )


def valid_labeled_state(values: Any, n: int, num_classes: int) -> bool:
    return (
        isinstance(values, list)
        and len(values) == n
        and all(
            type(value) is int and 0 <= value < num_classes
            for value in values
        )
    )

def valid_permutation(values: Any, n: int) -> bool:
    return (
        valid_state(values, n)
        and len(set(values)) == n
    )


def replay(
    initial: list[int],
    path: list[str],
    generators: dict[str, list[int]],
    n: int,
) -> list[int]:
    state = list(initial)
    for move in path:
        permutation = generators.get(move)
        if permutation is None:
            error("REPLAY_MOVE", move)
        state = [state[source] for source in permutation]
    return state


def invert_path(
    path: list[str],
    generators: dict[str, list[int]],
    n: int,
) -> list[str]:
    by_permutation: dict[tuple[int, ...], list[str]] = {}
    for name, permutation in generators.items():
        by_permutation.setdefault(tuple(permutation), []).append(name)
    output: list[str] = []
    for move in reversed(path):
        permutation = generators.get(move)
        if permutation is None:
            error("REFLECTION_MOVE", move)
        inverse = [0] * n
        for target, source in enumerate(permutation):
            inverse[source] = target
        names = by_permutation.get(tuple(inverse), [])
        if len(names) != 1:
            error("REFLECTION_INVERSE", move)
        output.append(names[0])
    return output


def semantic(envelope: dict[str, Any]) -> dict[str, Any]:
    omitted = {
        "client_submission_id",
        "run_id",
        "idempotency_key",
        "submitted_at",
    }
    return {
        key: value
        for key, value in envelope.items()
        if key not in omitted
    }


def validate_integrity(envelope: dict[str, Any]) -> None:
    if len(canonical(envelope).encode("utf-8")) > MAX_ENVELOPE_BYTES:
        error("ENVELOPE_SIZE")
    proof = envelope["proof"]
    manifest = envelope["model"]["manifest"]
    n = manifest["state_len"]
    if n < 1 or n > MAX_STATE_LENGTH or manifest["num_classes"] > n:
        error("STATE_LENGTH")
    generators = proof["generators"]
    if len(generators) > MAX_MOVE_COUNT:
        error("PROOF_BOUNDS")
    if any(
        not valid_permutation(permutation, n)
        for permutation in generators.values()
    ):
        error("PERMUTATION")
    if (
        not valid_labeled_state(proof["initial_state"], n, manifest["num_classes"])
        or not valid_labeled_state(proof["central_state"], n, manifest["num_classes"])
    ):
        error("STATE_PERMUTATION")
    if len(envelope["solution"]["path"]) > MAX_PATH_LENGTH:
        error("PROOF_BOUNDS")
    hashes = (
        ("initial_state", proof["initial_state_sha256"]),
        ("central_state", proof["central_state_sha256"]),
        ("generators", proof["generators_sha256"]),
    )
    for field, claimed in hashes:
        if digest(proof[field]) != claimed:
            error("PROOF_HASH", field)
    solution = envelope["solution"]
    if solution["length"] != len(solution["path"]):
        error("SOLUTION_LENGTH")
    reached = replay(
        proof["initial_state"],
        solution["path"],
        generators,
        n,
    )
    if (
        digest(reached) != proof["reached_state_sha256"]
        or reached != proof["central_state"]
    ):
        error("REPLAY_TARGET")
    orientation = envelope["orientation"]
    reflected_fields = {
        "searched_path",
        "reflected_source_path",
        "reflected_source_sha256",
    }
    if orientation["final_orientation"] == "reflected":
        if not reflected_fields <= set(orientation):
            error("REFLECTION_PROVENANCE")
        source = orientation["reflected_source_path"]
        if (
            digest_text(".".join(source))
            != orientation["reflected_source_sha256"]
        ):
            error("REFLECTION_HASH")
        if (
            replay(proof["initial_state"], source, generators, n)
            != proof["central_state"]
        ):
            error("REFLECTION_REPLAY")
        searched = replay(
            replay(proof["central_state"], source, generators, n),
            orientation["searched_path"],
            generators,
            n,
        )
        if searched != proof["central_state"]:
            error("REFLECTION_REPLAY")
        if (
            invert_path(orientation["searched_path"], generators, n)
            != solution["path"]
        ):
            error("REFLECTION_INVERSE")
    elif reflected_fields & set(orientation):
        error("REFLECTION_PROVENANCE")
    move_count = len(generators)
    output_dim = manifest["output_dim"]
    model_class = envelope["profile"]["model_class"]
    if (
        model_class == "output1"
        and output_dim != 1
    ) or (
        model_class == "output_move_count"
        and output_dim != move_count
    ):
        error("MODEL_HEAD")
    if envelope.get("schema_version") == 2:
        hardware = envelope["hardware"]
        profile = envelope["profile"]
        provenance = envelope["provenance"]
        if (
            len(hardware["gpu_names"]) != hardware["accelerator_count"]
            or hardware["world_size"] != hardware["accelerator_count"]
            or len(set(hardware["gpu_names"])) != 1
        ):
            error("HARDWARE_CARDINALITY")
        if (
            profile["native_sm"] != hardware["native_sm"]
            or profile["world_size"] != hardware["world_size"]
            or profile["vram_mib"] != hardware["vram_mib_per_gpu"]
        ):
            error("PROFILE_HARDWARE")
        if (
            profile["effective_beam"] < profile["requested_beam"]
            or profile["alignment_delta"]
            != profile["effective_beam"] - profile["requested_beam"]
        ):
            error("PROFILE_BEAM")
        if profile["profile_anchor_beam"] != 2 ** profile["profile_power"]:
            error("PROFILE_ANCHOR")
        expected_backend = (
            "piece_transformer"
            if envelope["model"]["format"] == "piece-transformer"
            else "mlp"
        )
        if profile["backend"] != expected_backend:
            error("PROFILE_BACKEND")
        if provenance["run_id"] != envelope["run_id"]:
            error("RUN_PROVENANCE")
    if digest(semantic(envelope)) != envelope["idempotency_key"]:
        error("IDEMPOTENCY")


def validate_path(
    relative: str,
    submission_id: str,
    envelope: dict[str, Any],
) -> None:
    version = envelope.get("schema_version")
    match = (RESULT_PATH if version == 1 else RESULT_PATH_V2 if version == 2 else re.compile(r"a^")).fullmatch(relative)
    if not match or not UUID7.fullmatch(submission_id):
        error("PATH")
    groups = match.groups()
    if version == 1:
        competition, puzzle_type, puzzle_id, day, path_id = groups
        derived = (
            safe_segment(envelope["competition"]),
            safe_segment(envelope["puzzle_type"]),
            str(envelope["puzzle_id"]),
            envelope["submitted_at"][:10],
        )
        claimed = (competition, puzzle_type, puzzle_id, day)
    else:
        competition, puzzle_type, day, path_id = groups
        derived = (
            safe_segment(envelope["competition"]),
            safe_segment(envelope["puzzle_type"]),
            envelope["submitted_at"][:10],
        )
        claimed = (competition, puzzle_type, day)
    if path_id != submission_id:
        error("PATH_UUID")
    try:
        datetime.strptime(day, "%Y-%m-%d")
    except ValueError:
        error("PATH_DAY")
    if derived != claimed:
        error("PATH_DERIVATION")

def validate_record(
    root: Path,
    head: str,
    relative: str,
    validator: Draft202012Validator,
) -> tuple[str, str]:
    try:
        raw = git(root, "show", f"{head}:{relative}", text=False)
    except subprocess.CalledProcessError as exc:
        error("READ", str(exc))
    if len(raw) > MAX_ENVELOPE_BYTES + 4096:
        error("RECORD_SIZE")
    try:
        decoded = raw.decode("utf-8")
        record = json.loads(decoded)
    except (UnicodeDecodeError, json.JSONDecodeError):
        error("JSON")
    if decoded != canonical(record):
        error("RECORD_CANONICAL")
    if (
        not isinstance(record, dict)
        or set(record) != {"submission_id", "envelope"}
        or not isinstance(record.get("submission_id"), str)
        or not isinstance(record.get("envelope"), dict)
    ):
        error("WRAPPER")
    submission_id = record["submission_id"]
    envelope = record["envelope"]
    version = envelope.get("schema_version")
    validate_schema(envelope, load_schema(root, version))
    validate_path(relative, submission_id, envelope)
    validate_integrity(envelope)
    return submission_id, envelope["idempotency_key"]


def git(root: Path, *args: str, text: bool = True) -> str | bytes:
    return subprocess.check_output(
        ["git", "-C", str(root), *args],
        text=text,
    )


def diff_changes(
    root: Path, base: str, head: str
) -> list[tuple[str, str]]:
    raw = git(
        root,
        "diff",
        "--name-status",
        "-z",
        "--no-renames",
        f"{base}..{head}",
        text=False,
    )
    fields = raw.split(b"\0")
    if fields[-1] != b"" or (len(fields) - 1) % 2:
        error("DIFF_PARSE")
    changes: list[tuple[str, str]] = []
    for index in range(0, len(fields) - 1, 2):
        try:
            status = fields[index].decode("ascii")
            relative = fields[index + 1].decode(
                "utf-8", "surrogateescape"
            )
        except UnicodeDecodeError:
            error("DIFF_PARSE")
        changes.append((status, relative))
    return changes


def has_surrogate(value: str) -> bool:
    return any(
        0xDC80 <= ord(character) <= 0xDCFF
        for character in value
    )


def head_result_paths(root: Path, head: str) -> Iterable[str]:
    raw = git(
        root, "ls-tree", "-rz", "--full-tree", head, text=False
    )
    for entry in raw.split(b"\0"):
        if not entry:
            continue
        try:
            metadata, path_bytes = entry.split(b"\t", 1)
            mode, kind, _sha = metadata.split(b" ", 2)
            relative = path_bytes.decode(
                "utf-8", "surrogateescape"
            )
        except (UnicodeDecodeError, ValueError):
            error("HEAD_TREE")
        if relative.startswith("results/v1/") or relative.startswith("data/v2/slurm/"):
            path_pattern = RESULT_PATH if relative.startswith("results/v1/") else RESULT_PATH_V2
            if has_surrogate(relative) or not path_pattern.fullmatch(relative):
                error("HEAD_PATH")
            if mode != b"100644" or kind != b"blob":
                error("HEAD_MODE", relative)
            yield relative


def validate_range(
    root: Path,
    base: str,
    head: str,
    *,
    allow_generated_indexes: bool = False,
) -> None:
    validator = load_schema(root)
    changes = diff_changes(root, base, head)
    for status, relative in changes:
        if allow_generated_indexes and is_generated_path(relative):
            if status not in {"A", "M", "D"}:
                error("DIFF_APPEND_ONLY", f"{status}:{relative}")
            if status == "D":
                continue
            mode_tokens = git(
                root, "ls-tree", head, "--", relative
            ).split()
            if not mode_tokens or mode_tokens[0] != "100644":
                error("DIFF_MODE", relative)
            continue
        if status != "A" or not (RESULT_PATH.fullmatch(relative) or RESULT_PATH_V2.fullmatch(relative)):
            error("DIFF_APPEND_ONLY", f"{status}:{relative}")
        mode_tokens = git(
            root, "ls-tree", head, "--", relative
        ).split()
        if not mode_tokens or mode_tokens[0] != "100644":
            error("DIFF_MODE", relative)
    seen_ids: set[str] = set()
    seen_idempotency: set[str] = set()
    for relative in head_result_paths(root, head):
        submission_id, idempotency = validate_record(
            root, head, relative, validator
        )
        if submission_id in seen_ids:
            error("DUPLICATE_SUBMISSION", submission_id)
        if idempotency in seen_idempotency:
            error("DUPLICATE_IDEMPOTENCY", idempotency)
        seen_ids.add(submission_id)
        seen_idempotency.add(idempotency)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--allow-generated-indexes", action="store_true")
    args = parser.parse_args()
    root = Path.cwd().resolve()
    try:
        validate_range(
            root,
            args.base,
            args.head,
            allow_generated_indexes=args.allow_generated_indexes,
        )
    except (ValidationError, subprocess.CalledProcessError) as exc:
        print(
            "VALIDATION_ERROR "
            f"{getattr(exc, 'code', 'GIT')} {exc}",
            file=sys.stderr,
        )
        return 1
    print("VALIDATION_OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

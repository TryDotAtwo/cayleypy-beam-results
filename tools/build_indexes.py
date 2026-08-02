#!/usr/bin/env python3
"""Deterministically derive public indexes from immutable CayleyPy v1 records."""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime
import json
import re
from pathlib import Path
from typing import Any, Iterable

try:
    from tools.validate_result import (
        ValidationError as RecordValidationError,
        load_schema,
        validate_integrity,
        validate_schema,
    )
except ModuleNotFoundError:
    from validate_result import ValidationError as RecordValidationError, load_schema, validate_integrity, validate_schema

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
HUMAN_MANIFEST = ".human-results-manifest.json"
OUTPUT_NAMES = (
    "index.tsv",
    "by_author.tsv",
    "best_solutions.tsv",
    "runs.json",
)
WIDE_HEADER = (
    "puzzle_id",
    "solution_length",
    "solution",
    "beam_effective",
    "final_orientation",
    "touch_radius",
    "model_class",
    "author_name",
    "submitted_at",
    "competition",
    "puzzle_type",
    "beam_requested",
    "beam_alignment_delta",
    "solution_mode",
    "collection_status",
    "collection_index",
    "solved_depth",
    "touch_depth",
    "max_depth",
    "max_collected_solutions",
    "model_id",
    "model_filename",
    "model_sha256",
    "model_format",
    "model_dtype",
    "model_output_dim",
    "platform",
    "gpu_names",
    "gpu_count",
    "world_size",
    "native_sm",
    "vram_mib_per_gpu",
    "solve_us",
    "wall_us",
    "profile_id",
    "profile_power",
    "profile_status",
    "run_id",
    "submission_id",
    "idempotency_key",
    "solver_commit",
    "producer_url",
    "record_path",
)


class IndexBuildError(ValueError):
    """Stable fail-closed index build error."""


def canonical(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    )


def safe_segment(value: str) -> str:
    output = re.sub(r"[^a-z0-9._-]+", "-", value.lower()).strip("-")
    if not output or len(output) > 128:
        raise IndexBuildError("PATH_SEGMENT")
    return output


def _required_dict(value: Any, code: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise IndexBuildError(code)
    return value


def _required_string(value: Any, code: str) -> str:
    if not isinstance(value, str) or not value:
        raise IndexBuildError(code)
    return value


def _required_integer(value: Any, code: str) -> int:
    if type(value) is not int:
        raise IndexBuildError(code)
    return value
def _optional_string(value: Any, code: str) -> str:
    if value is None:
        return ""
    if not isinstance(value, str):
        raise IndexBuildError(code)
    return value


def _optional_integer(value: Any, code: str) -> int | str:
    if value is None:
        return ""
    if type(value) is not int:
        raise IndexBuildError(code)
    return value


def _formula_after_ignored_prefix(value: str) -> bool:
    index = 0
    while index < len(value):
        character = value[index]
        if not (character.isspace() or ord(character) < 32 or ord(character) == 127):
            break
        index += 1
    prefix = value[index:index + 1]
    return bool(prefix) and prefix in "=+-@"


def tsv_cell(value: Any) -> str:
    """Encode one TSV cell without row or spreadsheet-formula injection."""
    text = "" if value is None else str(value)
    dangerous = _formula_after_ignored_prefix(text)
    escaped = []
    for character in text:
        codepoint = ord(character)
        if character == "\\":
            escaped.append("\\\\")
        elif codepoint < 32 or codepoint == 127:
            escaped.append(f"\\u{codepoint:04x}")
        else:
            escaped.append(character)
    encoded = "".join(escaped)
    return "'" + encoded if dangerous else encoded


def tsv_payload(header: tuple[str, ...], rows: Iterable[tuple[Any, ...]]) -> bytes:
    lines = ["\t".join(header)]
    lines.extend("\t".join(tsv_cell(value) for value in row) for row in rows)
    return ("\n".join(lines) + "\n").encode("utf-8")


@dataclass(frozen=True)
class ResultRow:
    relative: str
    submission_id: str
    envelope: dict[str, Any]

    @property
    def competition(self) -> str:
        return _required_string(self.envelope.get("competition"), "PROVENANCE")

    @property
    def puzzle_type(self) -> str:
        return _required_string(self.envelope.get("puzzle_type"), "PROVENANCE")

    @property
    def puzzle_id(self) -> int:
        return _required_integer(self.envelope.get("puzzle_id"), "PROVENANCE")

    @property
    def solution(self) -> dict[str, Any]:
        return _required_dict(self.envelope.get("solution"), "PROVENANCE")

    @property
    def solution_path(self) -> str:
        path = self.solution.get("path")
        if not isinstance(path, list) or not all(isinstance(move, str) for move in path):
            raise IndexBuildError("PROVENANCE")
        return ".".join(path)

    @property
    def solution_length(self) -> int:
        return _required_integer(self.solution.get("length"), "PROVENANCE")

    @property
    def solved_depth(self) -> int:
        return _required_integer(self.solution.get("solved_depth"), "PROVENANCE")

    @property
    def idempotency_key(self) -> str:
        return _required_string(self.envelope.get("idempotency_key"), "PROVENANCE")

    @property
    def submitted_at(self) -> str:
        return _required_string(self.envelope.get("submitted_at"), "PROVENANCE")

    @property
    def author(self) -> dict[str, Any]:
        return _required_dict(self.envelope.get("author"), "PROVENANCE")

    @property
    def author_name(self) -> str:
        return _required_string(self.author.get("name"), "PROVENANCE")

    @property
    def kaggle_username(self) -> str:
        value = self.author.get("kaggle_username", "")
        if not isinstance(value, str):
            raise IndexBuildError("PROVENANCE")
        return value

    @property
    def run_id(self) -> str:
        return _required_string(self.envelope.get("run_id"), "PROVENANCE")

    @property
    def orientation(self) -> dict[str, Any]:
        return _required_dict(self.envelope.get("orientation"), "PROVENANCE")

    @property
    def final_orientation(self) -> str:
        return _required_string(
            self.orientation.get("final_orientation"), "PROVENANCE"
        )

    @property
    def profile(self) -> dict[str, Any]:
        return _required_dict(self.envelope.get("profile"), "PROVENANCE")

    @property
    def model_class(self) -> str:
        return _required_string(self.profile.get("model_class"), "PROVENANCE")

    @property
    def model(self) -> dict[str, Any]:
        return _required_dict(self.envelope.get("model"), "PROVENANCE")

    @property
    def output_dim(self) -> int:
        manifest = _required_dict(self.model.get("manifest"), "PROVENANCE")
        return _required_integer(manifest.get("output_dim"), "PROVENANCE")

    @property
    def model_sha256(self) -> str:
        return _required_string(self.model.get("sha256"), "PROVENANCE")

    @property
    def solver_commit(self) -> str:
        if self.envelope.get("schema_version") == 2:
            provenance = _required_dict(self.envelope.get("provenance"), "PROVENANCE")
            return _required_string(provenance.get("solver_commit"), "PROVENANCE")
        return _required_string(self.envelope.get("solver_commit"), "PROVENANCE")

    @property
    def runtime(self) -> dict[str, Any]:
        return _required_dict(self.envelope.get("runtime"), "PROVENANCE")

    @property
    def hardware(self) -> dict[str, Any]:
        return _required_dict(self.envelope.get("hardware"), "PROVENANCE")

    @property
    def timings(self) -> dict[str, Any]:
        return _required_dict(self.envelope.get("timings"), "PROVENANCE")

    @property
    def manifest(self) -> dict[str, Any]:
        return _required_dict(self.model.get("manifest"), "PROVENANCE")

    @property
    def model_filename(self) -> str:
        return _required_string(self.model.get("filename"), "PROVENANCE")

    @property
    def model_id(self) -> str:
        return f"{self.model_filename}@{self.model_sha256[:12]}"

    @property
    def gpu_names(self) -> str:
        names = self.hardware.get("gpu_names")
        if not isinstance(names, list) or not names or not all(isinstance(name, str) and name for name in names):
            raise IndexBuildError("PROVENANCE")
        return "|".join(names)

    @property
    def producer_url(self) -> str:
        kaggle = self.envelope.get("kaggle")
        if kaggle is None:
            return ""
        return _required_string(_required_dict(kaggle, "PROVENANCE").get("run_url"), "PROVENANCE")

    def wide_tuple(self) -> tuple[Any, ...]:
        profile = self.profile
        runtime = self.runtime
        hardware = self.hardware
        timings = self.timings
        solution = self.solution
        manifest = self.manifest
        return (
            self.puzzle_id,
            self.solution_length,
            self.solution_path,
            _required_integer(profile.get("effective_beam"), "PROVENANCE"),
            self.final_orientation,
            _required_integer(runtime.get("touch_bfs_radius"), "PROVENANCE"),
            self.model_class,
            self.author_name,
            self.submitted_at,
            self.competition,
            self.puzzle_type,
            _required_integer(profile.get("requested_beam"), "PROVENANCE"),
            _required_integer(profile.get("alignment_delta"), "PROVENANCE"),
            _required_string(runtime.get("solution_mode"), "PROVENANCE"),
            _required_string(solution.get("collection_status"), "PROVENANCE"),
            _optional_integer(solution.get("collection_index"), "PROVENANCE"),
            self.solved_depth,
            _optional_integer(solution.get("touch_depth"), "PROVENANCE"),
            _required_integer(runtime.get("max_depth"), "PROVENANCE"),
            _required_integer(runtime.get("max_collected_solutions"), "PROVENANCE"),
            self.model_id,
            self.model_filename,
            self.model_sha256,
            _required_string(self.model.get("format"), "PROVENANCE"),
            _required_string(manifest.get("dtype"), "PROVENANCE"),
            self.output_dim,
            _required_string(hardware.get("platform"), "PROVENANCE"),
            self.gpu_names,
            _required_integer(hardware.get("accelerator_count"), "PROVENANCE"),
            _required_integer(hardware.get("world_size"), "PROVENANCE"),
            _optional_integer(hardware.get("native_sm"), "PROVENANCE"),
            _optional_integer(hardware.get("vram_mib_per_gpu"), "PROVENANCE"),
            _required_integer(timings.get("solve_us"), "PROVENANCE"),
            _required_integer(timings.get("wall_us"), "PROVENANCE"),
            _required_string(profile.get("selected_profile") if self.envelope.get("schema_version") == 1 else profile.get("profile_evidence_id"), "PROVENANCE"),
            _required_integer(profile.get("profile_power"), "PROVENANCE"),
            _required_string(profile.get("evidence") if self.envelope.get("schema_version") == 1 else profile.get("profile_status"), "PROVENANCE"),
            self.run_id,
            self.submission_id,
            self.idempotency_key,
            self.solver_commit,
            self.producer_url,
            self.relative,
        )

    def index_tuple(self) -> tuple[Any, ...]:
        return self.wide_tuple()

    def primary_key(self) -> tuple[Any, ...]:
        return (
            self.competition,
            self.puzzle_type,
            self.puzzle_id,
            self.solution_length,
            self.submission_id,
            self.relative,
        )


def _decode_json(path: Path) -> Any:
    try:
        raw = path.read_text(encoding="utf-8")
        value = json.loads(
            raw,
            parse_constant=lambda _value: (_ for _ in ()).throw(
                ValueError("non-finite JSON number")
            ),
        )
    except (OSError, UnicodeDecodeError, json.JSONDecodeError, ValueError):
        raise IndexBuildError("JSON") from None
    if raw != canonical(value):
        raise IndexBuildError("RECORD_CANONICAL")
    return value


def _validate_path(relative: str, submission_id: str, envelope: dict[str, Any]) -> None:
    version = envelope.get("schema_version")
    pattern = RESULT_PATH if version == 1 else RESULT_PATH_V2 if version == 2 else re.compile(r"a^")
    match = pattern.fullmatch(relative)
    if not match or not UUID7.fullmatch(submission_id):
        raise IndexBuildError("PATH")
    groups = match.groups()
    if version == 1:
        competition, puzzle_type, puzzle_id, day, path_id = groups
        derived = (
            safe_segment(_required_string(envelope.get("competition"), "PROVENANCE")),
            safe_segment(_required_string(envelope.get("puzzle_type"), "PROVENANCE")),
            str(_required_integer(envelope.get("puzzle_id"), "PROVENANCE")),
            _required_string(envelope.get("submitted_at"), "PROVENANCE")[:10],
        )
        claimed = (competition, puzzle_type, puzzle_id, day)
    else:
        competition, puzzle_type, day, path_id = groups
        derived = (
            safe_segment(_required_string(envelope.get("competition"), "PROVENANCE")),
            safe_segment(_required_string(envelope.get("puzzle_type"), "PROVENANCE")),
            _required_string(envelope.get("submitted_at"), "PROVENANCE")[:10],
        )
        claimed = (competition, puzzle_type, day)
    if path_id != submission_id:
        raise IndexBuildError("PATH_UUID")
    try:
        datetime.strptime(day, "%Y-%m-%d")
    except ValueError:
        raise IndexBuildError("PATH_DAY") from None
    if derived != claimed:
        raise IndexBuildError("PATH_DERIVATION")

def _record_paths(
    results: Path,
    pattern: re.Pattern[str] = RESULT_PATH,
    relative_root: Path | None = None,
) -> list[Path]:
    if not results.exists():
        return []
    if not results.is_dir() or results.is_symlink():
        raise IndexBuildError("RESULTS_ROOT")
    output: list[Path] = []
    for path in results.rglob("*"):
        if path.is_symlink():
            raise IndexBuildError("RESULT_FILE")
        if path.is_dir():
            continue
        if not path.is_file():
            raise IndexBuildError("RESULT_FILE")
        relative = path.relative_to(relative_root or results.parent).as_posix()
        if not pattern.fullmatch(relative):
            raise IndexBuildError("RESULT_PATH")
        output.append(path)
    return sorted(output, key=lambda path: path.relative_to(results.parent).as_posix())


def load_rows(results: Path, native_results: Path | None = None) -> list[ResultRow]:
    rows: list[ResultRow] = []
    schema_root = Path(__file__).resolve().parents[1]
    seen_submission: set[str] = set()
    seen_idempotency: set[str] = set()
    paths = _record_paths(results)
    if native_results is not None:
        paths.extend(_record_paths(native_results, RESULT_PATH_V2, results.parent))
    for path in sorted(paths, key=lambda item: item.relative_to(results.parent).as_posix()):
        relative = path.relative_to(results.parent).as_posix()
        record = _decode_json(path)
        if (
            not isinstance(record, dict)
            or set(record) != {"submission_id", "envelope"}
            or not isinstance(record.get("submission_id"), str)
            or not isinstance(record.get("envelope"), dict)
        ):
            raise IndexBuildError("WRAPPER")
        submission_id = record["submission_id"]
        envelope = record["envelope"]
        _validate_path(relative, submission_id, envelope)
        row = ResultRow(relative, submission_id, envelope)
        # Force all indexed fields through their fail-closed type checks.
        row.index_tuple()
        try:
            validate_schema(envelope, load_schema(schema_root, envelope.get("schema_version")))
            validate_integrity(envelope)
        except RecordValidationError as exc:
            raise IndexBuildError(f"RECORD_{exc.code}") from None
        if submission_id in seen_submission:
            raise IndexBuildError("DUPLICATE_SUBMISSION")
        if row.idempotency_key in seen_idempotency:
            raise IndexBuildError("DUPLICATE_IDEMPOTENCY")
        seen_submission.add(submission_id)
        seen_idempotency.add(row.idempotency_key)
        rows.append(row)
    return sorted(rows, key=ResultRow.primary_key)


def _run_provenance(row: ResultRow) -> dict[str, Any]:
    common = {
        "author": row.author,
        "model": row.model,
        "hardware": row.hardware,
        "profile": row.profile,
        "solver_commit": row.solver_commit,
    }
    if row.envelope.get("schema_version") == 2:
        return {
            **common,
            "provenance": _required_dict(
                row.envelope.get("provenance"), "PROVENANCE"
            ),
        }
    return {
        **common,
        "kaggle": _required_dict(row.envelope.get("kaggle"), "PROVENANCE"),
    }


def _run_record(row: ResultRow) -> dict[str, Any]:
    proof = _required_dict(row.envelope.get("proof"), "PROVENANCE")
    proof_hashes = {}
    for key in (
        "initial_state_sha256",
        "central_state_sha256",
        "generators_sha256",
        "reached_state_sha256",
    ):
        proof_hashes[key] = _required_string(proof.get(key), "PROVENANCE")
    return {
        "client_submission_id": _required_string(
            row.envelope.get("client_submission_id"), "PROVENANCE"
        ),
        "competition": row.competition,
        "idempotency_key": row.idempotency_key,
        "orientation": row.orientation,
        "profile": row.profile,
        "proof_hashes": proof_hashes,
        "puzzle_id": row.puzzle_id,
        "puzzle_type": row.puzzle_type,
        "record_path": row.relative,
        "runtime": _required_dict(row.envelope.get("runtime"), "PROVENANCE"),
        "solution": row.solution,
        "submission_id": row.submission_id,
        "submitted_at": row.submitted_at,
        "timings": _required_dict(row.envelope.get("timings"), "PROVENANCE"),
    }


def _human_sort_key(row: ResultRow) -> tuple[Any, ...]:
    return (
        row.puzzle_id,
        row.solution_length,
        row.solved_depth,
        row.submission_id,
        row.relative,
    )


def _human_metadata(row: ResultRow) -> dict[str, Any]:
    return {
        "schema_version": row.envelope.get("schema_version"),
        "author": row.envelope.get("author"),
        "hardware": row.envelope.get("hardware"),
        "idempotency_key": row.idempotency_key,
        "kaggle": row.envelope.get("kaggle"),
        "provenance": row.envelope.get("provenance"),
        "model": row.envelope.get("model"),
        "orientation": row.envelope.get("orientation"),
        "profile": row.envelope.get("profile"),
        "proof": row.envelope.get("proof"),
        "record_path": row.relative,
        "run_id": row.run_id,
        "runtime": row.envelope.get("runtime"),
        "solution": row.solution,
        "solver_commit": row.solver_commit,
        "submission_id": row.submission_id,
        "submitted_at": row.submitted_at,
        "timings": row.envelope.get("timings"),
    }


def human_payloads(rows: list[ResultRow]) -> dict[str, bytes]:
    payloads: dict[str, bytes] = {}
    competitions: dict[str, list[ResultRow]] = {}
    for row in rows:
        competitions.setdefault(row.competition, []).append(row)
    for competition in sorted(competitions):
        competition_rows = sorted(competitions[competition], key=_human_sort_key)
        payloads[f"{competition}/index.tsv"] = tsv_payload(
            WIDE_HEADER, (row.wide_tuple() for row in competition_rows)
        )
        puzzles: dict[int, list[ResultRow]] = {}
        for row in competition_rows:
            puzzles.setdefault(row.puzzle_id, []).append(row)
        for puzzle_id in sorted(puzzles):
            puzzle_rows = sorted(puzzles[puzzle_id], key=_human_sort_key)
            winner = min(
                puzzle_rows,
                key=lambda row: (
                    row.solution_length,
                    row.solved_depth,
                    row.submission_id,
                    row.relative,
                ),
            )
            base = f"{competition}/puzzles/p{puzzle_id:04d}"
            payloads[f"{base}/solutions.tsv"] = tsv_payload(
                WIDE_HEADER, (row.wide_tuple() for row in puzzle_rows)
            )
            payloads[f"{base}/best_solution.tsv"] = tsv_payload(
                WIDE_HEADER, (winner.wide_tuple(),)
            )
            metadata = {
                "competition": competition,
                "puzzle_id": puzzle_id,
                "schema_version": 1,
                "solutions": [_human_metadata(row) for row in puzzle_rows],
            }
            payloads[f"{base}/metadata.json"] = (
                canonical(metadata) + "\n"
            ).encode("utf-8")
            summary = (
                f"# {competition} - Puzzle {puzzle_id}\n\n"
                f"Solutions: {len(puzzle_rows)}\n"
                f"Best length: {winner.solution_length}\n\n"
                "## Run facts\n\n"
                f"- Effective beam: `{winner.profile['effective_beam']}`\n"
                f"- Orientation: `{winner.final_orientation}`\n"
                f"- Touch radius: `{winner.runtime['touch_bfs_radius']}`\n"
                f"- Model: `{winner.model_id}`\n"
                f"- Model class: `{winner.model_class}`\n"
                f"- Author: `{winner.author_name}`\n"
                f"- Submitted at: `{winner.submitted_at}`\n\n"
                "## Best solution\n\n"
                "~~~text\n"
                f"{winner.solution_path}\n"
                "~~~\n\n"
                "[All solutions](solutions.tsv) | "
                "[Best solution](best_solution.tsv) | "
                "[Metadata](metadata.json)\n"
            )
            payloads[f"{base}/summary.md"] = summary.encode("utf-8")
    return payloads

def build_payloads(rows: list[ResultRow]) -> dict[str, bytes]:
    index_rows = [row.index_tuple() for row in rows]
    by_author_rows = [
        row.wide_tuple()
        for row in sorted(
            rows,
            key=lambda row: (
                row.author_name,
                row.run_id,
                row.competition,
                row.puzzle_type,
                row.puzzle_id,
                row.solution_length,
                row.submission_id,
                row.relative,
            ),
        )
    ]

    groups: dict[tuple[str, str, int], list[ResultRow]] = {}
    for row in rows:
        groups.setdefault(
            (row.competition, row.puzzle_type, row.puzzle_id), []
        ).append(row)
    best_rows = []
    for group_key in sorted(groups):
        candidates = groups[group_key]
        winner = min(
            candidates,
            key=lambda row: (
                row.solution_length,
                row.solved_depth,
                row.submission_id,
                row.relative,
            ),
        )
        best_rows.append(winner.wide_tuple())

    runs: dict[str, dict[str, Any]] = {}
    for row in rows:
        provenance = _run_provenance(row)
        current = runs.setdefault(
            row.run_id,
            {"provenance": provenance, "records": []},
        )
        if canonical(current["provenance"]) != canonical(provenance):
            raise IndexBuildError("RUN_CONFLICT")
        current["records"].append(_run_record(row))
    for run in runs.values():
        run["records"].sort(
            key=lambda record: (
                record["competition"],
                record["puzzle_type"],
                record["puzzle_id"],
                record["solution"]["length"],
                record["submission_id"],
                record["record_path"],
            )
        )

    payloads = {
        "index.tsv": tsv_payload(WIDE_HEADER, index_rows),
        "by_author.tsv": tsv_payload(WIDE_HEADER, by_author_rows),
        "best_solutions.tsv": tsv_payload(WIDE_HEADER, best_rows),
        "runs.json": (
            canonical({"schema_version": 1, "runs": runs}) + "\n"
        ).encode("utf-8"),
    }
    human = human_payloads(rows)
    payloads.update(human)
    payloads[HUMAN_MANIFEST] = (
        canonical({"schema_version": 1, "paths": sorted(human)}) + "\n"
    ).encode("utf-8")
    return payloads


def _old_human_paths(out: Path) -> set[str]:
    path = out / HUMAN_MANIFEST
    if not path.is_file():
        return set()
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        paths = value["paths"]
    except (KeyError, TypeError, ValueError, OSError):
        raise IndexBuildError("HUMAN_MANIFEST") from None
    if not isinstance(paths, list) or not all(isinstance(item, str) for item in paths):
        raise IndexBuildError("HUMAN_MANIFEST")
    for item in paths:
        candidate = Path(item)
        if candidate.is_absolute() or ".." in candidate.parts or candidate.as_posix() != item:
            raise IndexBuildError("HUMAN_MANIFEST")
    return set(paths)


def _discovered_human_paths(out: Path, expected: set[str]) -> set[str]:
    competitions = {Path(name).parts[0] for name in expected}
    discovered: set[str] = set()
    puzzle_names = {
        "solutions.tsv",
        "best_solution.tsv",
        "metadata.json",
        "summary.md",
    }
    for competition in competitions:
        competition_root = out / competition
        index = competition_root / "index.tsv"
        if index.is_file():
            discovered.add(index.relative_to(out).as_posix())
        puzzles = competition_root / "puzzles"
        if not puzzles.is_dir():
            continue
        for puzzle in puzzles.iterdir():
            if not puzzle.is_dir() or not re.fullmatch(r"p[0-9]{4,}", puzzle.name):
                continue
            for name in puzzle_names:
                candidate = puzzle / name
                if candidate.is_file():
                    discovered.add(candidate.relative_to(out).as_posix())
    return discovered

def build(results: Path, out: Path) -> None:
    payloads = build_payloads(load_rows(results, out / "v2" / "slurm"))
    old_human_paths = _old_human_paths(out)
    new_human_paths = set(
        json.loads(payloads[HUMAN_MANIFEST])["paths"]
    )
    old_human_paths.update(_discovered_human_paths(out, new_human_paths))
    out.mkdir(parents=True, exist_ok=True)
    temporary: list[tuple[Path, Path]] = []
    try:
        for name, payload in sorted(payloads.items()):
            destination = out / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            temp = destination.with_name(f".{destination.name}.tmp")
            temp.write_bytes(payload)
            temporary.append((temp, destination))
        for temp, destination in temporary:
            temp.replace(destination)
        for name in sorted(old_human_paths - new_human_paths, reverse=True):
            stale = out / name
            stale.unlink(missing_ok=True)
            parent = stale.parent
            while parent != out:
                try:
                    parent.rmdir()
                except OSError:
                    break
                parent = parent.parent
    finally:
        for temp, _destination in temporary:
            temp.unlink(missing_ok=True)

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--results", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        build(args.results.resolve(), args.out.resolve())
    except IndexBuildError as exc:
        raise SystemExit(f"INDEX_ERROR {exc}") from None


if __name__ == "__main__":
    main()

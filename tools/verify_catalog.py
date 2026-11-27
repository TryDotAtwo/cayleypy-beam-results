"""Full semantic audit followed by a warm deterministic catalog check."""
import os
from pathlib import Path
import tempfile
import time

from tools.validate_result import validate_range, diff_changes, ValidationError, RESULT_PATH, RESULT_PATH_V2
from tools.build_indexes import build
from tools.validate_external_publication import PATH as EXTERNAL_BATCH_PATH, validate_batch


def validate_source_changes(root: Path, base: str, head: str = "HEAD") -> None:
    """Source PRs may edit code, but cannot rewrite accepted raw results."""
    for status, relative in diff_changes(root, base, head):
        if relative.startswith(("results/", "data/v2/slurm/")) and (
            status != "A" or not (RESULT_PATH.fullmatch(relative) or RESULT_PATH_V2.fullmatch(relative))
        ):
            raise ValidationError("DIFF_APPEND_ONLY", f"{status}:{relative}")
        if relative.startswith("external-solutions/accepted/"):
            if status != "A" or not EXTERNAL_BATCH_PATH.fullmatch(relative):
                raise ValidationError("EXTERNAL_APPEND_ONLY", relative)
            from tools.validate_result import git
            mode = git(root, "ls-tree", head, "--", relative).split()
            if not mode or mode[0] != "100644":
                raise ValidationError("EXTERNAL_MODE", relative)
            validate_batch(relative, git(root, "show", f"{head}:{relative}", text=False))
        if relative == "data/.validation-cache.json":
            raise ValidationError("SOURCE_RECEIPT_EDIT", relative)


def main():
    root = Path.cwd()
    base = os.environ.get("PUBLICATION_REVIEW_BASE")
    if base:
        validate_source_changes(root, base)
    with tempfile.TemporaryDirectory() as directory:
        temporary = Path(directory)
        # Never trust the candidate's validation receipt during source review.
        os.environ["CAYLEYPY_VALIDATION_CACHE"] = str(temporary / "receipt.json")
        start = time.monotonic()
        validate_range(root, "HEAD", "HEAD")
        print(f"FULL_AUDIT_SECONDS={time.monotonic() - start:.3f}", flush=True)
        start = time.monotonic()
        build(root / "results", temporary / "catalog", root / "data/v2/slurm")
        for generated in (temporary / "catalog").rglob("*"):
            if generated.is_file() and generated.name != ".validation-cache.json":
                relative = generated.relative_to(temporary / "catalog")
                if generated.read_bytes() != (root / "data" / relative).read_bytes():
                    raise SystemExit(f"Catalog differs: {relative}")
        print(f"WARM_CATALOG_SECONDS={time.monotonic() - start:.3f}", flush=True)


if __name__ == "__main__":
    main()

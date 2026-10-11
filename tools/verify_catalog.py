"""Full semantic audit followed by a warm deterministic catalog check."""
import os
from pathlib import Path
import tempfile
import time

from tools.validate_result import validate_range
from tools.build_indexes import build


def main():
    root = Path.cwd()
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

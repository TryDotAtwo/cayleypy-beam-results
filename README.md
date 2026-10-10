# CayleyPy Beam Results

Browse recorded solutions by puzzle and instance. No installation is needed.

| Puzzle | Browse instances | All solutions |
|---|---|---|
| Cube 4×4×4 | [Instances](data/cayley-py-444-cube/README.md) | [TSV](data/cayley-py-444-cube/index.tsv) |
| Cube 5×5×5 | [Instances](data/cayley-py-555-cube/README.md) | [TSV](data/cayley-py-555-cube/index.tsv) |
| Megaminx | [Instances](data/cayley-py-megaminx/README.md) | [TSV](data/cayley-py-megaminx/index.tsv) |
| Professor Tetraminx | [Instances](data/cayley-py-professor-tetraminx-solve-optimally/README.md) | [TSV](data/cayley-py-professor-tetraminx-solve-optimally/index.tsv) |
| IHES Cube | [Instances](data/cayleypy-ihes-cube/README.md) | [TSV](data/cayleypy-ihes-cube/index.tsv) |

Open **Instances**, choose an index, and view the best recorded move sequence, its beam, model and author. **All solutions** shows every submitted result, not only the shortest one. Recorded best lengths are not claims of optimality. Different competitions use their own instance numbering and move conventions.

[Complete catalog, including test examples](data/README.md) · [Global table](data/index.tsv) · [Best solutions](data/best_solutions.tsv) · [By author](data/by_author.tsv)

Existing TSV/JSON files and per-instance `summary.md`, `solutions.tsv`, `best_solution.tsv` and `metadata.json` keep their original paths. Legacy result folders also remain available.

## Submit your solutions

[Submission guide](PUBLISH_RESULTS.md): use the standalone Python CLI or the Codex publisher plugin. Both are available on `main`; no separate branch is needed.

## Data and publication

Immutable source records live under `results/v1/` and `data/v2/slurm/`. Tables and browsing pages are deterministically generated from them. Author fields are producer claims, not verified identities.

[Publication/validation protocol](docs/PUBLICATION.md) · [Schemas](schemas/) · [Index builder](tools/build_indexes.py)

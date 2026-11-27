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

- [ML beam-search runs](PUBLISH_RESULTS.md#ml-beam-search): use the Python CLI or Codex publisher plugin to publish to this repository.
- [External solutions](PUBLISH_RESULTS.md#external-solutions): upload verified paths from exact enumeration, BFS, algebraic methods, and other sources to the Cloudflare API. [Browse all 15,311 external Cube555 solutions on GitHub](external-solutions/cayley-py-555-cube/cube555-kaggle-v1/). These TSV files are separate from the ML catalog.

## Data and publication

Immutable source records live under `results/v1/` and `data/v2/slurm/`. Tables and browsing pages are deterministically generated from them. Author fields are producer claims, not verified identities.

[Publication/validation protocol](docs/PUBLICATION.md) · [Schemas](schemas/) · [Index builder](tools/build_indexes.py)

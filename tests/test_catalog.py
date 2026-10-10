from pathlib import Path
import re
from tools.build_indexes import build_payloads, load_rows

ROOT = Path(__file__).resolve().parents[1]

def test_catalog_links_and_every_instance():
    # Use existing fixture helpers to exercise multiple records deterministically.
    import importlib.util
    spec = importlib.util.spec_from_file_location('fixtures_builder', ROOT/'tests/test_build_indexes.py')
    fixture = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(fixture)
    from tempfile import TemporaryDirectory
    with TemporaryDirectory(dir=ROOT.parent/'test_results') as temp:
        root = Path(temp)
        fixture.put(root, fixture.record())
        rows = load_rows(root/'results', root/'native')
        payloads = build_payloads(rows)
        catalog = payloads['README.md'].decode()
        for row in rows:
            family = payloads[f'{row.competition}/README.md'].decode()
            assert f'p{row.puzzle_id:04d}/summary.md' in family
            assert f'{row.competition}/README.md' in catalog
        for relative in re.findall(r'\]\(([^)]+)\)', catalog):
            assert relative in payloads

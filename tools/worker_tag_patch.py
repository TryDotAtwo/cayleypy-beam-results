"""Migrate only GitHubWriter's API routes in an existing bundled Worker.

Runtime settings, resources and secret bindings must be preserved by the uploader.
This helper deliberately does not build or deploy an older source checkout.
"""
import argparse
from pathlib import Path

def patch(body: bytes) -> bytes:
    pairs = ((b'/git/ref/heads/', b'/git/ref/tags/'),
             (b'/git/refs/heads/', b'/git/refs/tags/'))
    for old, new in pairs:
        if body.count(old) != 1 or new in body:
            raise ValueError('Expected exactly one unmodified writer route of each kind')
    for old, new in pairs:
        body = body.replace(old, new)
    return body

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    args.output.write_bytes(patch(args.input.read_bytes()))

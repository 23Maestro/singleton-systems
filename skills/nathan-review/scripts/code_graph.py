"""Build a small code-only Graphify scope with source hashes and coverage."""
import argparse
import hashlib
import json
from pathlib import Path

from graphify.extract import extract
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.export import to_json


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('files', nargs='+')
    args = parser.parse_args()
    root, out = args.root.resolve(), args.out.resolve()
    volume = Path('/Volumes/HomeSSD')
    if not volume.is_mount() or not out.is_relative_to(volume):
        parser.error('Use a mounted HomeSSD output path checked by the storage gate.')
    allowed = {'.py', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.sql'}
    paths = []
    for name in args.files:
        path = (root / name).resolve()
        if not path.is_relative_to(root) or not path.is_file() or path.suffix not in allowed:
            parser.error(f'Not a scoped code, schema, or config file: {name}')
        if any(part.startswith('.env') for part in path.parts):
            parser.error('Do not index secrets.')
        paths.append(path)
    paths = sorted(set(paths))
    out.mkdir(parents=True, exist_ok=True)
    result = extract(paths, cache_root=out, root=root, parallel=False)
    graph = build_from_json(result, root=str(root), directed=True)
    if not graph.number_of_nodes():
        raise SystemExit('No nodes found; existing output was kept.')
    communities = cluster(graph)
    if to_json(graph, communities, str(out / 'graph.json')) is False:
        raise SystemExit('Graphify refused a smaller graph; review the scope change.')
    seen = {n.get('source_file') for n in result['nodes']}
    manifest = {
        'root': str(root),
        'sources': {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths},
        'withoutNodes': [str(p.relative_to(root)) for p in paths if str(p.relative_to(root)) not in seen and str(p) not in seen],
        'nodes': graph.number_of_nodes(), 'edges': graph.number_of_edges(),
        'cohesion': score_all(graph, communities),
        'llmInputTokens': 0, 'llmOutputTokens': 0,
    }
    temporary = out / 'source-manifest.json.tmp'
    temporary.write_text(json.dumps(manifest, indent=2) + '\n')
    temporary.replace(out / 'source-manifest.json')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    main()

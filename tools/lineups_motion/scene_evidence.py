"""Delivery reconciliation uses the same measured-scene gate as the tool hook."""
import importlib.util
import json
import sys
from pathlib import Path


def main():
    source = Path(__file__).resolve().parents[2] / '.codex/hooks/lineups_enforcement.py'
    spec = importlib.util.spec_from_file_location('lineups_enforcement', source)
    hook = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(hook)
    request = json.load(sys.stdin)
    hook.validate_figma_stage(request['manifest'], request['evidence'], Path(request['receiptDirectory']))
    print(json.dumps({'status': 'passed'}))


if __name__ == '__main__':
    main()

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
    from .contract_gate import check_production
    check_production(Path(request.get('root', Path(__file__).resolve().parents[2])), request['manifest'], 'after-build',
                     readback=request['evidence'].get('sceneReadback', {}).get('contractMeasurement'),
                     require_readback=True)
    hook.validate_figma_stage(request['manifest'], request['evidence'], Path(request['receiptDirectory']))
    print(json.dumps({'status': 'passed'}))


if __name__ == '__main__':
    main()

"""Run existing offline parser tests without changing the archived checkout."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import importlib.util
import io
import json
import sys
import unittest

BASE=Path(__file__).resolve().parent
REPO=Path(json.loads((BASE/'review.source.json').read_text())['source_repo'])
ROOT=REPO/'npid-api-layer'
sys.path.insert(0,str(ROOT))
FILES=['test_sales_stage_parser.py','test_head_scout_slots.py',
       'test_scout_prep_resolve.py','test_prospect_id_owners.py']
suite=unittest.TestSuite()
for name in FILES:
    spec=importlib.util.spec_from_file_location(Path(name).stem,ROOT/name)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    suite.addTests(unittest.defaultTestLoader.loadTestsFromModule(module))
    for key,fn in vars(module).items():
        if key.startswith('test_') and callable(fn):
            suite.addTest(unittest.FunctionTestCase(fn))
result=unittest.TextTestRunner(stream=io.StringIO(),verbosity=1).run(suite)
receipt={
 'verified_at':datetime.now(timezone.utc).isoformat(),
 'runner':'Existing tests; Python unittest in a temporary uv dependency environment; bytecode disabled.',
 'scope':'Offline parser fixtures and owner configuration; no network requests or live writes.',
 'configuration':'Current demo owner configuration; selectolax 0.3.34 matches the imported pre-1.0 parser API.',
 'tests':result.testsRun,'passed':result.testsRun-len(result.failures)-len(result.errors)-len(result.skipped),
 'failures':len(result.failures),'errors':len(result.errors),'skipped':len(result.skipped),
 'files':[{'path':'npid-api-layer/'+n,'sha256':hashlib.sha256((ROOT/n).read_bytes()).hexdigest()} for n in FILES],
 'failure_test_names':[str(t) for t,_ in result.failures+result.errors],
 'setup_notes':'First attempts exposed missing dependencies, the selectolax 1.0 API break, and incompatible original-owner fixtures. The recorded result uses the compatible parser dependency and current checked-out configuration.'}
(BASE/'python-test-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k!='files'},indent=2))
sys.exit(0 if result.wasSuccessful() else 1)

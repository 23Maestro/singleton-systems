# ScrapeCreators access

Use [the request script](scripts/request.py) for public source reads.
It reads `SCRAPECREATORS_API_KEY`, then the saved Keychain item
`com.singleton-systems.scrapecreators`, account `singleton23`.
The key stays inside the request. The script sends no automatic retries.

```bash
python3 tools/scrapecreators/scripts/request.py /v1/youtube/channel \
  --param handle=HouseofValentina
```

Read the live endpoint spec before each new endpoint. Pass each query field
with `--param NAME=VALUE`. Quote values that contain shell symbols.
Redirect stdout to the task's approved reference folder when a saved result
is needed. The script prints JSON on success and exits with an error on failure.

The installed `scrapecreators-api` skill links its script to this source.
The fitness source tool imports this same client.

Run the access checks:

```bash
python3 -m unittest discover -s tools/scrapecreators/scripts -p 'test_*.py'
```

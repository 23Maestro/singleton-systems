# API key intake

Both capture routes write to `~/Library/Keychains/login.keychain-db`.

- Mac: Raycast **Save API Key**, under **Singleton Systems**. Its launcher is linked into the existing `~/Documents/Development/Scripts` folder. The native form masks the value.
- iPhone: **S.System Save API Key**, installed in Apple Shortcuts. It uses **Run Script Over SSH** to reach `singleton23@100.99.124.26` through Tailscale. Termius is optional. The iPhone SSH key is authorized with a forced saver command. A phone retry remains pending after repairing SSH Keychain access.

The Mac must be online, with Remote Login enabled and the login Keychain unlocked. Authorize the iPhone's Shortcuts SSH public key once. Use a dedicated `authorized_keys` entry with `restrict` and a forced command pointing to the helper's `--stdin` mode. That key should only submit capture requests. Verify the Mac's SSH host fingerprint during the first connection.

The helper accepts runtime JSON through stdin. It returns status and storage metadata, never the value. It passes password bytes to Apple's `security -i` through a private pipe; child output is discarded. New entries trust `/usr/bin/security`, matching the existing CLI workflow. Updating an existing entry does not supply a new access list.

SSH sessions have a separate Keychain security session. Remote requests pass through a private Unix socket to LaunchAgent `com.singleton-systems.api-key-intake`, which runs in the desktop login session. The socket has mode `600` inside the helper's mode `700` directory. The agent has no network listener, stores no request files, and writes no logs. It starts at Mac login.

Known names retain their existing service/account pair:

| Capture name | Keychain service | Account |
| --- | --- | --- |
| SCRAPECREATORS_API_KEY | com.singleton-systems.scrapecreators | singleton23 |
| BRAVE_SEARCH_API_KEY | singleton-systems.brave-search-api | codex |
| SERPAPI_API_KEY | singleton-systems.serpapi-api | codex |
| CALCOM_API_KEY | singleton-systems.calcom-api | codex |
| UPWORK_CLIENT_ID | com.singleton-systems.upwork.oauth.client-id | singleton-systems |
| UPWORK_CLIENT_SECRET | com.singleton-systems.upwork.oauth.client-secret | singleton-systems |

Other names use service `com.singleton-systems.api-keys.<name>` and account `singleton23`. These names are case-sensitive. Names allow letters, digits, dots, hyphens and underscores, starting with a letter, up to 128 characters. Values allow up to 1,536 UTF-8 bytes, keeping the CLI command below Apple's interactive line limit.

Run `bash tools/api-key-intake/install.sh` to rebuild the local helper. Run `build-shortcut.py` with Python 3.10+ to regenerate the source XML. Validate and sign it with Shortcuts Playground before import.

Verified with disposable values: save, CLI readback, duplicate protection, explicit replacement, quote/backslash/newline preservation, fragmented stdin, and the maximum name/value sizes. An actual SSH session also passed save, Mac login Keychain readback, duplicate protection and replacement through the login agent. Test entries were removed. The phone shortcut passed iOS validation and signing; its SSH input wiring was checked in the Shortcuts editor.

#!/usr/bin/env python3
"""Route Unreal data and run native editor scripts without a paid bridge."""
import argparse
import json
import os
from pathlib import Path
import plistlib
import re
import subprocess
import sys
import tempfile
import time


def repository(explicit=None):
    roots = [Path(explicit)] if explicit else [Path.cwd(), Path(__file__).resolve()]
    for start in roots:
        for root in [start, *start.parents]:
            if (root / "scripts/developer-storage/storage-gate.mjs").is_file():
                return root.resolve()
    raise ValueError("Run from Singleton Systems or pass --repo-root.")


def client_name(value):
    name = re.sub(r"[^A-Z0-9]+", "_", value.strip().upper()).strip("_")
    if not name:
        raise ValueError("A named client is required.")
    return name


def within(candidate, root):
    try:
        candidate.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def runtime_volume(root):
    config = json.loads((root / "config/unreal/storage.json").read_text())
    mount = Path(config["mountPoint"])
    result = subprocess.run(["diskutil", "info", "-plist", str(mount)],
                            capture_output=True, check=True)
    info = plistlib.loads(result.stdout)
    if (info.get("VolumeUUID", "").upper() != config["volumeUuid"].upper()
            or info.get("MountPoint") != str(mount)
            or info.get("FilesystemName") != "APFS"
            or info.get("Internal") is not False):
        raise ValueError("The registered external, case-insensitive APFS volume is not mounted.")
    if mount.is_symlink() or not os.path.ismount(mount):
        raise ValueError("Unreal storage must be a mounted volume, not a fallback folder.")
    free = os.statvfs(mount)
    if free.f_bavail * free.f_frsize < config["minimumFreeGiB"] * 1024**3:
        raise ValueError("UnrealSSD needs at least 50 GiB free. No internal fallback is allowed.")
    with tempfile.TemporaryDirectory(prefix=".unreal-route-check-", dir=mount) as directory:
        test = Path(directory) / "CaseProbe"
        test.write_bytes(b"Unreal storage probe")
        alias = test.with_name("caseprobe")
        if not alias.exists() or not os.path.samefile(test, alias):
            raise ValueError("Unreal on Mac requires a case-insensitive filesystem.")
    source_root = mount / config["sourceRoot"]
    if not within(source_root, mount):
        raise ValueError("Unreal storage resolves outside the registered volume.")
    return source_root


def route(root, client, kind):
    shared = kind in {"engines", "samples", "downloads", "ddc", "zen"}
    owner = "SINGLETON_SYSTEMS" if shared else client_name(client)
    media_kind = kind if kind in {"renders", "previews", "references"} else "source"
    if kind in {"renders", "previews", "references"}:
        result = subprocess.run(
            ["node", str(root / "scripts/developer-storage/storage-gate.mjs"),
             "route", "--client", owner, "--kind", media_kind],
            text=True, capture_output=True, check=True,
        )
        base = Path(result.stdout.strip()).resolve()
    else:
        volume_root = runtime_volume(root)
        base = volume_root / owner / media_kind
        if not within(base, volume_root):
            raise ValueError("Client storage resolves outside the registered volume.")
    suffix = {"ddc": "cache/ddc", "zen": "cache/zen"}.get(kind, kind)
    destination = base / "unreal"
    if kind not in {"renders", "previews", "references"}:
        destination /= suffix
    if not within(destination, base):
        raise ValueError("Destination resolves outside the verified route.")
    destination.mkdir(parents=True, exist_ok=True)
    return destination


def working_project(root, client, value):
    project = Path(value).expanduser().resolve(strict=True)
    home = route(root, client, "projects")
    if project.suffix != ".uproject" or not within(project, home):
        raise ValueError(f"Choose a .uproject working copy inside {home}.")
    return project


def configure(project):
    before = project.read_bytes()
    data = json.loads(before)
    plugins = data.setdefault("Plugins", [])
    for name in ("PythonScriptPlugin", "EditorScriptingUtilities"):
        matches = [p for p in plugins if p.get("Name") == name]
        if matches:
            for plugin in matches:
                plugin["Enabled"] = True
        else:
            plugins.append({"Name": name, "Enabled": True})
    after = (json.dumps(data, indent=2) + "\n").encode()
    if after == before:
        return {"changed": False, "project": str(project)}
    backup = project.with_name(project.name + f".before-agent-{time.time_ns()}")
    backup.write_bytes(before)
    with tempfile.NamedTemporaryFile(dir=project.parent, delete=False) as handle:
        handle.write(after)
        temporary = Path(handle.name)
    temporary.replace(project)
    return {"changed": True, "project": str(project), "backup": str(backup)}


def editor_binary(engine, allowed):
    candidate = Path(engine).expanduser().resolve(strict=True)
    if candidate.is_dir() and candidate.suffix != ".app":
        candidate /= "Engine/Binaries/Mac/UnrealEditor.app"
    if candidate.suffix == ".app":
        candidate /= "Contents/MacOS/UnrealEditor"
    candidate = candidate.resolve(strict=True)
    if not within(candidate, allowed) or not os.access(candidate, os.X_OK):
        raise ValueError(f"Choose an executable editor inside {allowed}.")
    return candidate


def launch_plan(root, client, project, engine, script):
    editor = editor_binary(engine, route(root, client, "engines"))
    script = Path(script).expanduser().resolve(strict=True)
    if script.suffix != ".py":
        raise ValueError("Choose a Python editor script.")
    configured = json.loads(project.read_text()).get("Plugins", [])
    for name in ("PythonScriptPlugin", "EditorScriptingUtilities"):
        if not any(p.get("Name") == name and p.get("Enabled") is True for p in configured):
            raise ValueError("Configure this working project before running scripts.")
    ddc, zen = route(root, client, "ddc"), route(root, client, "zen")
    receipts = route(root, client, "receipts")
    stamp = str(time.time_ns())
    log = receipts / f"editor-{stamp}.log"
    probe = receipts / f"probe-{stamp}.json"
    env = {"UE-LocalDataCachePath": str(ddc), "UE_LocalDataCachePath": str(ddc),
           "UE-ZenDataPath": str(zen), "UE_ZenDataPath": str(zen),
           "UNREAL_AGENT_PROBE_OUTPUT": str(probe)}
    command = [str(editor), str(project), f"-ExecutePythonScript={script}",
               f"-LocalDataCachePath={ddc}", f"-ZenDataPath={zen}",
               f"-abslog={log}", "-unattended", "-nosplash", "-stdout",
               "-FullStdOutLogOutput"]
    return command, env, log, probe


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root")
    sub = parser.add_subparsers(dest="command", required=True)
    kinds = ("engines", "samples", "projects", "ddc", "zen", "downloads",
             "renders", "previews", "references", "receipts")
    for name in ("route", "configure", "run"):
        command = sub.add_parser(name)
        command.add_argument("--client", required=True)
        if name == "route":
            command.add_argument("--kind", choices=kinds, required=True)
        else:
            command.add_argument("--project", required=True)
        if name == "run":
            command.add_argument("--engine", required=True)
            command.add_argument("--script", required=True)
            command.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    root = repository(args.repo_root)
    if args.command == "route":
        print(route(root, args.client, args.kind))
        return
    project = working_project(root, args.client, args.project)
    if args.command == "configure":
        print(json.dumps(configure(project)))
        return
    command, env, log, probe = launch_plan(root, args.client, project, args.engine, args.script)
    if args.dry_run:
        print(json.dumps({"command": command, "environment": env, "executed": False}))
        return
    with log.with_suffix(".console.log").open("w") as output:
        result = subprocess.run(command, env={**os.environ, **env}, stdin=subprocess.DEVNULL,
                                stdout=output, stderr=subprocess.STDOUT)
    print(json.dumps({"exitCode": result.returncode, "log": str(log),
                      "probe": str(probe) if probe.exists() else None}))
    sys.exit(result.returncode)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(2)

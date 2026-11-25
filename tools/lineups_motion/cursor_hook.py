"""Translate Cursor's native MCP hook events to the shared Lineups gate."""

import json
import re


PREFIX = "mcp__premiere_pro__"
TOOL_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_]*$")


def _json_object(value, label):
    if isinstance(value, str):
        value = json.loads(value)
    if value is None:
        value = {}
    if not isinstance(value, dict):
        raise ValueError(f"Cursor {label} must be an object")
    return value


def _is_premiere(envelope):
    server = str(envelope.get("mcp_server_name") or "").casefold()
    name = str(envelope.get("tool_name") or "").casefold()
    return "premiere" in server or "premiere_pro" in name or "premiere-pro" in name


def adapt_cursor_payload(envelope):
    """Return a shared-hook payload, or None for another MCP server."""
    if not _is_premiere(envelope):
        return None

    event = envelope.get("hook_event_name")
    events = {
        "beforeMCPExecution": "PreToolUse",
        "afterMCPExecution": "PostToolUse",
    }
    if event not in events:
        raise ValueError(f"Unsupported Cursor Premiere hook event: {event}")

    raw_name = str(envelope.get("tool_name") or "").strip()
    if raw_name.startswith("MCP:"):
        raw_name = raw_name[4:]
    if raw_name.startswith(PREFIX):
        tool_name = raw_name
    else:
        if "." in raw_name:
            raw_name = raw_name.rsplit(".", 1)[-1]
        if raw_name.startswith("premiere_pro__"):
            raw_name = raw_name[len("premiere_pro__"):]
        if not TOOL_RE.fullmatch(raw_name):
            raise ValueError("Cursor Premiere MCP call has no recognized catalog tool name")
        tool_name = PREFIX + raw_name

    payload = {
        "hook_event_name": events[event],
        "cwd": envelope.get("cwd") or next(iter(envelope.get("workspace_roots") or []), None),
        "tool_name": tool_name,
        "tool_input": _json_object(envelope.get("tool_input"), "tool_input"),
    }
    if event == "afterMCPExecution":
        response = envelope.get("result_json")
        if isinstance(response, str):
            try:
                response = json.loads(response)
            except json.JSONDecodeError:
                pass
        payload["tool_response"] = response
    return payload


def adapt_cursor_response(event, hook_stdout):
    """Translate Claude-style gate output to Cursor native hook output."""
    output = hook_stdout.strip()
    if not output:
        return {"permission": "allow"} if event == "beforeMCPExecution" else {}
    try:
        result = json.loads(output)
    except json.JSONDecodeError as error:
        if event == "beforeMCPExecution":
            return {"permission": "deny", "user_message": f"Lineups hook returned invalid JSON: {error}"}
        return {"additional_context": f"Lineups verification stopped: hook returned invalid JSON: {error}"}

    if event == "beforeMCPExecution":
        specific = result.get("hookSpecificOutput") or {}
        if specific.get("permissionDecision") == "deny":
            reason = specific.get("permissionDecisionReason") or "Lineups enforcement denied this Premiere call."
            return {"permission": "deny", "user_message": reason, "agent_message": reason}
        return {"permission": "allow"}

    specific = result.get("hookSpecificOutput") or {}
    context = specific.get("additionalContext")
    if context:
        return {"additional_context": context}
    if result.get("decision") == "block":
        return {"additional_context": result.get("reason") or "Lineups verification stopped progression."}
    return {}

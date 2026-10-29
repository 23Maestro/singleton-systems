"""Small loopback-only client for Epic's native Unreal MCP connection."""

import json
import urllib.request


class NativeClient:
    def __init__(self):
        self.url = "http://127.0.0.1:18180/mcp"
        self.headers = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
        self.counter = 0
        result = self.rpc("initialize", {"protocolVersion": "2025-11-25", "capabilities": {},
                                         "clientInfo": {"name": "Lineups-Unreal-Trial", "version": "1"}})
        self.headers["MCP-Protocol-Version"] = result["protocolVersion"]
        self.rpc("notifications/initialized", notification=True)

    def rpc(self, method, params=None, notification=False):
        self.counter += 1
        payload = {"jsonrpc": "2.0", "method": method}
        if not notification:
            payload["id"] = self.counter
        if params is not None:
            payload["params"] = params
        request = urllib.request.Request(self.url, json.dumps(payload).encode(),
                                         headers=self.headers, method="POST")
        with urllib.request.urlopen(request, timeout=60) as response:
            if response.headers.get("Mcp-Session-Id"):
                self.headers["Mcp-Session-Id"] = response.headers["Mcp-Session-Id"]
            body = response.read().decode()
        if not body:
            return {}
        if body.startswith(("event:", "data:")):
            body = [line[5:].strip() for line in body.splitlines() if line.startswith("data:")][-1]
        value = json.loads(body)
        if "error" in value:
            raise RuntimeError(value["error"])
        result = value.get("result", {})
        if result.get("isError"):
            raise RuntimeError(result)
        return result

    def call(self, toolset, tool, arguments=None):
        response = self.rpc("tools/call", {"name": "call_tool", "arguments": {
            "toolset_name": toolset, "tool_name": tool, "arguments": arguments or {}}})
        text = [item["text"] for item in response.get("content", []) if item.get("type") == "text"]
        if len(text) != 1:
            raise RuntimeError("Unreal returned no single tool result.")
        return json.loads(text[0])["returnValue"]

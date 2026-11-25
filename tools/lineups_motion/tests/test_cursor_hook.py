import unittest

from tools.lineups_motion.cursor_hook import adapt_cursor_payload, adapt_cursor_response


class CursorHookTests(unittest.TestCase):
    def test_before_mcp_maps_catalog_dispatcher(self):
        payload = adapt_cursor_payload({
            "hook_event_name": "beforeMCPExecution",
            "mcp_server_name": "premiere_pro",
            "tool_name": "invoke_tool",
            "tool_input": '{"name":"trim_clip","arguments":{"clipId":"clip"}}',
        })
        self.assertEqual(payload["hook_event_name"], "PreToolUse")
        self.assertEqual(payload["tool_name"], "mcp__premiere_pro__invoke_tool")
        self.assertEqual(payload["tool_input"], {"name": "trim_clip", "arguments": {"clipId": "clip"}})

    def test_namespaced_mcp_tool_name_is_not_prefixed_twice(self):
        payload = adapt_cursor_payload({
            "hook_event_name": "beforeMCPExecution",
            "mcp_server_name": "premiere_pro",
            "tool_name": "MCP:mcp__premiere_pro__invoke_tool",
            "tool_input": '{"name":"trim_clip","arguments":{}}',
        })
        self.assertEqual(payload["tool_name"], "mcp__premiere_pro__invoke_tool")

    def test_after_mcp_maps_result_and_dotted_tool_name(self):
        payload = adapt_cursor_payload({
            "hook_event_name": "afterMCPExecution",
            "mcp_server_name": "Adobe Premiere Pro MCP",
            "tool_name": "premiere_pro.get_full_sequence_info",
            "tool_input": "{}",
            "result_json": '{"success":true}',
        })
        self.assertEqual(payload["hook_event_name"], "PostToolUse")
        self.assertEqual(payload["tool_name"], "mcp__premiere_pro__get_full_sequence_info")
        self.assertEqual(payload["tool_response"], {"success": True})

    def test_non_premiere_mcp_is_ignored(self):
        self.assertIsNone(adapt_cursor_payload({
            "hook_event_name": "beforeMCPExecution",
            "mcp_server_name": "figma",
            "tool_name": "invoke_tool",
            "tool_input": "{}",
        }))

    def test_denial_and_post_context_translate_to_cursor_format(self):
        denied = adapt_cursor_response("beforeMCPExecution", '{"hookSpecificOutput":{"permissionDecision":"deny","permissionDecisionReason":"wrong sequence"}}')
        self.assertEqual(denied["permission"], "deny")
        self.assertIn("wrong sequence", denied["user_message"])
        post = adapt_cursor_response("afterMCPExecution", '{"decision":"block","reason":"readback failed"}')
        self.assertIn("readback failed", post["additional_context"])

    def test_bad_premiere_catalog_name_fails_closed(self):
        with self.assertRaises(ValueError):
            adapt_cursor_payload({
                "hook_event_name": "beforeMCPExecution",
                "mcp_server_name": "premiere_pro",
                "tool_name": "bad tool name!",
                "tool_input": "{}",
            })


if __name__ == "__main__":
    unittest.main()

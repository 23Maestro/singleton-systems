# Codex Remote recovery

Checked October 22, 2026. Activation is pending. Phone access is not yet verified.

Jerami approved waiting for the music task, then switching the server. He also
asked for ChatGPT to quit and reopen. `scripts/codex-remote-handover.py` performs
that 1-time change. It waits for all loaded SSH chats and goals to be idle,
checks desktop-owned chat history, and rechecks process identities. It quits
ChatGPT, replaces the old SSH server, and reopens ChatGPT. It never force-kills
a process or repeats a failed handover. It stops waiting after 2 hours.

The result is saved at
`~/.local/state/codex-remote-reliability/handover-status.json`.
`backend_recovered_mobile_unverified` means the new server passed its checks;
the phone still needs a real open/send/reopen test.

## What failed

The SSH server is running 0.160.0 outside the daemon manager. Its PID was 28234
at the check. Native logs show 230 file exhaustion errors in the last hour.
The server owns the YT.Careers chat. Phone Remote on this server is disabled.
The desktop backend owns a different set of chats. Those writers can block
the same chats on SSH or mobile.

The old daily check had instructions but no script. It now calls
`scripts/codex-remote-health.py` at 10:00 AM each day. The script only reads state.
Exit 2 means a fault or a gap needs attention. It never kills a process.

## Prepared fix

The official installer installed the complete 0.163.0 daemon package at
`~/.codex/packages/app-server-daemon/current`. It did not switch the live server.
The old standalone package remains available.

Managed 0.163.0 raises its file limit to 4,096, within the inherited hard limit.
The unmanaged startup path does not run that safeguard. This is a mitigation
for file exhaustion, not proof that every resource leak or writer bug is fixed.

Use 1 managed SSH backend for the chats used from both Mac and phone. Pair the
phone from the SSH host's connection settings. Opening a local desktop copy can
still claim a separate writer. Tailscale does not control that ownership.

## Activation gate

1. Finish or pause the active chats. At the check, this repair and
   “Add Music to Prayer Variants” were active. There were no active goals.
2. Run the health script again. Check the peer PID, start time, loaded chats,
   live status, goals and clients. Do not reuse the PID from this note.
3. Quit ChatGPT before replacing its server, so its old SSH bootstrap cannot
   respawn a competing backend. The script uses the native Remote API to turn
   off saved local registration. The managed daemon opts in on its own starts.
4. From an independent terminal, stop only the verified old SSH backend after
   approval for the disconnect. Do not kill the backend from its own chat.
   Never delete writer locks, history, or databases.
5. Start the prepared package with the supported daemon bootstrap command.
   Preserve `features.code_mode_host=true`. Set the daemon's documented
   `updater.autoUpdateEnabled` to false before startup so updates cannot restart
   client work. Review future updates during an idle maintenance window.
6. Reconnect the Mac to `codex-mobile`. Pair the phone through that host.
   Run the health script. Confirm managed 0.163.0 is running and Remote is
   connected. Confirm that the saved chats and handoffs still exist.
7. Open “Write Transition Cleanup Proposal” on the phone, send a test message,
   and reopen it on the Mac through the same SSH host. Only that test confirms
   the route works end to end.

If the old backend respawns, stop the handover and inspect its owner. Do not
repeat kills. If startup fails, keep the logs and saved package; restore the
old SSH connection only after checking that no new backend remains active.

## Evidence

- [OpenAI managed daemon startup and file limit](https://github.com/openai/codex/blob/rust-v0.163.0/codex-rs/app-server/src/managed_daemon.rs)
- [OpenAI daemon lifecycle and update rules](https://github.com/openai/codex/blob/rust-v0.163.0/codex-rs/app-server-daemon/README.md)
- [Competing desktop and SSH ownership, issue 52675](https://github.com/openai/codex/issues/52675)
- [Resource growth and network permission error, issue 48543](https://github.com/openai/codex/issues/48543)

No matching Development task was found in the Linear search for Codex, Remote,
or backend work. No unrelated task was changed.

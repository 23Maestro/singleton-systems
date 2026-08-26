---
name: catena-media-download
description: Use for Catena Media SharePoint folders shared to Jerami as an external Microsoft guest that must be opened in Chrome, authenticated interactively, downloaded in full, and verified locally.
---

# Catena Media Download

Download complete Catena Media delivery folders without pretending the external
guest flow has a stable API or reusable unattended login.

## Identity and trust boundary

- Catena Media shares arrive through Microsoft 365 external sharing.
- Prefer share messages from the named Catena collaborator. Confirm the sender,
  folder name, and destination host before opening the link.
- Expected SharePoint content is hosted under
  `catenaoperations-my.sharepoint.com`. Microsoft authentication may use
  `login.microsoftonline.com` and the Microsoft Authenticator app.
- Never store a password, one-time code, Authenticator number, guest-principal
  identifier, session token, or authentication screenshot in the repository,
  a skill, a command history, or a handoff.

## Workflow

1. Use the authenticated Google Workspace account to find the relevant Catena
   share messages. Record the sender, parent folder, specific folder names, and
   current share links. Do not hard-code share links into this skill.
2. Open the first specific folder in real Chrome with Computer Use. Reuse that
   authenticated Chrome session for the remaining folders.
3. Complete the Microsoft external-guest prompts in the order presented:
   - Retrieve only the current emailed one-time code when the page requests it.
   - If Microsoft shows Authenticator number matching, immediately tell Jerami
     the fresh number and wait for approval on his device.
   - If the number expires, retry the same method and relay the new number at
     once. Do not switch authentication methods unless Jerami asks.
   - A six-digit code shown inside Authenticator must be supplied by Jerami; do
     not infer, retain, or reuse it.
4. In each requested SharePoint folder, use the top-left **Select all rows**
   checkbox, then **Download**. Selecting one video is not a folder download.
5. When Chrome asks whether the Catena site may download multiple files, allow
   it only when the current request explicitly covers the complete folder.
   Retry the interrupted folder download after permission is granted.
6. Wait until no `.crdownload` remains. SharePoint normally creates a generic
   `OneDrive_...zip`; do not assume the archive name identifies its source.
7. Inspect each archive with `unzip -l`. Map archive path to Catena folder name,
   verify the internal file count and filenames, and confirm the archive is
   nonzero before reporting completion.

## Delivery boundary

Keep the downloaded archives and their internal filenames unchanged unless
Jerami requests organization or extraction. Do not delete earlier standalone
downloads, import into Eagle, create Lineups folders, or mutate Premiere as part
of this skill.

Return a short delivery envelope:

```text
source: sender and Catena SharePoint folder
archive: local archive path
contents: verified file count and key media filenames
authentication: completed or blocked; never include codes
next: the requested downstream action, if any
```

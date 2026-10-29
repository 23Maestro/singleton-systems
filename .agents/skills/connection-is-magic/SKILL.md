---
name: connection-is-magic
description: Prepare Connection Is Magic podcast upscales from a YouTube link or local episode file, starting with a 10-second non-AI 4K trial. Track this client's scope in Asana and keep batch work behind sample approval.
---

# Connection Is Magic

Use for this client's episode intake, 4K trial, and approved catalog work.
The client website is https://connectionismagic.com/.

## Client record

Asana's Content Editor project `1218890014545436` owns this client.
Section: Connection Is Magic (`1219796591434815`).
Read [Prepare 4K trial](https://app.asana.com/1/1216086803382161/project/1218890014545436/task/1219796489721523)
before resuming. Its children hold workflow setup, the sample, and batch scope.
Use current Asana facts over this intake snapshot.

- First deliverable: 1 10-second 4K trial, with a matching source clip.
- Samson wants natural faces. His Topaz test looked artificial to him.
- Backlog upscaling: proposed $50 per episode; count and order remain open.
- New episode editing: $30 per actual hour. The 7–8 hour estimate is $210–240.
  Time saved reduces actual hourly billing. Do not turn it into a fixed fee.
- The possible 50–100 episode backlog is not an approved batch.
- Samson also has 5 new recordings. New editing assignments are unconfirmed.

Descriptions hold deliverables, next actions, contacts, and source links.
Put investigation, benchmarks, commands, and progress history in task comments.
Use Asana HTML formatting and read back both description fields after a write.

## Source to sample

Read [the workflow](references/workflow.md) for checked commands and fallbacks.

1. Get the supplied episode URL or file. Use the requested test section, or
   choose a clear 10 seconds with a face and motion and record its timecode.
   Do not pick a random channel episode and call it the client's test.
2. Use the video-storage gate for `CONNECTION_IS_MAGIC` before media writes.
   Keep working downloads in `source`, trials in `previews`, and approved
   full exports in `renders`. Irreplaceable originals need a durable home.
3. Download an actual 1080p source with yt-dlp and FFmpeg, or use a client file.
   Verify the file. Do not label 360p/720p as the requested 1080p intake.
4. Start with the FaithTalk method: FFmpeg Lanczos scaling and light unsharp.
   VideoToolbox can encode on the Mac; this filter still scales in software.
   Describe the result as a non-AI upscale. It does not recover native 4K detail.
5. Keep the source frame rate, framing, and audio. Inspect faces, motion, text,
   and edges beside the matching source. Make a plain version if sharpening
   adds halos. Technical checks alone do not prove the look is approved.
6. Give Jerami the 10-second pair and measured runtime. Client delivery needs
   its own authorization. Do not start the backlog before Samson's approval.

## Batch readiness

After sample approval, confirm the episode list, final rate, deadlines, export
format, and approved look. Download and render 1 episode at a time. Keep an
archive of downloads and verified exports. Recheck disk space before each job.
Do not launch 50–100 jobs from the intake estimate.

yt-dlp has no paid episode allowance. YouTube can still throttle or block it.
Use bounded retries and a pause. Dropzone is a manual fallback using yt-dlp
too; it is not an independent cure for a YouTube block. The workflow documents
a separate client option and the direct-source route.

The current sample waits on a client source. Preparation or a
synthetic tool test does not satisfy that deliverable.

# Source to 4K workflow

Checked October 22, 2026. Resolve the canonical Singleton Systems repository as
`REPO_ROOT`; do not assume the caller's current directory is that repository.
Use the installed `yt-dlp`, `ffmpeg`, and `ffprobe`. Verify versions on use.

## Storage

Run the existing gate for each output type before writes:

```sh
CIM_SOURCE=$(node "$REPO_ROOT/scripts/developer-storage/storage-gate.mjs" route --client CONNECTION_IS_MAGIC --kind source)
CIM_PREVIEWS=$(node "$REPO_ROOT/scripts/developer-storage/storage-gate.mjs" route --client CONNECTION_IS_MAGIC --kind previews)
CIM_REFERENCES=$(node "$REPO_ROOT/scripts/developer-storage/storage-gate.mjs" route --client CONNECTION_IS_MAGIC --kind references)
```

It checks HomeSSD's expected UUID, write access, and 50 GiB free-space floor.
Stop on failure. No internal-disk fallback. Use fresh, episode-specific file
names; do not overwrite an existing trial. Keep reference metadata and logs
under the client reference path. Keep original client files in Eagle or MediaSSD
as well when they cannot be replaced from their source.

## Download

Set `EPISODE_URL` to the single client-supplied YouTube URL. This recipe ignores
personal yt-dlp config and refuses a playlist or a lower-resolution fallback.

```sh
yt-dlp --ignore-config --no-playlist --no-overwrites --continue \
  --no-cache-dir --concurrent-fragments 1 \
  --sleep-requests 1 --sleep-interval 10 --max-sleep-interval 20 \
  --retries 2 --fragment-retries 2 --socket-timeout 30 \
  --abort-on-unavailable-fragments \
  --download-archive "$CIM_REFERENCES/downloaded.txt" \
  -f 'bv[height=1080]+ba/b[height=1080]' --merge-output-format mkv \
  -P "$CIM_SOURCE" -o '%(id)s.%(ext)s' \
  --print 'after_move:filepath' "$EPISODE_URL"
```

An archive hit means the download was seen before. Find and verify that file;
do not assume an archive entry proves that the source or 4K export still exists.
Record video ID, URL, title, tool version, path, checksum, and acquisition time.
Use the returned path as `SOURCE`. Probe it before rendering:

```sh
ffprobe -v error -show_streams -show_format -of json "$SOURCE"
shasum -a 256 "$SOURCE"
```

The initial recipe is for progressive SDR 1920×1080, square pixels, 16:9, with
audio. Keep source fps. For HDR, interlace, rotation, or a different aspect ratio,
inspect the source and choose a matching treatment before the trial. Do not
stretch, crop, change fps, or convert HDR by accident.

On a 403, 429, sign-in, or token error, stop the queue and retain the error.
Do not retry indefinitely, rotate proxies, or silently export browser cookies.
Check the installed release and official yt-dlp guidance once before a bounded
retry. A new paid service, account access, or alternate tool needs Jerami's choice.

## Trial

Set `IN_SECONDS` to the approved timecode converted to seconds. Confirm at least
10 seconds remain. Set unique `SOURCE_TRIAL` and `UPSCALE_TRIAL` paths under
`CIM_PREVIEWS`. The first file is the 1080p comparison; the second is 3840×2160.

```sh
ffmpeg -hide_banner -loglevel error -n -ss "$IN_SECONDS" -i "$SOURCE" -t 10 \
  -map 0:v:0 -map 0:a:0 -c:v h264_videotoolbox -b:v 12M \
  -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart "$SOURCE_TRIAL"

ffmpeg -hide_banner -loglevel error -n -ss "$IN_SECONDS" -i "$SOURCE" -t 10 \
  -map 0:v:0 -map 0:a:0 \
  -vf 'scale=3840:2160:flags=lanczos,unsharp=5:5:0.35:5:5:0,setsar=1' \
  -c:v h264_videotoolbox -b:v 45M -pix_fmt yuv420p \
  -c:a aac -b:a 256k -movflags +faststart "$UPSCALE_TRIAL"
```

This filter comes from `scripts/faithtalk-outro-assemble.sh` in the canonical
repository, at the `shot` function and teaser scaling step. Reuse only the
scaling treatment. Do not bring over FaithTalk branding, timing, muted footage,
29.97 fps retiming, or its outro assembly.

VideoToolbox is the encoder in this recipe. Lanczos and unsharp run as ordinary
FFmpeg filters. If the encoder is unavailable, test `libx264 -crf 18 -preset slow`
on the same 10 seconds before choosing it; do not present untested hardware
encoding as the old FaithTalk render path.

Inspect each file with ffprobe and decode it fully:

```sh
ffprobe -v error -show_streams -show_format -of json "$UPSCALE_TRIAL"
ffmpeg -hide_banner -v error -i "$UPSCALE_TRIAL" -f null -
```

Check 3840×2160, source fps, 10 seconds within 1 source frame, audio presence,
sync, and clean decode. Compare normal-size playback and face/edge crops. Look
for halos, waxy skin, ringing, flicker, banding, and text damage. Do not claim
new detail or client approval from dimensions or a decode pass.

## Fallbacks

1. **Dropzone 4:** already installed. Use its YouTube Downloader manually and
   set the destination to the gated client `source` folder. The installed action
   imports `yt_dlp.YoutubeDL`; its fallback can choose below 1080p. Probe the
   result. It may help a local setup issue but can share YouTube's block.
2. **Client source file:** ask for the original export by their file-transfer
   service. This avoids the YouTube acquisition bottleneck. Use the same local
   trial recipe; do not require a re-download if a better original is supplied.
3. **JDownloader 2:** free alternate download manager, researched but not
   installed or client-tested. Use its official macOS download only after
   Jerami chooses this option. Its YouTube path needs FFmpeg for some formats.
   Verify 1080p plus audio and route files to the same client source path.

No downloader can promise that YouTube will never block it. YouTube Studio's
ordinary download can return 720p or 360p, so it is not the 1080p backup.
Client originals or Google Takeout exports are better candidates to inspect.

## Approved batch

Use the approved trial settings. Confirm a finite source list and batch size.
Process sequentially and record success only after verification. Keep pending
and failed episodes distinct. Re-run the storage gate per episode, and compare
free bytes with the expected download, output, and temporary-file sizes.

At a 45 Mb/s target, a 50-minute export is about 16.9 GB before small overhead.
Use measured trial bitrate to refine that estimate. The 50 GiB floor alone does
not prove space for 100 episodes. Never delete active files to make a job fit.
Download, render, verification, and hands-on time should be measured separately.
The call's 2–3 hour estimate has not been benchmarked on a real episode.

## Evidence and sources

Firecrawl receipts live under
`/Volumes/HomeSSD/Generated/CONNECTION_IS_MAGIC/references`.
Receipts retain source URLs and hashes. The yt-dlp, Aptonic blog, and client bio
checks passed. The JDownloader support page returned 401 to Firecrawl; its
official download page and support page were readable through web research.

- [yt-dlp usage and flags](https://github.com/yt-dlp/yt-dlp)
- [YouTube extraction and throttling](https://github.com/yt-dlp/yt-dlp/wiki/Extractors)
- [FFmpeg scaling filters](https://ffmpeg.org/ffmpeg-filters.html#scale)
- [Aptonic blog](https://aptonic.com/blog/)
- [JDownloader official download](https://jdownloader.org/download/index)
- [JDownloader and FFmpeg](https://support.jdownloader.org/en/knowledgebase/article/ffmpeg-installation-and-troubleshooting)
- [YouTube's own download limits](https://support.google.com/youtube/answer/56100)

#!/usr/bin/env bash
# Assemble the FaithTalk outro (variants A and B) at 4K 29.97 from the Figma black/white passes.
# Usage: scripts/faithtalk-outro-assemble.sh [--list-inputs]
#   TEASER=<clip>          Next Week teaser at 29.97 (picture + audio); default: Despair to Revelation v2 (no jump cut)
#   REV=r7                 output version (renders/outro-$REV/faithtalk-outro-$REV-{A,B}-4k.mov)
#   PRAYER_CLOSE=... PRAYER_CLOSE_IN=s PRAYER_WIDE=... PRAYER_WIDE_IN=s [PRAYER_CUT=120]   episode angles under Prayer
# Picture (frames @ 30000/1001):
#   seed 120 | connect 408 | story 410 | prayer 241 | next week 75 held first frame + teaser | 15 fade to black | logo close 149
# 2026-10-01: new VO read (myfaithtalktv.com URLs), Story 410 frames, VO stem faithtalk-outro-vo-r5.wav.
# r7: teaser v2 (374 frames, 30 fps retimed to 29.97).
# Key: out = black + (white - black) * background. Backgrounds are stretched to fill each scene (no freeze frames).
# Audio: VO + teaser voice (from its first frame at frame 1225, just after "...on Faith Talk") duck the music bed,
#        music ends on its own fade; Logo.wav hit lands on the emblem's arrival. Static gain to -24 LKFS, TP <= -2 dBTP.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
P=${FAITHTALK_PROJECT:-/Users/singleton23/Documents/Development/singleton-systems/videos/faithtalk-drawn-seed-preview}
G=${FAITHTALK_MEDIA:-/Volumes/HomeSSD/Generated/FAITHTALK}
cd "$P"
R=$G/renders/outro-r3-passes; T=$G/renders/outro-r5-build; REV=${REV:-r7}; OUT=$G/renders/outro-$REV
TEASER=${TEASER:-$G/source/teaser-despair-to-revelation-v2.mov}
VO=$G/audio/faithtalk-outro-vo-r5.wav
MUSIC=assets/audio/outro-new-dawn-v4-remastered.wav
LOGO_SFX=$G/audio/logo-close-sfx.wav
LOGO_CLOSE=$G/renders/outro-r5/logo-close-on-black.mp4
if [[ "${1:-}" == "--list-inputs" ]]; then   # used by faithtalk-media-links-check.py
  for s in connect storyA storyB prayerA prayerB nextweek; do echo "$R/black/$s.mov"; echo "$R/white/$s.mov"; done
  printf '%s\n' "$G/renders/outro-r2-connect-seed.mp4" "$G/renders/outro-r2-connect-soil-push-4k.mp4" \
    assets/outro-backgrounds/02-story-intro-scene2-field.mp4 assets/outro-backgrounds/03-prayer-intro-scene3-misty-warm.mp4 \
    "$TEASER" "$VO" "$MUSIC" "$LOGO_SFX" "$LOGO_CLOSE"
  exit 0
fi
FPS=30000/1001; PR="-c:v prores_ks -profile:v 3 -pix_fmt yuv422p10le"
NW_HOLD=75; TEASER_START=1254; FADE=15; CLOSE=149
python3 "$HERE/faithtalk_storage.py" "$T" "$OUT"
mkdir -p $T $OUT
frames() { ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$1" | grep -m1 .; }
need() { local got=$(frames "$1"); [[ "$got" == "$2" ]] || { echo "$1 has $got frames, expected $2" >&2; exit 1; }; }

# background stretched to N frames
bg() { local src=$1 n=$2 out=$3
  local srcfr=$(frames "$src")
  local srcrate=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$src" | grep -m1 .)
  local f=$(python3 -c "from fractions import Fraction as F; print(float(F($n)/F('$FPS')*F('$srcrate')/F($srcfr)))")
  ffmpeg -y -hide_banner -loglevel error -i "$src" -vf "setpts=PTS*$f,framerate=fps=$FPS,trim=end_frame=$n,setpts=N/($FPS)/TB,scale=3840:2160,setsar=1" -an $PR "$out"
  need "$out" $n; }
# key graphics pair over a background (graphics may be shorter: last frame holds)
key() { local b=$1 w=$2 t=$3 out=$4 n=$5
  ffmpeg -y -hide_banner -loglevel error -i "$b" -i "$w" -i "$t" -filter_complex "
    [0:v]tpad=stop_mode=clone:stop=-1,trim=end_frame=$n,format=gbrp,split[b1][b2];[1:v]tpad=stop_mode=clone:stop=-1,trim=end_frame=$n,format=gbrp[w];[2:v]format=gbrp[t];
    [w][b1]blend=all_mode=subtract:shortest=1[d];[d][t]blend=all_mode=multiply:shortest=1[m];[b2][m]blend=all_mode=addition:shortest=1,format=yuv422p10le,setsar=1" \
    -r $FPS $PR "$out"
  need "$out" $n; }

# --- backgrounds ---
bg $G/renders/outro-r2-connect-soil-push-4k.mp4 408 $T/bg-connect.mov
bg assets/outro-backgrounds/02-story-intro-scene2-field.mp4 410 $T/bg-story.mov
if [[ -n "${PRAYER_CLOSE:-}" ]]; then
  CUT=${PRAYER_CUT:-120}
  shot() { ffmpeg -y -hide_banner -loglevel error -ss "$2" -i "$1" -vf "fps=$FPS,trim=end_frame=$3,setpts=N/($FPS)/TB,scale=3840:2160:flags=lanczos,unsharp=5:5:0.35:5:5:0,setsar=1" -an $PR "$4"; need "$4" $3; }
  shot "$PRAYER_CLOSE" "${PRAYER_CLOSE_IN:-0}" "$CUT" $T/prayer-close.mov
  shot "$PRAYER_WIDE" "${PRAYER_WIDE_IN:-0}" $((241 - CUT)) $T/prayer-wide.mov
  printf "file '%s'\n" prayer-close.mov prayer-wide.mov > $T/list-prayer-bg.txt
  ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $T/list-prayer-bg.txt -c copy $T/bg-prayer.mov
else
  bg assets/outro-backgrounds/03-prayer-intro-scene3-misty-warm.mp4 241 $T/bg-prayer.mov
fi
# Next Week: teaser's first frame held under the title build, then the teaser at real speed (Lanczos 4K)
TN=$(frames "$TEASER"); NW=$((NW_HOLD + TN))
ffmpeg -y -hide_banner -loglevel error -i "$TEASER" -vf "fps=$FPS,setpts=N/($FPS)/TB,scale=3840:2160:flags=lanczos,unsharp=5:5:0.35:5:5:0,setsar=1,tpad=start_mode=clone:start=$NW_HOLD" -an $PR $T/bg-nextweek.mov
need $T/bg-nextweek.mov $NW

# --- scenes ---
ffmpeg -y -hide_banner -loglevel error -i $G/renders/outro-r2-connect-seed.mp4 \
  -vf "setpts=PTS/1.25,fps=$FPS,trim=end_frame=120,setpts=N/($FPS)/TB,setsar=1" $PR $T/seed.mov
need $T/seed.mov 120
key $R/black/connect.mov $R/white/connect.mov $T/bg-connect.mov $T/connect.mov 408
key $R/black/nextweek.mov $R/white/nextweek.mov $T/bg-nextweek.mov $T/nextweek-keyed.mov $NW
# fade the last teaser frame to black, then the logo close
ffmpeg -y -hide_banner -loglevel error -i $T/nextweek-keyed.mov -vf "tpad=stop_mode=clone:stop=$FADE,fade=t=out:s=$NW:n=$FADE" $PR $T/nextweek.mov
need $T/nextweek.mov $((NW + FADE))
ffmpeg -y -hide_banner -loglevel error -i "$LOGO_CLOSE" -vf "fps=$FPS,setsar=1" $PR $T/close.mov
need $T/close.mov $CLOSE
TOTAL=$((120 + 408 + 410 + 241 + NW + FADE + CLOSE))
DUR=$(python3 -c "from fractions import Fraction as F; print(float($TOTAL/F('$FPS')))")

# --- audio ---
at() { python3 -c "from fractions import Fraction as F; print(int(round(float($1/F('$FPS'))*1000)))"; }   # frame -> ms
lufs() { ffmpeg -hide_banner -i "$1" -af ebur128 -f null - 2>&1 | grep -A2 "Integrated" | grep -o 'I: *-[0-9.]*' | tail -1 | grep -o '\-[0-9.]*'; }
TMS=$(at $TEASER_START); CLOSE_MS=$(at $((TOTAL - CLOSE)))
ffmpeg -y -hide_banner -loglevel error -i "$TEASER" -vn -ac 2 -ar 48000 -c:a pcm_s24le $T/teaser-voice.wav
TG=$(python3 -c "print(($(lufs $VO)) - ($(lufs $T/teaser-voice.wav)))")        # match teaser voice to the VO
ffmpeg -y -hide_banner -loglevel error -i "$VO" -i $T/teaser-voice.wav -filter_complex \
  "[0]aformat=channel_layouts=stereo,apad=whole_dur=$DUR[v];[1]volume=${TG}dB,adelay=$TMS:all=1,apad=whole_dur=$DUR[t];[v][t]amix=inputs=2:normalize=0,atrim=0:$DUR" \
  -c:a pcm_s24le $T/voice-bus.wav
python3 "$HERE/faithtalk-duck-mix.py" $T/voice-bus.wav "$MUSIC" 0 $DUR $T/mix-no-sfx.wav -30
# Logo.wav peak lands on frame 11 of the close (+0.36 s), as the emblem finishes fading in (measured 2026-09-30)
SFX_MS=$((CLOSE_MS - 1150)); SG=$(python3 -c "print(-27 - ($(lufs $LOGO_SFX)))")
ffmpeg -y -hide_banner -loglevel error -i $T/mix-no-sfx.wav -i "$LOGO_SFX" -filter_complex \
  "[1]aresample=48000,aformat=channel_layouts=stereo,volume=${SG}dB,adelay=$SFX_MS:all=1[s];[0][s]amix=inputs=2:normalize=0:duration=first,atrim=0:$DUR" -c:a pcm_s24le $T/mix-pre.wav
read I TP < <(ffmpeg -hide_banner -i $T/mix-pre.wav -af ebur128=peak=true -f null - 2>&1 | awk '/Summary/{s=1} s&&/I:/{i=$2} s&&/Peak:/{p=$2} END{print i, p}')
GAIN=$(python3 -c "g=-24-($I); assert $TP+g<=-2, f'true peak {$TP+g:.1f}'; print(round(g,2))")
ffmpeg -y -hide_banner -loglevel error -i $T/mix-pre.wav -af "volume=${GAIN}dB" -c:a pcm_s24le $OUT/faithtalk-outro-$REV-mix-atsc-24lkfs.wav

# --- masters ---
for V in A B; do
  key $R/black/story$V.mov $R/white/story$V.mov $T/bg-story.mov $T/story$V.mov 410
  key $R/black/prayer$V.mov $R/white/prayer$V.mov $T/bg-prayer.mov $T/prayer$V.mov 241
  printf "file '%s'\n" seed.mov connect.mov story$V.mov prayer$V.mov nextweek.mov close.mov > $T/list$V.txt
  ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $T/list$V.txt -i $OUT/faithtalk-outro-$REV-mix-atsc-24lkfs.wav \
    -map 0:v -map 1:a -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -r $FPS -c:a pcm_s24be -frames:v $TOTAL $OUT/faithtalk-outro-$REV-$V-4k.mov
  need $OUT/faithtalk-outro-$REV-$V-4k.mov $TOTAL
done
echo "outro $REV: $TOTAL frames ($DUR s), mix gain ${GAIN} dB"

#!/usr/bin/env bash
# Assemble FaithTalk outro r3 (A and B) at 4K 29.97 from the Figma black/white passes.
# Usage: scripts/faithtalk-outro-r3-assemble.sh [nextweek_bg.mp4] [label]
# Scene layout (frames @ 30000/1001): seed 120 | connect 375 | story 359 | prayer 241 | next week 300 = 1395 (46.5465 s).
# Key: out = black + (white - black) * background. Backgrounds are stretched to fill each scene (no freeze frames).
set -euo pipefail
P=${FAITHTALK_PROJECT:-/Users/singleton23/Documents/Development/singleton-systems/videos/faithtalk-drawn-seed-preview}
cd "$P"
# Media lives on HomeSSD (s-systems:video-storage); compositions and assets stay in the project.
G=${FAITHTALK_MEDIA:-/Volumes/HomeSSD/Generated/FAITHTALK}
R=$G/renders/outro-r3-passes; T=$G/renders/outro-r3-build
if [[ "${1:-}" == "--list-inputs" ]]; then   # used by faithtalk-media-links-check.py
  for s in connect storyA storyB prayerA prayerB nextweek; do echo "$R/black/$s.mov"; echo "$R/white/$s.mov"; done
  printf '%s\n' "$G/renders/outro-r2-connect-seed.mp4" "$G/renders/outro-r2-connect-soil-push-4k.mp4" \
    assets/outro-backgrounds/02-story-intro-scene2-field.mp4 assets/outro-backgrounds/03-prayer-intro-scene3-misty-warm.mp4 \
    assets/outro-backgrounds/04-nextweek-intro-logo-scene.mp4 "$G/audio/faithtalk-outro-vo-v1-46_5465s.wav" assets/audio/outro-new-dawn-v4-remastered.wav
  exit 0
fi
NWBG=${1:-assets/outro-backgrounds/04-nextweek-intro-logo-scene.mp4}; LABEL=${2:-r3}
mkdir -p $T
FPS=30000/1001; PR="-c:v prores_ks -profile:v 3 -pix_fmt yuv422p10le"

# background stretched to N frames
bg() { local src=$1 n=$2 out=$3
  # some sources carry a second stream group; take the first non-empty value
  local srcfr=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$src" | grep -m1 .)
  local srcrate=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$src" | grep -m1 .)
  local f=$(python3 -c "from fractions import Fraction as F; print(float(F($n)/F('$FPS')*F('$srcrate')/F($srcfr)))")
  ffmpeg -y -hide_banner -loglevel error -i "$src" -vf "setpts=PTS*$f,framerate=fps=$FPS,trim=end_frame=$n,setpts=N/($FPS)/TB,scale=3840:2160,setsar=1" -an $PR "$out"; }
# key graphics pair over a background
key() { local b=$1 w=$2 t=$3 out=$4
  ffmpeg -y -hide_banner -loglevel error -i "$b" -i "$w" -i "$t" -filter_complex "
    [0:v]format=gbrp,split[b1][b2];[1:v]format=gbrp[w];[2:v]format=gbrp[t];
    [w][b1]blend=all_mode=subtract[d];[d][t]blend=all_mode=multiply[m];[b2][m]blend=all_mode=addition,format=yuv422p10le,setsar=1" \
    -r $FPS $PR "$out"; }

bg $G/renders/outro-r2-connect-soil-push-4k.mp4 375 $T/bg-connect.mov
bg assets/outro-backgrounds/02-story-intro-scene2-field.mp4 359 $T/bg-story.mov
# Prayer background: stock by default. For episode footage set two shots and the cut frame:
#   PRAYER_CLOSE=clip.mp4 PRAYER_CLOSE_IN=12.3 PRAYER_WIDE=clip.mp4 PRAYER_WIDE_IN=40.0 PRAYER_CUT=120
# Shots play at real speed (no stretch), upscaled to 4K with Lanczos + light sharpening.
if [[ -n "${PRAYER_CLOSE:-}" ]]; then
  CUT=${PRAYER_CUT:-120}
  shot() { ffmpeg -y -hide_banner -loglevel error -ss "$2" -i "$1" -vf "fps=$FPS,trim=end_frame=$3,setpts=N/($FPS)/TB,scale=3840:2160:flags=lanczos,unsharp=5:5:0.35:5:5:0,setsar=1" -an $PR "$4"
    local got=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$4" | grep -m1 .)
    [[ "$got" == "$3" ]] || { echo "shot $1 from $2 s gave $got frames, need $3" >&2; exit 1; }; }
  shot "$PRAYER_CLOSE" "${PRAYER_CLOSE_IN:-0}" "$CUT" $T/prayer-close.mov
  shot "$PRAYER_WIDE" "${PRAYER_WIDE_IN:-0}" $((241 - CUT)) $T/prayer-wide.mov
  printf "file '%s'\n" prayer-close.mov prayer-wide.mov > $T/list-prayer-bg.txt
  ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $T/list-prayer-bg.txt -c copy $T/bg-prayer.mov
else
  bg assets/outro-backgrounds/03-prayer-intro-scene3-misty-warm.mp4 241 $T/bg-prayer.mov
fi
bg "$NWBG" 300 $T/bg-nextweek.mov

ffmpeg -y -hide_banner -loglevel error -i $G/renders/outro-r2-connect-seed.mp4 \
  -vf "setpts=PTS/1.25,fps=$FPS,trim=end_frame=120,setpts=N/($FPS)/TB,setsar=1" $PR $T/seed.mov
key $R/black/connect.mov $R/white/connect.mov $T/bg-connect.mov $T/connect.mov
key $R/black/nextweek.mov $R/white/nextweek.mov $T/bg-nextweek.mov $T/nextweek.mov
for V in A B; do
  key $R/black/story$V.mov $R/white/story$V.mov $T/bg-story.mov $T/story$V.mov
  key $R/black/prayer$V.mov $R/white/prayer$V.mov $T/bg-prayer.mov $T/prayer$V.mov
  printf "file '%s'\n" seed.mov connect.mov story$V.mov prayer$V.mov nextweek.mov > $T/list$V.txt
  ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $T/list$V.txt -c copy $T/outro$V-picture.mov
  echo "$V frames: $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 $T/outro$V-picture.mov)"
done

#!/bin/bash
# Usage: ./create_preview.sh input_video.mp4

# Check for input argument
if [ -z "$1" ]; then
  echo "Usage: $0 input_video.mp4"
  exit 1
fi

INPUT="$1"

# Get total duration (in seconds) using ffprobe
DURATION=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$INPUT")
  
# Calculate half of the duration
HALF_DURATION=$(echo "$DURATION/2" | bc -l)
echo "Total duration: $DURATION seconds"
echo "Using the first $HALF_DURATION seconds for the preview."

# Use ffmpeg to extract one frame every 3 seconds from the first half of the video,
# then re-time the selected frames so each shows for 1 second.
# The 'select' filter picks frames at 3-sec intervals, and 'setpts' assigns new presentation timestamps.
ffmpeg -ss 0 -i "$INPUT" -t "$HALF_DURATION" \
  -vf "select='not(mod(t,3))',setpts='N*1/TB'" \
  -vsync vfr preview.mp4

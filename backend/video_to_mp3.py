# #convert videos to audio means mp4 to mp3
# import os
# import subprocess
# files=os.listdir("Videos")
# print(files)
# for file in files:
#     video_number=file.split('_')[1].split('[')[0]
#     video_title=file.split('[')[1].split(']')[0]
#     subprocess.run(['ffmpeg','-i',f'Videos/{file}',f'audio/{video_number}_{video_title}.mp3'])

  
    
import argparse
import os
import re
import subprocess
import shutil
VIDEO_EXTENSIONS = (".mp4", ".mkv", ".mov", ".avi", ".webm")


def extract_number_title(filename):
    stem = os.path.splitext(os.path.basename(filename))[0]
    number_match = re.search(r"Video[_\s]*(\d+)", stem, re.IGNORECASE)
    title_match = re.search(r"\[([^\]]+)\]", stem)

    number = number_match.group(1) if number_match else "0"
    title = title_match.group(1) if title_match else stem
    title = title.replace(" ", "").strip()
    return number.strip(), title


def convert_videos_to_audio(video_dir, audio_dir, overwrite=False):
    if shutil.which("ffmpeg") is None:
        raise RuntimeError(
            "ffmpeg is required to convert videos. Install it and ensure it is on your PATH."
        )

    os.makedirs(audio_dir, exist_ok=True)
    files = [
        file for file in os.listdir(video_dir)
        if file.lower().endswith(VIDEO_EXTENSIONS)
    ]
    print(f"Found {len(files)} videos in {video_dir}")

    for file in files:
        number, title = extract_number_title(file)
        output_path = os.path.join(audio_dir, f"{number}_{title}.mp3")

        command = ["ffmpeg"]
        if overwrite:
            command.append("-y")
        command.extend(["-i", os.path.join(video_dir, file), output_path])

        print(f"Converting {file} -> {output_path}")
        subprocess.run(command, check=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert videos to MP3 audio.")
    parser.add_argument("--video-dir", default="Videos", help="Directory with video files.")
    parser.add_argument("--audio-dir", default="audio", help="Output directory for MP3 files.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing audio files.")
    args = parser.parse_args()

    convert_videos_to_audio(args.video_dir, args.audio_dir, args.overwrite)

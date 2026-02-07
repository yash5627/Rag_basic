#convert videos to audio means mp4 to mp3
import os
import subprocess
files=os.listdir("Videos")
print(files)
for file in files:
    video_number=file.split('_')[1].split('[')[0]
    video_title=file.split('[')[1].split(']')[0]
    subprocess.run(['ffmpeg','-i',f'Videos/{file}',f'audio/{video_number}_{video_title}.mp3'])

  
    

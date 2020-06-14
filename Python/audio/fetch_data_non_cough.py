import csv
import youtube_dl
import os

out_folder = "non_coughs"

ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192'
    }],
    "outtmpl": out_folder + "/%(id)s."
}

cough = ["/m/09x0r", "/t/dd00127", "/t/dd00128"]

with youtube_dl.YoutubeDL(ydl_opts) as ydl:
    with open("unbalanced_train_segments.csv", "r") as f:
        reader = csv.reader(f)
        for row in reader:
            if any(cat.replace('"', '').strip() in cough for cat in row[3:]):
                try:
                    ydl.download([f"https://youtu.be/{row[0]}"])
                except:
                    continue
                os.system(f"ffmpeg -i {out_folder}/{row[0]}.mp3 -ss {row[1].strip()} -to {row[2].strip()} -c copy {out_folder}/{row[0]}_new.mp3")
                os.system(f"rm {out_folder}/{row[0]}.mp3")
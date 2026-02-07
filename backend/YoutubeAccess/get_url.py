import yt_dlp

# def get_playlist_videos(playlist_url):
#     ydl_opts = {
#         "quiet": True,
#         "extract_flat": True,
#         "skip_download": True,
#         "js_runtimes": {"node": {}},   # ✅ Correct format
#         "remote_components": ["ejs:github"]
#     }

#     with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#         info = ydl.extract_info(playlist_url, download=False)

#         if "entries" not in info:
#             return []

#         return [
#             f"https://www.youtube.com/watch?v={entry['id']}"
#             for entry in info["entries"]
#         ]


# videos = get_playlist_videos(
#     "https://youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w"
# )


def get_video_info(video_url):
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "js_runtimes": {"node": {}},
        "remote_components": ["ejs:github"]
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)

        return {
            "title": info.get("title"),
            "video_id": info.get("id"),
            "duration": info.get("duration")
        }


video = get_video_info("https://youtu.be/vTY9nDHgtiU?si=Ej2_wrmvVaKP8VVu")
print(video)



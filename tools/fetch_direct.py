"""Fallback downloader that skips the (rate-limited) Commons API: upload URLs follow md5(filename)."""
import hashlib
import os
import sys
import time
import urllib.parse

sys.path.insert(0, os.path.dirname(__file__))
from commons import download  # noqa: E402
from manifest import AUDIO, IMAGES, VIDEOS  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), "..", "media")


def path_of(title):
    name = title.replace(" ", "_")
    h = hashlib.md5(name.encode()).hexdigest()
    return f"{h[0]}/{h[:2]}/{urllib.parse.quote(name)}", urllib.parse.quote(name)


def fetch(key, title, sub, kinds):
    p, q = path_of(title)
    for kind in kinds:
        if kind.startswith("thumb"):
            step = kind.split(":")[1]
            url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{p}/{step}px-{q}"
        else:
            url = f"https://upload.wikimedia.org/wikipedia/commons/transcoded/{p}/{q}.{kind}"
        ext = os.path.splitext(title)[1].lower() if kind.startswith("thumb") else os.path.splitext(url)[1]
        dest = os.path.join(ROOT, sub, key + ext)
        try:
            download(url, dest)
            print("ok", key, kind, flush=True)
            return
        except FileNotFoundError:
            print("  404", key, kind, flush=True)
        time.sleep(2)
    print("FAILED", key, flush=True)


if __name__ == "__main__":
    for k, t in VIDEOS.items():
        fetch(k, t, "video", ["1080p.vp9.webm", "720p.vp9.webm", "480p.vp9.webm", "360p.vp9.webm"])
    for k, t in AUDIO.items():
        if not t.endswith(".mid"):
            fetch(k, t, "audio", ["mp3", "ogg"])
    fetch("b_figaro", IMAGES["b_figaro"], "img", ["thumb:1920"])

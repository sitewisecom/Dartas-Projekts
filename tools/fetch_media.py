"""Download every file in manifest.py from Wikimedia Commons and record license/author in media/credits.json."""
import json, os, sys, time, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from commons import info, download
from manifest import IMAGES, VIDEOS, AUDIO

ROOT = os.path.join(os.path.dirname(__file__), "..", "media")
credits_path = os.path.join(ROOT, "credits.json")
credits = json.load(open(credits_path)) if os.path.exists(credits_path) else {}

STEPS = [250, 330, 500, 960, 1280, 1920]


def thumb_url(orig, step):
    base = orig.split("?")[0]
    path = base.split("/wikipedia/commons/")[1]
    name = path.rsplit("/", 1)[1]
    suffix = ".png" if name.lower().endswith((".tif", ".tiff", ".svg")) else ""
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{path}/{step}px-{name}{suffix}"


def transcode_urls(orig, sub):
    base = orig.split("?")[0]
    path = base.split("/wikipedia/commons/")[1]
    name = path.rsplit("/", 1)[1]
    kinds = ["1080p.vp9.webm", "720p.vp9.webm", "480p.vp9.webm"] if sub == "video" else ["mp3", "ogg"]
    return [f"https://upload.wikimedia.org/wikipedia/commons/transcoded/{path}/{name}.{t}" for t in kinds] + [base]


groups = [("img", IMAGES, 1920), ("video", VIDEOS, None), ("audio", AUDIO, None)]
for sub, table, width in groups:
    todo = {k: v for k, v in table.items() if k not in credits}
    keys = list(todo)
    for i in range(0, len(keys), 25):
        chunk = keys[i:i + 25]
        titles = ["File:" + todo[k] for k in chunk]
        res = {r["title"]: r for r in info(titles, width=1920)}
        for k in chunk:
            t = "File:" + todo[k]
            r = res.get(t) or next((x for x in res.values() if x["title"].replace(" ", "_") == t.replace(" ", "_")), None)
            if not r or r.get("missing"):
                print("MISSING", k, t); continue
            w = r["w"] or 0
            # upload.wikimedia.org refuses originals for bots; use standard thumbnail steps / transcodes
            if sub == "img":
                step = max([s for s in STEPS if s < w] or [STEPS[0]])
                name = r["title"].split(":", 1)[1].replace(" ", "_")
                url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(name) + f"?width={step}"
            else:
                url = None
                for cand in transcode_urls(r["url"], sub):
                    ext = os.path.splitext(cand)[1].lower()
                    dest = os.path.join(ROOT, sub, k + ext)
                    try:
                        download(cand, dest)
                        url = cand
                        break
                    except FileNotFoundError:
                        print("  404", cand[-60:])
                if not url:
                    print("FAILED", k); continue
            ext = os.path.splitext(r["title"])[1].lower() if sub == "img" else os.path.splitext(url.split("?")[0])[1].lower()
            if sub == "img" and ext in (".tif", ".tiff", ".svg"):
                ext = ".png"
            time.sleep(2)
            dest = os.path.join(ROOT, sub, k + ext)
            download(url, dest)
            credits[k] = {"title": r["title"], "license": r["license"], "artist": r["artist"],
                          "page": r["page"], "file": os.path.relpath(dest, ROOT)}
            print("ok", k, r["license"], "|", r["artist"][:60])
            json.dump(credits, open(credits_path, "w"), ensure_ascii=False, indent=1)

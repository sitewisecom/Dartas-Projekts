"""Small helper for searching and downloading Wikimedia Commons media with license info."""
import json, re, sys, time, urllib.error, urllib.parse, urllib.request, os, html

UA = "DartasProjektsSchoolVideo/1.0 (https://github.com/sitewisecom/dartas-projekts; school project)"
API = "https://commons.wikimedia.org/w/api.php"


def api(params):
    params = dict(params, format="json")
    url = API + "?" + urllib.parse.urlencode(params)
    for i in range(8):
        time.sleep(3)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception as e:
            print("api retry", e, file=sys.stderr)
            time.sleep(30 * (i + 1))
    raise RuntimeError("api failed " + url)


def clean(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def info(titles, width=1920):
    r = api({"action": "query", "titles": "|".join(titles), "prop": "imageinfo",
             "iiprop": "url|size|mime|extmetadata|duration", "iiurlwidth": width})
    out = []
    for p in r["query"]["pages"].values():
        if "imageinfo" not in p:
            out.append({"title": p["title"], "missing": True}); continue
        ii = p["imageinfo"][0]; md = ii.get("extmetadata", {})
        out.append({
            "title": p["title"], "url": ii["url"], "thumb": ii.get("thumburl"),
            "w": ii.get("width"), "h": ii.get("height"), "mime": ii.get("mime"),
            "duration": ii.get("duration"),
            "license": clean(md.get("LicenseShortName", {}).get("value")),
            "artist": clean(md.get("Artist", {}).get("value"))[:120],
            "desc": clean(md.get("ImageDescription", {}).get("value"))[:160],
            "page": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(p["title"].replace(" ", "_")),
        })
    return out


def search(q, n=12, filetype=None):
    s = q + (f" filetype:{filetype}" if filetype else "")
    r = api({"action": "query", "list": "search", "srsearch": s, "srnamespace": 6, "srlimit": n})
    titles = [x["title"] for x in r["query"]["search"]]
    return info(titles) if titles else []


def download(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return dest
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    for i in range(8):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            data = urllib.request.urlopen(req, timeout=120).read()
            open(dest, "wb").write(data); return dest
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise FileNotFoundError(url)
            print("retry", e, file=sys.stderr); time.sleep(30 * (i + 1))
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(30 * (i + 1))
    raise RuntimeError("download failed " + url)


if __name__ == "__main__":
    ft = None
    args = sys.argv[1:]
    if args and args[0].startswith("--type="):
        ft = args[0].split("=", 1)[1]; args = args[1:]
    for q in args:
        print("=== ", q)
        for x in search(q, filetype=ft):
            if x.get("missing"): continue
            print(f"{x['title']} | {x['w']}x{x['h']} {x['mime']} {x.get('duration') or ''} | {x['license']} | {x['artist'][:50]}")

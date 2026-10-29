"""Record license/author for files fetched by fetch_direct.py (metadata looked up on Commons by hand)."""
import glob, json, os, urllib.parse
from manifest import AUDIO, IMAGES, VIDEOS

ROOT = os.path.join(os.path.dirname(__file__), "..", "media")
META = {
    "v_epidaurus": ("CC BY 3.0", "Le Monde en Vidéo"),
    "v_quartet": ("CC BY 3.0", "The Danish String Quartet"),
    "v_gramophone": ("CC BY 3.0", "Fredrik Johansson"),
    "v_lp": ("CC BY-SA 3.0", "OrangeHD.com"),
    "v_recordstore": ("CC BY 3.0", "Fredrik Johansson"),
    "b_figaro_": None,
    "b_figaro": ("CC0", "Jean-Pierre Dantan (Dantan Jeune)"),
}
ARCHIVE = {
    # key: (archive.org identifier, license, performer)
    "a_romance": ("mozart-kv-525-string-serenade-no.-13-eine-kleine-nachtmusik", "Public Domain Mark", "W. A. Mozart — Eine kleine Nachtmusik, 2. Romance"),
    "a_nachtmusik": ("mozart-kv-525-string-serenade-no.-13-eine-kleine-nachtmusik", "Public Domain Mark", "W. A. Mozart — Eine kleine Nachtmusik, 1. Allegro"),
    "a_sym40": ("35482-89-mozart-40vco_202203", "Public domain (1915)", "Victor Concert Orchestra, 1915"),
    "a_surprise": ("Haydn_symphony94", "Public domain in the EU (1929)", "Boston Symphony Orchestra, Serge Koussevitzky, 1929"),
    "a_beet5": ("BeethovenFifth1910", "Public domain (1910)", "Friedrich Kark, Odeon, 1910"),
    "a_turca": ("78_turkish-march-rondo-alla-turca_sergei-rachmanioff-mozart_gbia0451048b", "Public domain (1925)", "Sergei Rachmaninoff, 1925"),
    "a_ragtime": ("loc-jukebox-645911-alexander-s-ragtime-band", "Public Domain Mark", "Arthur Collins & Byron G. Harlan, 1911 (Library of Congress National Jukebox)"),
    "a_barber": ("78_the-barber-of-seville_philharmonic-symphony-orchestra-of-new-york-rossini-arturo_gbia7012202a", "Public domain in the EU (c. 1930)", "New York Philharmonic, Arturo Toscanini"),
}
TITLES = {**IMAGES, **VIDEOS, **AUDIO}
path = os.path.join(ROOT, "credits.json")
credits = json.load(open(path))
for k, (ident, lic, artist) in ARCHIVE.items():
    f = os.path.join(ROOT, "audio", k + ".mp3")
    if os.path.exists(f):
        credits[k] = {"title": ident, "license": lic, "artist": artist,
                      "page": "https://archive.org/details/" + ident, "file": os.path.relpath(f, ROOT)}
for k, meta in META.items():
    if not meta:
        continue
    lic, artist = meta
    files = [f for f in glob.glob(os.path.join(ROOT, "*", k + ".*"))]
    if not files:
        print("not downloaded:", k); continue
    title = "File:" + TITLES[k]
    credits[k] = {"title": title, "license": lic, "artist": artist,
                  "page": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_")),
                  "file": os.path.relpath(files[0], ROOT)}
json.dump(credits, open(path, "w"), ensure_ascii=False, indent=1)
print(len(credits), "credits")

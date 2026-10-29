"""Public-domain recordings from the Internet Archive (used where Wikimedia Commons downloads were blocked)."""
import os
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(__file__))
from commons import download  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), "..", "media", "audio")
ITEMS = {
    # key: (archive.org identifier, file name, credit)
    "a_nachtmusik": ("mozart-kv-525-string-serenade-no.-13-eine-kleine-nachtmusik",
                     "Mozart - KV 525 - String Serenade No. 13 Eine Kleine Nachtmusik.mp3"),
    "a_sym40": ("35482-89-mozart-40vco_202203", "35482-89_mozart40vco.mp3"),
    "a_surprise": ("Haydn_symphony94", "02 II Andante.mp3"),
    "a_beet5": ("BeethovenFifth1910", "Beethoven - Symph 5 01 Kark.mp3"),
    "a_turca": ("78_turkish-march-rondo-alla-turca_sergei-rachmanioff-mozart_gbia0451048b",
                "Turkish March (Rondo alla Turca) - Sergei Rachmanioff.mp3"),
    "a_ragtime": ("loc-jukebox-645911-alexander-s-ragtime-band", "jukebox-645911_alexander-s-ragtime-band.mp3"),
    "a_barber": ("78_the-barber-of-seville_philharmonic-symphony-orchestra-of-new-york-rossini-arturo_gbia7012202a",
                 '"THE BARBER OF SEVILLE" - PHILHARMONIC-SYMPHONY ORCHESTRA OF NEW YORK.mp3'),
}

if __name__ == "__main__":
    for key, (ident, name) in ITEMS.items():
        url = f"https://archive.org/download/{ident}/{urllib.parse.quote(name)}"
        download(url, os.path.join(ROOT, key + ".mp3"))
        print("ok", key, flush=True)

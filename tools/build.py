"""Build the presentation video, its music mix and the voice-over script.

usage:
  python3 build.py stills 12.5 80 300      # render single frames (PNG) for checking
  python3 build.py video                   # full render -> output/
  python3 build.py script                  # only regenerate the voice-over document
"""
import multiprocessing as mp
import os
import subprocess
import sys

import numpy as np
import pyloudnorm
import soundfile as sf
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vlib  # noqa: E402
from vlib import FPS, H, MEDIA, W, Timeline, small_text  # noqa: E402
import timeline as content  # noqa: E402

ROOT = os.path.join(vlib.HERE, "..")
OUT = os.path.join(ROOT, "output")
TMP = os.environ.get("BUILD_TMP", os.path.join(ROOT, "build_tmp"))
SR = 48000
_audio = {}


def audio(key):
    """Decode a music source to float32 stereo at 48 kHz."""
    if key not in _audio:
        if key.startswith("syn_"):
            path = os.path.join(MEDIA, "audio", key + ".wav")
        else:
            path = os.path.join(MEDIA, vlib.CREDITS[key]["file"])
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                             capture_output=True, check=True).stdout
        _audio[key] = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    return _audio[key]


def surprise_offset():
    """Start the Haydn excerpt ~11 s before the famous fortissimo chord (found as the biggest loudness jump)."""
    a = audio("a_surprise")[: SR * 120].mean(1)
    win = SR // 20
    rms = np.sqrt(np.convolve(a ** 2, np.ones(win) / win, "valid")[::win] + 1e-12)
    best, idx = 0, 0
    for i in range(60, len(rms)):
        ratio = rms[i] / (rms[i - 60:i - 5].mean() + 1e-9)
        if ratio > best:
            best, idx = ratio, i
    t = idx / 20
    return max(0.0, t - 11.0)


def first_sound(key, thresh=0.02):
    """Skip leading silence / run-in groove noise of old 78 rpm transfers."""
    a = np.abs(audio(key)[: SR * 30]).mean(1)
    win = SR // 20
    n = len(a) // win
    rms = np.sqrt((a[: n * win].reshape(n, win) ** 2).mean(1))
    loud = np.nonzero(rms > max(thresh, rms.max() * 0.08))[0]
    return max(0.0, loud[0] / 20 - 0.1) if len(loud) else 0.0


def excerpt_offsets():
    offs = {}
    for clip, key, off, _ in content.WORK_EXCERPTS:
        offs[clip] = surprise_offset() if off is None else off + first_sound(key)
    return offs


def envelope(key, off, dur):
    a = audio(key)[int(off * SR): int((off + dur) * SR)].mean(1)
    win = SR // 20
    n = len(a) // win
    rms = np.sqrt((a[: n * win].reshape(n, win) ** 2).mean(1))
    return np.clip(rms / (np.percentile(rms, 95) + 1e-9), 0, 1)


def make_timeline():
    offs = excerpt_offsets()
    envs = {}
    for clip, key, _, _ in content.WORK_EXCERPTS:
        envs[key] = envelope(key, offs[clip], 16.0)
    clips, S = content.build(envs)
    tl = Timeline(clips)
    tl.S, tl.offs = S, offs
    for key, a, b, off, lufs, fi, fo, credit in content.music_cues(S):
        if credit:
            tl.overlays.append((tl.start(S[a]), tl.end(S[b]), small_text(credit, 18, (255, 255, 255, 175))))
    for clip, key, off, credit in content.WORK_EXCERPTS:
        tl.overlays.append((tl.start(S[clip]), tl.end(S[clip]), small_text(credit, 18, (255, 255, 255, 175))))
    return tl


# ---------------------------------------------------------------- audio

def fit_loudness(x, target):
    meter = pyloudnorm.Meter(SR)
    cur = meter.integrated_loudness(x.astype(np.float64)) if len(x) > SR else -40
    if not np.isfinite(cur):
        return x
    return x * (10 ** ((target - cur) / 20))


def limit(x, thr=0.89):
    """Peak limiter: lowers gain only around peaks above thr instead of turning the whole mix down."""
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    w = int(0.03 * SR)
    env = uniform_filter1d(maximum_filter1d(np.abs(x).max(1), size=2 * w), size=w)
    gain = np.minimum(1.0, thr / np.maximum(env, 1e-9))
    return np.clip(x * gain[:, None], -0.98, 0.98).astype(np.float32)


def take(src, off, length):
    """Excerpt `length` samples from `src` at `off`, looping with a 2 s crossfade if the source is too short."""
    off = int(off * SR)
    out = np.zeros((length, 2), np.float32)
    pos, xf = 0, 2 * SR
    seg = src[off:]
    while pos < length:
        n = min(len(seg), length - pos)
        piece = seg[:n].copy()
        if pos > 0:
            k = min(xf, n)
            if n <= k:  # tail shorter than the crossfade: the cue's fade-out covers it
                break
            ramp = np.linspace(0, 1, k)[:, None]
            out[pos - k:pos] *= (1 - ramp)
            piece[:k] *= ramp
            out[pos - k:pos] += piece[:k]
            out[pos:pos + n - k] = piece[k:]
            pos += n - k
        else:
            out[:n] = piece
            pos += n
        seg = src
    return out


def fade(x, fi, fo):
    n = len(x)
    a, b = min(n, int(fi * SR)), min(n, int(fo * SR))
    if a:
        x[:a] *= np.linspace(0, 1, a)[:, None] ** 2
    if b:
        x[n - b:] *= np.linspace(1, 0, b)[:, None] ** 2
    return x


def build_audio(tl, path):
    S = tl.S
    total = int(tl.total * SR) + SR
    mix = np.zeros((total, 2), np.float32)
    for key, a, b, off, lufs, fi, fo, _ in content.music_cues(S):
        t0, t1 = tl.start(S[a]), tl.end(S[b])
        src = audio(key)
        seg = take(src, off, int((t1 - t0) * SR))
        seg = fade(limit(fit_loudness(seg, lufs)), fi, fo)
        i = int(t0 * SR)
        mix[i:i + len(seg)] += seg[: total - i]
    for clip, key, _, _ in content.WORK_EXCERPTS:
        c = S[clip]
        t0 = tl.start(c)
        seg = take(audio(key), tl.offs[clip], int(c.dur * SR))
        seg = fade(limit(fit_loudness(seg, content.WORK_LUFS)), 0.25, 1.6)
        i = int(t0 * SR)
        mix[i:i + len(seg)] += seg
    mix = limit(mix)
    mix = mix[: int(tl.total * SR)]
    sf.write(path, mix, SR, subtype="PCM_16")
    meter = pyloudnorm.Meter(SR)
    print(f"music mix: {meter.integrated_loudness(mix.astype(np.float64)):.1f} LUFS, peak {20*np.log10(np.abs(mix).max()):.1f} dBFS")


# ---------------------------------------------------------------- video

def render_range(args):
    a, b, path = args
    tl = make_timeline()
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", os.environ.get("CRF", "21"),
                            "-pix_fmt", "yuv420p", "-g", "60", "-bf", "2", path], stdin=subprocess.PIPE)
    prepared = set()
    for k in range(a, b):
        enc.stdin.write(tl.frame(k / FPS, prepared).tobytes())
        if (k - a) % 300 == 0:
            print(f"  chunk {os.path.basename(path)}: {k - a}/{b - a}", flush=True)
    enc.stdin.close()
    enc.wait()
    return path


def build_video():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(TMP, exist_ok=True)
    tl = make_timeline()
    nframes = int(round(tl.total * FPS))
    print(f"total {tl.total:.1f}s = {nframes} frames, {len(tl.clips)} clips")
    wav = os.path.join(TMP, "music.wav")
    build_audio(tl, wav)
    workers = int(os.environ.get("WORKERS", "4"))
    nchunks = workers * 2
    bounds = np.linspace(0, nframes, nchunks + 1).astype(int)
    jobs = [(int(bounds[i]), int(bounds[i + 1]), os.path.join(TMP, f"chunk{i:02d}.mp4")) for i in range(nchunks)]
    with mp.get_context("fork").Pool(workers) as pool:
        parts = pool.map(render_range, jobs, chunksize=1)
    lst = os.path.join(TMP, "parts.txt")
    with open(lst, "w") as fh:
        for p in parts:
            fh.write(f"file '{p}'\n")
    final = os.path.join(OUT, "Muzikas_attistiba_video.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-i", wav,
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                    "-movflags", "+faststart", "-shortest", final], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "aac", "-b:a", "192k",
                    os.path.join(OUT, "fona_muzika_atseviski.m4a")], check=True)
    print("wrote", final, os.path.getsize(final) / 1e6, "MB")
    write_script(tl)
    write_credits(tl)


def stills(times):
    os.makedirs(os.path.join(TMP, "stills"), exist_ok=True)
    tl = make_timeline()
    print(f"total {tl.total:.1f}s")
    for T in times:
        prepared = set()
        img = Image.fromarray(tl.frame(T, prepared))
        p = os.path.join(TMP, "stills", f"t{T:07.2f}.jpg")
        img.save(p, quality=88)
        print(p)


# ---------------------------------------------------------------- voice-over document

def tc(t):
    m, s = divmod(int(round(t)), 60)
    return f"{m:02d}:{s:02d}"


def write_script(tl):
    S = tl.S
    lines = [
        "# Voiceover teksts — „Mūzikas attīstība”",
        "",
        f"Video garums: **{tc(tl.total)}** (1920×1080, 30 kadri/s). Laika kodi atbilst failam "
        "`output/Muzikas_attistiba_video.mp4`. Teksts rakstīts mierīgam lasīšanas tempam (~2,3 vārdi sekundē); "
        "katrs bloks sākas, kad ekrānā parādās attiecīgais kadrs.",
        "",
        "Fona mūzika videoklipā jau ir iemiksēta klusi (ap −30 LUFS), lai balss to pārspētu. Ja CapCut tomēr "
        "liekas par skaļu, iezīmē video celiņu → *Volume* un samazini vēl. Klasicisma skaņdarbu fragmenti "
        "(5 × ~14 s) ir nedaudz skaļāki, jo tie ir paredzēti klausīšanai.",
        "",
    ]
    section = None
    for i, c in enumerate(tl.clips):
        if c.section != section:
            section = c.section
            lines += ["", f"## {section}", ""]
        t0, t1 = tl.starts[i], tl.starts[i] + c.dur
        lines.append(f"**{tc(t0)}–{tc(t1)}** · *Ekrānā:* {c.screen}")
        lines.append("")
        if c.vo:
            lines.append(f"> {c.vo}")
            lines.append("")
        if isinstance(c, vlib.KaraokeStage):
            lines.append("> *(Karaoke — visi dzied līdzi. Teksts nav jārunā.)*")
            lines.append("")
        if isinstance(c, vlib.ThanksCard):
            lines.append("> Paldies par uzmanību!")
            lines.append("")
    path = os.path.join(ROOT, "teksts", "voiceover_teksts.md")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").write("\n".join(lines) + "\n")
    print("wrote", path)


def write_credits(tl):
    used = []
    for c in tl.clips:
        for attr in ("key", "img_key", "bg_key"):
            k = getattr(c, attr, None)
            if k and k not in used:
                used.append(k)
    for key, *_ in content.music_cues(tl.S):
        if key not in used:
            used.append(key)
    for _, key, _, _ in content.WORK_EXCERPTS:
        if key not in used:
            used.append(key)
    lines = ["# Izmantotie materiāli un licences", "",
             "Visi attēli, video un ieraksti ir publiskā īpašumā vai ar brīvu licenci (Creative Commons). "
             "Autors un licence redzami arī video apakšējā stūrī.", "",
             "| Materiāls | Autors / izpildītājs | Licence | Avots |", "|---|---|---|---|"]
    for k in used:
        if k.startswith("syn_"):
            lines.append(f"| {'Lira sengrieķu doriskajā ladā' if k == 'syn_lyre' else 'Elektroniskā fona mūzika'} "
                         f"| sintezēts šim video (`tools/synth.py`) | brīvi lietojams | šis repozitorijs |")
            continue
        c = vlib.CREDITS.get(k)
        if not c:
            continue
        title = c["title"].replace("File:", "").replace("|", "/")
        src = "Internet Archive" if "archive.org" in c["page"] else "Wikimedia Commons"
        artist = c["artist"] or "—"
        if "nknown" in artist:
            artist = "nezināms autors"
        lines.append(f"| {title} | {artist} | {c['license']} | [{src}]({c['page']}) |")
    lines += ["", "Queen ieraksts „Bohemian Rhapsody” un dziesmas vārdi **nav** iekļauti (autortiesības) — "
              "tos karaoke daļai pievieno CapCut (sk. `teksts/CapCut_instrukcija.md`)."]
    open(os.path.join(ROOT, "CREDITS.md"), "w").write("\n".join(lines) + "\n")
    print("wrote CREDITS.md")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "video"
    if cmd == "stills":
        stills([float(x) for x in sys.argv[2:]])
    elif cmd == "script":
        tl = make_timeline()
        write_script(tl)
        write_credits(tl)
    else:
        build_video()

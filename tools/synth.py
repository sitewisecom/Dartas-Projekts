"""Original background music synthesised for the video (no third-party recordings).

syn_lyre.wav    – plucked 'lyre' improvisation in the ancient Greek Dorian mode (E–E) over a drone
syn_digital.wav – soft electronic / synthwave loop for the digital-era section
"""
import os
import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "media", "audio")
rng = np.random.default_rng(7)


def midi_hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def pluck(freq, dur, bright=0.5, decay=0.996):
    """Karplus–Strong plucked string."""
    n = int(SR * dur)
    period = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, period)
    # soften the excitation for a gut-string feel
    for _ in range(int(3 * (1 - bright)) + 1):
        buf = 0.5 * (buf + np.roll(buf, 1))
    out = np.empty(n)
    for i in range(n):
        v = buf[i % period]
        out[i] = v
        buf[i % period] = decay * 0.5 * (v + buf[(i + 1) % period])
    env = np.minimum(1, np.arange(n) / (0.004 * SR))
    return out * env


def place(track, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    j = min(len(track), i + len(sig))
    if j <= i:
        return
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    track[i:j, 0] += sig[: j - i] * gain * l
    track[i:j, 1] += sig[: j - i] * gain * r


def reverb(x, mix=0.25):
    """Cheap stereo reverb from a few feedback delays."""
    y = np.zeros_like(x)
    for d, g in [(0.029, 0.5), (0.037, 0.45), (0.051, 0.4), (0.067, 0.35), (0.083, 0.3)]:
        k = int(d * SR)
        tmp = np.zeros_like(x)
        for rep in range(1, 9):
            s = k * rep
            if s >= len(x):
                break
            tmp[s:] += x[:-s] * (g ** rep)
        y += tmp
    y[:, 0], y[:, 1] = y[:, 0], np.roll(y[:, 1], int(0.011 * SR))
    return x * (1 - mix) + y * mix * 0.6


def normalize(x, peak=0.8):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def lyre():
    dur = 70.0
    tr = np.zeros((int(SR * (dur + 3)), 2))
    # Greek Dorian (descending E–E): E D C B A G F E  -> MIDI around E4
    scale = [52, 53, 55, 57, 59, 60, 62, 64, 65, 67]
    # drone on E2/B2 (aulos-like soft reed drone)
    t = np.arange(len(tr)) / SR
    drone = 0.0
    for f, a in [(midi_hz(40), 0.5), (midi_hz(47), 0.3), (midi_hz(52), 0.15)]:
        drone = drone + a * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.2 * t))
    drone *= 0.06 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.05 * t))
    fade = np.minimum(1, t / 4) * np.minimum(1, (dur + 3 - t) / 4)
    tr[:, 0] += drone * fade
    tr[:, 1] += drone * fade
    # melodic phrases: stepwise motion, phrase endings on E or A
    pos, idx = 1.0, 7
    while pos < dur - 2:
        phrase_len = rng.integers(5, 9)
        for k in range(phrase_len):
            step = rng.choice([-2, -1, -1, 1, 1, 2, 0])
            idx = int(np.clip(idx + step, 2, len(scale) - 1))
            if k == phrase_len - 1:
                idx = rng.choice([3, 7])
            note = scale[idx]
            length = rng.choice([0.45, 0.45, 0.9, 0.9, 1.35]) * (1.6 if k == phrase_len - 1 else 1)
            place(tr, pluck(midi_hz(note), 3.0, bright=0.6), pos, 0.35, pan=rng.uniform(-0.2, 0.2))
            if rng.random() < 0.25:  # occasional fifth below, like a second string
                place(tr, pluck(midi_hz(note - 7), 3.0, bright=0.4), pos + 0.02, 0.18)
            pos += length
        pos += rng.choice([0.9, 1.35])
    tr = reverb(tr, 0.35)
    sf.write(os.path.join(OUT, "syn_lyre.wav"), normalize(tr), SR)


def saw(f, t):
    return 2 * ((f * t) % 1.0) - 1


def lowpass(x, cutoff, order=2):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(order, cutoff, fs=SR, output="sos"), x)


def highpass(x, cutoff, order=2):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(order, cutoff, btype="high", fs=SR, output="sos"), x)


def note_env(ln, attack=0.006, decay=6.0):
    tt = np.arange(ln) / SR
    return np.minimum(1, tt / attack) * np.exp(-tt * decay)


def digital():
    bpm = 96
    beat = 60 / bpm
    bars = 28
    dur = bars * 4 * beat
    n = int(SR * (dur + 2))
    tr = np.zeros((n, 2))
    t = np.arange(n) / SR
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    # pads
    pad = np.zeros(n)
    for b in range(bars):
        c = chords[(b // 2) % 4] if b >= 0 else chords[0]
        s, e = int(b * 4 * beat * SR), int((b + 1) * 4 * beat * SR)
        tt = t[s:e]
        seg = sum(saw(midi_hz(m), tt) + saw(midi_hz(m) * 1.004, tt) for m in c) / 6
        env = np.minimum(1, (tt - tt[0]) / 0.3) * np.minimum(1, (tt[-1] - tt + 1e-3) / 0.3)
        pad[s:e] += seg * env
    pad = lowpass(pad, 1200) * 0.35
    # arpeggio (16ths) from bar 4
    arp = np.zeros(n)
    for b in range(4, bars):
        c = chords[(b // 2) % 4]
        notes = [c[0] + 12, c[1] + 12, c[2] + 12, c[1] + 24]
        for k in range(16):
            st = (b * 4 + k / 4) * beat
            ln = int(0.12 * SR)
            i = int(st * SR)
            tt = np.arange(ln) / SR
            f = midi_hz(notes[k % 4])
            sig = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)
            sig *= note_env(ln, 0.004, 22)
            arp[i:i + ln] += sig[: max(0, min(ln, n - i))]
    arp = lowpass(arp, 2500) * 0.18
    # bass
    bass = np.zeros(n)
    for b in range(2, bars):
        root = chords[(b // 2) % 4][0] - 24
        for k in range(8):
            i = int((b * 4 + k / 2) * beat * SR)
            ln = int(0.4 * beat * SR)
            tt = np.arange(ln) / SR
            sig = saw(midi_hz(root), tt) * note_env(ln, 0.008, 6)
            sig[-200:] *= np.linspace(1, 0, 200)
            bass[i:i + ln] += sig[: max(0, min(ln, n - i))]
    bass = lowpass(bass, 400) * 0.5
    # drums: soft kick on 1 and 3, hat on offbeats, from bar 8
    drums = np.zeros(n)
    for b in range(8, bars):
        for k in range(4):
            i = int((b * 4 + k) * beat * SR)
            if k in (0, 2):
                ln = int(0.25 * SR)
                tt = np.arange(ln) / SR
                kick = np.sin(2 * np.pi * (50 + 80 * np.exp(-tt * 30)) * tt) * note_env(ln, 0.002, 12)
                drums[i:i + ln] += kick[: max(0, min(ln, n - i))] * 0.8
            j = int((b * 4 + k + 0.5) * beat * SR)
            ln = int(0.05 * SR)
            hat = highpass(rng.uniform(-1, 1, ln), 7000) * note_env(ln, 0.001, 90)
            drums[j:j + ln] += hat[: max(0, min(ln, n - j))] * 0.12
    mono = pad + bass + drums
    tr[:, 0] = mono + arp * 0.8
    tr[:, 1] = mono + np.roll(arp, int(0.18 * beat * SR)) * 0.8
    fade = np.minimum(1, t / 3) * np.minimum(1, (t[-1] - t) / 3)
    tr *= fade[:, None]
    tr = reverb(tr, 0.2)
    tr = np.stack([lowpass(tr[:, 0], 9000), lowpass(tr[:, 1], 9000)], -1)
    sf.write(os.path.join(OUT, "syn_digital.wav"), normalize(tr), SR)


if __name__ == "__main__":
    lyre()
    digital()
    print("ok")

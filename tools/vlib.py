"""Tiny frame-by-frame video engine: clips render numpy RGB frames, a timeline crossfades them.

Everything is drawn with Pillow + numpy so the output is fully reproducible from this repo.
"""
import json
import math
import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1920, 1080, 30
XF = 0.6  # crossfade length between clips, seconds

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(HERE, "..", "media")
CREDITS = json.load(open(os.path.join(MEDIA, "credits.json")))

FONT_FILES = {
    "serif": "/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf",
    "serif_it": "/usr/share/fonts/truetype/crosextra/Caladea-BoldItalic.ttf",
    "display": "/usr/share/fonts/opentype/inter/InterDisplay-SemiBold.otf",
    "display_bold": "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf",
    "display_black": "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf",
    "body": "/usr/share/fonts/opentype/inter/Inter-Regular.otf",
    "body_med": "/usr/share/fonts/opentype/inter/Inter-Medium.otf",
    "body_semi": "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf",
    "symbol": "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
}
_font_cache = {}


def font(name, size):
    key = (name, size)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONT_FILES[name], size)
    return _font_cache[key]


THEMES = {
    "intro":   dict(bg1=(10, 10, 16), bg2=(34, 26, 46), accent=(236, 200, 128), tag="MŪZIKAS ATTĪSTĪBA"),
    "greece":  dict(bg1=(12, 14, 22), bg2=(52, 32, 22), accent=(222, 128, 74), tag="1 · ANTĪKĀ GRIEĶIJA"),
    "classic": dict(bg1=(18, 10, 12), bg2=(58, 32, 30), accent=(226, 188, 112), tag="2 · KLASICISMS"),
    "digital": dict(bg1=(6, 10, 18), bg2=(14, 34, 56), accent=(86, 214, 232), tag="3 · SKAŅU IERAKSTS UN DIGITALIZĀCIJA"),
    "queen":   dict(bg1=(8, 6, 14), bg2=(48, 14, 56), accent=(240, 96, 168), tag="2. ETAPS · QUEEN — BOHEMIAN RHAPSODY"),
    "karaoke": dict(bg1=(6, 4, 16), bg2=(40, 10, 70), accent=(255, 92, 200), tag="KARAOKE"),
}


# ---------------------------------------------------------------- helpers

def ease(p):
    p = min(1.0, max(0.0, p))
    return 0.5 - 0.5 * math.cos(math.pi * p)


def ease_out(p):
    p = min(1.0, max(0.0, p))
    return 1 - (1 - p) ** 3


def lerp(a, b, p):
    return a + (b - a) * p


def gradient(c1, c2, angle=0.35):
    """Diagonal gradient + soft vignette as float32 HxWx3."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    g = (x / W * math.cos(angle) + y / H * math.sin(angle)) / (math.cos(angle) + math.sin(angle))
    g = g[..., None]
    img = np.array(c1, np.float32) * (1 - g) + np.array(c2, np.float32) * g
    d = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
    vig = np.clip(1.05 - 0.38 * d ** 2, 0.45, 1)[..., None]
    return img * vig


_bg_cache = {}


def theme_bg(theme):
    if theme not in _bg_cache:
        t = THEMES[theme]
        _bg_cache[theme] = gradient(t["bg1"], t["bg2"])
    return _bg_cache[theme]


class Layer:
    """Premultiplied RGBA layer stored as float32 arrays for quick compositing."""

    def __init__(self, img):
        a = np.asarray(img.convert("RGBA"), np.float32) / 255.0
        self.alpha = a[..., 3:4]
        self.rgb = a[..., :3] * 255.0 * self.alpha
        self.h, self.w = a.shape[:2]


def over(dst, layer, x, y, opacity=1.0):
    """Composite layer onto float32 frame in place (clipped to frame)."""
    x, y = int(round(x)), int(round(y))
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(W, x + layer.w), min(H, y + layer.h)
    if x1 <= x0 or y1 <= y0 or opacity <= 0:
        return dst
    sx, sy = x0 - x, y0 - y
    rgb = layer.rgb[sy:sy + (y1 - y0), sx:sx + (x1 - x0)]
    a = layer.alpha[sy:sy + (y1 - y0), sx:sx + (x1 - x0)]
    region = dst[y0:y1, x0:x1]
    if opacity >= 1:
        region *= (1 - a)
        region += rgb
    else:
        region *= (1 - a * opacity)
        region += rgb * opacity
    return dst


def wrap(text, fnt, maxw):
    lines = []
    for para in text.split("\n"):
        words, cur = para.split(" "), ""
        for w in words:
            test = (cur + " " + w).strip()
            if fnt.getlength(test) <= maxw or not cur:
                cur = test
            else:
                lines.append(cur)
                cur = w
        lines.append(cur)
    return lines


def text_block(items, maxw, shadow=True, align="left"):
    """items: list of (text, font, color, spacing_after, line_gap, tracking).

    Returns RGBA image of the stacked block (with soft shadow for legibility on photos)."""
    rendered = []
    total_h, block_w = 0, 0
    for text, fnt, color, after, gap, *rest in items:
        tracking = rest[0] if rest else 0
        lines = wrap(text, fnt, maxw) if not tracking else [text]
        asc, desc = fnt.getmetrics()
        lh = int((asc + desc) * gap)
        for ln in lines:
            wdt = fnt.getlength(ln) + tracking * len(ln)
            block_w = max(block_w, wdt)
            rendered.append((ln, fnt, color, total_h, tracking))
            total_h += lh
        total_h += after
    pad = 40
    img = Image.new("RGBA", (int(min(maxw, block_w) + 2 * pad + 10), int(total_h + 2 * pad)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for ln, fnt, color, yy, tracking in rendered:
        if align == "center":
            wdt = fnt.getlength(ln) + tracking * len(ln)
            xx = pad + (img.width - 2 * pad - wdt) / 2
        else:
            xx = pad
        if tracking:
            for ch in ln:
                d.text((xx, pad + yy), ch, font=fnt, fill=color)
                xx += fnt.getlength(ch) + tracking
        else:
            d.text((xx, pad + yy), ln, font=fnt, fill=color)
    if shadow:
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
        alpha = img.split()[3].filter(ImageFilter.GaussianBlur(10))
        sh.putalpha(alpha.point(lambda v: int(v * 0.85)))
        out = Image.new("RGBA", img.size, (0, 0, 0, 0))
        out.alpha_composite(sh, (0, 4))
        out.alpha_composite(img)
        img = out
    return img


def credit_text(key):
    c = CREDITS.get(key)
    if not c:
        return ""
    artist = c["artist"].replace("\n", " ").strip()
    if not artist or "nknown" in artist:
        artist = "nezināms autors"
    if len(artist) > 48:
        artist = artist[:46].rstrip() + "…"
    lic = c["license"] or ""
    lic = {"Public domain": "publiskais īpašums", "No restrictions": "bez ierobežojumiem"}.get(lic, lic)
    return f"Foto/attēls: {artist} · {lic} · Wikimedia Commons"


_small_cache = {}


def small_text(text, size=20, color=(255, 255, 255, 170), name="body"):
    key = (text, size, color, name)
    if key not in _small_cache:
        f = font(name, size)
        wdt = int(f.getlength(text)) + 12
        img = Image.new("RGBA", (wdt, size + 14), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.text((7, 5), text, font=f, fill=(0, 0, 0, 160))
        d.text((6, 4), text, font=f, fill=color)
        _small_cache[key] = Layer(img)
    return _small_cache[key]


def tag_layer(text, accent):
    key = ("tag", text, accent)
    if key not in _small_cache:
        f = font("body_semi", 22)
        tracking = 3
        wdt = int(sum(f.getlength(c) + tracking for c in text)) + 60
        img = Image.new("RGBA", (wdt, 50), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rectangle((8, 14, 14, 36), fill=accent + (255,))
        x = 28
        for ch in text:
            d.text((x + 1, 13), ch, font=f, fill=(0, 0, 0, 140))
            d.text((x, 12), ch, font=f, fill=(255, 255, 255, 225))
            x += f.getlength(ch) + tracking
        _small_cache[key] = Layer(img)
    return _small_cache[key]


def cover_fit(img_w, img_h, box_w, box_h):
    s = max(box_w / img_w, box_h / img_h)
    return s


def load_image(key):
    path = os.path.join(MEDIA, CREDITS[key]["file"])
    im = Image.open(path)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (24, 22, 26, 255))
        bg.alpha_composite(im)
        im = bg
    return im.convert("RGB")


# ---------------------------------------------------------------- clips

class Clip:
    def release(self):
        """Drop prepared (heavy) state once the clip has played; keeps constructor fields."""
        keep = getattr(self, "_init_keys", None)
        if keep is None:
            return
        for k in list(self.__dict__):
            if k not in keep:
                del self.__dict__[k]
        if hasattr(self, "reader_close"):
            pass

    theme = "intro"
    vo = ""
    dur = 6.0
    credit = ""
    show_tag = True
    screen = ""  # short description of what is on screen (for the script document)

    def prepare(self):
        pass

    def base(self, t):
        raise NotImplementedError

    def render(self, t):
        f = self.base(t)
        if self.show_tag:
            over(f, tag_layer(THEMES[self.theme]["tag"], THEMES[self.theme]["accent"]), 64, 46)
        if self.credit:
            lay = small_text(self.credit, 17, (255, 255, 255, 150))
            over(f, lay, W - lay.w - 40, H - 42)
        return f


def text_anim(f, layer, x, y, t, delay=0.35, rise=26):
    p = ease_out((t - delay) / 0.7)
    if p > 0:
        over(f, layer, x, y + (1 - p) * rise, p)


class ImageSlide(Clip):
    """Ken Burns photo slide. Wide images fill the frame; tall ones sit on a blurred backdrop."""

    def __init__(self, key, heading, sub, theme, vo="", dur=None, mode=None, zoom=(1.0, 1.1),
                 c0=(0.5, 0.5), c1=(0.5, 0.5), screen=""):
        self.key, self.heading, self.sub, self.theme, self.vo = key, heading, sub, theme, vo
        self.dur_override, self.mode, self.zoom, self.c0, self.c1 = dur, mode, zoom, c0, c1
        self.credit = credit_text(key)
        self.screen = screen or heading

    def prepare(self):
        im = load_image(self.key)
        self.im = im
        aspect = im.width / im.height
        if self.mode is None:
            self.mode = "cover" if aspect >= 1.38 else "contain"
        acc = THEMES[self.theme]["accent"]
        if self.mode == "cover":
            grad = np.zeros((H, W, 4), np.uint8)
            ramp = np.clip((np.arange(H) - H * 0.42) / (H * 0.58), 0, 1) ** 1.3
            grad[..., 3] = (ramp * 225)[:, None].astype(np.uint8)
            self.grad = Layer(Image.fromarray(grad, "RGBA"))
            side = np.zeros((H, W, 4), np.uint8)
            ramp2 = np.clip(1 - np.arange(W) / (W * 0.55), 0, 1) ** 1.6
            side[..., 3] = (ramp2 * 120)[None, :].astype(np.uint8)
            self.side = Layer(Image.fromarray(side, "RGBA"))
            self.text = Layer(text_block([
                (self.heading, font("display", 60), (255, 255, 255, 255), 14, 1.08),
                (self.sub, font("body", 31), (238, 236, 230, 240), 0, 1.3),
            ], maxw=1180))
            self.tx, self.ty = 70, H - self.text.h - 50
            s = cover_fit(im.width, im.height, W, H)
            self.base_w, self.base_h = W / s, H / s  # source window at zoom 1
        else:
            s = cover_fit(im.width, im.height, W, H)
            bg = im.resize((int(im.width * s) + 2, int(im.height * s) + 2), Image.BILINEAR)
            bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H))
            bg = bg.filter(ImageFilter.GaussianBlur(38))
            bgf = np.asarray(bg, np.float32) * 0.32 + theme_bg(self.theme) * 0.45
            box_w, box_h, box_x = 1000, 880, 830
            fs = min(box_w / im.width, box_h / im.height)
            self.fg = im.resize((int(im.width * fs), int(im.height * fs)), Image.LANCZOS)
            self.fx = box_x + (box_w - self.fg.width) // 2
            self.fy = (H - self.fg.height) // 2
            # soft drop shadow baked into the backdrop
            sh = Image.new("L", (W, H), 0)
            ImageDraw.Draw(sh).rectangle((self.fx + 10, self.fy + 22, self.fx + self.fg.width + 10, self.fy + self.fg.height + 22), fill=200)
            sh = np.asarray(sh.filter(ImageFilter.GaussianBlur(28)), np.float32)[..., None] / 255
            self.bgf = bgf * (1 - sh * 0.8)
            self.text = Layer(text_block([
                (self.heading, font("display", 56), (255, 255, 255, 255), 18, 1.08),
                (self.sub, font("body", 30), (236, 232, 226, 235), 0, 1.36),
            ], maxw=640))
            self.tx, self.ty = 70, (H - self.text.h) // 2 + 20
            self.bar = Layer(Image.new("RGBA", (6, 90), acc + (255,)))

    @property
    def dur(self):
        return self.dur_override or vo_duration(self.vo)

    def base(self, t):
        p = t / self.dur
        if self.mode == "cover":
            z = lerp(self.zoom[0], self.zoom[1], ease(p))
            cx = lerp(self.c0[0], self.c1[0], ease(p)) * self.im.width
            cy = lerp(self.c0[1], self.c1[1], ease(p)) * self.im.height
            ww, hh = self.base_w / z, self.base_h / z
            x0 = min(max(0, cx - ww / 2), self.im.width - ww)
            y0 = min(max(0, cy - hh / 2), self.im.height - hh)
            f = np.asarray(self.im.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + ww, y0 + hh)), np.float32).copy()
            over(f, self.side, 0, 0)
            over(f, self.grad, 0, 0)
        else:
            f = self.bgf.copy()
            s = lerp(1.0, 1.045, ease(p))
            fw, fh = int(self.fg.width * s), int(self.fg.height * s)
            fg = self.fg.resize((fw, fh), Image.BILINEAR)
            x = self.fx - (fw - self.fg.width) // 2
            y = self.fy - (fh - self.fg.height) // 2
            arr = np.asarray(fg, np.float32)
            x0, y0 = max(0, x), max(0, y)
            x1, y1 = min(W, x + fw), min(H, y + fh)
            f[y0:y1, x0:x1] = arr[y0 - y:y1 - y, x0 - x:x1 - x]
            text_anim(f, self.bar, self.tx + 4, self.ty + 40, t, 0.25, 40)
        text_anim(f, self.text, self.tx, self.ty, t)
        return f


class VideoReader:
    def __init__(self, path, start):
        self.path, self.start, self.proc, self.next = path, start, None, None

    def frame(self, k):
        if self.proc is None or k != self.next:
            self.close()
            ss = self.start + k / FPS
            self.proc = subprocess.Popen(
                ["ffmpeg", "-v", "error", "-ss", f"{ss:.3f}", "-i", self.path, "-an",
                 "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}",
                 "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
            self.next = k
            self.last = None
        buf = self.proc.stdout.read(W * H * 3)
        if len(buf) == W * H * 3:
            self.last = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        self.next = k + 1
        return self.last if self.last is not None else np.zeros((H, W, 3), np.uint8)

    def close(self):
        if self.proc:
            self.proc.stdout.close()
            self.proc.kill()
            self.proc.wait()
            self.proc = None


class VideoSlide(ImageSlide):
    def __init__(self, key, start, heading, sub, theme, vo="", dur=None, screen=""):
        self.key, self.start, self.heading, self.sub, self.theme, self.vo = key, start, heading, sub, theme, vo
        self.dur_override = dur
        self.credit = credit_text(key).replace("Foto/attēls", "Video")
        self.screen = screen or heading
        self.mode = "cover"

    def prepare(self):
        path = os.path.join(MEDIA, CREDITS[self.key]["file"])
        self.reader = VideoReader(path, self.start)
        grad = np.zeros((H, W, 4), np.uint8)
        ramp = np.clip((np.arange(H) - H * 0.42) / (H * 0.58), 0, 1) ** 1.3
        grad[..., 3] = (ramp * 225)[:, None].astype(np.uint8)
        self.grad = Layer(Image.fromarray(grad, "RGBA"))
        self.text = Layer(text_block([
            (self.heading, font("display", 60), (255, 255, 255, 255), 14, 1.08),
            (self.sub, font("body", 31), (238, 236, 230, 240), 0, 1.3),
        ], maxw=1180))
        self.tx, self.ty = 70, H - self.text.h - 50

    def base(self, t):
        k = int(round(t * FPS))
        f = self.reader.frame(k).astype(np.float32)
        over(f, self.grad, 0, 0)
        text_anim(f, self.text, self.tx, self.ty, t)
        return f


class TitleCard(Clip):
    def __init__(self, theme, number, title, subtitle, vo="", dur=None, screen=""):
        self.theme, self.number, self.title, self.subtitle, self.vo = theme, number, title, subtitle, vo
        self.dur_override = dur
        self.screen = screen or f"Titulkadrs: {title} — {subtitle}"
        self.show_tag = False

    @property
    def dur(self):
        return self.dur_override or max(5.5, vo_duration(self.vo))

    def prepare(self):
        acc = THEMES[self.theme]["accent"]
        self.bg = theme_bg(self.theme)
        num = Image.new("RGBA", (900, 640), (0, 0, 0, 0))
        if self.number:
            ImageDraw.Draw(num).text((0, 0), self.number, font=font("display_black", 520), fill=acc + (34,))
        self.num = Layer(num)
        self.kicker = Layer(text_block([(THEMES[self.theme]["tag"], font("body_semi", 26), acc + (255,), 0, 1.0, 4)], 1700, shadow=False))
        self.title_l = Layer(text_block([(self.title, font("serif", 118), (255, 255, 255, 255), 0, 1.02)], 1600))
        self.sub_l = Layer(text_block([(self.subtitle, font("body", 40), (230, 226, 220, 230), 0, 1.3)], 1500, shadow=False))
        # soft moving glow
        gw, gh = W + 1000, H + 600  # larger than the frame so the moving glow never shows an edge
        yy, xx = np.mgrid[0:gh, 0:gw]
        g = np.exp(-(((xx - gw * 0.5) / 520.0) ** 2 + ((yy - gh * 0.5) / 420.0) ** 2))
        glow = np.zeros((gh, gw, 4), np.uint8)
        glow[..., :3] = acc
        glow[..., 3] = (g * 70).astype(np.uint8)
        self.glow = Layer(Image.fromarray(glow, "RGBA"))

    def base(self, t):
        f = self.bg.copy()
        over(f, self.glow, lerp(-880, -120, ease(t / self.dur)), lerp(-420, -220, ease(t / self.dur)))
        over(f, self.num, W - 760 + 40 * ease(t / self.dur), 260, ease_out(t / 1.2))
        x = 150
        text_anim(f, self.kicker, x - 40, 300, t, 0.15, 20)
        text_anim(f, self.title_l, x - 40, 370, t, 0.35, 34)
        line_w = int(520 * ease_out((t - 0.7) / 0.9))
        if line_w > 0:
            acc = np.array(THEMES[self.theme]["accent"], np.float32)
            y0 = 370 + self.title_l.h - 30
            f[y0:y0 + 5, x:x + line_w] = acc
        text_anim(f, self.sub_l, x - 40, 370 + self.title_l.h + 0, t, 0.85, 24)
        return f


class InfoCard(Clip):
    """Heading + items that appear one by one. style: 'list' | 'stats' | 'chips'."""

    def __init__(self, theme, heading, items, vo="", dur=None, style="list", bg_key=None, note="", screen=""):
        self.theme, self.heading, self.items, self.vo = theme, heading, items, vo
        self.dur_override, self.style, self.bg_key, self.note = dur, style, bg_key, note
        self.screen = screen or (heading + ": " + "; ".join(i if isinstance(i, str) else " ".join(i) for i in items))
        if bg_key:
            self.credit = credit_text(bg_key)

    @property
    def dur(self):
        return self.dur_override or vo_duration(self.vo)

    def prepare(self):
        acc = THEMES[self.theme]["accent"]
        bg = theme_bg(self.theme).copy()
        if self.bg_key:
            im = load_image(self.bg_key)
            s = cover_fit(im.width, im.height, W, H)
            im = im.resize((int(im.width * s) + 2, int(im.height * s) + 2), Image.BILINEAR)
            im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
            im = im.filter(ImageFilter.GaussianBlur(26))
            bg = np.asarray(im, np.float32) * 0.28 + bg * 0.55
        self.bg = bg
        self.head = Layer(text_block([(self.heading, font("serif", 84), (255, 255, 255, 255), 0, 1.05)], 1700))
        self.layers = []
        if self.style == "list":
            for i, it in enumerate(self.items):
                img = Image.new("RGBA", (1700, 110), (0, 0, 0, 0))
                d = ImageDraw.Draw(img)
                d.rounded_rectangle((40, 22, 100, 82), 14, fill=acc + (255,))
                n = str(i + 1)
                fn = font("display_bold", 34)
                d.text((70 - fn.getlength(n) / 2, 30), n, font=fn, fill=(20, 16, 20, 255))
                d.text((130, 24), it, font=font("display", 44), fill=(255, 255, 255, 250))
                self.layers.append(Layer(img))
        elif self.style == "stats":
            n = len(self.items)
            colw = (W - 240) // n
            for big, small in self.items:
                img = Image.new("RGBA", (colw, 420), (0, 0, 0, 0))
                d = ImageDraw.Draw(img)
                fb = font("display_black", 104 if n <= 3 else 84)
                while fb.getlength(big) > colw - 60 and fb.size > 50:
                    fb = font("display_black", fb.size - 6)
                d.text((30, 20), big, font=fb, fill=acc + (255,))
                yy = 40 + fb.size + 20
                for ln in wrap(small, font("body_med", 34), colw - 70):
                    d.text((32, yy), ln, font=font("body_med", 34), fill=(240, 238, 232, 240))
                    yy += 46
                self.layers.append(Layer(img))
        if self.note:
            self.note_l = Layer(text_block([(self.note, font("body", 30), (230, 226, 220, 220), 0, 1.3)], 1600, shadow=False))

    def base(self, t):
        f = self.bg.copy()
        text_anim(f, self.head, 110, 90, t, 0.15, 24)
        if self.style == "list":
            n = len(self.layers)
            step = 0.55 if n > 4 else 0.75
            gap = 132 if n <= 4 else 112
            y0 = max(270, (H - n * gap) // 2 + 60)
            for i, lay in enumerate(self.layers):
                d = 0.7 + i * step
                p = ease_out((t - d) / 0.6)
                if p > 0:
                    over(f, lay, 110 + (1 - p) * 60, y0 + i * gap, p)
        else:
            n = len(self.layers)
            colw = (W - 240) // n
            for i, lay in enumerate(self.layers):
                d = 0.7 + i * 0.7
                p = ease_out((t - d) / 0.7)
                if p > 0:
                    over(f, lay, 120 + i * colw, 390 + (1 - p) * 40, p)
        if self.note:
            text_anim(f, self.note_l, 110, H - 190, t, 0.8 + 0.6 * len(self.items), 12)
        return f


class WorkCard(Clip):
    """Classical-era work showcase: portrait + title, composer, year, live audio meter."""

    def __init__(self, index, total, img_key, title, subtitle, composer, year, env, theme="classic", vo="", dur=16.0, hint=""):
        self.index, self.total, self.img_key = index, total, img_key
        self.title, self.subtitle, self.composer, self.year = title, subtitle, composer, year
        self.env, self.theme, self.vo, self.dur_override, self.hint = env, theme, vo, dur, hint
        self.credit = credit_text(img_key)
        self.screen = f"Skaņdarbs {index}/{total}: {composer} — {title} ({year})"

    @property
    def dur(self):
        return self.dur_override

    def prepare(self):
        acc = THEMES[self.theme]["accent"]
        im = load_image(self.img_key)
        s = cover_fit(im.width, im.height, W, H)
        bg = im.resize((int(im.width * s) + 2, int(im.height * s) + 2), Image.BILINEAR)
        bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H))
        bg = bg.filter(ImageFilter.GaussianBlur(40))
        self.bg = np.asarray(bg, np.float32) * 0.25 + theme_bg(self.theme) * 0.6
        bw, bh = 600, 760
        fs = min(bw / im.width, bh / im.height)
        fg = im.resize((int(im.width * fs), int(im.height * fs)), Image.LANCZOS)
        framed = Image.new("RGBA", (fg.width + 24, fg.height + 24), acc + (255,))
        framed.paste(fg, (12, 12))
        self.portrait = Layer(framed)
        self.px = 140 + (bw - fg.width) // 2
        self.py = (H - framed.height) // 2
        right = [
            (f"SKAŅDARBS {self.index}/{self.total}", font("body_semi", 26), acc + (255,), 26, 1.0, 4),
            (self.title, font("serif", 76), (255, 255, 255, 255), 10, 1.04),
            (self.subtitle, font("body", 34), (232, 228, 222, 235), 34, 1.3),
            (self.composer, font("display", 52), acc + (255,), 6, 1.1),
            (self.year, font("body_med", 36), (240, 236, 230, 230), 0, 1.2),
        ]
        if self.hint:
            right.append(("", font("body", 20), (0, 0, 0, 0), 0, 0.6))
            right.append((self.hint, font("body_med", 32), (255, 240, 200, 240), 0, 1.3))
        self.info = Layer(text_block(right, 1000))
        self.ix, self.iy = 860, (H - self.info.h) // 2 - 40

    def base(self, t):
        f = self.bg.copy()
        p = ease_out(t / 0.8)
        over(f, self.portrait, self.px - (1 - p) * 50, self.py, p)
        text_anim(f, self.info, self.ix, self.iy, t, 0.3, 30)
        # audio meter + progress
        acc = np.array(THEMES[self.theme]["accent"], np.float32)
        y_base, x0 = H - 150, 900
        nb, bw = 40, 18
        i = min(len(self.env) - 1, int(t * 20))
        for b in range(nb):
            v = self.env[max(0, i - (nb - 1 - b) // 2)] if len(self.env) else 0
            v = v * (0.55 + 0.45 * math.sin(b * 1.7 + t * 9) ** 2)
            hgt = int(6 + 70 * v)
            xx = x0 + b * (bw + 6)
            f[y_base - hgt:y_base, xx:xx + bw] = f[y_base - hgt:y_base, xx:xx + bw] * 0.2 + acc * 0.8
        prog = int(900 * min(1, t / self.dur))
        f[y_base + 24:y_base + 30, x0:x0 + 960] *= 0.5
        f[y_base + 24:y_base + 30, x0:x0 + prog] = acc
        return f


class DiscAnim(Clip):
    """Procedurally rendered spinning compact disc with flowing binary digits."""

    def __init__(self, heading, sub, theme="digital", vo="", dur=None, screen="", kind="cd"):
        self.heading, self.sub, self.theme, self.vo, self.dur_override = heading, sub, theme, vo, dur
        self.kind = kind
        self.screen = screen or (heading + " — animācija: rotējoša vinila plate" if kind == "vinyl"
                                 else "Animācija: rotējošs kompaktdisks un bināri skaitļi")

    @property
    def dur(self):
        return self.dur_override or vo_duration(self.vo)

    def prepare(self):
        self.bg = theme_bg(self.theme)
        R = 400
        yy, xx = np.mgrid[-R:R, -R:R].astype(np.float32)
        self.r = np.sqrt(xx ** 2 + yy ** 2) / R
        self.ang = np.arctan2(yy, xx)
        self.R = R
        self.mask = ((self.r <= 1) & (self.r >= 0.16)).astype(np.float32)
        self.hole = (self.r < 0.07)
        tb = text_block([
            (self.heading, font("display", 62), (255, 255, 255, 255), 16, 1.08),
            (self.sub, font("body", 32), (232, 236, 240, 235), 0, 1.35),
        ], 760)
        panel = Image.new("RGBA", (tb.width + 40, tb.height + 20), (0, 0, 0, 0))
        ImageDraw.Draw(panel).rounded_rectangle((0, 0, panel.width - 1, panel.height - 1), 28, fill=(6, 10, 18, 215))
        panel.alpha_composite(tb, (20, 10))
        self.text = Layer(panel)
        rng = np.random.default_rng(3)
        self.cols = []
        for c in range(26):
            s = "".join(rng.choice(list("01")) for _ in range(40))
            img = Image.new("RGBA", (40, 40 * 34), (0, 0, 0, 0))
            d = ImageDraw.Draw(img)
            for k, ch in enumerate(s[:34]):
                d.text((8, k * 40), ch, font=font("body_med", 28), fill=(86, 214, 232, 60 + int(rng.integers(0, 60))))
            self.cols.append((Layer(img), rng.uniform(40, 120), rng.uniform(0, 1400)))

    def base(self, t):
        f = self.bg.copy()
        for c, (lay, speed, off) in enumerate(self.cols if self.kind == "cd" else []):
            y = ((off + t * speed) % (lay.h + H)) - lay.h
            over(f, lay, 980 + c * 36, y, 0.9)
        rot = t * 2.2
        a = self.ang + rot
        if self.kind == "vinyl":
            return self._vinyl(f, t)
        # iridescent sheen: hue varies with angle (two lobes) and radius
        h = (np.cos(2 * a) * 0.5 + 0.5) * 0.85 + self.r * 0.35
        rr = 0.5 + 0.5 * np.cos(2 * np.pi * (h + 0.0))
        gg = 0.5 + 0.5 * np.cos(2 * np.pi * (h + 0.33))
        bb = 0.5 + 0.5 * np.cos(2 * np.pi * (h + 0.66))
        sheen = (np.abs(np.cos(2 * a)) ** 6)[..., None]
        silver = np.full(self.r.shape + (3,), 200, np.float32)
        col = silver * (1 - sheen * 0.8) + np.stack([rr, gg, bb], -1) * 255 * sheen * 0.8
        grooves = (0.92 + 0.08 * np.cos(self.r * 900))[..., None]
        col *= grooves
        m = self.mask[..., None]
        cx, cy = 520, H // 2
        R = self.R
        region = f[cy - R:cy + R, cx - R:cx + R]
        region[:] = region * (1 - m) + col * m
        inner = ((self.r < 0.16) & (self.r >= 0.07))[..., None]
        region[:] = np.where(inner, region * 0.5 + 120, region)
        text_anim(f, self.text, 1000, (H - self.text.h) // 2, t, 0.4, 30)
        return f


    def _vinyl(self, f, t):
        """Black LP with grooves, a rotating label and a soft moving highlight."""
        a = self.ang + t * 3.49  # 33 1/3 rpm
        r = self.r
        groove = 0.82 + 0.18 * np.cos(r * 1400) ** 2
        sheen = (np.abs(np.cos(self.ang - 0.6)) ** 18 * 0.55 + 0.08)  # light reflection stays fixed
        base = (18 + 70 * sheen * (r > 0.36)) * groove
        col = np.repeat(base[..., None], 3, -1)
        label = r < 0.34
        acc = np.array(THEMES[self.theme]["accent"], np.float32)
        stripe = (np.cos(a * 1) > 0.6) & label & (r > 0.12)
        lab_col = np.where(stripe[..., None], acc * 0.55 + 40, acc * 0.9 + 10)
        col = np.where(label[..., None], lab_col, col)
        col = np.where((r < 0.035)[..., None], 10, col)
        m = (r <= 1)[..., None].astype(np.float32)
        cx, cy, R = 520, H // 2, self.R
        region = f[cy - R:cy + R, cx - R:cx + R]
        region[:] = region * (1 - m) + col * m
        if not hasattr(self, "arm"):
            arm = Image.new("RGBA", (280, 640), (0, 0, 0, 0))
            d = ImageDraw.Draw(arm)
            d.ellipse((180, 10, 270, 100), fill=(150, 156, 166, 255))
            d.line((225, 55, 200, 420), fill=(200, 205, 212, 255), width=14)
            d.line((200, 420, 120, 550), fill=(200, 205, 212, 255), width=14)
            d.rounded_rectangle((80, 530, 160, 590), 8, fill=(230, 232, 236, 255))
            self.arm = Layer(arm)
        over(f, self.arm, cx + 130, cy - 470)
        text_anim(f, self.text, 1000, (H - self.text.h) // 2, t, 0.4, 30)
        return f


class StructureCard(Clip):
    """Bohemian Rhapsody: six sections drawn to scale with a moving playhead."""

    PARTS = [("A cappella ievads", 0, 49), ("Balāde", 49, 157), ("Ģitāras solo", 157, 183),
             ("Opera", 183, 247), ("Hārdroks", 247, 295), ("Noslēgums", 295, 355)]

    def __init__(self, theme="queen", vo="", dur=None):
        self.theme, self.vo, self.dur_override = theme, vo, dur
        self.screen = "Shēma: dziesmas 6 daļas (5:55), bez atkārtota piedziedājuma"

    @property
    def dur(self):
        return self.dur_override or vo_duration(self.vo)

    def prepare(self):
        self.bg = theme_bg(self.theme)
        self.head = Layer(text_block([("Uzbūve: 6 daļas · 5:55 · bez piedziedājuma", font("serif", 72), (255, 255, 255, 255), 0, 1.05)], 1700))
        self.sub = Layer(text_block([("Rapsodija — brīvas formas viendaļas skaņdarbs ar krasiem kontrastiem", font("body", 34), (230, 226, 220, 230), 0, 1.3)], 1700, shadow=False))
        palette = [(120, 130, 220), (236, 200, 128), (240, 96, 120), (240, 96, 168), (250, 140, 60), (150, 200, 230)]
        self.blocks = []
        x0, x1 = 120, W - 120
        total = 355
        for (name, a, b), col in zip(self.PARTS, palette):
            xa = x0 + (x1 - x0) * a / total
            xb = x0 + (x1 - x0) * b / total
            lab = Image.new("RGBA", (max(10, int(xb - xa)), 150), (0, 0, 0, 0))
            d = ImageDraw.Draw(lab)
            fs = 30
            fn = font("display", fs)
            words = name.split(" ")
            yy = 6
            for w in wrap(name, fn, xb - xa - 12):
                d.text((8, yy), w, font=fn, fill=(255, 255, 255, 240))
                yy += 38
            tm = f"{a // 60}:{a % 60:02d}"
            d.text((8, yy + 4), tm, font=font("body", 24), fill=(220, 220, 220, 200))
            self.blocks.append((xa, xb, col, Layer(lab)))

    def base(self, t):
        f = self.bg.copy()
        text_anim(f, self.head, 80, 100, t, 0.1, 20)
        text_anim(f, self.sub, 80, 100 + self.head.h - 30, t, 0.4, 12)
        y0, y1 = 520, 640
        for i, (xa, xb, col, lab) in enumerate(self.blocks):
            p = ease_out((t - 0.8 - i * 0.45) / 0.6)
            if p <= 0:
                continue
            xe = int(xa + (xb - xa - 6) * p)
            f[y0:y1, int(xa):xe] = f[y0:y1, int(xa):xe] * 0.15 + np.array(col, np.float32) * 0.85
            over(f, lab, xa - 40 + 0, y1 + 10 - 40 + 40, p)
        ph = ease((t - 3.8) / max(1, self.dur - 4.5))
        if t > 3.8:
            x = int(120 + (W - 240) * ph)
            f[y0 - 30:y1 + 10, x:x + 4] = 255
        return f


class KaraokeIntro(Clip):
    def __init__(self, vo="", dur=7.0):
        self.theme, self.vo, self.dur_override = "karaoke", vo, dur
        self.show_tag = False
        self.screen = "KARAOKE! · Queen — „Bohemian Rhapsody” · Piedalieties arī jūs — dziediet kopā ar mums!"

    @property
    def dur(self):
        return self.dur_override

    def prepare(self):
        acc = THEMES["karaoke"]["accent"]
        self.bg = theme_bg("karaoke")
        big = text_block([("KARAOKE!", font("display_black", 230), (255, 255, 255, 255), 0, 1.0)], 1800, shadow=False, align="center")
        glow = Image.new("RGBA", big.size, acc + (0,))
        glow.putalpha(big.split()[3].filter(ImageFilter.GaussianBlur(28)))
        self.big, self.glow = Layer(big), Layer(glow)
        self.artist = Layer(text_block([("Queen — „Bohemian Rhapsody”", font("serif", 84), (255, 230, 245, 255), 0, 1.1)], 1800, align="center"))
        self.call = Layer(text_block([("🎤  Piedalieties arī jūs — dziediet kopā ar mums!".replace("🎤  ", ""), font("display", 54), (255, 255, 255, 255), 0, 1.2)], 1800, align="center"))
        self.beams = _beams()

    def base(self, t):
        f = self.bg.copy()
        _draw_beams(f, self.beams, t)
        pulse = 0.65 + 0.35 * math.sin(t * 4.2) ** 2
        p = ease_out(t / 0.7)
        cx = (W - self.big.w) / 2
        over(f, self.glow, cx, 140, p * pulse)
        over(f, self.big, cx, 140 + (1 - p) * 40, p)
        text_anim(f, self.artist, (W - self.artist.w) / 2, 470, t, 0.6, 20)
        text_anim(f, self.call, (W - self.call.w) / 2, 720, t, 1.4, 20)
        return f


def _beams():
    yy, xx = np.mgrid[0:H // 2, 0:W // 2].astype(np.float32)
    return yy, xx


def _draw_beams(f, grid, t):
    yy, xx = grid
    light = np.zeros_like(xx)
    for k, (ox, ph, col) in enumerate([(0.18, 0.0, 0), (0.5, 1.7, 1), (0.82, 3.1, 2)]):
        ang = 0.35 * math.sin(t * 0.9 + ph)
        dx = xx - ox * W / 2
        dy = yy + 20
        theta = np.arctan2(dx, dy) - ang
        beam = np.exp(-(theta / 0.11) ** 2) * np.clip(dy / (H / 2), 0, 1)
        light += beam
    light = np.clip(light, 0, 1.4)
    up = np.repeat(np.repeat(light, 2, 0), 2, 1)[..., None]
    f += up * np.array([110, 60, 150], np.float32) * 0.55
    np.clip(f, 0, 255, out=f)


class KaraokeStage(Clip):
    """Stage background for the sing-along. The lyric band is left empty on purpose:
    lyrics are added in CapCut (Text → Auto lyrics) after adding the licensed song there."""

    def __init__(self, dur=22.0):
        self.theme, self.dur_override = "karaoke", dur
        self.show_tag = False
        self.screen = "Karaoke skatuve (~22 s) — vieta dziesmas vārdiem (CapCut „Auto lyrics”), aicinājums dziedāt līdzi"
        self.vo = ""

    @property
    def dur(self):
        return self.dur_override

    def prepare(self):
        acc = THEMES["karaoke"]["accent"]
        self.bg = theme_bg("karaoke")
        self.beams = _beams()
        self.top = Layer(text_block([("Queen — „Bohemian Rhapsody”", font("display", 40), (255, 255, 255, 235), 0, 1.0)], 1500, align="center"))
        self.call = Layer(text_block([("Piedalieties arī jūs — dziediet līdzi!", font("display_bold", 46), acc + (255,), 0, 1.0)], 1500, align="center"))
        band = Image.new("RGBA", (1560, 300), (0, 0, 0, 0))
        ImageDraw.Draw(band).rounded_rectangle((0, 0, 1559, 299), 40, fill=(0, 0, 0, 120), outline=acc + (150,), width=3)
        self.band = Layer(band)
        note = Image.new("RGBA", (120, 120), (0, 0, 0, 0))
        ImageDraw.Draw(note).text((10, 0), "♪", font=font("symbol", 100), fill=acc + (200,))
        self.note = Layer(note)

    def base(self, t):
        f = self.bg.copy()
        _draw_beams(f, self.beams, t + 3)
        over(f, self.top, (W - self.top.w) / 2, 50, 1)
        over(f, self.band, (W - self.band.w) / 2, 560, 1)
        for k in range(5):
            x = 180 + k * 390 + 40 * math.sin(t * 1.3 + k)
            y = 330 + 30 * math.sin(t * 2.1 + k * 1.3)
            over(f, self.note, x, y, 0.35 + 0.25 * math.sin(t * 3 + k) ** 2)
        over(f, self.call, (W - self.call.w) / 2, 920, 0.75 + 0.25 * math.sin(t * 4) ** 2)
        acc = np.array(THEMES["karaoke"]["accent"], np.float32)
        prog = int(1560 * min(1, t / self.dur))
        x0 = (W - 1560) // 2
        f[880:886, x0:x0 + 1560] *= 0.4
        f[880:886, x0:x0 + prog] = acc
        return f


class ThanksCard(Clip):
    def __init__(self, dur=7.0):
        self.theme, self.dur_override = "intro", dur
        self.show_tag = False
        self.vo = ""
        self.screen = "„Paldies par uzmanību!”"

    @property
    def dur(self):
        return self.dur_override

    def prepare(self):
        acc = THEMES["intro"]["accent"]
        self.bg = theme_bg("intro")
        big = text_block([("Paldies par uzmanību!", font("serif", 150), (255, 255, 255, 255), 0, 1.0)], 1800, align="center")
        glow = Image.new("RGBA", big.size, acc + (0,))
        glow.putalpha(big.split()[3].filter(ImageFilter.GaussianBlur(30)).point(lambda v: int(v * 0.6)))
        self.big, self.glow = Layer(big), Layer(glow)

    def base(self, t):
        f = self.bg.copy()
        p = ease_out(t / 1.2)
        x, y = (W - self.big.w) / 2, (H - self.big.h) / 2
        over(f, self.glow, x, y, p * (0.6 + 0.4 * math.sin(t * 1.5) ** 2))
        over(f, self.big, x, y + (1 - p) * 30, p)
        if t > self.dur - 1.0:  # fade to black at the very end
            f *= max(0.0, (self.dur - t) / 1.0)
        return f


# ---------------------------------------------------------------- timing

WORDS_PER_SEC = 2.3  # calm presentation pace in Latvian


def vo_duration(vo, minimum=5.5):
    words = len(vo.split())
    return max(minimum, round(words / WORDS_PER_SEC + 1.1, 1))


class Timeline:
    def __init__(self, clips):
        self.clips = clips
        self.starts = []
        t = 0.0
        for i, c in enumerate(clips):
            self.starts.append(t)
            t += c.dur - (XF if i < len(clips) - 1 else 0)
        self.total = self.starts[-1] + clips[-1].dur
        self.overlays = []  # (t0, t1, Layer)

    def index(self, clip):
        return self.clips.index(clip)

    def start(self, clip):
        return self.starts[self.index(clip)]

    def end(self, clip):
        i = self.index(clip)
        return self.starts[i] + clip.dur

    def frame(self, T, prepared):
        active = [i for i, s in enumerate(self.starts) if s <= T < s + self.clips[i].dur]
        if not active:
            active = [len(self.clips) - 1]
        for i in list(prepared):
            if i < active[0]:
                c = self.clips[i]
                if hasattr(c, "reader"):
                    c.reader.close()
                c.release()
                prepared.discard(i)
        frames = []
        for i in active[-2:]:
            if i not in prepared:
                c = self.clips[i]
                if not hasattr(c, "_init_keys"):
                    c._init_keys = set(c.__dict__) | {"_init_keys"}
                c.prepare()
                prepared.add(i)
            frames.append((i, self.clips[i].render(T - self.starts[i])))
        if len(frames) == 2:
            (i, a), (j, b) = frames
            p = ease((T - self.starts[j]) / XF)
            f = a * (1 - p) + b * p
        else:
            f = frames[0][1]
        for t0, t1, lay in self.overlays:
            if t0 <= T < t1:
                op = min(1, (T - t0) / 0.8, (t1 - T) / 0.8)
                over(f, lay, 40, H - 44, op)
        return np.clip(f, 0, 255).astype(np.uint8)

// Stick-figure animation toolkit: an SVG scene graph driven by a paused GSAP timeline.
// Every frame is produced by seek(t): GSAP sets tweened values, then updaters redraw rigs.
const NS = "http://www.w3.org/2000/svg";
const W = 1920, H = 1080;
const INK = "#1d1a1f";
const PAPER = "#f6efe2";

const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
const updaters = [];  // fn(t) called every frame after the timeline seek (motion)
const drawers = [];   // fn(t) called after updaters (rendering of rigs)

function el(tag, attrs = {}, parent = null) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

function text(parent, str, x, y, opts = {}) {
  const t = el("text", {
    x, y, "text-anchor": opts.anchor || "middle", "font-family": opts.font || "Hand, Inter",
    "font-size": opts.size || 48, "font-weight": opts.weight || 700, fill: opts.fill || INK,
    "letter-spacing": opts.spacing || 0,
  }, parent);
  t.textContent = str;
  return t;
}

// Scene = a group shown between t0 and t1 with fades.
function scene(t0, t1, fade = 0.6) {
  const g = el("g", { opacity: 0 }, document.getElementById("stage"));
  tl.set(g, { attr: { opacity: 1 } }, t0);
  tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: fade, ease: "none" }, t0);
  tl.to(g, { opacity: 0, duration: fade, ease: "none" }, t1 - fade);
  tl.set(g, { display: "none" }, t1);
  tl.set(g, { display: "inline" }, t0);
  g.t0 = t0; g.t1 = t1;
  return g;
}

// Appear / disappear helpers for any element (opacity + slight scale pop)
function popIn(node, t, dur = 0.5, from = 0.6) {
  tl.fromTo(node, { opacity: 0, scale: from, transformOrigin: "50% 50%" },
    { opacity: 1, scale: 1, duration: dur, ease: "back.out(1.7)" }, t);
}
function fadeIn(node, t, dur = 0.6) { tl.fromTo(node, { opacity: 0 }, { opacity: 1, duration: dur, ease: "none" }, t); }
function fadeOut(node, t, dur = 0.6) { tl.to(node, { opacity: 0, duration: dur, ease: "none" }, t); }

// Draw-on effect for stroked paths
function drawOn(path, t, dur = 1) {
  const len = path.getTotalLength();
  path.setAttribute("stroke-dasharray", len);
  tl.fromTo(path, { attr: { "stroke-dashoffset": len } }, { attr: { "stroke-dashoffset": 0 }, duration: dur, ease: "power1.inOut" }, t);
}

const rad = d => d * Math.PI / 180;

// ------------------------------------------------------------------ stick figure rig
// Angles in degrees: 0 = limb hanging straight down, positive = towards facing direction.
class Figure {
  constructor(parent, o = {}) {
    this.o = Object.assign({
      x: 960, y: 900, s: 1, face: 1, lean: 0, tilt: 0,
      aL: [10, 10], aR: [-10, -10], lL: [6, 0], lR: [-6, 0], bob: 0,
      mouth: "smile", eyes: "open", costume: "plain", color: "#4a6fa5", stroke: INK, opacity: 1,
      headTurn: 0, lookY: 0,
    }, o);
    this.g = el("g", {}, parent);
    this.back = el("g", {}, this.g);   // behind body (hood, cape, hair back)
    this.body = el("g", {}, this.g);
    this.front = el("g", {}, this.g);  // costume over body
    this.headG = el("g", {}, this.g);
    const sw = 9;
    const line = (p) => el("path", { fill: "none", stroke: this.o.stroke, "stroke-width": sw, "stroke-linecap": "round", "stroke-linejoin": "round" }, p);
    this.legL = line(this.body); this.legR = line(this.body);
    this.torso = line(this.body);
    this.armL = line(this.body); this.armR = line(this.body);
    this.extra = el("g", {}, this.front);
    this.armFront = el("g", {}, this.g);  // a sleeve/arm copy drawn above costume
    this.held = el("g", {}, this.g);      // props in hand
    this.buildCostume();
    drawers.push(() => this.draw());
  }

  pt(base, ang, len) { // returns point from base along angle (0 = down), respecting facing
    const a = rad(ang) * this.o.face;
    return [base[0] + Math.sin(a) * len, base[1] + Math.cos(a) * len];
  }

  joints() {
    const o = this.o;
    const hip = [0, -110 + o.bob];
    const lean = o.lean;
    const neck = this.pt(hip, 180 - lean, 90);
    const shoulder = this.pt(hip, 180 - lean, 80);
    const head = this.pt(hip, 180 - lean - o.tilt * 0.3, 128);
    const kneeL = this.pt(hip, o.lL[0], 55), footL = this.pt(kneeL, o.lL[0] + o.lL[1], 55);
    const kneeR = this.pt(hip, o.lR[0], 55), footR = this.pt(kneeR, o.lR[0] + o.lR[1], 55);
    const elbL = this.pt(shoulder, o.aL[0], 46), handL = this.pt(elbL, o.aL[0] + o.aL[1], 44);
    const elbR = this.pt(shoulder, o.aR[0], 46), handR = this.pt(elbR, o.aR[0] + o.aR[1], 44);
    return { hip, neck, shoulder, head, kneeL, footL, kneeR, footR, elbL, handL, elbR, handR };
  }

  draw() {
    const o = this.o, j = this.joints();
    this.j = j;
    const P = (...pts) => "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
    this.legL.setAttribute("d", P(j.hip, j.kneeL, j.footL));
    this.legR.setAttribute("d", P(j.hip, j.kneeR, j.footR));
    this.torso.setAttribute("d", P(j.hip, j.neck));
    this.armL.setAttribute("d", P(j.shoulder, j.elbL, j.handL));
    this.armR.setAttribute("d", P(j.shoulder, j.elbR, j.handR));
    this.headG.setAttribute("transform", `translate(${j.head[0]} ${j.head[1]}) rotate(${o.tilt * o.face}) scale(${o.face} 1)`);
    this.drawCostume(j);
    this.g.setAttribute("transform", `translate(${o.x} ${o.y}) scale(${o.s})`);
    this.g.setAttribute("opacity", o.opacity);
    this.drawFace();
    // keep held props at the hand
    if (this.heldAt) {
      const h = this.heldAt === "L" ? j.handL : j.handR;
      const ang = (this.heldAt === "L" ? o.aL[0] + o.aL[1] : o.aR[0] + o.aR[1]) * o.face;
      this.held.setAttribute("transform", `translate(${h[0]} ${h[1]}) rotate(${-ang + (this.heldRot || 0) * o.face}) scale(${o.face} 1)`);
    }
  }

  hold(node, hand = "R", rot = 0) { this.held.appendChild(node); this.heldAt = hand; this.heldRot = rot; }

  // ---------------- faces
  buildFace() {
    const h = this.headG;
    this.skull = el("circle", { r: 30, fill: "#fffaf0", stroke: this.o.stroke, "stroke-width": 8 }, h);
    this.eyeL = el("ellipse", { cx: 4, cy: -4, rx: 3.6, ry: 4.5, fill: INK }, h);
    this.eyeR = el("ellipse", { cx: 18, cy: -4, rx: 3.6, ry: 4.5, fill: INK }, h);
    this.mouthP = el("path", { fill: "none", stroke: INK, "stroke-width": 4, "stroke-linecap": "round" }, h);
    this.faceTop = el("g", {}, h);
  }

  drawFace() {
    const o = this.o;
    const closed = o.eyes === "closed";
    for (const e of [this.eyeL, this.eyeR]) e.setAttribute("ry", closed ? 0.8 : (o.eyes === "wide" ? 6 : 4.5));
    const m = {
      smile: "M2 10 Q12 19 22 9", grin: "M0 8 Q12 24 24 7 Z", flat: "M3 12 L21 12", sad: "M3 16 Q12 7 21 16",
      o: "M8 12 a4.5 5.5 0 1 0 9 0 a4.5 5.5 0 1 0 -9 0", sing: "M6 9 Q12 26 19 9 Z", none: "",
    }[o.mouth] || "";
    this.mouthP.setAttribute("d", m);
    this.mouthP.setAttribute("fill", (o.mouth === "grin" || o.mouth === "sing") ? "#7a2430" : "none");
  }

  // ---------------- costumes
  buildCostume() {
    const c = this.o.costume;
    const f = this.front, b = this.back;
    if (c === "monk") {
      this.robe = el("path", { fill: "#7b5a3c", stroke: INK, "stroke-width": 7, "stroke-linejoin": "round" }, f);
      this.rope = el("path", { fill: "none", stroke: "#e8d2a0", "stroke-width": 6, "stroke-linecap": "round" }, f);
      this.hood = el("path", { fill: "#6a4b30", stroke: INK, "stroke-width": 7 }, b);
    } else if (c === "coat") {      // Beethoven: dark tailcoat
      this.coat = el("path", { fill: "#2c3e66", stroke: INK, "stroke-width": 7, "stroke-linejoin": "round" }, f);
      this.cravat = el("path", { fill: "#ffffff", stroke: INK, "stroke-width": 4 }, f);
      this.scarf = el("path", { fill: "#b8322f", stroke: INK, "stroke-width": 4 }, f);
    } else if (c === "freddie") {   // white tank top, white trousers, yellow jacket
      this.pants = el("path", { fill: "none", stroke: "#f4f1ea", "stroke-width": 20, "stroke-linecap": "round", "stroke-linejoin": "round" }, f);
      this.pantsL = el("path", { fill: "none", stroke: "#f4f1ea", "stroke-width": 20, "stroke-linecap": "round", "stroke-linejoin": "round" }, f);
      this.stripe = el("path", { fill: "none", stroke: "#c8302c", "stroke-width": 4 }, f);
      this.tank = el("path", { fill: "#ffffff", stroke: INK, "stroke-width": 6, "stroke-linejoin": "round" }, f);
      this.jacket = el("path", { fill: "#f2c230", stroke: INK, "stroke-width": 6, "stroke-linejoin": "round" }, f);
      this.sleeveL = el("path", { fill: "none", stroke: "#f2c230", "stroke-width": 16, "stroke-linecap": "round", "stroke-linejoin": "round" }, this.armFront);
      this.sleeveR = el("path", { fill: "none", stroke: "#f2c230", "stroke-width": 16, "stroke-linecap": "round", "stroke-linejoin": "round" }, this.armFront);
    } else if (c === "robot") {     // Daft Punk: black leather suits
      this.suit = el("path", { fill: "#1b1b22", stroke: INK, "stroke-width": 6, "stroke-linejoin": "round" }, f);
      this.sleeveL = el("path", { fill: "none", stroke: "#1b1b22", "stroke-width": 15, "stroke-linecap": "round", "stroke-linejoin": "round" }, this.armFront);
      this.sleeveR = el("path", { fill: "none", stroke: "#1b1b22", "stroke-width": 15, "stroke-linecap": "round", "stroke-linejoin": "round" }, this.armFront);
      this.pants = el("path", { fill: "none", stroke: "#1b1b22", "stroke-width": 17, "stroke-linecap": "round", "stroke-linejoin": "round" }, f);
      this.pantsL = el("path", { fill: "none", stroke: "#1b1b22", "stroke-width": 17, "stroke-linecap": "round", "stroke-linejoin": "round" }, f);
    } else if (c === "shirt") {
      this.shirt = el("path", { fill: this.o.color, stroke: INK, "stroke-width": 6, "stroke-linejoin": "round" }, f);
    } else if (c === "dress") {
      this.dress = el("path", { fill: this.o.color, stroke: INK, "stroke-width": 6, "stroke-linejoin": "round" }, f);
    }
    this.buildFace();
    const h = this.headG;
    const hair = this.o.hair || { monk: "tonsure", coat: "beethoven", freddie: "freddie", robot: "none" }[c];
    if (hair === "tonsure") {
      el("path", { d: "M-30 -2 Q-34 -26 -14 -30 M30 -2 Q34 -26 14 -30", fill: "none", stroke: "#5b3b22", "stroke-width": 9, "stroke-linecap": "round" }, h);
    } else if (hair === "beethoven") {
      // wild, greying mane — drawn behind and around the head
      const spikes = [];
      for (let i = 0; i <= 16; i++) {
        const a = -200 + i * 14.5, r = (i % 2 ? 47 : 34) + (i * 7 % 5);
        spikes.push([Math.cos(rad(a)) * r - 4, Math.sin(rad(a)) * r - 4]);
      }
      const d = "M" + spikes.map(p => p.map(v => v.toFixed(1)).join(" ")).join(" L") + " L 30 6 L -32 10 Z";
      const mane = el("path", { d, fill: this.o.maneColor || "#6d6a6e", stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, h);
      h.insertBefore(mane, h.firstChild);
      el("path", { d: "M-6 -16 L4 -10 M12 -10 L24 -15", stroke: INK, "stroke-width": 5, "stroke-linecap": "round" }, this.faceTop); // stern brows
    } else if (hair === "freddie") {
      el("path", { d: "M-31 -2 Q-34 -34 2 -36 Q34 -36 31 -6 Q22 -22 2 -22 Q-14 -22 -24 -4 Z", fill: INK }, h);
      el("path", { d: "M1 6 Q12 2 23 6 Q24 10 21 10 Q12 7 3 10 Q0 10 1 6 Z", fill: INK }, this.faceTop); // moustache
    } else if (hair === "long") {
      const m = el("path", { d: "M-32 0 Q-36 -36 0 -38 Q36 -36 32 0 L36 38 L20 30 L20 -10 L-22 -10 L-22 30 L-38 38 Z", fill: this.o.hairColor || "#7a4a24", stroke: INK, "stroke-width": 4 }, h);
      h.insertBefore(m, h.firstChild);
    } else if (hair === "short") {
      el("path", { d: "M-30 -6 Q-30 -34 0 -35 Q30 -34 30 -6 Q18 -24 0 -22 Q-18 -24 -30 -6 Z", fill: this.o.hairColor || "#4a3020" }, h);
    }
    if (c === "robot") this.buildHelmet(this.o.helmet || "silver");
  }

  buildHelmet(kind) {
    const h = this.headG;
    // hide the face, draw a helmet
    for (const e of [this.eyeL, this.eyeR, this.mouthP]) e.setAttribute("display", "none");
    this.skull.setAttribute("display", "none");
    if (kind === "silver") {
      el("path", { d: "M-34 18 Q-38 -40 2 -42 Q40 -40 36 18 Q34 34 2 36 Q-32 34 -34 18 Z", fill: "url(#chrome)", stroke: INK, "stroke-width": 6 }, h);
      el("path", { d: "M-26 -14 Q2 -22 30 -14 L28 14 Q2 22 -24 14 Z", fill: "#101016", stroke: INK, "stroke-width": 3 }, h);
      this.led = el("g", {}, h);
      for (let i = 0; i < 6; i++) el("rect", { x: -18 + i * 7.5, y: -2, width: 5, height: 5, rx: 1, fill: "#ff4040" }, this.led);
    } else {
      el("path", { d: "M-34 16 Q-38 -40 2 -42 Q40 -40 36 16 Q36 36 2 38 Q-32 36 -34 16 Z", fill: "url(#gold)", stroke: INK, "stroke-width": 6 }, h);
      el("path", { d: "M-28 -20 L32 -20 L30 18 Q2 26 -26 18 Z", fill: "#16121a", stroke: INK, "stroke-width": 3 }, h);
      this.led = el("g", {}, h);
      // LED picture (a heart) behind the dark visor
      const heart = ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"];
      heart.forEach((row, r) => [...row].forEach((v, c) => { if (v === "1") el("rect", { x: -18 + c * 5, y: -12 + r * 5, width: 4, height: 4, fill: "#ff5a7a" }, this.led); }));
    }
  }

  drawCostume(j) {
    const c = this.o.costume;
    const P = (...pts) => "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
    const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
    if (c === "monk") {
      const hemL = [Math.min(j.kneeL[0], j.kneeR[0]) - 34, Math.max(j.kneeL[1], j.kneeR[1]) + 36];
      const hemR = [Math.max(j.kneeL[0], j.kneeR[0]) + 34, Math.max(j.kneeL[1], j.kneeR[1]) + 36];
      this.robe.setAttribute("d", P(off(j.neck, -16, 6), off(j.neck, 16, 6), hemR, hemL) + " Z");
      this.rope.setAttribute("d", P(off(j.hip, -24, -6), off(j.hip, 24, -6)));
      this.hood.setAttribute("d", `M${j.head[0] - 40} ${j.head[1] + 30} Q${j.head[0]} ${j.head[1] + 58} ${j.head[0] + 40} ${j.head[1] + 30} L${j.neck[0] + 26} ${j.neck[1] + 10} L${j.neck[0] - 26} ${j.neck[1] + 10} Z`);
    } else if (c === "coat") {
      const tail = [j.hip[0] - 22 * this.o.face, j.hip[1] + 58];
      this.coat.setAttribute("d", P(off(j.neck, -24, 2), off(j.neck, 24, 2), off(j.hip, 24, 12), off(j.hip, 6, 30), tail, off(j.hip, -26, 12)) + " Z");
      this.cravat.setAttribute("d", P(off(j.neck, -11, -6), off(j.neck, 11, -6), off(j.neck, 7, 24), off(j.neck, -7, 24)) + " Z");
      this.scarf.setAttribute("d", P(off(j.neck, -13, 18), off(j.neck, 13, 18), off(j.neck, 8, 32), off(j.neck, -8, 32)) + " Z");
    } else if (c === "freddie") {
      this.pants.setAttribute("d", P(j.hip, j.kneeR, j.footR));
      this.pantsL.setAttribute("d", P(j.hip, j.kneeL, j.footL));
      this.stripe.setAttribute("d", P(off(j.hip, 6, 0), off(j.kneeR, 6, 0), off(j.footR, 6, -6)));
      this.tank.setAttribute("d", P(off(j.neck, -16, 4), off(j.neck, 16, 4), off(j.hip, 18, 6), off(j.hip, -18, 6)) + " Z");
      this.jacket.setAttribute("d", P(off(j.neck, -26, 0), off(j.neck, -12, 4), off(j.hip, -12, 10), off(j.hip, -28, 10)) + " Z " + P(off(j.neck, 26, 0), off(j.neck, 12, 4), off(j.hip, 12, 10), off(j.hip, 28, 10)) + " Z");
      this.sleeveL.setAttribute("d", P(j.shoulder, j.elbL, this.lerp(j.elbL, j.handL, 0.7)));
      this.sleeveR.setAttribute("d", P(j.shoulder, j.elbR, this.lerp(j.elbR, j.handR, 0.7)));
    } else if (c === "robot") {
      if (!this.gloveL) {
        const gc = this.o.helmet === "gold" ? "#e0b030" : "#c9ced6";
        this.gloveL = el("circle", { r: 9, fill: gc, stroke: INK, "stroke-width": 3 }, this.armFront);
        this.gloveR = el("circle", { r: 9, fill: gc, stroke: INK, "stroke-width": 3 }, this.armFront);
      }
      this.gloveL.setAttribute("cx", j.handL[0]); this.gloveL.setAttribute("cy", j.handL[1]);
      this.gloveR.setAttribute("cx", j.handR[0]); this.gloveR.setAttribute("cy", j.handR[1]);
      this.suit.setAttribute("d", P(off(j.neck, -22, 2), off(j.neck, 22, 2), off(j.hip, 22, 10), off(j.hip, -22, 10)) + " Z");
      this.sleeveL.setAttribute("d", P(j.shoulder, j.elbL, this.lerp(j.elbL, j.handL, 0.8)));
      this.sleeveR.setAttribute("d", P(j.shoulder, j.elbR, this.lerp(j.elbR, j.handR, 0.8)));
      this.pants.setAttribute("d", P(j.hip, j.kneeR, j.footR));
      this.pantsL.setAttribute("d", P(j.hip, j.kneeL, j.footL));
    } else if (c === "shirt") {
      this.shirt.setAttribute("d", P(off(j.neck, -18, 4), off(j.neck, 18, 4), off(j.hip, 18, 6), off(j.hip, -18, 6)) + " Z");
    } else if (c === "dress") {
      this.dress.setAttribute("d", P(off(j.neck, -14, 4), off(j.neck, 14, 4), off(j.hip, 42, 64), off(j.hip, -42, 64)) + " Z");
    }
  }

  lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

  // tween pose params: fig.to({aR:[120,-30]}, at, dur)
  to(props, at, dur = 0.5, ease = "power2.inOut") {
    const flat = {};
    for (const [k, v] of Object.entries(props)) {
      if (Array.isArray(v)) {
        // arrays: tween element-wise through a proxy
        const arr = this.o[k];
        tl.to(arr, { 0: v[0], 1: v[1], duration: dur, ease }, at);
      } else flat[k] = v;
    }
    if (Object.keys(flat).length) tl.to(this.o, Object.assign({ duration: dur, ease }, flat), at);
    return this;
  }
  set(props, at) {
    for (const [k, v] of Object.entries(props)) {
      if (Array.isArray(v)) tl.set(this.o[k], { 0: v[0], 1: v[1] }, at);
      else tl.set(this.o, { [k]: v }, at);
    }
    return this;
  }
  // walk from current x to x2 between t0..t1 (procedural leg/arm swing)
  walk(x2, t0, t1, speed = 2.2) {
    const self = this;
    const st = { x: null };
    tl.to(this.o, { x: x2, duration: t1 - t0, ease: "none" }, t0);
    updaters.push((t) => {
      if (t < t0 || t > t1) return;
      const ph = (t - t0) * speed * Math.PI * 2;
      const s = Math.sin(ph);
      self.o.lL[0] = 24 * s; self.o.lL[1] = s > 0 ? -18 * s : 0;
      self.o.lR[0] = -24 * s; self.o.lR[1] = s < 0 ? 18 * s : 0;
      self.o.aL[0] = -22 * s; self.o.aR[0] = 22 * s;
      self.o.bob = -Math.abs(Math.cos(ph)) * 5;
    });
    return this;
  }
  // repeating motion between t0..t1: fn(fig.o, localTime)
  loop(t0, t1, fn) {
    const self = this;
    updaters.push((t) => { if (t >= t0 && t <= t1) fn(self.o, t - t0); });
    return this;
  }
}

// ------------------------------------------------------------------ props
function noteGlyph(parent, x, y, s = 1, color = INK) {
  const g = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el("ellipse", { cx: 0, cy: 0, rx: 13, ry: 9.5, transform: "rotate(-20)", fill: color }, g);
  el("path", { d: "M11 -3 L11 -58 Q22 -46 30 -40", fill: "none", stroke: color, "stroke-width": 5, "stroke-linecap": "round" }, g);
  return g;
}

function floatNotes(parent, t0, t1, area, n = 8, color = INK) {
  // notes rising and fading — reused for "music is playing"
  const g = el("g", {}, parent);
  const notes = [];
  for (let i = 0; i < n; i++) notes.push({ g: noteGlyph(g, 0, 0, 0.7 + (i % 3) * 0.15, color), ph: i / n, dx: (i * 37) % 60 - 30 });
  updaters.push((t) => {
    for (const nt of notes) {
      if (t < t0 || t > t1) { nt.g.setAttribute("opacity", 0); continue; }
      const p = ((t - t0) * 0.35 + nt.ph) % 1;
      const x = area.x + nt.dx + Math.sin(p * 6 + nt.ph * 9) * 30 + (area.dx || 0) * p;
      const y = area.y - p * (area.h || 220);
      nt.g.setAttribute("transform", `translate(${x} ${y}) scale(${0.8 + p * 0.3}) rotate(${Math.sin(p * 5) * 15})`);
      nt.g.setAttribute("opacity", Math.sin(p * Math.PI) * Math.min(1, (t - t0) * 2, (t1 - t) * 2));
    }
  });
  return g;
}

function piano(parent, x, y, s = 1, kind = "grand") {
  const g = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  if (kind === "grand") {
    el("path", { d: "M-170 -120 L150 -120 Q260 -120 250 -60 Q240 -10 150 -10 L-170 -10 Z", fill: "#2a2226", stroke: INK, "stroke-width": 7 }, g);
    el("path", { d: "M-160 -120 L60 -210 L80 -200 L-130 -118", fill: "#3a3036", stroke: INK, "stroke-width": 6 }, g);  // lid
    el("rect", { x: -175, y: -14, width: 210, height: 26, fill: "#fffaf0", stroke: INK, "stroke-width": 5 }, g);
    for (let i = 0; i < 14; i++) el("line", { x1: -172 + i * 15, y1: -12, x2: -172 + i * 15, y2: 10, stroke: INK, "stroke-width": 2 }, g);
    for (let i = 0; i < 14; i++) if (![2, 6, 9, 13].includes(i)) el("rect", { x: -166 + i * 15, y: -12, width: 8, height: 13, fill: INK }, g);
    for (const lx of [-150, 20, 200]) el("path", { d: `M${lx} -10 L${lx} 100`, stroke: INK, "stroke-width": 9, "stroke-linecap": "round" }, g);
  } else { // small fortepiano / upright for the child scene
    el("rect", { x: -120, y: -150, width: 240, height: 150, rx: 8, fill: "#8a5a34", stroke: INK, "stroke-width": 7 }, g);
    el("rect", { x: -120, y: -40, width: 240, height: 24, fill: "#fffaf0", stroke: INK, "stroke-width": 5 }, g);
    for (let i = 0; i < 16; i++) el("line", { x1: -120 + i * 15, y1: -38, x2: -120 + i * 15, y2: -18, stroke: INK, "stroke-width": 2 }, g);
    for (const lx of [-100, 100]) el("path", { d: `M${lx} 0 L${lx} 60`, stroke: INK, "stroke-width": 9, "stroke-linecap": "round" }, g);
  }
  return g;
}

function candle(parent, x, y, s = 1) {
  const g = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el("rect", { x: -10, y: -60, width: 20, height: 60, fill: "#fff4d6", stroke: INK, "stroke-width": 4 }, g);
  const fl = el("path", { d: "M0 -92 Q14 -72 0 -62 Q-14 -72 0 -92 Z", fill: "#ffb53a", stroke: "#c0601a", "stroke-width": 3 }, g);
  const glow = el("circle", { cx: 0, cy: -74, r: 70, fill: "url(#glow)" }, g);
  g.insertBefore(glow, g.firstChild);
  updaters.push((t) => fl.setAttribute("transform", `translate(0 ${-62}) scale(${1 + Math.sin(t * 13) * 0.07} ${1 + Math.sin(t * 9) * 0.1}) translate(0 62)`));
  return g;
}

function spotlight(parent, x, y, w, color = "#fff6c0", op = 0.35) {
  return el("path", { d: `M${x - 30} ${y} L${x + 30} ${y} L${x + w} 1000 L${x - w} 1000 Z`, fill: color, opacity: op }, parent);
}

function crowd(parent, x0, x1, y, n, opts = {}) {
  const g = el("g", {}, parent);
  const figs = [];
  const cols = ["#c0504d", "#4f81bd", "#9bbb59", "#8064a2", "#f79646", "#4bacc6"];
  for (let i = 0; i < n; i++) {
    const fx = x0 + (x1 - x0) * (i + 0.5) / n + ((i * 53) % 30 - 15);
    const f = new Figure(g, { x: fx, y: y + (i % 2) * 18, s: opts.s || 0.55, costume: "shirt", color: cols[i % cols.length], face: opts.face || 1, aL: [8, 8], aR: [-8, -8], hair: i % 3 === 0 ? "long" : "short", hairColor: ["#3a2a1a", "#8a5a2a", "#c89a50"][i % 3] });
    figs.push(f);
  }
  return figs;
}

function cheer(figs, t0, t1) {
  figs.forEach((f, i) => f.loop(t0, t1, (o, lt) => {
    const s = Math.sin(lt * 7 + i);
    o.aL[0] = 160 + s * 15; o.aL[1] = 10; o.aR[0] = -160 - s * 15; o.aR[1] = -10;
    o.bob = -Math.max(0, s) * 10; o.mouth = "grin";
  }));
}

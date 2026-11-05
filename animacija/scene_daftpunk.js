// Scene 3: Daft Punk (150–228 s) — digital era
(function () {
  const T0 = 150, T1 = 228.4;
  const S = scene(T0, T1, 0.8);
  const NEON = "#5ef2ff", PINK = "#ff4fb8";

  // dark club background + perspective neon grid
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#0b0e24" }, S);
  const grid = el("g", { stroke: NEON, "stroke-width": 2, opacity: 0.45 }, S);
  for (let i = -14; i <= 14; i++) el("line", { x1: 960 + i * 40, y1: 640, x2: 960 + i * 260, y2: 1080 }, grid);
  const hl = [];
  for (let k = 0; k < 9; k++) hl.push(el("line", { x1: 0, x2: 1920, y1: 700, y2: 700 }, grid));
  updaters.push(t => hl.forEach((l, k) => {
    const p = ((k / 9) + t * 0.18) % 1;
    const y = 640 + Math.pow(p, 2.2) * 440;
    l.setAttribute("y1", y); l.setAttribute("y2", y); l.setAttribute("opacity", p);
  }));
  el("rect", { x: 0, y: 0, width: 1920, height: 640, fill: "url(#dpSky)" }, S);
  const defs = document.querySelector("defs");
  const sky = el("linearGradient", { id: "dpSky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el("stop", { offset: 0, "stop-color": "#0b0e24" }, sky); el("stop", { offset: 1, "stop-color": "#2a1050" }, sky);
  // twinkling pixels
  const pix = [];
  for (let i = 0; i < 40; i++) pix.push(el("rect", { x: (i * 211) % 1900, y: (i * 97) % 560, width: 6, height: 6, fill: i % 2 ? NEON : PINK }, S));
  updaters.push(t => pix.forEach((p, i) => p.setAttribute("opacity", 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i)))));

  const label = el("g", {}, null);
  const title = text(label, "Daft Punk", 960, 120, { size: 110, font: "Hand", fill: NEON });
  title.setAttribute("style", "filter: drop-shadow(0 0 12px #5ef2ff)");
  const sub = text(label, "Parīze · 1993–2021", 960, 185, { size: 48, font: "Print", weight: 400, fill: "#d8d0ff" });
  popIn(label, 150.6, 0.8, 0.8);

  // ---------------- D1+D2 (150–182): studio, genres flow in
  const d1 = el("g", {}, S);
  // genre ribbons (left) → desk → mixed rainbow (right)
  const ribbons = [["HOUSE", "#4f9dff", 380], ["DISKO", PINK, 480], ["FANKS", "#ff9b3d", 580]].map(([name, col, y0], i) => {
    const g = el("g", { opacity: 0 }, d1);
    const p = el("path", { fill: "none", stroke: col, "stroke-width": 26, "stroke-linecap": "round", opacity: 0.85 }, g);
    const lb = text(g, name, 150, y0 - 30, { size: 56, font: "Hand", fill: col, anchor: "start" });
    tl.to(g, { opacity: 1, duration: 0.6 }, 163 + i * 2.2);
    updaters.push(t => {
      let d = "";
      for (let x = 120; x <= 660; x += 20) {
        const k = (x - 120) / 540;
        const y = y0 + (720 - y0) * Math.pow(k, 2) + Math.sin(x * 0.02 - t * 4 + i) * 22 * (1 - k);
        d += (d ? " L" : "M") + x + " " + y.toFixed(1);
      }
      p.setAttribute("d", d);
    });
    return g;
  });
  // icons on each ribbon: kick drum, disco ball, bass guitar
  const icons = el("g", {}, d1);
  const kick = el("g", { transform: "translate(380 330)" }, icons);
  el("circle", { r: 34, fill: "#24305a", stroke: "#4f9dff", "stroke-width": 6 }, kick); el("circle", { r: 12, fill: "#4f9dff" }, kick);
  const ball = el("g", { transform: "translate(420 430)" }, icons);
  el("circle", { r: 32, fill: "#c9ced6", stroke: INK, "stroke-width": 4 }, ball);
  for (let k = -2; k <= 2; k++) el("line", { x1: -32, y1: k * 12, x2: 32, y2: k * 12, stroke: "#7d8490", "stroke-width": 2 }, ball);
  const bass = el("g", { transform: "translate(440 528) rotate(-30)" }, icons);
  el("path", { d: "M-40 0 Q-40 -26 -12 -18 Q0 -30 12 -18 Q30 -26 30 0 Q30 24 0 18 Q-40 26 -40 0 Z", fill: "#ff9b3d", stroke: INK, "stroke-width": 4 }, bass);
  el("rect", { x: 28, y: -5, width: 110, height: 10, fill: "#7a4a24", stroke: INK, "stroke-width": 3 }, bass);
  [kick, ball, bass].forEach((ic, i) => { tl.set(ic, { opacity: 0 }, 150); popIn(ic, 163.3 + i * 2.2, 0.5); });
  updaters.push(t => kick.setAttribute("transform", `translate(380 330) scale(${1 + Math.max(0, Math.sin(t * 8.4)) * 0.15})`));
  // output: one combined rainbow wave
  const out = el("g", { opacity: 0 }, d1);
  const outCols = ["#ff5a5a", "#ffb347", "#ffe066", "#6fdc8c", "#5ab0ff", "#b07cff"];
  const outP = outCols.map((c, i) => el("path", { fill: "none", stroke: c, "stroke-width": 9, "stroke-linecap": "round" }, out));
  updaters.push(t => outP.forEach((p, i) => {
    let d = "";
    for (let x = 1290; x <= 1880; x += 16) {
      const y = 720 - 160 * ((x - 1290) / 590) + (i - 2.5) * 12 + Math.sin(x * 0.03 - t * 6) * 26 * Math.sin((x - 1290) / 590 * Math.PI);
      d += (d ? " L" : "M") + x + " " + y.toFixed(1);
    }
    p.setAttribute("d", d);
  }));
  tl.to(out, { opacity: 1, duration: 0.8 }, 169.5);
  // desk with computer, synthesizer, mixer
  const desk = el("g", {}, d1);
  el("rect", { x: 640, y: 720, width: 640, height: 44, rx: 8, fill: "#22263f", stroke: NEON, "stroke-width": 4 }, desk);
  el("path", { d: "M690 764 L690 960 M1230 764 L1230 960", stroke: "#22263f", "stroke-width": 16 }, desk);
  el("rect", { x: 890, y: 580, width: 140, height: 100, rx: 8, fill: "#111", stroke: "#c9ced6", "stroke-width": 5 }, desk);  // monitor
  const wave = el("path", { fill: "none", stroke: NEON, "stroke-width": 4 }, desk);
  el("path", { d: "M960 680 L960 720 M930 720 L990 720", stroke: "#c9ced6", "stroke-width": 6 }, desk);
  el("rect", { x: 660, y: 690, width: 170, height: 30, rx: 4, fill: "#fff", stroke: INK, "stroke-width": 4 }, desk);   // synth keys
  for (let k = 0; k < 10; k++) el("rect", { x: 670 + k * 16, y: 692, width: 7, height: 16, fill: INK }, desk);
  const knobs = [];
  for (let k = 0; k < 6; k++) knobs.push(el("circle", { cx: 1110 + (k % 3) * 40, cy: 692 + Math.floor(k / 3) * 20, r: 8, fill: ["#ff5a5a", "#ffe066", "#5ab0ff"][k % 3] }, desk));
  updaters.push(t => {
    let d = "";
    for (let x = 900; x <= 1020; x += 5) d += (d ? " L" : "M") + x + " " + (630 + Math.sin(x * 0.2 + t * 8) * 18 * Math.sin((x - 910) / 120 * Math.PI)).toFixed(1);
    wave.setAttribute("d", d);
    knobs.forEach((k, i) => k.setAttribute("opacity", 0.5 + 0.5 * Math.abs(Math.sin(t * 3 + i))));
  });
  // the two robots rise from behind the desk
  const thomas = new Figure(d1, { x: 800, y: 960, s: 1.75, costume: "robot", helmet: "silver", face: 1, aL: [60, 50], aR: [70, 40] });
  const guyman = new Figure(d1, { x: 1120, y: 960, s: 1.75, costume: "robot", helmet: "gold", face: -1, aL: [60, 50], aR: [70, 40] });
  d1.insertBefore(thomas.g, desk); d1.insertBefore(guyman.g, desk);
  [thomas, guyman].forEach((r, i) => {
    tl.set(r.o, { opacity: 0 }, 150);
    tl.fromTo(r.o, { opacity: 0, y: 1010 }, { opacity: 1, y: 960, duration: 1.2, ease: "back.out(1.6)" }, 153 + i * 0.4);
    r.loop(156, 182, (o, lt) => {   // nodding to the beat, hands on the gear
      o.bob = -Math.abs(Math.sin(lt * 4.2)) * 6; o.tilt = Math.sin(lt * 4.2) * 6;
      o.aR[1] = 40 + Math.sin(lt * 9 + i) * 15; o.aL[1] = 50 + Math.cos(lt * 8 + i) * 15;
    });
  });
  // vocoder: smooth voice wave → box → blocky robot wave (172–182)
  const voc = el("g", { opacity: 0 }, d1);
  const vIn = el("path", { fill: "none", stroke: "#fff", "stroke-width": 5 }, voc);
  el("rect", { x: 1230, y: 250, width: 90, height: 70, rx: 10, fill: "#2a2a44", stroke: NEON, "stroke-width": 5 }, voc);
  el("circle", { cx: 1275, cy: 285, r: 14, fill: NEON }, voc);
  const vOut = el("path", { fill: "none", stroke: NEON, "stroke-width": 5 }, voc);
  const mic = el("g", { transform: "translate(1000 340)" }, voc);
  el("rect", { x: -10, y: -30, width: 20, height: 40, rx: 10, fill: "#c9ced6", stroke: INK, "stroke-width": 3 }, mic);
  updaters.push(t => {
    let a = "", b = "";
    for (let x = 1020; x <= 1230; x += 6) a += (a ? " L" : "M") + x + " " + (285 + Math.sin(x * 0.08 - t * 7) * 20).toFixed(1);
    for (let x = 1320; x <= 1560; x += 12) { const y = 285 + Math.sign(Math.sin(x * 0.08 - t * 7)) * 20; b += (b ? " L" : "M") + x + " " + y + " L" + (x + 12) + " " + y; }
    vIn.setAttribute("d", a); vOut.setAttribute("d", b);
  });
  tl.to(voc, { opacity: 1, duration: 0.6 }, 174);
  fadeOut(d1, 181.4, 0.6);

  // ---------------- D3 (182–204): three famous tracks
  const tracks = [
    ["One More Time", "2000", "#ff4fb8", 182],
    ["Harder, Better, Faster, Stronger", "2001", "#5ef2ff", 189.3],
    ["Get Lucky", "2013", "#ffd24a", 196.6],
  ];
  tracks.forEach(([name, yr, col, t0], idx) => {
    const g = el("g", { opacity: 0 }, S);
    tl.to(g, { opacity: 1, duration: 0.5 }, t0);
    tl.to(g, { opacity: 0, duration: 0.5 }, t0 + 7.0);
    const rec = el("g", {}, g);
    el("circle", { r: 230, fill: "#111", stroke: "#333", "stroke-width": 4 }, rec);
    for (let r = 120; r < 226; r += 12) el("circle", { r, fill: "none", stroke: "#2a2a2a", "stroke-width": 3 }, rec);
    el("circle", { r: 90, fill: col }, rec);
    el("path", { d: "M-60 -20 Q0 -70 60 -20", fill: "none", stroke: "#fff", "stroke-width": 6, opacity: 0.5 }, rec);
    el("circle", { r: 10, fill: "#111" }, rec);
    updaters.push(t => {
      const slide = Math.min(1, Math.max(0, (t - t0) / 0.9));
      const e = 1 - Math.pow(1 - slide, 3);
      rec.setAttribute("transform", `translate(${2200 - 1600 * e} 600) rotate(${t * 200})`);
    });
    const tt = text(g, `„${name}”`, 1180, 330, { size: name.length > 20 ? 64 : 84, font: "Hand", fill: "#fff" });
    text(g, yr, 1180, 410, { size: 56, font: "Print", weight: 400, fill: col });
    // a small vignette per track, right side
    const v = el("g", { transform: "translate(1180 760)" }, g);
    if (idx === 0) {               // party: crowd jumps, confetti
      const fans = crowd(v, -380, 380, 0, 6, { s: 0.8 });
      cheer(fans, t0 + 0.5, t0 + 7.4);
      const conf = [];
      for (let k = 0; k < 40; k++) conf.push(el("rect", { width: 10, height: 16, fill: ["#ff4fb8", "#5ef2ff", "#ffd24a", "#6fdc8c"][k % 4] }, v));
      updaters.push(t => conf.forEach((c, k) => {
        const p = ((t - t0) * 0.5 + k / 40) % 1;
        c.setAttribute("transform", `translate(${-420 + (k * 97) % 840 + Math.sin(t * 3 + k) * 20} ${-420 + p * 420}) rotate(${t * 300 + k * 40})`);
      }));
    } else if (idx === 1) {        // faster and faster: equaliser bars accelerate
      const bars = [];
      for (let k = 0; k < 16; k++) bars.push(el("rect", { x: -400 + k * 50, y: 0, width: 36, height: 10, fill: k % 2 ? "#5ef2ff" : "#ff4fb8" }, v));
      updaters.push(t => {
        const sp = 4 + (t - t0) * 2.2;
        bars.forEach((b, k) => { const h = 30 + Math.abs(Math.sin(t * sp + k * 0.7)) * 200; b.setAttribute("y", -h); b.setAttribute("height", h); });
      });
    } else {                       // disco ball + dancing pair
      const dball = el("g", { transform: "translate(0 -330)" }, v);
      el("line", { x1: 0, y1: -120, x2: 0, y2: -50, stroke: "#999", "stroke-width": 4 }, dball);
      el("circle", { r: 55, fill: "#d9dde3", stroke: INK, "stroke-width": 4 }, dball);
      const facets = [];
      for (let k = 0; k < 18; k++) facets.push(el("rect", { x: -45 + (k % 6) * 15, y: -40 + Math.floor(k / 6) * 26, width: 12, height: 20, fill: "#fff" }, dball));
      updaters.push(t => facets.forEach((f, k) => f.setAttribute("opacity", 0.2 + 0.8 * Math.abs(Math.sin(t * 5 + k)))));
      const d1f = new Figure(v, { x: -90, y: 0, s: 0.9, costume: "shirt", color: "#ffd24a", hair: "short", face: 1 });
      const d2f = new Figure(v, { x: 90, y: 0, s: 0.9, costume: "dress", color: "#ff4fb8", hair: "long", face: -1 });
      [d1f, d2f].forEach((f, k) => f.loop(t0, t0 + 7.5, (o, lt) => {
        const s = Math.sin(lt * 5 + k * Math.PI);
        o.aR[0] = 140 + s * 30; o.aL[0] = -20 - s * 20; o.lL[0] = 15 * s; o.lR[0] = -15 * s; o.bob = -Math.abs(s) * 8; o.mouth = "grin"; o.lean = s * 6;
      }));
    }
  });

  // ---------------- D4 (204–216): the helmets = technology + human creativity
  const d4 = el("g", { opacity: 0 }, S);
  tl.to(d4, { opacity: 1, duration: 0.6 }, 204);
  tl.to(d4, { opacity: 0, duration: 0.6 }, 215.4);
  const bigT = new Figure(d4, { x: 700, y: 1500, s: 3.2, costume: "robot", helmet: "silver", face: 1 });
  const bigG = new Figure(d4, { x: 1220, y: 1500, s: 3.2, costume: "robot", helmet: "gold", face: -1 });
  [bigT, bigG].forEach((r, i) => r.loop(204, 216, (o, lt) => { o.tilt = Math.sin(lt * 1.5 + i) * 5; }));
  // scrolling red LED on the silver visor
  updaters.push(t => { if (bigT.led) bigT.led.setAttribute("transform", `translate(${((t * 30) % 40) - 20} 0)`); if (bigG.led) bigG.led.setAttribute("opacity", 0.5 + 0.5 * Math.abs(Math.sin(t * 3))); });
  // heart (human) + chip (technology) = one symbol
  const sym = el("g", { transform: "translate(960 400)" }, d4);
  const heart = el("path", { d: "M-260 20 C-330 -40 -300 -110 -240 -100 C-210 -95 -200 -70 -200 -60 C-200 -70 -190 -95 -160 -100 C-100 -110 -70 -40 -140 20 L-200 80 Z", fill: "#ff5a7a", stroke: "#fff", "stroke-width": 5 }, sym);
  const plus = text(sym, "+", 0, 30, { size: 120, font: "Print", weight: 400, fill: "#fff" });
  const chip = el("g", { transform: "translate(200 -10)" }, sym);
  el("rect", { x: -60, y: -60, width: 120, height: 120, rx: 12, fill: "#203050", stroke: NEON, "stroke-width": 6 }, chip);
  for (let k = -2; k <= 2; k++) {
    el("line", { x1: k * 22, y1: -60, x2: k * 22, y2: -84, stroke: NEON, "stroke-width": 5 }, chip);
    el("line", { x1: k * 22, y1: 60, x2: k * 22, y2: 84, stroke: NEON, "stroke-width": 5 }, chip);
  }
  [heart, plus, chip].forEach((n, i) => { tl.set(n, { opacity: 0 }, 150); popIn(n, 207 + i * 0.8, 0.5); });

  // ---------------- D5 (216–228): LED pyramid show; music spreads digitally
  const d5 = el("g", { opacity: 0 }, S);
  tl.to(d5, { opacity: 1, duration: 0.6 }, 216);
  const beams = el("g", {}, d5);
  const bm = [];
  for (let k = 0; k < 8; k++) bm.push(el("path", { fill: ["#ff4fb8", "#5ef2ff", "#ffd24a", "#6fdc8c"][k % 4], opacity: 0.25 }, beams));
  updaters.push(t => bm.forEach((b, k) => {
    const a = Math.sin(t * 1.2 + k) * 0.6 + (k - 3.5) * 0.18;
    const x2 = 960 + Math.sin(a) * 1200, y2 = 600 - Math.cos(a) * 1200;
    b.setAttribute("d", `M960 600 L${x2 - 60} ${y2} L${x2 + 60} ${y2} Z`);
  }));
  const pyr = el("g", {}, d5);
  const tri = el("path", { d: "M960 330 L1300 760 L620 760 Z", fill: "#141830", stroke: NEON, "stroke-width": 6 }, pyr);
  const ledRows = [];
  for (let r = 0; r < 6; r++) {
    const y = 420 + r * 60, half = (y - 330) * 340 / 430;
    ledRows.push(el("line", { x1: 960 - half + 20, x2: 960 + half - 20, y1: y, y2: y, "stroke-width": 10, "stroke-linecap": "round" }, pyr));
  }
  updaters.push(t => ledRows.forEach((l, r) => l.setAttribute("stroke", ["#ff4fb8", "#5ef2ff", "#ffd24a", "#6fdc8c", "#b07cff", "#ff9b3d"][Math.floor(t * 4 + r) % 6])));
  const tSmall = new Figure(pyr, { x: 900, y: 470, s: 0.7, costume: "robot", helmet: "silver", face: 1, aR: [150, 0] });
  const gSmall = new Figure(pyr, { x: 1020, y: 470, s: 0.7, costume: "robot", helmet: "gold", face: -1, aR: [150, 0] });
  [tSmall, gSmall].forEach((r, i) => r.loop(216, 228, (o, lt) => { o.aR[0] = 140 + Math.sin(lt * 6 + i) * 30; o.bob = -Math.abs(Math.sin(lt * 4)) * 5; }));
  const yr = text(d5, "2006", 960, 280, { size: 60, font: "Print", weight: 400, fill: "#fff" });
  const fans = crowd(d5, 120, 1800, 1040, 14, { s: 0.85 });
  cheer(fans, 217, 228);
  // wireless waves carry the music to phones, laptops, headphones around the world
  const spread = el("g", {}, d5);
  tl.set(spread, { opacity: 0 }, 150); tl.to(spread, { opacity: 1, duration: 0.6 }, 221.5);
  const arcs = [];
  for (let k = 0; k < 4; k++) arcs.push(el("circle", { cx: 960, cy: 330, r: 50, fill: "none", stroke: NEON, "stroke-width": 5 }, spread));
  updaters.push(t => arcs.forEach((a, k) => { const p = ((t * 0.6) + k / 4) % 1; a.setAttribute("r", 60 + p * 700); a.setAttribute("opacity", 1 - p); }));
  const devices = [[260, 260, "phone"], [1660, 260, "laptop"], [300, 560, "head"], [1620, 560, "globe"]];
  devices.forEach(([x, y, kind], i) => {
    const g = el("g", { transform: `translate(${x} ${y})` }, spread);
    if (kind === "phone") { el("rect", { x: -40, y: -70, width: 80, height: 140, rx: 14, fill: "#222", stroke: "#fff", "stroke-width": 5 }, g); noteGlyph(g, -6, 20, 0.9, NEON); }
    if (kind === "laptop") { el("rect", { x: -80, y: -60, width: 160, height: 100, rx: 8, fill: "#222", stroke: "#fff", "stroke-width": 5 }, g); el("path", { d: "M-100 40 L100 40 L110 60 L-110 60 Z", fill: "#888" }, g); noteGlyph(g, -4, 10, 0.8, PINK); }
    if (kind === "head") { el("path", { d: "M-60 30 Q-60 -60 0 -60 Q60 -60 60 30", fill: "none", stroke: "#fff", "stroke-width": 10 }, g); el("rect", { x: -78, y: 10, width: 34, height: 54, rx: 10, fill: PINK }, g); el("rect", { x: 44, y: 10, width: 34, height: 54, rx: 10, fill: PINK }, g); }
    if (kind === "globe") { el("circle", { r: 64, fill: "#1e4f8a", stroke: "#fff", "stroke-width": 5 }, g); el("path", { d: "M-64 0 L64 0 M0 -64 Q-40 0 0 64 M0 -64 Q40 0 0 64", fill: "none", stroke: "#fff", "stroke-width": 3 }, g); el("path", { d: "M-30 -30 q20 -10 30 10 q-10 20 -30 10 Z M14 10 q24 -6 30 14 q-14 16 -30 4 Z", fill: "#6fdc8c" }, g); }
    tl.set(g, { opacity: 0 }, 150); popIn(g, 222.5 + i * 0.5, 0.5);
  });
  S.appendChild(label);
})();

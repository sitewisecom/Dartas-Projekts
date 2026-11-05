// Title card + Scene 1: Guido of Arezzo (staff lines, solmization)
(function () {
  // ------------------------------------------------------------ TITLE 0–8 s
  const T = scene(0, 8.2, 0.8);
  const st = el("g", {}, T);
  // five staff lines drawing across, notes hopping on them
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const p = el("path", { d: `M180 ${700 + i * 26} C 700 ${660 + i * 26}, 1200 ${740 + i * 26}, 1740 ${700 + i * 26}`, fill: "none", stroke: "#b9a27e", "stroke-width": 4, "stroke-linecap": "round" }, st);
    drawOn(p, 0.2 + i * 0.12, 1.6);
  }
  const notes = [];
  [[420, 720], [620, 694], [820, 732], [1030, 706], [1240, 742], [1450, 716]].forEach(([x, y], i) => {
    const n = noteGlyph(st, x, y, 1.15, ["#c0504d", "#4f81bd", "#9bbb59", "#8064a2", "#f79646", "#4bacc6"][i]);
    popIn(n, 1.4 + i * 0.18, 0.45);
    notes.push(n);
  });
  const title = text(T, "Mūzikas attīstība", 960, 430, { size: 150, font: "Hand" });
  popIn(title, 0.5, 0.9, 0.85);
  const names = text(T, "Dārta Miezere, Alise Diedišķe, Edvarts Igaunis un Eduards Roze", 960, 540, { size: 52, font: "Print", weight: 400, fill: "#5a4a3a" });
  const cls = text(T, "12.CV", 960, 610, { size: 52, font: "Print", weight: 400, fill: "#5a4a3a" });
  fadeIn(names, 1.3, 0.8); fadeIn(cls, 1.6, 0.8);
  updaters.push(t => notes.forEach((n, i) => {
    if (t > 2.6) n.setAttribute("transform", n.getAttribute("transform").replace(/translate\(([-\d.]+) ([-\d.]+)\)/, (m, x) => `translate(${x} ${[720, 694, 732, 706, 742, 716][i] - Math.abs(Math.sin(t * 3 + i)) * 18})`));
  }));

  // ------------------------------------------------------------ SCENE 1: 8–78 s
  const S = scene(8, 78.4, 0.8);
  // monastery interior
  const bg = el("g", {}, S);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#eadcc2" }, bg);
  for (let i = 0; i < 26; i++) for (let r = 0; r < 12; r++) {
    el("rect", { x: (i * 78 + (r % 2) * 39) - 40, y: r * 72, width: 76, height: 70, rx: 6, fill: "none", stroke: "#d6c4a4", "stroke-width": 3 }, bg);
  }
  const arch = (x) => {
    el("path", { d: `M${x - 120} 640 L${x - 120} 300 Q${x - 120} 150 ${x} 150 Q${x + 120} 150 ${x + 120} 300 L${x + 120} 640 Z`, fill: "#9cc4e4", stroke: INK, "stroke-width": 8 }, bg);
    el("path", { d: `M${x} 150 L${x} 640 M${x - 120} 400 L${x + 120} 400`, stroke: INK, "stroke-width": 5 }, bg);
    el("circle", { cx: x + 60, cy: 260, r: 34, fill: "#fff3b0" }, bg);
  };
  arch(330); arch(1590);
  el("rect", { x: 0, y: 900, width: 1920, height: 180, fill: "#c9b08a" }, bg);
  el("line", { x1: 0, y1: 900, x2: 1920, y2: 900, stroke: INK, "stroke-width": 7 }, bg);

  // ---- name card
  const label = el("g", {}, S);
  text(label, "Gvido no Areco", 960, 120, { size: 96, font: "Hand" });
  text(label, "ap 991 – pēc 1033 · Itālija", 960, 190, { size: 48, font: "Print", weight: 400, fill: "#5a4a3a" });
  popIn(label, 8.6, 0.8, 0.8);
  fadeOut(label, 22.6, 0.8);

  // ---- part 1 (8–24): monks learn chant by ear — neumes float, confusion
  const p1 = el("g", {}, S);
  const desk = el("g", {}, p1);
  el("path", { d: "M1190 760 L1500 760 L1480 790 L1210 790 Z", fill: "#8a5a34", stroke: INK, "stroke-width": 6 }, desk);
  el("path", { d: "M1230 790 L1230 900 M1460 790 L1460 900", stroke: INK, "stroke-width": 9, "stroke-linecap": "round" }, desk);
  el("path", { d: "M1260 758 L1400 742 L1410 752 L1270 768 Z", fill: "#fff6dc", stroke: INK, "stroke-width": 4 }, desk);
  candle(p1, 1450, 760, 0.9);
  const guido = new Figure(p1, { x: 1120, y: 900, s: 1.2, costume: "monk", face: 1, aR: [70, 30], aL: [30, 40], mouth: "smile" });
  const monks = [0, 1, 2].map(i => new Figure(p1, { x: 380 + i * 160, y: 900, s: 1.05, costume: "monk", face: 1, aL: [40, 70], aR: [40, 70], mouth: "sing" }));
  // neumes: little squiggles with no lines -> pitch unknown
  const neumeG = el("g", {}, p1);
  const neumes = [];
  for (let i = 0; i < 9; i++) {
    const d = ["M0 0 q12 -18 24 0", "M0 0 l10 -16 l10 16", "M0 0 q8 10 16 0 q8 -10 16 0", "M0 0 l0 -18 l14 0"][i % 4];
    neumes.push(el("path", { d, fill: "none", stroke: INK, "stroke-width": 6, "stroke-linecap": "round" }, neumeG));
  }
  updaters.push(t => neumes.forEach((n, i) => {
    const x = 330 + i * 52 + Math.sin(t * 1.3 + i) * 14;
    const y = 470 + Math.sin(t * 1.9 + i * 1.7) * 60;
    n.setAttribute("transform", `translate(${x} ${y}) rotate(${Math.sin(t + i) * 20})`);
  }));
  fadeIn(neumeG, 10, 1);
  // question marks above the singers (they cannot know the pitch)
  const qs = monks.map((m, i) => {
    const q = text(p1, "?", 395 + i * 160, 590, { size: 90, font: "Hand", fill: "#c0504d" });
    popIn(q, 13 + i * 0.4, 0.5);
    return q;
  });
  monks.forEach((m, i) => {
    m.loop(9, 24, (o, lt) => { o.mouth = Math.sin(lt * 5 + i) > 0 ? "sing" : "o"; o.tilt = Math.sin(lt * 2 + i) * 6; });
    m.set({ mouth: "sad" }, 13.5);
    m.to({ aR: [150, 40] }, 13.5 + i * 0.3, 0.5);  // scratch head
  });
  // hourglass: learning by ear took years
  const hg = el("g", { transform: "translate(960 520)" }, p1);
  el("path", { d: "M-50 -80 L50 -80 L6 0 L50 80 L-50 80 L-6 0 Z", fill: "#fff8e6", stroke: INK, "stroke-width": 7, "stroke-linejoin": "round" }, hg);
  const sandTop = el("path", { fill: "#e0b050" }, hg);
  const sandBot = el("path", { fill: "#e0b050" }, hg);
  const yearsLbl = text(hg, "", 0, 140, { size: 56, font: "Hand" });
  popIn(hg, 15.5, 0.6);
  updaters.push(t => {
    const p = Math.min(1, Math.max(0, (t - 16) / 6));
    const h1 = 70 * (1 - p), h2 = 70 * p;
    sandTop.setAttribute("d", `M${-6 - 44 * h1 / 80} ${-h1} L${6 + 44 * h1 / 80} ${-h1} L6 0 L-6 0 Z`);
    sandBot.setAttribute("d", `M-44 80 L44 80 L${44 - 38 * h2 / 80} ${80 - h2} L${-44 + 38 * h2 / 80} ${80 - h2} Z`);
    const yr = Math.min(10, Math.max(1, Math.round(1 + p * 9)));
    yearsLbl.textContent = t > 16 ? `${yr} ${yr === 1 ? "gads" : "gadi"}` : "";
  });
  guido.loop(9, 15, (o, lt) => { o.aR[0] = 70 + Math.sin(lt * 6) * 8; });       // writing
  guido.to({ face: -1, aR: [20, 10], aL: [20, 10], mouth: "flat" }, 15, 0.4);    // turns to the singers
  guido.to({ aR: [110, 60], tilt: -10 }, 19, 0.6);                               // thinks… idea!
  const bulb = el("g", { transform: "translate(1150 470)" }, p1);
  el("circle", { r: 34, fill: "#fff27a", stroke: INK, "stroke-width": 6 }, bulb);
  el("path", { d: "M-14 34 L14 34 L12 52 L-12 52 Z", fill: "#bbb", stroke: INK, "stroke-width": 5 }, bulb);
  for (let k = 0; k < 8; k++) el("line", { x1: Math.cos(k * 0.785) * 48, y1: Math.sin(k * 0.785) * 48, x2: Math.cos(k * 0.785) * 64, y2: Math.sin(k * 0.785) * 64, stroke: "#e0a800", "stroke-width": 6, "stroke-linecap": "round" }, bulb);
  popIn(bulb, 21, 0.6);
  guido.set({ mouth: "grin" }, 21);
  fadeOut(p1, 23.4, 0.6);

  // ---- part 2 (24–42): Guido draws lines — pitch becomes exact
  const p2 = el("g", { opacity: 0 }, S);
  fadeIn(p2, 24, 0.6);
  const parch = el("path", { d: "M300 260 Q960 230 1620 260 L1600 760 Q960 790 320 760 Z", fill: "#fbf1d6", stroke: INK, "stroke-width": 8 }, p2);
  const staffY = [400, 470, 540, 610];
  const staffCols = ["#1d1a1f", "#d4a017", "#1d1a1f", "#c8302c"]; // C line yellow, F line red (Guido's colours)
  const slines = staffY.map((y, i) => {
    const l = el("path", { d: `M380 ${y} L1540 ${y}`, stroke: staffCols[i], "stroke-width": i % 2 ? 9 : 6, "stroke-linecap": "round" }, p2);
    return l;
  });
  drawOn(slines[3], 27, 1.4);   // red F line first
  drawOn(slines[1], 29, 1.4);   // then yellow C line
  drawOn(slines[0], 31, 1.0); drawOn(slines[2], 31.6, 1.0);
  const clefF = text(p2, "F", 340, staffY[3] + 16, { size: 54, font: "Hand", fill: "#c8302c" });
  const clefC = text(p2, "C", 340, staffY[1] + 16, { size: 54, font: "Hand", fill: "#b8860b" });
  popIn(clefF, 28.2, 0.4); popIn(clefC, 30.2, 0.4);
  // floating neumes that snap onto the staff as square notes
  const targets = [610, 575, 540, 505, 470, 435, 470, 505, 540, 575];
  const sq = targets.map((y, i) => {
    const g = el("g", {}, p2);
    const r = el("rect", { x: -18, y: -16, width: 36, height: 32, rx: 4, fill: INK }, g);
    g.dataset.ty = y;
    return g;
  });
  updaters.push(t => sq.forEach((g, i) => {
    const x = 470 + i * 105;
    const free = 330 + Math.sin(t * 1.7 + i * 1.3) * 120 + 150;
    const p = Math.min(1, Math.max(0, (t - 33 - i * 0.15) / 1.0));
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const y = free + (Number(g.dataset.ty) - free) * e;
    g.setAttribute("transform", `translate(${x} ${y}) rotate(${(1 - e) * Math.sin(t + i) * 40})`);
    // highlight the note being sung in the melody run
    const k = Math.floor((t - 37) * 2.2);
    g.firstChild.setAttribute("fill", t > 37 && k % 10 === i ? "#c8302c" : INK);
  }));
  fadeIn(sq[0].parentNode, 24.2, 0.1);
  // small choir below the parchment, now singing confidently
  const choir = [0, 1, 2, 3].map(i => new Figure(p2, { x: 700 + i * 170, y: 1000, s: 0.62, costume: "monk", aL: [60, 70], aR: [60, 70], mouth: "sing" }));
  choir.forEach((m, i) => m.loop(36.5, 42, (o, lt) => { o.mouth = Math.sin(lt * 6 + i) > -0.3 ? "sing" : "o"; o.bob = Math.sin(lt * 4 + i) * 3; }));
  choir.forEach(m => m.set({ mouth: "flat" }, 24));
  floatNotes(p2, 37, 42, { x: 960, y: 820, h: 200 }, 7, "#7b5a3c");
  const g2 = new Figure(p2, { x: 1700, y: 1000, s: 0.75, costume: "monk", face: -1, aR: [110, 20], mouth: "smile" });
  g2.to({ aR: [140, 10] }, 27, 0.5).to({ aR: [100, 20] }, 31, 0.5).set({ mouth: "grin" }, 36);
  fadeOut(p2, 41.4, 0.6);

  // ---- part 3 (42–62): solmization — ut re mi fa sol la (→ do … si)
  const p3 = el("g", { opacity: 0 }, S);
  fadeIn(p3, 42, 0.6);
  const syll = ["UT", "RE", "MI", "FA", "SOL", "LA"];
  const hymn = [" queant laxis", "sonare fibris", "ra gestorum", "muli tuorum", "ve polluti", "bii reatum"];
  const scroll = el("g", { transform: "translate(1320 300)" }, p3);
  el("path", { d: "M-260 -170 L260 -170 L250 280 L-250 280 Z", fill: "#fbf1d6", stroke: INK, "stroke-width": 7 }, scroll);
  el("rect", { x: -280, y: -196, width: 560, height: 32, rx: 16, fill: "#c9a46a", stroke: INK, "stroke-width": 6 }, scroll);
  el("rect", { x: -270, y: 270, width: 540, height: 32, rx: 16, fill: "#c9a46a", stroke: INK, "stroke-width": 6 }, scroll);
  text(scroll, "Ut queant laxis", 0, -112, { size: 46, font: "Hand", fill: "#7b5a3c" });
  const hymnRows = syll.map((s, i) => {
    const row = el("text", { x: -200, y: -40 + i * 52, "font-family": "Hand", "font-size": 42, "font-weight": 700, fill: "#9a8a76" }, scroll);
    const a = el("tspan", { fill: "#c8302c", "font-size": 50 }, row); a.textContent = s === "SOL" ? "Sol" : s[0] + s.slice(1).toLowerCase();
    const b = el("tspan", {}, row); b.textContent = hymn[i];
    fadeIn(row, 43 + i * 0.5, 0.4);
    return a;
  });
  // staircase
  const stairs = el("g", {}, p3);
  const stepLbl = [];
  for (let i = 0; i < 7; i++) {
    const x = 160 + i * 130, y = 900 - (i + 1) * 62;
    const step = el("rect", { x, y, width: 130, height: 900 - y + 2, fill: ["#f6c1c1", "#f9d9a8", "#fdf0a0", "#c9ecb4", "#b7dcf3", "#cfc0ee", "#f0c8e8"][i], stroke: INK, "stroke-width": 6 }, stairs);
    const lb = text(stairs, i < 6 ? syll[i] : "SI", x + 65, y + 48, { size: 46, font: "Hand" });
    stepLbl.push(lb);
    if (i < 6) { tl.set(step, { opacity: 0 }, 42); popIn(step, 46 + i * 1.1, 0.45); tl.set(lb, { opacity: 0 }, 42); popIn(lb, 46.2 + i * 1.1, 0.4); }
    else { tl.set(step, { opacity: 0 }, 42); popIn(step, 56.5, 0.5); tl.set(lb, { opacity: 0 }, 42); popIn(lb, 56.7, 0.5); }
  }
  // highlight hymn syllables in time with the climb
  syll.forEach((s, i) => tl.fromTo(hymnRows[i], { attr: { "font-size": 50 } }, { attr: { "font-size": 64 }, duration: 0.3, yoyo: true, repeat: 1 }, 46 + i * 1.1));
  // UT turns into DO
  const doLbl = text(stairs, "DO", 225, 886, { size: 46, font: "Hand", fill: "#c8302c" });
  tl.set(doLbl, { opacity: 0 }, 42);
  tl.to(stepLbl[0], { opacity: 0, duration: 0.4 }, 54.5);
  popIn(doLbl, 54.8, 0.6);
  // a little monk climbs the steps singing each syllable
  const climber = new Figure(p3, { x: 120, y: 900, s: 0.62, costume: "monk", face: 1, mouth: "sing", aL: [60, 60], aR: [60, 60] });
  for (let i = 0; i < 7; i++) {
    const at = i < 6 ? 46 + i * 1.1 : 57.2;
    tl.to(climber.o, { x: 225 + i * 130, y: 900 - (i + 1) * 62, duration: 0.5, ease: "power1.out" }, at);
    tl.to(climber.o, { bob: -26, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.out" }, at);
  }
  climber.loop(46, 62, (o, lt) => { o.mouth = Math.sin(lt * 7) > 0 ? "sing" : "o"; });
  climber.to({ aL: [170, 0], aR: [170, 0], mouth: "grin" }, 58.4, 0.5);
  const g3 = new Figure(p3, { x: 1150, y: 1000, s: 0.8, costume: "monk", face: -1, aR: [120, 0], mouth: "smile" });
  g3.loop(44, 58, (o, lt) => { o.aR[0] = 110 + Math.sin(lt * 1.1) * 25; });
  fadeOut(p3, 61.4, 0.6);

  // ---- part 4 (62–78): why it matters — the method spreads, learning time shrinks, modern notation
  const p4 = el("g", { opacity: 0 }, S);
  fadeIn(p4, 62, 0.6);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#efe2c6" }, p4);
  el("path", { d: "M180 520 Q300 260 620 300 Q760 120 1000 200 Q1240 120 1420 260 Q1760 300 1760 560 Q1700 860 1380 880 Q1120 980 860 900 Q520 960 360 840 Q160 760 180 520 Z", fill: "#e3d1ab", stroke: "#c9b089", "stroke-width": 6, "stroke-dasharray": "18 12" }, p4);
  const hub = el("g", { transform: "translate(960 560)" }, p4);
  el("path", { d: "M-90 60 L-90 -40 L0 -120 L90 -40 L90 60 Z", fill: "#e8cfa0", stroke: INK, "stroke-width": 7 }, hub);
  el("path", { d: "M-12 -120 L-12 -170 M-30 -150 L6 -150", stroke: INK, "stroke-width": 7 }, hub);
  el("rect", { x: -22, y: 0, width: 44, height: 60, fill: "#7b5a3c", stroke: INK, "stroke-width": 5 }, hub);
  popIn(hub, 62.4, 0.6);
  const towns = [[300, 300], [520, 820], [1620, 300], [1460, 840], [260, 620], [1680, 620], [760, 230], [1180, 230]];
  towns.forEach(([x, y], i) => {
    const tw = el("g", { transform: `translate(${x} ${y})` }, p4);
    el("path", { d: "M-50 40 L-50 -20 L0 -60 L50 -20 L50 40 Z", fill: "#f1e2c4", stroke: INK, "stroke-width": 6 }, tw);
    el("path", { d: "M-6 -60 L-6 -90 M-18 -78 L6 -78", stroke: INK, "stroke-width": 5 }, tw);
    popIn(tw, 63 + i * 0.25, 0.4);
    // a sheet with staff lines flies from the hub to the town
    const sh = el("g", {}, p4);
    el("rect", { x: -34, y: -24, width: 68, height: 48, fill: "#fffaf0", stroke: INK, "stroke-width": 4 }, sh);
    for (let k = 0; k < 4; k++) el("line", { x1: -26, y1: -14 + k * 9, x2: 26, y2: -14 + k * 9, stroke: k === 3 ? "#c8302c" : (k === 1 ? "#d4a017" : INK), "stroke-width": 2.5 }, sh);
    const t0 = 64 + i * 0.45;
    updaters.push(t => {
      const p = Math.min(1, Math.max(0, (t - t0) / 1.6));
      const e = 1 - Math.pow(1 - p, 3);
      const sx = 960 + (x - 960) * e, sy = 560 + (y - 40 - 560) * e - Math.sin(p * Math.PI) * 120;
      sh.setAttribute("transform", `translate(${sx} ${sy}) rotate(${(1 - e) * 360})`);
      sh.setAttribute("opacity", t < t0 ? 0 : 1);
    });
    floatNotes(p4, t0 + 1.8, 78, { x, y: y - 50, h: 120 }, 2, ["#c0504d", "#4f81bd", "#9bbb59", "#8064a2"][i % 4]);
  });
  // learning time: ~10 years → 1–2 years (Guido's own claim)
  const hgs = [[640, 940, 0.75, "~10 gadi"], [1280, 940, 0.4, "1–2 gadi"]].map(([x, y, sc, lb], k) => {
    const g = el("g", { transform: `translate(${x} ${y})` }, p4);
    el("path", { d: "M-50 -80 L50 -80 L6 0 L50 80 L-50 80 L-6 0 Z", fill: "#fff8e6", stroke: INK, "stroke-width": 7, transform: `scale(${sc})` }, g);
    text(g, lb, 0, 20, { size: 50, font: "Hand", anchor: k ? "start" : "end" }).setAttribute("x", k ? 40 : -60);
    tl.set(g, { opacity: 0 }, 62); popIn(g, 68.5 + k * 1.4, 0.5);
    return g;
  });
  const arrow = el("path", { d: "M780 930 L1180 930 M1150 905 L1185 930 L1150 955", fill: "none", stroke: "#c8302c", "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }, p4);
  drawOn(arrow, 69.2, 0.8);
  // modern five-line staff with a treble clef sweeps in at the end
  const modern = el("g", { opacity: 0 }, p4);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#f6efe2" }, modern);
  for (let k = 0; k < 5; k++) el("line", { x1: 260, y1: 440 + k * 40, x2: 1660, y2: 440 + k * 40, stroke: INK, "stroke-width": 5 }, modern);
  text(modern, "𝄞", 330, 640, { size: 260, font: "serif", weight: 400 });
  [[560, 600], [700, 580], [840, 560], [980, 540], [1120, 520], [1260, 500], [1400, 480]].forEach(([x, y], i) => {
    const n = noteGlyph(modern, x, y, 1.3, INK);
    tl.set(n, { opacity: 0 }, 62); popIn(n, 74.2 + i * 0.25, 0.35);
    const lb = text(modern, ["do", "re", "mi", "fa", "sol", "la", "si"][i], x, 760, { size: 54, font: "Hand", fill: "#c8302c" });
    tl.set(lb, { opacity: 0 }, 62); popIn(lb, 74.3 + i * 0.25, 0.35);
  });
  fadeIn(modern, 73.4, 0.8);
})();

// Scene 2: Ludwig van Beethoven (78–150 s)
(function () {
  const T0 = 78, T1 = 150.4;
  const S = scene(T0, T1, 0.8);

  const label = el("g", {}, S);
  text(label, "Ludvigs van Bēthovens", 960, 110, { size: 92, font: "Hand" });
  const sub = text(label, "Bonna, 1770", 960, 175, { size: 50, font: "Print", weight: 400, fill: "#5a4a3a" });
  popIn(label, 78.6, 0.8, 0.8);
  // the place/year line changes as the story moves on (fade between captions)
  const caps = [[78, "Bonna, 1770"], [92.2, "Vīne, 1792"], [106.2, "dzirde zūd · no ap 1798"], [118, "Heiligenštate, 1802"], [124.2, "Vīne, 1824 · 9. simfonija"], [144, "1770–1827"]];
  updaters.push(t => {
    let k = 0;
    for (let i = 0; i < caps.length; i++) if (t >= caps[i][0] - 0.05) k = i;
    sub.textContent = caps[k][1];
    const d = Math.min(...caps.map(c => Math.abs(t - c[0])));
    sub.setAttribute("opacity", k === 0 ? 1 : Math.min(1, d / 0.3));
  });

  // ---------------- B1 (78–92): Bonn — strict lessons, first concert
  const b1 = el("g", {}, S);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#efe0c4" }, b1);
  for (let x = 0; x < 1920; x += 90) el("path", { d: `M${x} 0 L${x} 900`, stroke: "#e4cfa8", "stroke-width": 26 }, b1);
  el("rect", { x: 0, y: 900, width: 1920, height: 180, fill: "#b98d5e" }, b1);
  el("line", { x1: 0, y1: 900, x2: 1920, y2: 900, stroke: INK, "stroke-width": 7 }, b1);
  el("rect", { x: 1300, y: 330, width: 260, height: 300, fill: "#a9d0ee", stroke: INK, "stroke-width": 8 }, b1);
  el("path", { d: "M1430 330 L1430 630 M1300 480 L1560 480", stroke: INK, "stroke-width": 5 }, b1);
  piano(b1, 760, 900, 1.2, "upright");
  el("rect", { x: 560, y: 815, width: 110, height: 22, fill: "#7b5a3c", stroke: INK, "stroke-width": 5 }, b1);
  el("path", { d: "M575 837 L575 900 M655 837 L655 900", stroke: INK, "stroke-width": 7 }, b1);
  candle(b1, 900, 718, 0.8);
  const kid = new Figure(b1, { x: 615, y: 870, s: 0.72, costume: "coat", maneColor: "#2a2224", face: 1, lL: [85, -85], lR: [80, -80], aL: [70, 20], aR: [65, 25], mouth: "flat" });
  kid.loop(79, 89, (o, lt) => { o.aL[1] = 20 + Math.sin(lt * 14) * 12; o.aR[1] = 25 + Math.cos(lt * 15) * 12; });
  kid.set({ mouth: "sad", eyes: "closed" }, 84).set({ eyes: "open" }, 85);
  const dad = new Figure(b1, { x: 420, y: 900, s: 1.1, costume: "shirt", color: "#6b4a3a", hair: "short", hairColor: "#c9c2b0", face: 1, aR: [100, -20], mouth: "flat" });
  dad.loop(80, 87, (o, lt) => { o.aR[0] = 95 + Math.sin(lt * 6) * 18; });
  const tear = el("path", { d: "M0 0 q6 10 0 14 q-6 -4 0 -14 Z", fill: "#5ab0ff" }, b1);
  updaters.push(t => { const p = ((t - 84) % 1.2) / 1.2; tear.setAttribute("transform", `translate(${632} ${672 + p * 40})`); tear.setAttribute("opacity", t > 84 && t < 87 ? 1 - p : 0); });
  // first public concert (Cologne, 1778): small audience applauds
  const aud1 = crowd(b1, 1050, 1750, 900, 6, { s: 0.75, face: -1 });
  aud1.forEach(f => { tl.set(f.o, { opacity: 0 }, 78); tl.to(f.o, { opacity: 1, duration: 0.5 }, 87); });
  cheer(aud1, 88, 92);
  const yr78 = text(b1, "1778", 1400, 300, { size: 60, font: "Hand", fill: "#c8302c" });
  tl.set(yr78, { opacity: 0 }, 78); popIn(yr78, 87.2, 0.5);
  kid.set({ mouth: "grin" }, 88);
  floatNotes(b1, 80, 92, { x: 760, y: 680, h: 260 }, 6);
  fadeOut(b1, 91.6, 0.6);

  // ---------------- B2 (92–106): to Vienna, piano star
  const b2 = el("g", { opacity: 0 }, S);
  fadeIn(b2, 92, 0.6);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#cfe6f5" }, b2);
  const city = el("g", { transform: "translate(1180 760)" }, b2);
  el("path", { d: "M0 140 L0 40 L60 40 L60 0 L120 0 L120 60 L200 60 L200 -10 L220 -260 L240 -10 L240 60 L320 60 L320 10 Q360 -60 400 10 L400 60 L520 60 L520 140 Z", fill: "#d9c7a6", stroke: INK, "stroke-width": 7, "stroke-linejoin": "round" }, city);
  for (let i = 0; i < 7; i++) el("rect", { x: 20 + i * 70, y: 80, width: 22, height: 30, fill: "#8aa9c8", stroke: INK, "stroke-width": 3 }, city);
  el("rect", { x: 0, y: 900, width: 1920, height: 180, fill: "#c6b088" }, b2);
  el("line", { x1: 0, y1: 900, x2: 1920, y2: 900, stroke: INK, "stroke-width": 7 }, b2);
  const sign = el("g", { transform: "translate(980 900)" }, b2);
  el("path", { d: "M0 0 L0 -170", stroke: INK, "stroke-width": 9 }, sign);
  el("path", { d: "M-10 -170 L120 -170 L150 -145 L120 -120 L-10 -120 Z", fill: "#f2e6c9", stroke: INK, "stroke-width": 6 }, sign);
  text(sign, "Vīne", 65, -132, { size: 40, font: "Hand" });
  const walker = new Figure(b2, { x: -100, y: 900, s: 1.05, costume: "coat", maneColor: "#2a2224", face: 1, mouth: "smile" });
  const bag = el("g", {}, null);
  el("rect", { x: -18, y: 0, width: 36, height: 28, rx: 4, fill: "#8a5a34", stroke: INK, "stroke-width": 4 }, bag);
  walker.hold(bag, "L", 0);
  walker.walk(900, 92.4, 98.4, 1.8);
  // salon: grand piano, virtuoso playing
  const salon = el("g", { opacity: 0 }, b2);
  fadeIn(salon, 98.4, 0.7);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#f3e3c8" }, salon);
  for (let i = 0; i < 4; i++) {
    el("rect", { x: 140 + i * 460, y: 220, width: 200, height: 360, fill: "#e8cfa0", stroke: "#b8935a", "stroke-width": 8 }, salon);
    el("circle", { cx: 240 + i * 460, cy: 190, r: 34, fill: "#fff1b0", stroke: "#b8935a", "stroke-width": 6 }, salon);
  }
  el("rect", { x: 0, y: 900, width: 1920, height: 180, fill: "#a87b4f" }, salon);
  el("line", { x1: 0, y1: 900, x2: 1920, y2: 900, stroke: INK, "stroke-width": 7 }, salon);
  piano(salon, 980, 800, 1.25, "grand");
  const virt = new Figure(salon, { x: 700, y: 880, s: 1.15, costume: "coat", maneColor: "#2a2224", face: 1, lL: [85, -85], lR: [80, -80], aL: [70, 25], aR: [75, 20], mouth: "grin" });
  el("rect", { x: 640, y: 825, width: 120, height: 24, fill: "#5a3a24", stroke: INK, "stroke-width": 5 }, salon);
  virt.loop(98.5, 112, (o, lt) => {
    const k = Math.sin(lt * 11), k2 = Math.cos(lt * 13);
    o.aL[0] = 72 + k * 22; o.aL[1] = 20 + Math.max(0, k) * 30;
    o.aR[0] = 76 + k2 * 22; o.aR[1] = 18 + Math.max(0, k2) * 30;
    o.lean = 8 + Math.sin(lt * 3) * 8; o.tilt = Math.sin(lt * 5) * 10;
  });
  const aud2 = crowd(salon, 1400, 1850, 900, 4, { s: 0.85, face: -1 });
  cheer(aud2, 101.5, 106);
  floatNotes(salon, 99, 106, { x: 1000, y: 600, h: 300, dx: 200 }, 9);
  // ---------------- B3 (106–124): hearing fades
  const dark = el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#1b2340", opacity: 0 }, b2);
  tl.to(dark, { opacity: 0.45, duration: 2 }, 106);
  fadeOut(aud2[0].g.parentNode, 106, 1);
  const grey = floatNotes(b2, 106, 112, { x: 980, y: 560, h: -260 }, 6, "#8a8a8a");   // notes fall and fade
  // sound rings around his head shrink and vanish
  const rings = el("g", {}, b2);
  const rr = [0, 1, 2].map(i => el("circle", { r: 40, fill: "none", stroke: "#f2c230", "stroke-width": 6 }, rings));
  updaters.push(t => {
    const vis = t > 106 && t < 114;
    rr.forEach((c, i) => {
      const p = ((t * 0.8 + i / 3) % 1);
      const fadeAll = Math.max(0, 1 - (t - 106) / 6);
      c.setAttribute("cx", 712); c.setAttribute("cy", 590);
      c.setAttribute("r", 40 + p * 140 * fadeAll);
      c.setAttribute("opacity", vis ? (1 - p) * fadeAll : 0);
    });
  });
  virt.to({ aL: [150, 40], aR: [150, 40], lean: -6, mouth: "sad", tilt: -8 }, 109.5, 0.6);   // hands to ears
  const ring = el("path", { d: "M0 0 l12 -14 l12 14 l12 -14 l12 14 l12 -14", fill: "none", stroke: "#e04848", "stroke-width": 5, "stroke-linecap": "round" }, b2);
  updaters.push(t => { ring.setAttribute("transform", `translate(760 ${560 + Math.sin(t * 20) * 4})`); ring.setAttribute("opacity", t > 109.8 && t < 115 ? 1 : 0); });
  // ear trumpet
  const horn = el("g", {}, null);
  el("path", { d: "M0 0 L60 -8 Q110 -40 120 -60 L130 30 Q100 10 60 8 Z", fill: "#c9a34a", stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, horn);
  tl.set(horn, { opacity: 0 }, 78); tl.to(horn, { opacity: 1, duration: 0.3 }, 113.5);
  virt.hold(horn, "R", 90);
  virt.to({ aL: [20, 10], aR: [150, 60], tilt: 8 }, 113.4, 0.6);
  tl.to(horn, { opacity: 0, duration: 0.3 }, 117.6);
  // writing the Heiligenstadt letter by candlelight
  const letter = el("g", { opacity: 0 }, b2);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#2a2e48" }, letter);
  el("rect", { x: 0, y: 900, width: 1920, height: 180, fill: "#3a3550" }, letter);
  el("path", { d: "M820 760 L1240 760 L1220 790 L840 790 Z", fill: "#6a4a30", stroke: INK, "stroke-width": 6 }, letter);
  el("path", { d: "M860 790 L860 900 M1200 790 L1200 900", stroke: INK, "stroke-width": 9 }, letter);
  const paper = el("path", { d: "M940 756 L1110 740 L1120 752 L950 768 Z", fill: "#fffaf0", stroke: INK, "stroke-width": 4 }, letter);
  candle(letter, 1180, 760, 0.9);
  const writer = new Figure(letter, { x: 760, y: 880, s: 1.15, costume: "coat", face: 1, lL: [85, -85], lR: [80, -80], aR: [80, 40], aL: [60, 50], mouth: "sad", tilt: 14 });
  el("rect", { x: 700, y: 825, width: 120, height: 24, fill: "#5a3a24", stroke: INK, "stroke-width": 5 }, letter);
  writer.loop(118, 122, (o, lt) => { o.aR[1] = 40 + Math.sin(lt * 9) * 10; });
  writer.to({ tilt: -4, mouth: "flat", lean: -4 }, 122, 0.5).to({ aR: [150, -20], mouth: "grin" }, 122.6, 0.5);  // decides to keep composing
  const scribble = el("path", { d: "M960 754 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0", fill: "none", stroke: INK, "stroke-width": 2 }, letter);
  fadeIn(letter, 117.8, 0.6);
  fadeOut(b2, 123.6, 0.6);

  // ---------------- B4 (124–144): the Ninth — he cannot hear the applause
  const b4 = el("g", { opacity: 0 }, S);
  fadeIn(b4, 124, 0.6);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#3b2430" }, b4);
  el("path", { d: "M0 0 L1920 0 L1920 90 Q960 160 0 90 Z", fill: "#8c2a33" }, b4);
  el("rect", { x: 0, y: 760, width: 1920, height: 320, fill: "#6a4630" }, b4);
  el("line", { x1: 0, y1: 760, x2: 1920, y2: 760, stroke: INK, "stroke-width": 7 }, b4);
  spotlight(b4, 760, 0, 260, "#fff3c0", 0.18);
  // choir (back row) and orchestra (front rows)
  const choir = [];
  for (let i = 0; i < 9; i++) choir.push(new Figure(b4, { x: 900 + i * 105, y: 520, s: 0.5, costume: i % 2 ? "dress" : "shirt", color: i % 2 ? "#e8e0f0" : "#2b2b33", hair: i % 2 ? "long" : "short", hairColor: "#4a3020", face: -1, aL: [50, 60], aR: [50, 60], mouth: "sing" }));
  const orch = [];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) {
    const f = new Figure(b4, { x: 960 + i * 130 + r * 60, y: 640 + r * 110, s: 0.55, costume: "shirt", color: "#2b2b33", hair: "short", face: -1, aL: [100, -60], aR: [70, 40], mouth: "flat" });
    const vio = el("g", {}, null);
    el("ellipse", { cx: 0, cy: 0, rx: 16, ry: 9, fill: "#a0522d", stroke: INK, "stroke-width": 3 }, vio);
    f.hold(vio, "L", 0);
    orch.push(f);
  }
  orch.forEach((f, i) => f.loop(125, 137, (o, lt) => { o.aR[0] = 70 + Math.sin(lt * 6 + i) * 25; }));
  choir.forEach((f, i) => f.loop(125, 137, (o, lt) => { o.mouth = Math.sin(lt * 5 + i) > 0 ? "sing" : "o"; }));
  floatNotes(b4, 125, 137, { x: 1350, y: 450, h: 300 }, 10, "#f2c230");
  const lud = new Figure(b4, { x: 760, y: 760, s: 1.2, costume: "coat", face: 1, aL: [120, 30], aR: [130, 20], mouth: "grin" });
  const baton = el("path", { d: "M0 0 L0 -50", stroke: "#fffaf0", "stroke-width": 5, "stroke-linecap": "round" });
  lud.hold(baton, "R", 0);
  lud.loop(125, 140, (o, lt) => {
    o.aR[0] = 120 + Math.sin(lt * 5) * 35; o.aL[0] = 120 + Math.cos(lt * 5) * 30; o.tilt = Math.sin(lt * 2.5) * 10; o.bob = -Math.abs(Math.sin(lt * 5)) * 6;
  });
  // audience (bottom-left, seen from behind the stage edge)
  const aud = crowd(b4, 80, 620, 1050, 7, { s: 0.9, face: 1 });
  const hats = aud.map((f, i) => {
    const h = el("g", {}, null);
    if (i % 2) el("rect", { x: -16, y: -26, width: 32, height: 26, fill: "#fffaf0", stroke: INK, "stroke-width": 3 }, h);   // handkerchief
    else el("path", { d: "M-24 0 L24 0 L16 -6 L14 -30 L-14 -30 L-16 -6 Z", fill: "#2b2b33", stroke: INK, "stroke-width": 3 }, h); // hat
    tl.set(h, { opacity: 0 }, 78); tl.to(h, { opacity: 1, duration: 0.3 }, 138);
    f.hold(h, "R", 0);
    return h;
  });
  aud.forEach((f, i) => f.loop(138, 144, (o, lt) => { o.aR[0] = 170 + Math.sin(lt * 8 + i) * 25; o.aR[1] = 0; o.mouth = "grin"; }));
  // music ends at 137: he keeps conducting, hears nothing; a singer turns him round
  const unger = new Figure(b4, { x: 1000, y: 760, s: 0.95, costume: "dress", color: "#d9b8e8", hair: "long", hairColor: "#3a2a1a", face: -1, mouth: "smile" });
  tl.set(unger.o, { opacity: 0 }, 124);
  tl.to(unger.o, { opacity: 1, duration: 0.4 }, 137.5);
  unger.walk(850, 137.6, 139, 2);
  unger.to({ aR: [80, 10], aL: [80, 10] }, 139, 0.4);
  lud.set({ mouth: "flat" }, 137);
  lud.to({ face: -1, aL: [20, 10], aR: [20, 10], tilt: 0 }, 140.2, 0.3);
  lud.set({ mouth: "o", eyes: "wide" }, 140.5).set({ mouth: "grin", eyes: "open" }, 141.5);
  lud.to({ aL: [160, 0], aR: [160, 0] }, 142, 0.5);
  fadeOut(b4, 143.6, 0.6);

  // ---------------- B5 (144–150): legacy
  const b5 = el("g", { opacity: 0 }, S);
  fadeIn(b5, 144, 0.6);
  const legacy = new Figure(b5, { x: 960, y: 900, s: 1.8, costume: "coat", face: 1, aR: [40, 60], aL: [10, 10], mouth: "smile", tilt: -6 });
  const notesBig = floatNotes(b5, 144, 151, { x: 960, y: 520, h: 420, dx: 0 }, 12, "#b8322f");
  legacy.set({ eyes: "closed" }, 147).set({ eyes: "open" }, 147.3);
  S.appendChild(label);  // caption on top of every sub-scene
  // light halo keeps the caption readable on the dark sub-scenes
  label.querySelectorAll("text").forEach(t => { t.setAttribute("stroke", "#f6efe2"); t.setAttribute("stroke-width", 10); t.setAttribute("paint-order", "stroke"); t.setAttribute("stroke-linejoin", "round"); });
})();

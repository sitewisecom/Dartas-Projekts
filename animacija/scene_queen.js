// Scene 4: Queen — "Bohemian Rhapsody" (228–300 s)
(function () {
  const T0 = 228, T1 = 300;
  const S = scene(T0, T1, 0.8);
  // stage background
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#140b1e" }, S);
  el("rect", { x: 0, y: 860, width: 1920, height: 220, fill: "#24152e" }, S);
  el("line", { x1: 0, y1: 860, x2: 1920, y2: 860, stroke: "#5a3a6a", "stroke-width": 6 }, S);
  const label = el("g", {}, null);
  text(label, "Queen — „Bohemian Rhapsody”", 960, 110, { size: 88, font: "Hand", fill: "#ffe08a" });
  const sub = text(label, "1975", 960, 172, { size: 48, font: "Print", weight: 400, fill: "#e8d8ff" });
  popIn(label, 228.6, 0.8, 0.8);

  // a reusable "Freddie" — short black hair, moustache, white vest, yellow jacket, half mic stand
  function freddie(parent, o) {
    const f = new Figure(parent, Object.assign({ costume: "freddie", mouth: "grin" }, o));
    const stand = el("g", {}, null);
    el("path", { d: "M0 0 L0 -110", stroke: "#d8dde6", "stroke-width": 8, "stroke-linecap": "round" }, stand);
    el("rect", { x: -9, y: -138, width: 18, height: 32, rx: 9, fill: "#3a3a44", stroke: INK, "stroke-width": 3 }, stand);
    f.hold(stand, "R", 180);
    return f;
  }

  // ---------------- Q1+Q2 (228–252): Freddie on stage; symbols in the lyrics
  const q1 = el("g", {}, S);
  spotlight(q1, 560, 0, 300, "#fff3c0", 0.2);
  const fred = freddie(q1, { x: -100, y: 860, s: 1.7, face: 1 });
  fred.walk(560, 228.6, 231.6, 1.6);
  fred.to({ aR: [165, -20], aL: [-30, 10], mouth: "sing", tilt: -10 }, 232, 0.5);   // iconic raised mic stand
  fred.to({ aR: [70, 30], aL: [100, -30], tilt: 0 }, 235, 0.5);
  fred.loop(235.5, 252, (o, lt) => { o.mouth = Math.sin(lt * 6) > 0 ? "sing" : "o"; o.bob = Math.sin(lt * 3) * 3; });
  const bubbles = [
    { t: 237, x: 1340, y: 480, name: "Scaramouche", origin: "itāļu teātris", draw: (g) => {
      const sc = new Figure(g, { x: 0, y: 150, s: 1, costume: "shirt", color: "#1d1a1f", hair: "none", face: 1 });
      el("path", { d: "M-38 -22 L38 -22 L26 -62 L-26 -62 Z", fill: INK }, sc.headG);
      el("ellipse", { cx: 0, cy: -50, rx: 30, ry: 10, fill: "#fff", stroke: INK, "stroke-width": 3 }, g); // ruff collar
      sc.loop(237, 243, (o, lt) => { const s = Math.sin(lt * 7); o.aL[0] = 150 + s * 20; o.aR[0] = -150 - s * 20; o.lL[0] = 20 * s; o.lR[0] = -20 * s; o.mouth = "grin"; });
    } },
    { t: 242, x: 1340, y: 480, name: "Bismillah", origin: "arābu valoda, islāms", draw: (g) => {
      // 8-point star tile from Islamic geometric art
      const star = el("g", { transform: "translate(0 -20)" }, g);
      el("rect", { x: -70, y: -70, width: 140, height: 140, fill: "#1f6f78", stroke: "#ffe08a", "stroke-width": 5 }, star);
      el("rect", { x: -70, y: -70, width: 140, height: 140, fill: "#2a8a96", stroke: "#ffe08a", "stroke-width": 5, transform: "rotate(45)" }, star);
      el("circle", { r: 34, fill: "#ffe08a" }, star);
      updaters.push(t => star.setAttribute("transform", `translate(0 -20) rotate(${(t - 242) * 20})`));
    } },
    { t: 247, x: 1340, y: 480, name: "Beelzebub", origin: "ebreju val., Bībele", draw: (g) => {
      const dv = new Figure(g, { x: 0, y: 150, s: 1, costume: "shirt", color: "#c0302c", hair: "none", face: -1, mouth: "grin" });
      el("path", { d: "M-22 -104 L-34 -140 L-6 -112 Z M22 -104 L34 -140 L6 -112 Z", fill: "#c0302c", stroke: INK, "stroke-width": 3 }, g); // horns
      el("path", { d: "M10 60 Q70 80 60 20 L72 10 L64 32", fill: "none", stroke: "#c0302c", "stroke-width": 6 }, g);  // tail
      dv.loop(247, 252, (o, lt) => { o.aR[0] = 120 + Math.sin(lt * 4) * 20; o.tilt = Math.sin(lt * 3) * 8; });
    } },
  ];
  bubbles.forEach((b, i) => {
    const g = el("g", { transform: `translate(${b.x} ${b.y})` }, q1);
    el("path", { d: "M-300 -230 Q-300 -280 -250 -280 L250 -280 Q300 -280 300 -230 L300 200 Q300 250 250 250 L-160 250 L-300 330 L-230 250 L-250 250 Q-300 250 -300 200 Z", fill: "#fff8e8", stroke: INK, "stroke-width": 7 }, g);
    text(g, b.name, 0, -205, { size: 66, font: "Hand", fill: "#7a2430" });
    text(g, b.origin, 0, 225, { size: 38, font: "Print", weight: 400, fill: "#5a4a3a" });
    b.draw(g);
    tl.set(g, { opacity: 0 }, 228);
    popIn(g, b.t, 0.6, 0.5);
    if (i < 2) tl.to(g, { opacity: 0, duration: 0.4 }, b.t + 4.6);
  });
  fadeOut(q1, 251.4, 0.6);

  // ---------------- Q3 (252–270): breaking the usual song form
  const q3 = el("g", { opacity: 0 }, S);
  fadeIn(q3, 252, 0.6);
  const usual = el("g", { transform: "translate(0 330)" }, q3);
  const pattern = ["pantiņš", "piedziedājums", "pantiņš", "piedziedājums", "pantiņš", "piedziedājums"];
  pattern.forEach((p, i) => {
    const g = el("g", { transform: `translate(${300 + i * 225} 0)` }, usual);
    el("rect", { x: -100, y: -45, width: 200, height: 90, rx: 18, fill: i % 2 ? "#e05a6a" : "#5a8ae0", stroke: INK, "stroke-width": 5 }, g);
    text(g, p, 0, 14, { size: p.length > 9 ? 30 : 38, font: "Print", weight: 400, fill: "#fff" });
    tl.set(g, { opacity: 0 }, 228); popIn(g, 252.6 + i * 0.35, 0.4);
  });
  const cross = el("path", { d: "M150 -90 L1580 90 M150 90 L1580 -90", stroke: "#ff3b3b", "stroke-width": 16, "stroke-linecap": "round" }, usual);
  drawOn(cross, 256, 0.8);
  tl.to(usual, { opacity: 0.35, duration: 0.6 }, 257.2);
  // Bohemian Rhapsody: six different parts in a row — no repeating chorus
  const parts = [
    ["A cappella", "#7f8cff"], ["Balāde", "#e8c46a"], ["Ģitāras solo", "#ff6a6a"],
    ["Opera", "#d470ff"], ["Hārdroks", "#ff8a2a"], ["Noslēgums", "#7fd6e0"],
  ];
  const row = el("g", { transform: "translate(0 680)" }, q3);
  parts.forEach(([name, col], i) => {
    const g = el("g", { transform: `translate(${230 + i * 292} 0)` }, row);
    el("rect", { x: -130, y: -120, width: 260, height: 220, rx: 22, fill: col, stroke: INK, "stroke-width": 6 }, g);
    text(g, name, 0, 140, { size: 44, font: "Hand", fill: "#fff" });
    const ic = el("g", { transform: "translate(0 -10)" }, g);
    if (i === 0) [-45, -15, 15, 45].forEach((x, k) => { el("circle", { cx: x, cy: -10, r: 16, fill: "#fff", stroke: INK, "stroke-width": 4 }, ic); el("ellipse", { cx: x + 3, cy: -4, rx: 4, ry: 6, fill: "#7a2430" }, ic); });
    if (i === 1) { el("rect", { x: -70, y: -20, width: 140, height: 36, fill: "#fff", stroke: INK, "stroke-width": 4 }, ic); for (let k = 0; k < 8; k++) el("rect", { x: -64 + k * 17, y: -20, width: 8, height: 20, fill: INK }, ic); }
    if (i === 2) { el("path", { d: "M-60 30 Q-70 -10 -30 -10 Q-10 -30 10 -10 Q40 -14 30 20 Q20 50 -20 40 Q-50 50 -60 30 Z", fill: "#a0522d", stroke: INK, "stroke-width": 4 }, ic); el("rect", { x: 20, y: -16, width: 70, height: 10, fill: "#5a3a24", transform: "rotate(-30)" }, ic); }
    if (i === 3) { el("path", { d: "M-55 -40 Q-55 30 -10 40 Q-5 -10 -55 -40 Z M55 -40 Q55 30 10 40 Q5 -10 55 -40 Z", fill: "#fff", stroke: INK, "stroke-width": 4 }, ic); el("path", { d: "M-40 0 q8 8 16 0 M24 0 q8 8 16 0", fill: "none", stroke: INK, "stroke-width": 3 }, ic); }
    if (i === 4) { el("path", { d: "M-20 -50 L10 -50 L-5 -10 L20 -10 L-25 50 L-10 5 L-30 5 Z", fill: "#ffe066", stroke: INK, "stroke-width": 4 }, ic); }
    if (i === 5) { el("circle", { r: 46, fill: "#d9a72e", stroke: INK, "stroke-width": 5 }, ic); el("circle", { r: 18, fill: "#f2c94c" }, ic); }
    tl.set(g, { opacity: 0 }, 228);
    tl.fromTo(g, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.6)" }, 258 + i * 1.3);
  });
  const head = el("path", { d: "M0 -150 L0 130", stroke: "#fff", "stroke-width": 6 }, row);
  updaters.push(t => { const p = Math.min(1, Math.max(0, (t - 265.8) / 3.8)); head.setAttribute("transform", `translate(${100 + p * 1750} 0)`); head.setAttribute("opacity", t > 265.8 && t < 269.8 ? 1 : 0); });
  fadeOut(q3, 269.4, 0.6);

  // ---------------- Q4 (270–288): the story in four panels
  const q4 = el("g", { opacity: 0 }, S);
  fadeIn(q4, 270, 0.6);
  const panels = [[60, 220], [990, 220], [60, 640], [990, 640]];
  panels.forEach(([x, y], i) => {
    const g = el("g", { transform: `translate(${x} ${y})` }, q4);
    el("rect", { x: 0, y: 0, width: 870, height: 390, rx: 16, fill: ["#f6efe2", "#e8e2f0", "#ffe6d8", "#dfeff2"][i], stroke: INK, "stroke-width": 7 }, g);
    const at = 270.6 + i * 4.2;
    tl.set(g, { opacity: 0 }, 228); popIn(g, at, 0.5, 0.85);
    if (i === 0) {        // confession to mother
      const son = new Figure(g, { x: 330, y: 370, s: 1.1, costume: "shirt", color: "#5a7ab0", hair: "short", face: 1, mouth: "sad", tilt: 12 });
      const mom = new Figure(g, { x: 560, y: 370, s: 1.1, costume: "dress", color: "#c890b0", hair: "long", hairColor: "#8a7a6a", face: -1, mouth: "o", aL: [150, 60], aR: [150, 60] });
      son.loop(at, at + 4, (o, lt) => { o.aR[0] = 40 + Math.sin(lt * 2) * 10; });
    } else if (i === 1) { // trial: two choirs pull at his soul
      const boy = new Figure(g, { x: 435, y: 370, s: 1, costume: "shirt", color: "#5a7ab0", hair: "short", face: 1, mouth: "o", aL: [90, 0], aR: [-90, 0] });
      for (let k = 0; k < 3; k++) {
        new Figure(g, { x: 90 + k * 70, y: 370, s: 0.75, costume: "dress", color: "#ffffff", hair: "short", face: 1, aL: [100, 0], aR: [100, 0], mouth: "sing" });
        new Figure(g, { x: 640 + k * 70, y: 370, s: 0.75, costume: "dress", color: "#c0302c", hair: "short", face: -1, aL: [100, 0], aR: [100, 0], mouth: "sing" });
      }
      boy.loop(at, at + 4.2, (o, lt) => { o.lean = Math.sin(lt * 4) * 12; });
      el("path", { d: "M330 120 L250 120 M270 104 L250 120 L270 136 M540 120 L620 120 M600 104 L620 120 L600 136", fill: "none", stroke: INK, "stroke-width": 6 }, g);
      el("path", { d: "M435 40 L435 90 M395 60 L475 60 M385 60 L375 90 L395 90 Z M485 60 L475 90 L495 90 Z", fill: "none", stroke: "#8a6a2a", "stroke-width": 5 }, g); // scales
    } else if (i === 2) { // rebellion: breaks free
      const reb = new Figure(g, { x: 435, y: 370, s: 1.1, costume: "shirt", color: "#5a7ab0", hair: "short", face: 1, mouth: "grin", aL: [170, 0], aR: [40, 30] });
      reb.loop(at, at + 4.2, (o, lt) => { o.bob = -Math.abs(Math.sin(lt * 6)) * 14; });
      el("path", { d: "M300 160 l20 0 M560 160 l20 0", stroke: "#888", "stroke-width": 8 }, g);  // broken chain bits
      el("path", { d: "M660 40 L630 120 L670 120 L640 200", fill: "none", stroke: "#e0a800", "stroke-width": 8, "stroke-linejoin": "round" }, g);
      el("path", { d: "M200 40 L170 120 L210 120 L180 200", fill: "none", stroke: "#e0a800", "stroke-width": 8, "stroke-linejoin": "round" }, g);
    } else {              // calm ending: alone, wind blows
      el("path", { d: "M0 390 Q300 250 870 330 L870 390 Z", fill: "#a8cfa0" }, g);
      const alone = new Figure(g, { x: 430, y: 300, s: 0.9, costume: "shirt", color: "#5a7ab0", hair: "short", face: 1, mouth: "flat", lL: [85, -85], lR: [80, -80] });
      const wind = [0, 1, 2].map(k => el("path", { d: "M0 0 q40 -20 80 0 t80 0", fill: "none", stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round" }, g));
      updaters.push(t => wind.forEach((w, k) => w.setAttribute("transform", `translate(${((t * 120 + k * 280) % 1000) - 150} ${80 + k * 45})`)));
      const gong = el("circle", { cx: 760, cy: 120, r: 46, fill: "#d9a72e", stroke: INK, "stroke-width": 5 }, g);
    }
  });
  fadeOut(q4, 287.4, 0.6);

  // ---------------- Q5 (288–300): crossroads of cultures and eras
  const q5 = el("g", { opacity: 0 }, S);
  fadeIn(q5, 288, 0.6);
  const corners = [
    [220, 300, "Itālijas teātris", "#ffd27a"], [1700, 300, "Eiropas opera", "#d470ff"],
    [220, 860, "Islāma frāzes", "#2a8a96"], [1700, 860, "Smagais roks", "#ff6a3a"],
  ];
  const fc = freddie(q5, { x: 960, y: 820, s: 1.6, face: 1, aR: [150, 0], aL: [-120, 0] });
  const burst = el("g", { transform: "translate(960 520)" }, q5);
  for (let k = 0; k < 16; k++) el("path", { d: `M0 0 L${Math.cos(k * 0.3927) * 900} ${Math.sin(k * 0.3927) * 900}`, stroke: "#ffe08a", "stroke-width": 10, opacity: 0.25 }, burst);
  q5.insertBefore(burst, q5.firstChild);
  tl.set(burst, { opacity: 0 }, 228); tl.to(burst, { opacity: 1, duration: 0.8 }, 295.5);
  updaters.push(t => burst.setAttribute("transform", `translate(960 520) rotate(${t * 10})`));
  corners.forEach(([x, y, name, col], i) => {
    const road = el("path", { d: `M${x} ${y} Q${(x + 960) / 2} ${(y + 560) / 2 + (i < 2 ? -60 : 60)} 960 560`, fill: "none", stroke: col, "stroke-width": 14, "stroke-linecap": "round", "stroke-dasharray": "30 20" }, q5);
    q5.insertBefore(road, q5.firstChild);
    tl.set(road, { opacity: 0 }, 228); fadeIn(road, 289 + i * 0.6, 0.5);
    const g = el("g", {}, q5);
    el("circle", { r: 74, fill: col, stroke: INK, "stroke-width": 6 }, g);
    if (i === 0) { el("path", { d: "M-44 -14 Q0 -40 44 -14 Q40 14 14 10 Q0 -4 -14 10 Q-40 14 -44 -14 Z", fill: INK }, g); }        // commedia half-mask
    if (i === 1) { el("path", { d: "M-46 30 L-46 -10 Q0 -60 46 -10 L46 30 Z M-30 30 L-30 0 M0 30 L0 -10 M30 30 L30 0", fill: "#fff", stroke: INK, "stroke-width": 4 }, g); } // opera house
    if (i === 2) { el("rect", { x: -32, y: -32, width: 64, height: 64, fill: "#ffe08a", stroke: INK, "stroke-width": 3 }, g); el("rect", { x: -32, y: -32, width: 64, height: 64, fill: "#ffe08a", stroke: INK, "stroke-width": 3, transform: "rotate(45)" }, g); }
    if (i === 3) { el("path", { d: "M-10 -50 L20 -50 L4 -8 L28 -8 L-18 52 L-4 8 L-26 8 Z", fill: "#ffe066", stroke: INK, "stroke-width": 4 }, g); }
    text(g, name, 0, 118, { size: 44, font: "Hand", fill: "#fff" });
    // icon travels along its road into Freddie
    updaters.push(t => {
      const p = Math.min(1, Math.max(0, (t - 293 - i * 0.3) / 2.2));
      const e = p * p * (3 - 2 * p);
      const cx = (x + 960) / 2, cy = (y + 560) / 2 + (i < 2 ? -60 : 60);
      const bx = (1 - e) * (1 - e) * x + 2 * (1 - e) * e * cx + e * e * 960;
      const by = (1 - e) * (1 - e) * y + 2 * (1 - e) * e * cy + e * e * 560;
      g.setAttribute("transform", `translate(${bx} ${by}) scale(${1 - e * 0.85})`);
      g.setAttribute("opacity", t < 289 + i * 0.6 ? 0 : (p >= 1 ? 0 : 1));
    });
  });
  fc.loop(289, 300, (o, lt) => { o.mouth = Math.sin(lt * 5) > 0 ? "sing" : "grin"; o.bob = Math.sin(lt * 3) * 3; });
  fc.to({ aL: [170, 0], aR: [165, -20], mouth: "grin" }, 295.3, 0.4);
  S.appendChild(label);
})();

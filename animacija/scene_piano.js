// Replacement scene (72 s): Bartolomeo Cristofori invents the piano (c. 1700).
// Standalone clip — rendered from piano.html, meant to replace the Beethoven part (1:18–2:30).
(function () {
  const S = scene(0, 72, 0.8);

  // ---------------- helpers
  function harpsichord(parent, x, y, s, lid = "#3d6b4f") {
    const g = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, parent);
    el("path", { d: "M-200 -110 L120 -110 Q300 -110 320 -70 L330 -40 L-200 -40 Z", fill: lid, stroke: INK, "stroke-width": 7, "stroke-linejoin": "round" }, g);
    el("path", { d: "M-190 -104 L110 -104 Q280 -104 300 -72", fill: "none", stroke: "#d9b45a", "stroke-width": 5 }, g);
    el("rect", { x: -205, y: -44, width: 200, height: 24, fill: "#fffaf0", stroke: INK, "stroke-width": 5 }, g);
    for (let i = 0; i < 13; i++) el("line", { x1: -202 + i * 15, y1: -42, x2: -202 + i * 15, y2: -22, stroke: INK, "stroke-width": 2 }, g);
    for (let i = 0; i < 13; i++) if (![2, 6, 9, 12].includes(i)) el("rect", { x: -196 + i * 15, y: -42, width: 8, height: 12, fill: INK }, g);
    for (const lx of [-180, 40, 280]) el("path", { d: `M${lx} -40 L${lx - 6} 70`, stroke: INK, "stroke-width": 9, "stroke-linecap": "round" }, g);
    return g;
  }

  // a sound "speaker": rings whose size follows an amplitude function amp(t)
  function soundRings(parent, x, y, amp, col = "#c8302c") {
    const g = el("g", { transform: `translate(${x} ${y})` }, parent);
    const rs = [0, 1, 2].map(() => el("path", { fill: "none", stroke: col, "stroke-width": 7, "stroke-linecap": "round" }, g));
    updaters.push(t => {
      const a = amp(t);
      rs.forEach((r, i) => {
        const p = ((t * 1.6) + i / 3) % 1;
        const R = 20 + p * 160 * a;
        r.setAttribute("d", `M${R * Math.cos(-0.7)} ${R * Math.sin(-0.7)} A${R} ${R} 0 0 1 ${R * Math.cos(0.7)} ${R * Math.sin(0.7)}`);
        r.setAttribute("opacity", a > 0.02 ? (1 - p) * Math.min(1, a * 2) : 0);
        r.setAttribute("stroke-width", 3 + 7 * a);
      });
    });
    return g;
  }

  // key presses: [time, strength 0..1]; returns amplitude envelope helpers
  const envelope = (presses, decay = 1.6, fixed = null) => t => {
    let a = 0;
    for (const [t0, s] of presses) if (t >= t0) a = Math.max(a, (fixed ?? s) * Math.exp(-(t - t0) * decay));
    return a;
  };

  const label = el("g", {}, null);
  text(label, "Bartolomeo Kristofori", 960, 110, { size: 92, font: "Hand" });
  const sub = text(label, "Florence, ap 1700", 960, 175, { size: 50, font: "Print", weight: 400, fill: "#5a4a3a" });
  popIn(label, 0.6, 0.8, 0.8);
  const caps = [[0, "Florence, ap 1700"], [16, "klavesīns vai klavieres?"], [38, "1711 · gravicembalo col piano e forte"], [54, "jaunais instruments"]];
  updaters.push(t => {
    let k = 0;
    for (let i = 0; i < caps.length; i++) if (t >= caps[i][0] - 0.05) k = i;
    sub.textContent = caps[k][1];
    const d = Math.min(...caps.map(c => Math.abs(t - c[0])));
    sub.setAttribute("opacity", k === 0 ? 1 : Math.min(1, d / 0.3));
  });

  // ---------------- P1 (0–16): the Medici workshop — a harpsichord cannot play soft or loud
  const p1 = el("g", {}, S);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#ead3ab" }, p1);
  for (let x = 0; x < 1920; x += 120) el("line", { x1: x, y1: 0, x2: x, y2: 900, stroke: "#d8bd8e", "stroke-width": 6 }, p1);
  el("rect", { x: 0, y: 900, width: 1920, height: 180, fill: "#a87b4f" }, p1);
  el("line", { x1: 0, y1: 900, x2: 1920, y2: 900, stroke: INK, "stroke-width": 7 }, p1);
  // tools on the wall + the Medici crest balls
  const tools = el("g", { transform: "translate(1500 300)" }, p1);
  el("path", { d: "M0 0 L120 0 L120 30 L0 30 Z M120 0 L150 15 L120 30", fill: "#c9ced6", stroke: INK, "stroke-width": 4 }, tools);       // chisel / saw blade
  el("path", { d: "M10 80 L130 80 M110 60 L150 60 L150 100 L110 100 Z", fill: "#8a5a34", stroke: INK, "stroke-width": 6 }, tools);  // mallet
  el("path", { d: "M0 160 L60 160 L60 230 L0 230 Z", fill: "none", stroke: INK, "stroke-width": 5 }, tools);
  const crest = el("g", { transform: "translate(300 300)" }, p1);
  el("path", { d: "M-70 -80 L70 -80 L70 20 Q0 100 -70 20 Z", fill: "#f2c94c", stroke: INK, "stroke-width": 6 }, crest);
  for (const [x, y] of [[-35, -45], [0, -55], [35, -45], [-30, -10], [30, -10], [0, 25]]) el("circle", { cx: x, cy: y, r: 13, fill: "#c0302c", stroke: INK, "stroke-width": 3 }, crest);
  const hc = harpsichord(p1, 900, 860, 1.35);
  const player = new Figure(p1, { x: 520, y: 880, s: 1.15, costume: "dress", color: "#7fa7d6", hair: "long", hairColor: "#5a3a24", face: 1, lL: [85, -85], lR: [80, -80], aL: [72, 18], aR: [76, 14], mouth: "smile" });
  el("rect", { x: 460, y: 825, width: 120, height: 24, fill: "#5a3a24", stroke: INK, "stroke-width": 5 }, p1);
  const cristo = new Figure(p1, { x: 1560, y: 900, s: 1.2, costume: "shirt", color: "#6b4a3a", hair: "wig", face: -1, aR: [150, 60], aL: [40, 40], mouth: "flat" });
  // soft press (4 s) and hard press (8.5 s) give the same sound
  player.loop(3.5, 5, (o, lt) => { o.aL[1] = 18 + Math.sin(lt * 10) * 5; o.aR[1] = 14 + Math.sin(lt * 10) * 5; });
  player.to({ aL: [95, 0], aR: [98, -4], lean: 14 }, 8, 0.3).to({ aL: [72, 30], aR: [76, 26], lean: 4 }, 8.4, 0.15);
  const amp1 = envelope([[4, 0.35], [8.5, 1]], 1.4, 0.35);  // harpsichord: always the same loudness
  soundRings(p1, 1180, 700, amp1, "#3d6b4f");
  const soft = text(p1, "viegli", 700, 520, { size: 54, font: "Hand", fill: "#4f81bd" });
  const hard = text(p1, "stipri!", 700, 520, { size: 72, font: "Hand", fill: "#c0302c" });
  tl.set(soft, { opacity: 0 }, 0); popIn(soft, 3.6, 0.4); fadeOut(soft, 6.6, 0.3);
  tl.set(hard, { opacity: 0 }, 0); popIn(hard, 7.8, 0.4); fadeOut(hard, 11.6, 0.3);
  const same = text(p1, "=", 1180, 540, { size: 110, font: "Print", weight: 400, fill: "#3d6b4f" });
  tl.set(same, { opacity: 0 }, 0); popIn(same, 10, 0.5);
  player.set({ mouth: "sad" }, 10);
  const q = text(p1, "?", 600, 560, { size: 100, font: "Hand", fill: "#c0302c" });
  tl.set(q, { opacity: 0 }, 0); popIn(q, 10.4, 0.4);
  cristo.loop(2, 12, (o, lt) => { o.aR[0] = 150 + Math.sin(lt * 1.2) * 8; o.tilt = Math.sin(lt) * 5; });
  const bulb = el("g", { transform: "translate(1560 520)" }, p1);
  el("circle", { r: 34, fill: "#fff27a", stroke: INK, "stroke-width": 6 }, bulb);
  el("path", { d: "M-14 34 L14 34 L12 52 L-12 52 Z", fill: "#bbb", stroke: INK, "stroke-width": 5 }, bulb);
  for (let k = 0; k < 8; k++) el("line", { x1: Math.cos(k * 0.785) * 48, y1: Math.sin(k * 0.785) * 48, x2: Math.cos(k * 0.785) * 64, y2: Math.sin(k * 0.785) * 64, stroke: "#e0a800", "stroke-width": 6, "stroke-linecap": "round" }, bulb);
  tl.set(bulb, { opacity: 0 }, 0); popIn(bulb, 12.8, 0.6);
  cristo.to({ aR: [170, 10], mouth: "grin" }, 12.8, 0.4);
  fadeOut(p1, 15.4, 0.6);

  // ---------------- P2 (16–38): inside the instrument — pluck vs hammer
  const p2 = el("g", { opacity: 0 }, S);
  fadeIn(p2, 16, 0.6);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#f3e6cc" }, p2);
  function mechanism(cx, title, col, kind, presses, t0) {
    const g = el("g", { transform: `translate(${cx} 600)` }, p2);
    el("rect", { x: -400, y: -300, width: 800, height: 520, rx: 26, fill: "#fffaf0", stroke: INK, "stroke-width": 7 }, g);
    text(g, title, 0, -230, { size: 70, font: "Hand", fill: col });
    // string
    const str = el("path", { fill: "none", stroke: "#8a8a8a", "stroke-width": 5 }, g);
    el("circle", { cx: -300, cy: -100, r: 9, fill: INK }, g); el("circle", { cx: 300, cy: -100, r: 9, fill: INK }, g);
    // key lever on a pivot
    const lever = el("g", {}, g);
    el("rect", { x: -320, y: 110, width: 380, height: 26, rx: 6, fill: "#fffaf0", stroke: INK, "stroke-width": 5 }, lever);
    el("rect", { x: -320, y: 110, width: 90, height: 26, rx: 6, fill: "#fff", stroke: INK, "stroke-width": 5 }, lever);
    el("path", { d: "M-60 160 L-80 190 L-40 190 Z", fill: INK }, g);   // pivot
    const finger = el("path", { d: "M0 0 L0 -60", stroke: "#e8b890", "stroke-width": 26, "stroke-linecap": "round" }, g);
    let actor;
    if (kind === "pluck") {   // jack with a quill
      actor = el("g", {}, g);
      el("rect", { x: 30, y: -40, width: 26, height: 150, fill: "#c9a46a", stroke: INK, "stroke-width": 4 }, actor);
      el("path", { d: "M56 -30 L90 -36 L56 -24 Z", fill: "#fff", stroke: INK, "stroke-width": 3 }, actor);
    } else {                  // hammer covered with leather
      actor = el("g", {}, g);
      el("path", { d: "M100 120 L100 20", stroke: "#8a5a34", "stroke-width": 12, "stroke-linecap": "round" }, actor);
      el("rect", { x: 74, y: -14, width: 52, height: 40, rx: 14, fill: "#b08050", stroke: INK, "stroke-width": 5 }, actor);
    }
    const damper = el("rect", { x: 170, y: -140, width: 40, height: 34, rx: 4, fill: "#5a5a6a", stroke: INK, "stroke-width": 3 }, g);
    const amp = kind === "pluck" ? envelope(presses, 1.3, 0.35) : envelope(presses, 0.9);
    const rings = soundRings(g, 310, -100, amp, col);
    updaters.push(t => {
      // find the latest press for the mechanical motion
      let mv = 0, strength = 0, since = 99;
      for (const [tp, s] of presses) if (t >= tp && t - tp < since) { since = t - tp; strength = s; }
      if (since < 0.9) mv = since < 0.15 ? since / 0.15 : Math.max(0, 1 - (since - 0.6) / 0.3);
      const press = mv * (0.4 + 0.6 * strength);
      lever.setAttribute("transform", `rotate(${-press * 7} -60 160)`);
      finger.setAttribute("transform", `translate(-275 ${70 + press * 30})`);
      finger.setAttribute("opacity", since < 0.9 ? 1 : 0);
      if (kind === "pluck") {
        const rise = Math.min(1, since / 0.18);
        actor.setAttribute("transform", `translate(0 ${since < 0.9 ? -rise * 90 * mv : 0})`);
      } else {
        // the hammer flies up, strikes the string and falls back at once (escapement)
        const up = since < 0.12 ? since / 0.12 : Math.max(0, 1 - (since - 0.12) / 0.18);
        actor.setAttribute("transform", `translate(0 ${-up * 108 * (since < 0.9 ? 1 : 0)})`);
      }
      damper.setAttribute("transform", `translate(0 ${since < 0.9 ? -30 * mv : 0})`);
      const a = amp(t);
      let d = "";
      for (let x = -300; x <= 300; x += 10) d += (d ? " L" : "M") + x + " " + (-100 + Math.sin((x + 300) / 600 * Math.PI) * Math.sin(t * 60) * 18 * a).toFixed(1);
      str.setAttribute("d", d);
    });
    tl.set(g, { opacity: 0 }, 0); popIn(g, t0, 0.6, 0.85);
    return g;
  }
  // harpsichord: soft and hard press → same loudness;  piano: soft → quiet, hard → loud
  mechanism(500, "klavesīns: plūc", "#3d6b4f", "pluck", [[18.5, 0.3], [21, 1], [24, 0.3], [26.5, 1]], 16.6);
  mechanism(1420, "klavieres: sit ar āmuriņu", "#c0302c", "hammer", [[28.5, 0.3], [31.5, 1], [34.5, 0.3], [36, 1]], 27.2);
  const pl = text(p2, "piano", 1250, 940, { size: 64, font: "Hand", fill: "#4f81bd" });
  const fl = text(p2, "forte", 1600, 960, { size: 96, font: "Hand", fill: "#c0302c" });
  tl.set(pl, { opacity: 0 }, 0); popIn(pl, 28.7, 0.4);
  tl.set(fl, { opacity: 0 }, 0); popIn(fl, 31.7, 0.4);
  const pl2 = text(p2, "=", 500, 950, { size: 90, font: "Print", weight: 400, fill: "#3d6b4f" });
  tl.set(pl2, { opacity: 0 }, 0); popIn(pl2, 21.4, 0.4);
  fadeOut(p2, 37.4, 0.6);

  // ---------------- P3 (38–54): the name — "harpsichord with soft and loud"
  const p3 = el("g", { opacity: 0 }, S);
  fadeIn(p3, 38, 0.6);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#ead3ab" }, p3);
  el("rect", { x: 0, y: 900, width: 1920, height: 180, fill: "#a87b4f" }, p3);
  el("line", { x1: 0, y1: 900, x2: 1920, y2: 900, stroke: INK, "stroke-width": 7 }, p3);
  // Cristofori's piano (wing-shaped like a harpsichord, light wood)
  const cp = harpsichord(p3, 1060, 860, 1.5, "#c9a06a");
  const cr2 = new Figure(p3, { x: 520, y: 900, s: 1.3, costume: "shirt", color: "#6b4a3a", hair: "wig", face: 1, aR: [100, -20], aL: [20, 10], mouth: "grin" });
  cr2.to({ aR: [70, 20], lean: 18, tilt: 10 }, 51, 0.6);   // proud bow
  const nm = el("g", {}, p3);
  const words = [["gravicembalo", "#5a4a3a"], ["col", "#5a4a3a"], ["piano", "#4f81bd"], ["e", "#5a4a3a"], ["forte", "#c0302c"]];
  const wEls = [];
  let xx = 300;
  words.forEach(([w, c], i) => {
    const t = text(nm, w, xx, 360, { size: 76, font: "Hand", fill: c, anchor: "start" });
    wEls.push(t);
    xx += w.length * 34 + 40;
    tl.set(t, { opacity: 0 }, 0); popIn(t, 39 + i * 0.6, 0.4);
  });
  // the long name shrinks: keep "piano" and "forte" → pianoforte → piano
  [0, 1, 3].forEach(i => tl.to(wEls[i], { opacity: 0, duration: 0.5 }, 44));
  const pf = text(nm, "pianoforte", 960, 360, { size: 120, font: "Hand", fill: "#8064a2" });
  tl.set(pf, { opacity: 0 }, 0);
  tl.to([wEls[2], wEls[4]], { opacity: 0, duration: 0.4 }, 45.6);
  popIn(pf, 45.8, 0.6);
  const pn = text(nm, "piano", 960, 360, { size: 150, font: "Hand", fill: INK });
  tl.set(pn, { opacity: 0 }, 0);
  tl.to(pf, { opacity: 0, duration: 0.4 }, 48.6);
  popIn(pn, 48.8, 0.6);
  const old = text(p3, "1720 · vecākās saglabātās klavieres", 1060, 960, { size: 46, font: "Print", weight: 400, fill: "#5a4a3a" });
  tl.set(old, { opacity: 0 }, 0); popIn(old, 50, 0.5);
  fadeOut(p3, 53.4, 0.6);

  // ---------------- P4 (54–72): why it matters — expression in the fingers, at home and on stage
  const p4 = el("g", { opacity: 0 }, S);
  fadeIn(p4, 54, 0.6);
  el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "#f3e3c8" }, p4);
  el("rect", { x: 0, y: 900, width: 1920, height: 180, fill: "#a87b4f" }, p4);
  el("line", { x1: 0, y1: 900, x2: 1920, y2: 900, stroke: INK, "stroke-width": 7 }, p4);
  // home: a child learns at an upright piano
  const home = el("g", {}, p4);
  piano(home, 420, 900, 1.1, "upright");
  const kid = new Figure(home, { x: 270, y: 875, s: 0.75, costume: "shirt", color: "#6fdc8c", hair: "short", face: 1, lL: [85, -85], lR: [80, -80], aL: [70, 20], aR: [65, 25], mouth: "grin" });
  el("rect", { x: 215, y: 825, width: 110, height: 22, fill: "#7b5a3c", stroke: INK, "stroke-width": 5 }, home);
  kid.loop(54, 72, (o, lt) => { o.aL[1] = 20 + Math.sin(lt * 9) * 10; o.aR[1] = 25 + Math.cos(lt * 8) * 10; });
  const mom = new Figure(home, { x: 120, y: 900, s: 1.05, costume: "dress", color: "#c890b0", hair: "long", face: 1, aR: [40, 50], mouth: "smile" });
  floatNotes(home, 55, 72, { x: 420, y: 700, h: 220 }, 5, "#4f81bd");
  // stage: Beethoven plays with full power — the piano made such music possible
  const stage = el("g", {}, p4);
  tl.set(stage, { opacity: 0 }, 0); fadeIn(stage, 58, 0.6);
  piano(stage, 1330, 820, 1.2, "grand");
  const lud = new Figure(stage, { x: 1060, y: 880, s: 1.15, costume: "coat", face: 1, lL: [85, -85], lR: [80, -80], aL: [70, 25], aR: [75, 20], mouth: "grin" });
  el("rect", { x: 1000, y: 825, width: 120, height: 24, fill: "#5a3a24", stroke: INK, "stroke-width": 5 }, stage);
  lud.loop(58.5, 72, (o, lt) => {
    const k = Math.sin(lt * 11), k2 = Math.cos(lt * 13);
    o.aL[0] = 72 + k * 22; o.aL[1] = 20 + Math.max(0, k) * 30; o.aR[0] = 76 + k2 * 22; o.aR[1] = 18 + Math.max(0, k2) * 30;
    o.lean = 8 + Math.sin(lt * 3) * 8; o.tilt = Math.sin(lt * 5) * 10;
  });
  const ln = text(stage, "Ludvigs van Bēthovens", 1330, 470, { size: 56, font: "Hand", fill: "#2c3e66" });
  // loud-soft waves over the stage: expression in the player's fingers
  soundRings(stage, 1700, 640, t => 0.25 + 0.75 * Math.abs(Math.sin(t * 0.9)), "#c0302c");
  floatNotes(stage, 59, 72, { x: 1400, y: 640, h: 300, dx: 120 }, 9, "#c0302c");
  S.appendChild(label);
})();

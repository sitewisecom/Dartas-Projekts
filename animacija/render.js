// Frame renderer: loads index.html in headless Chromium, seeks each frame, pipes JPEGs to ffmpeg.
// usage: node render.js stills out_dir t1 t2 ...   |   node render.js video out.mp4 [workers]
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const FPS = 30;
const PAGE = "file://" + path.join(__dirname, process.env.PAGE || "index.html");

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("pageerror", e => console.error("PAGE ERROR:", e.message));
  page.on("console", m => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.goto(PAGE);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  return page;
}

async function stills(outDir, times) {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await openPage(browser);
  console.log("duration", await page.evaluate(() => window.DURATION));
  for (const t of times) {
    await page.evaluate(t => window.seek(t), t);
    const p = path.join(outDir, `t${String(t.toFixed(1)).padStart(6, "0")}.jpg`);
    await page.screenshot({ path: p, type: "jpeg", quality: 85 });
    console.log(p);
  }
  await browser.close();
}

async function chunk(browser, a, b, out) {
  const page = await openPage(browser);
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-g", "60", out], { stdio: ["pipe", "inherit", "inherit"] });
  for (let k = a; k < b; k++) {
    await page.evaluate(t => window.seek(t), k / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if ((k - a) % 300 === 0) console.log(`${path.basename(out)} ${k - a}/${b - a}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await page.close();
}

async function video(out, workers) {
  const browser = await chromium.launch();
  const probe = await openPage(browser);
  const dur = await probe.evaluate(() => window.DURATION);
  await probe.close();
  const n = Math.round(dur * FPS);
  console.log(`duration ${dur.toFixed(2)} s, ${n} frames`);
  const tmp = path.join(path.dirname(out), "chunks");
  fs.mkdirSync(tmp, { recursive: true });
  const parts = [];
  const jobs = [];
  for (let i = 0; i < workers; i++) {
    const a = Math.floor(n * i / workers), b = Math.floor(n * (i + 1) / workers);
    const p = path.join(tmp, `c${i}.mp4`);
    parts.push(p);
    jobs.push(chunk(browser, a, b, p));
  }
  await Promise.all(jobs);
  await browser.close();
  fs.writeFileSync(path.join(tmp, "list.txt"), parts.map(p => `file '${p}'`).join("\n"));
  await new Promise((res, rej) => {
    const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(tmp, "list.txt"), "-c", "copy", "-movflags", "+faststart", out], { stdio: "inherit" });
    ff.on("close", c => c === 0 ? res() : rej(new Error("concat failed")));
  });
  console.log("wrote", out);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === "stills") stills(args[0], args.slice(1).map(Number));
else video(args[0], Number(args[1] || 4));

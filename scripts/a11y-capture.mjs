// M2 Accessibility Acceptance — A1 evidence capture.
// Dependency-free: Node 24 built-ins + installed Chromium over the Chrome
// DevTools Protocol. NO Playwright (not installed). Builds the site, serves it
// on a loopback preview, and captures real browser evidence across the registered
// route matrix plus one keyboard-focus capture per route. Fail-closed: any page
// console error, failed request, or non-loopback request fails the run.
// Evidence binaries under gitignored .playwright-mcp/m2-accessibility-acceptance/.
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, rm, mkdir, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { createServer } from "node:net";
import assert from "node:assert/strict";

const OUT = ".playwright-mcp/m2-accessibility-acceptance";
const SHOTS = join(OUT, "screenshots");
const ROOT = resolve(".");
const OUT_ABS = resolve(OUT);
const SHOTS_ABS = resolve(SHOTS);

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  "/snap/bin/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
].filter(Boolean);

// Expected values grounded in built dist/ output (verified 2026-07-22).
const EXPECTED = {
  "/": {
    canonical: "https://example.com/",
    robots: null,
    h1: "Ryan Brosas",
    navCurrent: null,
    brandCurrent: true,
    headerCurrent: true,
    sched: false,
    recovery: null,
  },
  "/about/": {
    canonical: "https://example.com/about/",
    robots: null,
    h1: "About Ryan Brosas",
    navCurrent: "About",
    brandCurrent: false,
    headerCurrent: true,
    sched: false,
    recovery: null,
  },
  "/services/": {
    canonical: "https://example.com/services/",
    robots: null,
    h1: "Work With Me",
    navCurrent: "Work With Me",
    brandCurrent: false,
    headerCurrent: true,
    sched: false,
    recovery: null,
  },
  "/contact/": {
    canonical: "https://example.com/contact/",
    robots: null,
    h1: "Contact",
    navCurrent: "Contact",
    brandCurrent: false,
    headerCurrent: true,
    sched: true,
    recovery: null,
  },
  "/case-studies/": {
    canonical: "https://example.com/case-studies/",
    robots: null,
    h1: "Case Studies",
    navCurrent: "Case Studies",
    brandCurrent: false,
    headerCurrent: true,
    sched: false,
    recovery: null,
  },
  "/case-studies/this-site/": {
    canonical: "https://example.com/case-studies/this-site/",
    robots: null,
    h1: "Building This Website: A Transparent Self-Project",
    navCurrent: null,
    brandCurrent: false,
    headerCurrent: false,
    sched: false,
    recovery: null,
  },
  "/resources/": {
    canonical: "https://example.com/resources/",
    robots: null,
    h1: "Resources",
    navCurrent: "Resources",
    brandCurrent: false,
    headerCurrent: true,
    sched: false,
    recovery: null,
  },
  "/resources/ai-workflow-readiness/": {
    canonical: "https://example.com/resources/ai-workflow-readiness/",
    robots: null,
    h1: "AI Workflow Readiness Checklist",
    navCurrent: null,
    brandCurrent: false,
    headerCurrent: false,
    sched: false,
    recovery: null,
  },
  "/404.html": {
    canonical: "https://example.com/404.html",
    robots: "noindex,follow",
    h1: "Page not found",
    navCurrent: null,
    brandCurrent: false,
    headerCurrent: false,
    sched: false,
    recovery: { href: "/", text: "Return to the home page" },
  },
};
const ROUTES = Object.keys(EXPECTED);
const MATRIX_SCENARIOS = ROUTES.length * 9;
const STRICT_CAPTURES = MATRIX_SCENARIOS + ROUTES.length;
const SCHED_HREF = "https://calendly.com/ryanjoserbrosas/30min";
const SCHED_TEXT = "Schedule a conversation";
const SCHED_REL = "noopener noreferrer";
const MAIL_HREF = "mailto:ryanjoserbrosas@gmail.com";
const MAIL_TEXT = "ryanjoserbrosas@gmail.com";

function routeSlug(route) {
  if (route === "/") return "root";
  if (route === "/404.html") return "404";
  return route.replace(/^\/|\/$/g, "");
}

function assertEvidencePath(p) {
  const abs = resolve(p);
  if (!abs.startsWith(OUT_ABS + sep) && abs !== OUT_ABS) {
    throw new Error("evidence path outside locked dir: " + p);
  }
  return abs;
}

function buildMatrix() {
  const m = [];
  const push = (mode, viewports, dsf = 1) => {
    for (const r of ROUTES)
      for (const v of viewports) m.push({ route: r, mode, w: v[0], h: v[1], dsf });
  };
  push("normal", [
    [320, 800],
    [360, 800],
    [768, 1024],
    [1440, 900],
  ]);
  push("reduced-motion", [
    [360, 800],
    [1440, 900],
  ]);
  push("no-js", [
    [360, 800],
    [1440, 900],
  ]);
  push("zoom200", [[720, 450]], 2);
  return m;
}

function parseCssColor(c) {
  if (!c) return null;
  c = c.trim();
  if (c === "transparent" || c === "rgba(0, 0, 0, 0)") return [0, 0, 0, 0];
  const hex = c.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3)
      h =
        h
          .split("")
          .map((x) => x + x)
          .join("") + "ff";
    else if (h.length === 4) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    else if (h.length === 6) h = h + "ff";
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      parseInt(h.slice(6, 8), 16) / 255,
    ];
  }
  const m = c.match(/rgba?\(([^)]+)\)/i);
  if (!m) return null;
  const p = m[1].split(",").map(parseFloat);
  return p.length === 3 ? [p[0], p[1], p[2], 1] : [p[0], p[1], p[2], p[3]];
}

function compositeColor(fg, bg) {
  const a = fg[3] + bg[3] * (1 - fg[3]);
  if (a === 0) return [0, 0, 0, 0];
  return [
    (fg[0] * fg[3] + bg[0] * bg[3] * (1 - fg[3])) / a,
    (fg[1] * fg[3] + bg[1] * bg[3] * (1 - fg[3])) / a,
    (fg[2] * fg[3] + bg[2] * bg[3] * (1 - fg[3])) / a,
    a,
  ];
}

function relativeLuminance(rgb) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
}

function contrastRatio(fg, bg) {
  // composite fg over bg (both opaque after); bg assumed already-opaque resolved color.
  const c = compositeColor(fg, bg);
  if (c[3] < 0.999) return null;
  const Lfg = relativeLuminance([c[0], c[1], c[2]]);
  const Lbg = relativeLuminance([bg[0], bg[1], bg[2]]);
  const hi = Math.max(Lfg, Lbg),
    lo = Math.min(Lfg, Lbg);
  return (hi + 0.05) / (lo + 0.05);
}

function classifyRequest(url, siteOrigin) {
  if (!url) return "external";
  try {
    const u = new URL(url);
    if (u.protocol === "mailto:" || u.protocol === "tel:") return "external";
    return u.origin === siteOrigin ? "local" : "external";
  } catch {
    return "external";
  }
}

function isExpected404(route, status, type) {
  return route === "/404.html" && status === 404 && type === "Document";
}

async function selfTest() {
  const mx = buildMatrix();
  assert.equal(mx.length, MATRIX_SCENARIOS, "matrix covers every route and mode");
  const modes = {};
  for (const s of mx) modes[s.mode] = (modes[s.mode] || 0) + 1;
  assert.equal(modes.normal, ROUTES.length * 4, "four normal/reflow captures per route");
  assert.equal(modes["reduced-motion"], ROUTES.length * 2, "two reduced-motion captures per route");
  assert.equal(modes["no-js"], ROUTES.length * 2, "two no-js captures per route");
  assert.equal(modes.zoom200, ROUTES.length, "one zoom capture per route");
  assert.deepEqual(mx[0], { route: "/", mode: "normal", w: 320, h: 800, dsf: 1 });
  assert.deepEqual(mx[MATRIX_SCENARIOS - 1], {
    route: "/404.html",
    mode: "zoom200",
    w: 720,
    h: 450,
    dsf: 2,
  });
  assert.equal(routeSlug("/"), "root");
  assert.equal(routeSlug("/about/"), "about");
  assert.equal(routeSlug("/404.html"), "404");
  assert.throws(() => assertEvidencePath("../escape"), /outside/, "reject .. escape");
  assert.throws(() => assertEvidencePath("/etc/passwd"), /outside/, "reject absolute outside");
  const black = parseCssColor("#000000"),
    white = parseCssColor("#ffffff");
  const r21 = contrastRatio(black, white);
  assert.ok(Math.abs(r21 - 21) < 0.05, "black/white ~21, got " + r21);
  const rGray = contrastRatio(parseCssColor("#777777"), white);
  assert.ok(rGray < 4.5, "#777 on white < 4.5, got " + rGray);
  const overWhite = compositeColor(parseCssColor("rgba(0, 0, 0, 0.5)"), white);
  assert.ok(
    Math.abs(overWhite[0] - 128) < 2 &&
      Math.abs(overWhite[1] - 128) < 2 &&
      Math.abs(overWhite[2] - 128) < 2,
    "0.5 black over white ~#808080",
  );
  assert.equal(classifyRequest("http://127.0.0.1:4399/", "http://127.0.0.1:4399"), "local");
  assert.equal(classifyRequest("https://calendly.com/x", "http://127.0.0.1:4399"), "external");
  assert.equal(classifyRequest("mailto:a@b.com", "http://127.0.0.1:4399"), "external");
  assert.equal(isExpected404("/404.html", 404, "Document"), true);
  assert.equal(isExpected404("/404.html", 404, "Image"), false);
  assert.equal(isExpected404("/about/", 404, "Document"), false);
  console.log(`self-test: PASS (matrix ${MATRIX_SCENARIOS}, routes, path guard, contrast, classify, 404)`);
}
// __PART_B__
async function launchBrowser() {
  let bin = null;
  for (const b of CHROME_CANDIDATES) {
    const r = spawnSync(b, ["--version"], { stdio: "pipe" });
    if (r.status === 0 || (r.stdout && r.stdout.length)) {
      bin = b;
      break;
    }
  }
  if (!bin) throw new Error("no chromium binary found");
  const ud = await mkdtemp(join(tmpdir(), "a11y-"));
  const proc = spawn(
    bin,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=0",
      "--remote-allow-origins=*",
      `--user-data-dir=${ud}`,
      "about:blank",
    ],
    { stdio: ["ignore", "pipe", "pipe"], detached: true },
  );
  const killProc = () => {
    try {
      process.kill(-proc.pid, "SIGKILL");
    } catch {
      try {
        proc.kill("SIGKILL");
      } catch {}
    }
  };
  try {
    let port;
    await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("no devtools port")), 15000);
      proc.stderr.on("data", (d) => {
        const m = d.toString().match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
        if (m && !port) {
          port = m[1];
          clearTimeout(t);
          res();
        }
      });
      proc.on("error", rej);
    });
    const v = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    const version = v.Browser || "unknown";
    const ws = new WebSocket(v.webSocketDebuggerUrl);
    await new Promise((r, rej) => {
      ws.onopen = r;
      ws.onerror = rej;
    });
    const pending = new Map();
    let id = 1;
    const handlers = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data.toString());
      if (m.id && pending.has(m.id)) {
        const entry = pending.get(m.id);
        clearTimeout(entry.timer);
        entry.res(m);
        pending.delete(m.id);
        return;
      }
      if (m.method) {
        const key = (m.sessionId || "browser") + "|" + m.method;
        if (handlers.has(key)) for (const h of handlers.get(key)) h(m.params, m.sessionId);
      }
    };
    const send = (method, params = {}, sid) =>
      new Promise((res, rej) => {
        const i = id++;
        const timer = setTimeout(() => {
          if (pending.has(i)) {
            pending.delete(i);
            rej(new Error("timeout " + method));
          }
        }, 15000);
        pending.set(i, { res, rej, timer });
        ws.send(JSON.stringify({ id: i, method, params, sessionId: sid }));
      });
    const on = (sid, method, h) => {
      const key = (sid || "browser") + "|" + method;
      if (!handlers.has(key)) handlers.set(key, []);
      handlers.get(key).push(h);
    };
    const waitFor = (sid, method, timeout = 20000) =>
      new Promise((res, rej) => {
        const t = setTimeout(() => rej(new Error("waitFor timeout " + method)), timeout);
        on(sid, method, () => {
          clearTimeout(t);
          res();
        });
      });
    const cleanup = async () => {
      try {
        ws.close();
      } catch {}
      killProc();
      await rm(ud, { recursive: true, force: true }).catch(() => {});
    };
    return { send, on, waitFor, cleanup, version, bin };
  } catch (e) {
    killProc();
    await rm(ud, { recursive: true, force: true }).catch(() => {});
    throw e;
  }
}

function freePort() {
  return new Promise((res, rej) => {
    const s = createServer();
    s.listen(0, "127.0.0.1", () => {
      const p = s.address().port;
      s.close(() => res(p));
    });
    s.on("error", rej);
  });
}

async function startPreview(port) {
  const proc = spawn(
    "npm",
    ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(port)],
    { stdio: ["ignore", "pipe", "pipe"], cwd: ROOT, detached: true },
  );
  const log = [];
  proc.stdout.on("data", (d) => log.push(d.toString()));
  proc.stderr.on("data", (d) => log.push(d.toString()));
  const origin = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(origin + "/");
      if (r.status === 200) return { proc, origin, log };
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  try {
    process.kill(-proc.pid, "SIGKILL");
  } catch {
    try {
      proc.kill("SIGKILL");
    } catch {}
  }
  throw new Error("preview did not come up:\n" + log.join("").slice(-800));
}

const DOM_ASSERT = `
(function(){
  const q=(s)=>document.querySelector(s), qa=(s)=>Array.from(document.querySelectorAll(s));
  const skip=q('.skip-link'), canon=q('link[rel="canonical"]'), robots=q('meta[name="robots"]'), h1=q('h1');
  const nav=q('nav[aria-label="Primary"]'), brand=q('a.brand'), main=document.getElementById('main');
  const navCur=nav?nav.querySelector('a[aria-current="page"]'):null;
  const sched=q('a[href^="https://calendly"]'), mail=q('a[href^="mailto:"]');
  let recovery=null;
  if(main){const a=Array.from(main.querySelectorAll('a')).find(x=>/Return to the home page/.test(x.textContent));if(a)recovery={href:a.getAttribute('href'),text:a.textContent.trim()};}
  return JSON.stringify({
    lang:document.documentElement.lang,
    mainCount:qa('main#main').length, mainId:main?main.id:null,
    skipHref:skip?skip.getAttribute('href'):null,
    canonicalCount:qa('link[rel="canonical"]').length, canonicalHref:canon?canon.getAttribute('href'):null,
    robots:robots?robots.getAttribute('content'):null,
    h1Count:qa('h1').length, h1Text:h1?h1.textContent.trim():null,
    navCurrent:navCur?navCur.textContent.trim():null,
    brandCurrent:!!(brand&&brand.getAttribute('aria-current')==='page'),
    headerCurrent:!!q('header [aria-current="page"]'),
    scrollWidth:document.documentElement.scrollWidth, clientWidth:document.documentElement.clientWidth,
    schedHref:sched?sched.getAttribute('href'):null, schedText:sched?sched.textContent.trim():null, schedRel:sched?sched.getAttribute('rel'):null,
    mailHref:mail?mail.getAttribute('href'):null, mailText:mail?mail.textContent.trim():null,
    form:!!q('form'), iframe:!!q('iframe'), privacy:!!q('a[href*="/privacy/"]'),
    recoveryHref:recovery?recovery.href:null, recoveryText:recovery?recovery.text:null
  });
})()`;

const CONTRAST_ASSERT = `
(function(){
  function parse(c){ if(!c||c==='transparent')return [0,0,0,0]; c=(c+'').trim(); function nums(s){return s.split(/[\\s,/]+/).filter(Boolean).map(parseFloat);} var ok=c.match(/^oklch\\(([^)]+)\\)/i); if(ok){var p=nums(ok[1]); var L=p[0],C=p[1]||0,H=p[2]||0,a=p.length>3?p[3]:1; var hr=H*Math.PI/180; var la=C*Math.cos(hr),lb=C*Math.sin(hr); var l_=L+0.3963377774*la+0.2158037573*lb, m_=L-0.1055613458*la-0.0638531729*lb, s_=L-0.0894841775*la-1.291485548*lb; var l=l_*l_*l_,m=m_*m_*m_,s=s_*s_*s_; var r=4.0767416621*l-3.3077115913*m+0.2309699292*s, g=-1.2684380046*l+2.6097574011*m-0.3413193965*s, b=-0.0041960863*l-0.7034186147*m+1.707614701*s; var enc=function(v){v=Math.max(0,Math.min(1,v));return v<=0.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-0.055;}; return [Math.round(enc(r)*255),Math.round(enc(g)*255),Math.round(enc(b)*255),a];} var rgb=c.match(/rgba?\\(([^)]+)\\)/i); if(rgb){var p=nums(rgb[1]); return p.length===3?[p[0],p[1],p[2],1]:[p[0],p[1],p[2],p[3]];} var hs=c.match(/hsla?\\(([^)]+)\\)/i); if(hs){var p=nums(hs[1]); var H=p[0],S=p[1]/100,L=p[2]/100,a=p.length>3?p[3]:1; var f=function(n){var k=(n+H/30)%12;return L-S*Math.min(L,1-L)*Math.max(-1,Math.min(k-3,9-k,1));}; return [Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255),a];} if(c[0]==='#'){var x=c.slice(1); if(x.length===3)x=x.split('').map(function(z){return z+z;}).join(''); if(x.length===4)x=x[0]+x[0]+x[1]+x[1]+x[2]+x[2]+x[3]+x[3]; if(x.length===3||x.length===6)x=x+'ff'; return [parseInt(x.slice(0,2),16),parseInt(x.slice(2,4),16),parseInt(x.slice(4,6),16),parseInt(x.slice(6,8),16)/255];} var cv=document.createElement('canvas'); var ctx=cv.getContext('2d'); ctx.fillStyle='#abcdef'; ctx.fillStyle=c; var norm=ctx.fillStyle; if(norm==='#abcdef')return null; var m=norm.match(/rgba?\\(([^)]+)\\)/i); if(m){var p=nums(m[1]); return p.length===3?[p[0],p[1],p[2],1]:[p[0],p[1],p[2],p[3]];} var x=norm.slice(1); return [parseInt(x.slice(0,2),16),parseInt(x.slice(2,4),16),parseInt(x.slice(4,6),16),1]; }
  function comp(f,b){ const a=f[3]+b[3]*(1-f[3]); if(a===0)return [0,0,0,0]; return [(f[0]*f[3]+b[0]*b[3]*(1-f[3]))/a,(f[1]*f[3]+b[1]*b[3]*(1-f[3]))/a,(f[2]*f[3]+b[2]*b[3]*(1-f[3]))/a,a]; }
  function bgOf(el){ let cur=el,bg=[0,0,0,0]; while(cur&&cur.nodeType===1){ const c=parse(getComputedStyle(cur).backgroundColor); if(c){bg=comp(bg,c); if(bg[3]>=0.999)break;} cur=cur.parentElement; } if(bg[3]<0.999){const bb=parse(getComputedStyle(document.body).backgroundColor); if(bb&&bb[3]>0)bg=comp(bg,bb);} return bg; }
  function pair(name,el){ if(!el)return {name,blocked:'no element'}; const fg=parse(getComputedStyle(el).color); const bg=bgOf(el); if(!fg)return {name,blocked:'no fg'}; if(bg[3]<0.999)return {name,blocked:'unresolved bg'}; return {name,fg:[fg[0],fg[1],fg[2],fg[3]],bg:[bg[0],bg[1],bg[2],bg[3]]}; }
  return JSON.stringify([pair('body-text',document.body),pair('nav-link',document.querySelector('nav[aria-label="Primary"] a')),pair('main-link',document.querySelector('main a')),pair('skip-link',document.querySelector('.skip-link'))]);
})()`;

const ACTIVE_EL = `JSON.stringify({tag:document.activeElement&&document.activeElement.tagName,id:document.activeElement&&document.activeElement.id,cls:document.activeElement&&document.activeElement.className,href:document.activeElement&&document.activeElement.getAttribute&&document.activeElement.getAttribute('href'),text:(document.activeElement&&document.activeElement.textContent||'').trim().slice(0,40),outlineW:document.activeElement?getComputedStyle(document.activeElement).outlineWidth:null,outlineC:document.activeElement?getComputedStyle(document.activeElement).outlineColor:null,outlineS:document.activeElement?getComputedStyle(document.activeElement).outlineStyle:null})`;
const NAV_STATE = `JSON.stringify({open:document.querySelector('.site-header')&&document.querySelector('.site-header').getAttribute('data-open'),expanded:document.querySelector('.nav-toggle')&&document.querySelector('.nav-toggle').getAttribute('aria-expanded'),ready:document.querySelector('.site-header')&&document.querySelector('.site-header').getAttribute('data-nav-ready'),navDisplay:getComputedStyle(document.querySelector('nav[aria-label="Primary"]')).display,toggleDisplay:getComputedStyle(document.querySelector('.nav-toggle')).display})`;

async function runScenario(browser, sc, origin) {
  const { send, on, waitFor } = browser;
  const url = sc.route === "/404.html" ? origin + "/404.html" : origin + sc.route;
  const ct = await send("Target.createTarget", { url: "about:blank" });
  const targetId = ct.result.targetId;
  const at = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = at.result.sessionId;
  const cap = {
    route: sc.route,
    routeSlug: routeSlug(sc.route),
    url,
    viewport: { width: sc.w, height: sc.h, deviceScaleFactor: sc.dsf },
    mode: sc.mode,
    status: "pass",
    assertions: [],
    console: [],
    network: [],
    contrast: [],
    warnings: [],
    screenshot: null,
  };
  const consoleEv = [],
    netEv = [];
  on(S, "Runtime.consoleAPICalled", (p) => {
    if (p.type === "error")
      consoleEv.push(
        (p.args || []).map((a) => a.value || a.description || a.unserializableValue).join(" "),
      );
  });
  on(S, "Runtime.exceptionThrown", (p) => {
    consoleEv.push(
      "exception: " +
        (p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || ""),
    );
  });
  on(S, "Log.entryAdded", (p) => {
    if (p.entry?.level === "error") consoleEv.push("log: " + p.entry.text);
  });
  on(S, "Network.responseReceived", (p) => {
    netEv.push({
      url: p.response.url,
      status: p.response.status,
      type: p.type,
      requestId: p.requestId,
    });
  });
  on(S, "Network.loadingFailed", (p) => {
    netEv.push({ url: p.requestId, failed: true, error: p.errorText, type: p.type });
  });
  on(S, "Network.requestWillBeSent", (p) => {
    netEv.push({ url: p.request.url, will: true, requestId: p.requestId });
  });
  try {
    await send("Page.enable", {}, S);
    await send("Runtime.enable", {}, S);
    await send("Network.enable", {}, S);
    await send("Log.enable", {}, S);
    await send("Page.setLifecycleEventsEnabled", { enabled: true }, S);
    await send(
      "Emulation.setDeviceMetricsOverride",
      { width: sc.w, height: sc.h, deviceScaleFactor: sc.dsf, mobile: false },
      S,
    );
    if (sc.mode === "reduced-motion")
      await send(
        "Emulation.setEmulatedMedia",
        { media: "", features: [{ name: "prefers-reduced-motion", value: "reduce" }] },
        S,
      );
    if (sc.mode === "no-js") await send("Emulation.setScriptExecutionDisabled", { value: true }, S);
    const loadP = waitFor(S, "Page.loadEventFired", 20000);
    await send("Page.navigate", { url }, S);
    await loadP;
    await new Promise((r) => setTimeout(r, 400));
    const evalJs = (expr) =>
      send(
        "Runtime.evaluate",
        { expression: expr, returnByValue: true, awaitPromise: true },
        S,
      ).then((r) => {
        if (r.error || r.result?.exceptionDetails)
          throw new Error("eval failed: " + JSON.stringify(r).slice(0, 300));
        return r.result?.result?.value;
      });
    if (sc.mode === "reduced-motion") {
      const mq = await evalJs("window.matchMedia('(prefers-reduced-motion: reduce)').matches");
      cap.assertions.push({
        id: "reduced-motion-mq",
        expected: true,
        actual: mq,
        status: mq === true ? "pass" : "fail",
      });
    }
    if (sc.mode === "no-js") {
      const ready = await evalJs(
        "document.querySelector('.site-header')?document.querySelector('.site-header').getAttribute('data-nav-ready'):null",
      );
      cap.assertions.push({
        id: "no-js-not-ready",
        expected: null,
        actual: ready,
        status: ready === null ? "pass" : "fail",
      });
    }
    const dom = JSON.parse(await evalJs(DOM_ASSERT));
    const exp = EXPECTED[sc.route];
    const check = (id, expected, actual) => {
      const ok = JSON.stringify(expected) === JSON.stringify(actual);
      cap.assertions.push({ id, expected, actual, status: ok ? "pass" : "fail" });
    };
    check("lang", "en", dom.lang);
    check("mainCount", 1, dom.mainCount);
    check("mainId", "main", dom.mainId);
    check("skipHref", "#main", dom.skipHref);
    check("canonicalCount", 1, dom.canonicalCount);
    check("canonical", exp.canonical, dom.canonicalHref);
    check("robots", exp.robots, dom.robots);
    check("h1Count", 1, dom.h1Count);
    check("h1", exp.h1, dom.h1Text);
    check("navCurrent", exp.navCurrent, dom.navCurrent);
    check("brandCurrent", exp.brandCurrent, dom.brandCurrent);
    check("headerCurrent", exp.headerCurrent, dom.headerCurrent);
    const overflowOk = dom.scrollWidth <= dom.clientWidth + 1;
    cap.assertions.push({
      id: "no-horizontal-overflow",
      expected: "<=clientWidth+1",
      actual: dom.scrollWidth + " vs " + dom.clientWidth,
      status: overflowOk ? "pass" : "fail",
    });
    if (exp.sched) {
      check("schedHref", SCHED_HREF, dom.schedHref);
      check("schedText", SCHED_TEXT, dom.schedText);
      check("schedRel", SCHED_REL, dom.schedRel);
      check("mailHref", MAIL_HREF, dom.mailHref);
      check("mailText", MAIL_TEXT, dom.mailText);
    }
    check("no-form", false, dom.form);
    check("no-iframe", false, dom.iframe);
    check("no-privacy-link", false, dom.privacy);
    if (exp.recovery) {
      check("recoveryHref", exp.recovery.href, dom.recoveryHref);
      check("recoveryText", exp.recovery.text, dom.recoveryText);
    }
    const requests = netEv.filter((n) => n.will).map((n) => n.url);
    const external = requests.filter((u) => classifyRequest(u, origin) === "external");
    cap.network = netEv.map((n) => ({
      url: n.url,
      status: n.status,
      type: n.type,
      failed: !!n.failed,
      error: n.error,
    }));
    cap.assertions.push({
      id: "no-external-requests",
      expected: 0,
      actual: external.length,
      status: external.length === 0 ? "pass" : "fail",
    });
    if (external.length) cap.warnings.push("external requests: " + external.join(", "));
    cap.console = consoleEv;
    cap.assertions.push({
      id: "no-console-errors",
      expected: 0,
      actual: consoleEv.length,
      status: consoleEv.length === 0 ? "pass" : "fail",
    });
    const responses = netEv.filter((n) => n.status !== undefined);
    const failedLoads = netEv.filter((n) => n.failed);
    const badStatus = responses.filter(
      (r) => r.status >= 400 && !isExpected404(sc.route, r.status, r.type),
    );
    cap.assertions.push({
      id: "no-network-failures",
      expected: 0,
      actual: failedLoads.length + badStatus.length,
      status: failedLoads.length + badStatus.length === 0 ? "pass" : "fail",
    });
    if (sc.mode === "normal" && sc.w === 1440) {
      const pairs = JSON.parse(await evalJs(CONTRAST_ASSERT));
      const REQUIRED_CONTRAST = ["body-text", "nav-link", "skip-link"];
      cap.contrast = pairs.map((p) => {
        if (p.blocked) return { pair: p.name, status: "blocked", reason: p.blocked };
        const ratio = contrastRatio(
          [p.fg[0], p.fg[1], p.fg[2], p.fg[3] ?? 1],
          [p.bg[0], p.bg[1], p.bg[2], p.bg[3] ?? 1],
        );
        if (ratio === null) return { pair: p.name, status: "blocked", reason: "unresolved" };
        return {
          pair: p.name,
          fg: p.fg,
          bg: p.bg,
          ratio: Math.round(ratio * 100) / 100,
          status: ratio >= 4.5 ? "pass" : "fail",
        };
      });
      for (const c of cap.contrast) {
        if (c.status === "fail")
          cap.assertions.push({
            id: "contrast-" + c.pair,
            expected: ">=4.5",
            actual: c.ratio,
            status: "fail",
          });
        else if (c.status === "blocked" && REQUIRED_CONTRAST.includes(c.pair))
          cap.assertions.push({
            id: "contrast-" + c.pair,
            expected: "resolved >=4.5",
            actual: "blocked: " + c.reason,
            status: "blocked",
          });
      }
    }
    const shot = await send(
      "Page.captureScreenshot",
      { format: "png", captureBeyondViewport: true },
      S,
    );
    const file = cap.routeSlug + "__" + sc.w + "x" + sc.h + "__" + sc.mode + ".png";
    await writeFile(assertEvidencePath(join(SHOTS, file)), Buffer.from(shot.result.data, "base64"));
    cap.screenshot = "screenshots/" + file;
    if (cap.assertions.some((a) => a.status === "fail")) cap.status = "fail";
    else if (cap.assertions.some((a) => a.status === "blocked")) cap.status = "blocked";
  } catch (e) {
    cap.status = "fail";
    cap.warnings.push("scenario error: " + e.message);
  } finally {
    try {
      await send("Target.closeTarget", { targetId });
    } catch {}
  }
  return cap;
}
// __PART_C__
async function runKeyboard(browser, route, origin) {
  const { send, on, waitFor } = browser;
  const url = route === "/404.html" ? origin + "/404.html" : origin + route;
  const ct = await send("Target.createTarget", { url: "about:blank" });
  const targetId = ct.result.targetId;
  const at = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = at.result.sessionId;
  const cap = {
    route,
    routeSlug: routeSlug(route),
    url,
    viewport: { width: 360, height: 800, deviceScaleFactor: 1 },
    mode: "keyboard",
    status: "pass",
    focusTrace: [],
    assertions: [],
    console: [],
    network: [],
    contrast: [],
    warnings: [],
    screenshot: null,
  };
  const consoleEv = [];
  const netEv = [];
  on(S, "Runtime.exceptionThrown", (p) =>
    consoleEv.push(
      "exception: " + (p.exceptionDetails?.exception?.description || p.exceptionDetails?.text),
    ),
  );
  on(S, "Runtime.consoleAPICalled", (p) => {
    if (p.type === "error")
      consoleEv.push(
        (p.args || []).map((a) => a.value || a.description || a.unserializableValue).join(" "),
      );
  });
  on(S, "Log.entryAdded", (p) => {
    if (p.entry?.level === "error") consoleEv.push("log: " + p.entry.text);
  });
  on(S, "Network.requestWillBeSent", (p) => {
    netEv.push({ url: p.request.url, will: true });
  });
  on(S, "Network.responseReceived", (p) => {
    netEv.push({
      url: p.response.url,
      status: p.response.status,
      type: p.type,
      requestId: p.requestId,
    });
  });
  on(S, "Network.loadingFailed", (p) => {
    netEv.push({ requestId: p.requestId, failed: true, error: p.errorText });
  });
  try {
    await send("Page.enable", {}, S);
    await send("Runtime.enable", {}, S);
    await send("Network.enable", {}, S);
    await send("Log.enable", {}, S);
    await send("Input.enable", {}, S);
    await send(
      "Emulation.setDeviceMetricsOverride",
      { width: 360, height: 800, deviceScaleFactor: 1, mobile: false },
      S,
    );
    const loadP = waitFor(S, "Page.loadEventFired", 20000);
    await send("Page.navigate", { url }, S);
    await loadP;
    const evalJs = (expr) =>
      send("Runtime.evaluate", { expression: expr, returnByValue: true }, S).then(
        (r) => r.result?.result?.value,
      );
    const snap = async () => JSON.parse(await evalJs(ACTIVE_EL));
    const state = async () => JSON.parse(await evalJs(NAV_STATE));
    const key = (k, code, vk, mods) =>
      send(
        "Input.dispatchKeyEvent",
        { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods || 0 },
        S,
      ).then(() =>
        send(
          "Input.dispatchKeyEvent",
          { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers: mods || 0 },
          S,
        ),
      );
    const tab = () => key("Tab", "Tab", 9);
    const shiftTab = () => key("Tab", "Tab", 9, 8);
    const enter = () => key("Enter", "Enter", 13);
    const space = () => key(" ", "Space", 32);
    const esc = () => key("Escape", "Escape", 27);
    const waitReady = async () => {
      for (let i = 0; i < 30; i++) {
        const r = await evalJs(
          "document.querySelector('.site-header')?document.querySelector('.site-header').getAttribute('data-nav-ready'):null",
        );
        if (r === "true") break;
        await new Promise((x) => setTimeout(x, 100));
      }
    };

    // 1. first Tab -> skip link
    await tab();
    const t1 = await snap();
    cap.focusTrace.push({ step: "tab1", el: t1 });
    cap.assertions.push({
      id: "first-tab-skip",
      expected: "skip-link",
      actual: t1.cls,
      status: t1.cls === "skip-link" ? "pass" : "fail",
    });
    const shot0 = await send("Page.captureScreenshot", { format: "png" }, S);
    await writeFile(
      assertEvidencePath(join(SHOTS, cap.routeSlug + "__keyboard.png")),
      Buffer.from(shot0.result.data, "base64"),
    );
    cap.screenshot = "screenshots/" + cap.routeSlug + "__keyboard.png";

    // 2. skip-link activation — only dispatch Enter if first focus is the skip link
    //    (safety: never activate an external link if a regression reorders focus).
    const skipIsFocused = t1.cls === "skip-link" && t1.href === "#main";
    if (skipIsFocused) {
      await enter();
    } else {
      cap.warnings.push("skip-activation skipped: first focus not skip-link (safety gate)");
    }
    const afterSkip = await snap();
    await tab();
    const afterSkipNext = await snap();
    const inHeader = await evalJs(
      "!!(document.activeElement && document.activeElement.closest && document.activeElement.closest('header'))",
    );
    const bypassOk = skipIsFocused && !inHeader;
    cap.focusTrace.push({
      step: "skip-activate",
      afterEnter: afterSkip,
      nextTab: afterSkipNext,
      inHeader,
    });
    cap.assertions.push({
      id: "skip-bypass",
      expected: "next-tab-past-header",
      actual:
        (afterSkipNext.href || afterSkipNext.cls || afterSkipNext.tag) +
        (inHeader ? " [in header]" : " [past header]"),
      status: bypassOk ? "pass" : "fail",
      note: skipIsFocused
        ? "focus falls to BODY (#main lacks tabindex=-1); bypass achieved via focus starting point past header"
        : "skip activation aborted — first focus was not the skip link (safety gate)",
    });

    // 3. fresh navigate; closed-state tab order: skip -> brand -> toggle
    await send("Page.navigate", { url }, S);
    await waitFor(S, "Page.loadEventFired", 20000);
    await waitReady();
    await tab();
    const a1 = await snap();
    await tab();
    const a2 = await snap();
    await tab();
    const a3 = await snap();
    cap.focusTrace.push({ step: "closed-order", tab1: a1, tab2: a2, tab3: a3 });
    cap.assertions.push({
      id: "tab-brand",
      expected: "brand",
      actual: a2.cls,
      status: a2.cls === "brand" ? "pass" : "fail",
    });
    cap.assertions.push({
      id: "tab-toggle",
      expected: "nav-toggle",
      actual: a3.cls,
      status: a3.cls === "nav-toggle" ? "pass" : "fail",
    });
    const st0 = await state();
    cap.assertions.push({
      id: "nav-closed-initial",
      expected: { open: "false", expanded: "false" },
      actual: { open: st0.open, expanded: st0.expanded },
      status: st0.open === "false" && st0.expanded === "false" ? "pass" : "fail",
    });

    // 4. open toggle (Space) — only if the toggle is focused (safety: Space also
    //    activates links, so never dispatch it on a non-toggle element).
    if (a3.cls === "nav-toggle") {
      await space();
    } else {
      cap.warnings.push("toggle-open skipped: third focus not nav-toggle (safety gate)");
    }
    const st1 = await state();
    cap.assertions.push({
      id: "toggle-open",
      expected: { open: "true", expanded: "true" },
      actual: { open: st1.open, expanded: st1.expanded },
      status: st1.open === "true" && st1.expanded === "true" ? "pass" : "fail",
    });
    await tab();
    const a5 = await snap();
    cap.assertions.push({
      id: "nav-link-tabbable",
      expected: "A in primary nav",
      actual: a5.tag,
      status: a5.tag === "A" ? "pass" : "fail",
    });

    // 5. Escape closes + focus returns to toggle
    await esc();
    const st2 = await state();
    const a6 = await snap();
    cap.assertions.push({
      id: "escape-close",
      expected: { open: "false", expanded: "false" },
      actual: { open: st2.open, expanded: st2.expanded },
      status: st2.open === "false" && st2.expanded === "false" ? "pass" : "fail",
    });
    cap.assertions.push({
      id: "escape-focus-toggle",
      expected: "nav-toggle",
      actual: a6.cls,
      status: a6.cls === "nav-toggle" ? "pass" : "fail",
    });

    // 6. Shift+Tab reverses (no trap)
    await shiftTab();
    const a7 = await snap();
    cap.assertions.push({
      id: "shift-tab-reverse",
      expected: "brand-or-skip",
      actual: a7.cls || a7.tag,
      status: a7.cls === "brand" || a7.cls === "skip-link" ? "pass" : "fail",
    });

    const externalReqs = netEv.filter(
      (n) => n.will && classifyRequest(n.url, origin) === "external",
    );
    cap.network = netEv.map((n) => ({
      url: n.url,
      status: n.status,
      type: n.type,
      failed: !!n.failed,
      error: n.error,
    }));
    cap.console = consoleEv;
    cap.assertions.push({
      id: "no-external-requests",
      expected: 0,
      actual: externalReqs.length,
      status: externalReqs.length === 0 ? "pass" : "fail",
    });
    if (externalReqs.length)
      cap.warnings.push(
        "external requests during keyboard: " + externalReqs.map((n) => n.url).join(", "),
      );
    cap.assertions.push({
      id: "no-console-errors",
      expected: 0,
      actual: consoleEv.length,
      status: consoleEv.length === 0 ? "pass" : "fail",
    });
    const failedLoads = netEv.filter((n) => n.failed);
    const responses = netEv.filter((n) => n.status !== undefined);
    const badStatus = responses.filter(
      (r) => r.status >= 400 && !isExpected404(route, r.status, r.type),
    );
    cap.assertions.push({
      id: "no-network-failures",
      expected: 0,
      actual: failedLoads.length + badStatus.length,
      status: failedLoads.length + badStatus.length === 0 ? "pass" : "fail",
    });
    if (failedLoads.length + badStatus.length)
      cap.warnings.push(
        "network failures during keyboard: " +
          [...failedLoads, ...badStatus].map((n) => n.url || n.requestId).join(", "),
      );
    if (cap.assertions.some((a) => a.status === "fail")) cap.status = "fail";
    else if (cap.assertions.some((a) => a.status === "blocked")) cap.status = "blocked";
  } catch (e) {
    cap.status = "fail";
    cap.warnings.push("keyboard error: " + e.message);
  } finally {
    try {
      await send("Target.closeTarget", { targetId });
    } catch {}
  }
  return cap;
}

function parseArgs(argv) {
  const a = {
    selfTest: false,
    strict: false,
    routes: null,
    viewports: null,
    modes: null,
    expectedCommit: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === "--self-test") a.selfTest = true;
    else if (x === "--strict") a.strict = true;
    else if (x === "--routes") a.routes = argv[++i].split(" ");
    else if (x === "--viewports") a.viewports = argv[++i].split(" ");
    else if (x === "--modes") a.modes = argv[++i].split(" ");
    else if (x === "--expected-commit") a.expectedCommit = argv[++i];
  }
  return a;
}

function filterMatrix(mx, args) {
  let out = mx;
  if (args.routes) out = out.filter((s) => args.routes.includes(s.route));
  if (args.modes) out = out.filter((s) => args.modes.includes(s.mode));
  if (args.viewports) out = out.filter((s) => args.viewports.includes(s.w + "x" + s.h));
  return out;
}

async function writeSummary(caps, manifest, path) {
  const lines = [];
  lines.push("# Accessibility Evidence Summary", "");
  lines.push("- Audited commit: " + manifest.auditedCommit);
  lines.push("- Generated: " + manifest.generatedAt);
  lines.push("- Browser: " + manifest.browser.path + " (" + manifest.browser.version + ")");
  lines.push("- Node: " + manifest.node);
  lines.push("- Site origin: " + manifest.siteOrigin);
  lines.push(
    "- Scenarios: " +
      manifest.summary.total +
      " total, " +
      manifest.summary.passed +
      " passed, " +
      manifest.summary.failed +
      " failed, " +
      manifest.summary.blocked +
      " blocked, " +
      manifest.summary.screenshots +
      " screenshots",
  );
  lines.push("");
  lines.push("| route | viewport | mode | status | screenshot |");
  lines.push("|---|---|---|---|---|");
  for (const c of caps) {
    lines.push(
      "| " +
        c.route +
        " | " +
        c.viewport.width +
        "x" +
        c.viewport.height +
        " | " +
        c.mode +
        " | " +
        c.status +
        " | " +
        (c.screenshot || "-") +
        " |",
    );
  }
  lines.push("");
  lines.push("## Failed assertions");
  const fails = caps.filter((c) => c.status === "fail");
  if (fails.length === 0) lines.push("- none");
  for (const c of fails) {
    const fa = c.assertions.filter((a) => a.status === "fail");
    lines.push(
      "- **" + c.route + " @ " + c.viewport.width + "x" + c.viewport.height + " " + c.mode + "**",
    );
    for (const a of fa)
      lines.push(
        "  - " +
          a.id +
          ": expected " +
          JSON.stringify(a.expected) +
          ", got " +
          JSON.stringify(a.actual),
      );
    if (c.warnings.length) for (const w of c.warnings) lines.push("  - warn: " + w);
  }
  lines.push("");
  lines.push("## Contrast (1440x900 normal, per route)");
  for (const c of caps.filter((x) => x.contrast && x.contrast.length)) {
    lines.push("- " + c.route + ":");
    for (const ct of c.contrast)
      lines.push(
        "  - " +
          ct.pair +
          ": " +
          (ct.status === "pass"
            ? "ratio " + ct.ratio + " PASS"
            : ct.status === "blocked"
              ? "BLOCKED (" + (ct.reason || "") + ")"
              : "ratio " + ct.ratio + " FAIL"),
      );
  }
  lines.push("");
  lines.push("## Keyboard (360x800 normal, per route)");
  for (const c of caps.filter((x) => x.mode === "keyboard")) {
    lines.push("- " + c.route + ": " + c.status);
    for (const a of c.assertions)
      lines.push("  - " + a.id + ": " + a.status + (a.note ? " — " + a.note : ""));
  }
  await writeFile(path, lines.join("\n") + "\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfTest) {
    await selfTest();
    return;
  }

  const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: ROOT }).stdout.toString().trim();
  if (args.expectedCommit && head !== args.expectedCommit) {
    console.error("audited commit mismatch: HEAD=" + head + " expected=" + args.expectedCommit);
    process.exit(1);
  }

  await mkdir(SHOTS_ABS, { recursive: true });
  for (const f of await readdir(SHOTS_ABS).catch(() => [])) {
    if (f.endsWith(".png")) {
      try {
        await rm(assertEvidencePath(join(SHOTS, f)), { force: true });
      } catch {}
    }
  }

  // build the site (gitignored dist/)
  const build = spawnSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });
  if (build.status !== 0) {
    console.error("build failed");
    process.exit(1);
  }

  const port = await freePort();
  const preview = await startPreview(port);
  let browser = null;
  const caps = [];
  try {
    browser = await launchBrowser();
    const full = buildMatrix();
    let mx = args.strict ? full : filterMatrix(full, args);
    if (args.strict && mx.length !== MATRIX_SCENARIOS) {
      throw new Error(`--strict requires all ${MATRIX_SCENARIOS} scenarios, got ${mx.length}`);
    }
    for (const sc of mx) {
      process.stderr.write(
        "capture " + sc.route + " " + sc.w + "x" + sc.h + " " + sc.mode + " ... ",
      );
      const c = await runScenario(browser, sc, preview.origin);
      caps.push(c);
      process.stderr.write(c.status + "\n");
    }
    for (const r of ROUTES) {
      if (args.routes && !args.routes.includes(r)) continue;
      process.stderr.write("keyboard " + r + " ... ");
      const c = await runKeyboard(browser, r, preview.origin);
      caps.push(c);
      process.stderr.write(c.status + "\n");
    }
  } finally {
    if (browser) await browser.cleanup().catch(() => {});
    try {
      process.kill(-preview.proc.pid, "SIGKILL");
    } catch {
      try {
        preview.proc.kill("SIGKILL");
      } catch {}
    }
  }

  const failed = caps.filter((c) => c.status === "fail").length;
  const blocked = caps.filter((c) => c.status === "blocked").length;
  const shotCount = caps.filter((c) => c.screenshot).length;
  const manifest = {
    schema: "a11y-capture/v1",
    auditedCommit: head,
    generatedAt: new Date().toISOString(),
    browser: { path: browser.bin, version: browser.version },
    node: process.version,
    siteOrigin: preview.origin,
    summary: {
      total: caps.length,
      passed: caps.length - failed - blocked,
      failed,
      blocked,
      screenshots: shotCount,
    },
    captures: caps,
  };
  await writeFile(
    assertEvidencePath(join(OUT, "manifest.json")),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  await writeSummary(caps, manifest, assertEvidencePath(join(OUT, "summary.md")));

  console.log(
    "a11y evidence: " +
      caps.length +
      " captures, " +
      shotCount +
      " screenshots, " +
      failed +
      " failed",
  );
  if (args.strict) {
    if (
      caps.length !== STRICT_CAPTURES ||
      failed !== 0 ||
      blocked !== 0 ||
      shotCount < STRICT_CAPTURES
    ) {
      console.error(
        `STRICT FAIL: expected ${STRICT_CAPTURES} captures (${MATRIX_SCENARIOS} matrix + ${ROUTES.length} keyboard), 0 failures, 0 blocked, >=${STRICT_CAPTURES} screenshots; got ` +
          caps.length +
          " captures, " +
          failed +
          " failures, " +
          blocked +
          " blocked, " +
          shotCount +
          " screenshots",
      );
      process.exit(1);
    }
  } else if (failed !== 0 || blocked !== 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

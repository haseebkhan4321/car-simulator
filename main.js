/* ------------------------------------------------------------------ *
 *  Main process. It owns the window and the network policy; all the
 *  driving logic still lives in the renderer, untouched.
 *
 *  The renderer runs with node integration off, context isolation on
 *  and a sandbox, so it is an ordinary web page with no access to the
 *  machine. Everything it needs from the outside world arrives over
 *  https from four keyless services, listed in ALLOWED_HOSTS.
 * ------------------------------------------------------------------ */

const { app, BrowserWindow, Menu, ipcMain, session, shell } = require("electron");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const IS_MAC = process.platform === "darwin";
const IS_DEV = !app.isPackaged;

/* Nominatim and OSRM ask that clients identify themselves. */
const USER_AGENT = `NoraInLahore/${app.getVersion()} (+electron desktop build)`;

const ALLOWED_HOSTS = new Set([
  "tiles.openfreemap.org",
  "nominatim.openstreetmap.org",
  "router.project-osrm.org",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
]);

/* --------------------------- the action log --------------------------- */

/* The renderer is sandboxed and has no filesystem, so it hands lines
   over and this end writes them. One file, appended to, rotated once it
   gets big so it cannot grow without limit. */

const logFile = path.join(app.getPath("userData"), "actions.log");
const LOG_MAX = 2 * 1024 * 1024;

function writeLog(line){
  fs.appendFile(logFile, line + "\n", () => {});
}

function rotateLog(){
  try{
    if(fs.statSync(logFile).size > LOG_MAX){
      fs.renameSync(logFile, logFile + ".1");
    }
  }catch{ /* no file yet, which is the normal first run */ }
}

function wireLog(){
  rotateLog();
  writeLog(new Date().toISOString() + "  app  started " + app.getVersion());

  ipcMain.on("log:append", (_e, line) => {
    if(typeof line === "string" && line) writeLog(line.slice(0, 2000));
  });

  /* The viewer only ever shows the tail; the file keeps everything. */
  ipcMain.handle("log:read", async () => {
    try{
      const text = await fs.promises.readFile(logFile, "utf8");
      const lines = text.trimEnd().split("\n");
      return { path: logFile, text: lines.slice(-400).join("\n"), lines: lines.length };
    }catch{
      return { path: logFile, text: "", lines: 0 };
    }
  });
}

/* --------------------------- admin password --------------------------- */

/* Set once, on the first run after installing, and asked for again
   before the settings will open. The password itself is never stored:
   what goes in the file is a PBKDF2 hash and the random salt it was
   derived with, so the file tells an onlooker nothing useful. This
   guards the app's own settings; it has no bearing on the machine. */

const adminFile = path.join(app.getPath("userData"), "admin.json");
const KDF = { iterations: 120000, keylen: 32, digest: "sha256" };
const MIN_PASSWORD = 6;

function readAdmin(){
  try{
    const saved = JSON.parse(fs.readFileSync(adminFile, "utf8"));
    if(saved && typeof saved.salt === "string" && typeof saved.hash === "string"){
      return saved;
    }
  }catch{ /* missing or damaged counts as never set */ }
  return null;
}

function hashPassword(password, salt){
  return crypto
    .pbkdf2Sync(password, salt, KDF.iterations, KDF.keylen, KDF.digest)
    .toString("hex");
}

function wireAdmin(){
  ipcMain.handle("admin:status", () => ({
    set: !!readAdmin(),
    minLength: MIN_PASSWORD,
  }));

  ipcMain.handle("admin:set", (_e, password) => {
    if(typeof password !== "string" || password.length < MIN_PASSWORD){
      return { ok: false, why: "short" };
    }
    if(readAdmin()) return { ok: false, why: "already set" };
    try{
      const salt = crypto.randomBytes(16).toString("hex");
      fs.writeFileSync(adminFile, JSON.stringify({
        salt, hash: hashPassword(password, salt), iterations: KDF.iterations,
      }));
    }catch(err){
      return { ok: false, why: "could not save" };
    }
    writeLog(new Date().toISOString() + "  admin  password set");
    return { ok: true };
  });

  ipcMain.handle("admin:check", (_e, password) => {
    const saved = readAdmin();
    if(!saved || typeof password !== "string") return { ok: false };

    /* Compared over the full length either way, so a wrong password
       cannot be narrowed down by how long the check took. */
    const given = Buffer.from(hashPassword(password, saved.salt), "hex");
    const want  = Buffer.from(saved.hash, "hex");
    const ok = given.length === want.length && crypto.timingSafeEqual(given, want);

    writeLog(new Date().toISOString()
             + "  admin  " + (ok ? "unlocked settings" : "wrong password"));
    return { ok };
  });
}

/* ---------------------- window size, remembered ---------------------- */

const stateFile = path.join(app.getPath("userData"), "window-state.json");

function readState(){
  try{
    const s = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    if(Number.isFinite(s.width) && Number.isFinite(s.height)) return s;
  }catch{ /* first run, or the file was hand-edited into nonsense */ }
  return { width: 1360, height: 900 };
}

function saveState(win){
  if(win.isDestroyed()) return;
  const b = win.getNormalBounds();
  try{
    fs.writeFileSync(stateFile, JSON.stringify({
      x: b.x, y: b.y, width: b.width, height: b.height,
      maximized: win.isMaximized(),
    }));
  }catch{ /* not worth bothering anyone about */ }
}

/* ---------------------------- the window ---------------------------- */

function createWindow(){
  const state = readState();

  const win = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 900,
    minHeight: 640,
    show: false,
    backgroundColor: "#0E1217",
    title: "Nora in Lahore",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      backgroundThrottling: false,   // keep the drive smooth when unfocused
    },
  });

  if(state.maximized) win.maximize();

  win.once("ready-to-show", () => win.show());

  let saveTimer = null;
  const queueSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveState(win), 400);
  };
  win.on("resize", queueSave);
  win.on("move", queueSave);
  win.on("close", () => { clearTimeout(saveTimer); saveState(win); });

  /* Links to anywhere else open in the real browser, never in here. */
  win.webContents.setWindowOpenHandler(({ url }) => {
    if(/^https?:$/.test(new URL(url).protocol)) shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (e, url) => {
    if(!url.startsWith("file://")){
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));

  return win;
}

/* --------------------------- session policy --------------------------- */

function hardenSession(){
  const s = session.defaultSession;

  /* No camera, no microphone, no location. The app never asks. */
  s.setPermissionRequestHandler((_wc, _perm, done) => done(false));
  s.setPermissionCheckHandler(() => false);

  s.webRequest.onBeforeSendHeaders((details, done) => {
    const headers = { ...details.requestHeaders };
    try{
      if(ALLOWED_HOSTS.has(new URL(details.url).hostname)){
        headers["User-Agent"] = USER_AGENT;
      }
    }catch{ /* not a URL we can read; leave the headers alone */ }
    done({ requestHeaders: headers });
  });

  /* Belt to the renderer's braces: only the four services get out. */
  s.webRequest.onBeforeRequest((details, done) => {
    const url = details.url;
    if(/^(file|devtools|blob|data):/.test(url)) return done({});
    try{
      const { protocol, hostname } = new URL(url);
      const ok = protocol === "https:" && ALLOWED_HOSTS.has(hostname);
      if(!ok && IS_DEV) console.warn("blocked request:", url);
      return done({ cancel: !ok });
    }catch{
      return done({ cancel: true });
    }
  });
}

/* ------------------------------- menu ------------------------------- */

function buildMenu(){
  /* The car is driven with the arrow keys, so nothing here binds them. */
  const template = [
    ...(IS_MAC ? [{ role: "appMenu" }] : []),
    {
      label: "File",
      submenu: [IS_MAC ? { role: "close" } : { role: "quit" }],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        { role: "toggleDevTools" },
      ],
    },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        {
          label: "Map data © OpenStreetMap contributors",
          click: () => shell.openExternal("https://www.openstreetmap.org/copyright"),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ------------------------------ lifecycle ------------------------------ */

if(!app.requestSingleInstanceLock()){
  app.quit();
}else{
  app.on("second-instance", () => {
    const [win] = BrowserWindow.getAllWindows();
    if(win){
      if(win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    hardenSession();
    wireLog();
    wireAdmin();
    buildMenu();
    createWindow();

    app.on("activate", () => {
      if(BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if(!IS_MAC) app.quit();
  });

  app.on("before-quit", () => {
    writeLog(new Date().toISOString() + "  app  quit");
  });

  /* Nothing in the renderer should ever ask for a node module or a
     webview; if a page tries, stop it. */
  app.on("web-contents-created", (_e, contents) => {
    contents.on("will-attach-webview", e => e.preventDefault());
  });
}

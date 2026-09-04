/* The only bridge between the page and Electron: which build this is,
   and the two calls the action log needs. Nothing else crosses. */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },

  /* The action log. The page can add a line and read the tail back; it
     cannot reach the file itself, or anything else on disk. */
  log: line => ipcRenderer.send("log:append", String(line)),
  readLog: () => ipcRenderer.invoke("log:read"),

  /* The admin password. The page can ask whether one is set, set the
     first one, have a guess checked, and change it by supplying the
     current one. It never receives the stored hash, and there is no call
     to read or clear it. */
  adminStatus: () => ipcRenderer.invoke("admin:status"),
  adminSet: password => ipcRenderer.invoke("admin:set", String(password)),
  adminCheck: password => ipcRenderer.invoke("admin:check", String(password)),
  adminReset: (current, next) =>
    ipcRenderer.invoke("admin:reset", String(current), String(next)),
});

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
});

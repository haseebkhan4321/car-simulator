/* The only bridge between the page and Electron. The driving code needs
   nothing from the main process, so all that crosses is a little dressing
   for the page: which build this is, and which platform it runs on. */

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },
});

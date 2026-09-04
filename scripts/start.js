#!/usr/bin/env node
/* Launcher for `npm start`.
 *
 * A terminal inside VS Code inherits ELECTRON_RUN_AS_NODE=1 from the
 * editor's own Electron process. Left in place, our Electron would boot
 * as a bare Node process, `app` would be undefined, and main.js would
 * die on its first line. The same applies to a few other variables VS
 * Code exports for its children. Strip them, then hand over. */

const { spawn } = require("node:child_process");
const electron = require("electron");   // resolves to the binary's path

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
delete env.ELECTRON_NO_ATTACH_CONSOLE;
for(const key of Object.keys(env)){
  if(key.startsWith("VSCODE_")) delete env[key];
}

const child = spawn(electron, [__dirname + "/..", ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
});

child.on("close", code => process.exit(code ?? 0));

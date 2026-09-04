# Nora in Lahore

A car you drive across Lahore, on real OpenStreetMap data, as an Electron
desktop app. Nora can drive herself along a route, or you can take the
wheel and steer.

## Running it

Needs Node 18 or newer. Node is not currently installed on this machine;
`brew install node` will fix that.

```sh
npm install
npm start
```

## Building an installer

```sh
npm run dist        # for whatever platform you are on
npm run dist:mac    # dmg, arm64 and x64
npm run dist:win    # nsis installer
npm run dist:linux  # AppImage
```

Output lands in `dist/`.

## Layout

```
main.js              window, menu, and the network allowlist
preload.js           the one small bridge into the page
renderer/
  index.html         markup only
  styles.css         was the <style> block
  app.js             was the inline <script>: driving, routing, camera
  sound.js           the EV's voice, synthesised: whine, hum, tyres, AVAS
  car-model.js       the car, as base64 glTF
  vendor/            maplibre-gl 4.7.1, three 0.128.0, GLTFLoader
```

## What it talks to

No API keys anywhere. Four open services, and the main process blocks
every host but these:

| Host | For |
| --- | --- |
| `tiles.openfreemap.org` | vector tiles built from OpenStreetMap |
| `nominatim.openstreetmap.org` | turning an address into coordinates |
| `router.project-osrm.org` | working out the driving route |
| `fonts.googleapis.com`, `fonts.gstatic.com` | IBM Plex Sans |

The map, the geocoder and the router are all live services, so the app
needs a connection to build a route. Once a route is built, driving it is
local. The font falls back to the system sans if it cannot be fetched.

Map data © OpenStreetMap contributors, ODbL. Car model
"car for games unity" by shehab house, CC-BY-4.0.

## Sound

Nora is electric, so there is nothing to record: an EV is inverter whine,
tyre roar, and the low-speed hum regulations require. All of it is
synthesised in [renderer/sound.js](renderer/sound.js) with the Web Audio
API, so there are no audio files and nothing to fetch. The four layers
all track road speed, and the Sound button in the panel mutes them.

## Notes on the port

The page was a single self-contained HTML file. The conversion split it
into markup, styles and script so the renderer can run under a strict
Content-Security-Policy with no inline script, and the three CDN
libraries were vendored into `renderer/vendor/` so the app does not
fetch code at startup. The driving logic itself is unchanged.

The renderer runs with `nodeIntegration: false`, `contextIsolation: true`
and `sandbox: true` — it is a plain web page with no access to the
machine.

/* ------------------------------------------------------------------ *
 *  Everything here is keyless. Four open services do the work:
 *    OpenFreeMap  vector tiles built from OpenStreetMap data
 *    MapLibre GL  renders them, and can tilt and rotate
 *    Nominatim    turns an address into coordinates
 *    OSRM         works out the driving route
 *  Coordinates are [longitude, latitude] throughout, which is the
 *  GeoJSON order and the opposite of Google's.
 * ------------------------------------------------------------------ */

const TILE_STYLE = "https://tiles.openfreemap.org/styles/liberty";

/* ------------------------------------------------------------------ *
 *  The fence. This is the Lahore District administrative boundary from
 *  OpenStreetMap (relation 16117666), simplified from 1629 points to
 *  318 so it can sit in the file. Accurate to roughly 100 metres, which
 *  is fine for a barrier and far too coarse for a legal border.
 *  Points are [longitude, latitude], the same order as everything else.
 * ------------------------------------------------------------------ */
const LAHORE = [[74.0068,31.3589],[74.0127,31.3468],[74.0275,31.3235],[74.0179,31.3162],[74.0179,31.3139],[74.0296,31.3006],[74.0452,31.2869],[74.0562,31.2809],[74.0548,31.2785],[74.0688,31.2665],[74.0709,31.2685],[74.0736,31.2764],[74.0820,31.2823],[74.0903,31.2764],[74.0928,31.2681],[74.0940,31.2449],[74.0976,31.2387],[74.1091,31.2470],[74.1123,31.2540],[74.1178,31.2596],[74.1161,31.2666],[74.1255,31.2791],[74.1362,31.2781],[74.1417,31.2729],[74.1473,31.2703],[74.1501,31.2605],[74.1545,31.2595],[74.1598,31.2619],[74.1572,31.2576],[74.1648,31.2491],[74.1646,31.2452],[74.1633,31.2402],[74.1604,31.2384],[74.1588,31.2338],[74.1556,31.2333],[74.1542,31.2309],[74.1611,31.2263],[74.1587,31.2233],[74.1597,31.2200],[74.1574,31.2178],[74.1490,31.2157],[74.1565,31.2145],[74.1608,31.2098],[74.1741,31.2034],[74.1752,31.2006],[74.1769,31.2006],[74.1777,31.2054],[74.1884,31.2112],[74.2003,31.2099],[74.2033,31.2082],[74.2050,31.2136],[74.2121,31.2217],[74.2133,31.2256],[74.2336,31.2399],[74.2435,31.2447],[74.2491,31.2445],[74.2479,31.2511],[74.2492,31.2534],[74.2749,31.2666],[74.2883,31.2610],[74.3008,31.2518],[74.3202,31.2600],[74.3293,31.2619],[74.3396,31.2630],[74.3537,31.2573],[74.3670,31.2644],[74.3865,31.2646],[74.3995,31.2664],[74.4018,31.2703],[74.4093,31.2743],[74.4190,31.2757],[74.4186,31.2696],[74.4124,31.2681],[74.4135,31.2625],[74.4108,31.2562],[74.4124,31.2556],[74.4122,31.2515],[74.4093,31.2515],[74.4077,31.2475],[74.4115,31.2475],[74.4110,31.2432],[74.4142,31.2442],[74.4140,31.2392],[74.4309,31.2441],[74.4304,31.2480],[74.4333,31.2485],[74.4336,31.2528],[74.4354,31.2526],[74.4355,31.2597],[74.4378,31.2604],[74.4378,31.2631],[74.4408,31.2671],[74.4393,31.2873],[74.4427,31.3028],[74.4427,31.3114],[74.4498,31.3210],[74.4569,31.3518],[74.4675,31.3528],[74.4715,31.3639],[74.4887,31.3634],[74.4937,31.3584],[74.4973,31.3452],[74.5265,31.3579],[74.5519,31.3539],[74.5531,31.3564],[74.5507,31.3570],[74.5501,31.3601],[74.5530,31.3658],[74.5659,31.3716],[74.5717,31.3715],[74.5724,31.3735],[74.5785,31.3749],[74.5779,31.3759],[74.5845,31.3801],[74.5871,31.3976],[74.5905,31.4009],[74.5941,31.4078],[74.5966,31.4162],[74.6027,31.4156],[74.6013,31.4199],[74.6072,31.4205],[74.6090,31.4236],[74.6193,31.4198],[74.6224,31.4301],[74.6275,31.4294],[74.6289,31.4262],[74.6314,31.4256],[74.6337,31.4187],[74.6425,31.4159],[74.6483,31.4238],[74.6520,31.4264],[74.6547,31.4259],[74.6429,31.4366],[74.6386,31.4442],[74.6414,31.4490],[74.6513,31.4519],[74.6533,31.4552],[74.6478,31.4655],[74.6386,31.4725],[74.6363,31.4777],[74.6278,31.4769],[74.6296,31.4841],[74.6316,31.4813],[74.6367,31.4847],[74.6323,31.4865],[74.6251,31.4859],[74.6259,31.4827],[74.6236,31.4833],[74.6223,31.4820],[74.6224,31.4852],[74.6187,31.4851],[74.6145,31.4891],[74.6132,31.4956],[74.6098,31.4998],[74.6055,31.4984],[74.6031,31.5005],[74.5996,31.4997],[74.5948,31.5015],[74.5936,31.4961],[74.5884,31.4972],[74.5874,31.4961],[74.5782,31.4983],[74.5754,31.5009],[74.5800,31.5005],[74.5812,31.4988],[74.5816,31.5006],[74.5846,31.5002],[74.5873,31.5042],[74.5801,31.5070],[74.5820,31.5080],[74.5841,31.5067],[74.5837,31.5104],[74.5803,31.5111],[74.5828,31.5138],[74.5842,31.5208],[74.5890,31.5214],[74.5960,31.5260],[74.6038,31.5240],[74.6129,31.5273],[74.6122,31.5304],[74.6143,31.5350],[74.6130,31.5434],[74.6150,31.5441],[74.6144,31.5511],[74.6188,31.5516],[74.6161,31.5575],[74.6109,31.5589],[74.6113,31.5601],[74.6067,31.5625],[74.6090,31.5667],[74.6135,31.5669],[74.6159,31.5690],[74.6109,31.5671],[74.6017,31.5727],[74.5921,31.5741],[74.5919,31.5765],[74.5853,31.5814],[74.5870,31.5834],[74.5858,31.5851],[74.5810,31.5871],[74.5824,31.5880],[74.5809,31.5943],[74.5772,31.5951],[74.5749,31.5978],[74.5789,31.5997],[74.5757,31.6008],[74.5754,31.6040],[74.5675,31.6070],[74.5555,31.6079],[74.5565,31.6114],[74.5512,31.6177],[74.5516,31.6240],[74.5463,31.6332],[74.5480,31.6409],[74.5466,31.6457],[74.5449,31.6483],[74.5412,31.6467],[74.5391,31.6482],[74.5375,31.6532],[74.5403,31.6599],[74.5288,31.6664],[74.5297,31.6694],[74.5345,31.6736],[74.5351,31.6776],[74.5243,31.6869],[74.5168,31.6887],[74.5020,31.6956],[74.5034,31.7026],[74.4995,31.7069],[74.4993,31.7094],[74.4895,31.7134],[74.4716,31.7013],[74.4615,31.6984],[74.4571,31.6907],[74.4470,31.6897],[74.4383,31.6926],[74.4378,31.6868],[74.4508,31.6718],[74.4378,31.6670],[74.4179,31.6472],[74.4073,31.6404],[74.3773,31.6670],[74.3686,31.6699],[74.3585,31.6592],[74.3362,31.6439],[74.3364,31.6415],[74.3384,31.6399],[74.3325,31.6287],[74.3231,31.6254],[74.3222,31.6329],[74.3190,31.6397],[74.3081,31.6434],[74.3081,31.6458],[74.3056,31.6478],[74.3063,31.6516],[74.2966,31.6526],[74.2916,31.6463],[74.2891,31.6468],[74.2881,31.6491],[74.2818,31.6464],[74.2824,31.6385],[74.2790,31.6364],[74.2791,31.6318],[74.2762,31.6295],[74.2764,31.6276],[74.2716,31.6270],[74.2671,31.6293],[74.2652,31.6274],[74.2652,31.6189],[74.2680,31.6152],[74.2606,31.6131],[74.2588,31.6106],[74.2584,31.6054],[74.2609,31.6008],[74.2552,31.5985],[74.2537,31.6018],[74.2468,31.6042],[74.2411,31.5998],[74.2403,31.5974],[74.2426,31.5954],[74.2429,31.5920],[74.2483,31.5891],[74.2516,31.5804],[74.2448,31.5776],[74.2477,31.5683],[74.2380,31.5640],[74.2235,31.5509],[74.1984,31.5219],[74.1834,31.5098],[74.1843,31.4992],[74.1829,31.4842],[74.1756,31.4764],[74.1800,31.4672],[74.1621,31.4561],[74.1500,31.4532],[74.1432,31.4440],[74.1403,31.4358],[74.1403,31.4266],[74.1331,31.4266],[74.1282,31.4194],[74.1249,31.4281],[74.1253,31.4421],[74.1215,31.4503],[74.1084,31.4580],[74.0862,31.4271],[74.0746,31.4165],[74.0736,31.4082],[74.0765,31.4005],[74.0823,31.4015],[74.0842,31.3957],[74.0755,31.3821],[74.0731,31.3710],[74.0596,31.3700],[74.0494,31.3647],[74.0364,31.3647],[74.0243,31.3681],[74.0141,31.3681],[74.0068,31.3589]];

const LAHORE_CENTRE = [74.3436, 31.5497];
const LAHORE_BOUNDS = [[73.96, 31.16], [74.70, 31.75]];
const PITCH = 65;   // how far the camera leans over

/* The speed slider is in km/h and serves both modes: Nora's cruising
   speed when she self-drives, and your top speed when you drive. */
const setSpeed = () => Number($("speed").value) / 3.6;   // km/h to m/s

let path = [], cum = [], total = 0;
let travelled = 0, segIndex = 0;
let playing = false, lastFrame = 0;
let frameDt = 1 / 60;   // length of the frame being drawn, in seconds

let mode = "route";
let carPos = null, carDir = 0, carSpeed = 0, odometer = 0;
const held = { f:false, b:false, l:false, r:false };

const REVERSE_CAP = 8;
const ACCEL = 11, BRAKE = 22, COAST = 5, TURN_RATE = 105;

/* Running cost, rupees per kilometre. Both are editable in the panel
   and kept for next time, so they are variables with defaults rather
   than constants. */
let rateNora   = 3.95;
let ratePetrol = 20.00;

/* The wheel is two things at once. steerCmd is the instruction, set by
   your hand or the arrow keys, running from -1 to 1. wheelAngle is the
   picture on screen, which follows the car's real rate of turn, so a bend
   the road pulls the car round shows on the wheel just as your input does. */
let steerCmd = 0;
let wheelAngle = 0;
let shownTurn = 0;             // smoothed rate of turn, degrees per second
let prevHeading = null;
let dragging = false, dragStartPointer = 0, dragStartWheel = 0;
const WHEEL_MAX    = 130;   // degrees of lock in each direction
const WHEEL_KEY    = 2.6;   // command units per second on the arrow keys
const WHEEL_RETURN = 3.3;   // how fast the command falls back to straight
const WHEEL_SHOW   = 11;    // how fast the drawn wheel chases the real turn

const $ = id => document.getElementById(id);

/* ---------------------- geometry helpers ---------------------- */

const R = 6371000;
const rad = d => d * Math.PI / 180;
const deg = r => r * 180 / Math.PI;

function metresBetween(a, b){
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2
          + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearingBetween(a, b){
  const dLon = rad(b[0] - a[0]);
  const y = Math.sin(dLon) * Math.cos(rad(b[1]));
  const x = Math.cos(rad(a[1])) * Math.sin(rad(b[1]))
          - Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(dLon);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/* Over a few metres a straight blend is indistinguishable from a great circle. */
function mix(a, b, f){
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

function moveFrom(p, metres, bearing){
  const d = metres / R, br = rad(bearing);
  const lat1 = rad(p[1]), lon1 = rad(p[0]);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d)
             + Math.cos(lat1) * Math.sin(d) * Math.cos(br));
  const lon2 = lon1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(lat1),
                                 Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return [((deg(lon2) + 540) % 360) - 180, deg(lat2)];
}

/* ------------------------------------------------------------------ *
 *  Roads. The vector tiles MapLibre already downloaded contain the road
 *  geometry, so there is no second service to call. querySourceFeatures
 *  reads them back out of the loaded tiles, and they get bucketed into a
 *  coarse grid so the per-frame nearest lookup only tests nearby ones.
 * ------------------------------------------------------------------ */

const ROAD_CLASSES = new Set([
  "motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service"
]);
const CELL       = 0.0025;  // grid cell, roughly 250 m
const SNAP_LIMIT = 14;      // metres you may stray before the road refuses you
const ROAD_GRIP  = 6;       // how hard the road pulls the nose straight, per second

let roadCells = new Map();
let roadsReady = false;
let lastIndexAt = 0;
let lastIndexAt2 = null;   // where the car was when the grid was last built
let indexQueued = false;

/* Rebuilding the grid means reading every road feature out of every loaded
   tile, which is far too heavy to do on a whim. The map fires "idle" many
   times a second while the camera is being driven, so the request has to be
   filtered hard before any work happens. */
function scheduleIndex(force){
  const now = performance.now();

  if(!force){
    if(now - lastIndexAt < 1200) return;                       // not too often
    if(map.getZoom() < 14) return;                             // roads not loaded yet
    if(lastIndexAt2 && carPos && metresBetween(lastIndexAt2, carPos) < 250) return;
  }
  if(indexQueued) return;
  indexQueued = true;

  // Build it in a gap between frames rather than in the middle of one.
  const run = () => { indexQueued = false; indexRoads(); };
  if(window.requestIdleCallback) requestIdleCallback(run, { timeout: 400 });
  else setTimeout(run, 0);
}

function cellKey(lng, lat){
  return Math.floor(lng / CELL) + ":" + Math.floor(lat / CELL);
}

/* Walk the segment and register it in every cell it passes through. Filing
   it under its two ends alone loses long straight stretches: a motorway
   node pair can be a kilometre apart, and a car halfway along it would
   find no road at all. */
function fileSegment(cells, seg){
  const [a, b] = seg;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / (CELL / 2)));

  let previous = null;
  for(let s = 0; s <= steps; s++){
    const k = cellKey(a[0] + dx * s / steps, a[1] + dy * s / steps);
    if(k === previous) continue;
    previous = k;
    let bucket = cells.get(k);
    if(!bucket) cells.set(k, bucket = []);
    bucket.push(seg);
  }
}

function indexRoads(){
  lastIndexAt = performance.now();
  lastIndexAt2 = carPos ? carPos.slice() : null;
  if(!map.getSource("openmaptiles")) return;

  const feats = map.querySourceFeatures("openmaptiles", { sourceLayer: "transportation" });
  const cells = new Map();

  // Only file roads near the car. A road a kilometre away can never be the
  // nearest one, and filing every road in every loaded tile is most of the
  // cost of this function.
  const near = carPos || map.getCenter().toArray();
  const span = 0.02;   // roughly 2 km

  for(const f of feats){
    if(!ROAD_CLASSES.has(f.properties.class)) continue;
    const g = f.geometry;
    const lines = g.type === "LineString"      ? [g.coordinates]
                : g.type === "MultiLineString" ?  g.coordinates : [];

    for(const line of lines){
      for(let i = 1; i < line.length; i++){
        const a = line[i - 1], b = line[i];
        if(Math.min(a[0], b[0]) > near[0] + span) continue;
        if(Math.max(a[0], b[0]) < near[0] - span) continue;
        if(Math.min(a[1], b[1]) > near[1] + span) continue;
        if(Math.max(a[1], b[1]) < near[1] - span) continue;
        fileSegment(cells, [a, b]);
      }
    }
  }

  roadCells = cells;
  roadsReady = cells.size > 0;
}

/* Closest point on any nearby road, or null if they are all too far. */
function nearestRoad(p, limit){
  const cosLat = Math.cos(rad(p[1]));
  const toXY = q => [(q[0] - p[0]) * cosLat * 111320, (q[1] - p[1]) * 110540];

  let best = null, bestDist = Infinity;
  const cx = Math.floor(p[0] / CELL), cy = Math.floor(p[1] / CELL);

  for(let i = -1; i <= 1; i++){
    for(let j = -1; j <= 1; j++){
      const bucket = roadCells.get((cx + i) + ":" + (cy + j));
      if(!bucket) continue;

      for(const seg of bucket){
        const a = toXY(seg[0]), b = toXY(seg[1]);
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const len2 = dx * dx + dy * dy;
        // How far along the segment the perpendicular from p lands, clamped
        // to the ends so the search cannot run off past a junction.
        const t = len2 ? Math.max(0, Math.min(1, (-a[0] * dx - a[1] * dy) / len2)) : 0;
        const d = Math.hypot(a[0] + t * dx, a[1] + t * dy);
        if(d < bestDist){ bestDist = d; best = { seg, t }; }
      }
    }
  }

  if(!best || bestDist > limit) return null;
  return {
    point:    mix(best.seg[0], best.seg[1], best.t),
    bearing:  bearingBetween(best.seg[0], best.seg[1]),
    distance: bestDist
  };
}

/* Both the camera bearing and the road alignment ease toward their target.
   The easing is written as 1 - (1 - k)^(dt*60) so that it covers the same
   ground per second regardless of frame rate. A flat "10% per frame" runs
   twice as fast at 120fps as at 60, and lurches whenever a frame runs long,
   which is exactly what juddering camera work looks like. */

function turnTowards(from, to){
  return ((to - from + 540) % 360) - 180;
}

/* A fraction to move this frame, given a rate per second. Plain "x * 0.1"
   every frame means the smoothing changes with the frame rate, so a
   stutter and a fast machine ease at different speeds. */
function ease(rate, dt){
  return 1 - Math.exp(-rate * dt);
}

let camCentre = null;          // camera position, trailing the car slightly
let camBearing = null;
const CAM_FOLLOW = 9;          // how fast the camera catches up
const CAM_TURN   = 3.2;        // how fast it swings round to the new bearing
const SNAP_PULL  = 7;          // how fast the road reels a straying car in

/* Ray casting: count how many boundary edges a line drawn east from the
   point crosses. Odd means inside. */
function insideLahore(p){
  const [x, y] = p;
  let inside = false;
  for(let i = 0, j = LAHORE.length - 1; i < LAHORE.length; j = i++){
    const [xi, yi] = LAHORE[i], [xj, yj] = LAHORE[j];
    if((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi){
      inside = !inside;
    }
  }
  return inside;
}

/* ---------------------------- map ---------------------------- */

const map = new maplibregl.Map({
  container: "map",
  style: TILE_STYLE,
  center: LAHORE_CENTRE,
  zoom: 11,
  minZoom: 9.5,
  maxZoom: 22,              // the zoom slider's top end, stated rather than implied
  maxBounds: LAHORE_BOUNDS,   // the camera cannot leave this box
  maxPitch: 85,
  fadeDuration: 0,          // stop label cross-fades recomputing every frame
  attributionControl: { compact: true }
});

/* ------------------------------------------------------------------ *
 *  The car, as actual geometry. A three.js scene is drawn straight into
 *  MapLibre's own WebGL context by a custom layer, so the car sits in the
 *  same 3D space as the map and leans with the pitch instead of being a
 *  flat sticker pasted on top.
 * ------------------------------------------------------------------ */

const CAR_LENGTH = 4.2;   // metres, nose to tail
const CAR_WIDTH  = 1.8;
const CAR_HEIGHT = 1.6;

let carDraw = null;       // { lng, lat, heading } the layer reads each frame

function buildBlockCar(){
  const car = new THREE.Group();

  const paint  = new THREE.MeshLambertMaterial({ color: 0xF0A028 });
  const glass  = new THREE.MeshLambertMaterial({ color: 0x28313D });
  const rubber = new THREE.MeshLambertMaterial({ color: 0x14181E });
  const lamp   = new THREE.MeshBasicMaterial({ color: 0xFFF3D6 });
  const brake  = new THREE.MeshBasicMaterial({ color: 0x8C2B12 });

  // Built in metres, nose pointing along -Z, Y up. The layer below rotates
  // it into place, so -Z ends up being whichever way the car is heading.
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(CAR_WIDTH, 0.72, CAR_LENGTH), paint);
  body.position.y = 0.62;
  car.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(CAR_WIDTH * 0.86, 0.6, CAR_LENGTH * 0.46), glass);
  cabin.position.set(0, 1.24, 0.15);
  car.add(cabin);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(CAR_WIDTH * 0.78, 0.09, CAR_LENGTH * 0.3), paint);
  roof.position.set(0, CAR_HEIGHT - 0.06, 0.22);
  car.add(roof);

  const tyre = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 18);
  for(const x of [-1, 1]){
    for(const z of [-1, 1]){
      const w = new THREE.Mesh(tyre, rubber);
      w.rotation.z = Math.PI / 2;           // lay the axle across the car
      w.position.set(x * CAR_WIDTH / 2, 0.34, z * CAR_LENGTH * 0.32);
      car.add(w);
    }
  }

  for(const x of [-0.55, 0.55]){
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.06), lamp);
    head.position.set(x, 0.72, -CAR_LENGTH / 2 - 0.02);
    car.add(head);
  }

  const tail = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.06), brake);
  tail.position.set(0, 0.8, CAR_LENGTH / 2 + 0.02);
  car.add(tail);

  return car;
}

/* ------------------------------------------------------------------ *
 *  Lights. The model has no lamps of its own to switch on: its glTF
 *  materials are BodyAlbedo, Paint, Glass and so on, with the headlights
 *  painted into the body texture. So the working ones are geometry we
 *  add ourselves. Every position is measured off the model's own
 *  bounding box rather than hard-coded, so they land on the bodywork of
 *  whichever car is loaded, and the model's front wheels sit at negative
 *  Z, which is why the nose is box.min.z.
 *
 *  Faces are unlit basic material, which is what makes a lamp read as
 *  lit rather than shaded. The halo behind the tail lamps and the fan on
 *  the road ahead are additive, so they brighten whatever is under them
 *  instead of painting a grey square over it.
 * ------------------------------------------------------------------ */

let lamps = null;

/* Bright at the near edge, gone by the far one: a beam on the road. */
function fanTexture(){
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 64, 2, 32, 64, 62);
  grad.addColorStop(0,    "rgba(255,244,214,0.85)");
  grad.addColorStop(0.45, "rgba(255,240,200,0.30)");
  grad.addColorStop(1,    "rgba(255,238,190,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* A soft disc, for the glow sitting behind a lamp. */
function discTexture(){
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 1, 32, 32, 31);
  grad.addColorStop(0,   "rgba(255,255,255,0.95)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.35)");
  grad.addColorStop(1,   "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function lampFace(group, w, h, colour, x, y, z){
  const mat = new THREE.MeshBasicMaterial({
    color: colour, transparent: true, opacity: 0,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mat;
}

function lampGlow(group, size, colour, x, y, z, texture){
  const mat = new THREE.MeshBasicMaterial({
    map: texture, color: colour, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function buildLights(target, box){
  const group = new THREE.Group();
  const halfW = Math.max(0.5, box.max.x);
  const nose  = box.min.z - 0.02;
  const tail  = box.max.z + 0.02;
  const top   = Math.max(0.8, box.max.y);
  const lampY = top * 0.42;
  const disc  = discTexture();

  const head = [-1, 1].map(side =>
    lampFace(group, 0.34, 0.13, 0xFFF6DE, side * halfW * 0.66, lampY, nose));

  const rear = [-1, 1].map(side =>
    lampFace(group, 0.40, 0.13, 0xFF3A22, side * halfW * 0.68, lampY * 1.1, tail));

  const rearGlow = [-1, 1].map(side =>
    lampGlow(group, 0.85, 0xFF2A14, side * halfW * 0.68, lampY * 1.1, tail + 0.05, disc));

  const reverse = [-1, 1].map(side =>
    lampFace(group, 0.17, 0.09, 0xFFFFFF, side * halfW * 0.3, lampY * 1.1, tail));

  const turnL = [
    lampFace(group, 0.13, 0.09, 0xFFA828, -halfW * 0.92, lampY, nose),
    lampFace(group, 0.13, 0.09, 0xFFA828, -halfW * 0.92, lampY * 1.1, tail),
  ];
  const turnR = [
    lampFace(group, 0.13, 0.09, 0xFFA828, halfW * 0.92, lampY, nose),
    lampFace(group, 0.13, 0.09, 0xFFA828, halfW * 0.92, lampY * 1.1, tail),
  ];

  /* The beam lies flat on the road. Rotating -90 degrees about X turns
     the plane's own up direction into the car's forward one, so the
     texture's bright edge ends up at the bumper. */
  const beamLen = 5.4;
  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(halfW * 3.2, beamLen),
    new THREE.MeshBasicMaterial({
      map: fanTexture(), transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0.04, nose - beamLen / 2);
  group.add(beam);

  target.add(group);
  lamps = {
    head, rear, reverse, turnL, turnR,
    rearGlow: rearGlow.map(m => m.material),
    beam: beam.material,
  };
}

/* Called every frame. Headlights follow the ignition, brake lamps the
   brake, reverse lamps a negative speed, and the indicators the car's
   own rate of turn, so Nora signals her corners as well as you do. */
function setLights(){
  if(!lamps) return;

  const driving   = playing;
  const braking   = mode === "manual" && held.b && carSpeed > 0.1;
  const reversing = mode === "manual" && carSpeed < -0.2;

  for(const m of lamps.head)    m.opacity = driving ? 0.95 : 0.18;
  lamps.beam.opacity            = driving ? 0.34 : 0;

  const rear = braking ? 1 : (driving ? 0.42 : 0.16);
  for(const m of lamps.rear)    m.opacity = rear;
  for(const m of lamps.rearGlow) m.opacity = braking ? 0.6 : (driving ? 0.13 : 0);

  for(const m of lamps.reverse) m.opacity = reversing ? 0.95 : 0;

  const blink = (performance.now() % 880) < 440;
  const left  = shownTurn < -16, right = shownTurn > 16;
  for(const m of lamps.turnL)   m.opacity = (left  && blink) ? 1 : 0;
  for(const m of lamps.turnR)   m.opacity = (right && blink) ? 1 : 0;
}

/* Load the real model, falling back to the block car if car-model.js is
   missing or the file will not parse. The model is measured and rescaled
   rather than trusted, so a model in centimetres or facing the wrong way
   is a one-line fix rather than a mystery. */
function loadCarModel(target){
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true,
                                  opacity: 0.26, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2;
  ground.scale.set(CAR_WIDTH * 0.6, CAR_LENGTH * 0.52, 1);
  ground.position.y = 0.02;
  target.add(ground);

  if(!window.CAR_GLB_BASE64 || !THREE.GLTFLoader){
    const block = buildBlockCar();
    target.add(block);
    buildLights(target, new THREE.Box3().setFromObject(block));
    return;
  }

  const bytes = Uint8Array.from(atob(window.CAR_GLB_BASE64), c => c.charCodeAt(0));

  new THREE.GLTFLoader().parse(bytes.buffer, "", gltf => {
    const model = gltf.scene;

    // Metal with no environment map renders black, so tone it down and let
    // the lights do the work.
    model.traverse(o => {
      if(!o.isMesh || !o.material) return;
      for(const m of [].concat(o.material)){
        if(m.metalness !== undefined) m.metalness = Math.min(m.metalness, 0.3);
        if(m.roughness !== undefined) m.roughness = Math.max(m.roughness, 0.45);
      }
    });

    // Scale to the length we use everywhere else, then sit it on the road
    // with its centre over the car's position.
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    model.scale.setScalar(CAR_LENGTH / size.z);

    const box = new THREE.Box3().setFromObject(model);
    const mid = box.getCenter(new THREE.Vector3());
    model.position.x -= mid.x;
    model.position.z -= mid.z;
    model.position.y -= box.min.y;

    target.add(model);
    buildLights(target, new THREE.Box3().setFromObject(model));
    if(map) map.triggerRepaint();
  }, err => {
    console.error("car model failed to load", err);
    const block = buildBlockCar();
    target.add(block);
    buildLights(target, new THREE.Box3().setFromObject(block));
  });
}

const carLayer = {
  id: "car-3d",
  type: "custom",
  renderingMode: "3d",

  onAdd(map, gl){
    this.scene  = new THREE.Scene();
    this.camera = new THREE.Camera();

    this.scene.add(new THREE.HemisphereLight(0xEAF2FF, 0x4A4032, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(-0.7, 1.4, 0.5);
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xBFD4FF, 0.6);
    fill.position.set(0.8, 0.6, -0.9);
    this.scene.add(fill);

    this.car = new THREE.Group();
    this.scene.add(this.car);
    loadCarModel(this.car);

    // Share the map's canvas and context rather than making a second one.
    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(), context: gl, antialias: true
    });
    this.renderer.autoClear = false;
  },

  render(gl, matrix){
    if(!carDraw) return;

    const merc = maplibregl.MercatorCoordinate.fromLngLat(
      { lng: carDraw.lng, lat: carDraw.lat }, 0);
    const s = merc.meterInMercatorCoordinateUnits();

    // Put the model where the car is, at the right size, standing up.
    // The Y flip is because mercator y grows southwards while three's
    // does not, and the X rotation turns three's Y-up into the map's Z-up.
    const local = new THREE.Matrix4()
      .makeTranslation(merc.x, merc.y, merc.z)
      .scale(new THREE.Vector3(s, -s, s))
      .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
      .multiply(new THREE.Matrix4().makeRotationY(-carDraw.heading * Math.PI / 180));

    this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(local);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
  }
};

map.on("load", () => {
  // A polygon covering the world with Lahore punched out of it, so
  // anything beyond the district reads as off limits.
  map.addSource("outside", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]],
          LAHORE
        ]
      }
    }
  });
  map.addLayer({
    id: "outside-mask",
    type: "fill",
    source: "outside",
    paint: { "fill-color": "#0E1217", "fill-opacity": 0.55 }
  });

  map.addSource("fence", {
    type: "geojson",
    data: { type: "Feature", geometry: { type: "LineString", coordinates: LAHORE } }
  });
  map.addLayer({
    id: "fence-line",
    type: "line",
    source: "fence",
    paint: { "line-color": "#E24B4A", "line-width": 2, "line-dasharray": [3, 2] }
  });

  map.addSource("route", {
    type: "geojson",
    data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
  });
  map.addLayer({
    id: "route-line",
    type: "line",
    source: "route",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#F0A028", "line-width": 6, "line-opacity": 0.9 }
  });

  // Added last so the car draws over the route line.
  map.addLayer(carLayer);

  map.on("idle", () => scheduleIndex(false));

  wireControls();
  logAction("app", "map ready");
  buildRoute();
});

/* ------------------------- open services ------------------------- */

async function geocode(query){
  // bounded=1 with a viewbox tells Nominatim to discard anything outside
  // the box entirely, rather than merely ranking it lower.
  const [[w, s], [e, n]] = LAHORE_BOUNDS;
  const url = "https://nominatim.openstreetmap.org/search"
            + "?format=jsonv2&limit=5&bounded=1"
            + `&viewbox=${w},${n},${e},${s}`
            + "&q=" + encodeURIComponent(query);
  const res = await fetch(url);
  if(!res.ok) throw new Error("Address lookup failed (" + res.status + ").");
  const hits = await res.json();

  // The viewbox is a rectangle, so still test against the real boundary.
  for(const hit of hits){
    const p = [Number(hit.lon), Number(hit.lat)];
    if(insideLahore(p)) return p;
  }
  throw new Error("No place called " + query + " inside Lahore.");
}

async function routeBetween(a, b){
  const url = "https://router.project-osrm.org/route/v1/driving/"
            + `${a[0]},${a[1]};${b[0]},${b[1]}`
            + "?overview=full&geometries=geojson";
  const res = await fetch(url);
  if(!res.ok) throw new Error("Routing failed (" + res.status + ").");
  const json = await res.json();
  if(json.code !== "Ok" || !json.routes.length){
    throw new Error("No driving route between those two places.");
  }
  return json.routes[0];
}

/* --------------------------- the route --------------------------- */

/* ------------------------------------------------------------------ *
 *  Picking a point off the map. Typing an address is fine for a mosque
 *  or a stadium, and useless for "that turning by the canal", so each
 *  field also has a pin: it opens a second map in a sheet over the top,
 *  you click where you mean, and the exact coordinate is kept.
 *
 *  A picked point is used verbatim for routing. The text put in the box
 *  is only there to be read, and editing it by hand throws the
 *  coordinate away and puts the field back to being an address.
 * ------------------------------------------------------------------ */

const picked = { from: null, to: null };
let pickMap = null, pickMarker = null, pickTarget = null, pickPoint = null;

function openPicker(field){
  logAction("pick", "open for " + field);
  pickTarget = field;
  pickPoint  = null;
  $("pickerTitle").textContent = field === "from"
    ? "Pick the start" : "Pick the destination";
  $("pickUse").disabled = true;
  setPickStatus("Click anywhere in Lahore to drop a pin.");
  $("picker").hidden = false;

  // A map built inside a hidden element has no size, so it is built on
  // the first open and told to measure itself on every one.
  if(!pickMap){
    pickMap = new maplibregl.Map({
      container: "pickMap",
      style: TILE_STYLE,
      center: map.getCenter(),
      zoom: 11.5,
      maxBounds: LAHORE_BOUNDS,
      attributionControl: { compact: true },
    });
    pickMap.on("click", e => takePick([e.lngLat.lng, e.lngLat.lat]));
  }
  pickMap.resize();

  const start = picked[field] || map.getCenter();
  pickMap.jumpTo({ center: start, zoom: picked[field] ? 14 : 11.5 });
  if(picked[field]) takePick(picked[field]);
  else if(pickMarker){ pickMarker.remove(); pickMarker = null; }
}

function closePicker(){
  $("picker").hidden = true;
  pickTarget = null;
}

function setPickStatus(msg, isError){
  const el = $("pickStatus");
  el.textContent = msg;
  el.classList.toggle("error", !!isError);
}

function takePick(point){
  if(!insideLahore(point)){
    setPickStatus("That is outside Lahore district. Pick somewhere inside it.", true);
    return;
  }
  pickPoint = point;
  if(pickMarker) pickMarker.setLngLat(point);
  else pickMarker = new maplibregl.Marker({ color: "#F0A028" })
    .setLngLat(point).addTo(pickMap);
  $("pickUse").disabled = false;
  setPickStatus(point[1].toFixed(5) + ", " + point[0].toFixed(5));
}

/* Ask Nominatim what is at the point, so the field reads as a place
   rather than a pair of numbers. The coordinate is what gets routed
   either way, so a failed lookup is not worth an error. */
async function nameFor(point){
  try{
    const url = "https://nominatim.openstreetmap.org/reverse"
              + "?format=jsonv2&zoom=18"
              + "&lat=" + point[1] + "&lon=" + point[0];
    const res = await fetch(url);
    if(!res.ok) return null;
    const hit = await res.json();
    if(!hit || !hit.display_name) return null;
    return hit.display_name.split(",").slice(0, 3).join(",").trim();
  }catch{
    return null;
  }
}

async function usePick(){
  if(!pickPoint || !pickTarget) return;
  const field = pickTarget, point = pickPoint;

  picked[field] = point;
  logAction("pick", field + " " + point[1].toFixed(5) + ", " + point[0].toFixed(5));
  $(field === "from" ? "pinFrom" : "pinTo").classList.add("set");
  $(field).value = point[1].toFixed(5) + ", " + point[0].toFixed(5);
  closePicker();

  setStatus("Naming the point\u2026");
  const name = await nameFor(point);
  // Only fill it in if the pin still stands for what was picked.
  if(name && picked[field] === point) $(field).value = name;
  setStatus(name ? name : "Point set.");
}

function forgetPick(field){
  if(!picked[field]) return;
  picked[field] = null;
  $(field === "from" ? "pinFrom" : "pinTo").classList.remove("set");
}

async function buildRoute(){
  const from = $("from").value.trim();
  const to   = $("to").value.trim();
  if(!from || !to){
    setStatus("Fill in both a start and a destination.", true);
    return;
  }

  stop();
  logAction("route", "build " + from + " -> " + to);
  $("build").disabled = true;
  setStatus("Looking up addresses\u2026");

  try {
    const [a, b] = await Promise.all([
      picked.from || geocode(from),
      picked.to   || geocode(to),
    ]);

    setStatus("Finding a route\u2026");
    const route = await routeBetween(a, b);

    path = route.geometry.coordinates;
    if(path.length < 2) throw new Error("That route was too short to animate.");

    // OSRM knows nothing about Lahore, so it will happily route along a
    // ring road that clips outside the district. Refuse those.
    const escapee = path.findIndex(p => !insideLahore(p));
    if(escapee !== -1){
      throw new Error("That route leaves Lahore. Pick somewhere closer in.");
    }

    cum = [0];
    for(let i = 1; i < path.length; i++){
      cum.push(cum[i - 1] + metresBetween(path[i - 1], path[i]));
    }
    total = cum[cum.length - 1];

    map.getSource("route").setData({
      type: "Feature",
      geometry: { type: "LineString", coordinates: path }
    });

    frameWholeRoute();
    reset();
    $("play").disabled = false;
    $("reset").disabled = false;
    logAction("route", "ready, " + (total / 1000).toFixed(2) + " km, "
                       + path.length + " points");
    setStatus((total / 1000).toFixed(1) + " km route ready.");
  } catch (err) {
    logAction("route", "failed: " + err.message);
    setStatus(err.message, true);
  } finally {
    $("build").disabled = false;
  }
}

function frameWholeRoute(){
  const lons = path.map(p => p[0]), lats = path.map(p => p[1]);
  map.jumpTo({ pitch: 0, bearing: 0 });
  map.fitBounds(
    [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
    { padding: 70, duration: 0 }
  );
}

function sample(metres){
  const d = Math.min(Math.max(metres, 0), total);

  let i = segIndex;
  if(d < cum[i]) i = 0;
  while(i < cum.length - 2 && cum[i + 1] < d) i++;
  segIndex = i;

  const span = cum[i + 1] - cum[i];
  const frac = span > 0 ? (d - cum[i]) / span : 0;

  return {
    position: mix(path[i], path[i + 1], frac),
    heading:  bearingBetween(path[i], path[i + 1])
  };
}

/* ---------------------------- drawing ---------------------------- */

function aimCamera(position, heading){
  carDraw = { lng: position[0], lat: position[1], heading };

  if(camBearing === null){
    camBearing = heading;
    camCentre  = position.slice();
  }

  // Let the camera lag slightly behind the car. A camera welded to the
  // car passes every small steering correction straight into the
  // viewport, which is what reads as shake.
  camCentre   = mix(camCentre, position, ease(CAM_FOLLOW, frameDt));
  camBearing += turnTowards(camBearing, heading) * ease(CAM_TURN, frameDt);

  map.jumpTo({
    center:  camCentre,
    zoom:    Number($("zoom").value),
    pitch:   PITCH,
    bearing: camBearing
  });
}

function updateCost(metres){
  const km = metres / 1000;
  const nora = km * rateNora;
  const petrol = km * ratePetrol;
  $("costNora").textContent   = "Rs " + nora.toFixed(2);
  $("costPetrol").textContent = "Rs " + petrol.toFixed(2);
  $("costSaved").textContent  = "Rs " + (petrol - nora).toFixed(2);
}

/* Turn the drawn wheel to match what the car is really doing. In manual
   mode that includes the road straightening the nose, not just your input;
   in self-driving mode it is the whole story, since the route is steering. */
function turnWheelToMatch(heading, dt){
  if(prevHeading === null) prevHeading = heading;

  const rate = turnTowards(prevHeading, heading) / Math.max(dt, 1 / 240);
  prevHeading = heading;
  shownTurn += (rate - shownTurn) * ease(8, dt);

  if(dragging) return;   // your hand outranks the instrument

  const full = Math.max(-WHEEL_MAX, Math.min(WHEEL_MAX,
                shownTurn / TURN_RATE * WHEEL_MAX));
  wheelAngle += (full - wheelAngle) * ease(WHEEL_SHOW, dt);
  showWheel();
}

function draw(){
  const { position, heading } = mode === "manual"
    ? { position: carPos, heading: carDir }
    : sample(travelled);

  if(!position) return;
  aimCamera(position, heading);
  turnWheelToMatch(heading, frameDt);

  showGlow();
  setLights();

  // Route mode holds the cruising speed; manual mode has a real one.
  CarSound.update(
    mode === "manual" ? carSpeed : setSpeed(),
    setSpeed(),
    mode === "manual" ? held.f : true,
    mode === "manual" ? held.b : false
  );

  // The map redraws every frame; the numbers in the panel do not need to.
  // Six text writes per frame is enough layout work to show up as stutter.
  const now = performance.now();
  if(now - lastReadout < 120) return;
  lastReadout = now;

  updateCost(mode === "manual" ? odometer : travelled);

  if(mode === "manual"){
    $("dist").textContent  = Math.round(Math.abs(carSpeed) * 3.6) + " km/h";
    $("total").textContent = (odometer / 1000).toFixed(2) + " km driven";
    $("bar").style.width   = Math.min(100, Math.abs(carSpeed) / setSpeed() * 100) + "%";
    return;
  }

  $("dist").textContent  = (travelled / 1000).toFixed(2) + " km";
  $("total").textContent = "of " + (total / 1000).toFixed(2) + " km";
  $("bar").style.width   = (total ? travelled / total * 100 : 0) + "%";
}

/* --------------------------- driving --------------------------- */

function steer(dt){
  if(held.f)      carSpeed += ACCEL * dt;
  else if(held.b) carSpeed -= BRAKE * dt;
  else {
    const drop = COAST * dt;
    carSpeed = Math.abs(carSpeed) <= drop ? 0 : carSpeed - Math.sign(carSpeed) * drop;
  }
  carSpeed = Math.max(-REVERSE_CAP, Math.min(setSpeed(), carSpeed));

  // Your hand while dragging, the arrow keys otherwise, and back to
  // straight with nothing held.
  if(dragging){
    steerCmd = wheelAngle / WHEEL_MAX;
  } else if(held.l){
    steerCmd = Math.max(-1, steerCmd - WHEEL_KEY * dt);
  } else if(held.r){
    steerCmd = Math.min( 1, steerCmd + WHEEL_KEY * dt);
  } else {
    const back = WHEEL_RETURN * dt;
    steerCmd = Math.abs(steerCmd) <= back ? 0 : steerCmd - Math.sign(steerCmd) * back;
  }

  // A parked car cannot turn, and a slow one turns lazily.
  const grip = Math.min(1, Math.abs(carSpeed) / 6) * Math.sign(carSpeed);
  carDir += TURN_RATE * dt * grip * steerCmd;
  carDir = (carDir + 360) % 360;

  const step = carSpeed * dt;
  if(step === 0) return;

  const wanted = moveFrom(carPos, step, carDir);

  if(!insideLahore(wanted)){
    carSpeed = 0;
    logAction("limit", "reached the district boundary");
    setStatus("City limit. Turn around.", true);
    return;
  }

  const snap = nearestRoad(wanted, SNAP_LIMIT);

  if(!snap){
    // Driving fast can outrun the tiles, so a missing road may just mean a
    // stale grid. Ask for a rebuild between frames and coast for now,
    // rather than stalling this frame to rebuild it here.
    scheduleIndex(true);
    carPos = wanted;
    odometer += Math.abs(step);
    carSpeed -= Math.min(Math.abs(carSpeed), BRAKE * dt) * Math.sign(carSpeed);
    if(carSpeed === 0) setStatus("No road that way.", true);
    return;
  }

  carPos = mix(wanted, snap.point, ease(SNAP_PULL, dt));
  odometer += Math.abs(step);

  // Point the car along the road. A road runs both ways, so take whichever
  // end of it the car is already closer to facing.
  let along = snap.bearing;
  if(Math.abs(turnTowards(carDir, along)) > 90) along = (along + 180) % 360;
  carDir = (carDir + turnTowards(carDir, along) * ease(ROAD_GRIP, dt) + 360) % 360;
}

function frame(now){
  if(!playing) return;

  const dt = Math.min((now - lastFrame) / 1000, 0.1);
  lastFrame = now;
  frameDt = dt;

  if(mode === "manual"){
    steer(dt);
    draw();
    requestAnimationFrame(frame);
    return;
  }

  travelled += setSpeed() * dt;

  if(travelled >= total){
    travelled = total;
    draw();
    stop();
    logAction("drive", "arrived after " + (total / 1000).toFixed(2) + " km");
    setStatus("Arrived.");
    return;
  }

  draw();
  requestAnimationFrame(frame);
}

function play(){
  if(playing || !total) return;
  if(travelled >= total) travelled = 0;
  playing = true;
  CarSound.start();
  logAction("drive", "start at " + (travelled / 1000).toFixed(2) + " km");
  $("play").textContent = "Pause";
  lastFrame = performance.now();
  requestAnimationFrame(frame);
}

function stop(){
  if(playing) logAction("drive", "pause at " + (travelled / 1000).toFixed(2) + " km");
  playing = false;
  CarSound.stop();
  showGlow();
  $("play").textContent = "Drive";
}

function reset(){
  stop();
  logAction("drive", "reset");
  travelled = 0;
  segIndex = 0;
  camCentre = null;
  camBearing = null;
  updateCost(0);
  if(total) draw();
}

/* ---------------------------- controls ---------------------------- */

function setMode(next){
  if(mode === next) return;
  stop();
  mode = next;
  logAction("mode", next === "route" ? "Nora self-drives" : "you drive");

  $("modeRoute").classList.toggle("on", next === "route");
  $("modeManual").classList.toggle("on", next === "manual");
  $("routeUI").hidden = next !== "route";

  camCentre = null;
  camBearing = null;
  Object.keys(held).forEach(k => held[k] = false);
  showGlow();
  dragging = false;
  wheelAngle = 0;
  steerCmd = 0;
  shownTurn = 0;
  prevHeading = null;
  $("wheel").classList.toggle("auto", next === "route");
  $("wheelCaption").textContent = next === "route"
    ? "Nora is steering"
    : "Drag to steer. Up and down arrows drive.";
  showWheel();

  if(next === "manual"){
    carSpeed = 0;
    odometer = 0;
    if(total && path.length){
      const at = sample(travelled);
      carPos = at.position;
      carDir = at.heading;
    } else {
      carPos = LAHORE_CENTRE.slice();
      carDir = 0;
    }

    // Park it on the nearest road rather than wherever it happened to be.
    indexRoads();
    const onRoad = nearestRoad(carPos, 300);
    if(onRoad){
      carPos = onRoad.point;
      // A road has no direction of its own: which of its two bearings
      // comes back depends on the order the tile happens to store the
      // points in. Take the end the car is already facing, which is the
      // same choice the driving code makes on every frame. Without this
      // the car spins on the spot when you take the wheel.
      let along = onRoad.bearing;
      if(Math.abs(turnTowards(carDir, along)) > 90) along = (along + 180) % 360;
      carDir = along;
    } else {
      setStatus("Zoom in so the roads load, then drive.", true);
    }
    $("total").textContent = "0.00 km driven";
    playing = true;
    CarSound.start();
    lastFrame = performance.now();
    requestAnimationFrame(frame);
  } else {
    $("bar").style.width = "0%";
    reset();
  }
}

function press(key, on){
  if(held[key] === on) return;        // keydown repeats are not new actions
  held[key] = on;
  logAction("input", { f:"throttle", b:"brake", l:"left", r:"right" }[key]
                      + (on ? " down" : " up"));
  showGlow();
}

/* The halo behind the wheel carries two readings at once: colour for
   what the car is being asked to do, brightness for how fast it is
   going. A crawl barely lifts it off the panel; at the speed you set on
   the slider it is at full strength. Brake wins when both are down,
   which is also how the car behaves. */
let shownGlow = -1;

function toggleSettings(open){
  if(open !== !$("settingsPop").hidden) logAction("settings", open ? "open" : "close");
  $("settingsPop").hidden = !open;
  $("settings").setAttribute("aria-expanded", String(open));
}

function showGlow(){
  const glow  = $("wheelGlow");
  const top   = setSpeed();
  const brake = mode === "manual" && held.b;
  const lit   = mode === "manual" ? (held.f || held.b) : playing;
  const speed = mode === "manual" ? Math.abs(carSpeed) : (playing ? top : 0);

  glow.classList.toggle("stop", brake);
  glow.classList.toggle("go", lit && !brake);

  const level = lit
    ? 0.26 + 0.74 * Math.min(1, speed / Math.max(1, top))
    : 0;

  // Called every frame, so only touch the style when it has moved
  // enough to see. Style writes on every frame show up as stutter.
  if(Math.abs(level - shownGlow) < 0.02) return;
  shownGlow = level;
  glow.style.opacity   = level.toFixed(2);
  glow.style.transform = "scale(" + (0.9 + level * 0.22).toFixed(3) + ")";
}

function showWheel(){
  const el = $("wheel");
  el.style.transform = `rotate(${wheelAngle}deg)`;
  el.classList.toggle("turning", Math.abs(wheelAngle) > 4);
  el.setAttribute("aria-valuenow", Math.round(wheelAngle / WHEEL_MAX * 100));
}

/* Angle of the pointer around the middle of the wheel, clockwise from 12. */
function pointerAngle(e){
  const r = $("wheel").getBoundingClientRect();
  return Math.atan2(e.clientX - (r.left + r.width / 2),
                    (r.top + r.height / 2) - e.clientY) * 180 / Math.PI;
}

function wirePad(){
  const wheel = $("wheel");

  wheel.addEventListener("pointerdown", e => {
    if(mode !== "manual") return;   // the wheel is read-only while Nora drives
    e.preventDefault();
    dragging = true;
    // Track the change in angle rather than the raw angle, so grabbing
    // the rim anywhere works instead of snapping the wheel to your hand.
    dragStartPointer = pointerAngle(e);
    dragStartWheel   = wheelAngle;
    wheel.setPointerCapture(e.pointerId);
  });

  wheel.addEventListener("pointermove", e => {
    if(!dragging) return;
    const turned = turnTowards(dragStartPointer, pointerAngle(e));
    wheelAngle = Math.max(-WHEEL_MAX, Math.min(WHEEL_MAX, dragStartWheel + turned));
    showWheel();
  });

  const letGo = () => { dragging = false; };
  wheel.addEventListener("pointerup", letGo);
  wheel.addEventListener("pointercancel", letGo);

  const fromKey = e => ({
    ArrowUp:"f", ArrowDown:"b", ArrowLeft:"l", ArrowRight:"r",
    w:"f", s:"b", a:"l", d:"r", W:"f", S:"b", A:"l", D:"r"
  })[e.key];

  addEventListener("keydown", e => {
    const tag = e.target && e.target.tagName;
    if(tag === "INPUT" || tag === "TEXTAREA") return;   // typing, not driving
    const key = fromKey(e);
    if(!key || mode !== "manual") return;
    e.preventDefault();
    press(key, true);
  });
  addEventListener("keyup", e => {
    const key = fromKey(e);
    if(key) press(key, false);
  });
  addEventListener("blur", () => {
    dragging = false;
    Object.keys(held).forEach(k => press(k, false));
  });
}

/* How far the car has gone, whichever mode it is in: what the cost is
   worked out from, and what a changed rate has to be re-applied to. */
function distanceSoFar(){
  return mode === "manual" ? odometer : travelled;
}

function readRate(id, fallback){
  const value = Number($(id).value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function applyRates(){
  rateNora   = readRate("rateNora", rateNora);
  ratePetrol = readRate("ratePetrol", ratePetrol);
  updateCost(distanceSoFar());
}

function restoreRates(){
  for(const [id, fallback] of [["rateNora", 3.95], ["ratePetrol", 20.00]]){
    let value = fallback;
    try{
      const saved = Number(localStorage.getItem(id));
      if(Number.isFinite(saved) && saved >= 0) value = saved;
    }catch{ /* no storage here; the default stands */ }
    $(id).value = value;
  }
  applyRates();
}

function restoreVolume(){
  let pct = 60;
  try{
    const saved = Number(localStorage.getItem("volume"));
    if(Number.isFinite(saved) && saved >= 0 && saved <= 100) pct = saved;
  }catch{ /* no storage here; the default stands */ }
  $("volume").value = pct;
  $("volumeLabel").textContent = pct + "%";
  CarSound.setVolume(pct / 100);
}

function wireControls(){
  restoreVolume();
  restoreRates();
  $("modeRoute").addEventListener("click", () => setMode("route"));
  $("modeManual").addEventListener("click", () => setMode("manual"));
  wirePad();

  $("build").addEventListener("click", buildRoute);
  $("play").addEventListener("click", () => playing ? stop() : play());
  $("reset").addEventListener("click", reset);

  $("speed").addEventListener("input", e => {
    $("speedLabel").textContent = e.target.value + " km/h";
  });
  $("zoom").addEventListener("input", e => {
    $("zoomLabel").textContent = e.target.value;
    draw();
  });

  ["rateNora", "ratePetrol"].forEach(id => {
    $(id).addEventListener("input", applyRates);
    $(id).addEventListener("change", () => {
      applyRates();
      $(id).value = id === "rateNora" ? rateNora : ratePetrol;   // reject junk
      try{ localStorage.setItem(id, $(id).value); }catch{ /* fine without it */ }
      logAction("rate", (id === "rateNora" ? "Nora" : "petrol")
                        + " Rs " + $(id).value + "/km");
    });
  });

  $("speed").addEventListener("change", e =>
    logAction("settings", "speed " + e.target.value + " km/h"));
  $("zoom").addEventListener("change", e =>
    logAction("settings", "zoom " + e.target.value));
  $("volume").addEventListener("change", e =>
    logAction("settings", "sound " + e.target.value + "%"));

  $("volume").addEventListener("input", e => {
    const pct = Number(e.target.value);
    $("volumeLabel").textContent = pct + "%";
    CarSound.setVolume(pct / 100);
    try{ localStorage.setItem("volume", pct); }catch{ /* fine without it */ }
  });

  ["from", "to"].forEach(id => {
    $(id).addEventListener("keydown", e => { if(e.key === "Enter") buildRoute(); });
    // Typing over a picked point makes it an address again.
    $(id).addEventListener("input", () => forgetPick(id));
  });

  $("settings").addEventListener("click", e => {
    e.stopPropagation();          // the outside-click handler is next
    toggleSettings($("settingsPop").hidden);
  });
  $("settingsClose").addEventListener("click", () => toggleSettings(false));
  $("settingsPop").addEventListener("click", e => e.stopPropagation());
  addEventListener("click", () => toggleSettings(false));

  $("pinFrom").addEventListener("click", () => openPicker("from"));
  $("pinTo").addEventListener("click", () => openPicker("to"));
  $("pickClose").addEventListener("click", closePicker);
  $("pickUse").addEventListener("click", usePick);
  $("picker").addEventListener("click", e => {
    if(e.target === $("picker")) closePicker();   // the backdrop, not the sheet
  });
  $("logClose").addEventListener("click", closeLog);
  $("logRefresh").addEventListener("click", openLog);
  $("logSheet").addEventListener("click", e => {
    if(e.target === $("logSheet")) closeLog();
  });

  addEventListener("keydown", watchForLog);
  addEventListener("keydown", e => {
    if(e.key !== "Escape") return;
    if(!$("logSheet").hidden) closeLog();
    else if(!$("picker").hidden) closePicker();
    else toggleSettings(false);
  });
}

/* ------------------------------------------------------------------ *
 *  The action log. Lines go to the main process, which owns the file;
 *  this side cannot reach the disk. Reading it back is deliberately
 *  undiscoverable: type "log" anywhere outside a text field.
 * ------------------------------------------------------------------ */

function logAction(what, detail){
  if(!window.desktop || !window.desktop.log) return;
  const stamp = new Date().toISOString();
  window.desktop.log(stamp + "  " + what + (detail ? "  " + detail : ""));
}

async function openLog(){
  $("logText").textContent = "Reading\u2026";
  $("logPath").textContent = "";
  $("logSheet").hidden = false;

  if(!window.desktop || !window.desktop.readLog){
    $("logText").textContent = "No log here: the page is running outside the app.";
    return;
  }
  const { path, text, lines } = await window.desktop.readLog();
  $("logText").textContent = text || "Nothing logged yet.";
  $("logPath").textContent = lines ? lines + " lines \u00b7 " + path : path;
  $("logText").scrollTop = $("logText").scrollHeight;
}

function closeLog(){
  $("logSheet").hidden = true;
}

/* The word "log", typed a letter at a time, with nothing focused. */
let typedKeys = "";

function watchForLog(e){
  const tag = e.target && e.target.tagName;
  if(tag === "INPUT" || tag === "TEXTAREA") return;
  if(e.metaKey || e.ctrlKey || e.altKey) return;
  if(!e.key || e.key.length !== 1) return;

  typedKeys = (typedKeys + e.key.toLowerCase()).slice(-3);
  if(typedKeys === "log"){
    typedKeys = "";
    if($("logSheet").hidden) openLog();
  }
}

let lastReadout = 0;
let lastStatus = null;
function setStatus(msg, isError){
  if(msg === lastStatus) return;
  lastStatus = msg;
  const el = $("status");
  el.textContent = msg;
  el.classList.toggle("error", !!isError);
}

/* ------------------------------------------------------------------ *
 *  The sound of the car. Nora is electric, so there is no engine to
 *  record, and nothing here is a sample: an EV's voice is a handful of
 *  pure tones over filtered noise, which synthesises cleanly and keeps
 *  the app as self-contained as the rest of it.
 *
 *  Tuned by ear towards a Model 3: the whine is the whole character,
 *  high and clean and rising without a break, with almost no low end
 *  under it and the tyres carrying everything else. A Tesla's cabin is
 *  quiet enough that road noise is the thing people complain about.
 *
 *  What an electric car actually sounds like from the driver's seat:
 *
 *    whine    the motor and its reduction gear. Near-pure tones, not a
 *             buzz. The partials sit at slightly off-integer ratios,
 *             because one source is electrical and the other mechanical,
 *             and that mismatch is what stops it sounding like a test
 *             tone. Frequency tracks wheel speed, so it climbs and
 *             climbs; there are no gears to interrupt it.
 *    rumble   body and suspension. Brown noise, felt more than heard.
 *    road     tyres on tarmac. Pink noise, and the loudest thing at any
 *             real speed. White noise would hiss like rain.
 *    wind     high, quiet, and rising faster than everything else.
 *
 *  The audio context cannot start until the user has clicked something,
 *  which is why start() is called from the drive controls and not here.
 * ------------------------------------------------------------------ */

window.CarSound = (function(){

  const CEILING = 0.42;    // gain at full volume
  const GLIDE   = 0.07;    // seconds for a parameter to chase its target

  /* Motor and gear partials. Ratios are deliberately not whole numbers:
     the small beats between them are most of what sounds mechanical. */
  const PARTIALS = [
    { ratio: 1,     gain: 0.40 },
    { ratio: 2.01,  gain: 0.36 },   // the ring that reads as electric
    { ratio: 3.02,  gain: 0.11 },
    { ratio: 4.03,  gain: 0.06 },   // turbine shimmer
  ];

  let ctx = null;
  let nodes = null;
  let running = false;
  let level = 0.6;         // 0 to 1, straight from the slider

  /* Pink noise, by Paul Kellet's filter. Equal energy per octave, which
     is how road and wind noise actually sit in the ear. */
  function pinkBuffer(seconds){
    const frames = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for(let i = 0; i < frames; i++){
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    return buf;
  }

  /* Brown noise: pink again, tilted further down. This is the body. */
  function brownBuffer(seconds){
    const frames = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for(let i = 0; i < frames; i++){
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;      // leaky integrator
      d[i] = last * 3.5;
    }
    return buf;
  }

  function noiseLayer(master, buffer, filterType, freq, q){
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(master);
    src.start();
    return { filter, gain };
  }

  function build(){
    const master = ctx.createGain();
    master.gain.value = 0;

    /* Takes the edge off the top of the whine's upper partials. */
    const soften = ctx.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.value = 6800;   // tapers the upper partials at speed
    soften.Q.value = 0.6;

    const squash = ctx.createDynamicsCompressor();
    squash.threshold.value = -20;
    squash.ratio.value = 3;
    squash.attack.value = 0.02;
    squash.release.value = 0.3;

    master.connect(soften).connect(squash).connect(ctx.destination);

    /* ---- whine: sine partials, one shared gain ---- */
    const whineGain = ctx.createGain();
    whineGain.gain.value = 0;
    whineGain.connect(master);

    /* A shallow vibrato keeps the tones from sounding synthetic. It is
       wired to detune, in cents, so every partial wavers together. */
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 5.2;
    const vibratoDepth = ctx.createGain();
    vibratoDepth.gain.value = 7;      // cents
    vibrato.connect(vibratoDepth);
    vibrato.start();

    const partials = PARTIALS.map(p => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const gain = ctx.createGain();
      gain.gain.value = p.gain;
      vibratoDepth.connect(osc.detune);
      osc.connect(gain).connect(whineGain);
      osc.start();
      return { osc, ratio: p.ratio };
    });

    /* ---- the three noise beds ---- */
    const pink  = pinkBuffer(3);
    const brown = brownBuffer(3);

    const rumble = noiseLayer(master, brown, "lowpass",  140, 0.8);
    const road   = noiseLayer(master, pink,  "bandpass", 500, 0.5);
    const wind   = noiseLayer(master, pink,  "highpass", 900, 0.6);

    /* Road noise is never perfectly steady; a slow drift over the top
       of it reads as surface changing under the wheels. */
    const drift = ctx.createOscillator();
    drift.frequency.value = 0.27;
    const driftDepth = ctx.createGain();
    driftDepth.gain.value = 0.012;
    drift.connect(driftDepth).connect(road.gain.gain);
    drift.start();

    return { master, whineGain, partials, rumble, road, wind };
  }

  /* Ramp rather than jump: a stepped gain or frequency clicks. */
  const glide = (param, value, when = GLIDE) =>
    param.setTargetAtTime(value, ctx.currentTime, when);

  function start(){
    if(!ctx){
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if(!Ctx) return;              // no audio here; drive on in silence
      ctx = new Ctx();
      nodes = build();
    }
    if(ctx.state === "suspended") ctx.resume();
    running = true;
    glide(nodes.master.gain, CEILING * level, 0.25);
  }

  function stop(){
    running = false;
    if(!ctx) return;
    glide(nodes.master.gain, 0, 0.15);
  }

  /* Called every frame with metres per second; sign carries reverse. */
  function update(speed, topSpeed, throttle, braking){
    if(!ctx || !running || level === 0) return;

    const kmh    = Math.abs(speed) * 3.6;
    const load   = Math.min(1, kmh / Math.max(1, topSpeed * 3.6));
    const moving = kmh > 0.4;

    /* A single reduction gear spinning at nine times wheel speed puts
       the mesh frequency high and keeps it climbing without a break:
       roughly 850 Hz at 30 km/h, 2.5 kHz at 100. That unbroken climb is
       the sound people recognise. Reverse runs it lower. */
    const base = (120 + kmh * 24) * (speed < 0 ? 0.72 : 1);
    for(const p of nodes.partials){
      glide(p.osc.frequency, Math.min(9000, base * p.ratio));
    }

    /* Loud enough to place the car, quiet enough to sit under the tyres.
       Under power the motor pulls harder; regen gives braking its own
       note rather than a brake pad's scrape. */
    let whine = 0.010 + load * 0.050;
    if(throttle)     whine *= 1.35;   // it strains audibly under power
    else if(braking) whine *= 1.15;   // regen, not a brake pad
    else             whine *= 0.82;
    glide(nodes.whineGain.gain, moving ? whine : 0.004);

    /* Body and suspension, kept well down. There is no engine block
       here, and a Tesla has very little of this. */
    glide(nodes.rumble.filter.frequency, 110 + kmh * 1.8);
    glide(nodes.rumble.gain.gain, moving ? 0.03 + load * 0.06 : 0.005);

    /* Tyres. With nothing else filling the cabin these dominate, which
       is exactly the complaint owners have. */
    glide(nodes.road.filter.frequency, 380 + kmh * 11);
    glide(nodes.road.gain.gain, Math.pow(load, 1.15) * 0.30);

    /* Wind arrives late and climbs fast. */
    glide(nodes.wind.filter.frequency, 800 + kmh * 22);
    glide(nodes.wind.gain.gain, Math.pow(load, 2) * 0.10);
  }

  /* Volume runs on a curve, not a straight line: halfway up a linear
     gain slider barely sounds like half as loud. */
  function setVolume(next){
    level = Math.pow(Math.min(1, Math.max(0, next)), 1.6);
    if(!ctx) return;
    glide(nodes.master.gain, running ? CEILING * level : 0, 0.12);
  }

  return {
    start, stop, update, setVolume,
    get volume(){ return level; },
  };

})();

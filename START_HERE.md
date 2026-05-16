# START HERE — Moto Velocity

## Purpose

This document is the resume point for future work on Moto Velocity. Keep it current after meaningful changes.

The goal is self-improving software: each session should leave behind clearer structure, fewer repeated mistakes, and more actionable next steps.

## Project Direction

Build a web-based arcade motorcycle racer inspired by classic arcade racing feel and off-road rally atmosphere.

Core experience:

```text
fast first-person motorcycle racing + simple low-resource visuals + off-road rally atmosphere
```

Guiding player feeling:

```text
I can go faster if I learn the line.
```

See `AGENTS.md` for broader collaboration, engineering, and product guidance.

## Current Status

Moto Velocity has been converted from a single-file CDN prototype into a Vite + Three.js project.

Original prototype snapshot:

```text
legacy/index.html
```

Active app entry points:

```text
index.html
src/main.js
```

Run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Check:

```bash
npm run check
```

Validation so far:
- `npm install` succeeds.
- `npm run check` succeeds.
- `npm run build` succeeds.
- Bundle-size warning is expected because Three.js is included.

## Current Features

- First-person motorcycle/cockpit view
- Transparent racing windscreen
- Smooth ribbon-style road
- Multi-track system
- Desert Test 1
- Waterfront Sprint 1
- Track switching with `1` and `2`
- Basic opponents
- Speed effects and dust
- HUD, boost bar, tach bars, lap/elevation display
- Countdown start, lap timer, best lap, finish state, and restart flow
- Position-ish readout against the current opponent pack
- Cockpit lean
- Crash/recovery state
- Grip-risk model
- Off-road penalty
- Near-crash warning
- Basic WebAudio:
  - engine tone
  - wind noise
  - skid/grip-limit sound
  - crash hit
- Low-cost off-road rally atmosphere pass:
  - sky gradient / warmer horizon
  - sun haze
  - tire marks and road flecks
  - shoulder color variation
  - terrain banks close to road
  - scale-aware fence/flag lines
  - scale-aware trackside posts/signboards
  - a few properly sized rally arches

## Current Module Structure

```text
src/
  main.js
  game.js
  raceSession.js
  tuning.js
  renderer.js
  input.js
  materials.js
  tracks/
    trackSystem.js
    desertTest1.js
    waterfrontSprint1.js
  vehicle/
    bikePhysics.js
    cockpit.js
  world/
    roadRibbon.js
    scenery.js
  ai/
    opponent.js
  effects/
    audio.js
    speedEffects.js
  ui/
    hud.js
```

## Important Lessons Learned

### 1. Do not anchor gameplay/track objects at constant relative distance

Bug seen multiple times:

```text
object appears to stay 30 feet ahead and the player chases it forever
```

Cause:
- Object was placed at a constant offset ahead of the rider each frame.

Correct approach:
- Track objects use absolute course distance + lateral offset.
- Each frame converts absolute course distance to rider-relative offset.

Rule:

```text
Track objects belong to the course, not to the camera.
```

### 2. Keep a rough world scale

Use this convention:

```text
1 world unit ≈ 1 meter
```

Approximate scale targets:
- Motorcycle length: 2–2.3 units
- Road width: 8–10 units
- Rider/camera height: about 1.5–2.5 units depending on cockpit framing
- Roadside sign: 1–2 units tall
- Fence: 1–1.3 units tall
- Rally arch: 5–6 units tall, 12–14 units wide
- Cone/post: 0.5–1.2 units tall

### 3. Avoid random scenery that pretends to be track objects

Far scenery may scroll/recycle loosely.

Trackside gameplay/visual reference objects should be road-relative:
- distance along track
- lateral offset
- elevation from road sample

### 4. Audio is basic but useful

Basic audio is complete. Future audio should be treated as a polish pass, not blocking core gameplay.

Future better audio ideas:
- richer engine layers
- gear shift sound
- gravel/tire surface noise
- boost whoosh
- opponent pass-by sounds
- better crash/skid variation
- volume/mute controls

## Current Known Weaknesses

### Gameplay / Physics

- Crash/grip model exists but needs tuning by feel.
- Braking zones are still not strongly designed into tracks.
- Current tracks are still mostly mathematical curves, not authored race experiences.
- Opponents are basic moving obstacles, not real racers with racing lines.

### Visuals

- Visual style is improving and now has a first low-cost off-road rally atmosphere pass.
- Continue improving environmental storytelling with authored/scaled placement:
  - better rally branding
  - more intentional fence lines
  - dust tuned by track/section
  - mud/gravel variation by surface
  - tire marks that reflect racing line
  - stronger terrain silhouettes
  - higher-quality trackside clutter with proper scale

### Game Loop

Now present:
- countdown start
- lap timer
- best lap
- finish screen
- restart flow
- position-ish HUD readout

Still missing:
- track select screen
- real race position based on completed opponent laps

## Immediate Next Step

Tune the centralized risky-simcade feel values in `src/tuning.js` by feel.

Recommended checks:
- Holding throttle through curves should become risky, not always safe.
- Holding hard left/right with throttle should create grip warning and eventual crash.
- Off-road at speed should slow and destabilize the bike.
- Braking before sharp turns should become useful.
- Crashes should feel fair, not random.

Tuning principle:

```text
Punish reckless speed, not normal driving.
```

## Next System Milestone — Track Authoring

After grip/crash tuning, build a real track authoring system.

Current tracks are math functions. They are useful for prototyping but not enough for memorable racing.

Desired future format:

```js
[
  { type: "straight", length: 180 },
  { type: "sweep", direction: "left", radius: 120, angle: 50 },
  { type: "crest", length: 80, height: 8 },
  { type: "hairpin", direction: "right", radius: 45, angle: 120 }
]
```

This enables designed tracks instead of sine-wave tracks.

## Next Content Milestone — Rally Ridge 1

Build one proper rally-inspired off-road track.

Suggested name:

```text
Rally Ridge 1
```

Features:
- Gravel road
- Rolling hills
- Rally banners
- Muddy shoulders
- Dust clouds
- Roadside fences
- Checkpoint gates
- Big downhill straight
- Braking corner
- Crest/jump
- Tight final turn

Goal:

```text
one excellent track, not many mediocre tracks
```

## Future Gameplay Loop Features

After grip tuning and one designed track:
- Countdown start
- Lap timer
- Best lap
- Finish screen
- Restart
- Track select
- Race position

## What Not To Do Yet

Avoid these until the core racing loop is excellent:
- Multiplayer
- Huge asset pipeline
- Complex physics engine
- Full career mode
- Character customization
- Online leaderboards
- Mobile controls
- Procedural infinite world

These are distractions at the current stage.

## Quality Checklist Before Ending a Session

Before stopping work, update this file if anything meaningful changed.

Run:

```bash
npm run build
```

Then record:
- what changed
- what was validated
- any bugs observed
- next best step

## Latest Session Notes

- Converted project to Vite + modular Three.js structure.
- Preserved original prototype in `legacy/index.html`.
- Added crash, grip risk, off-road penalty, near-crash feedback, and basic WebAudio.
- Added visual polish: road flecks, sun haze, trackside posts/signboards, rally arches.
- Fixed repeated “chase-the-sign” bug by anchoring track objects to absolute course distance.
- Added off-road rally atmosphere pass: sky gradient, shoulder patches, terrain banks, fence/flag lines, and lighter road flecks.
- Removed large transparent haze/dust sheet planes after they appeared to cause cockpit/body moiré/ripple artifacts.
- Removed continuous tire-mark ribbons and the windscreen backface rim overlay to reduce z-fighting/transparent sorting artifacts on road and motorcycle body.
- After artifact was confirmed only on motorcycle body and road, likely cause was narrowed to shadow-map acne/moiré. Disabled shadows on cockpit meshes and dynamic road ribbons, and added sun shadow bias/normalBias.
- Added safe cockpit detail that does not rely on real-time shadows: fairing stripe, panel strips, gauge frame, LEDs, brake levers, and windscreen side frame.
- Added sparse lifted tire marks instead of continuous coplanar tire ribbons.
- Added skid/off-road dust bursts tied to grip risk for better near-crash feedback.
- Converted road flecks/shoulder patches to absolute-distance placement so they do not become screen-fixed artifacts.
- `npm run build` succeeds.

Next best step:

```text
Tune crash/grip model by feel, then begin authored track system.
```

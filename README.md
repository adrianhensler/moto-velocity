# Moto Velocity

Moto Velocity is a browser-based arcade motorcycle racing prototype built with Vite and Three.js.

It focuses on fast first-person riding, readable low-cost 3D visuals, grip-risk feedback, off-road slowdown, boost, basic opponents, and quick track switching.

## How it was created

This project was created through an AI-assisted iterative coding workflow with Adrian Hensler and Dash, using the pi coding-agent environment. It began as a single-file Three.js browser prototype, then was refactored into a modular Vite project with separate systems for rendering, input, tracks, vehicle physics, cockpit visuals, scenery, effects, audio, AI opponents, and HUD.

The current version is still an early prototype. The next design focus is tuning the crash/grip model so reckless speed is punished without making normal driving feel unfair.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Controls

- `W` / `↑`: throttle
- `S` / `↓`: brake
- `A` / `D` or `←` / `→`: lean
- `Space`: boost
- `1` / `2`: switch tracks

## Current features

- First-person motorcycle/cockpit view
- Smooth ribbon-style road
- Desert and waterfront prototype tracks
- Basic opponent riders
- Speed effects, dust, and near-crash feedback
- Grip-risk and crash/recovery model
- Off-road penalty
- Basic WebAudio engine, wind, skid, and crash sounds
- HUD with speed, gear, lap, elevation, boost, and tach bars

## Deployment

The repository includes a GitHub Pages workflow that builds the Vite app and publishes `dist/` from the `main` branch.

For GitHub Pages project hosting, `vite.config.js` sets the base path to `/moto-velocity/`.

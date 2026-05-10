# DASH_WORKLOG — Moto Velocity

Purpose: lightweight monitoring so Adrian and Dash do not lose track of the current work.

This file is intentionally shorter than `START_HERE.md`. Use it to record:

- current focus
- what changed this session
- validation status
- next concrete action
- drift warnings

`START_HERE.md` remains the fuller project resume document.

---

## Current focus

**Tune the crash/grip model by feel.**

Goal:

> Punish reckless speed, not normal driving.

Recommended checks:

- Holding throttle through curves should become risky, not always safe.
- Holding hard left/right with throttle should create grip warning and eventual crash.
- Off-road at speed should slow and destabilize the bike.
- Braking before sharp turns should become useful.
- Crashes should feel fair, not random.

## Current status snapshot

Date: 2026-05-10

Observed project state:

- Vite + Three.js browser project.
- Active source is under `src/`.
- Original prototype is preserved at `legacy/index.html`.
- `START_HERE.md` already contains a good resume point.
- Project was not under git at session start.
- GitHub CLI is authenticated as `adrianhensler` on this machine/session.

Validation:

- `npm run build` succeeds.
- Vite reports expected large chunk warning due to Three.js bundle size.

## Monitoring rule

At the end of each meaningful work session, update this file with:

1. What changed.
2. What was validated.
3. What is broken or uncertain.
4. The next best action.

If `START_HERE.md` becomes stale, update it too.

## Drift guard

Do not start these yet:

- GitHub publishing workflow
- track authoring system
- new tracks
- visual polish pass
- UI screens
- multiplayer / career / leaderboard ideas

Until crash/grip tuning has been tested by feel, those are likely distractions.

## Session log

### 2026-05-10 — Dash monitoring baseline

Changed:

- Added `.gitignore` for dependencies, build output, local env/secrets, logs, and editor noise.
- Added this `DASH_WORKLOG.md` monitoring file.
- Prepared project for local git tracking.

Validated:

- `npm run build` succeeds.

Open issue:

- Project is not on GitHub yet.
- GitHub auth blocker is cleared; next publishing decision is repo name/visibility/static host.

Next best action:

```text
Run the game locally, test crash/grip feel, then adjust `src/vehicle/bikePhysics.js` and any related feedback thresholds in small steps.
```

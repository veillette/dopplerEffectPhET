# Doppler Effect Simulation

An interactive simulation of the Doppler Effect, built with [SceneryStack](https://scenerystack.org/).
Explore how the frequency of sound waves changes when there is relative motion between a sound source and
an observer.

[![Interactive Doppler Effect simulation showing sound waves propagating from a moving green source to a purple observer. The visualization demonstrates frequency shifts with circular wave patterns and includes waveform displays showing the emitted and observed frequencies.](./assets/screenshot.png)](https://OpenPhysics.github.io/DopplerEffect)

[Live Demo](https://OpenPhysics.github.io/DopplerEffect)

## Features

- Interactive source and observer movement
- Real-time visualization of sound waves
- Live frequency shift calculations
- Waveform displays for both emitted and observed sound
- Velocity vector visualization
- Multiple preset scenarios
- Adjustable sound speed and frequency
- Numerical values for frequency, speed, and distance
- Pause/Resume functionality
- Keyboard controls (arrow keys or WASD)
- Projector mode and interactive highlights
- English and French localization
- Installable progressive web app (PWA)

## Controls

### Mouse Controls

- Click and drag the green source or purple observer to move them and control their velocity
- Drag the microphone icon to listen to the sound

### Keyboard Controls

- `S`: Select source
- `O`: Select observer
- Arrow keys or `W`/`A`/`S`/`D`: Move selected object
- Space: Pause/Resume simulation
- `R`: Reset simulation
- `T`: Toggle motion trails
- `M`: Toggle microphone
- `H`: Toggle help display
- `+/-`: Adjust emitted frequency
- `,/.`: Adjust sound speed
- `0-6`: Load preset scenarios
  - `0`: Free Play
  - `1`: Source approaching observer
  - `2`: Source receding from observer
  - `3`: Observer approaching source
  - `4`: Observer receding from source
  - `5`: Same direction motion
  - `6`: Perpendicular motion

## Physics Model

The simulation uses the Doppler Effect formula:

```
f' = f * (v - vₒ) / (v - vₛ)
```

where:

- f' is the observed frequency
- f is the emitted frequency
- v is the speed of sound
- vₒ is the observer's velocity component along the line of sight
- vₛ is the source's velocity component along the line of sight

## Quick Start

```bash
npm install
npm run icons    # regenerate PWA icons and favicon from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run check` | TypeScript type check (`src` + `scripts`) |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PWA icons from `public/icons/icon.svg` |
| `npm run clean` | Remove `dist/` |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^6 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.4 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^1 | PWA + service worker |

## License

MIT

## Contributing

See [OpenPhysics contributing guidelines](https://github.com/OpenPhysics/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.

## Acknowledgments

- Built with [SceneryStack](https://scenerystack.org/)
- Inspired by [PhET](https://phet.colorado.edu) Interactive Simulations

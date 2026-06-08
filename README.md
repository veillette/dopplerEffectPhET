# Doppler Effect Simulation

An interactive simulation of the Doppler Effect, built with [SceneryStack](https://github.com/sceneryStack). This simulation allows users to explore how the frequency of sound waves changes when there is relative motion between a sound source and an observer.

[![Interactive Doppler Effect simulation showing sound waves propagating from a moving green source to a purple observer. The visualization demonstrates frequency shifts with circular wave patterns and includes waveform displays showing the emitted and observed frequencies.](./assets/screenshot.png)](https://veillette.github.io/dopplerEffectPhET)

🎮 [Live Demo](https://veillette.github.io/dopplerEffectPhET) 🌐

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
- Extendable language support (English and French)
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

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/veillette/dopplerEffectPhET.git
cd dopplerEffectPhET
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Build for production:

```bash
npm run build
```

The production build outputs to `dist/` and includes the PWA service worker and web app manifest.

### Development Scripts

- `npm start` / `npm run dev`: Start the Vite development server
- `npm run build`: Type-check and build for production
- `npm run preview`: Preview the production build locally
- `npm run lint`: Lint with [Biome](https://biomejs.dev/)
- `npm run format`: Format code with Biome
- `npm run fix`: Auto-fix lint and format issues with Biome
- `npm run check`: Type-check TypeScript (app and scripts)
- `npm run icons`: Regenerate PWA icons and favicon from `public/icons/icon.svg`
- `npm run clean`: Remove the `dist/` directory

### Continuous Integration

Pull requests and pushes to `main` run linting, type checking, and a production build via GitHub Actions. Successful merges to `main` are deployed automatically to GitHub Pages.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [SceneryStack](https://github.com/sceneryStack)
- Inspired by [PhET](https://phet.colorado.edu) Interactive Simulations

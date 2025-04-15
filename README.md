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
- Keyboard controls
- Projector mode
- Extendable language support
- Produce a single HTML file for easy distribution

## Controls

### Mouse Controls

- Click and drag the green source or purple observer to move them and control their velocity
- Drag the microphone icon to listen to the sound

### Keyboard Controls

- `S`: Select source
- `O`: Select observer
- Arrow keys: Move selected object
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

- Node.js (v18 or higher)
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

### Development Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm run fix`: Fix linting and formatting issues
- `npm run check`: Type-check TypeScript code
- `npm run serve`: Serve production build
- `npm run watch`: Watch TypeScript files
- `npm run clean`: Clean build directory

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [SceneryStack](https://github.com/sceneryStack)
- Inspired by [PhET](https://phet.colorado.edu) Interactive Simulations

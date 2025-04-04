# Doppler Effect Simulation

An interactive simulation of the Doppler Effect, built with SceneryStack. This simulation allows users to explore how the frequency of sound waves changes when there is relative motion between a sound source and an observer.

## Features

- Interactive source and observer movement
- Real-time visualization of sound waves
- Live frequency shift calculations
- Waveform displays for both emitted and observed sound
- Velocity vector visualization
- Multiple preset scenarios
- Adjustable sound speed and frequency
- Pause/Resume functionality
- Keyboard controls

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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

## Controls

### Mouse Controls

- Click and drag the red source or green observer to move them
- The connecting line shows the distance between source and observer

### Keyboard Controls

- `S`: Select source
- `O`: Select observer
- Arrow keys: Move selected object
- Space: Pause/Resume simulation
- `R`: Reset simulation
- `H`: Toggle help display
- `+/-`: Adjust emitted frequency
- `,/.`: Adjust sound speed
- `1-4`: Load preset scenarios

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

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [SceneryStack](https://github.com/sceneryStack)
- Inspired by PhET Interactive Simulations

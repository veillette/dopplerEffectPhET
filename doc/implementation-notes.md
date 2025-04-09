# Implementation Notes - Doppler Effect Simulation

## Architecture Overview

The Doppler Effect simulation is structured using a Model-View pattern, with clear separation of concerns between the physics simulation and its visual representation. We have attempted to maintain independent physics calculations that are not tied to specific visualization approaches.

### High-Level Architecture

The simulation follows a modular architecture:

- **Model Layer (`/model`)**: Contains all physics simulation logic, calculations, and state
- **View Layer (`/view`)**: Handles all visual representation and user interactions

Data flows primarily from Model → View, with user interactions in the View triggering updates to the Model. We use the AXON property system (from PhET/SceneryStack libraries) to create observable properties that automatically notify components of changes.

### Model-View Transform

A coordinate transformation system maps between model space (physical units) and view space (screen units). This abstraction allows the physics model to work in physically meaningful units (meters, seconds) while the view handles screen-specific units (view coordinates). We have chosen to place the physical origin at the center of the layout bounds and selected an inverted Y-axis in screen coordinates. We use an isometric scaling along the x and the y that is specified in SCALE.MODEL_VIEW.

## Model Components

### Core Model Design

The `SimModel` class serves as the central coordinator, connecting specialized components:

### Component Specialization

Each model component has a single responsibility:

1. **MovableObject**: Encapsulates position and velocity for source and observer
2. **WaveGenerator**: Manages wave creation and propagation
3. **WaveformManager**: Handles sound waveform data for visualization
4. **DopplerCalculator**: Performs Doppler effect physics calculations

### Physics Simulation Approach

- **Wave Propagation**: Circular waves expanding at the speed of sound
- **Doppler Calculation**: Classical Doppler formula implemented in `DopplerCalculator`
- **Trail System**: Position history maintained with age and count constraints

Physical quantities include explicit unit documentation:

```typescript
// Sound speed in meters per second (m/s)
this.soundSpeedProperty = new NumberProperty(PHYSICS.SOUND_SPEED);

// Position in meters (m)
this.sourcePositionProperty = this.source.positionProperty;

// Frequency in Hertz (Hz)
this.emittedFrequencyProperty = new NumberProperty(PHYSICS.EMITTED_FREQ);
```

The majority of the Physics constants have been hoisted in `SimConstants.ts`

We use a step function with scaled time:

```typescript
public step(dt: number, force: boolean = false): void {
  if (!this.playProperty.value && !force) return;

  // Apply time scaling
  const modelDt = dt * SCALE.TIME * this.getTimeSpeedValue();

  // Update simulation time
  this.simulationTimeProperty.value += modelDt;

  // Update components
  this.source.updatePosition(modelDt);
  this.observer.updatePosition(modelDt);
  // Additional updates...
}
```

### Model-View Communication with AXON Properties

The simulation uses PhET's AXON property system extensively. Observable properties are defined in model classes and components subscribe to property changes via `link()` and
`lazyLink()`. For instance, we use AXON properties to update the values:

```typescript
public readonly scenarioProperty: EnumerationProperty<Scenario>;
```

Property changes trigger specific updates through AXON linking:

```typescript
this.scenarioProperty.lazyLink((scenario) => {
  this.applyScenario(scenario);
});
```

For the Waves components, we have created an ObservableArray. In some cases, we resorted to `DerivedProperty` for values that depend on multiple properties.

## View Components

### SimScreenView as Coordinator

The `SimScreenView` coordinates all visual elements and user interactions. Visual elements are organized in layers for proper stacking:

```typescript
[this.waveLayer, this.objectLayer, this.graphLayer, this.controlLayer].forEach(
  (layer) => this.addChild(layer),
);
```

Specialized manager classes handle specific visualization aspects:

1. **WaveManager**: Visualizes propagating waves
2. **TrailManager**: Renders position history trails
3. **DragHandlerManager**: Manages user drag interactions
4. **KeyboardHandlerManager**: Processes keyboard controls

### Color Scheme

The simulation uses a carefully selected color scheme to avoid confusion with Doppler shift terminology:

- **Source**: Green (to avoid confusion with redshift)
- **Observer**: Purple (to avoid confusion with blueshift)
- **Velocity Arrows**: Match their respective objects (green for source, purple for observer)
- **Wave Visualization**: Neutral colors that don't conflict with the source/observer colors

This color scheme helps users distinguish between the source and observer while avoiding confusion with the blue shift and red shift phenomena in the Doppler effect.

### Performance Optimizations

We have attempted to optimize this simulation, but trying to reduce its footprint.

- Waves are removed after exceeding maximum age
- For the motion trails, it is both age and size constraints
- For the graphs, there is a fixed-size buffer for waveform data

Note that no dispose functions have been used, which should be addressed.

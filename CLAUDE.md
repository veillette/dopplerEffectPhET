# CLAUDE.md — Doppler Effect

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

Interactive Doppler effect simulation: drag source and observer, visualize circular wave fronts, live frequency shift, and waveform displays.

## Key files

| Area | Location |
|---|---|
| Screen | `src/screen-name/SimScreen.ts` |
| Model | `SimModel.ts`, `DopplerCalculator.ts`, `MovableObject.ts`, `WaveGenerator.ts`, `WaveformManager.ts` |
| View | `SimScreenView.ts`, `WaveManager.ts`, `MoveableObjectView.ts`, `GraphDisplayNode.ts`, `MicrophoneNode.ts` |
| Input | `DragHandlerManager.ts`, `KeyboardHandlerManager.ts` |
| Colors | `DopplerEffectColors.ts`, `DopplerEffectNamespace.ts` |

## Physics

Observed frequency: `f' = f * (v - vₒ) / (v - vₛ)` where `vₒ` and `vₛ` are velocity components along the line of sight.

## Interaction

- Keyboard presets `0`–`6` load scenario configurations
- Microphone node for listening to observed frequency
- Motion trails toggle; projector mode supported

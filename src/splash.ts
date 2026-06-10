/**
 * splash.ts
 *
 * Shows the SceneryStack splash screen while the simulation loads.
 *
 * Chain position: init.ts → assert.ts → [here] splash.ts → brand.ts
 */

// assert.ts (and transitively init.ts) must run before the splash screen
import "./assert.js";

// Side-effect import: renders the splash screen immediately
import "scenerystack/splash";

/**
 * assert.ts
 *
 * Enables SceneryStack runtime assertions.
 *
 * Chain position: init.ts → [here] assert.ts → splash.ts → brand.ts
 *
 * Assertions help catch programming errors during development and are
 * stripped from SceneryStack's production bundle. To disable assertions
 * for your own assert() calls in production, comment out enableAssert().
 */

// init.ts must run before assertions are enabled (chain order enforced by import)
import "./init.js";

import { enableAssert } from "scenerystack/assert";

enableAssert();

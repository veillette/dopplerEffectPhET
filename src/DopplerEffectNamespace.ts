/**
 * DopplerEffectNamespace.ts
 *
 * The SceneryStack Namespace for this simulation. It is used as the first
 * argument to ProfileColorProperty (so color names are scoped to this sim)
 * and optionally for registering objects with the PhET-iO API.
 *
 * ── How to customize ─────────────────────────────────────────────────────────
 * Change the string argument to match your simulation's identifier, using the
 * same kebab-case name as in package.json and src/init.ts.
 */
import { Namespace } from "scenerystack/phet-core";

const DopplerEffectNamespace = new Namespace("doppler-effect");

export default DopplerEffectNamespace;

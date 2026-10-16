import assert from "node:assert/strict";
import { defaults } from "../src/chemistry";
import {
  interaction,
  inducedResponse,
  respondedSeparation,
} from "../src/interactions";
Object.assign(globalThis, { matchMedia: () => ({ matches: true }) });
const ion = defaults("ion");
assert.equal(
  respondedSeparation({ ...ion, charge: 3 }),
  ion.distance,
  "Held distance must not change with charge",
);
assert(
  interaction({ ...ion, charge: 3 }) > interaction(ion),
  "Higher ionic charge increases display pull",
);
assert(
  respondedSeparation({ ...ion, released: true, charge: 3 }) <
    respondedSeparation({ ...ion, released: true, charge: 1 }),
  "Released water approaches more at higher charge",
);
assert(
  interaction({ ...ion, radius: 0.4 }) > interaction({ ...ion, radius: 1 }),
  "Smaller ion at equal surface gap increases pull",
);
for (const mode of ["ion", "dipole", "hydrogen", "dispersion"] as const) {
  const s = defaults(mode);
  assert(
    Math.abs(interaction({ ...s, distance: 6 })) <
      Math.abs(interaction({ ...s, distance: 3 })),
    "Farther separation reduces " + mode + " response",
  );
}
const dipole = defaults("dipole");
assert(
  interaction({ ...dipole, angle: 180 }) < 0,
  "Like ends produce repulsive cue",
);
assert(
  respondedSeparation({ ...dipole, released: true, angle: 180 }) >
    dipole.distance,
  "Released repulsive arrangement moves apart",
);
assert.equal(
  interaction({ ...dipole, sample: "bf3" }),
  0,
  "BF3 has no permanent dipole pull",
);
assert.equal(
  interaction({ ...defaults("hydrogen"), sample: "ether" }),
  0,
  "Ether cannot donate to itself",
);
assert(
  interaction({ ...defaults("hydrogen"), sample: "ether", partner: "water" }) >
    0,
  "Water can donate to ether",
);
const dispersion = defaults("dispersion");
assert(
  inducedResponse({ ...dispersion, distance: 6 }) <
    inducedResponse({ ...dispersion, distance: 3 }) / 4,
  "Induced response falls substantially with separation",
);
assert(
  inducedResponse({ ...dispersion, polarizability: 1.8 }) >
    inducedResponse({ ...dispersion, polarizability: 0.3 }),
  "Polarizability affects induced distortion",
);
for (const mode of ["ion", "dipole", "hydrogen"] as const) {
  for (const distance of [2.7, 3.2, 7])
    for (const charge of [-3, -1, 1, 3]) {
      const s = { ...defaults(mode), distance, charge, released: true };
      assert(Number.isFinite(respondedSeparation(s)));
      assert(respondedSeparation(s) >= 2);
    }
}
console.log(
  "Interaction regression checks passed: held/released positions, charge, radius, orientation, donor rules, distance falloff, and induction.",
);

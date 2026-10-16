import { molecules, type Settings } from "./chemistry";

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

/** Display weights only: never measured forces or comparable across force types. */
export function interaction(s: Settings, distance = s.distance) {
  if (s.mode === "ion") {
    const centerDistance = distance - 1.3 + s.radius;
    return clamp(0.32 * Math.abs(s.charge) * (2.55 / centerDistance) ** 3);
  }
  if (s.mode === "dipole") {
    if (!molecules[s.sample].polar) return 0;
    return (
      clamp(0.55 * (3.2 / distance) ** 4) * Math.cos((s.angle * Math.PI) / 180)
    );
  }
  if (s.mode === "hydrogen") {
    const left = molecules[s.sample],
      right = molecules[s.partner === "same" ? s.sample : s.partner];
    if (!((left.donor && right.acceptor) || (right.donor && left.acceptor)))
      return 0;
    const orientation = Math.max(0, Math.cos((s.angle * Math.PI) / 180)) ** 4;
    return (
      clamp(0.8 * Math.exp(-0.95 * Math.max(0, distance - 2.7))) * orientation
    );
  }
  // A steep falloff makes the correlated, induced response weaker with separation.
  // It does not switch off either particle's own electron fluctuations.
  return clamp(
    0.5 *
      s.polarizability ** 2 *
      (3.2 / distance) ** 6 *
      (s.shape === "chain" ? 1.2 : 1),
  );
}

export function inducedResponse(s: Settings) {
  return clamp(s.polarizability * (3.2 / s.distance) ** 3, 0, 1.8);
}

/** Scripted relaxation, not an equilibrium-distance or force calculation. */
export function respondedSeparation(s: Settings) {
  if (!s.released) return s.distance;
  const pull = interaction(s);
  if (s.mode === "ion")
    return Math.max(s.charge < 0 ? 2.4 : 2.0, s.distance - 1.35 * pull);
  if (s.mode === "hydrogen") return Math.max(2.6, s.distance - 0.95 * pull);
  if (s.mode === "dipole") return clamp(s.distance - 1.1 * pull, 2.7, 8);
  return Math.max(2.7, s.distance - 0.7 * pull);
}

export function feedback(s: Settings) {
  const pull = interaction(s);
  const level =
    Math.abs(pull) < 0.07
      ? "Very faint"
      : Math.abs(pull) < 0.3
        ? "Gentle"
        : Math.abs(pull) < 0.65
          ? "Clear"
          : "Strong";
  if (s.mode === "dispersion")
    return {
      level: `${level} attraction`,
      body:
        s.distance > 4.5
          ? "Farther apart: the neighbor’s induced response is much smaller. Each particle still fluctuates on its own."
          : "Bring the particles closer or increase polarizability: the induced cloud shift and the attraction grow.",
      weight: Math.abs(pull),
    };
  if (s.mode === "dipole" && !molecules[s.sample].polar)
    return {
      level: "No permanent-dipole pull",
      body: "The bond dipoles cancel. Dispersion still acts; it is explored in the London mode.",
      weight: 0,
    };
  if (s.mode === "hydrogen" && pull === 0)
    return {
      level: "No favorable hydrogen bond",
      body: "A donor, an acceptor, and a favorable orientation are needed. Solid covalent bonds stay intact.",
      weight: 0,
    };
  return {
    level: `${level} ${pull < 0 ? "repulsion" : "attraction"}`,
    body: s.released
      ? pull < 0
        ? "The neighbor moves away in this schematic response. Reset restores the starting arrangement."
        : "The neighbor can move closer. More pull produces a larger schematic approach; short-range overlap is prevented."
      : "Distance is held at your selected value. Arrows and dashes show the changing pull. Release the particles to let their spacing respond.",
    weight: Math.abs(pull),
  };
}

export type Mode = "hydrogen" | "ion" | "dipole" | "dispersion";
export type Vec = [number, number, number];
export type Atom = { element: string; p: Vec; charge?: string };
export type MoleculeData = {
  name: string;
  formula: string;
  atoms: Atom[];
  bonds: [number, number][];
  polar: boolean;
  donor: boolean;
  acceptor: boolean;
  shape: string;
};
const a = (
  element: string,
  x: number,
  y = 0,
  z = 0,
  charge?: string,
): Atom => ({ element, p: [x, y, z], charge });
export const molecules: Record<string, MoleculeData> = {
  water: {
    name: "Water",
    formula: "H₂O",
    atoms: [
      a("O", 0, 0, 0, "δ−"),
      a("H", 1, 0, 0, "δ+"),
      a("H", -0.25, 0.968, 0, "δ+"),
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
    polar: true,
    donor: true,
    acceptor: true,
    shape: "Bent · 104.5°",
  },
  ammonia: {
    name: "Ammonia",
    formula: "NH₃",
    atoms: [
      a("N", 0, 0, 0, "δ−"),
      a("H", 1, 0, 0, "δ+"),
      a("H", -0.33, 0.94, 0, "δ+"),
      a("H", -0.33, -0.47, 0.814, "δ+"),
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    polar: true,
    donor: true,
    acceptor: true,
    shape: "Trigonal pyramidal",
  },
  hf: {
    name: "Hydrogen fluoride",
    formula: "HF",
    atoms: [a("F", 0, 0, 0, "δ−"), a("H", 1, 0, 0, "δ+")],
    bonds: [[0, 1]],
    polar: true,
    donor: true,
    acceptor: true,
    shape: "Linear",
  },
  ethanol: {
    name: "Ethanol",
    formula: "C₂H₅OH",
    atoms: [
      a("O", 0, 0, 0, "δ−"),
      a("H", 1, 0, 0, "δ+"),
      a("C", -0.55, 1.25),
      a("C", -1.95, 1.25),
      a("H", -0.3, 1.7, 0.88),
      a("H", -0.3, 1.7, -0.88),
      a("H", -2.3, 2.2),
      a("H", -2.3, 0.8, 0.88),
      a("H", -2.3, 0.8, -0.88),
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [2, 3],
      [2, 4],
      [2, 5],
      [3, 6],
      [3, 7],
      [3, 8],
    ],
    polar: true,
    donor: true,
    acceptor: true,
    shape: "O–H donor · oxygen acceptor",
  },
  ether: {
    name: "Dimethyl ether",
    formula: "CH₃OCH₃",
    atoms: [
      a("O", 0, 0, 0, "δ−"),
      a("C", 1.2, 0.65),
      a("C", -1.2, 0.65),
      a("H", 1.9, 0.05),
      a("H", 1.25, 1.2, 0.85),
      a("H", 1.25, 1.2, -0.85),
      a("H", -1.9, 0.05),
      a("H", -1.25, 1.2, 0.85),
      a("H", -1.25, 1.2, -0.85),
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 6],
      [2, 7],
      [2, 8],
    ],
    polar: true,
    donor: false,
    acceptor: true,
    shape: "Oxygen acceptor · no O–H donor",
  },
  hcl: {
    name: "Hydrogen chloride",
    formula: "HCl",
    atoms: [a("H", -0.65, 0, 0, "δ+"), a("Cl", 0.65, 0, 0, "δ−")],
    bonds: [[0, 1]],
    polar: true,
    donor: false,
    acceptor: false,
    shape: "Linear · permanent dipole",
  },
  co2: {
    name: "Carbon dioxide",
    formula: "CO₂",
    atoms: [
      a("C", 0, 0, 0, "δ+"),
      a("O", -1.2, 0, 0, "δ−"),
      a("O", 1.2, 0, 0, "δ−"),
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
    polar: false,
    donor: false,
    acceptor: true,
    shape: "Linear · dipoles cancel",
  },
  bf3: {
    name: "Boron trifluoride",
    formula: "BF₃",
    atoms: [
      a("B", 0, 0, 0, "δ+"),
      a("F", 1.3, 0, 0, "δ−"),
      a("F", -0.65, 1.126, 0, "δ−"),
      a("F", -0.65, -1.126, 0, "δ−"),
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    polar: false,
    donor: false,
    acceptor: false,
    shape: "Trigonal planar · dipoles cancel",
  },
  chcl3: {
    name: "Chloroform",
    formula: "CHCl₃",
    atoms: [
      a("C", 0, 0, 0, "δ+"),
      a("H", 0, 1.15),
      a("Cl", 1.3, -0.5),
      a("Cl", -0.65, -0.5, 1.126),
      a("Cl", -0.65, -0.5, -1.126),
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
    polar: true,
    donor: false,
    acceptor: false,
    shape: "Tetrahedral · dipoles do not cancel",
  },
  n2: {
    name: "Nitrogen",
    formula: "N₂",
    atoms: [a("N", -0.55), a("N", 0.55)],
    bonds: [[0, 1]],
    polar: false,
    donor: false,
    acceptor: false,
    shape: "Nonpolar diatomic",
  },
  o2: {
    name: "Oxygen",
    formula: "O₂",
    atoms: [a("O", -0.55), a("O", 0.55)],
    bonds: [[0, 1]],
    polar: false,
    donor: false,
    acceptor: false,
    shape: "Nonpolar diatomic",
  },
};
export const modes: {
  id: Mode;
  name: string;
  tag: string;
  question: string;
  subtitle: string;
}[] = [
  {
    id: "hydrogen",
    name: "Hydrogen bonding",
    tag: "01",
    question: "A small attraction. A remarkable world.",
    subtitle:
      "Discover how a hydrogen on one molecule finds an electron-rich neighbor.",
  },
  {
    id: "ion",
    name: "Ion–dipole",
    tag: "02",
    question: "One ion. An entire molecular response.",
    subtitle:
      "Watch water turn toward a charge and organize a hydration sphere.",
  },
  {
    id: "dipole",
    name: "Dipole–dipole",
    tag: "03",
    question: "The right attraction starts with orientation.",
    subtitle:
      "Rotate polar molecules. Discover why molecular shape changes everything.",
  },
  {
    id: "dispersion",
    name: "London dispersion",
    tag: "04",
    question: "Even the nonpolar are never indifferent.",
    subtitle:
      "Meet the fleeting electron fluctuations that attract all atoms and molecules.",
  },
];
export type Settings = {
  mode: Mode;
  sample: string;
  partner: string;
  distance: number;
  angle: number;
  charge: number;
  radius: number;
  network: boolean;
  labels: boolean;
  charges: boolean;
  attractions: boolean;
  lonePairs: boolean;
  bondDipoles: boolean;
  netDipole: boolean;
  cloud: boolean;
  polarizability: number;
  size: number;
  shape: string;
  playing: boolean;
  highlight: boolean;
  released: boolean;
};
export const defaults = (mode: Mode): Settings => ({
  mode,
  sample: mode === "dipole" ? "hcl" : mode === "dispersion" ? "n2" : "water",
  partner: "same",
  distance: 3.2,
  angle: 0,
  charge: 1,
  radius: 0.65,
  network: false,
  labels: false,
  charges: true,
  attractions: true,
  lonePairs: true,
  bondDipoles: false,
  netDipole: true,
  cloud: true,
  polarizability: 1,
  size: 1,
  shape: "compact",
  playing: !matchMedia("(prefers-reduced-motion: reduce)").matches,
  highlight: true,
  released: false,
});
export function explanation(s: Settings) {
  if (s.mode === "ion")
    return {
      title: s.charge > 0 ? "Oxygen turns inward." : "Hydrogens turn inward.",
      body: `The ${s.charge > 0 ? "negative oxygen region" : "positive hydrogen regions"} of water ${s.charge > 0 ? "faces" : "face"} the ${s.charge > 0 ? "cation" : "anion"}. Greater ionic charge increases attraction; a smaller ion lets water approach its charge more closely.`,
      detail:
        "The water dipole reorients in the ion’s electric field. Radius is varied at a fixed surface gap, so changing radius changes center-to-center separation. Held distance isolates attraction strength: changing charge does not automatically change a controlled position. Release the particles for an exaggerated, scripted approach with short-range repulsion preventing overlap. This is not a calculated equilibrium distance. The ions are hypothetical.",
      status: `${s.charge > 0 ? "O δ− → cation" : "H δ+ → anion"} · ${s.network ? "hydration shell" : "single water"}`,
    };
  if (s.mode === "dipole") {
    const m = molecules[s.sample];
    return {
      title: !m.polar
        ? "Polar bonds. No net dipole."
        : Math.cos((s.angle * Math.PI) / 180) > 0.4
          ? "Opposite ends face each other."
          : "Orientation changes the interaction.",
      body: !m.polar
        ? `${m.formula} has ${m.shape.toLowerCase()}. Its bond dipoles cancel as vectors. Dispersion still occurs between these molecules.`
        : "Turn the second molecule: a head-to-tail arrangement favors attraction; turning like ends toward each other is unfavorable. Greater separation weakens the interaction.",
      detail:
        "Bond-dipole arrows point toward the electron-rich atom. A molecular dipole is the vector sum of the bond contributions and electron distribution. Hold the distance to compare the pull, or release the particles for a scripted approach or retreat. Covalent bonds within each molecule stay intact; intermolecular attraction changes the spacing between molecules.",
      status: !m.polar
        ? "Net molecular dipole = 0"
        : Math.cos((s.angle * Math.PI) / 180) > 0.4
          ? "Favorable orientation"
          : Math.cos((s.angle * Math.PI) / 180) < -0.4
            ? "Unfavorable orientation"
            : "Intermediate orientation",
    };
  }
  if (s.mode === "dispersion")
    return {
      title: "A fluctuation becomes a shared attraction.",
      body: "A temporary electron imbalance induces a correlated imbalance next door. Moving the particles apart weakens the neighbor’s induced response and their attraction, while their own fluctuations continue. More polarizable clouds distort more easily.",
      detail:
        "The clouds are a conceptual model of correlated electron fluctuations, not electron trajectories or a quantum calculation. Greater size can correlate with polarizability, but mass alone is not a law. Chain geometry can increase contact between molecules; N₂ is slightly more polarizable than O₂ despite O₂ having the higher boiling point.",
      status: "Instantaneous dipole ⇄ induced dipole",
    };
  const m = molecules[s.sample],
    p = molecules[s.partner === "same" ? s.sample : s.partner];
  const can = (m.donor && p.acceptor) || (p.donor && m.acceptor);
  return {
    title: !can
      ? "An acceptor needs a donor."
      : Math.abs(s.angle) > 40
        ? "Turn the donor toward the acceptor."
        : "Between molecules. Not within them.",
    body: !can
      ? "Dimethyl ether has oxygen lone pairs, but no O–H donor. Two ether molecules cannot form conventional hydrogen bonds with each other. Add water to supply a donor."
      : `${m.name}${s.partner === "same" ? "" : ` + ${p.name.toLowerCase()}`}: a donor’s H bonded to N, O, or F can interact with a neighboring acceptor’s lone pair. Solid rods are covalent bonds; mint dashes mark hydrogen bonds.`,
    detail:
      "A favorable donor–H···acceptor arrangement is close to linear. Water can donate two and accept two hydrogen bonds in an approximately tetrahedral network. Lone-pair lobes indicate electron-rich regions schematically. Hydrogen bonds depend on distance and orientation and are not permanent rods.",
    status: !can
      ? "No conventional self hydrogen bonding"
      : Math.abs(s.angle) > 40
        ? "Hydrogen bond disrupted"
        : s.distance > 4.3
          ? "Weak, distant hydrogen-bond indication"
          : "Favorable donor–H···acceptor",
  };
}
export const comparisons = [
  {
    id: "charge",
    name: "Ionic charge",
    a: "A · +1 ion",
    b: "B · +2 ion",
    changed: "Ionic charge",
    controlled: "Ion radius, water orientation, surface gap",
    why: "At the same radius and separation, the +2 ion exerts a stronger electric attraction on water.",
    config: (b: boolean) => ({ ...defaults("ion"), charge: b ? 2 : 1 }),
  },
  {
    id: "radius",
    name: "Ionic radius",
    a: "A · smaller ion",
    b: "B · larger ion",
    changed: "Ionic radius",
    controlled: "Charge (+1), surface gap, water",
    why: "At the same surface gap, water can approach the center of a smaller ion more closely. Attraction is stronger.",
    config: (b: boolean) => ({ ...defaults("ion"), radius: b ? 1 : 0.4 }),
  },
  {
    id: "orientation",
    name: "Dipole orientation",
    a: "A · head to tail",
    b: "B · like ends facing",
    changed: "Molecular orientation",
    controlled: "HCl, separation, molecule count",
    why: "The head-to-tail arrangement attracts; like ends facing are electrostatically unfavorable.",
    config: (b: boolean) => ({ ...defaults("dipole"), angle: b ? 180 : 0 }),
  },
  {
    id: "cloud",
    name: "Polarizability",
    a: "A · less deformable",
    b: "B · more deformable",
    changed: "Relative polarizability",
    controlled: "Particle size, center separation",
    why: "A more deformable cloud develops a larger induced dipole. Cloud distortion is exaggerated to reveal the mechanism.",
    config: (b: boolean) => ({
      ...defaults("dispersion"),
      polarizability: b ? 1.7 : 0.5,
    }),
  },
  {
    id: "shape",
    name: "Octane & isooctane",
    a: "A · n-octane",
    b: "B · isooctane",
    changed: "Molecular geometry",
    controlled: "Formula C₈H₁₈, molar mass",
    why: "Extended n-octane permits more close contact than compact isooctane. This helps explain stronger total dispersion and its higher boiling point.",
    config: (b: boolean) => ({
      ...defaults("dispersion"),
      shape: b ? "branched" : "chain",
      distance: 3.6,
    }),
  },
  {
    id: "donor",
    name: "Ethanol & ether",
    a: "A · ethanol",
    b: "B · dimethyl ether",
    changed: "Hydrogen-bond donor capacity",
    controlled: "Formula C₂H₆O, molar mass",
    why: "Ethanol can donate and accept hydrogen bonds. Dimethyl ether accepts from water but has no conventional self hydrogen bonding.",
    config: (b: boolean) => ({
      ...defaults("hydrogen"),
      sample: b ? "ether" : "ethanol",
      distance: 3.5,
    }),
  },
];
export const properties = {
  evaporation: {
    name: "Evaporation",
    title: "The surface is an escape route.",
    body: "Particles with enough energy can escape the surface at temperatures below boiling. At comparable temperature, stronger attractions tend to reduce evaporation.",
    detail:
      "Boiling is bulk vapor-bubble formation when vapor pressure equals external pressure. Evaporation occurs at the surface. Heating increases the fraction of molecules able to escape.",
  },
  vapor: {
    name: "Vapor pressure",
    title: "Still moving. Even at equilibrium.",
    body: "In a closed container, evaporation and condensation continue. At dynamic equilibrium their average rates match. Stronger attractions generally give lower vapor pressure at the same temperature.",
    detail:
      "The particles and their counts are schematic. The visualization illustrates equilibrium, not measured pressure or real timescales.",
  },
  surface: {
    name: "Surface tension",
    title: "The surface has a different neighborhood.",
    body: "Interior particles have neighbors in every direction; surface particles have fewer neighbors above them. Cohesion makes increasing the surface area energetically costly.",
    detail:
      "Surface tension is free energy per unit area. It is not a literal skin. Temperature and composition also affect it.",
  },
  viscosity: {
    name: "Viscosity",
    title: "Some liquids resist rearrangement.",
    body: "Cohesive attractions and molecular structure can slow the relative motion of neighboring molecules. Compare flow under the same schematic driving conditions.",
    detail:
      "Viscosity depends on structure, temperature, interactions, and entanglement; it cannot be predicted from a force label alone. The model uses illustrative flow speeds.",
  },
  ice: {
    name: "Water & ice",
    title: "More order. More open space.",
    body: "Ordinary ice organizes water into an open, approximately tetrahedral hydrogen-bonded network. Liquid water can pack more closely, so ordinary ice is less dense.",
    detail:
      "The displayed network is a small tetrahedral fragment, not a complete crystal unit cell. Liquid water retains transient hydrogen bonds; freezing does not create them from nothing.",
  },
};

# INTERMOLECULAR

One interactive, browser-based AP Chemistry laboratory. React, TypeScript, Vite, Three.js, React Three Fiber, and Drei. No account, database, keys, analytics, or personal data collection.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. `npm run build` checks TypeScript and produces `dist/`; `npm run preview` serves the production build locally.

## Deploy publicly

### GitHub Pages (this repository)

1. Push this project to `https://github.com/carrietriesherluck/ChemistryInteractiveLab` on `main`.
2. Open repository **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Open **Actions → Deploy chemistry laboratory to GitHub Pages**. The workflow runs on pushes to `main`; use **Run workflow** if Pages was enabled after the first run.
4. After a successful deployment, visit **https://carrietriesherluck.github.io/ChemistryInteractiveLab/**.

`npm run build:github` sets the asset base to `/ChemistryInteractiveLab/`. The regular build remains suitable for root-domain hosts. The pinned GitHub Actions workflow installs from the lockfile, checks TypeScript, builds, and deploys. If you rename the repository, update the base in `package.json`.

### Other static hosts

- **Netlify:** import this folder's Git repository, or run the build and drag the `dist` folder into Netlify Drop. `netlify.toml` supplies the build command and publish directory.
- **Vercel:** import the repository and select Vite. The included `vercel.json` sets the build command and output directory.
- **Any static host:** upload the contents of `dist/` to the web root. No server runtime is required.

The Google Fonts stylesheet is optional; local sans-serif fallbacks remain usable if blocked. All 3D rendering is local to the visitor's browser.

## Explore

- **Hydrogen bonding:** five molecular examples, donor/acceptor partners, orientation, separation, draggable neighbor, charges, lone-pair regions, and a small water network.
- **Ion–dipole:** cation/anion reversal, hypothetical charge and radius, separation, and a three-dimensional hydration shell.
- **Dipole–dipole:** HCl, water, BF₃, CO₂, and CHCl₃; molecular rotation, bond dipoles, net dipoles, and vector cancellation.
- **Dispersion:** fluctuating density clouds, polarizability, relative particle size, N₂/O₂, and n-octane/isooctane contact geometry.
- **Comparison:** six controlled comparisons rendered simultaneously using the same molecular components and camera.
- **Matter:** schematic evaporation, closed-container vapor exchange, surface cohesion, flow resistance, and liquid/ice organization.

Drag the background to orbit; scroll/pinch to zoom. In hydrogen-bond mode, drag the neighboring molecule to translate it. Sliders provide keyboard-operable alternatives. Reset restores the experiment and camera. Reduced-motion preferences pause autonomous animation initially. The live explanation is an equivalent text description when WebGL is unavailable.

## Architecture

- `src/chemistry.ts`: scientific structures, typed state, descriptions, comparisons, and property content.
- `src/Scene.tsx`: shared atoms, bonds, annotations, dipole arrows, electron clouds, scenes, camera, and rendering fallback.
- `src/App.tsx`: unified view navigation, contextual controls, live interpretation, prediction prompts, and field guide.
- `src/styles.css`: responsive design system, visible focus states, and reduced-motion rules.

## Modeling limits

This is an educational visualization, not molecular dynamics or quantum chemistry. Coordinate units and animation times are illustrative. Atom sizes, density distortions, lone-pair regions, and attraction lines are deliberately schematic. Covalent rods and dashed intermolecular indicators are distinct. No exact attraction forces, boiling points, vapor pressures, or viscosity values are fabricated.

Hydration uses reorientation of a rigid water dipole; varying ion radius preserves a surface gap, rather than holding center separation fixed. Hydrogen-bond indicators use qualitative angle and distance thresholds, not a potential-energy calculation. Electron-density shifts illustrate correlated fluctuations, never electron orbits. A water network and a tetrahedral ice fragment illustrate organization rather than a full periodic crystal. Property particles have predetermined qualitative trajectories, so evaporation/condensation is not a solved equilibrium or thermodynamic prediction. Comparison labels explicitly state controlled and changed variables.

The optional miscibility experiment is omitted to concentrate on the four core forces. See `SCIENCE-NOTES.md` for reference mapping and corrections.

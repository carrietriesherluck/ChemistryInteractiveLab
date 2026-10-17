# Validation

- Production: `npm run build` passes TypeScript and Vite bundling.
- Production output served and opened in the browser locally.
- Reviewed hydrogen-bonding geometry, charge labels, and molecular layer controls.
- Verified cation/anion switching and three-dimensional hydration sphere orientation.
- Verified BF₃ selection, bond-dipole layer, and zero net dipole explanation.
- Reviewed animated dispersion density clouds and stage captions.
- Exercised all six comparison selections and their controlled/changed-variable feedback.
- Exercised all five physical-property selections and their explanations.
- Reviewed responsive layout at a 390 × 844 viewport.
- Removed the annotation-root lifecycle issue and verified all partial/full charge labels render.

Limits: qualitative models, not computed forces or thermodynamics. No automated molecular dynamics, mobile hardware performance, or screen-reader certification. Browser orbit was exercised; the direct atom-drag path was not conclusively verified through browser automation. Keyboard-accessible separation and orientation controls provide an alternative. The optional miscibility demonstration is omitted.

The initial Sites hosting attempt was blocked by the environment’s shell approval policy. The project was subsequently pushed to `carrietriesherluck/ChemistryInteractiveLab` on GitHub. GitHub Pages is enabled with a deployment workflow that builds using the repository-specific asset path. See the repository’s Actions page for deployment status. The README also covers Netlify and Vercel.

## Interaction-response update

- Regression checks in `tests/interactions.test.ts` verify held spacing, stronger charge response, smaller-radius response, released approach/retreat, donor–acceptor rules, and distance-dependent induction. The tests passed after the update.
- Browser checks verify charge 1→3 strengthens the feedback at fixed spacing, Release particles changes ion–water spacing, and far separation weakens the dispersion cue and induced cloud component.
- Covalent bonds remain rigid. The new force-display weights and relaxed positions are qualitative, not measured forces or equilibrium bond lengths.

## Interface simplification

Removed repeated status cards, introductory paragraphs, secondary feature cards, and the prediction/footer sections. Display layers now sit behind View options; full scientific explanations remain behind Why? and in the Field guide. Browser review confirmed the default view, disclosure controls, and responsive phone layout. Production build and interaction tests pass.

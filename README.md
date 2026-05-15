# PROCESS Matrix Customizer

A modern, browser-based companion for **Hayes (2018)** _Introduction to Mediation, Moderation, and Conditional Process Analysis_ (2nd ed.). Build and visualize custom PROCESS macro models — the **B / W / Z / WZ / C** matrices described in Appendix B — and export the exact SPSS, SAS, or R command verified against Appendices A & B.

## Features

- **Matrix editor** with full validation against Hayes's S-1 … S-5 rules (path-zero moderation, Z-without-W, dangling mediator, WZ → W/Z invariant, entry-count `0.5·(k+1)·(k+2)`).
- **Live node-and-edge diagram** built on React Flow — drag nodes around, dashed paths mark moderation, W/Z chips and dashed arrows show which moderator conditions each path.
- **Numbered-model presets** for the most-cited PROCESS templates (Models 4, 6, 7, 21) and the worked figures from Appendix B (B.3 – B.6).
- **Three code dialects**: SPSS, SAS, R — generated verbatim to match the book's examples (Figure B.3 on p. 620 etc.).
- **Covariates** with the rectangular C matrix (Appendix B, pp. 630–632) including the moderator-as-covariate trick.
- **Full Appendix A options** — `boot`, `mc`, `conf`, `seed`, `hc`, `normal`, `jn`, `intprobe`, `moments`, `center`, `covmy`, `plot`, `decimals`, `effsize`, `total`, `modelbt`, `covcoeff`, `save`.
- **`matrices=1`** flag so PROCESS prints back the resolved B/W/Z/WZ/C matrices (Hayes p. 626).
- **SVG / PNG export** of the diagram.
- **Light + dark** themes with sticky header and editorial typography (Fraunces variable serif).

## Tech stack

React 19 · TypeScript · Vite · Tailwind v4 · React Flow 12 · Zustand · Radix UI · Sonner · html-to-image · Vitest.

## Running locally

```sh
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production bundle to dist/
npm test         # 27 unit tests, fixtures verbatim against Hayes (2018)
```

## Project layout

```
src/
├── lib/
│   ├── matrix.ts       # B/W/Z/WZ/C serialization, S-4 propagation, resize helpers
│   ├── codegen.ts      # SPSS / SAS / R generators
│   ├── validation.ts   # Hayes S-1…S-5 rules
│   └── presets.ts      # Figures B.2-B.6 + Models 4, 6, 7, 21
├── store/modelStore.ts # Zustand store (matrices, options, persist)
├── components/
│   ├── variables/, matrices/, code/, options/, presets/
│   └── diagram/        # React Flow custom nodes + edges
└── types/model.ts
```

## Citation

Hayes, A. F. (2018). _Introduction to Mediation, Moderation, and Conditional Process Analysis: A Regression-Based Approach_ (2nd ed.). The Guilford Press.

## Contact

cahitgs@gmail.com

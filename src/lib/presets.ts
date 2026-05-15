import type { Preset, Variables } from '@/types/model'
import { defaultZeroMatrix, parse, propagateWZ } from './matrix'

/** Hayes' running-example variable names, used throughout Appendix B. */
const APPENDIX_VARS = (mediators: string[]): Variables => ({
  x: 'baby',
  y: 'tile',
  mediators,
  w: 'milk',
  z: 'hair',
  covariates: [],
})

function build(
  mediators: string[],
  bStr: string,
  wStr?: string,
  zStr?: string,
  wzStr?: string,
) {
  const k = mediators.length
  const b = parse(bStr, k)
  const wRaw = wStr ? parse(wStr, k) : defaultZeroMatrix(k)
  const zRaw = zStr ? parse(zStr, k) : defaultZeroMatrix(k)
  const wz = wzStr ? parse(wzStr, k) : defaultZeroMatrix(k)
  const { w, z } = propagateWZ(wRaw, zRaw, wz)
  return { b, w, z, wz }
}

export const PRESETS: Preset[] = [
  {
    id: 'simple-mediation',
    label: 'Simple mediation (1 mediator)',
    description:
      'X → M → Y plus the direct effect X → Y. Figure B.2 panel A in Hayes (2022).',
    reference: 'Hayes (2022) Fig. B.2 panel A, p. 616',
    variables: APPENDIX_VARS(['wine']),
    matrices: build(['wine'], '1,1,1'),
    modelNumber: 4,
  },
  {
    id: 'parallel-3m',
    label: 'Parallel multiple mediator (3 mediators)',
    description:
      'X affects all three mediators; all three mediators and X affect Y; no mediator affects another. Equivalent to PROCESS Model 4 with k = 3. Figure B.2 panel B.',
    reference: 'Hayes (2022) Fig. B.2 panel B, p. 616',
    variables: APPENDIX_VARS(['wine', 'tent', 'sand']),
    matrices: build(['wine', 'tent', 'sand'], '1,1,0,1,0,0,1,1,1,1'),
    modelNumber: 4,
  },
  {
    id: 'serial-2m',
    label: 'Serial multiple mediator (2 mediators)',
    description:
      'M1 also affects M2. Equivalent to PROCESS Model 6 with k = 2. Figure B.2 panel C.',
    reference: 'Hayes (2022) Fig. B.2 panel C, p. 616',
    variables: APPENDIX_VARS(['wine', 'tent']),
    matrices: build(['wine', 'tent'], '1,1,1,1,1,1'),
    modelNumber: 6,
  },
  {
    id: 'fig-b3',
    label: 'Figure B.3 — conditional process with W and Z',
    description:
      'Three mediators with both W and Z moderating distinct paths. Direct illustration of bmatrix + wmatrix + zmatrix.',
    reference: 'Hayes (2022) Fig. B.3, p. 621',
    variables: APPENDIX_VARS(['wine', 'tent', 'sand']),
    matrices: build(
      ['wine', 'tent', 'sand'],
      '1,1,0,0,1,1,1,1,0,1',
      '1,0,0,0,1,0,1,0,0,0',
      '1,1,0,0,0,0,0,0,0,0',
    ),
  },
  {
    id: 'fig-b4',
    label: 'Figure B.4 — three-way (WZ) moderated moderation',
    description:
      'Parallel mediators with Z moderating the moderation by W of X→M1 and X→Y. Demonstrates the wzmatrix and the S-4 invariant.',
    reference: 'Hayes (2022) Fig. B.4, p. 623',
    variables: APPENDIX_VARS(['wine', 'tent', 'sand']),
    matrices: build(
      ['wine', 'tent', 'sand'],
      '1,1,0,1,0,0,1,1,1,1',
      undefined,
      undefined,
      '1,0,0,0,0,0,1,0,0,0',
    ),
  },
  {
    id: 'fig-b5',
    label: 'Figure B.5 — full W + Z + WZ',
    description:
      'Parallel mediators with W and Z each moderating multiple paths and a WZ three-way for two of them.',
    reference: 'Hayes (2022) Fig. B.5, p. 624',
    variables: APPENDIX_VARS(['wine', 'tent', 'sand']),
    matrices: build(
      ['wine', 'tent', 'sand'],
      '1,1,0,1,0,0,1,1,1,1',
      '1,0,0,1,0,0,1,0,0,0',
      '1,0,0,0,0,0,1,0,0,1',
      '1,0,0,0,0,0,1,0,0,0',
    ),
  },
  {
    id: 'fig-b6',
    label: 'Figure B.6 — model 7 plus Z on M1→Y',
    description:
      'Parallel three-mediator model with W moderating every X→Mi path, plus Z moderating M1→Y. Used in the appendix to show editing of a numbered model.',
    reference: 'Hayes (2022) Fig. B.6, p. 626',
    variables: APPENDIX_VARS(['wine', 'tent', 'sand']),
    matrices: build(
      ['wine', 'tent', 'sand'],
      '1,1,0,1,0,0,1,1,1,1',
      '1,1,0,1,0,0,0,0,0,0',
      '0,0,0,0,0,0,0,1,0,0',
    ),
  },
  {
    id: 'model-7',
    label: 'Model 7 — first-stage moderated mediation',
    description:
      'Parallel mediators; W moderates each X→Mi path; M→Y paths are not moderated.',
    reference: 'Hayes (2022) Model 7, p. 627',
    variables: APPENDIX_VARS(['wine', 'tent', 'sand']),
    matrices: build(
      ['wine', 'tent', 'sand'],
      '1,1,0,1,0,0,1,1,1,1',
      '1,1,0,1,0,0,0,0,0,0',
    ),
    modelNumber: 7,
  },
  {
    id: 'model-21',
    label: 'Model 21 — first- and second-stage moderation',
    description:
      'Parallel mediators; W moderates each X→Mi path; Z moderates each Mi→Y path.',
    reference: 'Hayes (2022) Model 21, p. 628',
    variables: APPENDIX_VARS(['wine', 'tent', 'sand']),
    matrices: build(
      ['wine', 'tent', 'sand'],
      '1,1,0,1,0,0,1,1,1,1',
      '1,1,0,1,0,0,0,0,0,0',
      '0,0,0,0,0,0,0,1,1,1',
    ),
    modelNumber: 21,
  },
]

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id)
}

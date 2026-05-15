import { describe, expect, it } from 'vitest'
import { validate } from '../validation'
import { getPreset } from '../presets'
import type { ModelState, Variables } from '@/types/model'
import { DEFAULT_OPTIONS } from '@/types/model'
import { parse, defaultZeroMatrix } from '../matrix'

function model(
  vars: Variables,
  bStr: string,
  wStr?: string,
  zStr?: string,
  wzStr?: string,
): ModelState {
  const k = vars.mediators.length
  return {
    variables: vars,
    matrices: {
      b: parse(bStr, k),
      w: wStr ? parse(wStr, k) : defaultZeroMatrix(k),
      z: zStr ? parse(zStr, k) : defaultZeroMatrix(k),
      wz: wzStr ? parse(wzStr, k) : defaultZeroMatrix(k),
    },
    cMatrix: [],
    modelNumber: null,
    showMatrices: false,
    options: { ...DEFAULT_OPTIONS },
  }
}

const VARS_3M: Variables = {
  x: 'baby',
  y: 'tile',
  mediators: ['wine', 'tent', 'sand'],
  w: 'milk',
  z: 'hair',
  covariates: [],
}

describe('validation', () => {
  it('valid presets produce no errors', () => {
    for (const id of ['fig-b3', 'fig-b4', 'fig-b5', 'model-7', 'model-21']) {
      const p = getPreset(id)!
      const result = validate({
        variables: p.variables,
        matrices: p.matrices,
        cMatrix: [],
        modelNumber: p.modelNumber ?? null,
        showMatrices: false,
        options: { ...DEFAULT_OPTIONS },
      })
      expect(result.hasErrors, `${id}: ${JSON.stringify(result.issues)}`).toBe(false)
    }
  })

  it('S-1: B=0 cell with W=1 is an error', () => {
    const m = model(
      VARS_3M,
      // Sets B[1][1]=0 (M1→M2 absent) … and W[1][1]=1 (moderate non-existent path)
      '1,1,0,1,1,0,1,1,1,1',
      '0,0,1,0,0,0,0,0,0,0',
    )
    const r = validate(m)
    expect(r.hasErrors).toBe(true)
    expect(r.issues.some((i) => i.code === 'S1_path_zero_moderated')).toBe(true)
  })

  it('S-2: Z used without W is an error', () => {
    const m = model(
      VARS_3M,
      '1,1,0,1,0,0,1,1,1,1',
      undefined,
      '1,0,0,0,0,0,0,0,0,0', // Z set, W empty
    )
    const r = validate(m)
    expect(r.issues.some((i) => i.code === 'S2_z_without_w')).toBe(true)
  })

  it('S-3: dangling mediator is an error', () => {
    // M2 column (col 1) has no 1 in rows ≥ 1 → M2 sends nothing.
    // Build B that wires X→M1, X→M3, X→Y; M1→Y; M2 dangles.
    // Rows: M1, M2, M3, Y; cols: X, M1, M2, M3
    // M1: [1] → X→M1 only
    // M2: [1, 0] → X→M2 only (so M2 receives but never sends)
    // M3: [1, 0, 0] → X→M3
    // Y:  [1, 1, 0, 1] → X→Y, M1→Y, M3→Y (no M2→Y)
    const m = model(VARS_3M, '1,1,0,1,0,0,1,1,0,1')
    const r = validate(m)
    expect(r.issues.some((i) => i.code === 'S3_dangling_mediator')).toBe(true)
  })

  it('S-4: WZ=1 with W=0 produces a warning, not an error', () => {
    const m = model(
      VARS_3M,
      '1,1,0,1,0,0,1,1,1,1',
      undefined, // W all zeros
      undefined, // Z all zeros
      '1,0,0,0,0,0,0,0,0,0', // WZ=1 at (0,0)
    )
    const r = validate(m)
    expect(r.issues.some((i) => i.code === 'S4_wz_overrides' && i.severity === 'warning')).toBe(
      true,
    )
  })
})

import { describe, expect, it } from 'vitest'
import { generateSPSS, generateSAS, generateR } from '../codegen'
import { getPreset } from '../presets'
import type { ModelState } from '@/types/model'
import { DEFAULT_OPTIONS } from '@/types/model'
import { defaultCMatrix } from '../matrix'

function load(id: string, overrides: Partial<ModelState> = {}): ModelState {
  const p = getPreset(id)!
  return {
    variables: p.variables,
    matrices: p.matrices,
    cMatrix: defaultCMatrix(p.variables.mediators.length, p.variables.covariates.length),
    modelNumber: p.modelNumber ?? null,
    showMatrices: false,
    options: { ...DEFAULT_OPTIONS },
    ...overrides,
  }
}

describe('codegen — SPSS', () => {
  it('Fig. B.3 (p. 620): full w + z command, no wz, no model number', () => {
    const cmd = generateSPSS(load('fig-b3'))
    expect(cmd).toBe(
      'process y=tile/m=wine tent sand/x=baby/w=milk/z=hair' +
        '/bmatrix=1,1,0,0,1,1,1,1,0,1' +
        '/wmatrix=1,0,0,0,1,0,1,0,0,0' +
        '/zmatrix=1,1,0,0,0,0,0,0,0,0.',
    )
  })

  it('Fig. B.4 (p. 623): expands wz to the equivalent w + z + wz long form', () => {
    const cmd = generateSPSS(load('fig-b4'))
    expect(cmd).toBe(
      'process y=tile/m=wine tent sand/x=baby/w=milk/z=hair' +
        '/bmatrix=1,1,0,1,0,0,1,1,1,1' +
        '/wmatrix=1,0,0,0,0,0,1,0,0,0' +
        '/zmatrix=1,0,0,0,0,0,1,0,0,0' +
        '/wzmatrix=1,0,0,0,0,0,1,0,0,0.',
    )
  })

  it('simple mediation as model=4 (Hayes p. 615)', () => {
    const cmd = generateSPSS(load('simple-mediation'))
    expect(cmd).toBe('process y=tile/m=wine/x=baby/model=4.')
  })

  it('Model 7 (p. 627): emits /model=7 with W matrix override', () => {
    const cmd = generateSPSS(load('model-7'))
    expect(cmd).toBe(
      'process y=tile/m=wine tent sand/x=baby/w=milk/model=7' +
        '/wmatrix=1,1,0,1,0,0,0,0,0,0.',
    )
  })

  it('matrices=1 flag appends the option (Hayes p. 626)', () => {
    const cmd = generateSPSS(load('model-7', { showMatrices: true }))
    expect(cmd).toBe(
      'process y=tile/m=wine tent sand/x=baby/w=milk/model=7' +
        '/wmatrix=1,1,0,1,0,0,0,0,0,0/matrices=1.',
    )
  })

  it('covariates emit /cov= and /cmatrix= (Hayes pp. 630-632)', () => {
    const base = load('simple-mediation')
    const withCov: ModelState = {
      ...base,
      variables: { ...base.variables, covariates: ['sand', 'tent', 'milkcopy'] },
      cMatrix: [
        [1, 1, 0],
        [1, 1, 1],
      ],
    }
    const cmd = generateSPSS(withCov)
    expect(cmd).toContain('/cov=sand tent milkcopy')
    expect(cmd).toContain('/cmatrix=1,1,0,1,1,1')
  })
})

describe('codegen — Appendix A options (Hayes 2022 pp. 553-554)', () => {
  it('emits every option in the canonical syntax order', () => {
    const cmd = generateSPSS(
      load('fig-b3', {
        options: {
          ...DEFAULT_OPTIONS,
          boot: 10000,
          maxboot: 20000,
          mc: 5000,
          conf: 99,
          seed: 12345,
          normal: true,
          hc: 3,
          intprobe: 0.05,
          jn: true,
          moments: true,
          center: 1,
          covmy: 1,
          plot: 1,
          decimals: 'F12.6',
          effsize: true,
          total: true,
          modelbt: true,
          covcoeff: true,
          save: 1,
        },
      }),
    )
    expect(cmd).toContain('/boot=10000')
    expect(cmd).toContain('/maxboot=20000')
    expect(cmd).toContain('/mc=5000')
    expect(cmd).toContain('/conf=99')
    expect(cmd).toContain('/seed=12345')
    expect(cmd).toContain('/normal=1')
    expect(cmd).toContain('/hc=3')
    expect(cmd).toContain('/intprobe=0.05')
    expect(cmd).toContain('/jn=1')
    expect(cmd).toContain('/moments=1')
    expect(cmd).toContain('/center=1')
    expect(cmd).toContain('/covmy=1')
    expect(cmd).toContain('/plot=1')
    expect(cmd).toContain('/decimals=F12.6')
    expect(cmd).toContain('/effsize=1')
    expect(cmd).toContain('/total=1')
    expect(cmd).toContain('/modelbt=1')
    expect(cmd).toContain('/covcoeff=1')
    expect(cmd).toContain('/save=1')
  })

  it('SAS drops the F prefix in decimals (p. 582)', () => {
    const cmd = generateSAS(
      load('fig-b3', {
        options: { ...DEFAULT_OPTIONS, decimals: 'F12.6' },
      }),
    )
    expect(cmd).toContain(',decimals=12.6')
    expect(cmd).not.toContain('F12.6')
  })

  it('default options emit nothing extra', () => {
    const cmd = generateSPSS(load('fig-b3'))
    expect(cmd).not.toMatch(
      /\/boot=|\/maxboot=|\/mc=|\/conf=|\/seed=|\/normal=|\/hc=|\/intprobe=|\/jn=|\/moments=|\/center=|\/covmy=|\/plot=|\/decimals=|\/effsize=|\/total=|\/modelbt=|\/covcoeff=|\/save=/,
    )
  })

  it('Example 3 (Hayes p. 555): simple mediation with total, effsize, boot=10000', () => {
    // From PDF Appendix A example 3:
    //   process y=votes/x=donate/m=winner/model=4/total=1/effsize=1/boot=10000.
    const m = load('simple-mediation', {
      variables: {
        x: 'donate',
        y: 'votes',
        mediators: ['winner'],
        w: 'W',
        z: 'Z',
        covariates: [],
      },
      options: { ...DEFAULT_OPTIONS, total: true, effsize: true, boot: 10000 },
    })
    const cmd = generateSPSS(m)
    expect(cmd).toBe(
      'process y=votes/m=winner/x=donate/model=4/boot=10000/effsize=1/total=1.',
    )
  })

  it('Example 7 (Hayes p. 557): model 7 with boot=1000 and seed=34421', () => {
    const m = load('model-7', {
      variables: {
        x: 'calling',
        y: 'jobsat',
        mediators: ['carcomm', 'workmean'],
        w: 'livecall',
        z: 'Z',
        covariates: [],
      },
      matrices: {
        b: [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
        w: [[1, 0, 0], [1, 0, 0], [0, 0, 0]],
        z: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        wz: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      },
      options: { ...DEFAULT_OPTIONS, boot: 1000, seed: 34421 },
    })
    const cmd = generateSPSS(m)
    expect(cmd).toContain('/model=7')
    expect(cmd).toContain('/boot=1000')
    expect(cmd).toContain('/seed=34421')
  })
})

describe('codegen — SAS', () => {
  it('Fig. B.3: spaces between entries, commas between options', () => {
    const cmd = generateSAS(load('fig-b3'))
    expect(cmd).toBe(
      '%process (data=YOURDATA,y=tile,m=wine tent sand,x=baby,w=milk,z=hair,' +
        'bmatrix=1 1 0 0 1 1 1 1 0 1,' +
        'wmatrix=1 0 0 0 1 0 1 0 0 0,' +
        'zmatrix=1 1 0 0 0 0 0 0 0 0);',
    )
  })
})

describe('codegen — R', () => {
  it('Fig. B.3: quoted strings and c() vectors', () => {
    const cmd = generateR(load('fig-b3'))
    expect(cmd).toBe(
      'process(data=YOURDATA, y="tile", m=c("wine", "tent", "sand"), x="baby", w="milk", z="hair", ' +
        'bmatrix=c(1,1,0,0,1,1,1,1,0,1), ' +
        'wmatrix=c(1,0,0,0,1,0,1,0,0,0), ' +
        'zmatrix=c(1,1,0,0,0,0,0,0,0,0))',
    )
  })
})

import type { Matrix, ModelState, ProcessOptions } from '@/types/model'
import { hasAnyOne, propagateWZ, serialize, serializeRect } from './matrix'

interface BuildContext {
  variables: ModelState['variables']
  b: Matrix
  w: Matrix
  z: Matrix
  wz: Matrix
  c: Matrix
  hasW: boolean
  hasZ: boolean
  hasWZ: boolean
  hasCov: boolean
  /** PROCESS model number when emitting `/model=N` form (Hayes 2018 p. 625). */
  modelNumber: number | null
  showMatrices: boolean
  options: ProcessOptions
}

/**
 * Produce the list of "option=value" fragments for the configured PROCESS
 * options. Only options the user has changed from the PROCESS default are
 * included, so the generated command stays minimal.
 *
 * Option list and defaults verified against Hayes (2018), Appendix A,
 * pp. 553-554.
 */
function optionFragments(o: ProcessOptions): string[] {
  const out: string[] = []
  // Inference
  if (o.boot !== null) out.push(`boot=${o.boot}`)
  if (o.maxboot !== null) out.push(`maxboot=${o.maxboot}`)
  if (o.mc !== null) out.push(`mc=${o.mc}`)
  if (o.conf !== null) out.push(`conf=${o.conf}`)
  if (o.seed !== null) out.push(`seed=${o.seed}`)
  if (o.normal) out.push('normal=1')
  if (o.hc !== null) out.push(`hc=${o.hc}`)
  // Probing
  if (o.intprobe !== null) out.push(`intprobe=${o.intprobe}`)
  if (o.jn) out.push('jn=1')
  if (o.moments) out.push('moments=1')
  // Centering
  if (o.center !== null) out.push(`center=${o.center}`)
  // Covariate placement
  if (o.covmy !== null) out.push(`covmy=${o.covmy}`)
  // Output
  if (o.plot !== null) out.push(`plot=${o.plot}`)
  if (o.decimals !== null) out.push(`decimals=${o.decimals}`)
  if (o.effsize) out.push('effsize=1')
  if (o.total) out.push('total=1')
  if (o.modelbt) out.push('modelbt=1')
  if (o.covcoeff) out.push('covcoeff=1')
  if (o.save !== null) out.push(`save=${o.save}`)
  return out
}

function buildContext(model: ModelState): BuildContext {
  // S-4: enforce WZ ⇒ W,Z before generating code (Hayes 2018 p. 624)
  const { w, z } = propagateWZ(model.matrices.w, model.matrices.z, model.matrices.wz)
  const hasWZ = hasAnyOne(model.matrices.wz)
  const hasW = hasAnyOne(w) || hasWZ
  const hasZ = hasAnyOne(z) || hasWZ
  const hasCov = model.variables.covariates.length > 0
  return {
    variables: model.variables,
    b: model.matrices.b,
    w,
    z,
    wz: model.matrices.wz,
    c: model.cMatrix,
    hasW,
    hasZ,
    hasWZ,
    hasCov,
    modelNumber: model.modelNumber,
    showMatrices: model.showMatrices,
    options: model.options,
  }
}

/**
 * SPSS command. Format follows Hayes (2018) Appendix B verbatim. Two modes:
 *
 *   - Custom (modelNumber = null): emits `/bmatrix=...` plus any W/Z/WZ.
 *   - Numbered (modelNumber set):  emits `/model=N` plus only the matrices
 *     the user has edited on top of that model. (Hayes 2018 pp. 625-630.)
 *
 * Covariates and the `matrices=1` debug flag are emitted when configured.
 */
export function generateSPSS(model: ModelState): string {
  const ctx = buildContext(model)
  const { variables: v } = ctx

  const parts: string[] = [
    `process y=${v.y}`,
    `m=${v.mediators.join(' ')}`,
    `x=${v.x}`,
  ]
  if (ctx.hasW) parts.push(`w=${v.w}`)
  if (ctx.hasZ) parts.push(`z=${v.z}`)
  if (ctx.hasCov) parts.push(`cov=${v.covariates.join(' ')}`)

  if (ctx.modelNumber !== null) {
    parts.push(`model=${ctx.modelNumber}`)
  } else {
    parts.push(`bmatrix=${serialize(ctx.b)}`)
  }
  if (ctx.hasW) parts.push(`wmatrix=${serialize(ctx.w)}`)
  if (ctx.hasZ) parts.push(`zmatrix=${serialize(ctx.z)}`)
  if (ctx.hasWZ) parts.push(`wzmatrix=${serialize(ctx.wz)}`)
  if (ctx.hasCov) parts.push(`cmatrix=${serializeRect(ctx.c)}`)
  if (ctx.showMatrices) parts.push(`matrices=1`)
  parts.push(...optionFragments(ctx.options))

  return parts.join('/') + '.'
}

/**
 * SAS — entries inside each matrix are space-separated (Hayes 2018 p. 618);
 * options are still comma-separated. The `decimals` argument also drops
 * the "F" prefix in SAS (p. 582).
 */
export function generateSAS(model: ModelState): string {
  const ctx = buildContext(model)
  const { variables: v } = ctx
  const spaceify = (s: string) => s.replace(/,/g, ' ')

  const parts: string[] = [
    `data=YOURDATA`,
    `y=${v.y}`,
    `m=${v.mediators.join(' ')}`,
    `x=${v.x}`,
  ]
  if (ctx.hasW) parts.push(`w=${v.w}`)
  if (ctx.hasZ) parts.push(`z=${v.z}`)
  if (ctx.hasCov) parts.push(`cov=${v.covariates.join(' ')}`)

  if (ctx.modelNumber !== null) {
    parts.push(`model=${ctx.modelNumber}`)
  } else {
    parts.push(`bmatrix=${spaceify(serialize(ctx.b))}`)
  }
  if (ctx.hasW) parts.push(`wmatrix=${spaceify(serialize(ctx.w))}`)
  if (ctx.hasZ) parts.push(`zmatrix=${spaceify(serialize(ctx.z))}`)
  if (ctx.hasWZ) parts.push(`wzmatrix=${spaceify(serialize(ctx.wz))}`)
  if (ctx.hasCov) parts.push(`cmatrix=${spaceify(serializeRect(ctx.c))}`)
  if (ctx.showMatrices) parts.push(`matrices=1`)
  for (const frag of optionFragments(ctx.options)) {
    // SAS drops the F prefix in `decimals=F10.4` (Hayes 2018 p. 582).
    parts.push(frag.replace(/^decimals=F/, 'decimals='))
  }

  return `%process (${parts.join(',')});`
}

/**
 * R (PROCESS for R) — quoted variable names and c() vectors for numeric strings.
 */
export function generateR(model: ModelState): string {
  const ctx = buildContext(model)
  const { variables: v } = ctx
  const cvec = (items: string[]) => `c(${items.map((m) => `"${m}"`).join(', ')})`
  const cnums = (s: string) => `c(${s})`

  const parts: string[] = [
    `data=YOURDATA`,
    `y="${v.y}"`,
    `m=${cvec(v.mediators)}`,
    `x="${v.x}"`,
  ]
  if (ctx.hasW) parts.push(`w="${v.w}"`)
  if (ctx.hasZ) parts.push(`z="${v.z}"`)
  if (ctx.hasCov) parts.push(`cov=${cvec(v.covariates)}`)

  if (ctx.modelNumber !== null) {
    parts.push(`model=${ctx.modelNumber}`)
  } else {
    parts.push(`bmatrix=${cnums(serialize(ctx.b))}`)
  }
  if (ctx.hasW) parts.push(`wmatrix=${cnums(serialize(ctx.w))}`)
  if (ctx.hasZ) parts.push(`zmatrix=${cnums(serialize(ctx.z))}`)
  if (ctx.hasWZ) parts.push(`wzmatrix=${cnums(serialize(ctx.wz))}`)
  if (ctx.hasCov) parts.push(`cmatrix=${cnums(serializeRect(ctx.c))}`)
  if (ctx.showMatrices) parts.push(`matrices=1`)
  parts.push(...optionFragments(ctx.options))

  return `process(${parts.join(', ')})`
}

export function generateAll(model: ModelState) {
  return {
    spss: generateSPSS(model),
    sas: generateSAS(model),
    r: generateR(model),
  }
}

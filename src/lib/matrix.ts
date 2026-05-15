import type { Matrix, MatrixKind } from '@/types/model'

/** Number of entries (excluding the upper triangle) in a (k+1)×(k+1) matrix. */
export function entryCount(mediatorCount: number): number {
  const k = mediatorCount
  return ((k + 1) * (k + 2)) / 2
}

/** Create a (k+1)×(k+1) matrix filled with `value`. */
export function createMatrix(mediatorCount: number, value = 0): Matrix {
  const n = mediatorCount + 1
  return Array.from({ length: n }, () => Array.from({ length: n }, () => value))
}

/**
 * Default B matrix for a fresh model: every recursive path estimated (1 in the
 * lower triangle including the diagonal, 0 in the structurally-impossible upper
 * triangle). This matches the all-1s serial-mediation reading of Hayes (2018)
 * Fig. B.2 panel C with the natural extension to k > 2.
 */
export function defaultBMatrix(mediatorCount: number): Matrix {
  const n = mediatorCount + 1
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (j <= i ? 1 : 0)),
  )
}

export function defaultZeroMatrix(mediatorCount: number): Matrix {
  return createMatrix(mediatorCount, 0)
}

/**
 * Whether a cell is editable (lower triangle including diagonal). Cells where
 * j > i are structurally zero — recursive-model constraint, Hayes (2018) p. 614.
 */
export function isEditableCell(row: number, col: number): boolean {
  return col <= row
}

/**
 * Serialize a matrix to the comma-separated PROCESS string format described in
 * Hayes (2018) pp. 615-617: read left-to-right, top-to-bottom, skipping the
 * upper triangle. With k mediators the result has 0.5*(k+1)*(k+2) entries.
 */
export function serialize(matrix: Matrix): string {
  const out: number[] = []
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j <= i; j++) {
      out.push(matrix[i]![j]!)
    }
  }
  return out.join(',')
}

/** Parse a serialized PROCESS string back into a (k+1)×(k+1) matrix. */
export function parse(value: string, mediatorCount: number): Matrix {
  const entries = value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((s) => Number(s))
  const expected = entryCount(mediatorCount)
  if (entries.length !== expected) {
    throw new Error(
      `Expected ${expected} entries for k=${mediatorCount} mediators, got ${entries.length}`,
    )
  }
  const matrix = createMatrix(mediatorCount, 0)
  let idx = 0
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j <= i; j++) {
      matrix[i]![j] = entries[idx++]!
    }
  }
  return matrix
}

/** Whether any cell in the matrix is set to 1. */
export function hasAnyOne(matrix: Matrix): boolean {
  return matrix.some((row) => row.some((cell) => cell === 1))
}

/**
 * Apply Hayes' S-4 invariant: WZ[i][j]=1 ⇒ W[i][j]=1 and Z[i][j]=1 (p. 624).
 * Returns the W and Z matrices, mutated to satisfy the invariant.
 */
export function propagateWZ(
  w: Matrix,
  z: Matrix,
  wz: Matrix,
): { w: Matrix; z: Matrix } {
  const wOut = w.map((row) => [...row])
  const zOut = z.map((row) => [...row])
  for (let i = 0; i < wz.length; i++) {
    for (let j = 0; j <= i; j++) {
      if (wz[i]![j] === 1) {
        wOut[i]![j] = 1
        zOut[i]![j] = 1
      }
    }
  }
  return { w: wOut, z: zOut }
}

/**
 * Resize all matrices to the new mediator count, keeping any overlapping
 * lower-triangle values from the old matrices.
 */
export function resizeMatrices(
  matrices: Record<MatrixKind, Matrix>,
  newMediatorCount: number,
): Record<MatrixKind, Matrix> {
  const n = newMediatorCount + 1
  const resize = (m: Matrix, defaultFn: () => Matrix): Matrix => {
    const fresh = defaultFn()
    const overlap = Math.min(m.length, n)
    for (let i = 0; i < overlap; i++) {
      for (let j = 0; j <= i; j++) {
        fresh[i]![j] = m[i]![j]!
      }
    }
    return fresh
  }
  return {
    b: resize(matrices.b, () => defaultBMatrix(newMediatorCount)),
    w: resize(matrices.w, () => defaultZeroMatrix(newMediatorCount)),
    z: resize(matrices.z, () => defaultZeroMatrix(newMediatorCount)),
    wz: resize(matrices.wz, () => defaultZeroMatrix(newMediatorCount)),
  }
}

/* ------------------------------------------------------------------------
 * C matrix (rectangular, covariates) — Hayes (2018) pp. 630-632
 * ----------------------------------------------------------------------- */

/** Default C matrix: every covariate enters every consequent equation. */
export function defaultCMatrix(mediatorCount: number, covariateCount: number): Matrix {
  const rows = mediatorCount + 1
  return Array.from({ length: rows }, () =>
    Array.from({ length: covariateCount }, () => 1),
  )
}

/** Serialize a rectangular matrix left-to-right, top-to-bottom (no skip). */
export function serializeRect(matrix: Matrix): string {
  return matrix.flat().join(',')
}

/** Parse a serialized rectangular cmatrix string into a (rows × cols) matrix. */
export function parseRect(value: string, rows: number, cols: number): Matrix {
  const entries = value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((s) => Number(s))
  const expected = rows * cols
  if (entries.length !== expected) {
    throw new Error(
      `Expected ${expected} entries for ${rows}×${cols} cmatrix, got ${entries.length}`,
    )
  }
  const m = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))
  let idx = 0
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      m[i]![j] = entries[idx++]!
    }
  }
  return m
}

/** Resize C matrix when mediator or covariate counts change. */
export function resizeCMatrix(
  c: Matrix,
  newMediatorCount: number,
  newCovariateCount: number,
): Matrix {
  const newRows = newMediatorCount + 1
  const fresh = defaultCMatrix(newMediatorCount, newCovariateCount)
  const overlapRows = Math.min(c.length, newRows)
  const overlapCols = Math.min(c[0]?.length ?? 0, newCovariateCount)
  for (let i = 0; i < overlapRows; i++) {
    for (let j = 0; j < overlapCols; j++) {
      fresh[i]![j] = c[i]![j]!
    }
  }
  return fresh
}

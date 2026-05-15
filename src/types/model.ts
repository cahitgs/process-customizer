/**
 * Domain types for the PROCESS Matrix Customizer.
 *
 * The B / W / Z / WZ matrices follow Hayes (2022), Appendix B:
 *   - shape: (k + 1) × (k + 1) where k = number of mediators
 *   - columns are antecedents in order: X, M1, M2, …, Mk
 *   - rows are consequents in order:    M1, M2, …, Mk, Y
 *   - cell [i][j] = 1 if antecedent column j sends an effect to consequent row i
 *   - upper triangle (j > i) is structurally zero (recursive-model constraint)
 *
 * The string serialization reads cells left-to-right, top-to-bottom, skipping
 * the upper triangle, producing exactly 0.5 * (k + 1) * (k + 2) entries.
 */

export type MatrixKind = 'b' | 'w' | 'z' | 'wz'

export type Matrix = number[][]

export interface Variables {
  x: string
  y: string
  mediators: string[]
  w: string
  z: string
  /** Covariates (Hayes 2022 p. 630-632). Each consequent equation can include
   *  any subset of these via the C matrix. Empty = no covariates. */
  covariates: string[]
}

export interface ModelState {
  variables: Variables
  matrices: Record<MatrixKind, Matrix>
  /** Rectangular (k+1) × p covariate matrix. Rows are consequents (M1…Mk, Y);
   *  columns are covariates in `variables.covariates` order. Cell = 1 means
   *  that covariate is included in that consequent's equation. */
  cMatrix: Matrix
  /** When set to a known PROCESS numbered model and the user has only edited
   *  W / Z / WZ, codegen will emit `/model=N` plus the override matrices
   *  instead of `/bmatrix=...` (Hayes 2022 pp. 625-630). */
  modelNumber: number | null
  /** Emit `/matrices=1` so PROCESS prints the B/W/Z/WZ matrices in its output
   *  (Hayes 2022 p. 626). */
  showMatrices: boolean
  /** Standard PROCESS analysis options. `null` means "don't emit; use PROCESS
   *  default". */
  options: ProcessOptions
}

/**
 * PROCESS macro options as documented in Hayes (2022), Appendix A
 * (pp. 551-583). The defaults match PROCESS's own defaults, so the codegen
 * only emits the option when the user has overridden it (`null` ⇒ use default).
 *
 * Verified against the syntax table on pp. 553-554. Notable points:
 *   - `center` is 0/1 only (NOT 0/1/2). p. 553, 572.
 *   - `hc` is HC0…HC4 (NOT HC5). p. 553, 576.
 *   - `decimals` uses the SPSS F-format (e.g., F10.4). p. 577.
 *   - `save` is 0/1/2: 1 saves bootstrap estimates, 2 saves coefficient detail. p. 575.
 *   - There is no `stand` option in this PROCESS release; standardized effects
 *     come from `effsize=1` (p. 569).
 */
export interface ProcessOptions {
  // ── Inference (bootstrap / Monte Carlo / Sobel) ──────────────────────────
  /** `/boot=N` — bootstrap samples (default 5000). p. 566. */
  boot: number | null
  /** `/maxboot=N` — max bootstrap attempts before giving up (default 10000). p. 567. */
  maxboot: number | null
  /** `/mc=N` — Monte Carlo samples instead of bootstrap (models 4 and 5 only). p. 566. */
  mc: number | null
  /** `/conf=K` — confidence level percentage (default 95; 50…99.9999). p. 566. */
  conf: number | null
  /** `/seed=N` — random seed for bootstrap / MC. p. 567. */
  seed: number | null
  /** `/normal=1` — Sobel test (models 4 and 5 only). p. 566. */
  normal: boolean
  /** `/hc=N` — heteroscedasticity-consistent SE estimator HC0…HC4. p. 576. */
  hc: 0 | 1 | 2 | 3 | 4 | null

  // ── Probing interactions ────────────────────────────────────────────────
  /** `/intprobe=α` — probe interactions only if p ≤ α (default 0.10). p. 570. */
  intprobe: number | null
  /** `/jn=1` — Johnson-Neyman technique. p. 571. */
  jn: boolean
  /** `/moments=1` — probe at sample mean ± 1 SD (for quantitative moderators). p. 570. */
  moments: boolean

  // ── Centering ───────────────────────────────────────────────────────────
  /** `/center=1` — mean-center variables used in product terms. p. 572. */
  center: 0 | 1 | null

  // ── Covariate placement (orthogonal to cmatrix) ─────────────────────────
  /** `/covmy=N` — 0=cov in all eqs, 1=cov in M only, 2=cov in Y only. p. 560. */
  covmy: 0 | 1 | 2 | null

  // ── Output ──────────────────────────────────────────────────────────────
  /** `/plot=N` — 1=table for plotting; 2=table with SE/CI. p. 569. */
  plot: 0 | 1 | 2 | null
  /** `/decimals=Fa.b` — output decimal format (default F10.4). p. 577. */
  decimals: string | null
  /** `/effsize=1` — partially and completely standardized effects (p. 569). */
  effsize: boolean
  /** `/total=1` — total effect of X on Y in unmoderated mediation (p. 569). */
  total: boolean
  /** `/modelbt=1` — bootstrap CIs for regression coefficients (p. 573). */
  modelbt: boolean
  /** `/covcoeff=1` — variance-covariance matrix of regression coefficients (p. 576). */
  covcoeff: boolean
  /** `/save=N` — 1=save bootstrap estimates, 2=save coefficient details. p. 575. */
  save: 0 | 1 | 2 | null
}

export const DEFAULT_OPTIONS: ProcessOptions = {
  boot: null,
  maxboot: null,
  mc: null,
  conf: null,
  seed: null,
  normal: false,
  hc: null,
  intprobe: null,
  jn: false,
  moments: false,
  center: null,
  covmy: null,
  plot: null,
  decimals: null,
  effsize: false,
  total: false,
  modelbt: false,
  covcoeff: false,
  save: null,
}

export type IssueSeverity = 'error' | 'warning'

export interface ValidationIssue {
  severity: IssueSeverity
  code:
    | 'S1_path_zero_moderated'
    | 'S2_z_without_w'
    | 'S3_dangling_mediator'
    | 'S3_variable_no_send'
    | 'S3_variable_no_receive'
    | 'S4_wz_overrides'
  message: string
  matrix?: MatrixKind
  cell?: { row: number; col: number }
}

export interface ValidationResult {
  issues: ValidationIssue[]
  hasErrors: boolean
}

export type Dialect = 'spss' | 'sas' | 'r'

export interface Preset {
  id: string
  label: string
  description: string
  /** Page reference into Hayes (2022) for traceability. */
  reference: string
  variables: Variables
  matrices: Record<MatrixKind, Matrix>
  /** Numbered PROCESS model this preset corresponds to, if any. Lets the
   *  codegen emit `/model=N` instead of `/bmatrix=...` while still allowing
   *  W/Z/WZ overrides on top (Hayes 2022 pp. 625-630). */
  modelNumber?: number
}

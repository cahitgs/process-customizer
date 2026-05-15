import type { ModelState, ValidationIssue, ValidationResult } from '@/types/model'
import { hasAnyOne } from './matrix'

/**
 * Validate a model against the rules in Hayes (2018), Appendix B (pp. 618, 624).
 *
 * - S-1: a path fixed to zero in B cannot be moderated (p. 624)
 * - S-2: if only one moderator is used, it must be W (p. 624)
 * - S-3: every variable must send and receive at least one effect; every
 *        declared mediator must do both (p. 618 — "dangling mediator")
 * - S-4: WZ=1 forces W,Z to 1 (p. 624) — reported as warning when source data
 *        has WZ=1 but W or Z entries are 0, since codegen auto-fixes it.
 */
export function validate(model: ModelState): ValidationResult {
  const issues: ValidationIssue[] = []
  const { variables, matrices } = model
  const { b, w, z, wz } = matrices
  const n = b.length

  // S-1: a path fixed to zero cannot be moderated
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      if (b[i]![j] === 0) {
        for (const kind of ['w', 'z', 'wz'] as const) {
          if (matrices[kind][i]![j] === 1) {
            issues.push({
              severity: 'error',
              code: 'S1_path_zero_moderated',
              matrix: kind,
              cell: { row: i, col: j },
              message: `Path is fixed to zero in B — cannot be moderated in ${kind.toUpperCase()}.`,
            })
          }
        }
      }
    }
  }

  // S-2: Z requires W
  const wActive = hasAnyOne(w) || hasAnyOne(wz)
  const zActive = hasAnyOne(z) || hasAnyOne(wz)
  if (zActive && !wActive) {
    issues.push({
      severity: 'error',
      code: 'S2_z_without_w',
      message:
        'Z is used but W is empty. Hayes (2018) p. 624: a single moderator must be W, not Z.',
    })
  }

  // S-3: dangling mediator and send/receive constraints
  // columnSends[j]: does column j send at least one effect (any 1 in column j of B)?
  // rowReceives[i]: does row i receive at least one effect?
  for (let col = 0; col < n; col++) {
    let sends = false
    for (let row = col; row < n; row++) {
      if (b[row]![col] === 1) {
        sends = true
        break
      }
    }
    if (!sends) {
      const label = col === 0 ? variables.x : variables.mediators[col - 1]!
      issues.push({
        severity: 'error',
        code: 'S3_variable_no_send',
        message: `${label} sends no effect — every variable must send at least one effect (Hayes 2018 p. 618).`,
      })
    }
  }
  for (let row = 0; row < n; row++) {
    let receives = false
    for (let col = 0; col <= row; col++) {
      if (b[row]![col] === 1) {
        receives = true
        break
      }
    }
    if (!receives) {
      const label = row < n - 1 ? variables.mediators[row]! : variables.y
      issues.push({
        severity: 'error',
        code: 'S3_variable_no_receive',
        message: `${label} receives no effect — every variable must receive at least one effect (Hayes 2018 p. 618).`,
      })
    }
  }
  // Dangling mediator: a mediator that fails send OR receive
  for (let m = 0; m < variables.mediators.length; m++) {
    const mediatorCol = m + 1
    const mediatorRow = m
    let sends = false
    let receives = false
    for (let row = mediatorCol; row < n; row++) {
      if (b[row]![mediatorCol] === 1) sends = true
    }
    for (let col = 0; col <= mediatorRow; col++) {
      if (b[mediatorRow]![col] === 1) receives = true
    }
    if (!sends || !receives) {
      issues.push({
        severity: 'error',
        code: 'S3_dangling_mediator',
        message: `Mediator "${variables.mediators[m]}" must both send and receive at least one effect (Hayes 2018 p. 618).`,
      })
    }
  }

  // S-4: WZ override warning (informational; codegen auto-applies the invariant)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      if (wz[i]![j] === 1 && (w[i]![j] === 0 || z[i]![j] === 0)) {
        issues.push({
          severity: 'warning',
          code: 'S4_wz_overrides',
          matrix: 'wz',
          cell: { row: i, col: j },
          message:
            'WZ = 1 forces W and Z to 1 (Hayes 2018 p. 624). Generated code will reflect this.',
        })
      }
    }
  }

  return {
    issues,
    hasErrors: issues.some((i) => i.severity === 'error'),
  }
}

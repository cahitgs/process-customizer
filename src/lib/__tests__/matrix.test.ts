import { describe, expect, it } from 'vitest'
import {
  createMatrix,
  defaultBMatrix,
  entryCount,
  hasAnyOne,
  isEditableCell,
  parse,
  propagateWZ,
  serialize,
} from '../matrix'

describe('matrix utilities', () => {
  it('entryCount matches Hayes (2022) p. 618 formula 0.5(k+1)(k+2)', () => {
    expect(entryCount(0)).toBe(1)
    expect(entryCount(1)).toBe(3)
    expect(entryCount(2)).toBe(6)
    expect(entryCount(3)).toBe(10)
    expect(entryCount(6)).toBe(28)
  })

  it('createMatrix produces a (k+1)×(k+1) matrix of zeros', () => {
    const m = createMatrix(3, 0)
    expect(m.length).toBe(4)
    expect(m.every((row) => row.length === 4)).toBe(true)
    expect(m.flat().every((v) => v === 0)).toBe(true)
  })

  it('defaultBMatrix has 1s in the lower triangle and 0s in the upper', () => {
    const m = defaultBMatrix(3)
    expect(m.length).toBe(4)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        expect(m[i]![j]).toBe(j <= i ? 1 : 0)
      }
    }
  })

  it('isEditableCell respects the recursive constraint (j ≤ i)', () => {
    expect(isEditableCell(0, 0)).toBe(true)
    expect(isEditableCell(2, 1)).toBe(true)
    expect(isEditableCell(1, 2)).toBe(false)
    expect(isEditableCell(0, 3)).toBe(false)
  })

  it('serialize/parse round-trip Fig. B.3 bmatrix (p. 620)', () => {
    const original = '1,1,0,0,1,1,1,1,0,1'
    const m = parse(original, 3)
    expect(serialize(m)).toBe(original)
  })

  it('serialize matches Hayes Fig. B.2 examples', () => {
    // Panel A: simple mediation
    expect(serialize(parse('1,1,1', 1))).toBe('1,1,1')
    // Panel B: parallel multiple mediator (k=3)
    expect(serialize(parse('1,1,0,1,0,0,1,1,1,1', 3))).toBe('1,1,0,1,0,0,1,1,1,1')
    // Panel C: serial multiple mediator (k=2)
    expect(serialize(parse('1,1,1,1,1,1', 2))).toBe('1,1,1,1,1,1')
    // Panel D: serial with direct + M1→Y fixed to zero
    expect(serialize(parse('1,1,1,0,0,1', 2))).toBe('1,1,1,0,0,1')
  })

  it('parse throws when entry count is wrong', () => {
    expect(() => parse('1,1,1,1', 1)).toThrow(/Expected 3 entries/)
  })

  it('propagateWZ applies S-4 invariant (Hayes p. 624)', () => {
    const wRaw = parse('0,0,0,0,0,0,0,0,0,0', 3)
    const zRaw = parse('0,0,0,0,0,0,0,0,0,0', 3)
    const wz = parse('1,0,0,0,0,0,1,0,0,0', 3)
    const { w, z } = propagateWZ(wRaw, zRaw, wz)
    expect(serialize(w)).toBe('1,0,0,0,0,0,1,0,0,0')
    expect(serialize(z)).toBe('1,0,0,0,0,0,1,0,0,0')
  })

  it('hasAnyOne detects 1s', () => {
    expect(hasAnyOne(createMatrix(3, 0))).toBe(false)
    expect(hasAnyOne(defaultBMatrix(3))).toBe(true)
  })
})

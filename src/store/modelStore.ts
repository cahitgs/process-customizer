import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MatrixKind, ModelState, ProcessOptions, Variables } from '@/types/model'
import { DEFAULT_OPTIONS } from '@/types/model'
import {
  defaultBMatrix,
  defaultCMatrix,
  defaultZeroMatrix,
  isEditableCell,
  propagateWZ,
  resizeCMatrix,
  resizeMatrices,
} from '@/lib/matrix'
import { getPreset } from '@/lib/presets'

interface ModelStore extends ModelState {
  setVariable: <K extends keyof Variables>(key: K, value: Variables[K]) => void
  setMediators: (mediators: string[]) => void
  setCovariates: (covariates: string[]) => void
  toggleCell: (matrix: MatrixKind, row: number, col: number) => void
  toggleCMatrixCell: (row: number, col: number) => void
  setShowMatrices: (show: boolean) => void
  /** Reset the modelNumber link, forcing codegen back to bmatrix form. */
  clearModelNumber: () => void
  setOption: <K extends keyof ProcessOptions>(key: K, value: ProcessOptions[K]) => void
  resetOptions: () => void
  loadPreset: (id: string) => void
  reset: () => void
}

const DEFAULT_PRESET_ID = 'fig-b3'

function presetInitialState(id: string): ModelState {
  const preset = getPreset(id)
  if (preset) {
    return {
      variables: preset.variables,
      matrices: preset.matrices,
      cMatrix: defaultCMatrix(preset.variables.mediators.length, preset.variables.covariates.length),
      modelNumber: preset.modelNumber ?? null,
      showMatrices: false,
      options: { ...DEFAULT_OPTIONS },
    }
  }
  // Fallback
  const variables: Variables = {
    x: 'X',
    y: 'Y',
    mediators: ['M'],
    w: 'W',
    z: 'Z',
    covariates: [],
  }
  return {
    variables,
    matrices: {
      b: defaultBMatrix(1),
      w: defaultZeroMatrix(1),
      z: defaultZeroMatrix(1),
      wz: defaultZeroMatrix(1),
    },
    cMatrix: defaultCMatrix(1, 0),
    modelNumber: null,
    showMatrices: false,
    options: { ...DEFAULT_OPTIONS },
  }
}

function cloneMatrices(state: ModelState): ModelState['matrices'] {
  return {
    b: state.matrices.b.map((row) => [...row]),
    w: state.matrices.w.map((row) => [...row]),
    z: state.matrices.z.map((row) => [...row]),
    wz: state.matrices.wz.map((row) => [...row]),
  }
}

function cloneCMatrix(c: number[][]): number[][] {
  return c.map((row) => [...row])
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      ...presetInitialState(DEFAULT_PRESET_ID),

      setVariable: (key, value) =>
        set((state) => ({
          variables: { ...state.variables, [key]: value },
        })),

      setMediators: (mediators) =>
        set((state) => {
          const capped = mediators.slice(0, 6) // Hayes (2018) p. 618: max 6
          const matrices = resizeMatrices(state.matrices, capped.length)
          const cMatrix = resizeCMatrix(
            state.cMatrix,
            capped.length,
            state.variables.covariates.length,
          )
          return {
            variables: { ...state.variables, mediators: capped },
            matrices,
            cMatrix,
            // Changing the mediator set invalidates any numbered-model link
            modelNumber: null,
          }
        }),

      setCovariates: (covariates) =>
        set((state) => {
          const cMatrix = resizeCMatrix(
            state.cMatrix,
            state.variables.mediators.length,
            covariates.length,
          )
          return {
            variables: { ...state.variables, covariates },
            cMatrix,
          }
        }),

      toggleCell: (matrix, row, col) =>
        set((state) => {
          if (!isEditableCell(row, col)) return state
          const matrices = cloneMatrices(state)
          const current = matrices[matrix][row]![col]!
          matrices[matrix][row]![col] = current === 1 ? 0 : 1

          // S-4: WZ ⇒ W and Z
          const { w, z } = propagateWZ(matrices.w, matrices.z, matrices.wz)
          matrices.w = w
          matrices.z = z

          // Editing B drops the numbered-model link; numbered models have a
          // fixed B per Hayes 2018 p. 626 ("All but the B matrix can be
          // reprogrammed when editing a model").
          const nextModelNumber = matrix === 'b' ? null : state.modelNumber

          return { matrices, modelNumber: nextModelNumber }
        }),

      toggleCMatrixCell: (row, col) =>
        set((state) => {
          const cMatrix = cloneCMatrix(state.cMatrix)
          if (!cMatrix[row] || cMatrix[row][col] === undefined) return state
          cMatrix[row][col] = cMatrix[row][col] === 1 ? 0 : 1
          return { cMatrix }
        }),

      setShowMatrices: (show) => set(() => ({ showMatrices: show })),

      clearModelNumber: () => set(() => ({ modelNumber: null })),

      setOption: (key, value) =>
        set((state) => ({ options: { ...state.options, [key]: value } })),

      resetOptions: () => set(() => ({ options: { ...DEFAULT_OPTIONS } })),

      loadPreset: (id) =>
        set(() => {
          const next = presetInitialState(id)
          return next
        }),

      reset: () => set(() => presetInitialState(DEFAULT_PRESET_ID)),
    }),
    {
      name: 'process-customizer-state',
      version: 3,
    },
  ),
)

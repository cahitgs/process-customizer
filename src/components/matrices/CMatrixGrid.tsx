import { useShallow } from 'zustand/react/shallow'
import { useModelStore } from '@/store/modelStore'
import { cn } from '@/lib/utils'

/**
 * Rectangular C-matrix grid (Hayes 2018 pp. 630-632).
 *
 * Rows = consequent variables (M₁…Mₖ, Y).
 * Columns = covariates declared in `variables.covariates`.
 * Cell = 1 if that covariate enters the equation for that consequent.
 *
 * Differs from the B/W/Z/WZ grids in that it has no upper-triangle constraint —
 * every cell is editable.
 */
export function CMatrixGrid() {
  const { variables, cMatrix } = useModelStore(
    useShallow((s) => ({ variables: s.variables, cMatrix: s.cMatrix })),
  )
  const toggle = useModelStore((s) => s.toggleCMatrixCell)

  if (variables.covariates.length === 0) {
    return (
      <p className="text-xs text-[var(--color-muted-fg)]">
        No covariates declared. Add covariate names in the Variables panel to enable the C matrix.
      </p>
    )
  }

  const rowLabels = [...variables.mediators, variables.y]

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="h-9 w-20 border bg-[var(--color-muted)] px-2 text-left text-xs font-medium text-[var(--color-muted-fg)]">
              C
            </th>
            {variables.covariates.map((label, j) => (
              <th
                key={j}
                className="h-9 min-w-[3.5rem] border bg-[var(--color-muted)] px-2 text-xs font-medium text-[var(--color-muted-fg)]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((rowLabel, i) => (
            <tr key={i}>
              <th
                scope="row"
                className="h-9 w-20 border bg-[var(--color-muted)] px-2 text-left text-xs font-medium text-[var(--color-muted-fg)]"
              >
                {rowLabel}
              </th>
              {variables.covariates.map((_, j) => {
                const value = (cMatrix[i]?.[j] ?? 0) as 0 | 1
                return (
                  <td key={j} className="border p-0">
                    <button
                      type="button"
                      role="gridcell"
                      aria-pressed={value === 1}
                      aria-label={`C cell row ${i + 1}, column ${j + 1}, value ${value}`}
                      onClick={() => toggle(i, j)}
                      className={cn(
                        'h-9 w-full select-none text-center text-sm font-medium transition-colors',
                        value === 1
                          ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
                          : 'bg-[var(--color-bg)] text-[var(--color-fg)] hover:bg-[var(--color-muted)]',
                      )}
                    >
                      {value}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

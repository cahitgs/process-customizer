import { useMemo } from 'react'
import { MatrixCell } from './MatrixCell'
import { useModelStore } from '@/store/modelStore'
import type { MatrixKind, ValidationIssue } from '@/types/model'
import { isEditableCell } from '@/lib/matrix'

interface MatrixGridProps {
  matrix: MatrixKind
  issues: ValidationIssue[]
}

export function MatrixGrid({ matrix, issues }: MatrixGridProps) {
  const variables = useModelStore((s) => s.variables)
  const matrices = useModelStore((s) => s.matrices)
  const toggleCell = useModelStore((s) => s.toggleCell)

  const columnLabels = [variables.x, ...variables.mediators]
  const rowLabels = [...variables.mediators, variables.y]
  const m = matrices[matrix]

  const issueLookup = useMemo(() => {
    const set = new Set<string>()
    for (const issue of issues) {
      if (issue.matrix === matrix && issue.cell) {
        set.add(`${issue.cell.row}-${issue.cell.col}`)
      }
    }
    return set
  }, [issues, matrix])

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="h-9 w-20 border bg-[var(--color-muted)] px-2 text-left text-xs font-medium text-[var(--color-muted-fg)]">
              {matrix.toUpperCase()}
            </th>
            {columnLabels.map((label, j) => (
              <th
                key={j}
                className="h-9 min-w-[3rem] border bg-[var(--color-muted)] px-2 text-xs font-medium text-[var(--color-muted-fg)]"
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
              {columnLabels.map((_, j) => {
                const editable = isEditableCell(i, j)
                const value = (editable ? m[i]![j]! : 0) as 0 | 1
                const disabledByBZero =
                  matrix !== 'b' && editable && matrices.b[i]![j] === 0
                const lockedByWZ =
                  (matrix === 'w' || matrix === 'z') &&
                  editable &&
                  matrices.wz[i]![j] === 1 &&
                  value === 1
                return (
                  <MatrixCell
                    key={j}
                    matrix={matrix}
                    row={i}
                    col={j}
                    value={value}
                    disabledByRecursion={!editable}
                    disabledByBZero={disabledByBZero}
                    lockedByWZ={lockedByWZ}
                    hasIssue={issueLookup.has(`${i}-${j}`)}
                    onToggle={() => toggleCell(matrix, i, j)}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

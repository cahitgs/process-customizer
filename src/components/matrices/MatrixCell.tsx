import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { MatrixKind } from '@/types/model'

interface MatrixCellProps {
  value: 0 | 1
  matrix: MatrixKind
  row: number
  col: number
  /** Cell is in the upper triangle — structurally zero per the recursive constraint. */
  disabledByRecursion?: boolean
  /** B[row][col] is 0, so W/Z/WZ at this position cannot be 1 (S-1). */
  disabledByBZero?: boolean
  /** WZ at this position is 1, forcing W/Z here to 1 (S-4). Cell is locked-on. */
  lockedByWZ?: boolean
  /** Cell has an active validation issue. */
  hasIssue?: boolean
  onToggle: () => void
}

export function MatrixCell({
  value,
  matrix,
  row,
  col,
  disabledByRecursion,
  disabledByBZero,
  lockedByWZ,
  hasIssue,
  onToggle,
}: MatrixCellProps) {
  if (disabledByRecursion) {
    return (
      <td
        className="h-9 w-9 cursor-not-allowed select-none border bg-[var(--color-muted)] text-center text-xs text-[var(--color-muted-fg)]"
        aria-disabled="true"
      >
        ■
      </td>
    )
  }

  const cell = (
    <button
      type="button"
      role="gridcell"
      aria-pressed={value === 1}
      aria-label={`${matrix.toUpperCase()} cell row ${row + 1}, column ${col + 1}, value ${value}`}
      onClick={onToggle}
      disabled={disabledByBZero || lockedByWZ}
      className={cn(
        'h-9 w-full select-none text-center text-sm font-medium transition-colors',
        value === 1
          ? matrix === 'b'
            ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
            : matrix === 'w'
              ? 'bg-[var(--color-w)] text-white'
              : matrix === 'z'
                ? 'bg-[var(--color-z)] text-white'
                : 'bg-[var(--color-warning)] text-[var(--color-fg)]'
          : 'bg-[var(--color-bg)] text-[var(--color-fg)] hover:bg-[var(--color-muted)]',
        disabledByBZero && 'opacity-30 cursor-not-allowed bg-[var(--color-muted)]',
        lockedByWZ && 'cursor-not-allowed',
        hasIssue && 'ring-2 ring-[var(--color-danger)] ring-inset',
      )}
    >
      {value}
      {lockedByWZ && (
        <span className="ml-0.5 align-super text-[0.6rem] opacity-80">↑WZ</span>
      )}
    </button>
  )

  if (disabledByBZero) {
    return (
      <td className="border p-0">
        <Tooltip>
          <TooltipTrigger asChild>{cell}</TooltipTrigger>
          <TooltipContent>
            Path is fixed to zero in B — cannot be moderated. Toggle B[{row + 1}][{col + 1}] first.
          </TooltipContent>
        </Tooltip>
      </td>
    )
  }

  if (lockedByWZ) {
    return (
      <td className="border p-0">
        <Tooltip>
          <TooltipTrigger asChild>{cell}</TooltipTrigger>
          <TooltipContent>
            Locked by WZ. PROCESS forces W and Z to 1 wherever WZ is 1 (Hayes 2022, p. 624).
          </TooltipContent>
        </Tooltip>
      </td>
    )
  }

  return <td className="border p-0">{cell}</td>
}

import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import type { ValidationIssue } from '@/types/model'

interface ValidationBadgeProps {
  issues: ValidationIssue[]
}

export function ValidationBadge({ issues }: ValidationBadgeProps) {
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')

  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-muted)] px-2 py-0.5 text-xs font-medium text-[var(--color-success)]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Valid model
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {errors.length > 0 && (
        <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-muted)] px-2 py-0.5 text-xs font-medium text-[var(--color-danger)]">
          <AlertCircle className="h-3.5 w-3.5" />
          {errors.length} error{errors.length !== 1 && 's'}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-muted)] px-2 py-0.5 text-xs font-medium text-[var(--color-warning)]">
          <AlertTriangle className="h-3.5 w-3.5" />
          {warnings.length} warning{warnings.length !== 1 && 's'}
        </div>
      )}
    </div>
  )
}

interface IssueListProps {
  issues: ValidationIssue[]
}

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) return null
  return (
    <ul className="space-y-1.5 text-xs">
      {issues.map((issue, idx) => (
        <li
          key={idx}
          className={
            issue.severity === 'error'
              ? 'flex gap-2 text-[var(--color-danger)]'
              : 'flex gap-2 text-[var(--color-warning)]'
          }
        >
          {issue.severity === 'error' ? (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <span>{issue.message}</span>
        </li>
      ))}
    </ul>
  )
}

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Node } from '@xyflow/react'
import type { ModeratorNodeData } from './graph'
import { cn } from '@/lib/utils'

type ModeratorNodeType = Node<ModeratorNodeData, 'moderatorNode'>

/**
 * Editorial moderator chip — fully-rounded "annotation" pill in the moderator's
 * accent color, italic serif label so it reads like a marginal note next to
 * the matrix paths it conditions.
 */
export function ModeratorNode({ data }: NodeProps<ModeratorNodeType>) {
  const tone = data.role === 'w' ? 'var(--color-w)' : 'var(--color-z)'
  return (
    <div
      className={cn(
        'flex h-9 min-w-[4.5rem] items-center justify-center gap-1.5 px-3.5',
        'rounded-full border bg-[var(--color-card)]',
        '[box-shadow:var(--shadow-soft)] transition-all duration-200',
        'hover:-translate-y-px hover:[box-shadow:var(--shadow-lifted)]',
      )}
      style={{ borderColor: tone, color: tone }}
      aria-label={`${data.role.toUpperCase()} moderator: ${data.label}`}
    >
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      <span
        className="font-serif text-[0.75rem] italic font-semibold leading-none"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
      >
        {data.role}
      </span>
      <span className="text-[0.78rem] font-medium tracking-tight">{data.label}</span>
    </div>
  )
}

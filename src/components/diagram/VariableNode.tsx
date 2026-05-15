import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Node } from '@xyflow/react'
import type { VariableNodeData } from './graph'
import { cn } from '@/lib/utils'

type VariableNodeType = Node<VariableNodeData, 'variableNode'>

const ROLE_LABEL: Record<VariableNodeData['role'], string> = {
  x: 'X',
  m: 'M',
  y: 'Y',
}

/**
 * Editorial variable node — paper card with a serif name, oldstyle-figure
 * subscript role badge, and a hairline accent border in the role's hue.
 */
export function VariableNode({ data }: NodeProps<VariableNodeType>) {
  const roleVar =
    data.role === 'x'
      ? 'var(--color-accent)'
      : data.role === 'm'
        ? 'var(--color-warning)'
        : 'var(--color-success)'
  return (
    <div
      className={cn(
        'group relative flex h-12 min-w-[5.5rem] items-center justify-center gap-1.5 px-4',
        'rounded-[3px] border-l-2 bg-[var(--color-card)] text-[var(--color-fg)]',
        '[box-shadow:var(--shadow-soft)] transition-all duration-200',
        'hover:-translate-y-px hover:[box-shadow:var(--shadow-lifted)]',
        'border-y border-r border-y-[var(--color-border)] border-r-[var(--color-border)]',
      )}
      style={{ borderLeftColor: roleVar }}
      aria-label={`${ROLE_LABEL[data.role]} variable: ${data.label}`}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <span
        className="font-serif text-[0.95rem] font-semibold leading-none tracking-tight"
        style={{ fontVariationSettings: '"opsz" 36, "SOFT" 30, "WONK" 0' }}
      >
        {data.label}
      </span>
      <span
        className="font-serif text-[0.7rem] italic leading-none"
        style={{
          color: roleVar,
          fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
        }}
      >
        {ROLE_LABEL[data.role]}
      </span>
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  )
}

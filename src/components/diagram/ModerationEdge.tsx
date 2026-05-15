import { BaseEdge, useStore, type EdgeProps, type Edge } from '@xyflow/react'
import { useMemo } from 'react'

export interface ModerationEdgeData extends Record<string, unknown> {
  /** Node ID for the source of the moderated B-path. */
  modPathSourceId: string
  /** Node ID for the target of the moderated B-path. */
  modPathTargetId: string
  moderator: 'w' | 'z'
}

type ModerationEdgeType = Edge<ModerationEdgeData, 'moderationEdge'>

/**
 * Dashed colored arrow from a moderator (W or Z) to the *midpoint* of a B-path.
 * The target is a computed point, not a node, so we ignore React Flow's
 * built-in targetX/targetY and read the moderated path's two endpoints from
 * the store to derive the midpoint live (so the arrow follows when the user
 * drags the X / M / Y nodes).
 */
export function ModerationEdge({
  id,
  sourceX,
  sourceY,
  data,
}: EdgeProps<ModerationEdgeType>) {
  const pathSourceX = useStore((s) => {
    if (!data) return undefined
    const n = s.nodeLookup.get(data.modPathSourceId)
    if (!n) return undefined
    const x = n.internals.positionAbsolute.x + (n.measured?.width ?? 0) / 2
    return x
  })
  const pathSourceY = useStore((s) => {
    if (!data) return undefined
    const n = s.nodeLookup.get(data.modPathSourceId)
    if (!n) return undefined
    return n.internals.positionAbsolute.y + (n.measured?.height ?? 0) / 2
  })
  const pathTargetX = useStore((s) => {
    if (!data) return undefined
    const n = s.nodeLookup.get(data.modPathTargetId)
    if (!n) return undefined
    return n.internals.positionAbsolute.x + (n.measured?.width ?? 0) / 2
  })
  const pathTargetY = useStore((s) => {
    if (!data) return undefined
    const n = s.nodeLookup.get(data.modPathTargetId)
    if (!n) return undefined
    return n.internals.positionAbsolute.y + (n.measured?.height ?? 0) / 2
  })

  const midpoint = useMemo(() => {
    if (
      pathSourceX === undefined ||
      pathSourceY === undefined ||
      pathTargetX === undefined ||
      pathTargetY === undefined
    ) {
      return null
    }
    return {
      x: (pathSourceX + pathTargetX) / 2,
      y: (pathSourceY + pathTargetY) / 2,
    }
  }, [pathSourceX, pathSourceY, pathTargetX, pathTargetY])

  if (!midpoint || !data) return null

  const color =
    data.moderator === 'w' ? 'var(--color-w)' : 'var(--color-z)'

  // Back the arrow off the midpoint so the head lands just outside the W / Z
  // chip rendered there (the chip is a ~20 px circle).
  const dx = midpoint.x - sourceX
  const dy = midpoint.y - sourceY
  const len = Math.hypot(dx, dy)
  const chipOffset = 16
  const factor = len > chipOffset ? (len - chipOffset) / len : 0
  const endX = sourceX + dx * factor
  const endY = sourceY + dy * factor

  const edgePath = `M ${sourceX} ${sourceY} L ${endX} ${endY}`

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={`url(#moderation-arrow-${data.moderator})`}
      style={{
        stroke: color,
        strokeWidth: 1.25,
        strokeDasharray: '4 4',
        opacity: 0.85,
      }}
    />
  )
}

import {
  BaseEdge,
  EdgeLabelRenderer,
  useStore,
  type EdgeProps,
  type Edge,
} from '@xyflow/react'
import type { PathEdgeData } from './graph'

type PathEdgeType = Edge<PathEdgeData, 'pathEdge'>

/**
 * Solid arrow from source to target.
 *
 * Instead of using `getStraightPath` (which terminates the line at the
 * destination node's *fixed handle position*, causing all incoming arrows to
 * stack on top of each other at the same point), we compute the line ourselves
 * from the source node's center to the destination node's center, then clip
 * each end to the node's rectangle. The result: each incoming arrow enters the
 * destination at a different point on its perimeter depending on the source's
 * angle of approach, so multiple converging arrows fan out instead of stacking.
 *
 * The terminal clip also keeps the arrow head visible just outside the
 * destination node (the bug the original tool had — see plan file).
 */
export function PathEdge({ id, source, target, data, markerEnd }: EdgeProps<PathEdgeType>) {
  const geom = useStore((s) => {
    const src = s.nodeLookup.get(source)
    const dst = s.nodeLookup.get(target)
    if (!src || !dst) return null
    const sw = src.measured?.width ?? 0
    const sh = src.measured?.height ?? 0
    const dw = dst.measured?.width ?? 0
    const dh = dst.measured?.height ?? 0
    return {
      sx: src.internals.positionAbsolute.x + sw / 2,
      sy: src.internals.positionAbsolute.y + sh / 2,
      tx: dst.internals.positionAbsolute.x + dw / 2,
      ty: dst.internals.positionAbsolute.y + dh / 2,
      sHalfW: sw / 2,
      sHalfH: sh / 2,
      dHalfW: dw / 2,
      dHalfH: dh / 2,
    }
  })

  if (!geom) return null

  const { sx, sy, tx, ty, sHalfW, sHalfH, dHalfW, dHalfH } = geom
  const dx = tx - sx
  const dy = ty - sy
  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) return null

  // Clip from source center forward to its perimeter (the line starts just
  // outside the source node).
  const sx_factor =
    Math.abs(dx) > 0.0001 ? sHalfW / Math.abs(dx) : Infinity
  const sy_factor =
    Math.abs(dy) > 0.0001 ? sHalfH / Math.abs(dy) : Infinity
  const sFactor = Math.min(sx_factor, sy_factor)
  const sourceX = sx + sFactor * dx
  const sourceY = sy + sFactor * dy

  // Clip from target center backward to its perimeter (the line ends just
  // outside the destination node so the arrow head is visible).
  const dx_factor =
    Math.abs(dx) > 0.0001 ? dHalfW / Math.abs(dx) : Infinity
  const dy_factor =
    Math.abs(dy) > 0.0001 ? dHalfH / Math.abs(dy) : Infinity
  const tFactor = Math.min(dx_factor, dy_factor)
  const targetX = tx - tFactor * dx
  const targetY = ty - tFactor * dy

  const edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
  const labelX = (sourceX + targetX) / 2
  const labelY = (sourceY + targetY) / 2

  const isModerated = data?.wModerated || data?.zModerated || data?.wzModerated
  const strokeDasharray = isModerated ? '6 4' : undefined

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: 'var(--color-fg)',
          strokeWidth: 1.5,
          strokeDasharray,
        }}
      />
      {isModerated && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className="pointer-events-none flex gap-0.5"
          >
            {data?.wModerated && (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-w)] px-1.5 text-[0.6rem] font-bold text-white shadow-md">
                W
              </span>
            )}
            {data?.zModerated && (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-z)] px-1.5 text-[0.6rem] font-bold text-white shadow-md">
                Z
              </span>
            )}
            {data?.wzModerated && (
              <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-[var(--color-warning)] px-1.5 text-[0.6rem] font-bold text-[var(--color-fg)] shadow-md">
                WZ
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

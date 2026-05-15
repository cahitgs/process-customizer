import type { Node, Edge } from '@xyflow/react'
import type { Matrix, MatrixKind, Variables } from '@/types/model'
import type { ModerationEdgeData } from './ModerationEdge'

type DiagramModel = { variables: Variables; matrices: Record<MatrixKind, Matrix> }

export interface PathEdgeData extends Record<string, unknown> {
  wModerated: boolean
  zModerated: boolean
  wzModerated: boolean
  /** Human-readable label for accessibility. */
  pathLabel: string
}

export interface VariableNodeData extends Record<string, unknown> {
  label: string
  role: 'x' | 'm' | 'y'
}

export interface ModeratorNodeData extends Record<string, unknown> {
  label: string
  role: 'w' | 'z'
  active: boolean
}

// Compact "world coordinates" — React Flow's fitView scales the whole layout
// into the canvas, so the absolute values matter less than their ratios. Keep
// them tight so even a narrow column gets a readable starting layout.
const X_LEFT = 40
const Y_RIGHT = 460
const MIDDLE_X = 250
const MIDDLE_Y = 200
const STRIDE_Y = 80

/**
 * Initial node positions for the canvas. The user can freely drag from here.
 * Lays X out at the left, Y at the right, mediators stacked in the middle,
 * and W/Z above the mediators.
 */
export function computeNodes(model: DiagramModel): Node[] {
  const { variables, matrices } = model
  const nodes: Node[] = []

  // X
  nodes.push({
    id: 'var-x',
    type: 'variableNode',
    position: { x: X_LEFT, y: MIDDLE_Y },
    data: { label: variables.x, role: 'x' } satisfies VariableNodeData,
  })

  // Mediators stacked vertically in the middle
  const k = variables.mediators.length
  variables.mediators.forEach((label, idx) => {
    const offset = (idx - (k - 1) / 2) * STRIDE_Y
    nodes.push({
      id: `var-m-${idx}`,
      type: 'variableNode',
      position: { x: MIDDLE_X, y: MIDDLE_Y + offset },
      data: { label, role: 'm' } satisfies VariableNodeData,
    })
  })

  // Y
  nodes.push({
    id: 'var-y',
    type: 'variableNode',
    position: { x: Y_RIGHT, y: MIDDLE_Y },
    data: { label: variables.y, role: 'y' } satisfies VariableNodeData,
  })

  // Moderators are only rendered when at least one matrix references them.
  // Otherwise an empty W or Z visually clutters the diagram for users who
  // aren't yet (or aren't ever) using moderation.
  const wActive = matrices.w.some((r) => r.some((c) => c === 1))
  const zActive = matrices.z.some((r) => r.some((c) => c === 1))
  const wzActive = matrices.wz.some((r) => r.some((c) => c === 1))

  if (wActive || wzActive) {
    nodes.push({
      id: 'mod-w',
      type: 'moderatorNode',
      position: { x: 120, y: 40 },
      data: { label: variables.w, role: 'w', active: true } satisfies ModeratorNodeData,
    })
  }
  if (zActive || wzActive) {
    nodes.push({
      id: 'mod-z',
      type: 'moderatorNode',
      position: { x: 360, y: 40 },
      data: { label: variables.z, role: 'z', active: true } satisfies ModeratorNodeData,
    })
  }

  return nodes
}

/**
 * Translate B / W / Z / WZ into edges. Each B[i][j]=1 becomes a solid path edge
 * from the column variable to the row variable. Each W / Z entry at the same
 * cell additionally becomes a dashed moderation edge from the moderator node
 * to the *midpoint* of that B-path (rendered live by ModerationEdge).
 */
export function computeEdges(model: DiagramModel): Edge[] {
  const { variables, matrices } = model
  const edges: Edge[] = []

  const colId = (j: number) => (j === 0 ? 'var-x' : `var-m-${j - 1}`)
  const rowId = (i: number) =>
    i < variables.mediators.length ? `var-m-${i}` : 'var-y'
  const colLabel = (j: number) => (j === 0 ? variables.x : variables.mediators[j - 1]!)
  const rowLabel = (i: number) =>
    i < variables.mediators.length ? variables.mediators[i]! : variables.y

  for (let i = 0; i < matrices.b.length; i++) {
    for (let j = 0; j <= i; j++) {
      if (matrices.b[i]![j] !== 1) continue

      const wModerated = matrices.w[i]![j] === 1
      const zModerated = matrices.z[i]![j] === 1
      const wzModerated = matrices.wz[i]![j] === 1

      edges.push({
        id: `path-${j}-${i}`,
        source: colId(j),
        target: rowId(i),
        type: 'pathEdge',
        data: {
          wModerated,
          zModerated,
          wzModerated,
          pathLabel: `${colLabel(j)} → ${rowLabel(i)}`,
        } satisfies PathEdgeData,
      })

      if (wModerated) {
        edges.push({
          id: `mod-w-${j}-${i}`,
          source: 'mod-w',
          target: rowId(i),
          type: 'moderationEdge',
          data: {
            modPathSourceId: colId(j),
            modPathTargetId: rowId(i),
            moderator: 'w',
          } satisfies ModerationEdgeData,
        })
      }
      if (zModerated) {
        edges.push({
          id: `mod-z-${j}-${i}`,
          source: 'mod-z',
          target: rowId(i),
          type: 'moderationEdge',
          data: {
            modPathSourceId: colId(j),
            modPathTargetId: rowId(i),
            moderator: 'z',
          } satisfies ModerationEdgeData,
        })
      }
    }
  }

  return edges
}

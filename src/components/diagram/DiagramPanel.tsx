import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MarkerType,
  applyNodeChanges,
  useReactFlow,
  type Node,
  type NodeChange,
  type Edge,
} from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import { Download, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useModelStore } from '@/store/modelStore'
import { VariableNode } from './VariableNode'
import { ModeratorNode } from './ModeratorNode'
import { PathEdge } from './PathEdge'
import { ModerationEdge } from './ModerationEdge'
import { computeEdges, computeNodes } from './graph'
import { exportPng, exportSvg } from '@/lib/exportImage'

const nodeTypes = {
  variableNode: VariableNode,
  moderatorNode: ModeratorNode,
}

const edgeTypes = {
  pathEdge: PathEdge,
  moderationEdge: ModerationEdge,
}

const defaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
    color: 'var(--color-fg)',
  },
}

/**
 * Inner component that has access to ReactFlow's API (useReactFlow). It needs
 * to live inside a <ReactFlowProvider> so that `useReactFlow().fitView()` can
 * be called whenever the canvas resizes (e.g. when the user opens the matrices
 * tab on a narrower viewport, or zooms the page).
 */
function DiagramInner() {
  const model = useModelStore(
    useShallow((s) => ({ variables: s.variables, matrices: s.matrices })),
  )
  const { fitView } = useReactFlow()

  // Seed node positions from model. The user can drag freely; we only reseed
  // when the *set of nodes* changes (variables added/removed), preserving
  // user-positioned coordinates otherwise.
  const seedNodes = useMemo(() => computeNodes(model), [model])
  const edges = useMemo<Edge[]>(() => computeEdges(model), [model])

  const [nodes, setNodes] = useState<Node[]>(seedNodes)

  // Re-seed nodes when their identity set changes (e.g. mediator added).
  // Preserve positions for nodes that still exist.
  useEffect(() => {
    setNodes((current) => {
      const byId = new Map(current.map((n) => [n.id, n]))
      return seedNodes.map((n) => {
        const existing = byId.get(n.id)
        return existing ? { ...n, position: existing.position } : n
      })
    })
  }, [seedNodes])

  // Refresh data on every variable / matrix change without losing positions.
  useEffect(() => {
    setNodes((current) =>
      current.map((n) => {
        const seed = seedNodes.find((s) => s.id === n.id)
        return seed ? { ...n, data: seed.data } : n
      }),
    )
  }, [seedNodes])

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((current) => applyNodeChanges(changes, current))
  }

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Re-fit the viewport whenever the canvas container resizes (window resize,
  // browser zoom change, column reflow on narrow viewports). Without this,
  // React Flow only fits on initial render and nodes can clip outside view.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      // Tiny defer so React Flow's internal layout has settled
      requestAnimationFrame(() => fitView({ padding: 0.18, duration: 0 }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [fitView])

  // Re-fit on data changes too (e.g., adding mediators changes the bounds)
  useEffect(() => {
    requestAnimationFrame(() => fitView({ padding: 0.18, duration: 250 }))
  }, [seedNodes, fitView])

  const onExport = async (kind: 'png' | 'svg') => {
    if (!wrapperRef.current) return
    try {
      const fn = kind === 'png' ? exportPng : exportSvg
      await fn(wrapperRef.current, {
        filename: 'process-diagram',
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-bg')
          .trim() || '#ffffff',
      })
      toast.success(`Diagram exported as ${kind.toUpperCase()}`)
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Diagram</CardTitle>
            <CardDescription>
              Drag nodes to lay out the model. Dashed paths are moderated; chips show by which moderator.
            </CardDescription>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('svg')}
              className="gap-1.5"
              title="Download as SVG"
            >
              <Download className="h-3.5 w-3.5" />
              SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('png')}
              className="gap-1.5"
              title="Download as PNG (2× DPI)"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              PNG
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={wrapperRef} className="h-[480px] overflow-hidden rounded-b-lg border-t">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <defs>
                <marker
                  id="moderation-arrow-w"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-w)" />
                </marker>
                <marker
                  id="moderation-arrow-z"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-z)" />
                </marker>
              </defs>
            </svg>
            <Background gap={20} size={1} />
            <Controls showInteractive={false} position="top-left" />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  )
}

/** Public component — wraps the inner panel in a ReactFlowProvider so that
 *  `useReactFlow` hooks (used for fitView on resize) work. */
export function DiagramPanel() {
  return (
    <ReactFlowProvider>
      <DiagramInner />
    </ReactFlowProvider>
  )
}

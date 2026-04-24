'use client'

import { useState, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus, Sparkles, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IncarnationTreeTabProps {
  content: Record<string, unknown>
  readOnly?: boolean
  onChange?: (content: Record<string, unknown>) => void
}

// Custom incarnation node component
function IncarnationNodeComponent({
  data,
}: {
  data: {
    label: string
    points: number
    maxPoints: number
    isActive: boolean
    tier: number
    onUpdate?: (points: number) => void
  }
}) {
  const isMaxed = data.points >= data.maxPoints
  const isActive = data.points > 0

  const tierColors = {
    1: 'border-blue-500/50 bg-blue-500/10',
    2: 'border-purple-500/50 bg-purple-500/10',
    3: 'border-amber-500/50 bg-amber-500/10',
  }

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 min-w-[130px] text-center transition-all',
        isActive
          ? tierColors[data.tier as keyof typeof tierColors] || tierColors[1]
          : 'bg-card border-border text-muted-foreground',
        isMaxed && 'border-accent bg-accent/20 shadow-lg shadow-accent/20'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <p className="font-medium text-sm">{data.label}</p>
      <p className="text-xs text-muted-foreground">Tier {data.tier}</p>
      <div className="flex items-center justify-center gap-2 mt-2">
        {data.onUpdate && (
          <button
            onClick={() => data.onUpdate?.(Math.max(0, data.points - 1))}
            className="p-1 hover:bg-muted rounded"
          >
            <Minus className="h-3 w-3" />
          </button>
        )}
        <span className={cn('text-xs font-mono', isActive && 'text-accent')}>
          {data.points}/{data.maxPoints}
        </span>
        {data.onUpdate && (
          <button
            onClick={() => data.onUpdate?.(Math.min(data.maxPoints, data.points + 1))}
            className="p-1 hover:bg-muted rounded"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
    </div>
  )
}

const nodeTypes = {
  incarnation: IncarnationNodeComponent,
}

// Default incarnation tree structure
const createDefaultNodes = (): Node[] => [
  // Tier 1
  {
    id: 'inc-1',
    type: 'incarnation',
    position: { x: 250, y: 0 },
    data: { label: 'Soul Awakening', points: 0, maxPoints: 3, isActive: false, tier: 1 },
  },
  // Tier 2
  {
    id: 'inc-2',
    type: 'incarnation',
    position: { x: 100, y: 120 },
    data: { label: 'Power Surge', points: 0, maxPoints: 5, isActive: false, tier: 2 },
  },
  {
    id: 'inc-3',
    type: 'incarnation',
    position: { x: 400, y: 120 },
    data: { label: 'Spirit Link', points: 0, maxPoints: 5, isActive: false, tier: 2 },
  },
  // Tier 3
  {
    id: 'inc-4',
    type: 'incarnation',
    position: { x: 0, y: 240 },
    data: { label: 'Demon Form', points: 0, maxPoints: 3, isActive: false, tier: 3 },
  },
  {
    id: 'inc-5',
    type: 'incarnation',
    position: { x: 200, y: 240 },
    data: { label: 'Elemental Fury', points: 0, maxPoints: 3, isActive: false, tier: 3 },
  },
  {
    id: 'inc-6',
    type: 'incarnation',
    position: { x: 300, y: 240 },
    data: { label: 'Divine Shield', points: 0, maxPoints: 3, isActive: false, tier: 3 },
  },
  {
    id: 'inc-7',
    type: 'incarnation',
    position: { x: 500, y: 240 },
    data: { label: 'Shadow Step', points: 0, maxPoints: 3, isActive: false, tier: 3 },
  },
  // Ultimate
  {
    id: 'inc-8',
    type: 'incarnation',
    position: { x: 250, y: 380 },
    data: { label: 'Transcendence', points: 0, maxPoints: 1, isActive: false, tier: 3 },
  },
]

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: 'inc-1', target: 'inc-2', animated: true },
  { id: 'e1-3', source: 'inc-1', target: 'inc-3', animated: true },
  { id: 'e2-4', source: 'inc-2', target: 'inc-4' },
  { id: 'e2-5', source: 'inc-2', target: 'inc-5' },
  { id: 'e3-6', source: 'inc-3', target: 'inc-6' },
  { id: 'e3-7', source: 'inc-3', target: 'inc-7' },
  { id: 'e4-8', source: 'inc-4', target: 'inc-8' },
  { id: 'e5-8', source: 'inc-5', target: 'inc-8' },
  { id: 'e6-8', source: 'inc-6', target: 'inc-8' },
  { id: 'e7-8', source: 'inc-7', target: 'inc-8' },
]

export function IncarnationTreeTab({ content, readOnly = false, onChange }: IncarnationTreeTabProps) {
  const savedNodes = (content?.nodes as Node[]) || createDefaultNodes()
  const savedEdges = (content?.edges as Edge[]) || defaultEdges

  const [nodes, setNodes, onNodesChange] = useNodesState(savedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedEdges)

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return
      setEdges((eds) => addEdge(params, eds))
    },
    [readOnly, setEdges]
  )

  const updateNodePoints = useCallback(
    (nodeId: string, points: number) => {
      if (readOnly || !onChange) return

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                points,
                isActive: points > 0,
              },
            }
          }
          return node
        })
      )
    },
    [readOnly, onChange, setNodes]
  )

  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onUpdate: readOnly ? undefined : (points: number) => updateNodePoints(node.id, points),
    },
  }))

  const handleSave = () => {
    if (onChange) {
      onChange({
        ...content,
        nodes,
        edges,
      })
    }
  }

  const resetTree = () => {
    if (readOnly || !onChange) return
    setNodes(createDefaultNodes())
    setEdges(defaultEdges)
  }

  const totalPoints = nodes.reduce((sum, node) => sum + (node.data?.points || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Incarnation Tree
          </h2>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? 'View the incarnation progression for this build'
              : 'Allocate points to unlock powerful incarnation abilities'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            Total Points: <span className="font-bold text-accent">{totalPoints}</span>
          </div>
          {!readOnly && (
            <>
              <Button variant="outline" size="sm" onClick={resetTree}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="h-[500px] w-full">
          <ReactFlow
            nodes={nodesWithHandlers}
            edges={edges}
            onNodesChange={readOnly ? undefined : onNodesChange}
            onEdgesChange={readOnly ? undefined : onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={!readOnly}
            className="bg-background"
          >
            <Background color="#333" gap={20} />
            <Controls className="!bg-card !border-border" />
            <MiniMap
              nodeColor={(node) =>
                node.data?.points > 0 ? 'oklch(0.75 0.15 85)' : 'oklch(0.25 0.03 280)'
              }
              className="!bg-card !border-border"
            />
          </ReactFlow>
        </div>
      </Card>

      {/* Tier Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((tier) => {
          const tierNodes = nodes.filter((n) => n.data?.tier === tier)
          const tierPoints = tierNodes.reduce((sum, n) => sum + (n.data?.points || 0), 0)
          const maxPoints = tierNodes.reduce((sum, n) => sum + (n.data?.maxPoints || 0), 0)

          return (
            <Card key={tier} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tier {tier}</p>
                    <p className="text-xs text-muted-foreground">
                      {tierNodes.filter((n) => n.data?.points > 0).length}/{tierNodes.length} unlocked
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">
                      {tierPoints}/{maxPoints}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

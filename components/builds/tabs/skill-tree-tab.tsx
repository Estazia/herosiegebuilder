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
import { Input } from '@/components/ui/input'
import { Plus, Minus, Zap, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SkillNode } from '@/lib/types'

interface SkillTreeTabProps {
  content: Record<string, unknown>
  readOnly?: boolean
  onChange?: (content: Record<string, unknown>) => void
}

// Custom skill node component
function SkillNodeComponent({
  data,
}: {
  data: { label: string; points: number; maxPoints: number; isActive: boolean; onUpdate?: (points: number) => void }
}) {
  const isMaxed = data.points >= data.maxPoints
  const isActive = data.points > 0

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 min-w-[120px] text-center transition-all',
        isActive
          ? 'bg-primary/20 border-primary text-primary-foreground'
          : 'bg-card border-border text-muted-foreground',
        isMaxed && 'border-accent bg-accent/20'
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <p className="font-medium text-sm">{data.label}</p>
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
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  )
}

const nodeTypes = {
  skill: SkillNodeComponent,
}

// Default skill tree structure
const createDefaultNodes = (): Node[] => [
  {
    id: 'skill-1',
    type: 'skill',
    position: { x: 250, y: 0 },
    data: { label: 'Basic Attack', points: 0, maxPoints: 5, isActive: false },
  },
  {
    id: 'skill-2',
    type: 'skill',
    position: { x: 100, y: 100 },
    data: { label: 'Power Strike', points: 0, maxPoints: 5, isActive: false },
  },
  {
    id: 'skill-3',
    type: 'skill',
    position: { x: 400, y: 100 },
    data: { label: 'Quick Slash', points: 0, maxPoints: 5, isActive: false },
  },
  {
    id: 'skill-4',
    type: 'skill',
    position: { x: 0, y: 200 },
    data: { label: 'Heavy Blow', points: 0, maxPoints: 10, isActive: false },
  },
  {
    id: 'skill-5',
    type: 'skill',
    position: { x: 200, y: 200 },
    data: { label: 'Cleave', points: 0, maxPoints: 10, isActive: false },
  },
  {
    id: 'skill-6',
    type: 'skill',
    position: { x: 300, y: 200 },
    data: { label: 'Dash', points: 0, maxPoints: 5, isActive: false },
  },
  {
    id: 'skill-7',
    type: 'skill',
    position: { x: 500, y: 200 },
    data: { label: 'Critical Eye', points: 0, maxPoints: 10, isActive: false },
  },
  {
    id: 'skill-8',
    type: 'skill',
    position: { x: 100, y: 320 },
    data: { label: 'Whirlwind', points: 0, maxPoints: 15, isActive: false },
  },
  {
    id: 'skill-9',
    type: 'skill',
    position: { x: 400, y: 320 },
    data: { label: 'Execute', points: 0, maxPoints: 15, isActive: false },
  },
]

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: 'skill-1', target: 'skill-2', animated: true },
  { id: 'e1-3', source: 'skill-1', target: 'skill-3', animated: true },
  { id: 'e2-4', source: 'skill-2', target: 'skill-4' },
  { id: 'e2-5', source: 'skill-2', target: 'skill-5' },
  { id: 'e3-6', source: 'skill-3', target: 'skill-6' },
  { id: 'e3-7', source: 'skill-3', target: 'skill-7' },
  { id: 'e4-8', source: 'skill-4', target: 'skill-8' },
  { id: 'e5-8', source: 'skill-5', target: 'skill-8' },
  { id: 'e6-9', source: 'skill-6', target: 'skill-9' },
  { id: 'e7-9', source: 'skill-7', target: 'skill-9' },
]

export function SkillTreeTab({ content, readOnly = false, onChange }: SkillTreeTabProps) {
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

  // Update nodes with click handlers
  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onUpdate: readOnly ? undefined : (points: number) => updateNodePoints(node.id, points),
    },
  }))

  // Save changes
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
            <Zap className="h-5 w-5 text-primary" />
            Skill Tree
          </h2>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? 'View the skill allocation for this build'
              : 'Click on skills to allocate points'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            Total Points: <span className="font-bold text-primary">{totalPoints}</span>
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

      {/* React Flow Canvas */}
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
                node.data?.points > 0 ? 'oklch(0.55 0.22 25)' : 'oklch(0.25 0.03 280)'
              }
              className="!bg-card !border-border"
            />
          </ReactFlow>
        </div>
      </Card>

      {/* Skills List */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Allocated Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {nodes
              .filter((node) => node.data?.points > 0)
              .map((node) => (
                <div
                  key={node.id}
                  className="p-3 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <p className="font-medium text-sm">{node.data?.label}</p>
                  <p className="text-xs text-accent">
                    {node.data?.points}/{node.data?.maxPoints} points
                  </p>
                </div>
              ))}
            {nodes.filter((node) => node.data?.points > 0).length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">
                No skills allocated yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

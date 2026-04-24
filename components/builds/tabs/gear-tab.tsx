'use client'

import { useState } from 'react'
import {
  Shield,
  Shirt,
  Sword,
  CircleDot,
  Gem,
  RectangleHorizontal,
  Footprints,
  HardHat,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { GEAR_SLOTS, type GearSlot, type GearItem } from '@/lib/types'

const slotIcons: Record<GearSlot, React.ReactNode> = {
  Helmet: <HardHat className="h-6 w-6" />,
  Chest: <Shirt className="h-6 w-6" />,
  Weapon: <Sword className="h-6 w-6" />,
  'Off-hand': <Shield className="h-6 w-6" />,
  Ring1: <CircleDot className="h-6 w-6" />,
  Ring2: <CircleDot className="h-6 w-6" />,
  Amulet: <Gem className="h-6 w-6" />,
  Belt: <RectangleHorizontal className="h-6 w-6" />,
  Pants: <RectangleHorizontal className="h-6 w-6" />,
  Boots: <Footprints className="h-6 w-6" />,
}

const slotLabels: Record<GearSlot, string> = {
  Helmet: 'Helmet',
  Chest: 'Chest',
  Weapon: 'Weapon',
  'Off-hand': 'Off-hand',
  Ring1: 'Ring 1',
  Ring2: 'Ring 2',
  Amulet: 'Amulet',
  Belt: 'Belt',
  Pants: 'Pants',
  Boots: 'Boots',
}

interface GearTabProps {
  content: Record<string, unknown>
  readOnly?: boolean
  onChange?: (content: Record<string, unknown>) => void
}

export function GearTab({ content, readOnly = false, onChange }: GearTabProps) {
  const gear = (content?.gear as GearItem[]) || []

  const [editingSlot, setEditingSlot] = useState<GearSlot | null>(null)
  const [editName, setEditName] = useState('')
  const [editStats, setEditStats] = useState('')

  const getGearForSlot = (slot: GearSlot): GearItem | undefined => {
    return gear.find((g) => g.slot === slot)
  }

  const handleSlotClick = (slot: GearSlot) => {
    if (readOnly) return
    const existing = getGearForSlot(slot)
    setEditingSlot(slot)
    setEditName(existing?.name || '')
    setEditStats(existing?.stats?.map((s) => `${s.name}: ${s.value}`).join('\n') || '')
  }

  const handleSave = () => {
    if (!editingSlot || !onChange) return

    const stats = editStats
      .split('\n')
      .filter((line) => line.includes(':'))
      .map((line) => {
        const [name, value] = line.split(':').map((s) => s.trim())
        return { name, value }
      })

    const newGear = gear.filter((g) => g.slot !== editingSlot)
    if (editName) {
      newGear.push({
        slot: editingSlot,
        name: editName,
        stats,
      })
    }

    onChange({ ...content, gear: newGear })
    setEditingSlot(null)
    setEditName('')
    setEditStats('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Equipment</h2>
          <p className="text-sm text-muted-foreground">
            {readOnly ? 'View the gear setup for this build' : 'Click on a slot to add or edit gear'}
          </p>
        </div>
      </div>

      {/* Gear Grid - Character Paper Doll Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {GEAR_SLOTS.map((slot) => {
          const item = getGearForSlot(slot)
          const isEditing = editingSlot === slot

          return (
            <Card
              key={slot}
              className={cn(
                'relative overflow-hidden transition-all',
                !readOnly && 'cursor-pointer hover:border-primary/50',
                item && 'border-accent/30 bg-accent/5',
                isEditing && 'border-primary ring-1 ring-primary'
              )}
              onClick={() => handleSlotClick(slot)}
            >
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className={cn('text-muted-foreground', item && 'text-accent')}>
                    {slotIcons[slot]}
                  </div>
                  <CardTitle className="text-sm">{slotLabels[slot]}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {isEditing ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      placeholder="Item name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Textarea
                      placeholder="Stats (one per line, e.g., Strength: +50)"
                      value={editStats}
                      onChange={(e) => setEditStats(e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="text-xs text-primary hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSlot(null)}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : item ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {item.name}
                    </p>
                    {item.stats && item.stats.length > 0 && (
                      <div className="space-y-1">
                        {item.stats.slice(0, 3).map((stat, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {stat.name}: <span className="text-accent">{stat.value}</span>
                          </p>
                        ))}
                        {item.stats.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.stats.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/50">
                    {readOnly ? 'Empty' : 'Click to add'}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Section */}
      {gear.length > 0 && (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Gear Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gear.map((item) => (
                <div key={item.slot} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="text-accent">{slotIcons[item.slot]}</div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{slotLabels[item.slot]}</p>
                    {item.stats && item.stats.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.stats.map((stat, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {stat.name}: <span className="text-accent">{stat.value}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

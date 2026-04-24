'use client'

import { useState } from 'react'
import { Shield, Sword, Wand2, Heart, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MercenaryTabProps {
  content: Record<string, unknown>
  readOnly?: boolean
  onChange?: (content: Record<string, unknown>) => void
}

const MERCENARY_TYPES = [
  { id: 'tank', name: 'Tank', icon: Shield, description: 'Absorbs damage and protects allies' },
  { id: 'dps', name: 'DPS', icon: Sword, description: 'Deals high damage to enemies' },
  { id: 'mage', name: 'Mage', icon: Wand2, description: 'Casts powerful spells from range' },
  { id: 'healer', name: 'Healer', icon: Heart, description: 'Restores health to allies' },
]

const MERC_GEAR_SLOTS = ['Weapon', 'Armor', 'Accessory'] as const

interface MercenaryData {
  type: string
  name: string
  skills: string[]
  gear: { slot: string; name: string }[]
  notes: string
}

export function MercenaryTab({ content, readOnly = false, onChange }: MercenaryTabProps) {
  const mercenary = (content?.mercenary as MercenaryData) || {
    type: '',
    name: '',
    skills: [],
    gear: [],
    notes: '',
  }

  const [editingGear, setEditingGear] = useState<string | null>(null)
  const [editGearName, setEditGearName] = useState('')
  const [newSkill, setNewSkill] = useState('')

  const updateMercenary = (updates: Partial<MercenaryData>) => {
    if (readOnly || !onChange) return
    onChange({
      ...content,
      mercenary: { ...mercenary, ...updates },
    })
  }

  const selectType = (typeId: string) => {
    updateMercenary({ type: typeId })
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    updateMercenary({ skills: [...mercenary.skills, newSkill.trim()] })
    setNewSkill('')
  }

  const removeSkill = (index: number) => {
    updateMercenary({ skills: mercenary.skills.filter((_, i) => i !== index) })
  }

  const saveGear = (slot: string) => {
    const newGear = mercenary.gear.filter((g) => g.slot !== slot)
    if (editGearName.trim()) {
      newGear.push({ slot, name: editGearName.trim() })
    }
    updateMercenary({ gear: newGear })
    setEditingGear(null)
    setEditGearName('')
  }

  const getGearForSlot = (slot: string) => {
    return mercenary.gear.find((g) => g.slot === slot)?.name
  }

  const selectedType = MERCENARY_TYPES.find((t) => t.id === mercenary.type)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Mercenary
          </h2>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? 'View the mercenary configuration for this build'
              : 'Choose and configure your mercenary companion'}
          </p>
        </div>
      </div>

      {/* Mercenary Type Selection */}
      <div className="space-y-4">
        <h3 className="font-medium">Mercenary Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MERCENARY_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = mercenary.type === type.id

            return (
              <Card
                key={type.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'hover:border-primary/50',
                  readOnly && !isSelected && 'opacity-50'
                )}
                onClick={() => !readOnly && selectType(type.id)}
              >
                <CardContent className="p-4 text-center">
                  <Icon
                    className={cn(
                      'h-8 w-8 mx-auto mb-2',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <p className="font-medium">{type.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Mercenary Details */}
      {mercenary.type && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Name and Skills */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {selectedType && <selectedType.icon className="h-5 w-5 text-primary" />}
                Mercenary Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                {readOnly ? (
                  <p className="font-medium">{mercenary.name || 'Unnamed'}</p>
                ) : (
                  <Input
                    placeholder="Give your mercenary a name"
                    value={mercenary.name}
                    onChange={(e) => updateMercenary({ name: e.target.value })}
                    className="mt-1"
                  />
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm text-muted-foreground">Skills</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mercenary.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {skill}
                      {!readOnly && (
                        <button
                          onClick={() => removeSkill(i)}
                          className="ml-1 hover:text-destructive"
                        >
                          &times;
                        </button>
                      )}
                    </Badge>
                  ))}
                  {mercenary.skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills added</p>
                  )}
                </div>
                {!readOnly && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gear */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Mercenary Gear</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MERC_GEAR_SLOTS.map((slot) => {
                const gearName = getGearForSlot(slot)
                const isEditing = editingGear === slot

                return (
                  <div
                    key={slot}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      gearName ? 'border-accent/30 bg-accent/5' : 'border-border',
                      !readOnly && 'cursor-pointer hover:border-primary/50'
                    )}
                    onClick={() => {
                      if (readOnly) return
                      setEditingGear(slot)
                      setEditGearName(gearName || '')
                    }}
                  >
                    <p className="text-sm text-muted-foreground">{slot}</p>
                    {isEditing ? (
                      <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editGearName}
                          onChange={(e) => setEditGearName(e.target.value)}
                          placeholder="Enter item name"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => saveGear(slot)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingGear(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <p className="font-medium">
                        {gearName || (
                          <span className="text-muted-foreground/50">
                            {readOnly ? 'Empty' : 'Click to add'}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notes */}
      {mercenary.type && (
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {readOnly ? (
              <p className="whitespace-pre-wrap">
                {mercenary.notes || 'No notes added'}
              </p>
            ) : (
              <Textarea
                placeholder="Add any notes about your mercenary setup..."
                value={mercenary.notes}
                onChange={(e) => updateMercenary({ notes: e.target.value })}
                rows={4}
              />
            )}
          </CardContent>
        </Card>
      )}

      {!mercenary.type && (
        <div className="text-center py-8 text-muted-foreground">
          {readOnly
            ? 'No mercenary configured for this build'
            : 'Select a mercenary type to get started'}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Plus, Minus, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ATTRIBUTES, type Attribute, type AttributeValue } from '@/lib/types'

interface AttributesTabProps {
  content: Record<string, unknown>
  readOnly?: boolean
  onChange?: (content: Record<string, unknown>) => void
}

const DEFAULT_ATTRIBUTES: AttributeValue[] = ATTRIBUTES.map((name) => ({
  name,
  base: 0,
  bonus: 0,
}))

export function AttributesTab({ content, readOnly = false, onChange }: AttributesTabProps) {
  const attributes = (content?.attributes as AttributeValue[]) || DEFAULT_ATTRIBUTES

  const updateAttribute = (name: Attribute, field: 'base' | 'bonus', value: number) => {
    if (readOnly || !onChange) return

    const newAttributes = attributes.map((attr) =>
      attr.name === name ? { ...attr, [field]: Math.max(0, value) } : attr
    )
    onChange({ ...content, attributes: newAttributes })
  }

  const resetAttributes = () => {
    if (readOnly || !onChange) return
    onChange({ ...content, attributes: DEFAULT_ATTRIBUTES })
  }

  const getTotal = (attr: AttributeValue) => attr.base + attr.bonus

  const maxTotal = Math.max(...attributes.map(getTotal), 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Attributes</h2>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? 'View the attribute allocation for this build'
              : 'Allocate your base stats and bonuses'}
          </p>
        </div>
        {!readOnly && (
          <Button variant="outline" size="sm" onClick={resetAttributes}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {attributes.map((attr) => {
          const total = getTotal(attr)
          const progress = (total / maxTotal) * 100

          return (
            <Card key={attr.name} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Attribute Name */}
                  <div className="w-full sm:w-40">
                    <p className="font-medium">{attr.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Total: <span className="text-accent font-semibold">{total}</span>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1">
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Input Controls */}
                  {readOnly ? (
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Base:</span>{' '}
                        <span className="font-medium">{attr.base}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bonus:</span>{' '}
                        <span className="text-accent font-medium">+{attr.bonus}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      {/* Base Value */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground w-10">Base</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateAttribute(attr.name, 'base', attr.base - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={attr.base}
                          onChange={(e) =>
                            updateAttribute(attr.name, 'base', parseInt(e.target.value) || 0)
                          }
                          className="w-16 h-7 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateAttribute(attr.name, 'base', attr.base + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Bonus Value */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-accent w-10">Bonus</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateAttribute(attr.name, 'bonus', attr.bonus - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={attr.bonus}
                          onChange={(e) =>
                            updateAttribute(attr.name, 'bonus', parseInt(e.target.value) || 0)
                          }
                          className="w-16 h-7 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateAttribute(attr.name, 'bonus', attr.bonus + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Stats Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {attributes.slice(0, 5).map((attr) => (
              <div key={attr.name} className="text-center p-3 rounded-lg bg-card/50">
                <p className="text-2xl font-bold text-primary">{getTotal(attr)}</p>
                <p className="text-xs text-muted-foreground">{attr.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

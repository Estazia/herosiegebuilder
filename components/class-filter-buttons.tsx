'use client'

import { Button } from '@/components/ui/button'
import { ClassIcon } from '@/components/class-icon'
import { HERO_CLASSES, type HeroClass } from '@/lib/types'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ClassFilterButtonsProps {
  selectedClass: HeroClass | 'all'
  onClassSelect: (heroClass: HeroClass | 'all') => void
  showLabel?: boolean
}

export function ClassFilterButtons({
  selectedClass,
  onClassSelect,
  showLabel = true,
}: ClassFilterButtonsProps) {
  return (
    <div className="w-full">
      {showLabel && (
        <label className="block text-sm font-medium mb-3 text-foreground">
          Filter by Class
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {/* All Classes button */}
        <Button
          variant={selectedClass === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onClassSelect('all')}
          className={cn(
            'h-10 px-3 rounded-md transition-all',
            selectedClass === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'border-2 border-muted-foreground/30 hover:border-primary/50'
          )}
          title="All Classes"
        >
          <span className="font-semibold text-xs sm:text-sm">ALL</span>
        </Button>

        {/* Class buttons */}
        {HERO_CLASSES.map((heroClass) => (
          <Button
            key={heroClass}
            variant={selectedClass === heroClass ? 'default' : 'outline'}
            size="sm"
            onClick={() => onClassSelect(heroClass)}
            className={cn(
              'h-10 w-10 p-0 rounded-md transition-all relative group',
              selectedClass === heroClass
                ? 'bg-primary text-primary-foreground ring-2 ring-primary/50'
                : 'border-2 border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50'
            )}
            title={heroClass}
          >
            <ClassIcon
              heroClass={heroClass}
              size="md"
              className={cn(
                'h-5 w-5',
                selectedClass === heroClass ? 'text-primary-foreground' : ''
              )}
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {heroClass}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-foreground" />
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

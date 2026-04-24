import {
  Sword,
  Skull,
  Shield,
  Flame,
  Wand2,
  Crosshair,
  Anchor,
  FlaskConical,
  Zap,
  Axe,
  Wind,
  Sparkles,
  Heart,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HeroClass } from '@/lib/types'

const classIcons: Record<HeroClass, LucideIcon> = {
  Amazon: Crosshair,
  Demonspawn: Skull,
  Marauder: Axe,
  Necromancer: Skull,
  Nomad: Wind,
  Paladin: Shield,
  Pirate: Anchor,
  'Plague Doctor': FlaskConical,
  Pyromancer: Flame,
  Redneck: Crosshair,
  Samurai: Sword,
  Shaman: Sparkles,
  Viking: Axe,
  'White Mage': Heart,
}

const classColors: Record<HeroClass, string> = {
  Amazon: 'text-green-500',
  Demonspawn: 'text-red-500',
  Marauder: 'text-orange-500',
  Necromancer: 'text-purple-500',
  Nomad: 'text-yellow-500',
  Paladin: 'text-yellow-400',
  Pirate: 'text-blue-400',
  'Plague Doctor': 'text-emerald-500',
  Pyromancer: 'text-orange-400',
  Redneck: 'text-amber-600',
  Samurai: 'text-red-400',
  Shaman: 'text-teal-500',
  Viking: 'text-blue-500',
  'White Mage': 'text-pink-400',
}

interface ClassIconProps {
  heroClass: HeroClass
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ClassIcon({ heroClass, size = 'md', showLabel = false, className }: ClassIconProps) {
  const Icon = classIcons[heroClass] || Wand2
  const colorClass = classColors[heroClass] || 'text-muted-foreground'

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-md bg-muted/50',
          size === 'sm' && 'p-1',
          size === 'md' && 'p-1.5',
          size === 'lg' && 'p-2'
        )}
      >
        <Icon className={cn(sizeClasses[size], colorClass)} />
      </div>
      {showLabel && (
        <span className={cn('text-sm font-medium', colorClass)}>{heroClass}</span>
      )}
    </div>
  )
}

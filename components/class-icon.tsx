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
  Music,
  Beef,
  Users,
  Eye,
  Crown,
  BookOpen,
  Droplet,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HeroClass } from '@/lib/types'

const classIcons: Record<HeroClass, LucideIcon> = {
  Amazon: Crosshair,
  Bard: Music,
  Butcher: Beef,
  'Demon Slayer': Sword,
  Demonspawn: Skull,
  Exo: Users,
  Illusionist: Eye,
  Jötunn: Crown,
  Marauder: Axe,
  Marksman: Crosshair,
  Necromancer: Skull,
  Nomad: Wind,
  Paladin: Shield,
  Pirate: Anchor,
  'Plague Doctor': FlaskConical,
  Prophet: BookOpen,
  Pyromancer: Flame,
  Redneck: Crosshair,
  Samurai: Sword,
  Shaman: Sparkles,
  'Shield Lancer': Shield,
  Stormweaver: Zap,
  Viking: Axe,
  'White Mage': Heart,
}

const classColors: Record<HeroClass, string> = {
  Amazon: 'text-green-500',
  Bard: 'text-purple-400',
  Butcher: 'text-red-600',
  'Demon Slayer': 'text-indigo-500',
  Demonspawn: 'text-red-500',
  Exo: 'text-cyan-500',
  Illusionist: 'text-violet-500',
  Jötunn: 'text-blue-600',
  Marauder: 'text-orange-500',
  Marksman: 'text-green-400',
  Necromancer: 'text-purple-500',
  Nomad: 'text-yellow-500',
  Paladin: 'text-yellow-400',
  Pirate: 'text-blue-400',
  'Plague Doctor': 'text-emerald-500',
  Prophet: 'text-blue-300',
  Pyromancer: 'text-orange-400',
  Redneck: 'text-amber-600',
  Samurai: 'text-red-400',
  Shaman: 'text-teal-500',
  'Shield Lancer': 'text-stone-500',
  Stormweaver: 'text-cyan-400',
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

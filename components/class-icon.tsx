import Image from 'next/image'
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

// Classes with image icons
const classImages: Record<string, string> = {
  Amazon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/amazon-WPR0IeJ5CSC47BcqvSt7CqfjZbDUXp.png',
  Bard: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bard-xjy7uIJobOHs73UlI2rsWara4Fvmqv.png',
  Butcher: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/butcher-KFN5sF1UUw85XZRJH0bUZmeijCdTLW.png',
  'Demon Slayer': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/demon_slayer-tg9Kch21hYkOdgGOfGmdquB4YlgEpr.png',
  Demonspawn: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/demonspawn-M0j1Li4SQwdKnw3qW29hGpAXUiis7S.png',
  Exo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/exo-L2jeiffji8khg1VOcLmD6fticSr689.png',
  Illusionist: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/illusionist-FWGG7TSd99a4UNNpbDYOgQ0t3wauSl.png',
  Jötunn: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jotunn-mmtp0YQKh7mPko7p41IfHByFkUYzVQ.png',
  Marauder: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marauder-HAbYFM98xyDdDktZ7rvdNr05tn4HOZ.png',
  Marksman: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marksman-GHupDAqpbGVSJrDp65vF3t1jcYNooj.png',
  Necromancer: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/necromancer-KzMHpV02Dlf0kbwz9lShBuRU8SEZuO.png',
  Nomad: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nomad-EGWehNonppoUBgC6C46sKWSx3e47ZC.png',
  Paladin: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/paladin-J5ei7UCOGc9UCzVO3cD4GmnwCJ6mma.png',
  Pirate: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pirate-tEtti7wCSXjBTSRfxPb8cWtpN0SzVE.png',
  'Plague Doctor': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/plague_doctor-l26Kgz0iyR6V0ey0UNySECCj5GAb09.png',
  Prophet: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/prophet-VCmG6X2iFMrByBymf5ZfGONCDrl9jI.png',
  Pyromancer: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pyromancer-bbVIoDTGD27YUJR9WixPE8Tga9ZfZT.png',
  Redneck: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/redneck-qTqBE4lcHWWarnvWBrJj54WieDzZuT.png',
  Samurai: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/samurai-pN860HRutnI5wKmVgbHxI1fnJJsIqk.png',
  Shaman: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shaman-maDKGGJX6tCVontsbKmutpnO31iQTc.png',
  'Shield Lancer': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shield_lancer-BDCktWEwchiOlKuEeNiG0OV4fmJiyo.png',
  Stormweaver: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/stormweaver-P2Y2NwZYnG9q626Vt4gXpVg5r81jkS.png',
  Viking: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/viking-F4VBRRwt6MrhlzX6503Pz0ml4TIFCT.png',
  'White Mage': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/white_mage-MJnv0PoY9sojDYltIPTUD8lAHL0vTU.png',
}

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
  const hasImage = heroClass in classImages
  const imageUrl = classImages[heroClass as keyof typeof classImages]
  const Icon = classIcons[heroClass] || Wand2

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  const containerClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-md bg-muted/50 overflow-hidden',
          containerClasses[size]
        )}
      >
        {hasImage && imageUrl ? (
          <Image
            src={imageUrl}
            alt={heroClass}
            width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
            height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <Icon className={cn(sizeClasses[size], 'text-muted-foreground')} />
        )}
      </div>
      {showLabel && (
        <span className="text-sm font-medium">{heroClass}</span>
      )}
    </div>
  )
}

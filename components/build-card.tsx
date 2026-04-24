import Link from 'next/link'
import { Eye, Star, Calendar, User } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ClassIcon } from '@/components/class-icon'
import { cn } from '@/lib/utils'
import type { Build } from '@/lib/types'

interface BuildCardProps {
  build: Build
  className?: string
}

export function BuildCard({ build, className }: BuildCardProps) {
  const formattedDate = new Date(build.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const averageRating = build.average_rating || 0
  const voteCount = build.vote_count || 0

  return (
    <Link href={`/builds/${build.slug}`}>
      <Card
        className={cn(
          'group h-full overflow-hidden transition-all duration-300',
          'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
          'bg-card/50 backdrop-blur-sm',
          className
        )}
      >
        {/* Header with class gradient */}
        <div className="h-24 bg-gradient-to-br from-primary/20 via-card to-accent/10 relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
          <div className="absolute bottom-3 left-3">
            <ClassIcon heroClass={build.class} size="lg" />
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            {build.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-background/80">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {build.title}
          </h3>
          <p className="text-sm text-muted-foreground">{build.class}</p>
        </CardHeader>

        <CardContent className="pb-2">
          {build.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{build.description}</p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          {/* Author */}
          <div className="flex items-center gap-2 w-full">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={build.profiles?.avatar_url || undefined}
                alt={build.profiles?.username}
              />
              <AvatarFallback className="text-xs bg-muted">
                {build.profiles?.username?.slice(0, 2).toUpperCase() || (
                  <User className="h-3 w-3" />
                )}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {build.profiles?.username || 'Anonymous'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {build.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Star
                  className={cn(
                    'h-3.5 w-3.5',
                    averageRating > 0 ? 'text-accent fill-accent' : ''
                  )}
                />
                {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                {voteCount > 0 && <span className="text-muted-foreground/60">({voteCount})</span>}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

export function BuildCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden bg-card/50">
      <div className="h-24 bg-muted animate-pulse" />
      <CardHeader className="pb-2">
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/4 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded mt-2" />
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-2 w-full">
          <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        </div>
      </CardFooter>
    </Card>
  )
}

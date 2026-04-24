'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BuildCard, BuildCardSkeleton } from '@/components/build-card'
import { createClient } from '@/lib/supabase/client'
import { HERO_CLASSES, type Build, type HeroClass, type BuildSortOption } from '@/lib/types'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: { value: BuildSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'highest_rated', label: 'Highest Rated' },
]

const BUILDS_PER_PAGE = 12

export function BuildsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  // Filters from URL
  const classFilter = (searchParams.get('class') as HeroClass | 'all') || 'all'
  const sortBy = (searchParams.get('sort') as BuildSortOption) || 'newest'
  const searchQuery = searchParams.get('q') || ''

  const [localSearch, setLocalSearch] = useState(searchQuery)

  const supabase = createClient()

  const fetchBuilds = useCallback(
    async (pageNum: number, append: boolean = false) => {
      setLoading(true)

      let query = supabase
        .from('builds')
        .select(
          `
          *,
          profiles (id, username, avatar_url)
        `
        )
        .eq('is_published', true)
        .range(pageNum * BUILDS_PER_PAGE, (pageNum + 1) * BUILDS_PER_PAGE - 1)

      // Apply class filter
      if (classFilter && classFilter !== 'all') {
        query = query.eq('class', classFilter)
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'most_viewed':
          query = query.order('views', { ascending: false })
          break
        case 'highest_rated':
          // We'll sort by views for now, ratings need a more complex query
          query = query.order('views', { ascending: false })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching builds:', error)
        setLoading(false)
        return
      }

      // Fetch ratings for each build
      const buildsWithRatings = await Promise.all(
        (data || []).map(async (build) => {
          const { data: ratingData } = await supabase.rpc('get_build_rating', {
            p_build_id: build.id,
          })
          return {
            ...build,
            average_rating: ratingData?.[0]?.average_rating || 0,
            vote_count: ratingData?.[0]?.vote_count || 0,
          }
        })
      )

      // Sort by rating if needed (client-side for now)
      if (sortBy === 'highest_rated') {
        buildsWithRatings.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
      }

      if (append) {
        setBuilds((prev) => [...prev, ...buildsWithRatings])
      } else {
        setBuilds(buildsWithRatings)
      }

      setHasMore(buildsWithRatings.length === BUILDS_PER_PAGE)
      setLoading(false)
    },
    [supabase, classFilter, sortBy, searchQuery]
  )

  // Initial fetch
  useEffect(() => {
    setPage(0)
    fetchBuilds(0, false)
  }, [fetchBuilds])

  // Update URL params
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/builds?${params.toString()}`, { scroll: false })
  }

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: localSearch || null })
  }

  // Load more
  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBuilds(nextPage, true)
  }

  // Clear all filters
  const clearFilters = () => {
    setLocalSearch('')
    router.push('/builds')
  }

  const hasActiveFilters = classFilter !== 'all' || searchQuery || sortBy !== 'newest'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Builds</h1>
            <p className="text-muted-foreground mt-1">
              Discover and share Hero Siege builds for every class
            </p>
          </div>
          <Button asChild>
            <Link href="/builds/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Build
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search builds..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 bg-card"
            />
          </form>

          {/* Class Filter */}
          <Select
            value={classFilter}
            onValueChange={(value) => updateFilters({ class: value })}
          >
            <SelectTrigger className="w-full sm:w-48 bg-card">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {HERO_CLASSES.map((heroClass) => (
                <SelectItem key={heroClass} value={heroClass}>
                  {heroClass}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(value) => updateFilters({ sort: value })}
          >
            <SelectTrigger className="w-full sm:w-40 bg-card">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {classFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {classFilter}
                <button
                  onClick={() => updateFilters({ class: null })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                &quot;{searchQuery}&quot;
                <button
                  onClick={() => {
                    setLocalSearch('')
                    updateFilters({ q: null })
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {sortBy !== 'newest' && (
              <Badge variant="secondary" className="gap-1">
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <button
                  onClick={() => updateFilters({ sort: null })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Builds Grid */}
      {loading && builds.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <BuildCardSkeleton key={i} />
          ))}
        </div>
      ) : builds.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No builds found</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? 'Try adjusting your filters or search query'
              : 'Be the first to create a build!'}
          </p>
          <div className="flex items-center justify-center gap-4">
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Button asChild>
              <Link href="/builds/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Build
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {builds.map((build) => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={loadMore}
                disabled={loading}
                className={cn(loading && 'opacity-50')}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

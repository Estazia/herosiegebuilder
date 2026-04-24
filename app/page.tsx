import Link from 'next/link'
import { ArrowRight, Hammer, Trophy, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BuildCard, BuildCardSkeleton } from '@/components/build-card'
import { createClient } from '@/lib/supabase/server'
import { HERO_CLASSES } from '@/lib/types'

async function getLatestBuilds() {
  const supabase = await createClient()
  const { data: builds } = await supabase
    .from('builds')
    .select(
      `
      *,
      profiles (id, username, avatar_url)
    `
    )
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Get ratings for each build
  if (builds) {
    const buildsWithRatings = await Promise.all(
      builds.map(async (build) => {
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
    return buildsWithRatings
  }
  return []
}

async function getTrendingBuilds() {
  const supabase = await createClient()
  const { data: builds } = await supabase
    .from('builds')
    .select(
      `
      *,
      profiles (id, username, avatar_url)
    `
    )
    .eq('is_published', true)
    .order('views', { ascending: false })
    .limit(4)

  if (builds) {
    const buildsWithRatings = await Promise.all(
      builds.map(async (build) => {
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
    return buildsWithRatings
  }
  return []
}

export default async function HomePage() {
  const [latestBuilds, trendingBuilds] = await Promise.all([
    getLatestBuilds(),
    getTrendingBuilds(),
  ])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-accent">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">The Ultimate Hero Siege Resource</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-balance">
              <span className="text-primary">Master</span> Your Build.{' '}
              <span className="text-accent">Dominate</span> the Siege.
            </h1>

            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Discover top-tier builds, comprehensive tier lists, and in-depth guides for Hero
              Siege. Created by the community, for the community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/builds">
                  <Hammer className="h-5 w-5 mr-2" />
                  Browse Builds
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/builds/create">
                  Create Build
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{HERO_CLASSES.length}</p>
              <p className="text-sm text-muted-foreground">Classes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">
                {latestBuilds.length > 0 ? '100+' : '0'}
              </p>
              <p className="text-sm text-muted-foreground">Builds</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">50+</p>
              <p className="text-sm text-muted-foreground">Guides</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">Active</p>
              <p className="text-sm text-muted-foreground">Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Builds */}
      {trendingBuilds.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-accent" />
                  Trending Builds
                </h2>
                <p className="text-muted-foreground mt-1">Most viewed builds this week</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/builds?sort=most_viewed">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingBuilds.map((build) => (
                <BuildCard key={build.id} build={build} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Builds */}
      <section className="py-12 md:py-16 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Hammer className="h-6 w-6 text-primary" />
                Latest Builds
              </h2>
              <p className="text-muted-foreground mt-1">Fresh builds from the community</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/builds">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestBuilds.length > 0
              ? latestBuilds.map((build) => <BuildCard key={build.id} build={build} />)
              : Array.from({ length: 6 }).map((_, i) => <BuildCardSkeleton key={i} />)}
          </div>

          {latestBuilds.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No builds yet. Be the first to create one!</p>
              <Button asChild>
                <Link href="/builds/create">
                  <Hammer className="h-4 w-4 mr-2" />
                  Create Build
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">Everything You Need</h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive tools and resources for Hero Siege players
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Trophy className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Tier Lists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Up-to-date tier lists for every category: Endgame, Leveling, Bossing, and Speed
                  Farming.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/tierlists">View Tier Lists</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <Hammer className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Build Planner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create and share detailed builds with gear, skills, attributes, and more. No
                  account required.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/builds/create">Create Build</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Guides</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Comprehensive guides for beginners and veterans alike. Class guides, endgame
                  strategies, and more.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/guides">Read Guides</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 via-card to-accent/10 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Share Your Build?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Create and share your Hero Siege builds with the community. No account required to get
            started.
          </p>
          <Button size="lg" asChild>
            <Link href="/builds/create">
              <Hammer className="h-5 w-5 mr-2" />
              Create Your Build
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

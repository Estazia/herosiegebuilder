'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Twitch, Youtube, Twitter, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BuildCard, BuildCardSkeleton } from '@/components/build-card'
import { createClient } from '@/lib/supabase/client'
import type { Creator, Build, Profile } from '@/lib/types'

interface CreatorPageProps {
  params: Promise<{
    id: string
  }>
}

async function getTwitchStatus(twitchUrl: string) {
  if (!twitchUrl) return null

  try {
    // Extract username from URL
    const username = twitchUrl.split('/').filter(Boolean).pop()
    if (!username) return null

    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${username}`,
      {
        headers: {
          'Client-ID': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || '',
          Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN || ''}`,
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.data?.[0] || null
  } catch {
    return null
  }
}

export default async function CreatorDetailPage({ params }: CreatorPageProps) {
  const { id } = await params
  const supabase = createClient()

  // Fetch creator data
  const { data: creator } = await supabase
    .from('creators')
    .select(
      `
      *,
      profiles (id, username, avatar_url)
    `
    )
    .eq('user_id', id)
    .single()

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Creator not found.</p>
          <Button asChild>
            <Link href="/creators">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Creators
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Fetch creator builds
  const { data: builds } = await supabase
    .from('builds')
    .select(
      `
      *,
      profiles (id, username, avatar_url)
    `
    )
    .eq('user_id', creator.user_id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const twitchStatus = creator.twitch_url ? await getTwitchStatus(creator.twitch_url) : null

  return (
    <CreatorDetailContent
      creator={creator}
      builds={builds || []}
      twitchStatus={twitchStatus}
    />
  )
}

function CreatorDetailContent({
  creator,
  builds,
  twitchStatus,
}: {
  creator: Creator
  builds: Build[]
  twitchStatus: any
}) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-card/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/creators">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Creators
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage
                src={creator.profiles?.avatar_url || undefined}
                alt={creator.profiles?.username}
              />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {creator.profiles?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold">
                  {creator.profiles?.username}
                </h1>
                {creator.is_verified && (
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Verified
                  </div>
                )}
              </div>

              {creator.class_specialty && (
                <p className="text-lg text-muted-foreground mb-4">
                  Specialty: <span className="text-primary font-semibold">{creator.class_specialty}</span>
                </p>
              )}

              {creator.bio && (
                <p className="text-muted-foreground mb-6 max-w-2xl">{creator.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex gap-4 flex-wrap">
                {creator.twitch_url && (
                  <a
                    href={creator.twitch_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-purple-500 transition-colors"
                  >
                    <Twitch className="h-6 w-6" />
                  </a>
                )}
                {creator.youtube_url && (
                  <a
                    href={creator.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Youtube className="h-6 w-6" />
                  </a>
                )}
                {creator.twitter_url && (
                  <a
                    href={creator.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-blue-500 transition-colors"
                  >
                    <Twitter className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Twitch Live Status */}
      {creator.twitch_url && (
        <section className="py-6 md:py-8 bg-purple-950/30 border-b border-purple-900/50">
          <div className="container mx-auto px-4">
            <TwitchLiveCard twitchUrl={creator.twitch_url} initialStatus={twitchStatus} />
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="border-b border-border bg-card/20 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Followers</p>
              <p className="text-3xl font-bold text-primary">{creator.followers_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Builds</p>
              <p className="text-3xl font-bold text-primary">{builds.length}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-lg font-semibold">
                {new Date(creator.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Builds */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              Builds by {creator.profiles?.username}
            </h2>
            <p className="text-muted-foreground mt-2">
              Discover all the builds created by this creator
            </p>
          </div>

          {builds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {builds.map((build) => (
                <BuildCard key={build.id} build={build} />
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 border-border">
              <CardContent className="pt-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No builds shared yet by this creator.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}

// Client component to handle live status refresh
function TwitchLiveCard({ twitchUrl, initialStatus }: { twitchUrl: string; initialStatus: any }) {
  const [liveStatus, setLiveStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Refresh live status every 30 seconds
    const interval = setInterval(async () => {
      setLoading(true)
      try {
        const username = twitchUrl.split('/').filter(Boolean).pop()
        if (!username) return

        // Note: This would need backend support to fetch actual Twitch status
        // For now, we'll just show the initial status
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [twitchUrl])

  if (!liveStatus) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Twitch className="h-5 w-5" />
            <p>Not currently live on Twitch</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-purple-950 to-purple-900 border-purple-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Zap className="h-5 w-5 animate-pulse" />
          Live on Twitch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-lg font-bold text-white">{liveStatus.title}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Playing: <span className="text-primary">{liveStatus.game_name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Viewers: <span className="text-accent">{liveStatus.viewer_count.toLocaleString()}</span>
          </p>
        </div>

        {liveStatus.thumbnail_url && (
          <div className="rounded-md overflow-hidden">
            <img
              src={liveStatus.thumbnail_url.replace('{width}', '400').replace('{height}', '225')}
              alt={liveStatus.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <a
          href={twitchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
            <Twitch className="h-4 w-4" />
            Watch on Twitch
          </Button>
        </a>
      </CardContent>
    </Card>
  )
}

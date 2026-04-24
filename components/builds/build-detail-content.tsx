'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Share2,
  Eye,
  Star,
  Calendar,
  User,
  Pencil,
  Check,
  Copy,
  ChevronLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClassIcon } from '@/components/class-icon'
import { GearTab } from '@/components/builds/tabs/gear-tab'
import { AttributesTab } from '@/components/builds/tabs/attributes-tab'
import { SkillTreeTab } from '@/components/builds/tabs/skill-tree-tab'
import { IncarnationTreeTab } from '@/components/builds/tabs/incarnation-tree-tab'
import { MercenaryTab } from '@/components/builds/tabs/mercenary-tab'
import { FaqTab } from '@/components/builds/tabs/faq-tab'
import { ShowcaseTab } from '@/components/builds/tabs/showcase-tab'
import { StarRating } from '@/components/star-rating'
import { createClient } from '@/lib/supabase/client'
import type { Build, BuildTab, TabType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface BuildDetailContentProps {
  build: Build & {
    build_tabs?: BuildTab[]
    average_rating: number
    vote_count: number
  }
}

const TAB_CONFIG: { type: TabType; label: string }[] = [
  { type: 'GEAR', label: 'Gear' },
  { type: 'ATTRIBUTES', label: 'Attributes' },
  { type: 'SKILLS', label: 'Skill Tree' },
  { type: 'INCARNATION', label: 'Incarnation' },
  { type: 'MERCENARY', label: 'Mercenary' },
  { type: 'FAQ', label: 'FAQ' },
  { type: 'SHOWCASE', label: 'Showcase' },
]

export function BuildDetailContent({ build }: BuildDetailContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('GEAR')
  const [copied, setCopied] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [currentRating, setCurrentRating] = useState(build.average_rating)
  const [voteCount, setVoteCount] = useState(build.vote_count)
  const [isOwner, setIsOwner] = useState(false)

  const supabase = createClient()

  // Track view and check ownership
  useEffect(() => {
    async function init() {
      // Generate or get session ID
      let sessionId = localStorage.getItem('hs_session_id')
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        localStorage.setItem('hs_session_id', sessionId)
      }

      // Track view
      await supabase.from('build_views').upsert(
        {
          build_id: build.id,
          session_id: sessionId,
        },
        { onConflict: 'build_id,session_id' }
      )

      // Increment view count
      await supabase.rpc('increment_build_views', { build_id: build.id }).catch(() => {
        // Fallback: update directly
        supabase
          .from('builds')
          .update({ views: build.views + 1 })
          .eq('id', build.id)
      })

      // Check if user is owner
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user && build.user_id === user.id) {
        setIsOwner(true)
      }

      // Check for guest token ownership
      const guestToken = localStorage.getItem(`build_token_${build.id}`)
      if (guestToken && build.guest_token === guestToken) {
        setIsOwner(true)
      }

      // Get user's existing rating
      if (user) {
        const { data: rating } = await supabase
          .from('ratings')
          .select('score')
          .eq('build_id', build.id)
          .eq('user_id', user.id)
          .single()

        if (rating) {
          setUserRating(rating.score)
        }
      }
    }

    init()
  }, [build.id, build.user_id, build.views, build.guest_token, supabase])

  const handleShare = async () => {
    const url = window.location.href

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleRate = async (score: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please login to rate builds')
      return
    }

    const { error } = await supabase.from('ratings').upsert(
      {
        build_id: build.id,
        user_id: user.id,
        score,
      },
      { onConflict: 'build_id,user_id' }
    )

    if (error) {
      toast.error('Failed to submit rating')
      return
    }

    setUserRating(score)

    // Refetch rating
    const { data: ratingData } = await supabase.rpc('get_build_rating', {
      p_build_id: build.id,
    })

    if (ratingData?.[0]) {
      setCurrentRating(ratingData[0].average_rating)
      setVoteCount(ratingData[0].vote_count)
    }

    toast.success('Rating submitted!')
  }

  const getTabContent = (tabType: TabType) => {
    const tabData = build.build_tabs?.find((t) => t.tab_type === tabType)
    return tabData?.content || {}
  }

  const formattedDate = new Date(build.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-6">
          {/* Back link */}
          <Link
            href="/builds"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Builds
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Build Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <ClassIcon heroClass={build.class} size="lg" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{build.title}</h1>
                  <p className="text-lg text-muted-foreground">{build.class}</p>
                </div>
              </div>

              {build.description && (
                <p className="text-muted-foreground max-w-2xl">{build.description}</p>
              )}

              {/* Tags */}
              {build.tags && build.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {build.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Author & Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={build.profiles?.avatar_url || undefined}
                      alt={build.profiles?.username}
                    />
                    <AvatarFallback className="text-xs">
                      {build.profiles?.username?.slice(0, 2).toUpperCase() || (
                        <User className="h-3 w-3" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground">
                    by{' '}
                    <span className="text-foreground">
                      {build.profiles?.username || 'Anonymous'}
                    </span>
                  </span>
                </div>

                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </span>

                <span className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {build.views.toLocaleString()} views
                </span>

                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star
                    className={cn(
                      'h-4 w-4',
                      currentRating > 0 ? 'text-accent fill-accent' : ''
                    )}
                  />
                  {currentRating > 0 ? currentRating.toFixed(1) : '-'}
                  {voteCount > 0 && (
                    <span className="text-muted-foreground/60">({voteCount} votes)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleShare}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? 'Copied!' : 'Share'}
                </Button>

                {isOwner && (
                  <Button variant="outline" asChild>
                    <Link href={`/builds/${build.slug}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                )}
              </div>

              {/* Rating */}
              <div className="flex flex-col items-start gap-2">
                <span className="text-sm text-muted-foreground">Rate this build:</span>
                <StarRating
                  value={userRating || 0}
                  onChange={handleRate}
                  disabled={isOwner}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabType)}
          className="w-full"
        >
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <TabsList className="inline-flex w-auto min-w-full lg:w-full bg-card border border-border">
              {TAB_CONFIG.map((tab) => (
                <TabsTrigger
                  key={tab.type}
                  value={tab.type}
                  className="flex-1 min-w-[100px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="GEAR" className="mt-0">
              <GearTab content={getTabContent('GEAR')} readOnly />
            </TabsContent>

            <TabsContent value="ATTRIBUTES" className="mt-0">
              <AttributesTab content={getTabContent('ATTRIBUTES')} readOnly />
            </TabsContent>

            <TabsContent value="SKILLS" className="mt-0">
              <SkillTreeTab content={getTabContent('SKILLS')} readOnly />
            </TabsContent>

            <TabsContent value="INCARNATION" className="mt-0">
              <IncarnationTreeTab content={getTabContent('INCARNATION')} readOnly />
            </TabsContent>

            <TabsContent value="MERCENARY" className="mt-0">
              <MercenaryTab content={getTabContent('MERCENARY')} readOnly />
            </TabsContent>

            <TabsContent value="FAQ" className="mt-0">
              <FaqTab content={getTabContent('FAQ')} readOnly />
            </TabsContent>

            <TabsContent value="SHOWCASE" className="mt-0">
              <ShowcaseTab content={getTabContent('SHOWCASE')} readOnly />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

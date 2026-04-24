'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import {
  Save,
  Globe,
  ChevronLeft,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClassIcon } from '@/components/class-icon'
import { GearTab } from '@/components/builds/tabs/gear-tab'
import { AttributesTab } from '@/components/builds/tabs/attributes-tab'
import { SkillTreeTab } from '@/components/builds/tabs/skill-tree-tab'
import { IncarnationTreeTab } from '@/components/builds/tabs/incarnation-tree-tab'
import { MercenaryTab } from '@/components/builds/tabs/mercenary-tab'
import { FaqTab } from '@/components/builds/tabs/faq-tab'
import { ShowcaseTab } from '@/components/builds/tabs/showcase-tab'
import { createClient } from '@/lib/supabase/client'
import { HERO_CLASSES, TAB_TYPES, type HeroClass, type TabType, type Build } from '@/lib/types'
import { cn } from '@/lib/utils'

interface BuildEditorProps {
  existingBuild?: Build & { build_tabs?: { tab_type: TabType; content: Record<string, unknown> }[] }
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

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + nanoid(6)
  )
}

export function BuildEditor({ existingBuild }: BuildEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // Build metadata
  const [title, setTitle] = useState(existingBuild?.title || '')
  const [heroClass, setHeroClass] = useState<HeroClass | ''>(existingBuild?.class || '')
  const [description, setDescription] = useState(existingBuild?.description || '')
  const [tags, setTags] = useState<string[]>(existingBuild?.tags || [])
  const [tagInput, setTagInput] = useState('')

  // Tab content
  const [tabContent, setTabContent] = useState<Record<TabType, Record<string, unknown>>>(() => {
    const initial: Record<TabType, Record<string, unknown>> = {
      GEAR: {},
      ATTRIBUTES: {},
      SKILLS: {},
      INCARNATION: {},
      MERCENARY: {},
      FAQ: {},
      SHOWCASE: {},
    }
    existingBuild?.build_tabs?.forEach((tab) => {
      initial[tab.tab_type] = tab.content
    })
    return initial
  })

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('GEAR')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showGuestWarning, setShowGuestWarning] = useState(false)
  const [isGuest, setIsGuest] = useState(true)
  const [buildId, setBuildId] = useState(existingBuild?.id || '')
  const [guestToken, setGuestToken] = useState(existingBuild?.guest_token || '')
  const [published, setPublished] = useState(existingBuild?.is_published || false)
  const [copied, setCopied] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsGuest(!user)
    }
    checkAuth()
  }, [supabase])

  // Generate guest token if needed
  useEffect(() => {
    if (isGuest && !guestToken && !existingBuild) {
      const token = nanoid(32)
      setGuestToken(token)
    }
  }, [isGuest, guestToken, existingBuild])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (buildId && title && heroClass) {
      autoSaveTimer.current = setInterval(() => {
        saveDraft(true)
      }, 30000)
    }

    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current)
      }
    }
  }, [buildId, title, heroClass])

  const updateTabContent = useCallback((tabType: TabType, content: Record<string, unknown>) => {
    setTabContent((prev) => ({ ...prev, [tabType]: content }))
  }, [])

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const saveDraft = async (silent = false) => {
    if (!title || !heroClass) {
      if (!silent) toast.error('Please enter a title and select a class')
      return
    }

    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const slug = existingBuild?.slug || generateSlug(title)

      const buildData = {
        title,
        slug,
        class: heroClass,
        description,
        tags,
        user_id: user?.id || null,
        guest_token: user ? null : guestToken,
        is_published: false,
        is_draft: true,
      }

      let currentBuildId = buildId

      if (currentBuildId) {
        // Update existing build
        const { error } = await supabase
          .from('builds')
          .update(buildData)
          .eq('id', currentBuildId)

        if (error) throw error
      } else {
        // Create new build
        const { data, error } = await supabase
          .from('builds')
          .insert(buildData)
          .select('id')
          .single()

        if (error) throw error
        currentBuildId = data.id
        setBuildId(data.id)

        // Store guest token locally
        if (!user && guestToken) {
          localStorage.setItem(`build_token_${data.id}`, guestToken)
        }
      }

      // Save tab content
      for (const tabType of TAB_TYPES) {
        await supabase
          .from('build_tabs')
          .upsert(
            {
              build_id: currentBuildId,
              tab_type: tabType,
              content: tabContent[tabType],
            },
            { onConflict: 'build_id,tab_type' }
          )
      }

      setLastSaved(new Date())
      if (!silent) toast.success('Draft saved!')
    } catch (error) {
      console.error('Error saving draft:', error)
      if (!silent) toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  const publish = async () => {
    if (!title || !heroClass) {
      toast.error('Please enter a title and select a class')
      return
    }

    // Show guest warning before publishing
    if (isGuest && !published) {
      setShowGuestWarning(true)
      return
    }

    await doPublish()
  }

  const doPublish = async () => {
    setIsLoading(true)

    try {
      await saveDraft(true)

      const { error } = await supabase
        .from('builds')
        .update({ is_published: true, is_draft: false })
        .eq('id', buildId)

      if (error) throw error

      setPublished(true)
      toast.success('Build published successfully!')

      // Get slug for redirect
      const { data: build } = await supabase
        .from('builds')
        .select('slug')
        .eq('id', buildId)
        .single()

      if (build) {
        router.push(`/builds/${build.slug}`)
      }
    } catch (error) {
      console.error('Error publishing:', error)
      toast.error('Failed to publish build')
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = async () => {
    if (!buildId) return
    
    const { data: build } = await supabase
      .from('builds')
      .select('slug')
      .eq('id', buildId)
      .single()

    if (build) {
      const url = `${window.location.origin}/builds/${build.slug}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-border bg-card/30 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/builds"
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold">
                  {existingBuild ? 'Edit Build' : 'Create Build'}
                </h1>
                {lastSaved && (
                  <p className="text-xs text-muted-foreground">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isGuest && (
                <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Guest Mode
                </Badge>
              )}

              <Button
                variant="outline"
                onClick={() => saveDraft(false)}
                disabled={isSaving || !title || !heroClass}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>

              <Button
                onClick={publish}
                disabled={isLoading || !title || !heroClass}
              >
                <Globe className="h-4 w-4 mr-2" />
                {isLoading ? 'Publishing...' : published ? 'Update' : 'Publish'}
              </Button>

              {published && (
                <Button variant="outline" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Metadata Section */}
        <Card className="mb-6 bg-card/50">
          <CardHeader>
            <CardTitle>Build Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Build Name *</Label>
                <Input
                  id="title"
                  placeholder="Enter your build name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select value={heroClass} onValueChange={(v) => setHeroClass(v as HeroClass)}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {HERO_CLASSES.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        <div className="flex items-center gap-2">
                          <ClassIcon heroClass={cls} size="sm" />
                          {cls}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your build (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-muted/50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (up to 5)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-muted/50 max-w-xs"
                  disabled={tags.length >= 5}
                />
                <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 5}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
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
              <GearTab
                content={tabContent.GEAR}
                onChange={(content) => updateTabContent('GEAR', content)}
              />
            </TabsContent>

            <TabsContent value="ATTRIBUTES" className="mt-0">
              <AttributesTab
                content={tabContent.ATTRIBUTES}
                onChange={(content) => updateTabContent('ATTRIBUTES', content)}
              />
            </TabsContent>

            <TabsContent value="SKILLS" className="mt-0">
              <SkillTreeTab
                content={tabContent.SKILLS}
                onChange={(content) => updateTabContent('SKILLS', content)}
              />
            </TabsContent>

            <TabsContent value="INCARNATION" className="mt-0">
              <IncarnationTreeTab
                content={tabContent.INCARNATION}
                onChange={(content) => updateTabContent('INCARNATION', content)}
              />
            </TabsContent>

            <TabsContent value="MERCENARY" className="mt-0">
              <MercenaryTab
                content={tabContent.MERCENARY}
                onChange={(content) => updateTabContent('MERCENARY', content)}
              />
            </TabsContent>

            <TabsContent value="FAQ" className="mt-0">
              <FaqTab
                content={tabContent.FAQ}
                onChange={(content) => updateTabContent('FAQ', content)}
              />
            </TabsContent>

            <TabsContent value="SHOWCASE" className="mt-0">
              <ShowcaseTab
                content={tabContent.SHOWCASE}
                onChange={(content) => updateTabContent('SHOWCASE', content)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Guest Warning Dialog */}
      <AlertDialog open={showGuestWarning} onOpenChange={setShowGuestWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Guest Build Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You&apos;re publishing this build as a guest. A unique link will be generated that you
                <strong> must save</strong> to edit this build later.
              </p>
              <p className="text-amber-500">
                If you lose this link, you won&apos;t be able to recover or edit your build.
              </p>
              <p>
                Consider{' '}
                <Link href="/auth/sign-up" className="text-primary hover:underline">
                  creating an account
                </Link>{' '}
                to manage your builds more easily.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doPublish}>
              I Understand, Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

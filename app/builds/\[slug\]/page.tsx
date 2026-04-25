import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClassIcon } from '@/components/class-icon'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { Eye, User, Calendar, Star, Share2, Edit } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Build Details',
  description: 'View detailed build information and guides',
}

export default async function BuildDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Get build details with user info
  const { data: build, error: buildError } = await supabase
    .from('builds')
    .select('*, profiles:user_id(id, username, avatar_url)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (buildError || !build) {
    notFound()
  }

  // Get build tabs content
  const { data: tabs = [] } = await supabase
    .from('build_tabs')
    .select('*')
    .eq('build_id', build.id)

  // Get ratings
  const { data: ratings = [] } = await supabase
    .from('ratings')
    .select('score')
    .eq('build_id', build.id)

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
    : 'N/A'

  // Create tabs map for easy access
  const tabsMap = Object.fromEntries(
    tabs.map((tab) => [tab.tab_type, tab.content])
  )

  const author = build.profiles

  return (
    <div className="min-h-[calc(100vh-8rem)] w-full space-y-8 p-6 md:p-10">
      {/* Header Section */}
      <div className="space-y-6">
        {/* Top Bar with Class and Actions */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <ClassIcon heroClass={build.class} size="lg" />
            <div>
              <h1 className="text-4xl font-bold">{build.title}</h1>
              <p className="text-muted-foreground">{build.class}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Star className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Build Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{build.views || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">{averageRating}</span>
                <span className="text-xs text-muted-foreground">({ratings.length})</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm">
                  {new Date(build.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {author && (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/creators/${author.id}`} className="flex items-center gap-2 hover:opacity-80">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={author.avatar_url || undefined} alt={author.username} />
                    <AvatarFallback>{author.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">{author.username}</span>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Description */}
        {build.description && (
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{build.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="gear" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50 border border-border">
          <TabsTrigger value="gear">Gear & Skills</TabsTrigger>
          <TabsTrigger value="skill-tree">Skill Tree</TabsTrigger>
          <TabsTrigger value="incarnation">Incarnation</TabsTrigger>
          <TabsTrigger value="mercenary">Mercenary</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Gear and Skills Tab */}
        <TabsContent value="gear" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Gear & Skills</CardTitle>
              <CardDescription>Equipment and skill configuration for this build</CardDescription>
            </CardHeader>
            <CardContent>
              {tabsMap['GEAR'] && Object.keys(tabsMap['GEAR']).length > 0 ? (
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(tabsMap['GEAR'], null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground">No gear information provided for this build</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Tree Tab */}
        <TabsContent value="skill-tree" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Skill Tree</CardTitle>
              <CardDescription>Skill allocation and progression</CardDescription>
            </CardHeader>
            <CardContent>
              {tabsMap['SKILLS'] && Object.keys(tabsMap['SKILLS']).length > 0 ? (
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(tabsMap['SKILLS'], null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground">No skill tree information provided for this build</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incarnation Tab */}
        <TabsContent value="incarnation" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Incarnation Tree</CardTitle>
              <CardDescription>Incarnation selection and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {tabsMap['INCARNATION'] && Object.keys(tabsMap['INCARNATION']).length > 0 ? (
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(tabsMap['INCARNATION'], null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground">No incarnation information provided for this build</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mercenary Tab */}
        <TabsContent value="mercenary" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Mercenary</CardTitle>
              <CardDescription>Mercenary companion setup</CardDescription>
            </CardHeader>
            <CardContent>
              {tabsMap['MERCENARY'] && Object.keys(tabsMap['MERCENARY']).length > 0 ? (
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(tabsMap['MERCENARY'], null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground">No mercenary information provided for this build</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional notes and tips for this build</CardDescription>
            </CardHeader>
            <CardContent>
              {tabsMap['FAQ'] && Object.keys(tabsMap['FAQ']).length > 0 ? (
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(tabsMap['FAQ'], null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground">No notes provided for this build</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tags Section */}
      {build.tags && build.tags.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {build.tags.map((tag: string) => (
              <Button key={tag} variant="secondary" size="sm">
                #{tag}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

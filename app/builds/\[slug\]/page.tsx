import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClassIcon } from '@/components/class-icon'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { Eye, User, Calendar, Star, Share2, Edit, Sword, Brain, Users, FileText } from 'lucide-react'

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
    <div className="min-h-[calc(100vh-8rem)] w-full space-y-6 p-6 md:p-10">
      {/* Header with Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">{build.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <ClassIcon heroClass={build.class} size="lg" showLabel />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {build.views || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" /> {averageRating} ({ratings.length})
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(build.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {author && (
                <Link href={`/creators/${author.id}`} className="flex items-center gap-1 hover:opacity-80">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={author.avatar_url || undefined} alt={author.username} />
                    <AvatarFallback>{author.username?.[0]}</AvatarFallback>
                  </Avatar>
                  {author.username}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button size="sm" className="gap-2">
            <Star className="h-4 w-4" />
            Save Build
          </Button>
        </div>
      </div>

      {/* Description */}
      {build.description && (
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardContent className="pt-6">
            <p className="text-muted-foreground whitespace-pre-wrap">{build.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs Section */}
      <Tabs defaultValue="gear" className="w-full">
        <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent border-b border-border h-auto p-0">
          <TabsTrigger 
            value="gear" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 gap-2"
          >
            <Sword className="h-4 w-4" />
            Gear & Skills
          </TabsTrigger>
          <TabsTrigger 
            value="skill-tree"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 gap-2"
          >
            <Brain className="h-4 w-4" />
            Skill Tree
          </TabsTrigger>
          <TabsTrigger 
            value="incarnation"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 gap-2"
          >
            <div className="h-4 w-4 rounded-full bg-primary/50" />
            Incarnation
          </TabsTrigger>
          <TabsTrigger 
            value="mercenary"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 gap-2"
          >
            <Users className="h-4 w-4" />
            Mercenary
          </TabsTrigger>
          <TabsTrigger 
            value="notes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 gap-2"
          >
            <FileText className="h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>

        {/* Gear and Skills Tab */}
        <TabsContent value="gear" className="space-y-6 mt-6">
          {tabsMap['GEAR'] && Object.keys(tabsMap['GEAR']).length > 0 ? (
            <div className="space-y-6">
              {/* Gear items - Main equipment */}
              <Card className="bg-card/80 backdrop-blur border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sword className="h-5 w-5" />
                    Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(tabsMap['GEAR']).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-muted/50 rounded-lg p-4 border border-border">
                        <h4 className="font-semibold capitalize text-sm mb-3">{key}</h4>
                        {typeof value === 'object' ? (
                          <div className="space-y-2 text-sm">
                            {Object.entries(value).map(([stat, val]: [string, any]) => (
                              <div key={stat} className="flex justify-between text-muted-foreground">
                                <span className="capitalize">{stat}</span>
                                <span className="text-foreground">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{String(value)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skills if available */}
              {tabsMap['SKILLS'] && Object.keys(tabsMap['SKILLS']).length > 0 && (
                <Card className="bg-card/80 backdrop-blur border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Active Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(tabsMap['SKILLS']).map(([skill, data]: [string, any]) => (
                        <div key={skill} className="bg-muted/50 rounded-lg p-3 border border-border">
                          <p className="font-semibold text-sm capitalize">{skill}</p>
                          {typeof data === 'object' && Object.keys(data).length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {JSON.stringify(data)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">No gear information provided for this build</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Skill Tree Tab */}
        <TabsContent value="skill-tree" className="space-y-6 mt-6">
          {tabsMap['SKILLS'] && Object.keys(tabsMap['SKILLS']).length > 0 ? (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader>
                <CardTitle>Skill Allocation</CardTitle>
                <CardDescription>Skill points and progression for this build</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-6 rounded-lg overflow-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(tabsMap['SKILLS'], null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">No skill tree information provided for this build</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Incarnation Tab */}
        <TabsContent value="incarnation" className="space-y-6 mt-6">
          {tabsMap['INCARNATION'] && Object.keys(tabsMap['INCARNATION']).length > 0 ? (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader>
                <CardTitle>Incarnation Tree</CardTitle>
                <CardDescription>Incarnation selection and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-6 rounded-lg overflow-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(tabsMap['INCARNATION'], null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">No incarnation information provided for this build</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Mercenary Tab */}
        <TabsContent value="mercenary" className="space-y-6 mt-6">
          {tabsMap['MERCENARY'] && Object.keys(tabsMap['MERCENARY']).length > 0 ? (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader>
                <CardTitle>Mercenary Setup</CardTitle>
                <CardDescription>Companion configuration and stats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-6 rounded-lg overflow-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(tabsMap['MERCENARY'], null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">No mercenary information provided for this build</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6 mt-6">
          {tabsMap['FAQ'] && Object.keys(tabsMap['FAQ']).length > 0 ? (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardHeader>
                <CardTitle>Build Notes & Tips</CardTitle>
                <CardDescription>Important information and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-6 rounded-lg overflow-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(tabsMap['FAQ'], null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/80 backdrop-blur border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">No notes provided for this build</p>
              </CardContent>
            </Card>
          )}
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

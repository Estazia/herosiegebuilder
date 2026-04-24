import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { User, Swords, Edit, LogOut, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { BuildCard } from '@/components/build-card'

export const metadata: Metadata = {
  title: 'User Profile',
  description: 'View and manage your profile',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile and builds
  const [profileRes, buildsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('builds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileRes.data
  const builds = buildsRes.data || []

  const initials = profile?.username
    ? profile.username
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U'

  const joinDate = new Date(profile?.created_at || user.created_at || new Date())
  const formattedDate = joinDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-[calc(100vh-8rem)] w-full space-y-8 p-6 md:p-10">
      {/* Profile Header */}
      <div className="space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || 'User'} />
              <AvatarFallback className="bg-primary/20 text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold">{profile?.username || user.email?.split('@')[0]}</h1>
                <p className="text-sm text-muted-foreground capitalize">{profile?.role?.toLowerCase() || 'user'}</p>
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined {formattedDate}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/profile/edit">
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
            <form
              action={async () => {
                'use server'
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect('/auth/login')
              }}
            >
              <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Builds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{builds.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published Builds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{builds.filter((b) => b.is_published).length}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{builds.reduce((sum, b) => sum + (b.views || 0), 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Builds Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" />
            Your Builds
          </h2>
          <p className="text-muted-foreground">All your published and draft builds</p>
        </div>

        {builds.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur border-border">
            <CardContent className="py-12 text-center">
              <Swords className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">You haven&apos;t created any builds yet</p>
              <Link href="/builds/create">
                <Button className="gap-2">
                  <Swords className="h-4 w-4" />
                  Create Your First Build
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

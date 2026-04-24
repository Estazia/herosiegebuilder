import Link from 'next/link'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/server'
import { Twitch, Youtube, Twitter } from 'lucide-react'

async function getCreators() {
  const supabase = await createClient()
  const { data: creators } = await supabase
    .from('creators')
    .select(
      `
      *,
      profiles (id, username, avatar_url)
    `
    )
    .eq('is_verified', true)
    .order('followers_count', { ascending: false })

  return creators || []
}

export default async function CreatorsPage() {
  const creators = await getCreators()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-card/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Creators & Streamers</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover amazing Hero Siege content creators. Click on any creator to see their builds
            and check if they&apos;re live on Twitch.
          </p>
        </div>
      </section>

      {/* Creators Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {creators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <Link key={creator.id} href={`/creators/${creator.user_id}`}>
                  <Card className="bg-card/50 border-border hover:border-primary/50 transition-all cursor-pointer h-full hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={creator.profiles?.avatar_url || undefined}
                            alt={creator.profiles?.username}
                          />
                          <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                            {creator.profiles?.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {creator.is_verified && (
                          <div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-semibold">
                            Verified
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{creator.profiles?.username}</h3>
                      {creator.class_specialty && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Specialty: <span className="text-primary font-semibold">{creator.class_specialty}</span>
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {creator.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{creator.bio}</p>
                      )}

                      {/* Stats */}
                      <div className="flex gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Followers</p>
                          <p className="text-lg font-bold">{creator.followers_count || 0}</p>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex gap-2 pt-2">
                        {creator.twitch_url && (
                          <a
                            href={creator.twitch_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-purple-500 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Twitch className="h-5 w-5" />
                          </a>
                        )}
                        {creator.youtube_url && (
                          <a
                            href={creator.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Youtube className="h-5 w-5" />
                          </a>
                        )}
                        {creator.twitter_url && (
                          <a
                            href={creator.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-500 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No creators found yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

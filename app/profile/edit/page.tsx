'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Profile } from '@/lib/types'

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfile(data)
        setUsername(data.username)
        setAvatarUrl(data.avatar_url || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          avatar_url: avatarUrl || null,
        })
        .eq('id', profile.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/profile')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const initials = username
    ? username
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="min-h-[calc(100vh-8rem)] w-full space-y-6 p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="bg-card/80 backdrop-blur border-border">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex flex-col gap-4">
              <Label>Profile Picture</Label>
              <div className="flex gap-4 items-center">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback className="bg-primary/20">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatar-url" className="text-sm">
                    Image URL
                  </Label>
                  <Input
                    id="avatar-url"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="bg-muted/50 mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a URL to an image to use as your avatar
                  </p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                required
                className="bg-muted/50"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Profile updated successfully. Redirecting...
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving || !username.trim()}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Link href="/profile">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

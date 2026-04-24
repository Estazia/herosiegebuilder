'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, ImageIcon, Link2, Plus, Trash2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface ShowcaseTabProps {
  content: Record<string, unknown>
  readOnly?: boolean
  onChange?: (content: Record<string, unknown>) => void
}

interface ShowcaseData {
  youtubeUrl?: string
  images: string[]
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function ShowcaseTab({ content, readOnly = false, onChange }: ShowcaseTabProps) {
  const showcase = (content?.showcase as ShowcaseData) || { images: [] }
  const [newImageUrl, setNewImageUrl] = useState('')
  const [youtubeInput, setYoutubeInput] = useState(showcase.youtubeUrl || '')

  const updateShowcase = (updates: Partial<ShowcaseData>) => {
    if (readOnly || !onChange) return
    onChange({
      ...content,
      showcase: { ...showcase, ...updates },
    })
  }

  const addImage = () => {
    if (!newImageUrl.trim()) return
    updateShowcase({ images: [...showcase.images, newImageUrl.trim()] })
    setNewImageUrl('')
  }

  const removeImage = (index: number) => {
    updateShowcase({ images: showcase.images.filter((_, i) => i !== index) })
  }

  const saveYoutube = () => {
    updateShowcase({ youtubeUrl: youtubeInput })
  }

  const youtubeId = showcase.youtubeUrl ? extractYoutubeId(showcase.youtubeUrl) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Showcase
          </h2>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? 'Videos and screenshots showcasing this build'
              : 'Add videos and images to showcase your build'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="video" className="gap-2">
            <Play className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Images
          </TabsTrigger>
        </TabsList>

        {/* Video Tab */}
        <TabsContent value="video" className="mt-6">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">YouTube Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!readOnly && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste YouTube URL..."
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                  />
                  <Button onClick={saveYoutube}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}

              {youtubeId ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="Build Showcase Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Play className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>{readOnly ? 'No video added' : 'Add a YouTube URL to embed a video'}</p>
                  </div>
                </div>
              )}

              {showcase.youtubeUrl && (
                <a
                  href={showcase.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Watch on YouTube
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="mt-6">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Screenshots & Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!readOnly && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addImage()}
                  />
                  <Button onClick={addImage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}

              {showcase.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {showcase.images.map((url, index) => (
                    <div
                      key={index}
                      className="relative group aspect-video rounded-lg overflow-hidden bg-muted"
                    >
                      <Image
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%" y="50%" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E'
                        }}
                      />
                      {!readOnly && (
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>{readOnly ? 'No images added' : 'Add image URLs to showcase your build'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      {!readOnly && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Showcase Tips:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Add a gameplay video showing the build in action</li>
              <li>Include screenshots of your character stats</li>
              <li>Show gear in detail with stat screenshots</li>
              <li>Add boss kill videos to demonstrate effectiveness</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

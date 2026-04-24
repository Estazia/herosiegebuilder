import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BuildDetailContent } from '@/components/builds/build-detail-content'

interface BuildPageProps {
  params: Promise<{ slug: string }>
}

async function getBuild(slug: string) {
  const supabase = await createClient()

  const { data: build, error } = await supabase
    .from('builds')
    .select(
      `
      *,
      profiles (id, username, avatar_url, role),
      build_tabs (*)
    `
    )
    .eq('slug', slug)
    .single()

  if (error || !build) {
    return null
  }

  // Get rating
  const { data: ratingData } = await supabase.rpc('get_build_rating', {
    p_build_id: build.id,
  })

  return {
    ...build,
    average_rating: ratingData?.[0]?.average_rating || 0,
    vote_count: ratingData?.[0]?.vote_count || 0,
  }
}

export async function generateMetadata({ params }: BuildPageProps): Promise<Metadata> {
  const { slug } = await params
  const build = await getBuild(slug)

  if (!build) {
    return {
      title: 'Build Not Found',
    }
  }

  return {
    title: build.title,
    description: build.description || `${build.class} build for Hero Siege`,
    openGraph: {
      title: `${build.title} - ${build.class} Build`,
      description: build.description || `${build.class} build for Hero Siege`,
      type: 'article',
      authors: build.profiles?.username ? [build.profiles.username] : undefined,
    },
  }
}

export default async function BuildPage({ params }: BuildPageProps) {
  const { slug } = await params
  const build = await getBuild(slug)

  if (!build) {
    notFound()
  }

  // Check if build is published or if user owns it
  if (!build.is_published) {
    // For now, allow viewing unpublished builds via direct link
    // In production, you'd check if the current user owns the build
  }

  return <BuildDetailContent build={build} />
}

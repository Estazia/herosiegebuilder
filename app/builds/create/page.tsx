import type { Metadata } from 'next'
import { BuildEditor } from '@/components/builds/build-editor'

export const metadata: Metadata = {
  title: 'Create Build',
  description: 'Create and share your Hero Siege build with the community.',
}

export default function CreateBuildPage() {
  return <BuildEditor />
}

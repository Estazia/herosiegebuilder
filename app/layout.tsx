import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Hero Siege Builds - Build Guides, Tier Lists & More',
    template: '%s | Hero Siege Builds',
  },
  description:
    'The ultimate resource for Hero Siege builds, tier lists, guides, and game information. Find the best builds for every class and dominate the battlefield.',
  keywords: [
    'Hero Siege',
    'builds',
    'tier list',
    'guides',
    'ARPG',
    'character builds',
    'game guide',
  ],
  authors: [{ name: 'Hero Siege Builds Community' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Hero Siege Builds',
    title: 'Hero Siege Builds - Build Guides, Tier Lists & More',
    description:
      'The ultimate resource for Hero Siege builds, tier lists, guides, and game information.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hero Siege Builds',
    description:
      'The ultimate resource for Hero Siege builds, tier lists, guides, and game information.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'oklch(0.12 0.015 280)',
              border: '1px solid oklch(0.25 0.03 280)',
              color: 'oklch(0.93 0.01 90)',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

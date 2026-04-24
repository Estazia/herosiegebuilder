import Link from 'next/link'
import { Swords } from 'lucide-react'

const footerLinks = {
  resources: [
    { label: 'Tier List', href: '/tierlists' },
    { label: 'Builds', href: '/builds' },
    { label: 'Guides', href: '/guides' },
    { label: 'Map', href: '/map' },
  ],
  game: [
    { label: 'Bosses', href: '/bosses' },
    { label: 'Classes', href: '/builds' },
    { label: 'Creators', href: '/creators' },
  ],
  community: [
    { label: 'Discord', href: '#' },
    { label: 'Reddit', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'YouTube', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Swords className="h-6 w-6 text-primary" />
              <span className="font-bold">
                <span className="text-primary">Hero Siege</span>
                <span className="text-accent"> Builds</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The ultimate resource for Hero Siege builds, tier lists, and guides.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Game */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Game</h3>
            <ul className="space-y-2">
              {footerLinks.game.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Hero Siege Builds. Not affiliated with Panic Art
              Studios.
            </p>
            <p className="text-xs text-muted-foreground">
              Hero Siege is a trademark of Panic Art Studios. All game content and materials are
              trademarks and copyrights of their respective owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { ExternalLink, Mail, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { useModelStore } from '@/store/modelStore'

/**
 * Editorial-journal masthead: serif logotype with a custom Σ mark, a kicker
 * line of small-caps metadata, and a hairline oxblood rule extending across.
 * Sticky with backdrop blur so it stays present as the user scrolls long
 * matrix grids and the diagram below.
 */
export function Header() {
  const reset = useModelStore((s) => s.reset)
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/70 bg-[var(--color-bg)]/82 backdrop-blur-xl">
      <div className="relative mx-auto max-w-7xl px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Custom Σ mark — drawn rather than icon-fonted, sits in an
             *  oxblood "stamp" with a hairline border. */}
            <a href="#" className="group block" aria-label="Home">
              <svg
                viewBox="0 0 40 40"
                className="h-10 w-10 transition-transform duration-300 group-hover:rotate-[-3deg]"
                aria-hidden="true"
              >
                <rect
                  x="0.75"
                  y="0.75"
                  width="38.5"
                  height="38.5"
                  rx="2.5"
                  fill="var(--color-accent)"
                />
                <text
                  x="50%"
                  y="56%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-serif)"
                  fontSize="24"
                  fontStyle="italic"
                  fontWeight="600"
                  fill="var(--color-accent-fg)"
                  style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 0' }}
                >
                  Σ
                </text>
              </svg>
            </a>
            <div className="flex flex-col leading-tight">
              <span className="kicker !text-[0.62rem] !tracking-[0.22em]">
                Customizer · v1
              </span>
              <h1
                className="font-serif text-[1.35rem] leading-none tracking-tight"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30, "WONK" 0' }}
              >
                PROCESS{' '}
                <span
                  className="italic text-[var(--color-accent)]"
                  style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                >
                  Matrix
                </span>{' '}
                Customizer
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              title="Reset to default (Figure B.3)"
              className="gap-1.5 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            {/* Feedback / issues — mailto opens user's mail client with subject
             *  pre-filled. On narrow viewports only the icon is shown. */}
            <a
              href="mailto:cahitgs@gmail.com?subject=PROCESS%20Customizer%20%E2%80%94%20issues%20%26%20feedback"
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-[var(--color-muted-fg)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-accent)]"
              title="Issues & suggestions — cahitgs@gmail.com"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden font-mono sm:inline">cahitgs@gmail.com</span>
            </a>
            <a
              href="https://www.processmacro.org/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-[var(--color-muted-fg)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-fg)]"
            >
              PROCESS docs
              <ExternalLink className="h-3 w-3" />
            </a>
            <div className="mx-1 h-5 w-px bg-[var(--color-border)]" />
            <ThemeToggle />
          </div>
        </div>
        {/* Hairline oxblood rule that extends edge-to-edge —
         *  signature of the editorial aesthetic. */}
        <div className="rule-accent absolute bottom-0 left-0 right-0" />
      </div>
    </header>
  )
}

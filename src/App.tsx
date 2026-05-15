import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '@/components/layout/Header'
import { VariablesPanel } from '@/components/variables/VariablesPanel'
import { MatricesPanel } from '@/components/matrices/MatricesPanel'
import { CodePanel } from '@/components/code/CodePanel'
import { PresetPicker } from '@/components/presets/PresetPicker'
import { DiagramPanel } from '@/components/diagram/DiagramPanel'
import { OptionsPanel } from '@/components/options/OptionsPanel'

function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative min-h-screen overflow-x-hidden text-[var(--color-fg)]">
        <div className="relative z-10">
          <Header />
          {/* Editorial hero — sets the tone before the working surfaces */}
          <section className="mx-auto max-w-7xl px-6 pb-2 pt-10">
            <p className="kicker mb-3">Vol. 2 · Appendix B · Hayes 2022</p>
            <h2
              className="max-w-[18ch] font-serif text-[2rem] leading-[1.05] tracking-[-0.02em] text-[var(--color-fg)] sm:max-w-[22ch] sm:text-[2.75rem] lg:max-w-[28ch] lg:text-[3.25rem]"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30, "WONK" 0' }}
            >
              Construct, customize, and{' '}
              <span
                className="italic text-[var(--color-accent)]"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
              >
                visualize
              </span>{' '}
              models for PROCESS.
            </h2>
            <p className="mt-4 max-w-[58ch] text-[0.95rem] leading-relaxed text-[var(--color-muted-fg)]">
              A typographic workbench for editing B / W / Z / WZ matrices, splicing
              numbered templates, attaching covariates, and exporting the exact PROCESS
              command — SPSS, SAS, or R — verified against Hayes (2022) Appendices A &amp; B.
            </p>
            <div className="rule-accent mt-8" />
          </section>

          <main className="mx-auto grid max-w-7xl gap-7 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
            {/* min-w-0 lets each grid column shrink below its intrinsic content
                size — without it, wide content (matrix table, code <pre>, the
                React Flow canvas) forces the column to overflow the viewport. */}
            <div className="flex min-w-0 flex-col gap-7">
              <div className="animate-rise"><PresetPicker /></div>
              <div className="animate-rise animate-rise-d1"><VariablesPanel /></div>
              <div className="animate-rise animate-rise-d2"><MatricesPanel /></div>
              <div className="animate-rise animate-rise-d3"><OptionsPanel /></div>
            </div>
            <div className="flex min-w-0 flex-col gap-7 lg:sticky lg:top-[88px] lg:self-start">
              <div className="animate-rise animate-rise-d1"><DiagramPanel /></div>
              <div className="animate-rise animate-rise-d2"><CodePanel /></div>
            </div>
          </main>
          <footer className="mx-auto max-w-7xl px-6 pb-10 pt-4">
            <div className="rule-accent mb-5" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-[60ch] text-[0.72rem] leading-relaxed text-[var(--color-muted-fg)]">
                Built against Hayes (2022){' '}
                <span className="display-italic">
                  Introduction to Mediation, Moderation, and Conditional Process Analysis
                </span>
                , 3rd ed., Appendices A &amp; B. The PROCESS macro is the work of Andrew F. Hayes.
              </p>
              <div className="flex flex-col gap-1 text-[0.72rem] text-[var(--color-muted-fg)] sm:items-end">
                <p className="kicker !text-[0.6rem]">Analysis &amp; Contact</p>
                <a
                  href="mailto:cahitgs@gmail.com"
                  className="font-mono text-[var(--color-fg)] underline decoration-[var(--color-accent-line)] decoration-1 underline-offset-4 transition-colors hover:text-[var(--color-accent)]"
                >
                  cahitgs@gmail.com
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!font-sans !text-sm',
        }}
      />
    </TooltipProvider>
  )
}

export default App

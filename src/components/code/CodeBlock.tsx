import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language: 'spss' | 'sas' | 'r'
  expectedEntries: number
}

const LANGUAGE_LABELS: Record<CodeBlockProps['language'], string> = {
  spss: 'SPSS — commas between matrix entries, period terminator.',
  sas: 'SAS — spaces between matrix entries, commas between option/value pairs.',
  r: 'R (PROCESS for R) — c() vectors, quoted variable names.',
}

export function CodeBlock({ code, language, expectedEntries }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <div>
      {/* Meta row above the code — the Copy button lives here so it can't
       *  overlap long syntax lines inside the <pre>. */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs text-[var(--color-muted-fg)]">
        <span className="min-w-0">{LANGUAGE_LABELS[language]}</span>
        <div className="flex shrink-0 items-center gap-3">
          <span className="tabular-nums">Expected entries per matrix: {expectedEntries}</span>
          <Button variant="ghost" size="sm" onClick={copy} className="h-7 gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
      <pre className="overflow-x-auto rounded-md bg-[var(--color-muted)] p-4 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

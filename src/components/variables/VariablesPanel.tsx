import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useModelStore } from '@/store/modelStore'

/** Split a comma-separated string into a clean list of variable names. */
function parseList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

export function VariablesPanel() {
  const variables = useModelStore((s) => s.variables)
  const setVariable = useModelStore((s) => s.setVariable)
  const setMediators = useModelStore((s) => s.setMediators)
  const setCovariates = useModelStore((s) => s.setCovariates)

  // The mediators / covariates inputs need a local raw-text state because the
  // store holds a parsed `string[]`. A purely derived `value={names.join(', ')}`
  // input would strip any trailing comma the user just typed (the empty token
  // gets filtered, then the input snaps back), making it impossible to add a
  // second variable from the keyboard. Reported by A. F. Hayes (May 2026).
  const [mediatorRaw, setMediatorRaw] = useState(() => variables.mediators.join(', '))
  const [covariateRaw, setCovariateRaw] = useState(() => variables.covariates.join(', '))

  // When the store changes from somewhere else (preset load, "Reset to default",
  // persisted-state rehydration), re-derive the raw text. We only overwrite
  // when the parsed form of the current raw text would no longer represent the
  // store — that way the user's in-progress comma/whitespace isn't snapped away
  // by their own keystrokes round-tripping through Zustand.
  useEffect(() => {
    if (!arraysEqual(parseList(mediatorRaw), variables.mediators)) {
      setMediatorRaw(variables.mediators.join(', '))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables.mediators])

  useEffect(() => {
    if (!arraysEqual(parseList(covariateRaw), variables.covariates)) {
      setCovariateRaw(variables.covariates.join(', '))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables.covariates])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variables</CardTitle>
        <CardDescription>
          X is the predictor, Y the outcome, M₁…Mₖ mediators. W and Z are optional moderators.
          Covariates enter consequent equations per the C matrix (Hayes 2022 pp. 630-632).
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="x-var"
            label="X (predictor)"
            value={variables.x}
            onChange={(v) => setVariable('x', v)}
          />
          <Field
            id="y-var"
            label="Y (outcome)"
            value={variables.y}
            onChange={(v) => setVariable('y', v)}
          />
        </div>
        <div>
          <Label htmlFor="mediators" className="mb-1.5 inline-block">
            Mediators ({variables.mediators.length}/6, comma-separated)
          </Label>
          <Input
            id="mediators"
            value={mediatorRaw}
            placeholder="wine, tent, sand"
            onChange={(e) => {
              const raw = e.target.value
              setMediatorRaw(raw)
              setMediators(parseList(raw))
            }}
            onBlur={() => setMediatorRaw(variables.mediators.join(', '))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="w-var"
            label="W (moderator)"
            value={variables.w}
            onChange={(v) => setVariable('w', v)}
          />
          <Field
            id="z-var"
            label="Z (moderator)"
            value={variables.z}
            onChange={(v) => setVariable('z', v)}
          />
        </div>
        <div>
          <Label htmlFor="covariates" className="mb-1.5 inline-block">
            Covariates ({variables.covariates.length}, comma-separated)
          </Label>
          <Input
            id="covariates"
            value={covariateRaw}
            placeholder="age, gender"
            onChange={(e) => {
              const raw = e.target.value
              setCovariateRaw(raw)
              setCovariates(parseList(raw))
            }}
            onBlur={() => setCovariateRaw(variables.covariates.join(', '))}
          />
          <p className="mt-1 text-xs text-[var(--color-muted-fg)]">
            When set, a C-matrix tab appears so you can pick which covariates enter which equation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
}

function Field({ id, label, value, onChange }: FieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 inline-block">
        {label}
      </Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

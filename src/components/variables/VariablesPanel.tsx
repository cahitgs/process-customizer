import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useModelStore } from '@/store/modelStore'

export function VariablesPanel() {
  const variables = useModelStore((s) => s.variables)
  const setVariable = useModelStore((s) => s.setVariable)
  const setMediators = useModelStore((s) => s.setMediators)
  const setCovariates = useModelStore((s) => s.setCovariates)

  const mediatorString = useMemo(() => variables.mediators.join(', '), [variables.mediators])
  const covariateString = useMemo(() => variables.covariates.join(', '), [variables.covariates])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variables</CardTitle>
        <CardDescription>
          X is the predictor, Y the outcome, M₁…Mₖ mediators. W and Z are optional moderators.
          Covariates enter consequent equations per the C matrix (Hayes 2018 pp. 630-632).
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
            value={mediatorString}
            onChange={(e) =>
              setMediators(
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
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
            value={covariateString}
            placeholder="e.g., age, gender"
            onChange={(e) =>
              setCovariates(
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
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

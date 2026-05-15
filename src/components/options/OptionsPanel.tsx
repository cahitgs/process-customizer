import { useShallow } from 'zustand/react/shallow'
import { RotateCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useModelStore } from '@/store/modelStore'
import type { ProcessOptions } from '@/types/model'

/**
 * PROCESS analysis options. Layout and option set verified verbatim against
 * Hayes (2018), Appendix A, pp. 553-554. Defaults match PROCESS itself; an
 * empty field means PROCESS uses its default and our codegen does not emit
 * the option.
 */
export function OptionsPanel() {
  const options = useModelStore(useShallow((s) => s.options))
  const setOption = useModelStore((s) => s.setOption)
  const resetOptions = useModelStore((s) => s.resetOptions)

  const setNumber = (key: keyof ProcessOptions, raw: string) => {
    const trimmed = raw.trim()
    if (trimmed === '') {
      setOption(key, null as never)
      return
    }
    const n = Number(trimmed)
    if (!Number.isFinite(n)) return
    setOption(key, n as never)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Analysis options</CardTitle>
            <CardDescription>
              PROCESS options per Hayes (2018) Appendix A. Leave blank to use PROCESS defaults.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetOptions}
            className="gap-1.5"
            title="Reset all options to PROCESS defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Defaults
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        {/* ── Inference ──────────────────────────────────────────────── */}
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
            Inference (bootstrap / Monte Carlo / Sobel)
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <NumField
              id="opt-boot"
              label="boot"
              hint="bootstrap samples (default 5000)"
              value={options.boot}
              onChange={(v) => setNumber('boot', v)}
              min={1000}
              step={1000}
            />
            <NumField
              id="opt-maxboot"
              label="maxboot"
              hint="max bootstrap attempts (default 10000)"
              value={options.maxboot}
              onChange={(v) => setNumber('maxboot', v)}
              min={1000}
              step={1000}
            />
            <NumField
              id="opt-mc"
              label="mc"
              hint="Monte Carlo CIs (models 4, 5 only)"
              value={options.mc}
              onChange={(v) => setNumber('mc', v)}
              min={1000}
              step={1000}
            />
            <NumField
              id="opt-conf"
              label="conf"
              hint="confidence % (default 95)"
              value={options.conf}
              onChange={(v) => setNumber('conf', v)}
              min={50}
              max={99}
            />
            <NumField
              id="opt-seed"
              label="seed"
              hint="random seed (reproducibility)"
              value={options.seed}
              onChange={(v) => setNumber('seed', v)}
            />
            <div>
              <Label htmlFor="opt-hc" className="mb-1.5 inline-block text-sm font-mono">
                hc
              </Label>
              <Select
                id="opt-hc"
                value={options.hc === null ? '' : String(options.hc)}
                onChange={(e) => {
                  const v = e.target.value
                  setOption('hc', v === '' ? null : (Number(v) as 0 | 1 | 2 | 3 | 4))
                }}
              >
                <option value="">default (OLS SE)</option>
                <option value="0">HC0</option>
                <option value="1">HC1</option>
                <option value="2">HC2</option>
                <option value="3">HC3 (recommended)</option>
                <option value="4">HC4</option>
              </Select>
              <p className="mt-1 text-[0.65rem] text-[var(--color-muted-fg)]">
                heteroscedasticity-consistent SE
              </p>
            </div>
          </div>
          <ToggleField
            id="opt-normal"
            label="normal"
            hint="Sobel test (models 4, 5 only)"
            value={options.normal}
            onChange={(v) => setOption('normal', v)}
          />
        </fieldset>

        {/* ── Probing ───────────────────────────────────────────────── */}
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
            Probing interactions
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <NumField
              id="opt-intprobe"
              label="intprobe"
              hint="probing α (default 0.10; 1 = always probe)"
              value={options.intprobe}
              onChange={(v) => setNumber('intprobe', v)}
              min={0}
              max={1}
              step={0.01}
            />
            <ToggleField
              id="opt-jn"
              label="jn"
              hint="Johnson-Neyman technique"
              value={options.jn}
              onChange={(v) => setOption('jn', v)}
            />
            <ToggleField
              id="opt-moments"
              label="moments"
              hint="probe at mean ± 1 SD"
              value={options.moments}
              onChange={(v) => setOption('moments', v)}
            />
          </div>
        </fieldset>

        {/* ── Centering & covariate placement ───────────────────────── */}
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
            Centering & covariates
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="opt-center" className="mb-1.5 inline-block text-sm font-mono">
                center
              </Label>
              <Select
                id="opt-center"
                value={options.center === null ? '' : String(options.center)}
                onChange={(e) => {
                  const v = e.target.value
                  setOption('center', v === '' ? null : (Number(v) as 0 | 1))
                }}
              >
                <option value="">default (off)</option>
                <option value="0">0 — off</option>
                <option value="1">1 — mean-center product terms</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="opt-covmy" className="mb-1.5 inline-block text-sm font-mono">
                covmy
              </Label>
              <Select
                id="opt-covmy"
                value={options.covmy === null ? '' : String(options.covmy)}
                onChange={(e) => {
                  const v = e.target.value
                  setOption('covmy', v === '' ? null : (Number(v) as 0 | 1 | 2))
                }}
              >
                <option value="">default (all equations)</option>
                <option value="0">0 — all equations</option>
                <option value="1">1 — mediators only</option>
                <option value="2">2 — Y only</option>
              </Select>
              <p className="mt-1 text-[0.65rem] text-[var(--color-muted-fg)]">
                covariate placement (use cmatrix tab for finer control)
              </p>
            </div>
          </div>
        </fieldset>

        {/* ── Output ────────────────────────────────────────────────── */}
        <fieldset className="grid gap-3">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-fg)]">
            Output
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="opt-plot" className="mb-1.5 inline-block text-sm font-mono">
                plot
              </Label>
              <Select
                id="opt-plot"
                value={options.plot === null ? '' : String(options.plot)}
                onChange={(e) => {
                  const v = e.target.value
                  setOption('plot', v === '' ? null : (Number(v) as 0 | 1 | 2))
                }}
              >
                <option value="">default (off)</option>
                <option value="1">1 — plot data table</option>
                <option value="2">2 — with SE / CI</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="opt-decimals" className="mb-1.5 inline-block text-sm font-mono">
                decimals
              </Label>
              <Input
                id="opt-decimals"
                value={options.decimals ?? ''}
                placeholder="F10.4"
                onChange={(e) => {
                  const v = e.target.value.trim()
                  setOption('decimals', v === '' ? null : v)
                }}
              />
              <p className="mt-1 text-[0.65rem] text-[var(--color-muted-fg)]">
                SPSS format Fa.b (SAS drops the F)
              </p>
            </div>
            <div>
              <Label htmlFor="opt-save" className="mb-1.5 inline-block text-sm font-mono">
                save
              </Label>
              <Select
                id="opt-save"
                value={options.save === null ? '' : String(options.save)}
                onChange={(e) => {
                  const v = e.target.value
                  setOption('save', v === '' ? null : (Number(v) as 0 | 1 | 2))
                }}
              >
                <option value="">default (off)</option>
                <option value="1">1 — save bootstrap estimates</option>
                <option value="2">2 — save coefficient detail</option>
              </Select>
            </div>
            <ToggleField
              id="opt-effsize"
              label="effsize"
              hint="standardized + effect-size measures"
              value={options.effsize}
              onChange={(v) => setOption('effsize', v)}
            />
            <ToggleField
              id="opt-total"
              label="total"
              hint="total effect of X on Y"
              value={options.total}
              onChange={(v) => setOption('total', v)}
            />
            <ToggleField
              id="opt-modelbt"
              label="modelbt"
              hint="bootstrap CIs for regression coefficients"
              value={options.modelbt}
              onChange={(v) => setOption('modelbt', v)}
            />
            <ToggleField
              id="opt-covcoeff"
              label="covcoeff"
              hint="variance-covariance matrix of coefficients"
              value={options.covcoeff}
              onChange={(v) => setOption('covcoeff', v)}
            />
          </div>
        </fieldset>
      </CardContent>
    </Card>
  )
}

interface ToggleFieldProps {
  id: string
  label: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
}

function ToggleField({ id, label, hint, value, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border p-2.5">
      <div className="flex flex-col">
        <Label htmlFor={id} className="cursor-pointer text-sm font-mono">
          {label}
        </Label>
        {hint && <span className="text-[0.65rem] text-[var(--color-muted-fg)]">{hint}</span>}
      </div>
      <Switch id={id} checked={value} onCheckedChange={onChange} />
    </div>
  )
}

interface NumFieldProps {
  id: string
  label: string
  hint?: string
  value: number | null
  onChange: (raw: string) => void
  min?: number
  max?: number
  step?: number
}

function NumField({ id, label, hint, value, onChange, min, max, step }: NumFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 inline-block text-sm font-mono">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder="default"
      />
      {hint && (
        <p className="mt-1 text-[0.65rem] text-[var(--color-muted-fg)]">{hint}</p>
      )}
    </div>
  )
}

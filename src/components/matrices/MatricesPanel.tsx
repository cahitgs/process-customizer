import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MatrixGrid } from './MatrixGrid'
import { CMatrixGrid } from './CMatrixGrid'
import { ValidationBadge, IssueList } from './ValidationBadge'
import { useModelStore } from '@/store/modelStore'
import { validate } from '@/lib/validation'
import { entryCount } from '@/lib/matrix'
import type { MatrixKind } from '@/types/model'

const MATRIX_DESCRIPTIONS: Record<MatrixKind, string> = {
  b: 'B: which paths are estimated (1) vs fixed to zero (0). Lower triangle only — the upper triangle is structurally zero (recursive-model constraint).',
  w: 'W: which paths from B are linearly moderated by the W moderator. Cells fixed to zero in B are disabled.',
  z: 'Z: which paths are moderated by Z. Per Hayes (2022) p. 624, Z requires W.',
  wz: 'WZ: three-way (moderated moderation) — Z moderates the moderation by W. PROCESS forces W and Z to 1 wherever WZ is 1.',
}

export function MatricesPanel() {
  const model = useModelStore(
    useShallow((s) => ({
      variables: s.variables,
      matrices: s.matrices,
      cMatrix: s.cMatrix,
      modelNumber: s.modelNumber,
      showMatrices: s.showMatrices,
      options: s.options,
    })),
  )
  const validation = useMemo(() => validate(model), [model])
  const k = model.variables.mediators.length
  const expected = entryCount(k)
  const hasCov = model.variables.covariates.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Matrices</CardTitle>
            <CardDescription>
              Click a cell to toggle. With k = {k} mediators each string has {expected} entries
              (0.5 · (k+1) · (k+2)).
            </CardDescription>
          </div>
          <ValidationBadge issues={validation.issues} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="b">
          <TabsList>
            <TabsTrigger value="b">B</TabsTrigger>
            <TabsTrigger value="w">W</TabsTrigger>
            <TabsTrigger value="z">Z</TabsTrigger>
            <TabsTrigger value="wz">WZ</TabsTrigger>
            {hasCov && <TabsTrigger value="c">C</TabsTrigger>}
          </TabsList>
          {(['b', 'w', 'z', 'wz'] as const).map((m) => (
            <TabsContent key={m} value={m}>
              <p className="mb-3 text-xs text-[var(--color-muted-fg)]">{MATRIX_DESCRIPTIONS[m]}</p>
              <MatrixGrid matrix={m} issues={validation.issues} />
            </TabsContent>
          ))}
          {hasCov && (
            <TabsContent value="c">
              <p className="mb-3 text-xs text-[var(--color-muted-fg)]">
                C: which covariate enters which consequent's equation. Hayes (2022 pp. 630-632).
                Trick on p. 631: copy a moderator (e.g., milkcopy = milk) and zero its row for the
                consequent that already includes it as a moderator.
              </p>
              <CMatrixGrid />
            </TabsContent>
          )}
        </Tabs>
        {validation.issues.length > 0 && (
          <div className="mt-4 rounded-md border bg-[var(--color-muted)] p-3">
            <h4 className="mb-2 text-xs font-semibold text-[var(--color-fg)]">Issues</h4>
            <IssueList issues={validation.issues} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

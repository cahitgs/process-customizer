import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { CodeBlock } from './CodeBlock'
import { useModelStore } from '@/store/modelStore'
import { generateAll } from '@/lib/codegen'
import { entryCount } from '@/lib/matrix'

export function CodePanel() {
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
  const setShowMatrices = useModelStore((s) => s.setShowMatrices)
  const clearModelNumber = useModelStore((s) => s.clearModelNumber)

  const code = useMemo(() => generateAll(model), [model])
  const expected = entryCount(model.variables.mediators.length)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Generated PROCESS code</CardTitle>
            <CardDescription>
              Paste into SPSS, SAS, or R after the PROCESS macro is loaded.
            </CardDescription>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Switch
              id="show-matrices"
              checked={model.showMatrices}
              onCheckedChange={setShowMatrices}
            />
            <Label htmlFor="show-matrices" className="cursor-pointer">
              Add <code className="font-mono">/matrices=1</code> for matrix print-out (Hayes p. 626)
            </Label>
          </div>
          {model.modelNumber !== null && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-muted)] px-2 py-0.5 font-medium text-[var(--color-fg)]">
                Emitting as model={model.modelNumber}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearModelNumber}
                className="h-6 gap-1 px-1.5 text-xs"
                title="Emit /bmatrix=… instead"
              >
                <X className="h-3 w-3" />
                use bmatrix
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spss">
          <TabsList>
            <TabsTrigger value="spss">SPSS</TabsTrigger>
            <TabsTrigger value="sas">SAS</TabsTrigger>
            <TabsTrigger value="r">R</TabsTrigger>
          </TabsList>
          <TabsContent value="spss">
            <CodeBlock code={code.spss} language="spss" expectedEntries={expected} />
          </TabsContent>
          <TabsContent value="sas">
            <CodeBlock code={code.sas} language="sas" expectedEntries={expected} />
          </TabsContent>
          <TabsContent value="r">
            <CodeBlock code={code.r} language="r" expectedEntries={expected} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { useModelStore } from '@/store/modelStore'
import { PRESETS } from '@/lib/presets'

export function PresetPicker() {
  const loadPreset = useModelStore((s) => s.loadPreset)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preset models</CardTitle>
        <CardDescription>
          Load a canonical example from Hayes (2018), Appendix B.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          defaultValue=""
          onChange={(e) => {
            const id = e.target.value
            if (id) loadPreset(id)
          }}
          aria-label="Preset model"
        >
          <option value="">Choose a preset…</option>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      </CardContent>
    </Card>
  )
}

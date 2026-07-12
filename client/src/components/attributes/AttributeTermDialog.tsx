import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AttributeTermColorField } from '@/components/attributes/AttributeTermColorField'
import { AttributeTermImageField } from '@/components/attributes/AttributeTermImageField'
import type { AttributeTermFormState, AttributeType } from '@/types/attributes'

type AttributeTermDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attributeType: AttributeType
  form: AttributeTermFormState
  onChange: (patch: Partial<AttributeTermFormState>) => void
  onSave: () => void
  saving?: boolean
  isEdit?: boolean
}

export function AttributeTermDialog({
  open,
  onOpenChange,
  attributeType,
  form,
  onChange,
  onSave,
  saving,
  isEdit,
}: AttributeTermDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('attributes.terms.editTitle') : t('attributes.terms.addTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('attributes.terms.name')}</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                onChange(form.slug ? { name } : { name, slug: name.trim().toLowerCase().replace(/\s+/g, '-') })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('attributes.terms.slug')}</Label>
            <Input value={form.slug} onChange={(e) => onChange({ slug: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t('attributes.terms.description')}</Label>
            <Input value={form.description} onChange={(e) => onChange({ description: e.target.value })} />
          </div>
          {attributeType === 'color' ? (
            <AttributeTermColorField value={form.color} onChange={(color) => onChange({ color })} />
          ) : null}
          {attributeType === 'image' ? (
            <AttributeTermImageField
              imageId={form.image_id}
              imageUrl={form.image_url}
              onChange={(item) => onChange({ image_id: item.id, image_url: item.url })}
              onRemove={() => onChange({ image_id: 0, image_url: '' })}
            />
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" disabled={saving || !form.name.trim()} onClick={onSave}>
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

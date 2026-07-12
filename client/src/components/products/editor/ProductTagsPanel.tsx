import { useMemo, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type TagItem = { id: number; name: string }

type ProductTagsPanelProps = {
  allTags: TagItem[]
  tagIds: number[]
  onChange: (ids: number[]) => void
}

export function ProductTagsPanel({ allTags, tagIds, onChange }: ProductTagsPanelProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  const selectedTags = useMemo(
    () => tagIds.map((id) => allTags.find((t) => t.id === id)).filter((t): t is TagItem => Boolean(t)),
    [tagIds, allTags],
  )

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase()
    if (!q) return []
    return allTags
      .filter((t) => t.name.toLowerCase().includes(q) && !tagIds.includes(t.id))
      .slice(0, 6)
  }, [input, allTags, tagIds])

  function addTagId(tid: number) {
    if (tagIds.includes(tid)) return
    onChange([...tagIds, tid])
    setInput('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && suggestions[0]) {
      e.preventDefault()
      addTagId(suggestions[0].id)
    }
    if (e.key === 'Backspace' && !input && tagIds.length > 0) {
      onChange(tagIds.slice(0, -1))
    }
  }

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('products.editor.tagsPanel')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <div className="rounded-md border border-border p-2">
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
              >
                {tag.name}
                <button
                  type="button"
                  className="rounded-sm opacity-70 hover:opacity-100"
                  onClick={() => onChange(tagIds.filter((x) => x !== tag.id))}
                  aria-label={t('common.delete')}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('products.editor.tagsPlaceholder')}
              className="h-7 min-w-[8rem] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
        {suggestions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {suggestions.map((tag) => (
              <Button
                key={tag.id}
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => addTagId(tag.id)}
              >
                {tag.name}
              </Button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type TagRow = { id: number; name: string }

type PostTagsPanelProps = {
  tags: string[]
  onChange: (tags: string[]) => void
}

function normalizeTag(raw: string) {
  return raw.trim().replace(/^,+|,+$/g, '')
}

export function PostTagsPanel({ tags, onChange }: PostTagsPanelProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  const tagsQ = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiFetch<{ items: TagRow[] }>('content/tags'),
  })

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase()
    if (!q) return []
    const existing = new Set(tags.map((tag) => tag.toLowerCase()))
    return (tagsQ.data?.items ?? [])
      .map((row) => row.name)
      .filter((name) => name.toLowerCase().includes(q) && !existing.has(name.toLowerCase()))
      .slice(0, 6)
  }, [input, tags, tagsQ.data?.items])

  function addTag(raw: string) {
    const name = normalizeTag(raw)
    if (!name) return
    const exists = tags.some((tag) => tag.toLowerCase() === name.toLowerCase())
    if (exists) {
      setInput('')
      return
    }
    onChange([...tags, name])
    setInput('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <Card className="gap-4 py-4 shadow-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-semibold">{t('posts.panelTags')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <div className="rounded-md border border-border p-2">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
              >
                {tag}
                <button
                  type="button"
                  className="rounded-sm opacity-70 hover:opacity-100"
                  onClick={() => onChange(tags.filter((x) => x !== tag))}
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
              placeholder={t('posts.tagsPlaceholder')}
              className="h-7 min-w-[8rem] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
        {suggestions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {suggestions.map((name) => (
              <Button key={name} type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => addTag(name)}>
                {name}
              </Button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

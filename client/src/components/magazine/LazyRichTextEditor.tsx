import { lazy, Suspense, type ComponentProps } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

const RichTextEditorImpl = lazy(() =>
  import('@/components/magazine/RichTextEditor').then((m) => ({
    default: m.RichTextEditor,
  })),
)

function EditorFallback() {
  return <Skeleton className="min-h-[220px] w-full rounded-md" />
}

export function RichTextEditor(props: ComponentProps<typeof RichTextEditorImpl>) {
  return (
    <Suspense fallback={<EditorFallback />}>
      <RichTextEditorImpl {...props} />
    </Suspense>
  )
}

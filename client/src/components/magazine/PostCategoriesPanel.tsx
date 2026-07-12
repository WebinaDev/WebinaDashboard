import { CategoryManager } from '@/components/magazine/CategoryManager'

type PostCategoriesPanelProps = {
  selected: number[]
  onChange: (ids: number[]) => void
}

export function PostCategoriesPanel({ selected, onChange }: PostCategoriesPanelProps) {
  return (
    <CategoryManager selectable compact selected={selected} onSelectionChange={onChange} />
  )
}

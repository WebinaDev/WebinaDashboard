import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Code,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { isSafeContentUrl } from '@/lib/safeUrl'
import { sanitizeEditorHtml } from '@/lib/sanitizeEditorHtml'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
  placeholder?: string
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
  title: string
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon-sm"
      className="size-8"
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function RichTextEditor({ value, onChange, disabled, placeholder }: RichTextEditorProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'visual' | 'code'>('visual')
  const [codeValue, setCodeValue] = useState(value)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      onChange(html)
      setCodeValue(html)
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [disabled, editor])

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false })
      setCodeValue(value)
    }
  }, [value, editor])

  function switchTab(next: string) {
    if (next === 'code' && editor) {
      setCodeValue(editor.getHTML())
    }
    if (next === 'visual' && editor) {
      const safe = sanitizeEditorHtml(codeValue)
      editor.commands.setContent(safe, { emitUpdate: false })
      onChange(safe)
      setCodeValue(safe)
    }
    setTab(next as 'visual' | 'code')
  }

  function applyCodeChange(html: string) {
    const safe = sanitizeEditorHtml(html)
    setCodeValue(safe)
    onChange(safe)
    if (editor) {
      editor.commands.setContent(safe, { emitUpdate: false })
    }
  }

  function setLink() {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt(t('posts.linkPrompt'), prev ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    if (!isSafeContentUrl(url)) {
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  function addImage() {
    if (!editor) return
    const url = window.prompt(t('posts.imageUrlPrompt'))
    if (!url || !isSafeContentUrl(url)) return
    editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <Tabs value={tab} onValueChange={switchTab} className="gap-0">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border border-b-0 border-border bg-muted/40 px-2 py-1.5">
        <TabsList className="h-8 bg-transparent p-0">
          <TabsTrigger value="visual" className="h-7 px-3 text-xs">
            {t('posts.editorVisual')}
          </TabsTrigger>
          <TabsTrigger value="code" className="h-7 px-3 text-xs">
            {t('posts.editorCode')}
          </TabsTrigger>
        </TabsList>
        {tab === 'visual' && editor ? (
          <div className="flex flex-wrap items-center gap-0.5">
            <ToolbarButton
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title={t('posts.toolBold')}
            >
              <Bold className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title={t('posts.toolItalic')}
            >
              <Italic className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title={t('posts.toolStrike')}
            >
              <Strikethrough className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title={t('posts.toolHeading')}
            >
              <Heading2 className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title={t('posts.toolBulletList')}
            >
              <List className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title={t('posts.toolOrderedList')}
            >
              <ListOrdered className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title={t('posts.toolQuote')}
            >
              <Quote className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive('codeBlock')}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title={t('posts.toolCodeBlock')}
            >
              <Code className="size-4" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('link')} onClick={setLink} title={t('posts.toolLink')}>
              <Link2 className="size-4" />
            </ToolbarButton>
            <ToolbarButton active={false} onClick={addImage} title={t('posts.toolImage')}>
              <ImageIcon className="size-4" />
            </ToolbarButton>
          </div>
        ) : null}
      </div>
      <TabsContent value="visual" className="mt-0">
        <EditorContent
          editor={editor}
          className={cn(
            'min-h-72 rounded-b-xl border border-border bg-background px-4 py-3 text-sm',
            '[&_.tiptap]:min-h-64 [&_.tiptap]:outline-none',
            '[&_.tiptap_p.is-editor-empty:first-child]:before:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child]:before:float-start [&_.tiptap_p.is-editor-empty:first-child]:before:h-0 [&_.tiptap_p.is-editor-empty:first-child]:before:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
            '[&_.tiptap_h2]:mb-2 [&_.tiptap_h2]:text-lg [&_.tiptap_h2]:font-semibold',
            '[&_.tiptap_ul]:my-2 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:ps-6',
            '[&_.tiptap_ol]:my-2 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:ps-6',
            '[&_.tiptap_blockquote]:my-2 [&_.tiptap_blockquote]:border-s-4 [&_.tiptap_blockquote]:border-border [&_.tiptap_blockquote]:ps-4 [&_.tiptap_blockquote]:text-muted-foreground',
            '[&_.tiptap_pre]:my-2 [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:rounded-md [&_.tiptap_pre]:bg-muted [&_.tiptap_pre]:p-3',
            '[&_.tiptap_img]:my-2 [&_.tiptap_img]:max-h-80 [&_.tiptap_img]:rounded-md',
            disabled && 'pointer-events-none opacity-60',
          )}
        />
      </TabsContent>
      <TabsContent value="code" className="mt-0">
        <Textarea
          value={codeValue}
          onChange={(e) => applyCodeChange(e.target.value)}
          disabled={disabled}
          className="min-h-72 rounded-t-none rounded-b-xl border border-border font-mono text-xs leading-relaxed"
          spellCheck={false}
        />
      </TabsContent>
    </Tabs>
  )
}

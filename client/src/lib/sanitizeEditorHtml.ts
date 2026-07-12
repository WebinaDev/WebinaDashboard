import createDOMPurify from 'dompurify'

const EDITOR_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  's',
  'strike',
  'h2',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
]

const EDITOR_ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel']

let purify: ReturnType<typeof createDOMPurify> | null = null

function getPurify() {
  if (!purify) {
    purify = createDOMPurify(window)
  }
  return purify
}

export function sanitizeEditorHtml(html: string): string {
  return getPurify().sanitize(html, {
    ALLOWED_TAGS: EDITOR_ALLOWED_TAGS,
    ALLOWED_ATTR: EDITOR_ALLOWED_ATTR,
  })
}

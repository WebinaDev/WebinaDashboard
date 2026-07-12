#!/usr/bin/env bash
# Static Definition-of-Done checks for core dashboard pages (no browser).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT="$ROOT/client/src"
ROUTES="$CLIENT/routes/routes.config.tsx"
FAIL=0

echo "== Page DoD static smoke =="

if grep -rq 'ModulePlaceholder' "$CLIENT/pages"; then
  echo "FAIL: ModulePlaceholder used in pages"
  FAIL=1
else
  echo "OK: no ModulePlaceholder in pages"
fi

if grep -riq 'coming soon\|به زودی' "$CLIENT/pages"; then
  echo "FAIL: placeholder copy in pages"
  FAIL=1
else
  echo "OK: no coming-soon placeholder copy"
fi

# Every lazy page import in routes.config should exist on disk.
while IFS= read -r imp; do
  [[ -z "$imp" ]] && continue
  rel="${imp#@/}"
  file="$CLIENT/${rel}.tsx"
  if [[ ! -f "$file" ]]; then
    echo "FAIL: route imports missing file $file"
    FAIL=1
  fi
done < <(grep -oE "import\('@/pages/[^']+'\)" "$ROUTES" | sed "s/import('\\@\\///;s/')$//")

echo "OK: all route page files exist"

# List pages should have loading or skeleton patterns.
LIST_PAGES=(
  magazine/PostsListPage
  cms/PagesListPage
  shop/ProductsListPage
  shop/BrandsPage
  shop/ProductCategoriesPage
  shop/AttributesPage
  orders/OrdersListPage
  users/UsersListPage
  users/CommentsPage
  marketing/CouponsListPage
  marketplace/MarketplacePage
)

for page in "${LIST_PAGES[@]}"; do
  f="$CLIENT/pages/${page}.tsx"
  if grep -qE 'Skeleton|isLoading|isPending|QueryErrorState' "$f"; then
    echo "OK: $page loading/error UX"
  else
    echo "FAIL: $page missing loading/error pattern"
    FAIL=1
  fi
done

# Editor pages should guard load errors.
EDITOR_PAGES=(
  magazine/PostEditorPage
  cms/PageEditorPage
  shop/ProductEditorPage
  orders/OrderDetailPage
  users/UserDetailPage
)

for page in "${EDITOR_PAGES[@]}"; do
  f="$CLIENT/pages/${page}.tsx"
  if grep -qE 'QueryErrorState|useQueryErrorToast|isError' "$f"; then
    echo "OK: $page error handling"
  else
    echo "FAIL: $page missing error handling"
    FAIL=1
  fi
done

if [[ "$FAIL" -ne 0 ]]; then
  echo "== smoke-page-dod FAILED =="
  exit 1
fi

echo "== smoke-page-dod PASSED =="

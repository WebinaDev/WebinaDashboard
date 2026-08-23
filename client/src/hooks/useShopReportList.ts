import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { buildShopReportQuery, useOrderReportsFilters } from '@/hooks/useOrderReports'
import { apiFetch } from '@/lib/api'
import type { OrderReportFilters, ReportListResponse } from '@/types/orderReports'

export function useReportListState() {
  const filterState = useOrderReportsFilters()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [orderby, setOrderby] = useState('revenue')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const perPage = 25

  function onSortChange(next: string) {
    if (orderby === next) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrderby(next)
      setOrder('desc')
    }
  }

  function onSearchChange(v: string) {
    setSearch(v)
    setPage(1)
  }

  return {
    filterState,
    search,
    onSearchChange,
    page,
    setPage,
    orderby,
    order,
    onSortChange,
    perPage,
  }
}

export function useReportListQuery<T>(
  section: string,
  filters: OrderReportFilters,
  opts: { search: string; page: number; perPage: number; orderby: string; order: 'asc' | 'desc' },
) {
  return useQuery({
    queryKey: ['shop-reports', section, filters, opts],
    queryFn: () =>
      apiFetch<ReportListResponse<T>>(
        buildShopReportQuery(`shop/reports/${section}`, filters, {
          search: opts.search || undefined,
          page: opts.page,
          per_page: opts.perPage,
          orderby: opts.orderby,
          order: opts.order,
        }),
      ),
    retry: false,
  })
}

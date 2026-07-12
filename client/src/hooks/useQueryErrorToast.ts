import type { UseQueryResult } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { apiErrorMessage } from '@/lib/apiError'

/** Shows one toast per failed fetch (avoids duplicate toasts on strict mode / re-renders). */
export function useQueryErrorToast(q: Pick<UseQueryResult<unknown, Error>, 'isError' | 'error' | 'fetchStatus'>) {
  const { t } = useTranslation()
  const shown = useRef(false)
  useEffect(() => {
    if (q.isError && q.error) {
      if (!shown.current) {
        shown.current = true
        toast.error(apiErrorMessage(t, q.error))
      }
    } else {
      shown.current = false
    }
  }, [q.isError, q.error, q.fetchStatus, t])
}

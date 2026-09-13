import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        gcTime: 10 * 60_000,
      },
      mutations: { retry: 0 },
    },
  })
}

import { QueryClient } from '@tanstack/react-query'

let queryClientRef: QueryClient | null = null

export function getQueryClient(): QueryClient | null {
  return queryClientRef
}

export function createQueryClient() {
  const client = new QueryClient({
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
  queryClientRef = client
  return client
}

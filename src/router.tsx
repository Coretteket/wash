import { createRouter } from '@tanstack/solid-router'
import { experimental_createQueryPersister as createQueryPersister } from '@tanstack/query-persist-client-core'
import { get, set, del, entries, clear, createStore } from 'idb-keyval'
import type {
  AsyncStorage,
  PersistedQuery,
} from '@tanstack/query-persist-client-core'

import { routeTree } from './routes.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'

export type RouterContext = {
  queryClient: QueryClient
}

const idbStore =
  typeof indexedDB !== 'undefined'
    ? createStore('wash-db', 'query-cache')
    : undefined

export function clearPersistedCache() {
  if (idbStore) return clear(idbStore)
}

function createPersister() {
  if (!idbStore) return undefined

  const store = idbStore
  const storage = {
    getItem: (key) => get(key, store),
    setItem: (key, value) => set(key, value, store),
    removeItem: (key) => del(key, store),
    entries: () => entries(store),
  } satisfies AsyncStorage<PersistedQuery>

  return createQueryPersister<PersistedQuery>({
    storage,
    maxAge: Infinity,
  }).persisterFn
}

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { persister: createPersister() },
    },
  })

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    Wrap: (props) => (
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    ),
  })

  return router
}

declare module '@tanstack/solid-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

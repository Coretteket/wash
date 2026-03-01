import { queryOptions } from '@tanstack/solid-query'
import { createServerFn } from '@tanstack/solid-start'
import { withPage } from '~/lib/browser'
import { parseData, login, parseQR } from '~/lib/duwo'
import { authMiddleware } from '~/lib/auth'

export const getData = createServerFn()
  .middleware([authMiddleware])
  .handler(() =>
    withPage(async (page) => {
      const frame = await login(page)
      return parseData(frame)
    }),
  )

export const getQR = createServerFn()
  .middleware([authMiddleware])
  .handler(() =>
    withPage(async (page) => {
      const frame = await login(page)
      return parseQR(frame)
    }),
  )

export const dataQuery = queryOptions({
  queryKey: ['machines'],
  queryFn: () => getData(),
  staleTime: 2 * 60 * 1000,
  refetchInterval: 6 * 60 * 1000,
})

export const qrQuery = queryOptions({
  queryKey: ['qr'],
  queryFn: () => getQR(),
  staleTime: Infinity,
  gcTime: Infinity,
})

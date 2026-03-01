import { useMutation, useQuery, useQueryClient } from '@tanstack/solid-query'
import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js'
import { MachineCount, BookingRow, SectionHeader, QueryGuard } from '~/lib/ui'
import { verifyAuth, logoutAuth } from '~/lib/auth'
import { createNow } from '~/lib/state'
import { dataQuery, qrQuery } from '~/lib/data'
import { clearPersistedCache } from '~/router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    await verifyAuth()
  },
  component: () => {
    const now = createNow()

    const data = useQuery(() => dataQuery)
    const qr = useQuery(() => qrQuery)

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [confirmLogout, setConfirmLogout] = createSignal(false)

    createEffect(() => {
      if (confirmLogout()) {
        const timeout = setTimeout(() => setConfirmLogout(false), 5000)
        onCleanup(() => clearTimeout(timeout))
      }
    })

    const logout = useMutation(() => ({
      mutationFn: () => logoutAuth(),
      onSuccess: async () => {
        queryClient.clear()
        await clearPersistedCache()
        navigate({ to: '/login' })
      },
    }))

    return (
      <div class="min-h-screen p-6">
        <main class="max-w-sm mx-auto">
          <h1 class="text-lg font-bold tracking-widest text-white mb-4">DUWash</h1>

          <section class="border border-neutral-700 mb-4">
            <SectionHeader
              label="QR Code"
              timestamp={qr.dataUpdatedAt}
              now={now()}
              isPending={qr.isPending}
              isRefetching={qr.isRefetching}
              onRefresh={() => void qr.refetch()}
            />
            <QueryGuard isPending={qr.isPending} isError={qr.isError}>
              <div class="bg-white p-3 m-4">
                <img src={qr.data} class="w-full [image-rendering:pixelated]" />
              </div>
            </QueryGuard>
          </section>

          <section class="border border-neutral-700 mb-4">
            <SectionHeader
              label="Machines"
              timestamp={data.dataUpdatedAt}
              now={now()}
              isPending={data.isPending}
              isRefetching={data.isRefetching}
              onRefresh={() => void data.refetch()}
            />
            <QueryGuard isPending={data.isPending} isError={data.isError}>
              <div class="divide-y">
                <MachineCount
                  noun="Washer"
                  available={data.data?.machines.washers ?? '?'}
                />
                <MachineCount
                  noun="Dryer"
                  available={data.data?.machines.dryers ?? '?'}
                />
              </div>
            </QueryGuard>
          </section>

          <section class="border border-neutral-700 mb-4">
            <SectionHeader label="Bookings" />
            <QueryGuard isPending={data.isPending} isError={data.isError}>
              <div class="divide-y">
                <For each={data.data?.bookings ?? []}>
                  {(b) => <BookingRow booking={b} />}
                </For>
                <Show when={(data.data?.bookings.length ?? 0) === 0}>
                  <p class="p-4 text-sm text-neutral-400">No bookings</p>
                </Show>
              </div>
            </QueryGuard>
          </section>

          <section class="border border-neutral-700 mb-4">
            <SectionHeader label="Balance" />
            <QueryGuard isPending={data.isPending} isError={data.isError}>
              <div class="flex items-baseline gap-3.5 p-4">
                <p class="text-3xl font-bold leading-none text-white">
                  €{data.data?.balance.toFixed(2).split('.')[0]}
                  <span class="ml-0.5 text-sm uppercase font-normal tracking-widest text-neutral-300">
                    .{data.data?.balance.toFixed(2).split('.')[1]}
                  </span>
                </p>
              </div>
            </QueryGuard>
          </section>

          <a
            href="https://duwo.multiposs.nl"
            class="border p-4 uppercase w-full block text-center text-sm mb-4"
            rel="noreferer noopener"
            target="_blank"
          >
            Go to real site
          </a>

          <button
            class="border p-4 uppercase w-full block text-center text-sm mt-2 text-neutral-400 transition-colors cursor-pointer"
            disabled={logout.isPending}
            onClick={() => {
              if (confirmLogout()) logout.mutate()
              else setConfirmLogout(true)
            }}
          >
            {confirmLogout() ? 'You sure?' : 'Logout'}
          </button>
        </main>
      </div>
    )
  },
})

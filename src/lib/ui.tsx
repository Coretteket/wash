import { Show, type JSX } from 'solid-js'
import type { Booking } from '~/lib/types'

const rtf = new Intl.RelativeTimeFormat('en', { style: 'narrow' })

export function relativeTime(ms: number, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - ms) / 1000))
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  return rtf.format(-Math.floor(hours / 24), 'day')
}

export function MachineCount(props: { noun: string; available: number | '?' }) {
  const free = () => props.available
  const label = () => `${free() === 1 ? props.noun : props.noun + 's'} free`
  return (
    <div class="flex items-baseline gap-3.5 p-4 last:border-b-0">
      <p class="text-3xl font-bold leading-none text-white">{free()}</p>
      <p class="text-sm uppercase tracking-widest text-neutral-300">
        {label()}
      </p>
    </div>
  )
}

const statusConfig = {
  ready: { label: 'Ready', active: true },
  busy: { label: 'Running', active: true },
  finished: { label: 'Done', active: false },
  unknown: { label: 'Unknown', active: false },
} as const

export function BookingRow(props: { booking: Booking }) {
  const config = () => statusConfig[props.booking.status]
  return (
    <div class="p-4">
      <div class="flex items-baseline gap-2.5 mb-2">
        <p class="text-sm uppercase tracking-widest text-neutral-300">
          {props.booking.machine}
        </p>
        <p
          class={`text-sm uppercase tracking-widest ${config().active ? 'text-white font-semibold' : 'text-neutral-400'}`}
        >
          {config().label}
        </p>
      </div>
      <p class="text-xs text-neutral-400">
        {props.booking.date}, {props.booking.time}
      </p>
    </div>
  )
}

export function SectionHeader(props: {
  label: string
  timestamp?: number
  now?: number
  isPending?: boolean
  isRefetching?: boolean
  onRefresh?: () => void
}) {
  return (
    <div class="p-4 border-b border-neutral-700 flex items-center justify-between">
      <span class="text-xs uppercase tracking-widest leading-none text-neutral-300">
        {props.label}
      </span>
      <Show when={props.timestamp}>
        <div class="flex items-center gap-3.5">
          <span class="text-xs text-neutral-400 leading-none">
            <Show when={!props.isPending && (props.timestamp ?? 0) > 0}>
              <Show when={!props.isRefetching} fallback="Refreshing">
                {relativeTime(props.timestamp!, props.now)}
              </Show>
            </Show>
          </span>
          <Show when={!props.isPending && props.onRefresh}>
            <button
              onClick={props.onRefresh}
              class="text-neutral-300 border border-neutral-600 size-7 -my-1 leading-none transition-colors cursor-pointer"
            >
              ↺
            </button>
          </Show>
        </div>
      </Show>
    </div>
  )
}

export function QueryGuard(props: {
  isPending: boolean
  isError: boolean
  children: JSX.Element
}) {
  return (
    <Show
      when={!props.isPending}
      fallback={<p class="p-4 text-sm text-neutral-400">Loading...</p>}
    >
      <Show
        when={!props.isError}
        fallback={<p class="p-4 text-sm text-neutral-400">Failed to load...</p>}
      >
        {props.children}
      </Show>
    </Show>
  )
}

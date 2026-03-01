import { createEffect, createSignal, onCleanup } from 'solid-js'

export function createNow() {
  const [now, setNow] = createSignal(Date.now())
  createEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    onCleanup(() => clearInterval(timer))
  })
  return now
}

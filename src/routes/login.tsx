import { useMutation } from '@tanstack/solid-query'
import { createFileRoute, useNavigate } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { loginAuth } from '~/lib/auth'
import { SectionHeader } from '~/lib/ui'

export const Route = createFileRoute('/login')({
  component: () => {
    const [password, setPassword] = createSignal('')
    const navigate = useNavigate()

    const login = useMutation(() => ({
      mutationFn: (data: string) => loginAuth({ data }),
      onSuccess: () => navigate({ to: '/' }),
    }))

    return (
      <div class="min-h-screen p-6">
        <main class="max-w-sm mx-auto">
          <div class="flex justify-between h-9.5 items-center mb-6">
            <h1 class="text-lg font-bold tracking-widest text-white leading-none">
              DUWash
            </h1>
          </div>
          <section class="border border-neutral-700">
            <SectionHeader label="Authentication" />
            <form
              class="p-4 flex flex-col gap-4"
              onSubmit={(e: Event) => {
                e.preventDefault()
                login.mutate(password())
              }}
            >
              <Show when={login.isError}>
                <p class="text-red-500 text-sm">Invalid password</p>
              </Show>
              <input
                type="password"
                placeholder="Enter App Password"
                class="border border-neutral-700 bg-transparent text-white p-3 w-full outline-none focus:border-white transition-colors"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                disabled={login.isPending}
              />
              <button
                type="submit"
                class="border border-neutral-700 p-3 text-white uppercase tracking-widest text-sm hover:bg-neutral-900 transition-colors disabled:opacity-50"
                disabled={login.isPending}
              >
                {login.isPending ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </section>
        </main>
      </div>
    )
  },
})

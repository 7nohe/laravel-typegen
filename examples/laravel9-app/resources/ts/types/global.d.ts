import type { Page } from '@inertiajs/core'
declare module '@inertiajs/vue3' {
  export function usePage<T>(): Page<T>
}

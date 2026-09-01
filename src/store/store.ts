import type { AppState } from '../../shared/types'
import { emptyState, hydrate } from '../../shared/reducer'

export { emptyState, reducer } from '../../shared/reducer'
export type { Action } from '../../shared/reducer'

export const STORAGE_KEY = 'attendly.state.v1'

export function loadState(): AppState {
  if (typeof localStorage === 'undefined') return emptyState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    return hydrate(JSON.parse(raw) as Partial<AppState>)
  } catch {
    return emptyState()
  }
}

export function saveState(state: AppState) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage may be unavailable or full; the session still works in memory */
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { Dispatch, ReactNode } from 'react'
import type { AppState } from '../../../shared/types'
import type { Action } from '../../../shared/reducer'
import { emptyState, hydrate, reducer } from '../../../shared/reducer'

const STORAGE_KEY = 'attendly.state.v1'

type StoreValue = { state: AppState; dispatch: Dispatch<Action>; ready: boolean }

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, emptyState)
  const [ready, setReady] = useState(false)
  // AsyncStorage is async, so the first render happens before the saved state
  // arrives; don't write back until it has, or an empty state overwrites it.
  const loaded = useRef(false)

  useEffect(() => {
    let cancelled = false
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return
        if (raw) dispatch({ type: 'state/hydrate', state: hydrate(JSON.parse(raw) as Partial<AppState>) })
      })
      .catch(() => {
        /* first run, or storage unavailable */
      })
      .finally(() => {
        if (cancelled) return
        loaded.current = true
        setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!loaded.current) return
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {})
  }, [state])

  const value = useMemo(() => ({ state, dispatch, ready }), [state, ready])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

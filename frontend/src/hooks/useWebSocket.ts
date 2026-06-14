import { useEffect, useRef } from 'react'
import { useDashboardStore } from '../store/dashboardStore'

const WS_URL = '/ws'

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectDelayRef = useRef(1000)
  const unmountedRef = useRef(false)
  const connectRef = useRef<() => void>(() => {})

  connectRef.current = () => {
    if (unmountedRef.current) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}${WS_URL}`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (unmountedRef.current) return
      const { setConnected, setLastUpdate } = useDashboardStore.getState()
      setConnected(true)
      setLastUpdate(new Date())
      reconnectDelayRef.current = 1000
    }

    ws.onmessage = (event) => {
      if (unmountedRef.current) return
      try {
        const msg = JSON.parse(event.data)
        const { setLastUpdate, setFromPayload } = useDashboardStore.getState()
        setLastUpdate(new Date())

        if (msg.type === 'status_update') {
          setFromPayload(msg)
        }
      } catch {
        // malformed message — ignore
      }
    }

    ws.onerror = () => {
      // handled by onclose
    }

    ws.onclose = () => {
      if (unmountedRef.current) return
      useDashboardStore.getState().setConnected(false)

      const delay = Math.min(reconnectDelayRef.current, 30000)
      reconnectDelayRef.current = Math.min(delay * 2, 30000)

      reconnectTimeoutRef.current = setTimeout(() => {
        connectRef.current()
      }, delay)
    }
  }

  useEffect(() => {
    unmountedRef.current = false
    connectRef.current()

    return () => {
      unmountedRef.current = true
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, []) // intentionally empty

  const isConnected = useDashboardStore((s) => s.isConnected)
  const lastUpdate = useDashboardStore((s) => s.lastUpdate)

  return { isConnected, lastUpdate }
}

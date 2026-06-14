import { useEffect, useRef, useState } from 'react'
import { useDashboardStore } from '../store/dashboardStore'
import type { GraphSelection } from '../types'

export default function MeshGraph({
  selected = null,
  onSelectionChange,
}: {
  selected?: GraphSelection | null
  onSelectionChange?: (selection: GraphSelection | null) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const agents = useDashboardStore((s) => s.agents)
  const services = useDashboardStore((s) => s.services)
  const system = useDashboardStore((s) => s.system)
  const subagentes = useDashboardStore((s) => s.subagentes)
  const lastUpdate = useDashboardStore((s) => s.lastUpdate)
  const [rotY, setRotY] = useState(0)
  const [hovered, setHovered] = useState<string | null>(null)

  const C_GOLD = '#d4a843'
  const C_TEAL = '#66bbaa'
  const C_SOFT = '#4a3a6a'
  const C_DIM = '#2a1e42'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Build node list
    const allAgents = [
      ...(subagentes || []).map(s => ({ id: s.id, label: s.name, status: s.status, tier: s.tier, type: 'subagente' as const })),
      ...(agents || []).map(a => ({ id: a.id || a.name, label: a.name, status: a.status, tier: a.tier || 'standard', type: 'agent' as const })),
    ]

    const serviceNodes = Object.entries(services || {}).map(([k, s]) => ({
      id: k, label: s.name, status: s.status, tier: 'service' as const, type: 'service' as const,
    }))

    const allNodes = [...allAgents, ...serviceNodes]
    const nodeCount = allNodes.length
    if (nodeCount === 0) return

    const gold = [212, 168, 67]
    const teal = [102, 187, 170]
    const dim = [42, 30, 66]
    const red = [255, 112, 96]
    const amber = [240, 192, 64]

    // Spherical coordinates
    const radius = Math.min(canvas.width, canvas.height) * 0.28
    const cx = canvas.width * 0.5
    const cy = canvas.height * 0.48

    // Generate golden-angle sphere positions
    const positions: { x: number; y: number; z: number; color: number[] }[] = []
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = phi * i
      const px = radiusAtY * Math.cos(theta) * radius
      const py = y * radius
      const pz = radiusAtY * Math.sin(theta) * radius
      const node = allNodes[i]
      let color: number[]
      if (node.status === 'down' || node.status === 'offline') color = red
      else if (node.status === 'degraded') color = amber
      else if (node.type === 'subagente' || node.type === 'agent') color = gold
      else color = teal
      positions.push({ x: px, y: py, z: pz, color })
    }

    let angle = 0

    const frame = () => {
      if (!canvas || !ctx) return
      angle += 0.003
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections (nearest neighbors)
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x
          const dy = positions[i].y - positions[j].y
          const dz = positions[i].z - positions[j].z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < radius * 0.9) {
            const cosA = Math.cos(angle)
            const sinA = Math.sin(angle)
            const rot = (x: number, z: number) => x * cosA - z * sinA
            const rotZ = (x: number, z: number) => x * sinA + z * cosA

            const z1 = rotZ(positions[i].x, positions[i].z)
            const z2 = rotZ(positions[j].x, positions[j].z)
            const depth1 = z1 + radius
            const depth2 = z2 + radius
            const maxDepth = radius * 2

            const alpha = Math.max(0.05, 0.25 * (1 - (depth1 + depth2) / (2 * maxDepth)))
            ctx.strokeStyle = `rgba(160,144,192,${alpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(
              cx + rot(positions[i].x, positions[i].z),
              cy + positions[i].y
            )
            ctx.lineTo(
              cx + rot(positions[j].x, positions[j].z),
              cy + positions[j].y
            )
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < positions.length; i++) {
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        const rx = positions[i].x * cosA - positions[i].z * sinA
        const rz = positions[i].x * sinA + positions[i].z * cosA
        const depth = rz + radius
        const maxDepth = radius * 2
        const scale = 0.6 + 0.4 * (depth / maxDepth)
        const alpha = 0.3 + 0.7 * (depth / maxDepth)
        const nodeRadius = 3 * scale

        ctx.beginPath()
        ctx.arc(cx + rx, cy + positions[i].y, nodeRadius, 0, Math.PI * 2)
        const [r, g, b] = positions[i].color
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.8})`
        ctx.fill()
        if (depth > radius * 0.6) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.5})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      animRef.current = requestAnimationFrame(frame)
    }

    frame()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [agents, services, subagentes, lastUpdate])

  // Mouse handler
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = () => { /* simplified — no hit testing */ }
    canvas.addEventListener('click', handler)
    return () => canvas.removeEventListener('click', handler)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, zIndex: 2, cursor: 'default' }}
    />
  )
}

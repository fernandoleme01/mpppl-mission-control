import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import { useDashboardStore } from './store/dashboardStore'
import type { GraphSelection, ServiceHealth, Subagente, Modulo } from './types'

// ── Paleta MPPPL — azul-marinho + dourado advocacia ──────────────────────────

const C = {
  text: '#e8e0f0',
  soft: '#a090c0',
  dim: '#3a2a58',
  gold: '#d4a843',
  goldBright: '#f0c860',
  navy: '#0a0e27',
  navyLight: '#141a3a',
  cyan: '#88ccff',
  teal: '#66bbaa',
  green: '#79ff98',
  amber: '#f0c040',
  red: '#ff7060',
}

// ── Subagentes MPPPL ─────────────────────────────────────────────────────────

const SUBAGENTE_COLORS: Record<string, string> = {
  sia: C.amber,
  sec: C.cyan,
  spj: C.teal,
  sag: '#ff9966',
  sao: '#77dd77',
  aos: C.goldBright,
  sentinela: '#aaccff',
  'pesq-jurid': C.teal,
  'pesq-proc': C.cyan,
  'mont-brief': C.gold,
  redigir: C.goldBright,
  revisao: C.goldBright,
}

// ── Floating particles ───────────────────────────────────────────────────────

interface Particle {
  x: number; y: number; vx: number; vy: number
  r: number; alpha: number; life: number; decay: number
}

function FloatingParticles() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const mkParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h + h * 0.1,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.35 - 0.08,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.45 + 0.05,
      life: 1,
      decay: 0.0008 + Math.random() * 0.0012,
    })

    const particles: Particle[] = Array.from({ length: 60 }, (_, i) => {
      const p = mkParticle(canvas.width, canvas.height)
      p.life = i / 60
      return p
    })

    let id: number
    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.life -= p.decay
        if (p.life <= 0 || p.y < -10) {
          Object.assign(p, mkParticle(canvas.width, canvas.height))
          p.y = canvas.height + 4
          p.life = 1
        }
        const a = p.alpha * Math.min(p.life * 4, 1)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,168,67,${a * 0.6})`
        ctx.fill()
      }
      id = requestAnimationFrame(frame)
    }
    frame()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(id) }
  }, [])

  return (
    <canvas ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />
  )
}

// ── Volumetric fog ───────────────────────────────────────────────────────────

function VolumetricFog() {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 70% 50% at 28% 62%, rgba(20,30,80,0.25), transparent)',
        animation: 'fog-breathe 12s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 45% at 72% 38%, rgba(30,20,60,0.18), transparent)',
        animation: 'fog-breathe 16s ease-in-out infinite 5s',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 30% at 50% 90%, rgba(10,10,30,0.28), transparent)',
      }} />
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUptime(s: number): string {
  if (!s || s < 0) return '—'
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// ── Command Header ────────────────────────────────────────────────────────────

function CommandHeader({ onlineAgents, totalAgents }: { onlineAgents: number; totalAgents: number }) {
  return (
    <div style={{ display: 'grid', gap: 1, padding: '2px 0' }}>
      <div style={{ fontSize: 10, color: C.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: '"Orbitron", monospace' }}>
        MPPPL
      </div>
      <div style={{ fontSize: 16, color: C.text, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
        Mission Control
      </div>
      <div style={{ fontSize: 10, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {onlineAgents}/{totalAgents || 0} online
      </div>
    </div>
  )
}

// ── Subagente Dock ───────────────────────────────────────────────────────────

function SubagenteDock({ onSelect }: { onSelect: (s: GraphSelection) => void }) {
  const subagentes = useDashboardStore((s) => s.subagentes)
  const [expanded, setExpanded] = useState(false)

  const visible = subagentes.slice(0, expanded ? subagentes.length : 4)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '6px 10px',
      border: `1px solid rgba(212,168,67,0.15)`,
      background: 'rgba(10,5,22,0.5)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      maxHeight: expanded ? 400 : 140,
      overflow: 'hidden',
      transition: 'max-height 0.3s ease',
      minWidth: 180,
    }}>
      <div style={{ fontSize: 9, color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 2 }}>
        Subagentes
      </div>
      {visible.map((sa) => (
        <button
          key={sa.id}
          type="button"
          onClick={() => onSelect({ type: 'agent', key: sa.id, label: sa.label })}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', padding: '3px 4px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: sa.status === 'online' ? SUBAGENTE_COLORS[sa.id] ?? C.green : C.dim,
            boxShadow: sa.status === 'online' ? `0 0 6px ${SUBAGENTE_COLORS[sa.id] ?? C.green}` : 'none',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>
              {sa.name}
            </div>
            <div style={{ fontSize: 8, color: C.soft, letterSpacing: '0.08em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sa.label}
            </div>
          </div>
          {sa.tier === 'premium' && (
            <span style={{ fontSize: 7, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase', border: `1px solid ${C.gold}33`, padding: '1px 4px', borderRadius: 0 }}>
              P
            </span>
          )}
          {sa.task && (
            <span style={{ fontSize: 7, color: C.soft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 60 }}>
              {sa.task}
            </span>
          )}
        </button>
      ))}
      {subagentes.length > 4 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            fontSize: 8, color: C.gold, background: 'none', border: 'none',
            cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '2px 0', textAlign: 'left',
          }}
        >
          {expanded ? '△ menos' : `▽ +${subagentes.length - 4} mais`}
        </button>
      )}
    </div>
  )
}

// ── Módulos Strip ────────────────────────────────────────────────────────────

function ModulosStrip() {
  const modulos = useDashboardStore((s) => s.modulos)
  const escritorioStats = useDashboardStore((s) => s.escritorioStats)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 8px',
      border: `1px solid rgba(212,168,67,0.1)`,
      background: 'rgba(10,5,22,0.35)',
    }}>
      {modulos.map((m) => (
        <span key={m.id} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 9, color: C.soft, letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: m.cor, boxShadow: `0 0 4px ${m.cor}` }} />
          {m.label}
        </span>
      ))}
      {escritorioStats && (
        <span style={{ marginLeft: 'auto', fontSize: 9, color: C.gold, letterSpacing: '0.1em' }}>
          {escritorioStats.ativos_hoje} ativos · {escritorioStats.prazos_proximos} prazos
        </span>
      )}
    </div>
  )
}

// ── Mesh Status Bar ──────────────────────────────────────────────────────────

function MeshStatusBar({ onSelect }: { onSelect: (s: GraphSelection) => void }) {
  const services = useDashboardStore((s) => s.services)
  const faissStatus = useDashboardStore((s) => s.faissStatus)
  const lightragStatus = useDashboardStore((s) => s.lightragStatus)

  type Alert = { text: string; tone: string; sel?: GraphSelection }
  const alerts: Alert[] = []

  for (const [key, svc] of Object.entries(services)) {
    if (svc.status === 'down' || svc.status === 'degraded') {
      const tone = svc.status === 'down' ? C.red : C.amber
      alerts.push({ text: `${svc.name ?? key} ${svc.status}`, tone, sel: { type: 'service', key, label: svc.name ?? key } })
    }
  }

  if (alerts.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px' }}>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
        <span style={{ fontSize: 10, color: C.dim, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Mesh nominal</span>
        {faissStatus && faissStatus !== 'unknown' && faissStatus.startsWith('up') && (
          <span style={{ fontSize: 9, color: C.soft, letterSpacing: '0.12em' }}>· FAISS ok</span>
        )}
        {lightragStatus === 'up' && (
          <span style={{ fontSize: 9, color: C.soft, letterSpacing: '0.12em' }}>· LightRAG ok</span>
        )}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6,
      padding: '5px 10px',
      border: `1px solid ${alerts.some(a => a.tone === C.red) ? 'rgba(255,112,96,0.28)' : 'rgba(240,192,64,0.28)'}`,
      background: 'rgba(10,4,18,0.55)',
      maxWidth: 680,
    }}>
      {alerts.slice(0, 3).map((alert, i) => (
        <button
          key={i}
          type="button"
          onClick={() => alert.sel && onSelect(alert.sel)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'transparent', border: 'none', padding: 0, cursor: alert.sel ? 'pointer' : 'default',
          }}
        >
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: alert.tone, boxShadow: `0 0 5px ${alert.tone}`, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: alert.tone, letterSpacing: '0.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
            {alert.text}
          </span>
        </button>
      ))}
      {alerts.length > 3 && (
        <span style={{ fontSize: 9, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          +{alerts.length - 3}
        </span>
      )}
    </div>
  )
}

// ── Clock Dot ────────────────────────────────────────────────────────────────

function ClockDot({ isConnected }: { isConnected: boolean }) {
  const lastUpdate = useDashboardStore((s) => s.lastUpdate)
  const [time, setTime] = useState(() => new Date().toLocaleTimeString())
  const [live, setLive] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
      setLive(lastUpdate ? Date.now() - lastUpdate.getTime() < 6000 : false)
    }, 1000)
    return () => clearInterval(id)
  }, [lastUpdate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: isConnected && live ? C.gold : C.dim,
          boxShadow: isConnected && live ? `0 0 8px ${C.gold}` : 'none',
          animation: !isConnected ? 'link-blink 1.4s ease-in-out infinite' : undefined,
        }} />
        <span style={{ fontSize: 18, color: C.text, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums', fontFamily: '"Fira Code", monospace' }}>
          {time}
        </span>
      </div>
      {!isConnected && (
        <span style={{ fontSize: 9, color: C.dim, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          reconnecting…
        </span>
      )}
    </div>
  )
}

// ── Stat Pills ───────────────────────────────────────────────────────────────

function StatPill({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  const pctMatch = value.match(/^(\d+(\.\d+)?)%$/)
  const numericPct = pctMatch ? parseFloat(pctMatch[1]) : null
  const accent = warn || (numericPct != null && numericPct > 85)
    ? '#ffb04d'
    : numericPct != null && numericPct > 70
      ? C.amber
      : C.gold
  const [pulsing, setPulsing] = useState(false)
  const prevValue = useRef(value)
  useEffect(() => {
    if (prevValue.current !== value && prevValue.current !== '') {
      setPulsing(true)
      const t = setTimeout(() => setPulsing(false), 400)
      prevValue.current = value
      return () => clearTimeout(t)
    }
    prevValue.current = value
  }, [value])
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      padding: '6px 14px 7px',
      borderRadius: 0,
      border: `1px solid ${warn || (numericPct != null && numericPct > 85) ? 'rgba(255,176,77,0.44)' : numericPct != null && numericPct > 70 ? 'rgba(240,192,64,0.4)' : 'rgba(212,168,67,0.34)'}`,
      background: 'rgba(10,5,22,0.74)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      minWidth: 100,
    }}>
      <span style={{ fontSize: 10, letterSpacing: '0.2em', color: C.soft, textTransform: 'uppercase', marginBottom: 3 }}>{label}</span>
      <span style={{ fontSize: 24, color: accent, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1, fontFamily: '"Fira Code", monospace', animation: pulsing ? 'stat-pulse 0.4s ease-out' : undefined }}>{value}</span>
      {sub && <span style={{ fontSize: 10, color: C.dim, letterSpacing: '0.1em', marginTop: 3 }}>{sub}</span>}
    </div>
  )
}

// ── Timeline Scrubber ────────────────────────────────────────────────────────

function TimelineScrubber() {
  const [replayMode, setReplayMode] = useState(false)
  const [replayLabel, setReplayLabel] = useState<string | null>(null)
  const [sliderVal, setSliderVal] = useState(100)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSnapshot = useCallback(async (pct: number) => {
    if (pct >= 100) { setReplayMode(false); setReplayLabel(null); return }
    const now = Date.now()
    const earliest = now - 24 * 60 * 60 * 1000
    const targetMs = earliest + (pct / 100) * (now - earliest)
    const t = new Date(targetMs).toISOString()
    try {
      const res = await fetch(`/api/history?t=${encodeURIComponent(t)}`)
      const data = await res.json()
      if (data.snapshot) {
        setReplayMode(true)
        setReplayLabel(new Date(data.snapshot.ts).toLocaleTimeString())
      }
    } catch { /* silent */ }
  }, [])

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = Number(e.target.value)
    setSliderVal(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSnapshot(val), 300)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 10px',
      border: `1px solid ${replayMode ? 'rgba(240,192,64,0.4)' : 'rgba(212,168,67,0.14)'}`,
      background: replayMode ? 'rgba(20,12,2,0.55)' : 'rgba(8,4,16,0.36)',
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      <span style={{ fontSize: 9, letterSpacing: '0.16em', color: replayMode ? C.amber : C.dim, textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: 48 }}>
        {replayMode ? `↩ ${replayLabel ?? '…'}` : 'Live'}
      </span>
      <input
        type="range" min={0} max={100} value={sliderVal}
        onChange={handleChange}
        style={{ width: 120, accentColor: replayMode ? C.amber : C.gold, cursor: 'pointer' }}
        title="Drag left to replay mesh history (24h)"
      />
      {replayMode && (
        <button
          onClick={() => { setSliderVal(100); setReplayMode(false); setReplayLabel(null) }}
          style={{ fontSize: 9, color: C.amber, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0 }}
        >
          ← Live
        </button>
      )}
    </div>
  )
}

// ── OS Notifications ─────────────────────────────────────────────────────────

function useServiceNotifications() {
  const services = useDashboardStore((s) => s.services)
  const prevRef = useRef<Record<string, string>>({})
  const lastFiredRef = useRef<Record<string, number>>({})
  const DEBOUNCE_MS = 60_000

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    const prev = prevRef.current
    const now = Date.now()
    for (const [key, svc] of Object.entries(services) as [string, ServiceHealth][]) {
      const newStatus = svc.status
      const oldStatus = prev[key]
      if (oldStatus && oldStatus !== newStatus && (newStatus === 'down' || newStatus === 'degraded')) {
        const lastFired = lastFiredRef.current[key] ?? 0
        if (now - lastFired >= DEBOUNCE_MS) {
          new Notification(`MPPPL alert: ${svc.name ?? key}`, {
            body: `Status changed to ${newStatus.toUpperCase()}`,
            tag: key,
          })
          lastFiredRef.current[key] = now
        }
      }
      prev[key] = newStatus
    }
    prevRef.current = { ...prev }
  }, [services])
}

// ── Processos Preview ────────────────────────────────────────────────────────

function ProcessosPreview() {
  const processos = useDashboardStore((s) => s.processos)
  const [expanded, setExpanded] = useState(false)

  if (!processos || processos.length === 0) return null

  const visible = expanded ? processos : processos.slice(0, 3)

  return (
    <div style={{
      position: 'absolute', right: 16, top: '50%', transform: 'translateY(-46%)',
      zIndex: 5,
      padding: '8px 12px',
      border: `1px solid rgba(212,168,67,0.12)`,
      background: 'rgba(10,5,22,0.55)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      minWidth: 200,
      maxWidth: 280,
      pointerEvents: 'all',
    }}>
      <div style={{ fontSize: 9, color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>
        Processos Recentes
      </div>
      {visible.map((p, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '2px 0', fontSize: 10, color: C.text,
          borderBottom: i < visible.length - 1 ? '1px solid rgba(160,144,192,0.08)' : 'none',
        }}>
          <span style={{ color: C.soft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {p.numero ?? `#${p.id ?? i + 1}`}
          </span>
          <span style={{
            color: p.status === 'ativo' ? C.green : p.status === 'em_andamento' ? C.amber : C.dim,
            fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 8,
          }}>
            {p.status ?? '—'}
          </span>
        </div>
      ))}
      {processos.length > 3 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            fontSize: 8, color: C.gold, background: 'none', border: 'none',
            cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '4px 0 0', textAlign: 'left',
          }}
        >
          {expanded ? '△ menos' : `▽ +${processos.length - 3} mais`}
        </button>
      )}
    </div>
  )
}

// ── Services Status Badge ────────────────────────────────────────────────────

function ServicesStatus() {
  const services = useDashboardStore((s) => s.services)
  const faissStatus = useDashboardStore((s) => s.faissStatus)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '3px 8px',
      border: `1px solid rgba(212,168,67,0.08)`,
      background: 'rgba(10,5,22,0.3)',
    }}>
      {Object.entries(services).map(([key, svc]) => (
        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: C.soft, letterSpacing: '0.08em' }}>
          <span style={{
            width: 4, height: 4, borderRadius: '50%',
            background: svc.status === 'up' ? C.green : svc.status === 'degraded' ? C.amber : C.red,
          }} />
          {svc.name ?? key}
        </span>
      ))}
      <span style={{ fontSize: 9, color: faissStatus.startsWith('up') ? C.green : C.dim, letterSpacing: '0.08em' }}>
        FAISS {faissStatus}
      </span>
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { isConnected } = useWebSocket()
  const system = useDashboardStore((s) => s.system)
  const agents = useDashboardStore((s) => s.agents)
  const subagentes = useDashboardStore((s) => s.subagentes)
  const escritorioStats = useDashboardStore((s) => s.escritorioStats)
  const [graphSelection, setGraphSelection] = useState<GraphSelection | null>(null)

  useServiceNotifications()

  const onlineAgents = agents.filter((a) => ['online', 'active', 'busy'].includes(a.status)).length
  const onlineSubagentes = subagentes.filter((sa) => sa.status === 'online').length

  return (
    <div
      className="h-screen overflow-hidden"
      style={{
        background: [
          'radial-gradient(circle at 50% 44%, rgba(40,60,140,0.18), transparent 18%)',
          'radial-gradient(circle at 50% 50%, rgba(20,30,80,0.10), transparent 36%)',
          'linear-gradient(180deg, #060312 0%, #030108 100%)',
        ].join(', '),
        color: C.text,
        fontFamily: '"Orbitron", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>

        <VolumetricFog />
        {/* MeshGraph would go here — importing from components/MeshGraph */}
        <FloatingParticles />

        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>

          {/* ── Top bar ── */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '14px 20px 0',
            gap: 16,
          }}>
            <div style={{ pointerEvents: 'all' }}>
              <CommandHeader onlineAgents={onlineAgents} totalAgents={subagentes.length + agents.length} />
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingTop: 6, pointerEvents: 'all' }}>
              <MeshStatusBar onSelect={setGraphSelection} />
            </div>
            <div style={{ pointerEvents: 'all' }}>
              <ClockDot isConnected={isConnected} />
            </div>
          </div>

          {/* ── Left dock: Subagentes ── */}
          <div style={{
            position: 'absolute', left: 16, top: '30%', transform: 'translateY(-35%)',
            pointerEvents: 'all', zIndex: 5,
          }}>
            <SubagenteDock onSelect={setGraphSelection} />
            <div style={{ marginTop: 8 }}>
              <ModulosStrip />
            </div>
            <div style={{ marginTop: 6 }}>
              <ServicesStatus />
            </div>
          </div>

          {/* ── Right: Processos Preview ── */}
          <ProcessosPreview />

          {/* ── Bottom strip — hover to reveal ── */}
          <div
            style={{
              position: 'absolute', bottom: 16, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
              flexWrap: 'wrap',
              opacity: 0,
              transition: 'opacity 0.25s ease',
              pointerEvents: 'all',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0' }}
          >
            <StatPill label="System Memory" value={system?.ram_pct != null ? `${Math.round(system.ram_pct)}%` : '—'} sub={system ? `${system.ram_used_gb}/${system.ram_total_gb} GB` : undefined} />
            <StatPill label="CPU Load"      value={system?.cpu_pct != null ? `${Math.round(system.cpu_pct)}%` : '—'} sub={system?.load_1m ? `${system.load_1m} avg` : undefined} />
            <StatPill label="Disk"          value={system?.disk_pct != null ? `${Math.round(system.disk_pct)}%` : '—'} sub={system ? `${system.disk_used_gb}/${system.disk_total_gb} GB` : undefined} warn={system?.disk_pct != null && system.disk_pct > 85} />
            <StatPill label="Agentes"       value={`${onlineSubagentes}/${subagentes.length || '—'}`} sub={system?.uptime_seconds ? `UP ${formatUptime(system.uptime_seconds)}` : undefined} />
            {escritorioStats && (
              <StatPill label="Processos"    value={`${escritorioStats.total_processos}`} sub={`${escritorioStats.prazos_proximos} prazos`} />
            )}
            <TimelineScrubber />
          </div>

          {/* ── CTO insights ── */}
          <div style={{
            position: 'absolute', bottom: 80, right: 16,
            zIndex: 5, pointerEvents: 'all',
          }}>
            <CtoInsightsBanner />
          </div>

        </div>
      </div>
    </div>
  )
}

// ── CTO Insights Banner ──────────────────────────────────────────────────────

function CtoInsightsBanner() {
  const ctoInsights = useDashboardStore((s) => s.ctoInsights)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (ctoInsights.length > 0) {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 8000)
      return () => clearTimeout(t)
    }
  }, [ctoInsights])

  if (!visible || ctoInsights.length === 0) return null

  return (
    <div style={{
      padding: '6px 10px',
      border: `1px solid ${C.gold}33`,
      background: 'rgba(10,5,22,0.7)',
      backdropFilter: 'blur(8px)',
      maxWidth: 300,
      animation: 'fadeInUp 0.4s ease-out',
    }}>
      <div style={{ fontSize: 8, color: C.gold, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 2 }}>
        CTO Insights
      </div>
      {ctoInsights.slice(0, 3).map((insight, i) => (
        <div key={i} style={{ fontSize: 10, color: C.soft, padding: '1px 0' }}>
          {insight}
        </div>
      ))}
    </div>
  )
}

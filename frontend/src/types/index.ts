// Shapes match what the MPPPL backend actually sends

export interface Agent {
  id: string
  name: string
  label?: string
  status: string
  model?: string
  task?: string
  tier?: string
  last_active?: string
  presence?: {
    kind: string
    status: string
    reason?: string | null
  }
}

export interface Subagente {
  id: string
  name: string
  label: string
  model: string
  tier: string
  status: string
  presence?: { kind: string; status: string; reason?: string | null }
  last_active?: string | null
  task?: string | null
}

export interface ServiceHealth {
  name: string
  status: string  // "up" | "down" | "degraded"
  error?: string
  models?: string[]
  active_model?: string
}

export interface CronJob {
  id: string
  name: string
  schedule_display?: string
  last_run_at?: string | null
  next_run_at?: string | null
  next_run_in_seconds?: number | null
  last_status?: string | null
  enabled?: boolean
  state?: string
}

export interface MemoryEntry {
  id?: string
  text?: string
  score?: number
  timestamp?: string
  content?: string
}

export interface MemorySummary {
  status: string
  recall_count: number
  warnings: string[]
}

export interface MemoryEvent {
  ts?: string | null
  type: string
  status: string
  summary: string
}

export interface SystemMetrics {
  cpu_pct: number
  ram_pct: number
  ram_used_gb: number
  ram_total_gb: number
  disk_pct: number
  disk_used_gb: number
  disk_total_gb: number
  uptime_seconds: number
  load_1m: number
}

export interface GraphSelection {
  type: 'agent' | 'service'
  key: string
  label: string
}

export interface RoutingSummary {
  policy: string
  local_default?: string
  premium_available?: string[]
  warnings?: string[]
}

export interface Modulo {
  id: string
  label: string
  cor: string
}

export interface EscritorioStats {
  total_processos: number
  ativos_hoje: number
  prazos_proximos: number
  ultima_atualizacao?: string | null
}

export interface ProcessoEntry {
  id?: number
  numero?: string
  cliente?: string
  status?: string
  prazo_proximo?: string | null
  updated_at?: string
  [key: string]: unknown
}

export interface StatusUpdate {
  type: 'status_update'
  timestamp?: string
  agents?: Agent[]
  subagentes?: Subagente[]
  processos?: ProcessoEntry[]
  services?: Record<string, ServiceHealth>
  cron_jobs?: CronJob[]
  memories?: MemoryEntry[]
  memory_summary?: MemorySummary
  memory_events?: MemoryEvent[]
  llm_active?: string | null
  system?: SystemMetrics
  hermes_status?: { status: string; session_count?: number }
  routing_summary?: RoutingSummary
  modulos?: Modulo[]
  escritorio_stats?: EscritorioStats
  cto_insights?: string[]
  faiss_status?: string
  lightrag_status?: string
  log_buffer?: string[]
}

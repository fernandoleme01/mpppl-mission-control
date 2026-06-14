import { create } from 'zustand'
import {
  Agent, Subagente, ServiceHealth, CronJob, MemoryEntry,
  MemorySummary, MemoryEvent, SystemMetrics, RoutingSummary,
  Modulo, EscritorioStats, ProcessoEntry,
} from '../types'

interface DashboardState {
  // Connection
  isConnected: boolean
  lastUpdate: Date | null

  // Data
  agents: Agent[]
  subagentes: Subagente[]
  services: Record<string, ServiceHealth>
  cronJobs: CronJob[]
  memories: MemoryEntry[]
  memorySummary: MemorySummary | null
  memoryEvents: MemoryEvent[]
  system: SystemMetrics | null
  hermesStatus: Record<string, unknown> | null
  routingSummary: RoutingSummary | null

  // MPPPL-specific
  processos: ProcessoEntry[]
  modulos: Modulo[]
  escritorioStats: EscritorioStats | null
  ctoInsights: string[]
  faissStatus: string
  lightragStatus: string
  logBuffer: string[]

  // LLM
  llmActive: string | null

  // Actions
  setConnected: (connected: boolean) => void
  setLastUpdate: (date: Date) => void
  setFromPayload: (payload: Record<string, unknown>) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isConnected: false,
  lastUpdate: null,

  agents: [],
  subagentes: [],
  services: {},
  cronJobs: [],
  memories: [],
  memorySummary: null,
  memoryEvents: [],
  system: null,
  hermesStatus: null,
  routingSummary: null,

  // MPPPL
  processos: [],
  modulos: [],
  escritorioStats: null,
  ctoInsights: [],
  faissStatus: 'unknown',
  lightragStatus: 'unknown',
  logBuffer: [],

  llmActive: null,

  setConnected: (isConnected) => set({ isConnected }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),

  setFromPayload: (payload) =>
    set({
      agents: (payload.agents as Agent[]) ?? [],
      subagentes: (payload.subagentes as Subagente[]) ?? [],
      services: (payload.services as Record<string, ServiceHealth>) ?? {},
      cronJobs: (payload.cron_jobs as CronJob[]) ?? [],
      memories: (payload.memories as MemoryEntry[]) ?? [],
      memorySummary: (payload.memory_summary as MemorySummary) ?? null,
      memoryEvents: (payload.memory_events as MemoryEvent[]) ?? [],
      system: (payload.system as SystemMetrics) ?? null,
      hermesStatus: (payload.hermes_status as Record<string, unknown>) ?? null,
      routingSummary: (payload.routing_summary as RoutingSummary) ?? null,
      llmActive: (payload.llm_active as string) ?? null,
      // MPPPL
      processos: (payload.processos as ProcessoEntry[]) ?? [],
      modulos: (payload.modulos as Modulo[]) ?? [],
      escritorioStats: (payload.escritorio_stats as EscritorioStats) ?? null,
      ctoInsights: (payload.cto_insights as string[]) ?? [],
      faissStatus: (payload.faiss_status as string) ?? 'unknown',
      lightragStatus: (payload.lightrag_status as string) ?? 'unknown',
      logBuffer: (payload.log_buffer as string[]) ?? [],
    }),
}))

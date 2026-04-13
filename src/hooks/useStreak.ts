import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'guitar_practice_log'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadLog(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLog(log: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
}

export interface StreakData {
  streak: number
  sessionsToday: number
  totalSessions: number
  last30Days: Record<string, number>
}

function computeStreak(log: string[]): StreakData {
  const today = todayISO()
  const counts: Record<string, number> = {}
  for (const d of log) counts[d] = (counts[d] ?? 0) + 1

  // Build last 30 days map
  const last30Days: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    last30Days[iso] = counts[iso] ?? 0
  }

  // Calculate streak (consecutive days with at least 1 session, going back from today)
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    if ((counts[iso] ?? 0) > 0) {
      streak++
    } else {
      break
    }
  }

  return {
    streak,
    sessionsToday: counts[today] ?? 0,
    totalSessions: log.length,
    last30Days,
  }
}

export function useStreak() {
  const [log, setLog] = useState<string[]>(() => loadLog())

  useEffect(() => {
    saveLog(log)
  }, [log])

  const logSession = useCallback(() => {
    setLog((prev) => [...prev, todayISO()])
  }, [])

  const data = computeStreak(log)

  return { ...data, logSession }
}

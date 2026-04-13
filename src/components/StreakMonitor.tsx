import type { StreakData } from '../hooks/useStreak'

interface StreakMonitorProps extends StreakData {}

function dayLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return String(d.getDate())
}

export default function StreakMonitor({
  streak,
  sessionsToday,
  totalSessions,
  last30Days,
}: StreakMonitorProps) {
  const days = Object.entries(last30Days)
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Streak</h2>
        <div className="flex gap-3">
          <span className="text-sm text-slate-400"><span className="font-bold text-violet-400">{streak}</span> day streak</span>
          <span className="text-sm text-slate-400"><span className="font-bold text-green-400">{sessionsToday}</span> today</span>
          <span className="text-sm text-slate-400"><span className="font-bold text-slate-300">{totalSessions}</span> total</span>
        </div>
      </div>

      {/* 30-day calendar grid */}
      <div className="grid grid-cols-10 gap-1">
        {days.map(([iso, count]) => (
          <div
            key={iso}
            title={`${iso}: ${count} session${count !== 1 ? 's' : ''}`}
            className={`aspect-square rounded-sm flex items-center justify-center text-[9px] font-mono ${
              count >= 2
                ? 'bg-violet-500 text-white'
                : count === 1
                ? 'bg-violet-800 text-violet-200'
                : 'bg-slate-700 text-slate-600'
            }`}
          >
            {dayLabel(iso)}
          </div>
        ))}
      </div>
    </div>
  )
}

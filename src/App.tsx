import { useRef } from 'react'
import DrumMachine, { type DrumMachineHandle } from './components/DrumMachine'
import ChordPicker, { type ChordPickerHandle } from './components/ChordPicker'
import PracticeTimer from './components/PracticeTimer'
import StreakMonitor from './components/StreakMonitor'
import Tuner from './components/Tuner'
import { useStreak } from './hooks/useStreak'

export default function App() {
  const streak = useStreak()
  const drumRef = useRef<DrumMachineHandle>(null)
  const chordRef = useRef<ChordPickerHandle>(null)

  function handleTimerFirstStart() {
    drumRef.current?.startPlaying()
    chordRef.current?.roll()
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">🎸 Guitar Practice</h1>
          <p className="text-slate-400 text-sm">Two chords · 5 minutes · every day</p>
        </header>

        {/* Timer + Drum Machine side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
          <PracticeTimer onSessionComplete={streak.logSession} onFirstStart={handleTimerFirstStart} />
          <DrumMachine ref={drumRef} />
        </div>

        {/* Two chords side by side */}
        <ChordPicker ref={chordRef} />

        <Tuner />

        <StreakMonitor
          streak={streak.streak}
          sessionsToday={streak.sessionsToday}
          totalSessions={streak.totalSessions}
          last30Days={streak.last30Days}
        />
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

const DURATION_SECONDS = 5 * 60

interface PracticeTimerProps {
  onSessionComplete: () => void
  onFirstStart?: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function PracticeTimer({ onSessionComplete, onFirstStart }: PracticeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS)
  const [isRunning, setIsRunning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasStartedRef = useRef(false)

  function playDoneSound() {
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 0.8 },
    }).toDestination()
    synth.volume.value = -6
    const now = Tone.now()
    synth.triggerAttackRelease('C5', 0.3, now)
    synth.triggerAttackRelease('E5', 0.3, now + 0.4)
    synth.triggerAttackRelease('G5', 0.5, now + 0.8)
    setTimeout(() => synth.dispose(), 3000)
  }

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setIsRunning(false)
            setIsDone(true)
            Tone.start().then(playDoneSound)
            onSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleStartPause() {
    if (isDone) return
    if (!isRunning && !hasStartedRef.current) {
      hasStartedRef.current = true
      onFirstStart?.()
    }
    setIsRunning((r) => !r)
  }

  function handleReset() {
    setIsRunning(false)
    setIsDone(false)
    setTimeLeft(DURATION_SECONDS)
    hasStartedRef.current = false
  }

  const progress = 1 - timeLeft / DURATION_SECONDS
  const circumference = 2 * Math.PI * 52

  return (
    <div className="bg-slate-800 rounded-2xl p-4 flex flex-col items-center gap-4">
      <h2 className="text-lg font-bold text-white self-start">Timer</h2>

      {/* Circular progress */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#334155" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={isDone ? '#22c55e' : '#7c3aed'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-mono font-bold ${isDone ? 'text-green-400' : 'text-white'}`}>
            {isDone ? '✓' : formatTime(timeLeft)}
          </span>
          {isDone && <span className="text-green-400 text-xs">Done!</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleStartPause}
          disabled={isDone}
          className={`px-5 py-3 rounded-xl font-bold text-white transition-colors disabled:opacity-40 ${
            isRunning
              ? 'bg-yellow-600 active:bg-yellow-700'
              : 'bg-green-600 active:bg-green-700'
          }`}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-3 rounded-xl font-bold text-slate-300 bg-slate-700 active:bg-slate-600 transition-colors"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  )
}

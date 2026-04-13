import { useEffect, useRef, useState } from 'react'
import { PitchDetector } from 'pitchy'

// Standard guitar string notes with their ideal frequencies (Hz)
const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

function frequencyToNote(freq: number): { note: string; octave: number; cents: number } {
  // A4 = 440 Hz, MIDI 69
  const midiFloat = 12 * Math.log2(freq / 440) + 69
  const midiRounded = Math.round(midiFloat)
  const cents = Math.round((midiFloat - midiRounded) * 100)
  const octave = Math.floor(midiRounded / 12) - 1
  const noteIndex = ((midiRounded % 12) + 12) % 12
  return { note: NOTES[noteIndex], octave, cents }
}

export default function Tuner() {
  const [active, setActive] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [octave, setOctave] = useState<number | null>(null)
  const [cents, setCents] = useState<number>(0)
  const [clarity, setClarity] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null)

  async function startTuner() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize)
      const buffer = new Float32Array(analyser.fftSize)

      function detect() {
        analyser.getFloatTimeDomainData(buffer)
        const [freq, cl] = detectorRef.current!.findPitch(buffer, ctx.sampleRate)
        setClarity(cl)
        if (cl > 0.9 && freq > 60 && freq < 1400) {
          const { note: n, octave: o, cents: c } = frequencyToNote(freq)
          setNote(n)
          setOctave(o)
          setCents(c)
        }
        rafRef.current = requestAnimationFrame(detect)
      }

      rafRef.current = requestAnimationFrame(detect)
      setActive(true)
      setError(null)
    } catch {
      setError('Microphone access denied')
    }
  }

  function stopTuner() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null
    streamRef.current = null
    setActive(false)
    setNote(null)
    setClarity(0)
  }

  useEffect(() => () => stopTuner(), [])

  const isInTune = clarity > 0.9 && Math.abs(cents) <= 5

  return (
    <div className="bg-slate-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Tuner</h2>
        <button
          onClick={active ? stopTuner : startTuner}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            active
              ? 'bg-red-700 active:bg-red-800 text-white'
              : 'bg-slate-700 active:bg-slate-600 text-slate-300'
          }`}
        >
          {active ? '⏹ Off' : '🎤 On'}
        </button>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {active && (
        <div className="flex flex-col items-center gap-3">
          {/* Note display */}
          <div className={`text-6xl font-bold font-mono ${isInTune ? 'text-green-400' : 'text-white'}`}>
            {note ? `${note}${octave}` : '—'}
          </div>

          {/* Cents needle */}
          <div className="w-full relative">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 h-full w-1 rounded transition-all ${
                  isInTune ? 'bg-green-400' : 'bg-amber-400'
                }`}
                style={{ left: `calc(50% + ${cents * 0.45}%)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>-50¢</span>
              <span className={isInTune ? 'text-green-400 font-bold' : 'text-slate-400'}>
                {isInTune ? '✓ In tune' : `${cents > 0 ? '+' : ''}${cents}¢`}
              </span>
              <span>+50¢</span>
            </div>
          </div>

          {/* String reference */}
          <div className="grid grid-cols-6 gap-1 w-full">
            {['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map((s) => (
              <div key={s} className="bg-slate-700 rounded text-center text-xs py-1 text-slate-400">
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {!active && !error && (
        <div className="text-center text-slate-500 text-sm py-2">
          Tap On to tune using your microphone
        </div>
      )}
    </div>
  )
}

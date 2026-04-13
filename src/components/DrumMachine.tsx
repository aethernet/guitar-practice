import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as Tone from 'tone'
import { DRUM_PATTERNS } from '../data/drumPatterns'

export interface DrumMachineHandle {
  startPlaying: () => Promise<void>
}

const DrumMachine = forwardRef<DrumMachineHandle>(function DrumMachine(_, ref) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(80)
  const [patternIndex, setPatternIndex] = useState(0)
  const [step, setStep] = useState(-1)

  const kickRef = useRef<Tone.MembraneSynth | null>(null)
  const snareRef = useRef<Tone.NoiseSynth | null>(null)
  const hihatRef = useRef<Tone.MetalSynth | null>(null)
  const seqRef = useRef<Tone.Sequence | null>(null)

  // Initialise synths once
  useEffect(() => {
    kickRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    }).toDestination()
    kickRef.current.volume.value = -6

    snareRef.current = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
    }).toDestination()
    snareRef.current.volume.value = -12

    hihatRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination()
    hihatRef.current.volume.value = -20

    return () => {
      kickRef.current?.dispose()
      snareRef.current?.dispose()
      hihatRef.current?.dispose()
      seqRef.current?.dispose()
    }
  }, [])

  // Rebuild sequence when pattern changes
  useEffect(() => {
    seqRef.current?.dispose()
    const pattern = DRUM_PATTERNS[patternIndex]
    const steps = Array.from({ length: 16 }, (_, i) => i)

    seqRef.current = new Tone.Sequence(
      (time, i) => {
        if (pattern.kick[i]) kickRef.current?.triggerAttackRelease('C1', '8n', time)
        if (pattern.snare[i]) snareRef.current?.triggerAttackRelease('8n', time)
        if (pattern.hihat[i])
          hihatRef.current?.triggerAttackRelease(400, '16n', time)
        Tone.getDraw().schedule(() => setStep(i as number), time)
      },
      steps,
      '16n',
    )

    if (isPlaying) seqRef.current.start(0)
  }, [patternIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync BPM
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm
  }, [bpm])

  async function startPlaying() {
    await Tone.start()
    seqRef.current?.start(0)
    Tone.getTransport().start()
    setIsPlaying(true)
  }

  async function togglePlay() {
    await Tone.start() // iOS AudioContext unlock
    if (isPlaying) {
      Tone.getTransport().stop()
      seqRef.current?.stop()
      setIsPlaying(false)
      setStep(-1)
    } else {
      await startPlaying()
    }
  }

  useImperativeHandle(ref, () => ({ startPlaying }))

  const pattern = DRUM_PATTERNS[patternIndex]

  return (
    <div className="bg-slate-800 rounded-2xl p-4 space-y-4">
      <h2 className="text-lg font-bold text-white">Drum Machine</h2>

      {/* Pattern selector */}
      <div className="flex flex-wrap gap-2">
        {DRUM_PATTERNS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setPatternIndex(i)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              i === patternIndex
                ? 'bg-violet-600 text-white'
                : 'bg-slate-700 text-slate-300 active:bg-slate-600'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Step visualiser */}
      <div className="space-y-1">
        {(['kick', 'snare', 'hihat'] as const).map((lane) => (
          <div key={lane} className="flex gap-0.5 items-center">
            <span className="w-10 text-xs text-slate-400 capitalize">{lane}</span>
            <div className="flex gap-0.5 flex-1">
              {pattern[lane].map((on, i) => (
                <div
                  key={i}
                  className={`h-4 flex-1 rounded-sm transition-colors ${
                    i === step && on
                      ? 'bg-violet-400'
                      : i === step
                      ? 'bg-slate-500'
                      : on
                      ? 'bg-violet-700'
                      : 'bg-slate-700'
                  } ${i % 4 === 0 ? 'ml-1' : ''}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* BPM + Play */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className={`px-6 py-3 rounded-xl font-bold text-white transition-colors ${
            isPlaying ? 'bg-red-600 active:bg-red-700' : 'bg-green-600 active:bg-green-700'
          }`}
        >
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </button>

        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>BPM</span>
            <span className="font-mono font-bold text-white">{bpm}</span>
          </div>
          <input
            type="range"
            min={40}
            max={200}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>40</span>
            <span>200</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default DrumMachine

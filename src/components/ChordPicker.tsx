import { forwardRef, useImperativeHandle, useState } from 'react'
import _ChordImport from '@tombatossals/react-chords/lib/Chord'
import { guitar } from '../data/instrument'
import {
  type ChordInfo,
  type ChordType,
  pickTwoChords,
  resolveChordData,
} from '../data/chords'

// CJS interop: the compiled lib exports via exports["default"], so Vite may
// wrap it in an extra { default: ... } layer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Chord = (_ChordImport as any).default ?? _ChordImport

const FRENCH_ROOT: Record<string, string> = {
  C: 'Do', 'C#': 'Do#', D: 'Ré', Eb: 'Mib', E: 'Mi',
  F: 'Fa', 'F#': 'Fa#', G: 'Sol', Ab: 'Lab', A: 'La', Bb: 'Sib', B: 'Si',
}

function frenchName(root: string, type: ChordType): string {
  const r = FRENCH_ROOT[root] ?? root
  switch (type) {
    case 'major': return r
    case 'minor': return `${r}m`
    case '7':     return `${r}7`
    case 'm7':    return `${r}m7`
    case '5':     return `${r}5`
  }
}

function ChordCard({ chord }: { chord: ChordInfo }) {
  const data = resolveChordData(chord)

  return (
    <div className="w-full bg-slate-800 rounded-2xl p-4 flex flex-col items-stretch gap-2">
      <span className="text-3xl font-bold text-white">{chord.displayName}</span>
      <span className="text-base text-violet-300 font-medium">{frenchName(chord.root, chord.type)}</span>
      <span className="text-xs text-slate-400 capitalize">{chord.type === '5' ? 'Power' : chord.type}</span>
      {data ? (
        <div className="w-full bg-white rounded-xl p-3" style={{ aspectRatio: '80/70' }}>
          <Chord chord={data} instrument={guitar} lite />
        </div>
      ) : (
        <div className="text-slate-500 text-sm">No diagram</div>
      )}
    </div>
  )
}

export interface ChordPickerHandle {
  roll: () => void
}

const ChordPicker = forwardRef<ChordPickerHandle>(function ChordPicker(_, ref) {
  const [chords, setChords] = useState<[ChordInfo, ChordInfo] | null>(null)

  function roll() {
    setChords(pickTwoChords())
  }

  useImperativeHandle(ref, () => ({ roll }))

  return (
    <div className="bg-slate-900 rounded-2xl p-4 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Chords</h2>
        <button
          onClick={roll}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold rounded-xl transition-colors"
        >
          🎲 Roll
        </button>
      </div>

      {chords ? (
        <div className="flex flex-row gap-4">
          <ChordCard chord={chords[0]} />
          <ChordCard chord={chords[1]} />
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8">
          Press Roll to get two random chords
        </div>
      )}
    </div>
  )
})

export default ChordPicker

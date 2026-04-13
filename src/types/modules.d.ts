declare module '@tombatossals/react-chords/lib/Chord' {
  import { FC } from 'react'

  export interface ChordData {
    frets: number[]
    fingers: number[]
    barres: number[]
    baseFret: number
    capo?: boolean
  }

  export interface InstrumentData {
    strings: number
    fretsOnChord: number
    name: string
    keys?: string[]
    tunings: { standard: string[] }
  }

  interface ChordProps {
    chord: ChordData
    instrument: InstrumentData
    lite?: boolean
  }

  const Chord: FC<ChordProps>
  export default Chord
}

declare module '@tombatossals/chords-db/src/db/guitar/chords/index' {
  interface RawPosition {
    frets: string
    fingers: string
    barres?: number
    capo?: boolean
    baseFret?: number
  }

  interface RawChord {
    key: string
    suffix: string
    positions: RawPosition[]
  }

  const chords: {
    C: RawChord[]
    Csharp: RawChord[]
    D: RawChord[]
    Eb: RawChord[]
    E: RawChord[]
    F: RawChord[]
    Fsharp: RawChord[]
    G: RawChord[]
    Ab: RawChord[]
    A: RawChord[]
    Bb: RawChord[]
    B: RawChord[]
  }
  export default chords
  export type { RawChord, RawPosition }
}

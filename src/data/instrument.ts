import type { InstrumentData } from '@tombatossals/react-chords/lib/Chord'

export const guitar: InstrumentData = {
  strings: 6,
  fretsOnChord: 4,
  name: 'guitar',
  keys: ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  tunings: {
    standard: ['E', 'A', 'D', 'G', 'B', 'E'],
  },
}

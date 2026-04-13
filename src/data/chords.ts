import type { ChordData } from '@tombatossals/react-chords/lib/Chord'
import guitarChords from '@tombatossals/chords-db/src/db/guitar/chords/index'
import type { RawPosition } from '@tombatossals/chords-db/src/db/guitar/chords/index'

export type ChordType = 'major' | 'minor' | '7' | 'm7' | '5'

export interface ChordInfo {
  root: string
  type: ChordType
  displayName: string
}

// Map display root names to chords-db object keys
const ROOT_TO_DB_KEY: Record<string, keyof typeof guitarChords> = {
  C: 'C',
  'C#': 'Csharp',
  D: 'D',
  Eb: 'Eb',
  E: 'E',
  F: 'F',
  'F#': 'Fsharp',
  G: 'G',
  Ab: 'Ab',
  A: 'A',
  Bb: 'Bb',
  B: 'B',
}

// Map our ChordType to the chords-db suffix
const TYPE_TO_SUFFIX: Record<Exclude<ChordType, '5'>, string> = {
  major: 'major',
  minor: 'minor',
  '7': '7',
  m7: 'm7',
}

/** Parse a fret character from chords-db string format */
function parseFretChar(c: string): number {
  if (c === 'x') return -1
  return parseInt(c, 16) // handles 'a'=10, 'b'=11 etc.
}

/** Convert a chords-db raw position to react-chords ChordData */
export function convertPosition(pos: RawPosition): ChordData {
  const frets = pos.frets.split('').map(parseFretChar)
  const fingers = pos.fingers.split('').map((c) => parseInt(c, 10) || 0)

  const nonZeroFrets = frets.filter((f) => f > 0)
  const absMin = nonZeroFrets.length > 0 ? Math.min(...nonZeroFrets) : 1

  // Use the barre fret as baseFret when present, otherwise use the minimum fret
  // If all frets fit in a 1-4 window starting at 1, keep baseFret=1
  const baseFret =
    pos.barres !== undefined ? pos.barres : absMin <= 4 ? 1 : absMin

  const relativeFrets = frets.map((f) => {
    if (f <= 0) return f // -1 (muted) or 0 (open) unchanged
    return f - baseFret + 1
  })

  const barres = pos.barres !== undefined ? [pos.barres - baseFret + 1] : []

  return {
    frets: relativeFrets,
    fingers,
    barres,
    baseFret,
    capo: pos.capo || false,
  }
}

/** Look up the first playable position for a given root + type from chords-db */
export function getChordPosition(root: string, type: Exclude<ChordType, '5'>): ChordData | null {
  const dbKey = ROOT_TO_DB_KEY[root]
  if (!dbKey) return null
  const allChords = guitarChords[dbKey]
  const suffix = TYPE_TO_SUFFIX[type]
  const found = allChords.find((c) => c.suffix === suffix)
  if (!found || found.positions.length === 0) return null
  return convertPosition(found.positions[0])
}

// Power chord data — manually defined (root+5th shape, not in chords-db)
// frets already in react-chords relative format, with appropriate baseFret
const POWER_CHORDS: Record<string, ChordData> = {
  E:  { frets: [0, 2, 2, -1, -1, -1], fingers: [0, 1, 3, 0, 0, 0], barres: [], baseFret: 1 },
  F:  { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 1 },
  'F#': { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 2 },
  G:  { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 3 },
  Ab: { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], barres: [], baseFret: 4 },
  A:  { frets: [-1, 0, 2, 2, -1, -1], fingers: [0, 0, 1, 3, 0, 0], barres: [], baseFret: 1 },
  Bb: { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 1 },
  B:  { frets: [-1, 2, 4, 4, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 1 },
  C:  { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 3 },
  'C#': { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 4 },
  D:  { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 5 },
  Eb: { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], barres: [], baseFret: 6 },
}

export function getPowerChordPosition(root: string): ChordData | null {
  return POWER_CHORDS[root] ?? null
}

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const TYPES: ChordType[] = ['major', 'minor', '7', 'm7', '5']

function makeDisplayName(root: string, type: ChordType): string {
  switch (type) {
    case 'major': return root
    case 'minor': return `${root}m`
    case '7':     return `${root}7`
    case 'm7':    return `${root}m7`
    case '5':     return `${root}5`
  }
}

export const CHORD_POOL: ChordInfo[] = ROOTS.flatMap((root) =>
  TYPES.map((type) => ({
    root,
    type,
    displayName: makeDisplayName(root, type),
  }))
)

/** Pick two distinct random chords from the pool */
export function pickTwoChords(): [ChordInfo, ChordInfo] {
  const pool = [...CHORD_POOL]
  const i = Math.floor(Math.random() * pool.length)
  const a = pool.splice(i, 1)[0]
  const j = Math.floor(Math.random() * pool.length)
  const b = pool[j]
  return [a, b]
}

/** Resolve ChordInfo to a react-chords ChordData object */
export function resolveChordData(chord: ChordInfo): ChordData | null {
  if (chord.type === '5') return getPowerChordPosition(chord.root)
  return getChordPosition(chord.root, chord.type)
}

export interface BeatPattern {
  name: string
  /** 16 steps each, true = hit */
  kick: boolean[]
  snare: boolean[]
  hihat: boolean[]
}

const b = (s: string): boolean[] => s.split('').map((c) => c === '1')

export const DRUM_PATTERNS: BeatPattern[] = [
  {
    name: 'Rock',
    kick:  b('1000000010000000'),
    snare: b('0000100000001000'),
    hihat: b('1010101010101010'),
  },
  {
    name: 'Shuffle',
    kick:  b('1000000010000000'),
    snare: b('0000100000001000'),
    hihat: b('1001001010010010'),
  },
  {
    name: 'Heavy',
    kick:  b('1000100010001000'),
    snare: b('0000100000001000'),
    hihat: b('1100110011001100'),
  },
  {
    name: 'Ballad',
    kick:  b('1000000000000000'),
    snare: b('0000100000001000'),
    hihat: b('1000100010001000'),
  },
]

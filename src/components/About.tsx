const DEPS = [
  {
    name: 'React',
    url: 'https://react.dev',
    description: 'UI framework',
  },
  {
    name: 'Vite',
    url: 'https://vite.dev',
    description: 'Build tool & dev server',
  },
  {
    name: 'Tone.js',
    url: 'https://tonejs.github.io',
    description: 'Web Audio framework — drum machine & timer sounds',
  },
  {
    name: '@tombatossals/react-chords',
    url: 'https://github.com/tombatossals/react-chords',
    description: 'SVG chord diagram renderer',
  },
  {
    name: '@tombatossals/chords-db',
    url: 'https://github.com/tombatossals/chords-db',
    description: 'Guitar chord fingering database',
  },
  {
    name: 'pitchy',
    url: 'https://github.com/ianprime0509/pitchy',
    description: 'Pitch detection (McLeod algorithm) — tuner',
  },
  {
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    description: 'Utility-first CSS framework',
  },
  {
    name: 'vite-plugin-pwa',
    url: 'https://vite-pwa-org.netlify.app',
    description: 'PWA & service worker generation',
  },
]

export default function About() {
  return (
    <footer className="bg-slate-800 rounded-2xl p-5 space-y-4 text-sm">
      <h2 className="text-lg font-bold text-white">About</h2>

      <p className="text-slate-300 leading-relaxed">
        Based on the{' '}
        <strong className="text-white">Absolutely Understand Guitar</strong> method by{' '}
        <a
          href="https://www.absolutelyunderstandguitar.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 underline underline-offset-2 hover:text-violet-300"
        >
          Scotty West
        </a>
        . The core practice advice: two random chords, five minutes, with a drum machine, every day.
      </p>

      <div>
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Built with</p>
        <ul className="space-y-1.5">
          {DEPS.map((d) => (
            <li key={d.name} className="flex items-baseline gap-2">
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 font-mono text-xs whitespace-nowrap"
              >
                {d.name}
              </a>
              <span className="text-slate-500">—</span>
              <span className="text-slate-400">{d.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}

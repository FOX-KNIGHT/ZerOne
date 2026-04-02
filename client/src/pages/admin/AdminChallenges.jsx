import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Eye, EyeOff, Plus, Lock, CheckCircle, Zap, Search } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { AnimatedButton } from '../../components/ui/AnimatedButton'

const CHALLENGES = [
  { id: 1, title: 'Bypass Mainframe', type: 'CTF', points: 150, category: 'Exploit', difficulty: 'Hard', visible: true, solves: 12 },
  { id: 2, title: 'Decrypt Payload', type: 'MCQ', points: 50, category: 'Crypto', difficulty: 'Easy', visible: true, solves: 38 },
  { id: 3, title: 'SQL Injection', type: 'CTF', points: 100, category: 'Web', difficulty: 'Medium', visible: true, solves: 25 },
  { id: 4, title: 'Overload Buffer', type: 'CTF', points: 200, category: 'Pwn', difficulty: 'Extreme', visible: false, solves: 3 },
  { id: 5, title: 'Social Engineering', type: 'MCQ', points: 50, category: 'OSINT', difficulty: 'Easy', visible: true, solves: 41 },
  { id: 6, title: 'RSA Decoding', type: 'CTF', points: 175, category: 'Crypto', difficulty: 'Hard', visible: true, solves: 8 },
]

const DIFF_COLORS = {
  Easy: 'text-success border-success/30 bg-success/10',
  Medium: 'text-warning border-warning/30 bg-warning/10',
  Hard: 'text-red-400 border-red-400/30 bg-red-400/10',
  Extreme: 'text-red-600 border-red-600/30 bg-red-600/10',
}

const CAT_COLORS = {
  Exploit: '#ff4444',
  Crypto: '#00f2ff',
  Web: '#00ff41',
  Pwn: '#bf00ff',
  OSINT: '#ffaa00',
}

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState(CHALLENGES)
  const [search, setSearch] = useState('')

  const toggleVisibility = (id) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c))
  }

  const filtered = challenges.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">&gt; challenge management</p>
          <h1 className="font-heading font-black text-4xl text-white">
            Mission <span className="shimmer-text">Nodes</span>
          </h1>
        </div>
        <AnimatedButton variant="primary" className="gap-2 flex-shrink-0">
          <Plus size={15} />
          Add Challenge
        </AnimatedButton>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        {[
          { label: 'Total', val: challenges.length, color: 'text-white' },
          { label: 'Visible', val: challenges.filter(c => c.visible).length, color: 'text-success' },
          { label: 'Hidden', val: challenges.filter(c => !c.visible).length, color: 'text-white/40' },
          { label: 'Total Solves', val: challenges.reduce((a, c) => a + c.solves, 0), color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="text-center bg-black/50 border border-white/8 rounded-xl px-4 py-2.5">
            <p className={`font-heading font-black text-xl ${s.color}`}>{s.val}</p>
            <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
        <input
          type="text" placeholder="Search challenges..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-black/60 border border-primary/20 rounded-lg pl-10 pr-4 py-3 font-mono text-sm text-primary placeholder:text-primary/20 outline-none focus:border-primary/50 transition-all"
        />
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`relative border bg-black/60 rounded-xl p-5 backdrop-blur-md transition-all duration-200 overflow-hidden group ${
              challenge.visible ? 'border-primary/15' : 'border-white/5 opacity-60'
            }`}
          >
            {/* Category color stripe */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 opacity-50"
              style={{ backgroundColor: CAT_COLORS[challenge.category] || '#00ff41' }}
            />

            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                  style={{
                    color: CAT_COLORS[challenge.category],
                    borderColor: `${CAT_COLORS[challenge.category]}40`,
                    backgroundColor: `${CAT_COLORS[challenge.category]}10`,
                  }}
                >
                  {challenge.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 text-white/40">
                  {challenge.type}
                </span>
              </div>

              {/* Visibility toggle */}
              <button
                onClick={() => toggleVisibility(challenge.id)}
                className={`p-2 rounded-lg border transition-all ${
                  challenge.visible
                    ? 'bg-primary/10 border-primary/25 text-primary hover:bg-primary/20'
                    : 'bg-white/5 border-white/10 text-white/25 hover:text-white/50'
                }`}
                title={challenge.visible ? 'Hide' : 'Show'}
              >
                {challenge.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </div>

            <h3 className="font-heading font-bold text-lg text-white mb-2">{challenge.title}</h3>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 border rounded text-[10px] font-mono ${DIFF_COLORS[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="font-mono font-black text-lg text-white/90">
                {challenge.points} <span className="text-[10px] text-white/30 font-normal">PTS</span>
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs text-white/35">
                <CheckCircle size={11} className="text-success" />
                {challenge.solves} solves
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

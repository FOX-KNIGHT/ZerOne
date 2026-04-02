import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, Zap, ChevronRight, Search, Filter, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'

const DIFF_CONFIG = {
  Easy: { color: 'text-success', bg: 'bg-success', label: 'text-success', bar: 'w-1/4' },
  Medium: { color: 'text-warning', bg: 'bg-warning', label: 'text-warning', bar: 'w-1/2' },
  Hard: { color: 'text-red-400', bg: 'bg-red-400', label: 'text-red-400', bar: 'w-3/4' },
  Extreme: { color: 'text-red-600', bg: 'bg-red-600', label: 'text-red-600', bar: 'w-full' },
}

const TYPE_COLOR = {
  flag: 'border-accent/30 text-accent bg-accent/10',
  mcq: 'border-primary/30 text-primary bg-primary/10',
}

const STATUS_CONFIG = {
  solved: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10 border-success/25', label: 'Solved', glow: 'shadow-[0_0_20px_rgba(0,255,65,0.08)]' },
  active: { icon: Zap, color: 'text-accent', bg: 'bg-accent/5 border-accent/25', label: 'Active', glow: 'shadow-[0_0_20px_rgba(0,242,255,0.06)]' },
  locked: { icon: Lock, color: 'text-white/20', bg: 'bg-white/3 border-white/8', label: 'Locked', glow: '' },
}

export default function ChallengeList() {
  const navigate = useNavigate()
  const { challenges, fetchChallenges, solvedChallenges, activeRound } = useAppStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChallenges().finally(() => setLoading(false))
  }, [fetchChallenges])

  // Map backend status based on solvedChallenges and activeRound
  const processedChallenges = challenges.map(c => {
    let status = 'active'
    if (solvedChallenges.includes(c._id)) status = 'solved'
    // If we're in a future round, we'll implement that logic later, 
    // for now we trust the backend only returns challenges for the active round.
    return { ...c, status, id: c._id } // map _id to id for component compatibility
  })

  const filtered = processedChallenges.filter(c => {
    const matchFilter = filter === 'all' || c.status === filter
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) 
      || (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
  }
  const item = {
    hidden: { y: 24, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">&gt; mission briefing</p>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white">Target<br /><span className="shimmer-text">Directives</span></h1>
          <p className="font-mono text-white/30 text-sm mt-2">Select a node to infiltrate and capture the flag.</p>
        </div>

        {/* Stats row */}
        <div className="flex gap-4">
          {[
            { label: 'Total', value: processedChallenges.length, color: 'text-white' },
            { label: 'Active', value: processedChallenges.filter(c => c.status === 'active').length, color: 'text-accent' },
            { label: 'Solved', value: processedChallenges.filter(c => c.status === 'solved').length, color: 'text-success' },
          ].map(s => (
            <div key={s.label} className="text-center bg-black/50 border border-white/10 rounded-xl px-5 py-3">
              <p className={`font-heading font-black text-2xl ${s.color}`}>{s.value}</p>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="font-mono text-sm text-primary/50 animate-pulse">SYNCHRONIZING WITH SERVER...</p>
        </div>
      )}

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
          <input
            type="text"
            placeholder="Search missions, categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/60 border border-primary/20 rounded-lg pl-10 pr-4 py-3 font-mono text-sm text-primary placeholder:text-primary/20 outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,255,65,0.1)] transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-black/60 border border-primary/15 rounded-lg p-1">
          {['all', 'active', 'solved', 'locked'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200',
                filter === f
                  ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,255,65,0.4)]'
                  : 'text-white/40 hover:text-primary hover:bg-primary/10'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter + search}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {filtered.map(challenge => {
            const sc = STATUS_CONFIG[challenge.status]
            const StatusIcon = sc.icon
            const diff = DIFF_CONFIG[challenge.difficulty]
            const isLocked = challenge.status === 'locked'

            return (
              <motion.div
                variants={item}
                key={challenge.id}
                onClick={() => !isLocked && navigate(`/challenges/${challenge.id}`)}
                whileHover={!isLocked ? { y: -4, scale: 1.01 } : {}}
                className={cn(
                  'relative border rounded-xl p-6 backdrop-blur-md transition-all duration-300 group overflow-hidden',
                  'bg-black/60',
                  sc.bg,
                  sc.glow,
                  isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                {/* Neon border trace on hover */}
                {!isLocked && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,255,65,0.12) 0%, transparent 60%)',
                    }}
                  />
                )}

                {/* Corner brackets */}
                <span className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/40 group-hover:border-primary/80 transition-colors" />
                <span className="absolute top-2 right-2 w-4 h-4 border-t border-r border-primary/40 group-hover:border-primary/80 transition-colors" />
                <span className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-primary/40 group-hover:border-primary/80 transition-colors" />
                <span className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/40 group-hover:border-primary/80 transition-colors" />

                <div className="relative z-10">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('px-2.5 py-1 border rounded text-[10px] font-mono font-bold uppercase tracking-wider', TYPE_COLOR[challenge.type])}>
                        {challenge.type}
                      </span>
                      <span className="px-2.5 py-1 border border-white/10 text-white/40 rounded text-[10px] font-mono uppercase tracking-wider">
                        {challenge.category}
                      </span>
                    </div>
                    <StatusIcon size={16} className={cn(sc.color, challenge.status === 'active' && 'animate-pulse')} />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-xl text-white mb-1 group-hover:text-glow transition-all">
                    {challenge.title}
                  </h3>

                  {/* Difficulty bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-[10px] uppercase tracking-wider ${diff.label}`}>
                        {challenge.difficulty}
                      </span>
                      <span className="font-mono text-[10px] text-white/30">{challenge.solves} solves</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-500', diff.bg, diff.bar,
                        'shadow-[0_0_6px_currentColor]'
                      )} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 group-hover:border-white/10 transition-colors">
                    <span className="font-mono font-black text-lg text-white/90">
                      {challenge.points} <span className="text-xs text-white/40">PTS</span>
                    </span>
                    {!isLocked && (
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-1.5 font-mono text-xs text-white/40 group-hover:text-primary transition-colors"
                      >
                        INFILTRATE <ChevronRight size={14} />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="font-terminal text-primary/30 text-3xl mb-2">NO NODES FOUND</p>
          <p className="font-mono text-white/20 text-sm">Adjust your filters or search query</p>
        </motion.div>
      )}
    </div>
  )
}

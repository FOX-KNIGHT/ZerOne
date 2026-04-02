import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Minus, Radio, Zap, Star } from 'lucide-react'
import api from '../lib/axios'
import { socket } from '../lib/socket'
import { useAppStore } from '../store/useAppStore'

// ── Matrix rain background ───────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const cols = Math.floor(canvas.width / 16)
    const drops = Array(cols).fill(1)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()αβγδεζηθ01'

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(0,255,65,0.18)'
      ctx.font = '13px JetBrains Mono, monospace'
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(ch, i * 16, drops[i] * 16)
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
    }
    const id = setInterval(draw, 50)
    return () => clearInterval(id)
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40" />
}

// ── Rank configs ─────────────────────────────────────────────────────────────
const RANK_CFG = {
  1: {
    outer: 'border-yellow-400/50 shadow-[0_0_40px_rgba(234,179,8,0.18)]',
    bg: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
    badge: 'bg-yellow-400 text-black',
    text: 'text-yellow-400',
    glow: '0 0 20px rgba(234,179,8,0.8)',
    icon: Crown,
  },
  2: {
    outer: 'border-slate-400/40 shadow-[0_0_25px_rgba(148,163,184,0.12)]',
    bg: 'from-slate-400/8 to-transparent',
    badge: 'bg-slate-300 text-black',
    text: 'text-slate-300',
    glow: '0 0 15px rgba(148,163,184,0.7)',
    icon: Medal,
  },
  3: {
    outer: 'border-orange-500/40 shadow-[0_0_25px_rgba(249,115,22,0.12)]',
    bg: 'from-orange-500/8 to-transparent',
    badge: 'bg-orange-500 text-black',
    text: 'text-orange-400',
    glow: '0 0 15px rgba(249,115,22,0.7)',
    icon: Medal,
  },
}

function RankBadge({ rank }) {
  const cfg = RANK_CFG[rank]
  const Icon = cfg?.icon
  if (rank <= 3 && Icon) {
    return (
      <motion.div
        animate={rank === 1 ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-lg flex-shrink-0 ${cfg.badge}`}
        style={{ boxShadow: cfg.glow }}
      >
        <Icon size={20} />
      </motion.div>
    )
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-white/35 flex-shrink-0">
      #{rank}
    </div>
  )
}

export default function Leaderboard() {
  const { user } = useAppStore()
  const [teams, setTeams] = useState([])
  const [prevRanks, setPrevRanks] = useState({})
  const [loading, setLoading] = useState(true)
  const [glitching, setGlitching] = useState(false)

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get('/leaderboard')
      const rankedData = data.map((t, i) => ({ ...t, rank: i + 1 }))

      // Compute rank changes
      const changes = {}
      rankedData.forEach(t => {
        const prev = prevRanks[t._id]
        if (prev === undefined) changes[t._id] = 'new'
        else if (prev > t.rank) changes[t._id] = 'up'
        else if (prev < t.rank) changes[t._id] = 'down'
        else changes[t._id] = 'same'
      })

      const newRanks = {}
      rankedData.forEach(t => { newRanks[t._id] = t.rank })

      setPrevRanks(newRanks)
      setTeams(rankedData.map(t => ({ ...t, change: changes[t._id] || 'same' })))
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    socket.on('leaderboard:update', () => {
      setGlitching(true)
      setTimeout(() => { setGlitching(false); fetchLeaderboard() }, 400)
    })
    socket.on('scoreUpdate', fetchLeaderboard)
    return () => {
      socket.off('leaderboard:update')
      socket.off('scoreUpdate')
    }
  }, [])

  return (
    <div className="relative max-w-4xl mx-auto space-y-8 pb-12">
      <MatrixRain />
      <div className="relative z-10 space-y-8">

        {/* Glitch overlay on update */}
        <AnimatePresence>
          {glitching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 pointer-events-none"
              style={{ background: 'linear-gradient(transparent 49%, rgba(0,255,65,0.06) 50%, transparent 51%)', backgroundSize: '100% 4px' }}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 mb-3 font-mono text-[10px] text-primary/50 uppercase tracking-[0.4em] bg-primary/5 border border-primary/15 px-4 py-2 rounded-full">
            <Radio size={10} className="animate-pulse" />
            LIVE ∙ REAL-TIME SCORING
          </div>
          <h1 className="font-heading font-black text-white" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
            ZerOne <span className="shimmer-text">Rankings</span>
          </h1>
          <p className="font-mono text-white/20 text-sm mt-2 tracking-wider">
            {teams.length} teams competing · Leaderboard updates automatically
          </p>
        </motion.div>

        {/* TOP 3 PODIUM */}
        {teams.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3 items-end"
          >
            {/* 2nd */}
            <PodiumCard team={teams[1]} height={120} />
            {/* 1st */}
            <PodiumCard team={teams[0]} height={170} isFirst />
            {/* 3rd */}
            <PodiumCard team={teams[2]} height={90} />
          </motion.div>
        )}

        <div className="neon-divider" />

        {/* Full Rankings */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-20">
              <div className="font-mono text-primary/40 animate-pulse">Loading leaderboard...</div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-20 terminal-box rounded-xl">
              <Trophy size={40} className="text-white/10 mx-auto mb-3" />
              <p className="font-mono text-white/20">No teams registered yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {teams.map((team, index) => {
                const cfg = RANK_CFG[team.rank]
                const isYou = team._id === user?.teamId || team.teamName === user?.teamName
                const solves = team.members?.length || 0

                return (
                  <motion.div
                    key={team._id || team.teamName}
                    layout
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05, type: 'spring', stiffness: 100 }}
                    className={`relative group flex items-center justify-between rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-300
                      p-4 hover:border-white/20
                      ${cfg ? `bg-gradient-to-r ${cfg.bg} ${cfg.outer}` : isYou ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(0,255,65,0.06)]' : 'bg-white/3 border-white/8'}
                    `}
                  >
                    {/* Scan line hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.015] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Rank number */}
                    {team.rank <= 3 && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                        style={{ background: team.rank === 1 ? '#eab308' : team.rank === 2 ? '#94a3b8' : '#f97316' }}
                      />
                    )}

                    <div className="flex items-center gap-4 pl-4">
                      <RankBadge rank={team.rank} />

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-heading font-black text-xl ${cfg?.text || (isYou ? 'text-primary' : 'text-white/90')}`}
                            style={cfg ? { textShadow: cfg.glow } : {}}>
                            {team.teamName}
                          </h3>
                          {isYou && (
                            <span className="font-mono text-[9px] bg-primary/15 text-primary px-2 py-0.5 rounded border border-primary/25 tracking-widest">
                              YOU
                            </span>
                          )}
                          {team.rank === 1 && (
                            <motion.span
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-yellow-400 text-sm"
                            >★</motion.span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-white/25 mt-0.5">
                          {solves} member{solves !== 1 ? 's' : ''} · Round {team.currentRound || 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Score */}
                      <div className="text-right">
                        <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Score</p>
                        <p className={`font-mono font-black text-2xl ${cfg?.text || (isYou ? 'text-primary' : 'text-white')}`}
                          style={cfg ? { textShadow: cfg.glow } : {}}>
                          {(team.score || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* Rank change arrow */}
                      <div className="w-7 flex justify-center">
                        {team.change === 'up' && (
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                            <TrendingUp size={16} className="text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                          </motion.div>
                        )}
                        {team.change === 'down' && (
                          <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                            <TrendingDown size={16} className="text-red-400" />
                          </motion.div>
                        )}
                        {(team.change === 'same' || team.change === 'new') && (
                          <Minus size={16} className="text-white/15" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}

function PodiumCard({ team, height, isFirst = false }) {
  const cfg = RANK_CFG[team.rank]
  const Icon = cfg?.icon || Trophy

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: team.rank === 1 ? 0 : team.rank === 2 ? 0.1 : 0.2 }}
      className="flex flex-col items-center gap-2"
    >
      {/* Avatar */}
      <motion.div
        animate={isFirst ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-heading font-black text-xl
          ${team.rank === 1 ? 'border-yellow-400 bg-yellow-400/10' :
            team.rank === 2 ? 'border-slate-400 bg-slate-400/10' :
            'border-orange-500 bg-orange-500/10'
          }`}
        style={{ boxShadow: cfg?.glow }}
      >
        <Icon size={22} className={cfg?.text} style={{ filter: `drop-shadow(${cfg?.glow})` }} />
      </motion.div>

      <p className={`font-heading font-bold text-sm text-center leading-tight ${cfg?.text}`}>
        {team.teamName}
      </p>

      {/* Podium block */}
      <div
        className={`w-full rounded-t-xl border-t border-l border-r flex flex-col items-center justify-start pt-3
          ${team.rank === 1 ? 'border-yellow-400/40 bg-gradient-to-b from-yellow-400/10 to-transparent' :
            team.rank === 2 ? 'border-slate-400/30 bg-gradient-to-b from-slate-400/8 to-transparent' :
            'border-orange-500/30 bg-gradient-to-b from-orange-500/8 to-transparent'
          }`}
        style={{ height }}
      >
        <p className={`font-mono font-black text-xl ${cfg?.text}`}>{(team.score || 0).toLocaleString()}</p>
        <p className="font-mono text-[9px] text-white/25 mt-0.5">pts</p>
        <p className={`font-mono text-[9px] mt-1 ${isFirst ? 'text-yellow-400/60' : 'text-white/20'}`}>
          #{team.rank} place
        </p>
      </div>
    </motion.div>
  )
}

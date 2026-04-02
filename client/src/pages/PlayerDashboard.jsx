import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Clock, Target, Flag, TrendingUp, Zap, ChevronRight, Users, Terminal, Shield, Copy, Check, BookOpen, KeyRound, Cpu } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { GlassCard } from '../components/ui/GlassCard'
import { Link } from 'react-router-dom'
import api from '../lib/axios'

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return setValue(0)
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

// Circular progress ring
function TimerRing({ seconds, maxSeconds }) {
  const radius = 80
  const circ = 2 * Math.PI * radius
  const frac = maxSeconds ? Math.max(0, seconds / maxSeconds) : 0
  const dash = circ * frac
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const isUrgent = seconds < 300

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" className="-rotate-90">
        <circle cx="100" cy="100" r={radius} stroke="rgba(0,255,65,0.08)" strokeWidth="6" fill="none" />
        <motion.circle
          cx="100" cy="100" r={radius}
          stroke={isUrgent ? '#ff4444' : '#00ff41'}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          style={{ filter: isUrgent ? 'drop-shadow(0 0 8px rgba(255,68,68,0.8))' : 'drop-shadow(0 0 8px rgba(0,255,65,0.6))' }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: 'linear' }}
        />
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
          const x1 = 100 + 90 * Math.cos(angle)
          const y1 = 100 + 90 * Math.sin(angle)
          const x2 = 100 + 96 * Math.cos(angle)
          const y2 = 100 + 96 * Math.sin(angle)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,255,65,0.3)" strokeWidth="2" />
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">Remaining</p>
        <motion.p
          className={`font-mono font-black text-3xl ${isUrgent ? 'text-red-400 text-glow-red' : 'text-primary text-glow'}`}
          animate={isUrgent ? { opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {h > 0 ? `${h}:` : ''}{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </motion.p>
        <p className="font-mono text-[9px] text-white/30 mt-1">ACTIVE ROUND</p>
      </div>
    </div>
  )
}

export default function PlayerDashboard() {
  const { user, timeLeft, activeRound, recentActivities } = useAppStore()
  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [roundDuration, setRoundDuration] = useState(3600)

  const scoreDisplay = useCountUp(user?.score || 0)

  // Fetch leaderboard to get real rank
  useEffect(() => {
    api.get('/leaderboard').then(r => {
      const teams = r.data
      setLeaderboard(teams)
      if (user?.teamId) {
        const idx = teams.findIndex(t => t._id === user.teamId)
        setMyRank(idx >= 0 ? idx + 1 : null)
      }
    }).catch(() => { })
  }, [user?.teamId, user?.score])

  // Fetch active round for timer max
  useEffect(() => {
    if (activeRound?.duration) setRoundDuration(activeRound.duration)
  }, [activeRound])

  const stats = [
    { label: 'Current Rank', value: myRank ? `#${myRank}` : '—', icon: Trophy, color: 'text-gold', glow: 'shadow-neon-gold' },
    { label: 'Total Score', value: scoreDisplay.toLocaleString(), icon: Target, color: 'text-primary', glow: 'shadow-neon-green' },
    { label: 'Round 2 Score', value: (user?.round2Score || 0).toString(), icon: Flag, color: 'text-accent', glow: 'shadow-neon-cyan' },
    { label: 'Round 3 Score', value: (user?.round3Score || 0).toString(), icon: TrendingUp, color: 'text-success', glow: '' },
  ]

  // Copy join code
  const [copied, setCopied] = useState(false)
  const copyCode = () => {
    if (!user?.teamCode) return
    navigator.clipboard.writeText(user.teamCode).catch(() => { })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const quickActions = [
    {
      label: 'Section 1 — Log Analysis Quiz',
      sub: '15 MCQs from system logs · +150 pts max',
      path: '/section1',
      icon: BookOpen,
      color: 'border-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(0,255,65,0.1)]',
      iconColor: 'text-green-400',
      badge: 'SECTION 1',
    },
    {
      label: 'Section 2 — Offline Round',
      sub: 'In-person · answers checked manually',
      path: '/section2',
      icon: Cpu,
      color: 'border-yellow-500/20 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)]',
      iconColor: 'text-yellow-400',
      badge: 'SEC 2',
    },
    {
      label: 'Section 3 — Cipher Challenges',
      sub: '3 challenges · hints cost points',
      path: '/section3',
      icon: Terminal,
      color: 'border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,242,255,0.1)]',
      iconColor: 'text-cyan-400',
      badge: 'SEC 3',
    },
    {
      label: 'Final Phase — Decryption',
      sub: 'All qualified teams eligible',
      path: '/final',
      icon: KeyRound,
      color: 'border-yellow-400/20 hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]',
      iconColor: 'text-yellow-400',
      badge: 'FINAL',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6"
      >
        <div className="flex-1">
          <p className="font-mono text-primary/50 text-xs uppercase tracking-widest mb-1">
            &gt; session active
          </p>
          <h1 className="font-heading font-black text-4xl md:text-6xl text-white leading-tight">
            Welcome back,{' '}
            <span className="shimmer-text">{user?.teamName || 'Agent'}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <p className="font-mono text-white/30 text-sm">
              System operational · Awaiting your commands.
            </p>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Users size={14} className="text-primary/40" />
              <span className="font-mono text-xs text-white/40 uppercase tracking-widest">
                {leaderboard.length > 0 ? `${leaderboard.length} Teams Competing` : 'Team Unit Active'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── JOIN CODE CARD ── */}
      {user?.teamCode && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard className="flex flex-col sm:flex-row items-center gap-4 py-4 px-5">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Your Team Invite Code</p>
              <p className="font-mono text-xs text-white/40">Share this with teammates so they can join your team</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-3xl text-primary tracking-[0.3em] text-glow">
                {user.teamCode}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={copyCode}
                className="p-2.5 border border-primary/20 rounded-lg text-primary/50 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
              >
                {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ── STAT PILLS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard className="card-shine flex items-center gap-4 py-4 px-5">
                <div className={`p-2.5 rounded-lg bg-black/60 border border-white/5 ${stat.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{stat.label}</p>
                  <p className={`font-heading font-black text-2xl mt-0.5 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* ── BENTO GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Card — 2/3 */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="hologram" className="h-full min-h-[280px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8 h-full">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-primary" />
                  <span className="font-mono text-xs text-primary/60 uppercase tracking-widest">Active Round</span>
                  {activeRound && <span className="w-2 h-2 bg-primary rounded-full animate-pulse ml-1" />}
                </div>

                <h2 className="font-heading font-black text-2xl md:text-3xl text-white mb-3 leading-tight">
                  {activeRound
                    ? `Round ${activeRound.roundNumber}`
                    : 'Standby — No Active Round'}
                </h2>

                <p className="font-mono text-white/40 text-sm leading-relaxed max-w-xs">
                  {activeRound
                    ? 'Complete all round objectives. Every second counts.'
                    : 'Wait for the organizer to start a round.'}
                </p>

                {activeRound && (
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                      <span className="font-mono text-xs text-success">Round Live</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Timer ring — only show if round is active */}
              {timeLeft !== null && activeRound && (
                <div className="flex-shrink-0">
                  <TimerRing seconds={timeLeft} maxSeconds={roundDuration} />
                </div>
              )}

              {!activeRound && (
                <div className="flex-shrink-0 w-[200px] h-[200px] flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-primary/10 flex items-center justify-center">
                    <Zap size={40} className="text-primary/20" />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Activity Feed — 1/3 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="h-full min-h-[280px] flex flex-col">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-primary/10">
              <Flag size={15} className="text-primary" />
              <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white">Live Captures</h2>
              <span className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {recentActivities?.length > 0 ? recentActivities.map((act, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex gap-3 items-start py-2 border-l-2 border-primary/30 pl-3 hover:border-primary transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-white/80 truncate">
                      <span className="text-primary font-bold">{act.team}</span>
                    </p>
                    <p className="font-mono text-[10px] text-white/40 mt-0.5 truncate">
                      captured <span className="text-accent">{act.challenge}</span>
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-white/25 flex-shrink-0">{act.time}</span>
                </motion.div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <Zap size={24} className="text-primary/20 mb-3" />
                  <p className="font-mono text-xs text-white/25">Monitoring cipher feeds...</p>
                  <p className="font-mono text-[10px] text-white/15 mt-1">First solves will appear here</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {quickActions.map(item => {
          const Icon = item.icon
          return (
            <Link to={item.path} key={item.label}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative border bg-black/50 rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-all duration-200 backdrop-blur-md overflow-hidden group ${item.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg bg-black/50 border border-white/5 ${item.iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded-full opacity-60 ${item.iconColor} border-current`}>
                    {item.badge}
                  </span>
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-sm leading-tight">{item.label}</p>
                  <p className="font-mono text-[10px] text-white/35 mt-1">{item.sub}</p>
                </div>
                <ChevronRight size={12} className="absolute bottom-4 right-4 text-white/15 group-hover:text-white/40 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </Link>
          )
        })}
      </motion.div>
    </div>
  )
}

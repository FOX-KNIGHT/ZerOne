import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Clock, Target, Flag, TrendingUp, Zap, ChevronRight, Copy, Check, Users } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { GlassCard } from '../components/ui/GlassCard'
import { Link } from 'react-router-dom'

function TeamCodeChip({ code, isLead }) {
  const [copied, setCopied] = useState(false)
  if (!code) return null
  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 bg-primary/5 border border-primary/25 rounded-xl px-4 py-3"
    >
      <div className="text-left">
        <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
          {isLead ? 'Your Team Code' : 'Team Code'}
        </p>
        <p className="font-terminal text-2xl text-primary text-glow tracking-[0.3em] mt-0.5">{code}</p>
      </div>
      {isLead && (
        <button onClick={copy}
          className="p-2 bg-primary/10 border border-primary/25 rounded-lg text-primary hover:bg-primary/20 transition-all flex-shrink-0"
          title="Copy team code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}
    </motion.div>
  )
}

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return
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
function TimerRing({ seconds, maxSeconds = 3600 }) {
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
        {/* Background track */}
        <circle cx="100" cy="100" r={radius} stroke="rgba(0,255,65,0.08)" strokeWidth="6" fill="none" />
        {/* Progress */}
        <motion.circle
          cx="100" cy="100" r={radius}
          stroke={isUrgent ? '#ff4444' : '#00ff41'}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          style={{
            filter: isUrgent
              ? 'drop-shadow(0 0 8px rgba(255,68,68,0.8))'
              : 'drop-shadow(0 0 8px rgba(0,255,65,0.6))',
          }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: 'linear' }}
        />
        {/* Tick marks */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
          const x1 = 100 + 90 * Math.cos(angle)
          const y1 = 100 + 90 * Math.sin(angle)
          const x2 = 100 + 96 * Math.cos(angle)
          const y2 = 100 + 96 * Math.sin(angle)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,255,65,0.3)" strokeWidth="2" />
        })}
      </svg>

      {/* Time display in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">Remaining</p>
        <motion.p
          className={`font-mono font-black text-3xl ${isUrgent ? 'text-red-400 text-glow-red' : 'text-primary text-glow'}`}
          animate={isUrgent ? { opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {h > 0 ? `${h}:` : ''}{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
        </motion.p>
        <p className="font-mono text-[9px] text-white/30 mt-1">ACTIVE ROUND</p>
      </div>
    </div>
  )
}

export default function PlayerDashboard() {
  const { user, timeLeft, activeRound, recentActivities } = useAppStore()
  const scoreDisplay = useCountUp(user?.score || 1250)
  const rankDisplay = useCountUp(4, 800)

  const stats = [
    { label: 'Current Rank', value: `#${rankDisplay}`, icon: Trophy, color: 'text-gold', glow: 'shadow-neon-gold' },
    { label: 'Total Score', value: scoreDisplay.toLocaleString(), icon: Target, color: 'text-primary', glow: 'shadow-neon-green' },
    { label: 'Flags Captured', value: '7', icon: Flag, color: 'text-accent', glow: 'shadow-neon-cyan' },
    { label: 'Solve Rate', value: '87%', icon: TrendingUp, color: 'text-success', glow: '' },
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
                Team Unit Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <TeamCodeChip code={user?.teamCode} isLead={user?.isLead} />
          <Link to="/challenges">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="h-full flex items-center justify-center gap-3 px-8 py-4 bg-primary/10 border border-primary/30 text-primary font-mono font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-primary/20 hover:shadow-neon-green transition-all"
            >
              <Zap size={16} />
              Infiltrate
              <ChevronRight size={14} />
            </motion.div>
          </Link>
        </div>
      </motion.div>

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
            {/* Background pulse */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8 h-full">
              {/* Left info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-primary" />
                  <span className="font-mono text-xs text-primary/60 uppercase tracking-widest">Active Round</span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse ml-1" />
                </div>

                <h2 className="font-heading font-black text-2xl md:text-3xl text-white mb-3 leading-tight">
                  {activeRound?.name || 'Round 1: Initial Recon'}
                </h2>

                <p className="font-mono text-white/40 text-sm leading-relaxed max-w-xs">
                  Infiltrate target systems and capture flags to earn points. Every second counts.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    <span className="font-mono text-xs text-success">Round Live</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    <span className="font-mono text-xs text-white/40">42 teams competing</span>
                  </div>
                </div>
              </div>

              {/* Timer ring */}
              <div className="flex-shrink-0">
                <TimerRing seconds={timeLeft || 3605} />
              </div>
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
                  <p className="font-mono text-xs text-white/25">Monitoring interception feeds...</p>
                  <p className="font-mono text-[10px] text-white/15 mt-1">First captures will appear here</p>
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
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'View Challenges', sub: '5 missions active', path: '/challenges', icon: Target, color: 'border-primary/20 hover:border-primary/50 hover:shadow-neon-green', iconColor: 'text-primary' },
          { label: 'Leaderboard', sub: 'Your rank: #4', path: '/leaderboard', icon: Trophy, color: 'border-gold/20 hover:border-gold/50 hover:shadow-neon-gold', iconColor: 'text-gold' },
          { label: 'Live Feed', sub: 'Real-time activity', path: '/leaderboard', icon: Zap, color: 'border-accent/20 hover:border-accent/50 hover:shadow-neon-cyan', iconColor: 'text-accent' },
        ].map(item => {
          const Icon = item.icon
          return (
            <Link to={item.path} key={item.label}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative border bg-black/50 rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-200 backdrop-blur-md overflow-hidden group ${item.color}`}
              >
                <div className={`p-3 rounded-lg bg-black/50 border border-white/5 ${item.iconColor}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-sm">{item.label}</p>
                  <p className="font-mono text-[11px] text-white/35 mt-0.5">{item.sub}</p>
                </div>
                <ChevronRight size={14} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </Link>
          )
        })}
      </motion.div>
    </div>
  )
}

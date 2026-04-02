import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'
import { Crown, Medal, Trophy, Zap, Radio } from 'lucide-react'

// ── Animated Particle System ──
const ParticleField = () => {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 15 + 10,
    delay: Math.random() * 8,
    color: i % 3 === 0 ? '#00f2ff' : i % 3 === 1 ? '#00ff41' : '#bf00ff',
  }))

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -120 - Math.random() * 100],
            opacity: [0, 0.7, 0],
            scale: [0.5, 1, 0],
          }}
          transition={{
            duration: p.speed,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// ── Rank configs ──
const RANK_CONFIG = {
  1: { gradient: 'from-yellow-500/20 via-gold/10 to-transparent', border: 'border-gold/50', glow: '0_0_50px_rgba(255,215,0,0.2)', num: 'text-gold', badge: 'bg-gold text-black', icon: Crown, label: '1ST' },
  2: { gradient: 'from-silver/15 to-transparent', border: 'border-silver/40', glow: '0_0_30px_rgba(192,192,192,0.12)', num: 'text-silver', badge: 'bg-silver text-black', icon: Medal, label: '2ND' },
  3: { gradient: 'from-bronze/15 to-transparent', border: 'border-bronze/40', glow: '0_0_30px_rgba(205,127,50,0.12)', num: 'text-bronze', badge: 'bg-bronze text-black', icon: Medal, label: '3RD' },
}

const LEADERBOARD = [
  { rank: 1, team: 'Omega Red', score: 9800, solves: 18 },
  { rank: 2, team: 'Cipher Punks', score: 8550, solves: 15 },
  { rank: 3, team: 'Null Pointers', score: 7200, solves: 13 },
  { rank: 4, team: 'Alpha Squad', score: 6900, solves: 12 },
  { rank: 5, team: 'Byte Me', score: 5400, solves: 10 },
]

const LIVE_FEED = [
  '🔥 Omega Red bypassed the Mainframe (+150 pts)',
  '⚡ Cipher Punks cracked RSA Decoding (+175 pts)',
  '🎯 Null Pointers solved SQL Injection (+100 pts)',
  '⚠️  Alpha Squad attempted Buffer Overflow (failed)',
  '🔐 Byte Me solved Social Engineering (+50 pts)',
  '🔥 Ghost Protocol unlocked new node',
]

export default function ProjectorScreen() {
  const { timeLeft, activeRound } = useAppStore()
  const [feedIndex, setFeedIndex] = useState(0)
  const [seconds, setSeconds] = useState(timeLeft || 3605)

  useEffect(() => {
    const feedTimer = setInterval(() => setFeedIndex(i => (i + 1) % LIVE_FEED.length), 4000)
    const countTimer = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => { clearInterval(feedTimer); clearInterval(countTimer) }
  }, [])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const timeStr = `${h > 0 ? `${h}:` : ''}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  const isUrgent = seconds < 300

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col select-none">
      <ParticleField />

      {/* Aurora orbs */}
      <div className="fixed top-[-20%] left-[-15%] w-[70vw] h-[70vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.12) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'aurora 15s ease-in-out infinite alternate' }}
      />
      <div className="fixed bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,242,255,0.08) 0%, transparent 70%)', filter: 'blur(130px)', animation: 'aurora 20s ease-in-out infinite alternate-reverse' }}
      />
      <div className="fixed top-[40%] left-[25%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(191,0,255,0.05) 0%, transparent 70%)', filter: 'blur(150px)', animation: 'aurora 25s ease-in-out infinite alternate' }}
      />

      {/* CRT subtle overlay */}
      <div className="fixed inset-0 z-[9997] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      {/* ── HEADER ── */}
      <header className="relative z-10 px-10 pt-8 pb-4 flex items-start justify-between">
        {/* Title */}
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading font-black leading-none"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
          >
            <span className="text-white">ZERONE</span>{' '}
            <span className="shimmer-text">CHAMPION</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-3 inline-flex items-center gap-3"
          >
            <span className="flex items-center gap-2 font-mono text-xl md:text-2xl text-accent bg-black/30 border border-accent/25 px-5 py-2 rounded-full backdrop-blur-md">
              <Radio size={16} className="animate-pulse" />
              {activeRound?.name || 'Round 2: Exploitation'}
            </span>
          </motion.div>
        </div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-right bg-black/50 border border-white/10 backdrop-blur-xl px-8 py-5 rounded-2xl"
          style={{ boxShadow: isUrgent ? '0 0 60px rgba(255,68,68,0.25)' : '0 0 40px rgba(0,0,0,0.5)' }}
        >
          <p className="font-mono text-sm text-white/40 uppercase tracking-[0.3em] mb-2">Time Remaining</p>
          <motion.p
            className={`font-mono font-black leading-none ${isUrgent ? 'text-red-400' : 'text-white'}`}
            style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              textShadow: isUrgent
                ? '0 0 30px rgba(255,68,68,0.9), 0 0 60px rgba(255,68,68,0.5)'
                : '0 0 20px rgba(255,255,255,0.2)',
            }}
            animate={isUrgent ? { opacity: [1, 0.75, 1] } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            {timeStr}
          </motion.p>
        </motion.div>
      </header>

      {/* ── LEADERBOARD ── */}
      <main className="flex-1 relative z-10 px-10 py-4 flex flex-col justify-center max-w-7xl w-full mx-auto">
        <div className="space-y-4">
          <AnimatePresence>
            {LEADERBOARD.map((team, index) => {
              const rc = RANK_CONFIG[team.rank]
              const Icon = rc?.icon || Trophy
              const isTop3 = team.rank <= 3

              return (
                <motion.div
                  key={team.team}
                  layout
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.12, type: 'spring', stiffness: 80 }}
                  className={cn(
                    'relative flex items-center justify-between rounded-2xl border backdrop-blur-md overflow-hidden',
                    'px-6 md:px-10',
                    isTop3 ? 'py-6' : 'py-4',
                    rc ? `bg-gradient-to-r ${rc.gradient} ${rc.border}` : 'bg-white/3 border-white/8',
                    index === 0 && 'scale-[1.02]'
                  )}
                  style={{ boxShadow: rc ? `${rc.glow}` : 'none' }}
                >
                  {/* Holographic shimmer for top 3 */}
                  {isTop3 && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
                        animation: `shimmer ${4 + index}s linear infinite`,
                        backgroundSize: '200% 100%',
                      }}
                    />
                  )}

                  {/* Left: Rank + Team */}
                  <div className="flex items-center gap-6 md:gap-10">
                    {/* Rank badge */}
                    <div className="flex-shrink-0">
                      {isTop3 ? (
                        <motion.div
                          animate={index === 0 ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={cn(
                            'w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-2',
                            rc.badge,
                            'shadow-[0_0_20px_currentColor]'
                          )}
                        >
                          <Icon size={28} />
                        </motion.div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-2xl text-white/40">
                          #{team.rank}
                        </div>
                      )}
                    </div>

                    {/* Team name */}
                    <div>
                      <h2
                        className={cn('font-heading font-black leading-tight', rc?.num || 'text-white/85')}
                        style={{ fontSize: isTop3 ? 'clamp(1.8rem, 4vw, 3.5rem)' : 'clamp(1.4rem, 3vw, 2.5rem)' }}
                      >
                        {team.team}
                      </h2>
                      <p className="font-mono text-sm md:text-base text-white/30 mt-1">
                        {team.solves} flags captured
                      </p>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right flex-shrink-0">
                    {isTop3 && (
                      <p className="font-mono text-xs md:text-sm text-white/30 uppercase tracking-widest mb-1">
                        {rc.label} PLACE
                      </p>
                    )}
                    <p
                      className={cn('font-mono font-black', rc?.num || 'text-white/85')}
                      style={{
                        fontSize: isTop3 ? 'clamp(2rem, 5vw, 4.5rem)' : 'clamp(1.5rem, 3vw, 3rem)',
                        textShadow: rc ? `0 0 25px currentColor` : 'none',
                      }}
                    >
                      {team.score.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* ── LIVE FEED TICKER ── */}
      <footer className="relative z-10 h-20 md:h-24 bg-black/70 border-t border-primary/20 backdrop-blur-xl flex items-center overflow-hidden">
        {/* LIVE badge */}
        <div className="absolute left-0 h-full w-32 md:w-44 bg-primary flex items-center justify-center z-20 flex-shrink-0"
          style={{ boxShadow: '20px 0 30px rgba(0,255,65,0.2)' }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
              <span className="font-mono font-black text-black text-sm md:text-base tracking-widest">LIVE</span>
            </div>
            <span className="font-mono text-black/50 text-[9px] uppercase tracking-widest">Feed</span>
          </div>
        </div>

        {/* Scrolling text */}
        <div className="pl-36 md:pl-52 pr-8 w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={feedIndex}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
              className="font-mono text-xl md:text-2xl xl:text-3xl text-white/90 whitespace-nowrap"
            >
              {LIVE_FEED[feedIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Right: event info */}
        <div className="absolute right-6 text-right hidden lg:block">
          <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest">GFG Chapter</p>
          <p className="font-mono text-xs text-white/30 mt-0.5">Zerone Champion 2024</p>
        </div>
      </footer>
    </div>
  )
}

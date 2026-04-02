import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { Crown, Medal, Trophy, Radio, Cpu, Wifi, Lock, Zap, Shield, Target, Activity, Eye, Terminal } from 'lucide-react'
import api from '../lib/axios'
import { socket } from '../lib/socket'

// ── Rank configs ─────────────────────────────────────────────────────────────
const RANK_CFG = {
  1: { icon: Crown,  label: '01', place: '1ST', badgeCls: 'bg-yellow-400 text-black', textCls: 'text-yellow-300', glow: 'rgba(234,179,8,0.5)', barColor: '#f59e0b', glowShadow: '0 0 40px rgba(234,179,8,0.8), 0 0 80px rgba(234,179,8,0.4)' },
  2: { icon: Shield, label: '02', place: '2ND', badgeCls: 'bg-slate-300 text-black',  textCls: 'text-cyan-300',   glow: 'rgba(34,211,238,0.4)', barColor: '#22d3ee', glowShadow: '0 0 30px rgba(34,211,238,0.7), 0 0 60px rgba(34,211,238,0.3)' },
  3: { icon: Target, label: '03', place: '3RD', badgeCls: 'bg-orange-500 text-black', textCls: 'text-orange-400', glow: 'rgba(249,115,22,0.4)', barColor: '#f97316', glowShadow: '0 0 25px rgba(249,115,22,0.7), 0 0 50px rgba(249,115,22,0.3)' },
}

// ── Matrix Rain Component ─────────────────────────────────────────────────────
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>{}[]|01'
function MatrixRain() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    const cols = Math.floor(canvas.width / 20)
    const drops = Array(cols).fill(1).map(() => Math.random() * -100)
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.045)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drops.forEach((y, i) => {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        const brightness = Math.random()
        if (brightness > 0.95) {
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = '#00ff41'
          ctx.shadowBlur = 8
        } else if (brightness > 0.7) {
          ctx.fillStyle = `rgba(0,255,65,${0.3 + brightness * 0.5})`
          ctx.shadowBlur = 0
        } else {
          ctx.fillStyle = `rgba(0,255,65,${0.08 + brightness * 0.15})`
          ctx.shadowBlur = 0
        }
        ctx.font = `${12 + Math.random() * 4}px "JetBrains Mono", monospace`
        ctx.fillText(char, i * 20, y * 20)
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.4 + Math.random() * 0.3
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-20" />
}

// ── Particle Burst on Score Update ───────────────────────────────────────────
function Particles({ trigger }) {
  const [particles, setParticles] = useState([])
  useEffect(() => {
    if (!trigger) return
    const pts = Array(24).fill(0).map((_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() - 0.5) * 60,
      y: 50 + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: 2 + Math.random() * 4,
      color: Math.random() > 0.5 ? '#00ff41' : '#ffd700',
      life: 1,
    }))
    setParticles(pts)
    setTimeout(() => setParticles([]), 1200)
  }, [trigger])
  return (
    <div className="fixed inset-0 z-[9996] pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 6px ${p.color}` }}
          animate={{ x: p.vx * 40, y: p.vy * 40, opacity: 0, scale: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ── Scanline & Vignette ───────────────────────────────────────────────────────
function CRTEffects() {
  return (
    <>
      <div className="fixed inset-0 z-[9998] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)'
      }} />
      <div className="fixed inset-0 z-[9997] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.75) 100%)'
      }} />
      {/* Moving scanline */}
      <motion.div
        className="fixed left-0 right-0 z-[9996] pointer-events-none h-[200px]"
        style={{ background: 'linear-gradient(0deg, transparent, rgba(0,255,65,0.025) 50%, transparent)' }}
        animate={{ top: ['-15%', '115%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </>
  )
}

// ── Hex Grid ─────────────────────────────────────────────────────────────────
function HexGrid() {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon points="30,2 56,15 56,37 30,50 4,37 4,15" fill="none" stroke="#00ff41" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  )
}

// ── Glowing Data Streams ──────────────────────────────────────────────────────
function DataStreams() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${5 + i * 12}%`,
            top: 0,
            width: '1px',
            height: '100%',
            background: `linear-gradient(to bottom, transparent, rgba(0,255,65,${0.06 + i * 0.01}), transparent)`,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2], scaleY: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}
      {/* Horizontal data pulses */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`h${i}`}
          className="absolute left-0 right-0 h-px"
          style={{
            top: `${25 + i * 25}%`,
            background: `linear-gradient(90deg, transparent, rgba(0,255,65,0.15), transparent)`,
          }}
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.2 }}
        />
      ))}
    </div>
  )
}

// ── Corner Decoration ─────────────────────────────────────────────────────────
function CornerDecor({ pos = 'tl', size = 60 }) {
  const posStyle = {
    tl: { top: 16, left: 16, borderWidth: '2px 0 0 2px' },
    tr: { top: 16, right: 16, borderWidth: '2px 2px 0 0' },
    bl: { bottom: 16, left: 16, borderWidth: '0 0 2px 2px' },
    br: { bottom: 16, right: 16, borderWidth: '0 2px 2px 0' },
  }[pos]
  return (
    <motion.div
      className="fixed z-[2] pointer-events-none"
      style={{ width: size, height: size, borderStyle: 'solid', borderColor: 'rgba(0,255,65,0.4)', borderRadius: 2, ...posStyle }}
      animate={{ opacity: [0.4, 1, 0.4], borderColor: ['rgba(0,255,65,0.3)', 'rgba(0,255,65,0.8)', 'rgba(0,255,65,0.3)'] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ── Live Badge ────────────────────────────────────────────────────────────────
function LiveBadge() {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-1.5 rounded-full"
      style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,65,0.3)', backdropFilter: 'blur(12px)' }}
      animate={{ borderColor: ['rgba(0,255,65,0.2)', 'rgba(0,255,65,0.6)', 'rgba(0,255,65,0.2)'] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.span
        className="w-2 h-2 rounded-full bg-green-400"
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <span className="font-mono text-[10px] text-green-400 tracking-[0.3em] font-bold">LIVE BROADCAST</span>
    </motion.div>
  )
}

// ── Glitch Text ───────────────────────────────────────────────────────────────
function GlitchText({ text, className = '', style = {} }) {
  const [glitching, setGlitching] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 150)
    }, 4000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])
  return (
    <span className={`relative inline-block ${className}`} style={style}>
      {text}
      {glitching && (
        <>
          <span className="absolute inset-0 text-cyan-400 opacity-70" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 40%)', transform: 'translateX(-2px)' }}>{text}</span>
          <span className="absolute inset-0 text-red-500 opacity-50" style={{ clipPath: 'polygon(0 60%, 100% 60%, 100% 100%, 0 100%)', transform: 'translateX(2px)' }}>{text}</span>
        </>
      )}
    </span>
  )
}

// ── Aurora Orbs ───────────────────────────────────────────────────────────────
function AuroraOrbs() {
  return (
    <>
      <motion.div
        className="fixed z-0 rounded-full pointer-events-none"
        style={{ top: '-20%', left: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(0,255,65,0.07) 0%, transparent 65%)', filter: 'blur(100px)' }}
        animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed z-0 rounded-full pointer-events-none"
        style={{ bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(0,80,255,0.05) 0%, transparent 65%)', filter: 'blur(120px)' }}
        animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', direction: 'alternate' }}
      />
      <motion.div
        className="fixed z-0 rounded-full pointer-events-none"
        style={{ top: '30%', left: '50%', transform: 'translateX(-50%)', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 65%)', filter: 'blur(80px)' }}
        animate={{ scale: [0.8, 1.3, 0.8] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  )
}

// ── Rank Row Component ────────────────────────────────────────────────────────
function RankRow({ team, index, isNew, maxScore }) {
  const cfg = RANK_CFG[team.rank]
  const isTop3 = team.rank <= 3
  const barWidth = maxScore > 0 ? ((team.score || 0) / maxScore) * 100 : 0
  const RankIcon = cfg?.icon

  return (
    <motion.div
      layout
      layoutId={team._id || team.teamName}
      initial={{ opacity: 0, x: -120, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.9 }}
      transition={{ duration: 0.6, delay: index * 0.07, type: 'spring', stiffness: 80, damping: 15 }}
      className="relative overflow-hidden rounded-xl"
      style={{
        border: `1px solid ${cfg ? cfg.barColor + '45' : 'rgba(255,255,255,0.07)'}`,
        background: cfg
          ? `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, ${cfg.glow.replace('0.5', '0.12').replace('0.4', '0.08')} 100%)`
          : 'rgba(255,255,255,0.03)',
        boxShadow: isTop3 ? `0 0 30px ${cfg.glow.replace('0.5', '0.15').replace('0.4', '0.1')}, inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
        padding: isTop3 ? '20px 28px' : '14px 28px',
        marginBottom: isTop3 ? 0 : 0,
      }}
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ background: cfg?.barColor || 'rgba(255,255,255,0.1)' }}
        animate={isTop3 ? { opacity: [0.6, 1, 0.6] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Progress bar underlay */}
      <div className="absolute inset-0 flex items-end pointer-events-none">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: index * 0.1 }}
          className="h-px opacity-60"
          style={{ background: `linear-gradient(90deg, ${cfg?.barColor || '#ffffff20'}, transparent)` }}
        />
      </div>

      {/* Holographic shimmer for top 3 */}
      {isTop3 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(105deg, transparent 20%, ${cfg.glow.replace('0.5', '0.06').replace('0.4', '0.04')} 50%, transparent 80%)`, backgroundSize: '200% 100%' }}
          animate={{ backgroundPosition: ['-100% 0%', '300% 0%'] }}
          transition={{ duration: 5 + index, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* NEW badge */}
      <AnimatePresence>
        {isNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-2 right-2 font-mono text-[9px] tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,255,65,0.2)', border: '1px solid rgba(0,255,65,0.5)', color: '#00ff41' }}
          >
            ↑ UPDATED
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-5">
        {/* Rank Badge */}
        {isTop3 ? (
          <motion.div
            animate={team.rank === 1 ? { scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl font-black"
            style={{
              width: isTop3 ? 88 : 64,
              height: isTop3 ? 88 : 64,
              background: `radial-gradient(circle, ${cfg.glow} 0%, rgba(0,0,0,0.8) 100%)`,
              border: `2px solid ${cfg.barColor}60`,
              boxShadow: cfg.glowShadow,
            }}
          >
            {RankIcon && <RankIcon size={isTop3 ? 28 : 20} color={cfg.barColor} />}
            <span className="font-mono text-[9px] mt-0.5 opacity-60" style={{ color: cfg.barColor }}>{cfg.place}</span>
          </motion.div>
        ) : (
          <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }}>
            #{team.rank}
          </div>
        )}

        {/* Team info */}
        <div className="flex-1 min-w-0">
          {isTop3 && cfg && (
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] mb-1 opacity-70" style={{ color: cfg.barColor }}>
              ── {cfg.label} :: {cfg.place} PLACE ──
            </p>
          )}
          <motion.h2
            className="font-black leading-tight truncate"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: isTop3 ? 'clamp(1.6rem, 3.5vw, 2.8rem)' : 'clamp(1.1rem, 2vw, 1.6rem)',
              color: cfg?.textCls ? undefined : 'rgba(255,255,255,0.8)',
              textShadow: cfg ? cfg.glowShadow.split(',')[0].replace('40px', '20px').replace('80px', '30px') : 'none',
            }}
          >
            {cfg ? <span style={{ color: cfg.barColor }}>{team.teamName}</span> : team.teamName}
          </motion.h2>
          <p className="font-mono text-[11px] mt-1 opacity-30">
            {team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? 's' : ''} &nbsp;·&nbsp; {team.solveCount || 0} solves
          </p>
        </div>

        {/* Score */}
        <div className="text-right flex-shrink-0 ml-4">
          <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-1">SCORE</p>
          <motion.p
            key={team.score}
            initial={{ scale: 1.4, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="font-black tabular-nums"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: isTop3 ? 'clamp(2rem, 4.5vw, 3.8rem)' : 'clamp(1.4rem, 2.5vw, 2rem)',
              color: cfg?.barColor || 'rgba(255,255,255,0.8)',
              textShadow: cfg ? cfg.glowShadow : 'none',
            }}
          >
            {(team.score || 0).toLocaleString()}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Projector Screen ─────────────────────────────────────────────────────
export default function ProjectorScreen() {
  const { timeLeft, activeRound } = useAppStore()
  const [teams, setTeams] = useState([])
  const [prevTeams, setPrevTeams] = useState({})
  const [newTeamIds, setNewTeamIds] = useState(new Set())
  const [feedMessages, setFeedMessages] = useState([
    { id: 0, text: '⚡ ZerOne Champion is now LIVE — Hack. Crack. Dominate.', ts: Date.now() }
  ])
  const [seconds, setSeconds] = useState(typeof timeLeft === 'number' ? timeLeft : 3600)
  const [isUrgent, setIsUrgent] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const [particleBurst, setParticleBurst] = useState(0)
  const [systemStatus, setSystemStatus] = useState('NOMINAL')
  const [hackProgress, setHackProgress] = useState(0)
  const [connectedNodes, setConnectedNodes] = useState(0)
  const alertTimer = useRef(null)
  const tickerRef = useRef(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      // Also sync the timer from the active round on first fetch
      const roundRes = await api.get('/display/round').catch(() => null)
      if (roundRes?.data?.remainingTime && !isNaN(roundRes.data.remainingTime)) {
        setSeconds(roundRes.data.remainingTime)
      }
      const { data } = await api.get('/leaderboard')
      const ranked = data.map((t, i) => ({ ...t, rank: i + 1, solveCount: t.solveCount || 0 }))
      // Track changes
      const newIds = new Set()
      ranked.forEach(t => {
        const prev = prevTeams[t._id]
        if (prev && prev.score !== t.score) newIds.add(t._id)
      })
      if (newIds.size > 0) {
        setNewTeamIds(newIds)
        setParticleBurst(p => p + 1)
        setTimeout(() => setNewTeamIds(new Set()), 4000)
      }
      const newPrev = {}
      ranked.forEach(t => { newPrev[t._id] = t })
      setPrevTeams(newPrev)
      setTeams(ranked)
    } catch {}
  }, [prevTeams])

  // Simulated system vitals animation
  useEffect(() => {
    const animateVitals = setInterval(() => {
      setHackProgress(p => (p + 1) % 101)
      setConnectedNodes(Math.floor(Math.random() * 20) + 80)
    }, 1200)
    return () => clearInterval(animateVitals)
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    const feedTimer = setInterval(fetchLeaderboard, 12000)
    const countTimer = setInterval(() => {
      setSeconds(s => {
        const next = Math.max(0, s - 1)
        setIsUrgent(next < 300)
        return next
      })
    }, 1000)

    socket.on('leaderboard:update', () => {
      setGlitch(true)
      setParticleBurst(p => p + 1)
      setSystemStatus('UPDATE RECEIVED')
      setTimeout(() => {
        setGlitch(false)
        setSystemStatus('NOMINAL')
        fetchLeaderboard()
      }, 600)
    })
    socket.on('recentSolve', (activity) => {
      const msg = activity.text || String(activity)
      setFeedMessages(prev => [{ id: Date.now(), text: `⚡ ${msg}`, ts: Date.now() }, ...prev].slice(0, 30))
    })
    socket.on('timerTick', (payload) => {
      const t = typeof payload === 'object' ? payload.remainingTime : payload
      if (typeof t === 'number' && !isNaN(t)) setSeconds(t)
    })

    // Connect socket (public projector page — no auth needed)
    if (!socket.connected) socket.connect()

    // Cycle feed messages
    const feedCycle = setInterval(() => {
      setFeedMessages(prev => {
        if (prev.length <= 1) return prev
        return [...prev.slice(1), prev[0]]
      })
    }, 5000)

    return () => {
      clearInterval(feedTimer)
      clearInterval(countTimer)
      clearInterval(feedCycle)
      socket.off('leaderboard:update')
      socket.off('recentSolve')
      socket.off('timerTick')
    }
  }, [])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const timeStr = `${h > 0 ? `${String(h).padStart(2, '0')}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  const timeFraction = seconds / (activeRound?.duration || 3600)
  const displayTeams = teams.slice(0, 9)
  const maxScore = displayTeams[0]?.score || 1

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col select-none">
      {/* Layered background effects */}
      <AuroraOrbs />
      <MatrixRain />
      <HexGrid />
      <DataStreams />
      <CRTEffects />
      <Particles trigger={particleBurst} />
      <CornerDecor pos="tl" />
      <CornerDecor pos="tr" />
      <CornerDecor pos="bl" size={40} />
      <CornerDecor pos="br" size={40} />

      {/* Global glitch flash */}
      <AnimatePresence>
        {glitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9995] pointer-events-none"
            style={{ background: 'linear-gradient(transparent 49%, rgba(0,255,65,0.15) 50%, transparent 51%)' }}
          />
        )}
      </AnimatePresence>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-10 pt-6 pb-4"
        style={{ borderBottom: '1px solid rgba(0,255,65,0.08)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>

        {/* Left: Branding */}
        <div>
          <div className="flex items-center gap-4 mb-2">
            {/* Logo Icon */}
            <motion.div
              className="rounded-xl flex items-center justify-center"
              style={{ width: 48, height: 48, background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.3)', boxShadow: '0 0 20px rgba(0,255,65,0.2)' }}
              animate={{ borderColor: ['rgba(0,255,65,0.2)', 'rgba(0,255,65,0.7)', 'rgba(0,255,65,0.2)'], boxShadow: ['0 0 10px rgba(0,255,65,0.1)', '0 0 30px rgba(0,255,65,0.4)', '0 0 10px rgba(0,255,65,0.1)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Terminal size={22} style={{ color: '#00ff41' }} />
            </motion.div>

            {/* Title */}
            <div>
              <motion.h1
                className="font-black leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}
                animate={glitch ? { x: [-3, 3, -3, 0], skewX: [-2, 2, 0] } : {}}
                transition={{ duration: 0.15 }}
              >
                ZER<GlitchText text="ONE" style={{ color: '#00ff41', textShadow: '0 0 30px rgba(0,255,65,0.9), 0 0 60px rgba(0,255,65,0.4)' }} />
              </motion.h1>
              <p className="font-mono text-[9px] text-white/20 tracking-[0.4em] uppercase mt-0.5">Champion · Live Broadcast</p>
            </div>
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <LiveBadge />
            <motion.div
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
            >
              <Radio size={10} style={{ color: '#22d3ee' }} />
              <span className="font-mono text-[9px] text-white/50 tracking-widest">
                {activeRound?.name || `ROUND ${activeRound?.roundNumber || '—'}` || 'STANDBY'}
              </span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Activity size={10} style={{ color: '#00ff41' }} />
              <span className="font-mono text-[9px] text-white/30 tracking-widest">SYS: {systemStatus}</span>
            </motion.div>
          </div>
        </div>

        {/* Center: Leaderboard title */}
        <div className="text-center hidden lg:block">
          <motion.p
            className="font-mono text-[9px] tracking-[0.5em] text-white/25 uppercase mb-1"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ── LIVE LEADERBOARD ──
          </motion.p>
          <p className="font-mono text-[11px] text-white/15 tracking-widest">
            {displayTeams.length} TEAMS · {maxScore.toLocaleString()} MAX SCORE
          </p>
        </div>

        {/* Right: Timer */}
        <motion.div
          className="text-right rounded-2xl px-8 py-4"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.5)' : 'rgba(0,255,65,0.2)'}`,
            backdropFilter: 'blur(20px)',
            boxShadow: isUrgent
              ? '0 0 60px rgba(239,68,68,0.25), inset 0 0 30px rgba(239,68,68,0.05)'
              : '0 0 40px rgba(0,255,65,0.08), inset 0 0 20px rgba(0,0,0,0.3)',
          }}
          animate={isUrgent ? {
            borderColor: ['rgba(239,68,68,0.3)', 'rgba(239,68,68,0.9)', 'rgba(239,68,68,0.3)'],
            boxShadow: ['0 0 30px rgba(239,68,68,0.1)', '0 0 80px rgba(239,68,68,0.4)', '0 0 30px rgba(239,68,68,0.1)']
          } : {}}
          transition={{ duration: 0.7, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 mb-1 justify-end">
            <Cpu size={10} style={{ color: isUrgent ? '#ef4444' : 'rgba(0,255,65,0.5)' }} />
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/25">Time Remaining</p>
          </div>
          <motion.p
            className="font-black leading-none tabular-nums"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 'clamp(2.8rem, 8vw, 6.5rem)',
              color: isUrgent ? '#ef4444' : '#ffffff',
              textShadow: isUrgent
                ? '0 0 40px rgba(239,68,68,1), 0 0 80px rgba(239,68,68,0.6)'
                : '0 0 30px rgba(255,255,255,0.2)',
            }}
            animate={isUrgent ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            {timeStr}
          </motion.p>

          {/* Mini progress bar */}
          <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', width: '100%' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: isUrgent ? '#ef4444' : '#00ff41' }}
              animate={{ width: `${Math.max(0, Math.min(100, timeFraction * 100))}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </header>

      {/* ── LEADERBOARD ──────────────────────────────────────────────────── */}
      <main className="flex-1 relative z-10 px-10 py-5 overflow-hidden">

        {/* Column headers */}
        {displayTeams.length > 0 && (
          <div className="flex items-center justify-between px-8 mb-3">
            <div className="flex items-center gap-5">
              <span className="w-14 text-center font-mono text-[9px] text-white/20 uppercase tracking-widest">RANK</span>
              <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest ml-5">TEAM</span>
            </div>
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest mr-2">SCORE</span>
          </div>
        )}

        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {displayTeams.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 flex flex-col items-center gap-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ border: '2px dashed rgba(0,255,65,0.2)' }}
                >
                  <Eye size={24} style={{ color: 'rgba(0,255,65,0.3)' }} />
                </motion.div>
                <div>
                  <p className="font-mono text-2xl text-white/20 tracking-widest">AWAITING TEAMS...</p>
                  <motion.p
                    className="font-mono text-sm text-white/10 tracking-widest mt-2"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    SCANNING NETWORK FOR PARTICIPANTS
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              displayTeams.map((team, index) => (
                <RankRow
                  key={team._id || team.teamName}
                  team={team}
                  index={index}
                  isNew={newTeamIds.has(team._id)}
                  maxScore={maxScore}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── LIVE FEED TICKER ─────────────────────────────────────────────── */}
      <footer
        className="relative z-10 flex items-center overflow-hidden"
        style={{
          height: 72,
          background: 'rgba(0,0,0,0.9)',
          borderTop: '1px solid rgba(0,255,65,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* LIVE badge */}
        <motion.div
          className="absolute left-0 h-full flex items-center justify-center z-20 flex-shrink-0"
          style={{
            width: 160,
            background: '#00ff41',
            clipPath: 'polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%)',
            boxShadow: '20px 0 50px rgba(0,255,65,0.3)',
          }}
          animate={{ filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-center pl-4 pr-8">
            <div className="flex items-center gap-1.5 mb-0.5">
              <motion.span className="w-1.5 h-1.5 bg-black rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
              <span className="font-mono font-black text-black text-sm tracking-widest">LIVE</span>
            </div>
            <span className="font-mono text-black/40 text-[8px] uppercase tracking-widest">FEED</span>
          </div>
        </motion.div>

        {/* Scrolling message */}
        <div className="pl-44 pr-4 flex-1 overflow-hidden relative flex items-center">
          {/* Separator lines */}
          <div className="absolute left-44 top-1/4 bottom-1/4 w-px bg-white/10" />

          <AnimatePresence mode="wait">
            <motion.p
              key={feedMessages[0]?.id}
              initial={{ y: 32, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -32, opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-mono text-lg text-white/75 whitespace-nowrap tracking-wide pl-6"
            >
              {feedMessages[0]?.text || '⚡ ZerOne Champion is broadcasting live...'}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Right: System stats */}
        <div className="absolute right-8 flex items-center gap-6 text-right">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Wifi size={9} style={{ color: 'rgba(0,255,65,0.4)' }} />
              <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest">NODES ONLINE</p>
            </div>
            <motion.p
              className="font-mono text-sm font-bold"
              style={{ color: 'rgba(0,255,65,0.6)' }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {connectedNodes}
            </motion.p>
          </div>
          <div className="text-right hidden xl:block">
            <p className="font-mono text-[7px] text-white/15 uppercase tracking-widest">GFG Chapter</p>
            <p className="font-mono text-[8px] mt-0.5" style={{ color: 'rgba(0,255,65,0.25)' }}>ZerOne Champion 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

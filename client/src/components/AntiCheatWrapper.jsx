import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Maximize2, ShieldX } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useNavigate } from 'react-router-dom'
import { socket } from '../lib/socket'

// ─── Fullscreen helpers ────────────────────────────────────────────────────────
const requestFS = (el) => {
  if (el.requestFullscreen)       return el.requestFullscreen()
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen()
  if (el.mozRequestFullScreen)    return el.mozRequestFullScreen()
  if (el.msRequestFullscreen)     return el.msRequestFullscreen()
  return Promise.reject(new Error('Fullscreen API not supported'))
}

const getFullscreenElement = () =>
  document.fullscreenElement ||
  document.webkitFullscreenElement ||
  document.mozFullScreenElement ||
  document.msFullscreenElement ||
  null

// ─── Termination overlay ──────────────────────────────────────────────────────
function TerminationScreen({ reason }) {
  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-red-950/30 animate-pulse" />
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,0,0,0.4) 0,rgba(255,0,0,0.4) 1px,transparent 1px,transparent 4px)' }}
      />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg w-full"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="w-28 h-28 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(255,0,0,0.5)]"
        >
          <ShieldX size={56} className="text-red-500" />
        </motion.div>

        <h1 className="text-5xl font-black uppercase tracking-widest text-red-500 mb-3" style={{ fontFamily: 'monospace' }}>
          DISQUALIFIED
        </h1>

        <div className="inline-block px-5 py-2 bg-red-500 text-black font-mono text-xs uppercase tracking-[0.3em] mb-4">
          FULLSCREEN VIOLATION
        </div>

        <div className="font-mono text-sm text-white/60 border border-red-500/20 bg-red-500/5 px-6 py-3 mb-8 max-w-sm">
          {reason || 'You exited fullscreen. Your team has been permanently disqualified from this competition.'}
        </div>

        <p className="font-mono text-xs text-white/30 uppercase tracking-widest animate-pulse">
          Redirecting to login…
        </p>
      </motion.div>
    </div>
  )
}

// ─── Fullscreen prompt (shown on dashboard entry) ─────────────────────────────
function FullscreenPrompt({ onEnter, entering }) {
  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,255,65,0.07) 0%, transparent 70%)' }}
      />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,rgba(0,255,65,0.3) 0,rgba(0,255,65,0.3) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(0,255,65,0.3) 0,rgba(0,255,65,0.3) 1px,transparent 1px,transparent 40px)',
        }}
      />

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-md w-full mx-4 bg-black/95 border border-[#00ff41]/30 rounded-3xl p-10 shadow-[0_0_80px_rgba(0,255,65,0.1)] backdrop-blur-xl"
      >
        {[
          'top-0 left-0 border-t-2 border-l-2',
          'top-0 right-0 border-t-2 border-r-2',
          'bottom-0 left-0 border-b-2 border-l-2',
          'bottom-0 right-0 border-b-2 border-r-2',
        ].map((cls, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            className={`absolute w-10 h-10 border-[#00ff41] ${cls}`}
          />
        ))}

        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-[#00ff41]/10 border border-[#00ff41]/40 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,255,65,0.2)]"
          >
            <Maximize2 size={36} className="text-[#00ff41]" />
          </motion.div>

          <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2" style={{ fontFamily: 'monospace' }}>
            Secure Mode Required
          </h2>
          <p className="font-mono text-xs text-[#00ff41]/60 uppercase tracking-[0.2em] mb-8">
            Competition environment lockdown
          </p>

          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-3">
            <p className="font-mono text-[11px] text-white/70 leading-relaxed">
              ⚡ The game will enter{' '}
              <span className="text-white font-bold">FULLSCREEN MODE</span>{' '}
              automatically when you click the button below.
            </p>
            <p className="font-mono text-[11px] text-red-400 leading-relaxed font-semibold">
              ⛔ Exiting fullscreen at any time will{' '}
              <span className="font-black">PERMANENTLY DISQUALIFY</span>{' '}
              your entire team.
            </p>
          </div>

          <motion.button
            id="anticheat-enter-btn"
            onClick={onEnter}
            disabled={entering}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-5 border-2 border-[#00ff41] text-[#00ff41] font-mono text-lg uppercase tracking-[0.3em] hover:bg-[#00ff41] hover:text-black transition-all duration-200 shadow-[0_0_30px_rgba(0,255,65,0.25)] rounded-lg disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <Maximize2 size={22} />
            {entering ? 'Entering Fullscreen…' : 'Enter Fullscreen & Start'}
          </motion.button>
        </div>
      </motion.div>

      <p className="mt-8 font-mono text-[10px] text-white/20 uppercase tracking-[0.3em] animate-pulse">
        ZerOne · Secure Environment Enforcer — Fullscreen exit = Permanent Disqualification
      </p>
    </div>
  )
}

// ─── Main AntiCheatWrapper ────────────────────────────────────────────────────
export default function AntiCheatWrapper({ children }) {
  const user          = useAppStore((s) => s.user)
  const logout        = useAppStore((s) => s.logout)
  const selfDisqualify = useAppStore((s) => s.selfDisqualify)
  const navigate      = useNavigate()

  // 'idle' | 'prompt' | 'entering' | 'active' | 'terminated'
  const [phase, setPhase]           = useState('idle')
  const terminatedRef               = useRef(false)

  // Skip anti-cheat for ALL admin roles
  const isAdmin = ['superadmin', 'judge', 'admin'].includes(user?.role)

  // ── Terminate: calls backend to disqualify in MongoDB, then shows screen ──
  const terminate = useCallback(
    async (reason = 'FULLSCREEN VIOLATION DETECTED') => {
      if (terminatedRef.current) return
      terminatedRef.current = true

      setPhase('terminated')

      // 1. Mark disqualified in MongoDB (fire-and-forget — we're about to log out)
      await selfDisqualify()

      // 2. Notify all socket clients (admin sees it live)
      try {
        socket.emit('playerDisqualified', {
          userId:   user?.id,
          teamId:   user?.teamId,
          teamName: user?.teamName,
          reason,
        })
      } catch (_) {}

      // 3. Clear local session
      logout()

      // 4. Redirect after brief visual (let the "DISQUALIFIED" screen be seen)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    },
    [user, logout, selfDisqualify, navigate]
  )

  // ── Listen for fullscreen changes once active ─────────────────────────────
  useEffect(() => {
    if (isAdmin) return

    const onFSChange = () => {
      if (!getFullscreenElement() && phase === 'active') {
        terminate('You exited fullscreen. Your team has been permanently disqualified from this competition.')
      }
    }

    document.addEventListener('fullscreenchange',       onFSChange)
    document.addEventListener('webkitfullscreenchange', onFSChange)
    document.addEventListener('mozfullscreenchange',    onFSChange)
    document.addEventListener('MSFullscreenChange',     onFSChange)

    return () => {
      document.removeEventListener('fullscreenchange',       onFSChange)
      document.removeEventListener('webkitfullscreenchange', onFSChange)
      document.removeEventListener('mozfullscreenchange',    onFSChange)
      document.removeEventListener('MSFullscreenChange',     onFSChange)
    }
  }, [phase, terminate, isAdmin])

  // ── On mount: show prompt if not already fullscreen ───────────────────────
  useEffect(() => {
    if (isAdmin) return
    if (getFullscreenElement()) {
      setPhase('active')
    } else {
      setPhase('prompt')
    }
  }, [isAdmin])

  // ── Handle "Enter Fullscreen & Start" click ───────────────────────────────
  const handleEnterFullscreen = useCallback(async () => {
    setPhase('entering')
    try {
      await requestFS(document.documentElement)
      setPhase('active')
    } catch (err) {
      console.error('Fullscreen request failed:', err)
      setPhase('prompt')
    }
  }, [])

  // ── Admin bypass ──────────────────────────────────────────────────────────
  if (isAdmin) return children

  // ── Terminated overlay ────────────────────────────────────────────────────
  if (phase === 'terminated') {
    return <TerminationScreen reason="You exited fullscreen. Your team has been permanently disqualified from this competition." />
  }

  // ── Prompt / Entering ─────────────────────────────────────────────────────
  if (phase === 'prompt' || phase === 'entering') {
    return <FullscreenPrompt onEnter={handleEnterFullscreen} entering={phase === 'entering'} />
  }

  // ── Active ────────────────────────────────────────────────────────────────
  if (phase === 'active' || phase === 'idle') {
    return children
  }

  return null
}

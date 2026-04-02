import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertOctagon, Maximize, ShieldOff, Lock, AlertTriangle, Terminal } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useNavigate } from 'react-router-dom'
import { socket } from '../lib/socket'
import { GlassCard } from './ui/GlassCard'

// Animated warning grid background
const WarningGrid = () => (
  <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(255,68,68,0.4) 0px, rgba(255,68,68,0.4) 1px, transparent 1px, transparent 40px),
          repeating-linear-gradient(90deg, rgba(255,68,68,0.4) 0px, rgba(255,68,68,0.4) 1px, transparent 1px, transparent 40px)
        `,
      }}
    />
  </div>
)

// Glitch text effect
const GlitchText = ({ text, className }) => (
  <div className={`relative font-heading font-black ${className}`} data-text={text}>
    <span className="relative z-10">{text}</span>
    <span
      className="absolute top-0 left-0 w-full"
      style={{
        color: '#00f2ff',
        clipPath: 'polygon(0 10%, 100% 10%, 100% 45%, 0 45%)',
        animation: 'glitch-before 2.5s infinite',
        transform: 'translateX(-2px)',
      }}
    >{text}</span>
    <span
      className="absolute top-0 left-0 w-full"
      style={{
        color: '#ff00a0',
        clipPath: 'polygon(0 55%, 100% 55%, 100% 90%, 0 90%)',
        animation: 'glitch-after 2.5s infinite',
        transform: 'translateX(2px)',
      }}
    >{text}</span>
  </div>
)

export default function AntiCheatWrapper({ children }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [countdown, setCountdown] = useState(2)
  
  const user = useAppStore(state => state.user)
  const logout = useAppStore(state => state.logout)
  const isDisqualified = useAppStore(state => state.isDisqualified)
  const disqualifyReason = useAppStore(state => state.disqualifyReason)
  const setGlobalDisqualified = useAppStore(state => state.setGlobalDisqualified)
  const cheatWarnings = useAppStore(state => state.cheatWarnings)
  const incrementWarning = useAppStore(state => state.incrementWarning)

  const navigate = useNavigate()

  // Helper to check if window is effectively fullscreen (Web API or F11 window bounds)
  const isCurrentlyFullscreen = useCallback(() => {
    const isApiFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
    // Tolerance of 2px to handle possible subpixel rounding or border sizes in OS
    const isWindowFullscreen = Math.abs(window.innerHeight - window.screen.height) <= 2 && Math.abs(window.innerWidth - window.screen.width) <= 2;
    return isApiFullscreen || isWindowFullscreen;
  }, [])

  const triggerDisqualification = useCallback((reasonKey) => {
    // Admins and non-logged-in users are exempt
    if (user?.role === 'admin' || !user || isDisqualified) return

    const reasonMap = {
      EXIT_FULLSCREEN: 'CRITICAL: Fullscreen Mode Terminated',
      TAB_SWITCH: 'DETECTION: Unauthorized Tab Switch / Window Blur',
      RESIZE: 'SECURITY: Browser Window Resize Detected',
      CONTEXT_MENU: 'PROTOCOL: Unauthorized Inspection Attempt (Right-Click)',
    }

    const reason = reasonMap[reasonKey] || 'Protocol Violation'

    // Instant Disqualification and logout
    setGlobalDisqualified(true, reason)
    socket.emit('playerDisqualified', { 
      userId: user?.id, 
      teamId: user?.teamId, 
      teamName: user?.teamName, 
      reason 
    })

    // Instant termination sequence
    logout()
    try { window.close() } catch (e) {} // Attempt to close current tab
    navigate('/login')
    setTimeout(() => setGlobalDisqualified(false, null), 1000)

  }, [user, isDisqualified, setGlobalDisqualified, logout, navigate])

  useEffect(() => {
    // Initial sync
    if (isCurrentlyFullscreen()) {
      setIsFullscreen(true)
    }

    const handleFullscreenChange = () => {
      const active = isCurrentlyFullscreen()
      if (!active && isFullscreen) {
        triggerDisqualification('EXIT_FULLSCREEN')
      } else if (active && !isFullscreen) {
        setIsFullscreen(true)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && isFullscreen) {
        triggerDisqualification('TAB_SWITCH')
      }
    }

    const handleBlur = () => {
      if (isFullscreen) {
        triggerDisqualification('TAB_SWITCH')
      }
    }

    const handleResize = () => {
      const active = isCurrentlyFullscreen()
      
      if (!isFullscreen && active) {
        setIsFullscreen(true)
      } else if (isFullscreen && !active) {
        triggerDisqualification('RESIZE')
      }
    }

    const handleContextMenu = (e) => {
      if (isFullscreen) {
        e.preventDefault()
        triggerDisqualification('CONTEXT_MENU')
      }
    }

    const handleKeyDown = (e) => {
      // Block common devtools keys
      if (isFullscreen && (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.key === 'F12') ||
        (e.ctrlKey && e.key === 'u')
      )) {
        e.preventDefault()
        triggerDisqualification('CONTEXT_MENU')
      }
    }

    // Add listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)

    // Check every second as a fallback for F11/System changes that don't fire events
    const pollInterval = setInterval(() => {
      if (isFullscreen && !isCurrentlyFullscreen()) {
        triggerDisqualification('EXIT_FULLSCREEN')
      } else if (!isFullscreen && isCurrentlyFullscreen()) {
        setIsFullscreen(true)
      }
    }, 1000)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      clearInterval(pollInterval)
    }
  }, [isFullscreen, isCurrentlyFullscreen, triggerDisqualification])

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen()
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen()
      }
      setIsFullscreen(true)
    } catch (err) {
      console.error('Fullscreen initialization failed:', err)
    }
  }

  // ── 0. ADMIN BYPASS — no anti-cheat for admin role ──
  if (user?.role === 'admin') return children

  // ── 1. DISQUALIFIED / VIOLATION SCREEN (Skipped now directly to login, but safe to keep) ──
  if (isDisqualified) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-red-950/20 animate-pulse" />
        <WarningGrid />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 max-w-xl w-full bg-black/90 border-2 border-red-500 rounded-3xl p-12 backdrop-blur-2xl shadow-[0_0_100px_rgba(255,0,0,0.4)]"
        >
          {/* Pulsing hazard border */}
          <div className="absolute -inset-1 rounded-3xl border border-red-500/50 animate-ping opacity-20" />

          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="w-28 h-28 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center shadow-[0_0_50px_rgba(255,0,0,0.5)]">
              <ShieldOff size={56} className="text-red-500" />
            </div>
          </motion.div>

          <GlitchText text="SYSTEM COMPROMISED" className="text-4xl md:text-5xl text-red-500 mb-4" />

          <div className="inline-block px-4 py-1.5 bg-red-500 text-black font-terminal text-xs uppercase tracking-widest mb-6">
            Terminating Connection immediately... 
          </div>

        </motion.div>
      </div>
    )
  }

  // ── 2. INITIAL LOCKDOWN PROMPT (BEFORE START) ──
  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,255,65,0.1) 0%, transparent 80%)' }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

        <motion.div
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="relative max-w-lg w-full bg-black/95 border border-primary/30 rounded-3xl p-10 backdrop-blur-xl shadow-[0_0_80px_rgba(0,255,65,0.1)]"
        >
          {/* Animated brackets */}
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary" />

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mb-8 animate-float">
              <Lock size={36} className="text-primary shadow-neon-green" />
            </div>

            <h2 className="font-heading font-black text-3xl text-white mb-2 tracking-tight uppercase">
              Secure Environment Req.
            </h2>
            <div className="flex items-center gap-2 mb-6">
              <Terminal size={14} className="text-primary/50" />
              <p className="font-mono text-[11px] text-primary/60 uppercase tracking-[0.2em]">
                System Override Ready
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-4">
              <div className="flex gap-4">
                <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-1" />
                <p className="font-mono text-xs text-white/70 leading-relaxed">
                  You are about to enter a <span className="text-white font-bold">STRICT LOCKDOWN</span> environment. 
                  Press <span className="text-primary font-bold">F11 atau Fn+F11</span> or use the button below to continue.
                </p>
              </div>
              <div className="flex gap-4">
                <AlertOctagon size={20} className="text-red-500 flex-shrink-0 mt-1" />
                <p className="font-mono text-xs text-red-500/80 leading-relaxed italic">
                  Pressing ESC, switching tabs, right-clicking, or exiting Fullscreen will result in <span className="font-black">INSTANT DISQUALIFICATION</span> and termination of the session.
                </p>
              </div>
            </div>

            <motion.button
              onClick={enterFullscreen}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-transparent border-2 border-primary text-primary font-terminal text-xl uppercase tracking-[0.3em] hover:bg-primary hover:text-black transition-all shadow-[0_0_30px_rgba(0,255,65,0.2)] flex items-center justify-center gap-4"
            >
              <Maximize size={24} />
              INITIALIZE LOCKDOWN
            </motion.button>
          </div>
        </motion.div>

        <p className="mt-10 font-mono text-[10px] text-white/20 uppercase tracking-[0.3em] animate-pulse">
          Authorized Nodes Only • GFG-CHAMPION-ENFORCER
        </p>
      </div>
    )
  }

  return children
}

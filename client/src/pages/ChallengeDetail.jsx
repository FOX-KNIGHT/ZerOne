import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, KeySquare, HelpCircle, AlertTriangle, ShieldCheck, Terminal, Cpu, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { NeonInput } from '../components/ui/NeonInput'
import { AnimatedButton } from '../components/ui/AnimatedButton'
import { cn } from '../lib/utils'

const CHALLENGE = {
  id: 1,
  title: 'Bypass Mainframe',
  type: 'CTF',
  points: 150,
  status: 'active',
  difficulty: 'Hard',
  category: 'Exploit',
  description: 'The central core requires an access token encoded in base64. It is encrypted behind a basic shift cipher. Find the key and unlock the matrix. The token was generated on a specific day — think carefully about the temporal offset.',
  hint: 'Think Caesar but advanced. The shift is based on the day of the week the system was built.',
  hintCost: 20,
}

// Particle burst on solve
const SolvedOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-xl overflow-hidden"
  >
    {/* Particle rings */}
    {[1, 2, 3].map(i => (
      <motion.div
        key={i}
        className="absolute rounded-full border-2 border-success"
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: i * 2, opacity: 0 }}
        transition={{ delay: i * 0.15, duration: 1, ease: 'easeOut' }}
        style={{ width: 60, height: 60 }}
      />
    ))}

    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
      className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(0,255,65,0.4)]"
    >
      <ShieldCheck size={36} className="text-success" />
    </motion.div>

    <motion.h2
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="font-heading font-black text-3xl text-success text-glow"
    >
      NODE COMPROMISED
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="font-mono text-white/50 text-sm mt-2"
    >
      +{CHALLENGE.points} pts added to your team
    </motion.p>
  </motion.div>
)

export default function ChallengeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [flag, setFlag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [solved, setSolved] = useState(false)
  const [showHintModal, setShowHintModal] = useState(false)
  const [hintUnlocked, setHintUnlocked] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      if (flag.toLowerCase() === 'zerone_core_hacked') {
        setSolved(true)
        toast.success('FLAG ACCEPTED — Node compromised!', {
          style: { background: '#000', border: '1px solid rgba(0,255,65,0.5)', color: '#00ff41', fontFamily: 'JetBrains Mono' }
        })
      } else {
        setAttempts(a => a + 1)
        toast.error('ACCESS DENIED — Invalid signature.', {
          style: { background: '#000', border: '1px solid rgba(255,68,68,0.5)', color: '#ff4444', fontFamily: 'JetBrains Mono' }
        })
        const el = document.getElementById('flag-form')
        if (el) {
          el.style.animation = 'none'
          requestAnimationFrame(() => { el.style.animation = 'shake 0.5s ease-in-out' })
        }
      }
      setSubmitting(false)
    }, 1200)
  }

  const unlockHint = () => {
    setHintUnlocked(true)
    setShowHintModal(false)
    toast('Classified intel authorized. Points deducted.', {
      icon: '⚠️',
      style: { background: '#000', border: '1px solid rgba(255,170,0,0.5)', color: '#ffaa00', fontFamily: 'JetBrains Mono' }
    })
  }

  const diffColor = { Easy: 'text-success', Medium: 'text-warning', Hard: 'text-red-400', Extreme: 'text-red-600' }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/challenges')}
        className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors group font-mono text-sm"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Return to Directives
      </motion.button>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ─ LEFT: Challenge Info (3/5) ─ */}
        <motion.div
          className="lg:col-span-3 space-y-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Header card */}
          <div className="relative border border-primary/20 bg-black/70 rounded-xl p-7 backdrop-blur-md overflow-hidden">
            <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary/60" />
            <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary/60" />
            <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary/60" />
            <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary/60" />

            {/* Top badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="px-3 py-1 bg-accent/10 border border-accent/30 text-accent text-xs font-mono font-bold uppercase tracking-wider rounded">
                {CHALLENGE.type}
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/50 text-xs font-mono uppercase tracking-wider rounded">
                {CHALLENGE.category}
              </span>
              <span className={cn('px-3 py-1 bg-black/50 border border-white/10 text-xs font-mono font-bold uppercase tracking-wider rounded', diffColor[CHALLENGE.difficulty])}>
                {CHALLENGE.difficulty}
              </span>
            </div>

            <h1 className="font-heading font-black text-3xl md:text-4xl text-white mb-2">{CHALLENGE.title}</h1>

            <div className="flex items-center gap-4 mt-3">
              <span className="font-mono font-black text-2xl text-primary text-glow">{CHALLENGE.points} PTS</span>
              {attempts > 0 && (
                <span className="font-mono text-xs text-red-400/70 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                  {attempts} failed attempt{attempts > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Description terminal */}
          <div className="relative border border-primary/15 bg-black/80 rounded-xl overflow-hidden">
            {/* Terminal bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-primary/10 bg-primary/5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-xs text-primary/40 ml-2">mission_briefing.txt</span>
              <Terminal size={12} className="ml-auto text-primary/30" />
            </div>

            <div className="p-6 font-mono text-sm text-white/70 leading-relaxed">
              <span className="text-primary/50 mr-3">&gt;</span>
              {CHALLENGE.description}
            </div>
          </div>

          {/* Hint system */}
          <AnimatePresence mode="wait">
            {!hintUnlocked ? (
              <motion.div key="hint-locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <button
                  onClick={() => setShowHintModal(true)}
                  className="flex items-center gap-3 w-full px-5 py-4 bg-warning/5 border border-warning/20 rounded-xl text-warning/70 hover:text-warning hover:border-warning/40 hover:bg-warning/10 transition-all font-mono text-sm group"
                >
                  <HelpCircle size={16} className="group-hover:animate-pulse" />
                  Request Classified Intel
                  <span className="ml-auto text-xs opacity-60">−{CHALLENGE.hintCost} PTS</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="hint-revealed"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border border-warning/25 bg-warning/5 rounded-xl p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-warning/10 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-warning" />
                  <span className="font-mono text-xs text-warning uppercase tracking-widest font-bold">Classified Intel</span>
                </div>
                <p className="font-mono text-sm text-white/80 leading-relaxed">{CHALLENGE.hint}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─ RIGHT: Flag Terminal (2/5) ─ */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative border border-primary/20 bg-black/80 rounded-xl overflow-hidden backdrop-blur-md sticky top-24">
            {solved && <SolvedOverlay />}

            {/* Terminal header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-primary/15 bg-primary/5">
              <Cpu size={14} className="text-primary" />
              <span className="font-mono text-xs text-primary/60">flag_submission.sh</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[10px] text-primary/40">ACTIVE</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Icon */}
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <KeySquare size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-mono font-bold text-sm text-white uppercase tracking-wider">Submit Flag</p>
                  <p className="font-mono text-[11px] text-white/30 mt-0.5">Format: zerone{'{...}'}</p>
                </div>
              </div>

              {/* Form */}
              <form id="flag-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-mono text-xs text-primary/50 uppercase tracking-widest block mb-2">
                    &gt; Enter Payload:
                  </label>
                  <NeonInput
                    placeholder="zerone{...}"
                    value={flag}
                    onChange={e => setFlag(e.target.value)}
                    disabled={solved || submitting}
                    required
                    className="text-base tracking-wider"
                  />
                </div>

                <AnimatedButton
                  type="submit"
                  disabled={solved || submitting}
                  className="w-full py-4"
                >
                  {submitting ? '[ VERIFYING... ]' : '[ EXECUTE PAYLOAD ]'}
                </AnimatedButton>
              </form>

              {/* Attempts tracker */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[10px] text-white/25 uppercase">Integrity Check</span>
                  <span className="font-mono text-[10px] text-white/25">{attempts}/10 attempts</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-success via-warning to-error rounded-full"
                    style={{ width: `${(attempts / 10) * 100}%` }}
                    animate={{ width: `${(attempts / 10) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Solved state details */}
              {solved && (
                <div className="pt-4 border-t border-success/20 text-center space-y-2">
                  <p className="font-mono text-xs text-success/70">Challenge completed successfully</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hint modal */}
      <AnimatePresence>
        {showHintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-black/95 border border-warning/40 rounded-2xl p-7 shadow-[0_0_60px_rgba(255,170,0,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 blur-3xl rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-warning/10 border border-warning/30 rounded-lg">
                  <AlertTriangle size={18} className="text-warning" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-warning">Authorization Required</h3>
                  <p className="font-mono text-xs text-white/30 mt-0.5">Classified Intel Request</p>
                </div>
              </div>

              <p className="font-mono text-sm text-white/70 leading-relaxed mb-7">
                Accessing this intel will deduct{' '}
                <span className="font-black text-warning">{CHALLENGE.hintCost} pts</span>{' '}
                from your team's total score. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <AnimatedButton variant="ghost" className="flex-1" onClick={() => setShowHintModal(false)}>
                  Cancel
                </AnimatedButton>
                <AnimatedButton variant="gold" className="flex-1" onClick={unlockHint}>
                  Authorize
                </AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

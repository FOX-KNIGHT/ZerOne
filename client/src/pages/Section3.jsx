import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Lock, CheckCircle2, XCircle, Send, AlertTriangle, Trophy, Zap, Shield, Code2 } from 'lucide-react'
import api from '../lib/axios'
import { useAppStore } from '../store/useAppStore'
import { GlassCard } from '../components/ui/GlassCard'

const CATEGORY_ICONS = { Steganography: Shield, Encoding: Code2, Cryptography: Zap }
const DIFFICULTY_COLORS = { Easy: 'text-green-400 border-green-500/30 bg-green-500/8', Medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/8', Hard: 'text-red-400 border-red-500/30 bg-red-500/8' }
const HINT_PERCENT = { 1: '30%', 2: '50%', 3: '70%' }
const HINT_COSTS   = { 1: 10, 2: 20, 3: 30 }

function HintButton({ hint, challengeIndex, onUnlock, disabled }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    if (hint.unlocked) return
    setConfirming(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    setConfirming(false)
    await onUnlock(challengeIndex, hint.level)
    setLoading(false)
  }

  if (hint.unlocked) {
    return (
      <div className="p-3 bg-cyan-500/8 border border-cyan-500/25 rounded-lg space-y-2">
        <div className="flex items-center gap-2">
          <Lightbulb size={12} className="text-cyan-400 flex-shrink-0" />
          <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">
            Hint {hint.level} — {HINT_PERCENT[hint.level]} Solution
          </span>
          <CheckCircle2 size={10} className="text-cyan-400 ml-auto" />
        </div>
        <p className="font-mono text-xs text-cyan-200/80 leading-relaxed">{hint.text}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        {confirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-yellow-500/8 border border-yellow-500/30 rounded-lg"
          >
            <p className="font-mono text-xs text-yellow-400 mb-3">
              <AlertTriangle size={11} className="inline mr-1" />
              Spend <span className="font-black">−{HINT_COSTS[hint.level]} pts</span> to reveal Hint {hint.level}?
            </p>
            <div className="flex gap-2">
              <button onClick={handleConfirm} className="flex-1 py-1.5 bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 font-mono text-xs rounded-lg hover:bg-yellow-500/25 transition-all">
                Confirm
              </button>
              <button onClick={() => setConfirming(false)} className="flex-1 py-1.5 border border-white/10 text-white/40 font-mono text-xs rounded-lg hover:border-white/20 transition-all">
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClick}
            disabled={disabled || loading}
            className="w-full flex items-center gap-2 p-3 border border-white/8 rounded-lg text-left hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all group disabled:opacity-40"
          >
            <Lock size={11} className="text-white/30 group-hover:text-yellow-400 transition-colors flex-shrink-0" />
            <div className="flex-1">
              <span className="font-mono text-[10px] text-white/40 group-hover:text-yellow-400 uppercase tracking-widest">
                Hint {hint.level} — {HINT_PERCENT[hint.level]} Solution
              </span>
            </div>
            <span className="font-mono text-[10px] text-red-400 font-black">−{HINT_COSTS[hint.level]} pts</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChallengeCard({ challenge, onUnlockHint, onSubmit }) {
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(true)

  const Icon = CATEGORY_ICONS[challenge.category] || Zap
  const diffColor = DIFFICULTY_COLORS[challenge.difficulty] || ''

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setSubmitting(true)
    const res = await onSubmit(challenge.index, answer)
    setResult(res)
    if (res?.correct) setAnswer('')
    setSubmitting(false)
  }

  return (
    <GlassCard className="overflow-hidden">
      {/* Header */}
      <button className="w-full flex items-start gap-4 text-left" onClick={() => setOpen(o => !o)}>
        <div className="p-3 rounded-xl bg-black/60 border border-white/8 text-primary flex-shrink-0">
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-heading font-bold text-white text-lg">{challenge.title}</h3>
            <span className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded-full ${diffColor}`}>
              {challenge.difficulty}
            </span>
            {challenge.solved && (
              <span className="font-mono text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded-full text-green-400 border-green-500/30 bg-green-500/8 flex items-center gap-1">
                <CheckCircle2 size={9} /> Solved
              </span>
            )}
          </div>
          <p className="font-mono text-[10px] text-white/30">{challenge.category} · +{challenge.points} pts</p>
        </div>
        <div className="font-mono text-3xl font-black text-primary/60">{challenge.solved ? '✓' : `${challenge.points}`}</div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-white/5 space-y-5">
              {/* Description / Problem */}
              <div className="bg-black/50 border border-white/8 rounded-xl p-4">
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={10} /> Challenge Brief
                </p>
                <pre className="font-mono text-xs text-white/70 whitespace-pre-wrap leading-relaxed">{challenge.description}</pre>
              </div>

              {/* Hints */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest flex items-center gap-2">
                  <Lightbulb size={10} /> Purchasable Hints
                  <span className="text-white/20 ml-1">— costs deducted from your total score</span>
                </p>
                {challenge.hints.map(hint => (
                  <HintButton
                    key={hint.level}
                    hint={hint}
                    challengeIndex={challenge.index}
                    onUnlock={onUnlockHint}
                    disabled={challenge.solved}
                  />
                ))}
              </div>

              {/* Submit */}
              {!challenge.solved ? (
                <div className="space-y-3">
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Submit Answer</p>
                  <div className="flex gap-3">
                    <input
                      className="flex-1 bg-black/60 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all"
                      placeholder="Type your answer..."
                      value={answer}
                      onChange={e => setAnswer(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!answer.trim() || submitting}
                      className="px-5 py-3 rounded-lg font-mono font-bold text-sm bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition-all disabled:opacity-40 flex items-center gap-2"
                    >
                      <Send size={13} />
                      {submitting ? '...' : 'Go'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-2 p-3 rounded-lg border font-mono text-xs ${
                          result.correct
                            ? 'border-green-500/40 bg-green-500/8 text-green-400'
                            : 'border-red-500/30 bg-red-500/8 text-red-400'
                        }`}
                      >
                        {result.correct ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {result.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-500/8 border border-green-500/25 rounded-xl">
                  <Trophy size={20} className="text-yellow-400" />
                  <div>
                    <p className="font-mono text-sm text-green-400 font-bold">Challenge Solved!</p>
                    <p className="font-mono text-[10px] text-green-400/60">+{challenge.points} points awarded</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}

export default function Section3() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { activeRound } = useAppStore()

  const fetchChallenges = async () => {
    try {
      const { data } = await api.get('/section3/challenges')
      setChallenges(data.challenges)
    } catch (err) {
      setError('Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchChallenges() }, [])

  const handleUnlockHint = async (challengeIndex, hintLevel) => {
    try {
      const { data } = await api.post('/section3/hint', { challengeIndex, hintLevel })
      // Refresh challenges to show unlocked hint
      await fetchChallenges()
      return data
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to unlock hint'
      alert(msg)
    }
  }

  const handleSubmitAnswer = async (challengeIndex, answer) => {
    try {
      const { data } = await api.post('/section3/submit', { challengeIndex, answer })
      if (data.correct) await fetchChallenges()
      return data
    } catch (err) {
      return { correct: false, message: err.response?.data?.message || 'Submission failed' }
    }
  }

  const solved = challenges.filter(c => c.solved).length

  if (!activeRound || activeRound.roundNumber !== 3) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <GlassCard variant="hologram" className="text-center space-y-6">
          <Lock size={48} className="text-red-400 mx-auto" style={{ filter: 'drop-shadow(0 0 12px rgba(255,68,68,0.4))' }} />
          <div>
            <p className="font-mono font-black text-2xl text-red-400 uppercase tracking-widest">Access Restricted</p>
            <p className="font-mono text-sm text-white/40 mt-3">
              Section 3 has not been started by the administrator yet.
            </p>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">&gt; section_03 / cipher_labs</p>
        <h1 className="font-heading font-black text-4xl text-white">
          Cipher <span className="shimmer-text">Challenges</span>
        </h1>
        <p className="font-mono text-white/30 text-sm mt-2">
          3 cipher challenges · Hints available (cost points) · All teams advance to Final Phase
        </p>

        <div className="flex flex-wrap gap-3 mt-4">
          <span className="font-mono text-[10px] uppercase tracking-widest border border-primary/20 px-3 py-1 rounded-full text-primary">
            {solved}/3 Solved
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest border border-yellow-500/20 px-3 py-1 rounded-full text-yellow-400">
            Hints cost −10/−20/−30 pts
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest border border-cyan-500/20 px-3 py-1 rounded-full text-cyan-400">
            All Teams → Final Phase
          </span>
        </div>
      </motion.div>

      {/* Challenges */}
      {loading ? (
        <GlassCard className="py-20 text-center">
          <p className="font-mono text-primary/30 animate-pulse">Loading challenges...</p>
        </GlassCard>
      ) : error ? (
        <GlassCard className="py-20 text-center">
          <p className="font-mono text-red-400/60">{error}</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {challenges.map((ch, i) => (
            <motion.div key={ch.index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <ChallengeCard challenge={ch} onUnlockHint={handleUnlockHint} onSubmit={handleSubmitAnswer} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Final phase info */}
      <GlassCard variant="hologram" className="text-center">
        <Trophy size={28} className="text-yellow-400 mx-auto mb-3" style={{ filter: 'drop-shadow(0 0 10px rgba(234,179,8,0.4))' }} />
        <p className="font-mono font-bold text-white text-sm uppercase tracking-widest">All Teams Advance</p>
        <p className="font-mono text-xs text-white/30 mt-2">
          After this section ends, administrators will unlock the Final Phase. Everyone can access it.
        </p>
      </GlassCard>
    </div>
  )
}

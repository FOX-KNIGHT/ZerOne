import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Lock, Unlock, Send, CheckCircle2, XCircle, Trophy, Zap, Key, FileText, Shield } from 'lucide-react'
import api from '../lib/axios'
import { GlassCard } from '../components/ui/GlassCard'

const DRIVE_LINK = 'https://drive.google.com/drive/folders/1TKlIICGs34qqtXILCUrXO5PSy4fDsHP_?usp=drive_link'

export default function FinalPhase() {
  const [access, setAccess] = useState(null)     // { shortlisted, teamName, score }
  const [loading, setLoading] = useState(true)

  const [fileName, setFileName]   = useState('')
  const [password, setPassword]   = useState('')
  const [flagValue, setFlagValue] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState('')

  useEffect(() => {
    api.get('/final/access').then(r => {
      setAccess(r.data)
    }).catch(() => {
      setAccess({ shortlisted: false })
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!fileName.trim() || !password.trim() || !flagValue.trim()) {
      setError('All three fields are required.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/final/submit', { fileName, password, flagValue })
      setResult(data)
    } catch (err) {
      const d = err.response?.data
      if (d?.alreadySubmitted) {
        setResult({ correct: true, alreadySubmitted: true, message: 'Already submitted!' })
      } else {
        setError(d?.message || 'Submission failed.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-mono text-primary/30 animate-pulse">Checking access...</p>
      </div>
    )
  }

  if (!access?.shortlisted) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <GlassCard variant="hologram" className="text-center space-y-6">
          <Lock size={48} className="text-red-400 mx-auto" style={{ filter: 'drop-shadow(0 0 12px rgba(255,68,68,0.4))' }} />
          <div>
            <p className="font-mono font-black text-2xl text-red-400 uppercase tracking-widest">Access Restricted</p>
            <p className="font-mono text-sm text-white/40 mt-3">
              Only the Top 10 shortlisted teams can access the Final Phase.
            </p>
            <p className="font-mono text-xs text-white/25 mt-2">
              Complete Section 2 & Section 3 to improve your ranking.
            </p>
          </div>
          <div className="p-3 bg-white/2 border border-white/8 rounded-lg inline-block">
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Current Team</p>
            <p className="font-mono font-bold text-white">{access?.teamName || '—'}</p>
            <p className="font-mono text-primary text-lg font-black">{access?.score || 0} pts</p>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-mono text-yellow-400/60 text-xs uppercase tracking-widest mb-1">&gt; final_phase / cipher_decrypt</p>
        <h1 className="font-heading font-black text-4xl text-white">
          Final <span className="shimmer-text">Phase</span>
        </h1>
        <p className="font-mono text-white/30 text-sm mt-2">
          Download the encrypted file · Decrypt it · Reveal the hidden values
        </p>
        <div className="mt-3 flex items-center gap-2 bg-green-500/8 border border-green-500/20 rounded-full px-4 py-2 w-fit">
          <Unlock size={12} className="text-green-400" />
          <span className="font-mono text-xs text-green-400">Access Granted — You are Shortlisted</span>
        </div>
      </motion.div>

      {/* Google Drive Link */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard variant="hologram" className="space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-primary/10">
            <Shield size={14} className="text-primary" />
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white">Encrypted File Archive</h2>
          </div>

          <p className="font-mono text-xs text-white/50 leading-relaxed">
            The encrypted file is hosted on Google Drive. Click below to access it. Download the file, then decrypt it to find the three hidden values.
          </p>

          <a
            href={DRIVE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 border border-primary/40 bg-primary/10 rounded-xl font-mono font-bold text-sm text-primary hover:bg-primary/20 hover:shadow-[0_0_30px_rgba(0,255,65,0.15)] transition-all uppercase tracking-widest"
          >
            <ExternalLink size={16} />
            Open Google Drive Folder
          </a>

          <p className="font-mono text-[10px] text-white/25 text-center">
            {DRIVE_LINK}
          </p>
        </GlassCard>
      </motion.div>

      {/* Instructions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="space-y-4">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest flex items-center gap-2">
            <Zap size={10} /> Mission Briefing
          </p>
          <ol className="space-y-3">
            {[
              'Open the Google Drive folder above and download the encrypted file.',
              'The file is encrypted — use your cryptography skills to decrypt it.',
              'Inside the decrypted content, you will find three key values.',
              'Fill in the three fields below with the exact values you find.',
              'The first teams to submit correct answers earn the most bonus points!',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 font-mono text-xs text-white/50">
                <span className="text-primary/50 flex-shrink-0 font-bold w-5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>

          <div className="p-3 bg-yellow-500/5 border border-yellow-500/15 rounded-lg">
            <p className="font-mono text-[10px] text-yellow-400/80">
              ⚡ Bonus points are rank-based: 1st = +300, 2nd = +250, 3rd = +200, others = +150
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Answer fields */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="space-y-5">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-white/5">
            <Key size={10} /> Submit Decrypted Values
          </p>

          {/* Field 1 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">
              <FileText size={10} className="text-cyan-400" />
              File Name
              {result && !result.fileNameOk && (
                <span className="text-red-400 ml-auto flex items-center gap-1"><XCircle size={10} /> Incorrect</span>
              )}
              {result?.fileNameOk && (
                <span className="text-green-400 ml-auto flex items-center gap-1"><CheckCircle2 size={10} /> Correct</span>
              )}
            </label>
            <input
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              disabled={!!result?.correct}
              placeholder="Enter the file name..."
              className={`w-full bg-black/60 border rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/20 focus:outline-none transition-all ${
                result && !result.fileNameOk ? 'border-red-500/40 focus:border-red-500/60' :
                result?.fileNameOk           ? 'border-green-500/40' :
                                               'border-white/10 focus:border-primary/50'
              }`}
            />
          </div>

          {/* Field 2 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">
              <Lock size={10} className="text-yellow-400" />
              Password
              {result && !result.passwordOk && (
                <span className="text-red-400 ml-auto flex items-center gap-1"><XCircle size={10} /> Incorrect</span>
              )}
              {result?.passwordOk && (
                <span className="text-green-400 ml-auto flex items-center gap-1"><CheckCircle2 size={10} /> Correct</span>
              )}
            </label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={!!result?.correct}
              placeholder="Enter the password..."
              className={`w-full bg-black/60 border rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/20 focus:outline-none transition-all ${
                result && !result.passwordOk ? 'border-red-500/40 focus:border-red-500/60' :
                result?.passwordOk           ? 'border-green-500/40' :
                                               'border-white/10 focus:border-primary/50'
              }`}
            />
          </div>

          {/* Field 3 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">
              <Shield size={10} className="text-primary" />
              Flag Value
              {result && !result.flagValueOk && (
                <span className="text-red-400 ml-auto flex items-center gap-1"><XCircle size={10} /> Incorrect</span>
              )}
              {result?.flagValueOk && (
                <span className="text-green-400 ml-auto flex items-center gap-1"><CheckCircle2 size={10} /> Correct</span>
              )}
            </label>
            <input
              value={flagValue}
              onChange={e => setFlagValue(e.target.value)}
              disabled={!!result?.correct}
              placeholder="Enter the flag value..."
              className={`w-full bg-black/60 border rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/20 focus:outline-none transition-all ${
                result && !result.flagValueOk ? 'border-red-500/40 focus:border-red-500/60' :
                result?.flagValueOk           ? 'border-green-500/40' :
                                               'border-white/10 focus:border-primary/50'
              }`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/8 border border-red-500/25 rounded-lg">
              <XCircle size={13} className="text-red-400 flex-shrink-0" />
              <p className="font-mono text-xs text-red-400">{error}</p>
            </div>
          )}

          {!result?.correct && (
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 font-mono font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 rounded-xl hover:bg-yellow-500/20 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] transition-all disabled:opacity-40"
            >
              <Send size={15} />
              {submitting ? 'Verifying...' : 'Submit Final Answers'}
            </motion.button>
          )}
        </GlassCard>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result?.correct && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-8 rounded-2xl border border-yellow-500/40 bg-yellow-500/5 text-center overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(234,179,8,0.08) 0%, transparent 70%)' }} />
            <div className="relative">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 0.8 }}>
                <Trophy size={56} className="text-yellow-400 mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(234,179,8,0.6))' }} />
              </motion.div>
              <p className="font-mono font-black text-3xl text-yellow-400 mb-2">{result.message}</p>
              {result.pts && (
                <p className="font-mono text-xl text-white/70">
                  Rank <span className="text-yellow-400 font-black">#{result.rank}</span> · +<span className="text-primary font-black">{result.pts}</span> pts
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

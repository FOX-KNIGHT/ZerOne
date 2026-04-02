import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Send, Trophy, Zap, Flame, Shield, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import api from '../lib/axios'
import { socket } from '../lib/socket'

const RANK_MESSAGES = {
  1: { icon: Trophy, label: 'FIRST BLOOD', color: 'text-yellow-400', glow: 'rgba(234,179,8,0.6)', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  2: { icon: Zap,    label: 'SECOND PLACE', color: 'text-gray-300',   glow: 'rgba(209,213,219,0.6)', bg: 'bg-gray-400/10 border-gray-400/30' },
  3: { icon: Flame,  label: 'THIRD PLACE',  color: 'text-orange-400', glow: 'rgba(249,115,22,0.6)', bg: 'bg-orange-400/10 border-orange-400/30' },
}

export default function Round3() {
  const [vaultConfig, setVaultConfig] = useState(null)
  const [flag, setFlag] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    api.get('/cipher-config/round3').then(r => setVaultConfig(r.data)).catch(() => {})
    socket.on('round3:config', data => setVaultConfig(data))
    return () => socket.off('round3:config')
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await api.get('/cipher-config/round3/vault', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'vault.zip')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Vault not ready yet. Wait for the organizer to upload it.')
    } finally {
      setDownloading(false)
    }
  }

  const handleSubmitFlag = async () => {
    if (!flag.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await api.post('/round3/flag', { flag: flag.trim() })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const rankInfo = result?.rank ? RANK_MESSAGES[result.rank] || {
    icon: CheckCircle, label: 'FLAG CAPTURED', color: 'text-green-400',
    glow: 'rgba(34,197,94,0.6)', bg: 'bg-green-400/10 border-green-400/30'
  } : null

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">
          &gt; round_03 / vault_breaker
        </p>
        <h1 className="font-heading font-black text-4xl text-white">
          The <span className="shimmer-text">Vault Breaker</span>
        </h1>
        <p className="font-mono text-white/30 text-sm mt-2">
          Download the encrypted vault. Crack the cipher chain. Extract the flag.
        </p>
      </motion.div>

      {/* Vault Download */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="terminal-box rounded-xl p-5"
      >
        <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white mb-4 flex items-center gap-2">
          <Shield size={14} className="text-primary" />
          Encrypted Vault
        </h2>

        {/* Cipher chain display */}
        {vaultConfig?.vaultCiphers?.length > 0 && (
          <div className="mb-4 p-3 bg-black/40 border border-primary/15 rounded-lg">
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">Encryption Chain (apply in reverse to decrypt)</p>
            <div className="flex items-center gap-2 flex-wrap">
              {vaultConfig.vaultCiphers.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-1 rounded">
                    {c.name}
                  </span>
                  {i < vaultConfig.vaultCiphers.length - 1 && (
                    <span className="text-white/20 font-mono text-sm">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={downloading || !vaultConfig?.vaultReady}
          className={`w-full py-4 rounded-xl font-mono font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-3
            ${!vaultConfig?.vaultReady
              ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
              : downloading
                ? 'bg-primary/10 text-primary border border-primary/30 cursor-wait'
                : 'bg-black/40 text-primary border border-primary/30 hover:bg-primary/10 hover:shadow-[0_0_30px_rgba(0,255,65,0.15)]'
            }`}
        >
          <Download size={18} className={downloading ? 'animate-bounce' : ''} />
          {downloading ? 'DOWNLOADING...' : !vaultConfig?.vaultReady ? 'VAULT NOT READY YET' : 'DOWNLOAD VAULT.ZIP'}
        </button>

        {!vaultConfig?.vaultReady && (
          <p className="font-mono text-xs text-yellow-400/60 text-center mt-2">
            ⚡ Vault will be available when organizer uploads the file
          </p>
        )}
      </motion.div>

      {/* Instructions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="p-4 bg-black/40 border border-white/8 rounded-xl"
      >
        <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">Mission Briefing</p>
        <ol className="space-y-2">
          {[
            'Download the vault.zip above',
            'The ZIP is password-protected — crack it using the cipher chain shown',
            'Inside you will find an encrypted text file',
            'Apply the cipher chain in reverse order to decrypt it',
            'The decrypted content contains the flag (format: ZR{...})',
            'Submit the flag below — fastest team gets maximum bonus points',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 font-mono text-xs text-white/50">
              <span className="text-primary/60 flex-shrink-0 w-4">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </motion.div>

      {/* Flag submission */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="terminal-box rounded-xl p-5"
      >
        <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white mb-4 flex items-center gap-2">
          <Lock size={14} className="text-primary" />
          Submit Flag
        </h2>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={flag}
              onChange={e => setFlag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmitFlag()}
              placeholder="ZR{your_decrypted_flag}"
              disabled={!!result?.correct}
              className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-white/20
                focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,65,0.1)] transition-all"
            />
          </div>
          <button
            onClick={handleSubmitFlag}
            disabled={!flag.trim() || submitting || !!result?.correct}
            className={`px-6 py-3 rounded-lg font-mono font-bold text-sm tracking-widest flex items-center gap-2 transition-all duration-300 flex-shrink-0
              ${!flag.trim() || !!result?.correct ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
                : submitting ? 'bg-primary/20 text-primary border border-primary/30 cursor-wait animate-pulse'
                : 'bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 hover:shadow-[0_0_20px_rgba(0,255,65,0.2)]'
              }`}
          >
            <Send size={14} />
            {submitting ? 'CHECKING' : 'SUBMIT'}
          </button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <XCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="font-mono text-xs text-red-400">{error}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative rounded-xl p-6 border overflow-hidden ${result.correct
              ? rankInfo?.bg || 'bg-green-400/10 border-green-400/30'
              : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            {result.correct && rankInfo && (
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${rankInfo.glow.replace('0.6', '0.05')} 0%, transparent 70%)` }}
              />
            )}

            <div className="relative text-center">
              {result.correct ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.6 }}
                  >
                    {rankInfo && <rankInfo.icon size={48} className={`${rankInfo.color} mx-auto mb-3`}
                      style={{ filter: `drop-shadow(0 0 20px ${rankInfo.glow})` }} />}
                  </motion.div>
                  <p className={`font-mono font-black text-3xl mb-1 ${rankInfo?.color}`}>{result.message}</p>
                  <p className={`font-mono text-sm mb-4 ${rankInfo?.color} opacity-70`}>Rank #{result.rank}</p>
                  <div className="flex items-center justify-center gap-8">
                    <div>
                      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Cipher Points</p>
                      <p className="font-mono font-black text-2xl text-white">{result.taskPoints}</p>
                    </div>
                    <div className="text-2xl text-white/20">+</div>
                    <div>
                      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Rank Bonus</p>
                      <p className={`font-mono font-black text-2xl ${rankInfo?.color}`}>{result.bonusPoints}</p>
                    </div>
                    <div className="text-2xl text-white/20">=</div>
                    <div>
                      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Total</p>
                      <p className="font-mono font-black text-3xl text-white">{result.total}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={40} className="text-red-400 mx-auto mb-3" />
                  <p className="font-mono font-bold text-xl text-red-400">{result.message}</p>
                  <p className="font-mono text-xs text-white/30 mt-1">Check your cipher chain and try again</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

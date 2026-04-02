import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Send, Shield, Key, FolderOpen, CheckCircle, AlertTriangle, Zap, FileText, Archive } from 'lucide-react'
import api from '../../lib/axios'
import { GlassCard } from '../../components/ui/GlassCard'
import { NeonInput } from '../../components/ui/NeonInput'
import { AnimatedButton } from '../../components/ui/AnimatedButton'

const CIPHER_OPTIONS = [
  'Caesar', 'Atbash', 'Vigenere', 'Playfair', 'RowTransposition',
  'Hill', 'Beaufort', 'DoubleTransposition', 'Autokey', 'Affine', 'RailFence',
]

function CipherParamFields({ cipher, prefix, values, onChange }) {
  if (!cipher) return null
  const field = (label, key, placeholder) => (
    <div>
      <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-1">{label}</label>
      <NeonInput
        placeholder={placeholder}
        value={values[key] || ''}
        onChange={e => onChange({ ...values, [key]: e.target.value })}
      />
    </div>
  )

  switch (cipher) {
    case 'Caesar':           return field('Shift', 'shift', '3')
    case 'Affine':           return <div className="grid grid-cols-2 gap-2">{field('a (coprime to 26)', 'a', '5')}{field('b', 'b', '8')}</div>
    case 'Hill':             return field('Matrix (a,b,c,d)', 'matrix', '3,3,2,5')
    case 'DoubleTransposition': return <div className="grid grid-cols-2 gap-2">{field('Key 1', 'key1', '3142')}{field('Key 2', 'key2', '4312')}</div>
    case 'RailFence':        return field('Rails', 'rails', '3')
    case 'Atbash':
    case 'Beaufort':
    case 'Vigenere':
    case 'Playfair':
    case 'RowTransposition':
    case 'Autokey':          return field('Key', 'key', 'SECRETKEY')
    default: return null
  }
}

function parseParams(cipher, raw) {
  if (!cipher || !raw) return {}
  if (cipher === 'Caesar')    return { shift: parseInt(raw.shift) || 3 }
  if (cipher === 'Affine')    return { a: parseInt(raw.a) || 5, b: parseInt(raw.b) || 8 }
  if (cipher === 'Hill') {
    const parts = (raw.matrix || '3,3,2,5').split(',').map(Number)
    return { matrix: [[parts[0], parts[1]], [parts[2], parts[3]]] }
  }
  if (cipher === 'RailFence') return { rails: parseInt(raw.rails) || 3 }
  if (cipher === 'DoubleTransposition') return { key1: raw.key1, key2: raw.key2 }
  return { key: raw.key }
}

export default function AdminCipherConfig() {
  const [tab, setTab] = useState('round2')
  const [toast, setToast] = useState(null)

  // Round 2 state
  const [r2TeamName, setR2TeamName] = useState('')
  const [r2PasswordWord, setR2PasswordWord] = useState('')
  const [r2FolderCipher, setR2FolderCipher] = useState('')
  const [r2FolderParams, setR2FolderParams] = useState({})
  const [r2PasswordCipher1, setR2PasswordCipher1] = useState('')
  const [r2Params1, setR2Params1] = useState({})
  const [r2PasswordCipher2, setR2PasswordCipher2] = useState('')
  const [r2Params2, setR2Params2] = useState({})
  const [r2Sending, setR2Sending] = useState(false)

  // Round 3 state
  const [r3Flag, setR3Flag] = useState('')
  const [r3Ciphers, setR3Ciphers] = useState([{ name: '', params: {} }])
  const [r3VaultFile, setR3VaultFile] = useState(null)
  const [r3Sending, setR3Sending] = useState(false)

  // Round 1 log state
  const [logFile, setLogFile] = useState(null)
  const [logSending, setLogSending] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleRound2Submit = async () => {
    if (!r2TeamName || !r2PasswordWord || !r2FolderCipher || !r2PasswordCipher1 || !r2PasswordCipher2) {
      showToast('Fill all cipher config fields', 'error')
      return
    }
    setR2Sending(true)
    try {
      await api.post('/cipher-config/round2', {
        assignedTeamName: r2TeamName.toUpperCase(),
        passwordWord: r2PasswordWord.toUpperCase(),
        folderCipher:    { name: r2FolderCipher,    params: parseParams(r2FolderCipher, r2FolderParams) },
        passwordCipher1: { name: r2PasswordCipher1, params: parseParams(r2PasswordCipher1, r2Params1) },
        passwordCipher2: { name: r2PasswordCipher2, params: parseParams(r2PasswordCipher2, r2Params2) },
      })
      showToast('Round 2 config broadcast to all participants!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to set config', 'error')
    } finally {
      setR2Sending(false)
    }
  }

  const handleRound3Submit = async () => {
    if (!r3Flag || !r3VaultFile) {
      showToast('Correct flag and vault ZIP are required', 'error')
      return
    }
    setR3Sending(true)
    try {
      const form = new FormData()
      form.append('vault', r3VaultFile)
      form.append('correctFlag', r3Flag.trim().toUpperCase())
      form.append('vaultCiphers', JSON.stringify(r3Ciphers.filter(c => c.name).map(c => ({
        name: c.name, params: parseParams(c.name, c.params)
      }))))
      await api.post('/cipher-config/round3/vault', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      showToast('Vault uploaded! Participants can now download.')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload vault', 'error')
    } finally {
      setR3Sending(false)
    }
  }

  const handleLogUpload = async () => {
    if (!logFile) { showToast('Select a log file first', 'error'); return }
    setLogSending(true)
    try {
      const form = new FormData()
      form.append('log', logFile)
      await api.post('/cipher-config/round1/log', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      showToast('Log file uploaded! Participants can now view it.')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload log', 'error')
    } finally {
      setLogSending(false)
    }
  }

  const tabs = [
    { id: 'round1', label: 'Round 1 — Log',       icon: FileText },
    { id: 'round2', label: 'Round 2 — Architect',  icon: Key },
    { id: 'round3', label: 'Round 3 — Vault',      icon: Archive },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">&gt; admin / cipher_config</p>
        <h1 className="font-heading font-black text-4xl text-white">
          Cipher <span className="shimmer-text">Control</span>
        </h1>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 p-3 rounded-lg border ${
              toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}
          >
            {toast.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
            <span className="font-mono text-sm">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab navigation */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-widest transition-all
              ${tab === t.id
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20 hover:text-white/60'
              }`}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ROUND 1 TAB */}
      {tab === 'round1' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard>
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              Upload Round 1 Log File
            </h2>
            <p className="font-mono text-xs text-white/40 mb-4 leading-relaxed">
              Upload the .log file for Round 1. Participants will be able to read it in their terminal viewer.
              Supported: any text file (.log, .txt).
            </p>
            <label className="block">
              <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${logFile ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-primary/30 hover:bg-primary/3'}`}
              >
                <input type="file" accept=".log,.txt" className="hidden" onChange={e => setLogFile(e.target.files[0])} />
                {logFile ? (
                  <><CheckCircle size={24} className="text-green-400 mx-auto mb-2" /><p className="font-mono text-green-400">{logFile.name}</p></>
                ) : (
                  <><Upload size={24} className="text-white/20 mx-auto mb-2" /><p className="font-mono text-white/40 text-sm">Click to select .log or .txt file</p></>
                )}
              </div>
            </label>
            <AnimatedButton variant="primary" className="mt-4 w-full" onClick={handleLogUpload} disabled={!logFile || logSending}>
              {logSending ? 'Uploading...' : 'Upload & Broadcast Log'}
            </AnimatedButton>
          </GlassCard>
        </motion.div>
      )}

      {/* ROUND 2 TAB */}
      {tab === 'round2' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <GlassCard>
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <Zap size={14} className="text-primary animate-pulse" />
              Round 2 Live Broadcast
            </h2>
            <p className="font-mono text-xs text-white/40 mb-6 leading-relaxed">
              Fills in the config and broadcasts it live to all connected participants via Socket.IO.
              They will see this info appear instantly on their screen.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-1">Assigned Team Name</label>
                <NeonInput placeholder="ALPHA" value={r2TeamName} onChange={e => setR2TeamName(e.target.value)} />
                <p className="font-mono text-[10px] text-white/20 mt-1">The team name they will encode using Folder Cipher</p>
              </div>
              <div>
                <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-1">Password Word</label>
                <NeonInput placeholder="SPHINX" value={r2PasswordWord} onChange={e => setR2PasswordWord(e.target.value)} />
                <p className="font-mono text-[10px] text-white/20 mt-1">The word they will double-encrypt for the ZIP password</p>
              </div>
            </div>

            <div className="space-y-5">
              {[
                { title: 'Folder Cipher', cipher: r2FolderCipher, setCipher: setR2FolderCipher, params: r2FolderParams, setParams: setR2FolderParams, color: 'cyan' },
                { title: 'Password Cipher 1', cipher: r2PasswordCipher1, setCipher: setR2PasswordCipher1, params: r2Params1, setParams: setR2Params1, color: 'purple' },
                { title: 'Password Cipher 2', cipher: r2PasswordCipher2, setCipher: setR2PasswordCipher2, params: r2Params2, setParams: setR2Params2, color: 'gold' },
              ].map(({ title, cipher, setCipher, params, setParams, color }) => (
                <div key={title} className={`p-4 rounded-xl border ${
                  color === 'cyan' ? 'border-cyan-500/20 bg-cyan-500/3' :
                  color === 'purple' ? 'border-purple-500/20 bg-purple-500/3' :
                  'border-yellow-500/20 bg-yellow-500/3'
                }`}>
                  <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest block mb-2">{title}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <select
                        value={cipher}
                        onChange={e => { setCipher(e.target.value); setParams({}) }}
                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-white
                          focus:outline-none focus:border-primary/50 appearance-none"
                      >
                        <option value="">Select cipher...</option>
                        {CIPHER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <CipherParamFields cipher={cipher} values={params} onChange={setParams} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <AnimatedButton variant="primary" className="mt-6 w-full gap-2" onClick={handleRound2Submit} disabled={r2Sending}>
              <Send size={14} />
              {r2Sending ? 'Broadcasting...' : 'BROADCAST CONFIG LIVE'}
            </AnimatedButton>
          </GlassCard>
        </motion.div>
      )}

      {/* ROUND 3 TAB */}
      {tab === 'round3' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <GlassCard>
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <Shield size={14} className="text-primary" />
              Round 3 Vault Setup
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-1">Correct Flag</label>
                <NeonInput placeholder="ZR{the_correct_flag_here}" value={r3Flag} onChange={e => setR3Flag(e.target.value)} />
                <p className="font-mono text-[10px] text-white/20 mt-1">
                  Teams must submit this exact string (case-insensitive) to score
                </p>
              </div>

              <div>
                <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-2">Cipher Chain (encryption order, applied to flag)</label>
                <div className="space-y-2">
                  {r3Ciphers.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="font-mono text-[10px] text-white/30 w-5">{i + 1}.</span>
                      <select
                        value={c.name}
                        onChange={e => {
                          const updated = [...r3Ciphers]
                          updated[i] = { name: e.target.value, params: {} }
                          setR3Ciphers(updated)
                        }}
                        className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-primary/50"
                      >
                        <option value="">Select cipher...</option>
                        {CIPHER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      {r3Ciphers.length > 1 && (
                        <button
                          onClick={() => setR3Ciphers(r3Ciphers.filter((_, idx) => idx !== i))}
                          className="font-mono text-xs text-red-400/60 hover:text-red-400 px-2"
                        >✕</button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setR3Ciphers([...r3Ciphers, { name: '', params: {} }])}
                    className="font-mono text-xs text-primary/60 hover:text-primary transition-colors"
                  >
                    + Add cipher to chain
                  </button>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] text-white/30 uppercase tracking-widest block mb-1">Vault ZIP File</label>
                <label className="block">
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                    ${r3VaultFile ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-primary/30'}`}
                  >
                    <input type="file" accept=".zip" className="hidden" onChange={e => setR3VaultFile(e.target.files[0])} />
                    {r3VaultFile ? (
                      <><CheckCircle size={20} className="text-green-400 mx-auto mb-1" /><p className="font-mono text-green-400 text-sm">{r3VaultFile.name}</p></>
                    ) : (
                      <><Archive size={20} className="text-white/20 mx-auto mb-1" /><p className="font-mono text-white/40 text-sm">Click to select vault.zip</p></>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <AnimatedButton variant="primary" className="mt-6 w-full gap-2" onClick={handleRound3Submit} disabled={r3Sending}>
              <Upload size={14} />
              {r3Sending ? 'Uploading...' : 'UPLOAD VAULT'}
            </AnimatedButton>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}

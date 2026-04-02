import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, CheckCircle, XCircle, AlertTriangle, Lock, FolderOpen, Key, Zap } from 'lucide-react'
import api from '../lib/axios'
import { socket } from '../lib/socket'

const CIPHER_PARAMS_HELP = {
  Caesar:              'shift number (e.g. 3)',
  Atbash:              'no parameters needed',
  Vigenere:            'keyword (e.g. SECRET)',
  Playfair:            'keyword (e.g. MONARCHY)',
  RowTransposition:    'digit order (e.g. 3142)',
  Hill:                '2×2 matrix: a,b,c,d (e.g. 3,3,2,5)',
  Beaufort:            'keyword (e.g. CIPHER)',
  DoubleTransposition: 'two keys: key1, key2',
  Autokey:             'primer keyword (e.g. DECEPTIVE)',
  Affine:              'values a, b (e.g. a=5 b=8, a must be coprime to 26)',
  RailFence:           'number of rails (e.g. 3)',
}

function Step({ number, title, desc, icon: Icon, color = 'cyan' }) {
  const colors = {
    cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    green: 'border-green-500/30 bg-green-500/5 text-green-400',
    gold: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
  }
  return (
    <div className={`p-4 rounded-xl border ${colors[color]} flex gap-4 items-start`}>
      <div className="w-8 h-8 rounded-lg bg-black/50 border border-current flex items-center justify-center flex-shrink-0">
        <Icon size={14} />
      </div>
      <div>
        <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Step {number}</p>
        <p className="font-heading font-bold text-white text-sm">{title}</p>
        <p className="font-mono text-xs text-white/40 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function ScoreBar({ label, pts, max, icon: Icon }) {
  const pct = max > 0 ? (pts / max) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={12} className={pts === max ? 'text-green-400' : pts > 0 ? 'text-yellow-400' : 'text-red-400'} />
          <span className="font-mono text-xs text-white/60">{label}</span>
        </div>
        <span className={`font-mono text-sm font-bold ${pts === max ? 'text-green-400' : pts > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
          {pts}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${pts === max ? 'bg-green-500' : pts > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ boxShadow: pts === max ? '0 0 8px rgba(34,197,94,0.8)' : 'none' }}
        />
      </div>
    </div>
  )
}

export default function Round2() {
  const [config, setConfig] = useState(null)
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Fetch initial config
  useEffect(() => {
    api.get('/cipher-config/round2').then(r => setConfig(r.data)).catch(() => {})
  }, [])

  // Live push when admin announces config
  useEffect(() => {
    socket.on('round2:config', data => setConfig(data))
    return () => socket.off('round2:config')
  }, [])

  const onDrop = useCallback(accepted => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] },
    maxFiles: 1,
    onDrop,
  })

  const handleSubmit = async () => {
    if (!file) return
    setSubmitting(true)
    setError(null)
    const form = new FormData()
    form.append('vault', file)
    try {
      const { data } = await api.post('/round2/submit', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">
          &gt; round_02 / the_architect
        </p>
        <h1 className="font-heading font-black text-4xl text-white">
          The <span className="shimmer-text">Architect</span>
        </h1>
        <p className="font-mono text-white/30 text-sm mt-2">
          Encode, encrypt, compress. Build a vault the organizers can open.
        </p>
      </motion.div>

      {/* Live Config Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="terminal-box rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-primary animate-pulse" />
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white">Live Cipher Config</h2>
          </div>
          {!config && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              AWAITING BROADCAST
            </span>
          )}
          {config && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {!config ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full border border-yellow-400/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Lock size={20} className="text-yellow-400/60" />
            </div>
            <p className="font-mono text-yellow-400/60 text-sm">Waiting for organizer to announce cipher configuration...</p>
            <p className="font-mono text-white/20 text-xs mt-1">This will update automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Assigned Team Name</p>
              <p className="font-heading font-black text-2xl text-white">{config.assignedTeamName}</p>
              <p className="font-mono text-xs text-white/25">Encode this using the Folder Cipher</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Password Word</p>
              <p className="font-heading font-black text-2xl text-cyan-300">{config.passwordWord}</p>
              <p className="font-mono text-xs text-white/25">Apply Cipher 1 → Cipher 2</p>
            </div>
            <div className="p-3 bg-black/40 border border-white/8 rounded-lg space-y-1">
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Folder Cipher</p>
              <p className="font-mono text-lg font-bold text-cyan-400">{config.folderCipherName}</p>
              <p className="font-mono text-[10px] text-white/20">{CIPHER_PARAMS_HELP[config.folderCipherName] || 'See cipher reference'}</p>
            </div>
            <div className="p-3 bg-black/40 border border-white/8 rounded-lg space-y-1">
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Password Chain</p>
              <p className="font-mono text-lg font-bold text-purple-400">
                {config.passwordCipher1Name} <span className="text-white/30">→</span> {config.passwordCipher2Name}
              </p>
              <p className="font-mono text-[10px] text-white/20">Apply in sequence</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <Step number={1} title="Encode the folder name" icon={FolderOpen} color="cyan"
          desc={`Apply ${config?.folderCipherName || 'Folder Cipher'} to the assigned team name. Use the result as your folder's name.`} />
        <Step number={2} title="Encrypt the password" icon={Key} color="purple"
          desc={`Run the password word through ${config?.passwordCipher1Name || 'Cipher 1'}, then through ${config?.passwordCipher2Name || 'Cipher 2'}.`} />
        <Step number={3} title="Place team name inside" icon={FolderOpen} color="green"
          desc="Create a .txt file inside the encoded folder containing your original (un-encoded) team name." />
        <Step number={4} title="ZIP with password" icon={Lock} color="gold"
          desc="Compress the folder into .zip and set the ZIP password to your double-encrypted result." />
      </motion.div>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="terminal-box rounded-xl p-5"
      >
        <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white mb-4 flex items-center gap-2">
          <Upload size={14} className="text-primary" />
          Upload Vault ZIP
        </h2>

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
            ${isDragActive
              ? 'border-primary bg-primary/5 shadow-[0_0_30px_rgba(0,255,65,0.1)]'
              : 'border-white/10 hover:border-primary/40 hover:bg-primary/3'
            }`}
        >
          <input {...getInputProps()} />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                <p className="font-mono text-green-400 font-bold">{file.name}</p>
                <p className="font-mono text-white/30 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <FolderOpen size={32} className="text-white/20 mx-auto mb-2" />
                <p className="font-heading font-bold text-white/50">
                  {isDragActive ? 'Drop your vault here' : 'Drop vault.zip here'}
                </p>
                <p className="font-mono text-white/20 text-xs mt-1">or click to browse — .zip only, max 50 MB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <XCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="font-mono text-xs text-red-400">{error}</p>
          </motion.div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || submitting || !config}
          className={`mt-4 w-full py-3 rounded-xl font-mono font-bold text-sm tracking-widest transition-all duration-300
            ${!file || !config ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10' :
              submitting ? 'bg-primary/20 text-primary border border-primary/30 cursor-wait animate-pulse' :
              'bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 hover:shadow-[0_0_20px_rgba(0,255,65,0.2)]'
            }`}
        >
          {submitting ? '[ VALIDATING... ]' : !config ? '[ WAITING FOR CONFIG ]' : '[ SUBMIT VAULT ]'}
        </button>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="terminal-box rounded-xl p-5"
          >
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              <CheckCircle size={14} className={result.score > 0 ? 'text-green-400' : 'text-red-400'} />
              Validation Result
            </h2>

            {/* Score total */}
            <div className="text-center mb-6">
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">Total Score</p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`font-mono font-black text-6xl ${result.score >= 25 ? 'text-green-400' : result.score > 0 ? 'text-yellow-400' : 'text-red-400'}`}
                style={{ textShadow: `0 0 30px currentColor` }}
              >
                {result.score}<span className="text-2xl text-white/30">/30</span>
              </motion.p>
            </div>

            {/* Score breakdown */}
            <div className="space-y-3 mb-5">
              <ScoreBar label="Folder Name" pts={result.breakdown?.folderName || 0} max={10} icon={FolderOpen} />
              <ScoreBar label="Cipher 1 (Password step 1)" pts={result.breakdown?.cipher1 || 0} max={10} icon={Key} />
              <ScoreBar label="Cipher 2 (Password step 2)" pts={result.breakdown?.cipher2 || 0} max={10} icon={Lock} />
            </div>

            {/* Errors */}
            {result.errors?.length > 0 && (
              <div className="space-y-2">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-red-500/8 border border-red-500/20 rounded-lg">
                    <AlertTriangle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="font-mono text-xs text-red-400/80">{e}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

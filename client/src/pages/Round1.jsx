import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, RefreshCw, Download, ChevronRight, Circle } from 'lucide-react'
import api from '../lib/axios'
import { socket } from '../lib/socket'

const PLACEHOLDER_LOG = `[SYSTEM] ZerOne Cryptography Terminal v2.7.1
[BOOT]   Initializing secure channel...
[OK]     Connection established — 2026-04-02 14:22:17 UTC
[WARN]   Unusual packet signature detected on subnet 192.168.0.0/24
[LOG]    Incoming payload from node ECHO-7:
         CIPHER_START >> VIGENERE(key=HERO) >> CAESAR(shift=3) >> CIPHER_END
         Encoded message: KHOOR ZRUOG
[AUTH]   Challenge token generated: ZR-ROUND1-2026
[LOG]    System health nominal. Awaiting operator input.
[INFO]   Round 1 challenge active. Decode the message chain above.
`

export default function Round1() {
  const [log, setLog] = useState('')
  const [loading, setLoading] = useState(true)
  const [logReady, setLogReady] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const logRef = useRef(null)

  const fetchLog = async () => {
    setLoading(true)
    try {
      const response = await api.get('/cipher-config/round1/log')
      setLog(response.data)
      setLogReady(true)
    } catch {
      setLog(PLACEHOLDER_LOG)
      setLogReady(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLog()
    // Listen for log upload event
    socket.on('round1:log-ready', () => fetchLog())
    const blink = setInterval(() => setCursorVisible(v => !v), 530)
    return () => {
      socket.off('round1:log-ready')
      clearInterval(blink)
    }
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">
          &gt; round_01 / initialization
        </p>
        <h1 className="font-heading font-black text-4xl text-white">
          Terminal <span className="shimmer-text">Log Viewer</span>
        </h1>
        <p className="font-mono text-white/30 text-sm mt-2">
          Read the system log carefully — the cipher chain is embedded within.
        </p>
      </motion.div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between p-3 bg-black/60 border border-primary/20 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <Circle
            size={8}
            className={logReady ? 'fill-primary text-primary animate-pulse' : 'fill-yellow-400 text-yellow-400'}
          />
          <span className="font-mono text-xs text-white/50">
            {logReady ? 'LIVE LOG — Admin has uploaded the log file' : 'DEMO MODE — Waiting for admin to upload the log file'}
          </span>
        </div>
        <button
          onClick={fetchLog}
          className="flex items-center gap-2 font-mono text-xs text-primary/60 hover:text-primary transition-colors px-3 py-1 border border-primary/20 rounded hover:border-primary/40"
        >
          <RefreshCw size={11} />
          REFRESH
        </button>
      </motion.div>

      {/* Terminal window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="terminal-box rounded-xl overflow-hidden"
        style={{ boxShadow: '0 0 40px rgba(0,255,65,0.08), 0 0 1px rgba(0,255,65,0.3)' }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/15 bg-black/40">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex items-center gap-2 ml-3">
            <Terminal size={12} className="text-primary" />
            <span className="font-mono text-xs text-white/40">zerone-secure-shell — round1.log</span>
          </div>
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cipher-config/round1/log`}
            download="round1.log"
            className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-primary/50 hover:text-primary transition-colors"
          >
            <Download size={10} />
            SAVE
          </a>
        </div>

        {/* Log content */}
        <div
          ref={logRef}
          className="p-5 overflow-y-auto font-terminal text-sm leading-6 no-scrollbar"
          style={{
            height: '480px',
            color: '#00ff41',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,10,0,0.98) 100%)',
          }}
        >
          {loading ? (
            <div className="flex items-center gap-3 text-primary/60">
              <RefreshCw size={14} className="animate-spin" />
              <span>Loading secure transmission...</span>
            </div>
          ) : (
            <>
              {log.split('\n').map((line, i) => (
                <div key={i} className="flex gap-3 group hover:bg-primary/5 px-1 rounded transition-colors">
                  <span className="text-primary/20 select-none text-xs w-8 flex-shrink-0 pt-0.5 font-mono">
                    {String(i + 1).padStart(3, '0')}
                  </span>
                  <span className={
                    line.includes('[WARN]') ? 'text-yellow-400' :
                    line.includes('[ERROR]') || line.includes('[FAIL]') ? 'text-red-400' :
                    line.includes('[OK]') ? 'text-green-400' :
                    line.includes('CIPHER') ? 'text-cyan-300 font-bold' :
                    line.includes('>>') ? 'text-cyan-400' :
                    'text-primary/80'
                  }>
                    {line || ' '}
                  </span>
                </div>
              ))}
              {/* blinking cursor */}
              <div className="flex gap-3 px-1">
                <span className="text-primary/20 select-none text-xs w-8 flex-shrink-0 pt-0.5 font-mono">
                  {String(log.split('\n').length + 1).padStart(3, '0')}
                </span>
                <span className="text-primary">
                  <ChevronRight size={14} className="inline" />
                  <span className={`inline-block w-2 h-4 bg-primary ml-0.5 align-middle transition-opacity ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
                </span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Hint box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl"
      >
        <p className="font-mono text-xs text-yellow-400/80 leading-relaxed">
          <span className="text-yellow-400 font-bold">⚠ INTEL:</span> The log contains cipher chains in the format{' '}
          <code className="bg-black/40 px-1 rounded text-yellow-300">CIPHER_START &gt;&gt; ... &gt;&gt; CIPHER_END</code>.
          Apply each cipher in order, using the embedded keys to decode the final message.
          Your answer to Round 1 questions is hidden within the decoded output.
        </p>
      </motion.div>
    </div>
  )
}

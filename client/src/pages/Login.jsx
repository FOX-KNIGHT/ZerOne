import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Terminal, UserPlus, Users, ShieldAlert, ChevronLeft, Eye, EyeOff, Copy, Check, Zap } from 'lucide-react'

// ─── Matrix Rain Canvas ───────────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const cols = Math.floor(canvas.width / 16)
    const drops = Array(cols).fill(1)
    const chars = 'ZER0NE1アイウエオカキクケサシスセタチツテナニヌネハヒフヘ01010101GEEKSFORGEEKS'
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = '14px JetBrains Mono, monospace'
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillStyle = i % 7 === 0 ? '#ffd700' : '#00ff41'
        ctx.globalAlpha = Math.random() > 0.9 ? 1 : 0.4
        ctx.fillText(char, i * 16, y * 16)
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-20 z-0" />
}

function ScanLines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10" style={{
      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)'
    }} />
  )
}

// ─── Terminal Input ───────────────────────────────────────────────────────────
const HackerInput = ({ label, type = 'text', value, onChange, placeholder, disabled, autoFocus, hint, color = 'green' }) => {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  const c = { green: { label: 'text-green-400/70', border: 'border-green-500/30 focus:border-green-400', text: 'text-green-300', cursor: 'caret-green-400', prompt: 'text-green-500' }, yellow: { label: 'text-yellow-400/70', border: 'border-yellow-500/30 focus:border-yellow-400', text: 'text-yellow-300', cursor: 'caret-yellow-400', prompt: 'text-yellow-500' }, red: { label: 'text-red-400/70', border: 'border-red-500/30 focus:border-red-400', text: 'text-red-300', cursor: 'caret-red-400', prompt: 'text-red-500' } }[color] || {}
  return (
    <div className="space-y-1 w-full">
      <div className="flex items-center justify-between">
        <label className={`font-mono text-[11px] uppercase tracking-[0.2em] ${c.label}`}>{label}</label>
        {hint && <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{hint}</span>}
      </div>
      <div className="relative">
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm select-none ${c.prompt}`}>{'>'}</span>
        <input
          type={isPass && !show ? 'password' : 'text'}
          value={value} onChange={onChange} placeholder={placeholder}
          disabled={disabled} autoFocus={autoFocus} required
          className={`w-full bg-black/60 border ${c.border} pl-8 pr-10 py-3 font-mono ${c.text} text-sm placeholder:text-white/10 outline-none transition-all duration-200 disabled:opacity-40 ${c.cursor}`}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}

const HackerButton = ({ children, type = 'button', onClick, disabled, loading, variant = 'green' }) => {
  const colors = {
    green:  'border-green-500/60  text-green-400  hover:bg-green-500/10  hover:border-green-400  hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]',
    yellow: 'border-yellow-500/60 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]',
    red:    'border-red-500/60    text-red-400    hover:bg-red-500/10    hover:border-red-400    hover:shadow-[0_0_20px_rgba(255,68,68,0.3)]',
  }[variant]
  return (
    <motion.button type={type} onClick={onClick} disabled={disabled || loading}
      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
      className={`relative w-full py-3.5 border font-mono text-sm uppercase tracking-[0.2em] transition-all duration-200 disabled:opacity-40 ${colors}`}>
      <span className="flex items-center justify-center gap-2">
        {loading ? (<><motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}>█</motion.span><span>PROCESSING...</span></>) : children}
      </span>
    </motion.button>
  )
}

// ─── Team Code Display (shown after Create) ───────────────────────────────────
function TeamCodeDisplay({ teamCode, onDone }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(teamCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
      <div className="font-mono text-[10px] text-green-400/60 uppercase tracking-[0.3em]">// team_initialized</div>
      <div className="border border-green-500/20 bg-black/60 p-6 space-y-4">
        <p className="font-mono text-[10px] text-green-400/50 uppercase tracking-widest">INVITE_CODE — Share with teammates</p>
        <div className="flex items-center justify-center gap-4">
          <span className="font-mono font-bold text-4xl text-green-300 tracking-[0.4em] drop-shadow-[0_0_15px_rgba(0,255,65,0.6)]">{teamCode}</span>
          <button onClick={copy} className="p-2 border border-green-500/20 text-green-600 hover:text-green-400 hover:border-green-400/40 transition-all">
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>
        <p className="font-mono text-[10px] text-green-900">// teammates use this code to join — keep it safe</p>
      </div>
      <HackerButton onClick={onDone} variant="green">
        <Zap size={14} /> ENTER SECURE DASHBOARD
      </HackerButton>
    </motion.div>
  )
}

// ─── Typing Effect ────────────────────────────────────────────────────────────
function TypedText({ text, className }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0; setDisplayed('')
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++ } else clearInterval(iv)
    }, 60)
    return () => clearInterval(iv)
  }, [text])
  return <span className={className}>{displayed}<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} className="inline-block w-[2px] h-[1em] bg-green-400 ml-0.5 align-middle" /></span>
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()
  const { createTeam, joinTeam, loginTeam, loginAdmin, user, token } = useAppStore()

  const [mode, setMode] = useState('select')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [teamCode, setTeamCode] = useState(null) // shown after create

  // Create Team fields
  const [teamName, setTeamName]   = useState('')
  const [leadName, setLeadName]   = useState('')
  const [password, setPassword]   = useState('')

  // Join Team fields
  const [joinCode,     setJoinCode]     = useState('')
  const [memberName,   setMemberName]   = useState('')

  // Login Team fields
  const [loginName,    setLoginName]    = useState('')
  const [loginPass,    setLoginPass]    = useState('')

  // Admin fields
  const [adminEmail,   setAdminEmail]   = useState('')
  const [adminPass,    setAdminPass]    = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (token && user) {
      const role = user.role
      if (role === 'superadmin' || role === 'judge') navigate('/admin')
      else navigate('/dashboard')
    }
  }, [token, user, navigate])

  const reset = () => {
    setMode('select'); setError(''); setTeamCode(null)
    setTeamName(''); setLeadName(''); setPassword('')
    setJoinCode(''); setMemberName('')
    setLoginName(''); setLoginPass('')
    setAdminEmail(''); setAdminPass('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)

    if (mode === 'create') {
      if (!teamName.trim() || !leadName.trim() || !password) {
        setError('All fields are required'); setLoading(false); return
      }
      const res = await createTeam(teamName, leadName, password)
      if (!res.success) { setError(res.error); setLoading(false); return }
      setTeamCode(res.teamCode) // show code display; login already happened in store
      setLoading(false); return
    }

    if (mode === 'join') {
      if (!joinCode.trim() || !memberName.trim()) {
        setError('Team code and your name are required'); setLoading(false); return
      }
      const res = await joinTeam(joinCode, memberName)
      if (!res.success) { setError(res.error); setLoading(false); return }
      // useEffect will redirect to /dashboard
      return
    }

    if (mode === 'login') {
      const res = await loginTeam(loginName, loginPass)
      if (!res.success) { setError(res.error); setLoading(false); return }
      return
    }

    if (mode === 'admin') {
      const res = await loginAdmin(adminEmail, adminPass)
      if (!res.success) { setError(res.error); setLoading(false); return }
      return
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full bg-black flex relative overflow-hidden font-mono">
      <MatrixRain />
      <ScanLines />
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,255,65,0.04) 0%, transparent 70%)' }} />

      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-14 z-20 relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 animate-pulse" />
            <span className="font-mono text-[10px] text-green-400/60 uppercase tracking-[0.3em]">GeeksForGeeks ITER</span>
          </div>
          <div className="font-mono text-[10px] text-green-900 uppercase tracking-widest pl-4">// official club event</div>
        </div>

        <div className="space-y-8">
          <div className="relative">
            <motion.div animate={{ opacity: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 4 }}
              className="font-mono font-black text-[7rem] leading-none tracking-tight select-none"
              style={{ color: 'transparent', WebkitTextStroke: '1px rgba(0,255,65,0.8)', textShadow: '0 0 40px rgba(0,255,65,0.3)' }}>
              ZER<span style={{ WebkitTextStroke: '1px rgba(255,215,0,0.8)', textShadow: '0 0 40px rgba(255,215,0,0.3)' }}>ONE</span>
            </motion.div>
            <motion.div animate={{ x: [-2, 2, -2], opacity: [0, 0.5, 0] }} transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
              className="absolute top-0 left-0 font-mono font-black text-[7rem] leading-none tracking-tight text-green-400 pointer-events-none select-none"
              style={{ filter: 'blur(1px)', clipPath: 'inset(40% 0 30% 0)' }}>
              ZER<span className="text-yellow-400">ONE</span>
            </motion.div>
          </div>
          <div className="space-y-3 max-w-md">
            <div className="font-mono text-green-400/80 text-lg">{'>'} Competitive Cipher Event</div>
            <p className="font-mono text-sm text-green-900/80 leading-relaxed">
              Team Lead creates a team and shares the 6-char invite code with teammates. Three rounds of live cryptography. Fullscreen enforced — no exits allowed.
            </p>
          </div>
          <div className="flex gap-8">
            {[{ val: '3', label: 'Rounds' }, { val: '11', label: 'Ciphers' }, { val: 'GFG', label: 'ITER Club' }].map(({ val, label }) => (
              <div key={label} className="space-y-1">
                <div className="font-mono font-bold text-2xl text-green-300" style={{ textShadow: '0 0 15px rgba(0,255,65,0.5)' }}>{val}</div>
                <div className="font-mono text-[10px] text-green-900 uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="font-mono text-[10px] text-green-900 uppercase tracking-widest">sys.status = <span className="text-green-400">ONLINE</span></div>
          <div className="font-mono text-[10px] text-green-900 uppercase tracking-widest">event.organizer = <span className="text-yellow-500/70">"GeeksForGeeks ITER Chapter"</span></div>
          <div className="font-mono text-[10px] text-green-900 uppercase tracking-widest">platform.version = <span className="text-green-400/50">"ZerOne v3.1.0"</span></div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 lg:max-w-[480px] flex flex-col items-stretch justify-center p-6 md:p-10 z-20 relative border-l border-green-500/10">
        {/* Terminal header bar */}
        <div className="border border-green-500/20 border-b-0 bg-black/80 px-4 py-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <span className="ml-3 font-mono text-[10px] text-green-500/40 uppercase tracking-widest">zerone://auth.terminal — {mode.toUpperCase()}</span>
        </div>

        <div className="flex-1 border border-green-500/20 bg-black/80 backdrop-blur-xl p-7 md:p-8 relative overflow-hidden"
          style={{ boxShadow: '0 0 60px rgba(0,255,65,0.05), inset 0 0 60px rgba(0,0,0,0.5)' }}>
          {/* Corner accents */}
          {[['top-0 left-0 border-t border-l', ''], ['top-0 right-0 border-t border-r', ''], ['bottom-0 left-0 border-b border-l', ''], ['bottom-0 right-0 border-b border-r', '']].map(([cls], i) => (
            <div key={i} className={`absolute w-4 h-4 border-green-400/40 ${cls}`} />
          ))}

          {/* Mobile brand */}
          <div className="lg:hidden mb-6 text-center">
            <div className="font-mono font-black text-4xl" style={{ color: 'transparent', WebkitTextStroke: '1px rgba(0,255,65,0.8)' }}>
              ZER<span style={{ WebkitTextStroke: '1px rgba(255,215,0,0.8)' }}>ONE</span>
            </div>
            <div className="font-mono text-[10px] text-green-900 tracking-widest mt-1">GeeksForGeeks ITER</div>
          </div>

          {/* Back button */}
          <AnimatePresence>
            {mode !== 'select' && !teamCode && (
              <motion.button initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                onClick={reset}
                className="mb-6 flex items-center gap-2 font-mono text-xs text-green-700 hover:text-green-400 transition-colors uppercase tracking-widest">
                <ChevronLeft size={14} /> cd ../ back
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ─── MODE SELECT ─── */}
            {mode === 'select' && (
              <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-7">
                <div>
                  <div className="font-mono text-[10px] text-green-400/50 uppercase tracking-[0.3em] mb-2">// authenticate</div>
                  <TypedText text="SELECT ACCESS VECTOR:" className="font-mono text-green-400 text-sm uppercase tracking-widest" />
                </div>
                <div className="space-y-3">
                  {/* Create Team */}
                  <motion.button whileHover={{ x: 4 }} onClick={() => setMode('create')}
                    className="w-full flex items-center gap-4 p-4 border border-green-500/20 hover:border-green-400/50 hover:bg-green-500/5 transition-all text-left group">
                    <div className="w-10 h-10 border border-green-500/30 flex items-center justify-center text-green-500 group-hover:text-green-300 transition-all flex-shrink-0">
                      <UserPlus size={18} />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-green-300 uppercase tracking-wider group-hover:text-green-200">./create_team.sh</div>
                      <div className="font-mono text-[10px] text-green-900 mt-0.5">Team Lead — Register new team, get invite code</div>
                    </div>
                    <span className="ml-auto font-mono text-green-900 group-hover:text-green-500 text-xs">→</span>
                  </motion.button>

                  {/* Join Team */}
                  <motion.button whileHover={{ x: 4 }} onClick={() => setMode('join')}
                    className="w-full flex items-center gap-4 p-4 border border-yellow-500/20 hover:border-yellow-400/50 hover:bg-yellow-500/5 transition-all text-left group">
                    <div className="w-10 h-10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 group-hover:text-yellow-300 transition-all flex-shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-yellow-300 uppercase tracking-wider group-hover:text-yellow-200">./join_team.sh</div>
                      <div className="font-mono text-[10px] text-yellow-900 mt-0.5">Teammate — Enter invite code from your Lead</div>
                    </div>
                    <span className="ml-auto font-mono text-yellow-900 group-hover:text-yellow-500 text-xs">→</span>
                  </motion.button>

                  {/* Login (returning lead) */}
                  <motion.button whileHover={{ x: 4 }} onClick={() => setMode('login')}
                    className="w-full flex items-center gap-4 p-3 border border-blue-500/15 hover:border-blue-400/30 hover:bg-blue-500/5 transition-all text-left group opacity-60 hover:opacity-90">
                    <div className="w-8 h-8 border border-blue-500/20 flex items-center justify-center text-blue-400/60 group-hover:text-blue-300 transition-all flex-shrink-0">
                      <Terminal size={14} />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-blue-300/70 uppercase tracking-wider">./login_team.sh</div>
                      <div className="font-mono text-[10px] text-white/20">Returning Lead — Sign back in</div>
                    </div>
                  </motion.button>

                  {/* Admin */}
                  <motion.button whileHover={{ x: 4 }} onClick={() => setMode('admin')}
                    className="w-full flex items-center gap-4 p-3 border border-white/5 hover:border-white/10 transition-all text-left group opacity-40 hover:opacity-70">
                    <div className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white/60 transition-all flex-shrink-0">
                      <ShieldAlert size={14} />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-white/50 uppercase tracking-wider">./sudo_access.sh</div>
                      <div className="font-mono text-[10px] text-white/20">Admin override — authorized personnel only</div>
                    </div>
                  </motion.button>
                </div>
                <div className="pt-2 border-t border-green-500/10">
                  <div className="font-mono text-[10px] text-green-900">
                    <span className="text-green-400/40">org</span> = "GeeksForGeeks ITER" &nbsp;|&nbsp; <span className="text-green-400/40">event</span> = "ZerOne"
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── CREATE TEAM ─── */}
            {mode === 'create' && !teamCode && (
              <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="font-mono text-[10px] text-green-400/50 uppercase tracking-[0.3em] mb-1">// create_team.sh</div>
                  <div className="font-mono text-green-400 text-sm uppercase tracking-widest">INITIALIZE NEW SQUAD</div>
                  <div className="font-mono text-[10px] text-green-900 mt-1">You will receive a 6-char invite code to share with teammates</div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <HackerInput label="team_name" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. OMEGA_PROTOCOL" autoFocus color="green" />
                  <HackerInput label="your_name (Team Lead)" value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="your display name" color="green" />
                  <HackerInput label="team_password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="min 4 chars" hint="[Lead re-login]" color="green" />
                  {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-red-400 bg-red-500/5 border border-red-500/20 p-3 flex items-center gap-2"><ShieldAlert size={12} /> ERR: {error}</motion.div>}
                  <div className="pt-1"><HackerButton type="submit" loading={loading} variant="green">CREATE TEAM + GET CODE</HackerButton></div>
                </form>
              </motion.div>
            )}

            {/* ─── TEAM CODE DISPLAY ─── */}
            {mode === 'create' && teamCode && (
              <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <TeamCodeDisplay teamCode={teamCode} onDone={() => navigate('/dashboard')} />
              </motion.div>
            )}

            {/* ─── JOIN TEAM ─── */}
            {mode === 'join' && (
              <motion.div key="join" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="font-mono text-[10px] text-yellow-400/50 uppercase tracking-[0.3em] mb-1">// join_team.sh</div>
                  <div className="font-mono text-yellow-400 text-sm uppercase tracking-widest">LINK TO EXISTING SQUAD</div>
                  <div className="font-mono text-[10px] text-yellow-900 mt-1">Get the 6-char code from your Team Lead</div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <HackerInput label="invite_code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="XXXXXX" autoFocus color="yellow" />
                  <HackerInput label="your_name" value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="your display name" color="yellow" />
                  {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-red-400 bg-red-500/5 border border-red-500/20 p-3 flex items-center gap-2"><ShieldAlert size={12} /> ERR: {error}</motion.div>}
                  <div className="pt-1"><HackerButton type="submit" loading={loading} variant="yellow">JOIN SQUAD</HackerButton></div>
                </form>
              </motion.div>
            )}

            {/* ─── TEAM LOGIN (returning lead) ─── */}
            {mode === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="font-mono text-[10px] text-blue-400/50 uppercase tracking-[0.3em] mb-1">// login_team.sh</div>
                  <div className="font-mono text-blue-300 text-sm uppercase tracking-widest">AUTHENTICATE LEAD</div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <HackerInput label="team_name" value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="your team name" autoFocus color="green" />
                  <HackerInput label="team_password" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" color="green" />
                  {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-red-400 bg-red-500/5 border border-red-500/20 p-3 flex items-center gap-2"><ShieldAlert size={12} /> ERR: {error}</motion.div>}
                  <div className="pt-1"><HackerButton type="submit" loading={loading} variant="green"><Zap size={14} /> ACCESS DASHBOARD</HackerButton></div>
                </form>
              </motion.div>
            )}

            {/* ─── ADMIN ─── */}
            {mode === 'admin' && (
              <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="font-mono text-[10px] text-red-400/50 uppercase tracking-[0.3em] mb-1">// sudo_access.sh</div>
                  <div className="font-mono text-red-400 text-sm uppercase tracking-widest">ROOT AUTHORIZATION</div>
                  <div className="font-mono text-[10px] text-red-900/60 mt-1">Restricted — authorized personnel only</div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <HackerInput label="admin_email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@zerone.io" autoFocus color="red" />
                  <HackerInput label="admin_password" type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="••••••••••••" color="red" />
                  {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-red-400 bg-red-500/5 border border-red-500/20 p-3 flex items-center gap-2"><ShieldAlert size={12} /> {error}</motion.div>}
                  <div className="pt-1"><HackerButton type="submit" loading={loading} variant="red">AUTHORIZE OVERRIDE</HackerButton></div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Terminal footer */}
        <div className="border border-green-500/20 border-t-0 bg-black/60 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={10} className="text-green-400/40" />
            <span className="font-mono text-[9px] text-green-400/30 uppercase tracking-widest">GFG ITER — ZerOne Platform</span>
          </div>
          <div className="flex gap-1.5">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
            <span className="font-mono text-[9px] text-green-900 uppercase tracking-widest">sys.online</span>
          </div>
        </div>
      </div>
    </div>
  )
}

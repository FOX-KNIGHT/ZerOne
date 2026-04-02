import { useState } from 'react'
import { motion } from 'framer-motion'
import { Power, StopCircle, Clock, Radio, Zap, AlertTriangle, Timer } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { AnimatedButton } from '../../components/ui/AnimatedButton'
import { NeonInput } from '../../components/ui/NeonInput'

function CircularCountdown({ total = 3600, current = 3561 }) {
  const radius = 90
  const circ = 2 * Math.PI * radius
  const frac = current / total
  const dash = circ * frac
  const m = Math.floor(current / 60)
  const s = current % 60
  const isUrgent = frac < 0.2

  return (
    <div className="relative flex items-center justify-center w-56 h-56 mx-auto">
      <svg viewBox="0 0 220 220" className="-rotate-90 w-full h-full">
        {/* Outer decorative ring */}
        <circle cx="110" cy="110" r={radius + 12} fill="none"
          stroke="rgba(0,255,65,0.04)" strokeWidth="1"
          strokeDasharray="4 8"
        />
        {/* Track */}
        <circle cx="110" cy="110" r={radius} fill="none"
          stroke="rgba(0,255,65,0.08)" strokeWidth="10"
        />
        {/* Progress */}
        <motion.circle
          cx="110" cy="110" r={radius}
          fill="none"
          stroke={isUrgent ? '#ff4444' : '#00ff41'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          style={{
            filter: isUrgent
              ? 'drop-shadow(0 0 10px rgba(255,68,68,0.8))'
              : 'drop-shadow(0 0 10px rgba(0,255,65,0.6))',
          }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: 'linear' }}
        />
        {/* Tick marks */}
        {[...Array(60)].map((_, i) => {
          const angle = (i / 60) * 2 * Math.PI - Math.PI / 2
          const r1 = radius + 3, r2 = i % 5 === 0 ? radius + 9 : radius + 5
          return (
            <line key={i}
              x1={110 + r1 * Math.cos(angle)} y1={110 + r1 * Math.sin(angle)}
              x2={110 + r2 * Math.cos(angle)} y2={110 + r2 * Math.sin(angle)}
              stroke={`rgba(0,255,65,${i % 5 === 0 ? 0.4 : 0.1})`} strokeWidth="1"
            />
          )
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Timer</p>
        <motion.p
          className={`font-mono font-black text-4xl mt-1 ${isUrgent ? 'text-red-400 text-glow-red' : 'text-primary text-glow'}`}
          animate={isUrgent ? { opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </motion.p>
        <p className="font-mono text-[9px] text-white/25 mt-1">REMAINING</p>
      </div>
    </div>
  )
}

export default function AdminRounds() {
  const [roundName, setRoundName] = useState('Round 2: Exploitation')
  const [duration, setDuration] = useState('3600')
  const [isActive, setIsActive] = useState(true)
  const [broadcasting, setBroadcasting] = useState(false)

  const handleActivate = () => {
    setBroadcasting(true)
    setTimeout(() => setBroadcasting(false), 3000)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">&gt; event control</p>
        <h1 className="font-heading font-black text-4xl text-white">
          Round <span className="shimmer-text">Control</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ─ Broadcast Control ─ */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-primary/10">
              <Radio size={15} className={`${isActive ? 'text-primary animate-pulse' : 'text-white/30'}`} />
              <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white">Broadcast Control</h2>
              <span className={`ml-auto flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                isActive
                  ? 'text-success bg-success/10 border-success/25'
                  : 'text-white/30 bg-white/5 border-white/10'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-white/30'}`} />
                {isActive ? 'LIVE' : 'STANDBY'}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest block mb-2">
                  Round Identifier
                </label>
                <NeonInput
                  value={roundName}
                  onChange={e => setRoundName(e.target.value)}
                  placeholder="Round Name"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest block mb-2">
                  Duration (seconds)
                </label>
                <NeonInput
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="3600"
                />
              </div>

              {/* Warning notice */}
              <div className="flex items-start gap-3 p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <AlertTriangle size={14} className="text-warning flex-shrink-0 mt-0.5" />
                <p className="font-mono text-[11px] text-warning/70 leading-relaxed">
                  Activating broadcasts a global socket event to all connected clients. Ensure all judges are ready.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <AnimatedButton
                  variant="danger"
                  className="w-full gap-2"
                  onClick={() => setIsActive(false)}
                >
                  <StopCircle size={15} />
                  HALT
                </AnimatedButton>

                <div className="relative">
                  <AnimatedButton
                    variant="primary"
                    className="w-full gap-2"
                    onClick={handleActivate}
                  >
                    <Power size={15} />
                    ACTIVATE
                  </AnimatedButton>
                  {/* Broadcast pulse rings */}
                  {broadcasting && (
                    <>
                      <motion.div
                        className="absolute inset-0 border-2 border-primary rounded-sm"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1 }}
                      />
                      <motion.div
                        className="absolute inset-0 border border-primary rounded-sm"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ─ Timer Display ─ */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard variant="hologram" className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2 mb-8">
              <Timer size={14} className="text-primary" />
              <span className="font-mono text-[10px] text-primary/50 uppercase tracking-widest">Global Timer Target</span>
            </div>

            <CircularCountdown total={parseInt(duration) || 3600} current={3561} />

            <div className="mt-8 flex items-center gap-4">
              <div className="text-center">
                <p className="font-mono text-2xl font-black text-primary text-glow">59</p>
                <p className="font-mono text-[9px] text-white/30 uppercase mt-0.5">minutes</p>
              </div>
              <span className="font-mono text-2xl text-white/20">:</span>
              <div className="text-center">
                <p className="font-mono text-2xl font-black text-primary text-glow">21</p>
                <p className="font-mono text-[9px] text-white/30 uppercase mt-0.5">seconds</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-white/20">
              <Zap size={11} className="text-primary" />
              <span>Round: <span className="text-white/50">{roundName}</span></span>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

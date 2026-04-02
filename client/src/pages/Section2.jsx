import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Zap, Target } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { GlassCard } from '../components/ui/GlassCard'

export default function Section2() {
  const { user, activeRound, timeLeft } = useAppStore()
  const [roundDuration, setRoundDuration] = useState(3600)

  useEffect(() => {
    if (activeRound?.duration) setRoundDuration(activeRound.duration)
  }, [activeRound])

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">
          &gt; section_02 / manual_verification
        </p>
        <h1 className="font-heading font-black text-4xl text-white">
          <span className="shimmer-text">Offline Challenge</span>
        </h1>
        <p className="font-mono text-white/40 text-sm mt-3 leading-relaxed max-w-2xl">
          Complete the offline tasks assigned by the organizers. Keep an eye on the timer. 
          Your answers will be manually verified by our team, and points will be awarded directly to the system.
        </p>
      </motion.div>

      {/* Standby Info Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <GlassCard variant="hologram" className="p-8 text-center relative overflow-hidden min-h-[300px] flex flex-col justify-center items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

          {!activeRound || activeRound.roundNumber !== 2 ? (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-red-400/20 flex items-center justify-center mb-4 animate-[pulse_2s_ease-in-out_Infinity]">
                <Clock size={24} className="text-red-400/60" />
              </div>
              <p className="font-mono text-red-400/60 text-lg uppercase tracking-widest">Access Restricted</p>
              <p className="font-mono text-white/30 text-xs mt-2">Section 2 has not been started by the administrator yet.</p>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
              <div className="flex items-center gap-2 mb-6 border border-primary/20 bg-primary/10 px-4 py-2 rounded-full">
                <Zap size={16} className="text-primary animate-pulse" />
                <span className="font-mono font-bold text-sm text-primary uppercase tracking-widest">
                  Round {activeRound.roundNumber} Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full">
                {/* Timer block */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-5 text-center">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Time Remaining</p>
                  <p className="font-mono font-black text-3xl text-white">
                    {timeLeft !== null ? (
                      <>
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                        {(timeLeft % 60).toString().padStart(2, '0')}
                      </>
                    ) : '--:--'}
                  </p>
                </div>

                {/* Points block */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-5 text-center">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Section 2 Points</p>
                  <p className="font-mono font-black text-3xl text-green-400 flex items-center justify-center gap-2">
                    <Target size={20} className="text-green-500/50" />
                    {user?.round2Score || 0}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-2 text-white/40 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                <CheckCircle size={14} className="text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-widest">
                  Scores update automatically when graded by an admin.
                </span>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}

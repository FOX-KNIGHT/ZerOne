import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, AlertTriangle, ShieldCheck, Cpu, Activity, Eye, Zap, TrendingUp } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAppStore } from '../../store/useAppStore'

function useCountUp(target, duration = 1500) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!target) return
    let s = 0, step = target / (duration / 16)
    const t = setInterval(() => {
      s += step
      if (s >= target) { setV(target); clearInterval(t) }
      else setV(Math.floor(s))
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return v
}

// Animated radar/circle resource widget
function RadarWidget() {
  const rings = [0.3, 0.55, 0.8, 1]
  const metrics = [
    { label: 'CPU', value: 42, color: '#00ff41', angle: 0 },
    { label: 'MEM', value: 68, color: '#00f2ff', angle: 90 },
    { label: 'NET', value: 85, color: '#ffaa00', angle: 180 },
    { label: 'DISK', value: 31, color: '#bf00ff', angle: 270 },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {rings.map((r, i) => (
            <circle key={i} cx="100" cy="100" r={r * 85} fill="none"
              stroke="rgba(0,255,65,0.06)" strokeWidth="1"
            />
          ))}
          {metrics.map((m, i) => {
            const angle = (m.angle * Math.PI) / 180
            const r = (m.value / 100) * 85
            const x = 100 + r * Math.cos(angle)
            const y = 100 + r * Math.sin(angle)
            return (
              <motion.line key={i} x1="100" y1="100" x2={x} y2={y}
                stroke={m.color} strokeWidth="2" strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${m.color})` }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.2 }}
              />
            )
          })}
          {metrics.map((m, i) => {
            const angle = (m.angle * Math.PI) / 180
            const r = (m.value / 100) * 85
            const x = 100 + r * Math.cos(angle)
            const y = 100 + r * Math.sin(angle)
            return (
              <motion.circle key={i} cx={x} cy={y} r="4"
                fill={m.color}
                style={{ filter: `drop-shadow(0 0 6px ${m.color})` }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: i * 0.2 + 0.8 }}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] text-primary/40 uppercase tracking-widest">RADAR</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {metrics.map(m => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: m.color, boxShadow: `0 0 6px ${m.color}` }} />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[10px] text-white/40">{m.label}</span>
                <span className="font-mono text-[10px]" style={{ color: m.color }}>{m.value}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.color, boxShadow: `0 0 4px ${m.color}` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



export default function AdminOverview() {
  const { registeredTeams, fetchTeams, fetchAnalytics, fetchActiveRound, activeRound, recentActivities } = useAppStore()
  const [analytics, setAnalytics] = useState(null)
  
  useEffect(() => {
    fetchTeams()
    fetchActiveRound()
    fetchAnalytics().then(setAnalytics)
  }, [fetchTeams, fetchAnalytics, fetchActiveRound])

  const teamsCount = useCountUp(analytics?.totalTeams || registeredTeams.length || 0)
  const solvesCount = useCountUp(analytics?.totalSubmissions || 0)

  const stats = [
    { title: 'Total Teams', value: teamsCount, raw: analytics?.totalTeams || 0, icon: Users, color: 'text-primary', glow: '#00ff41', border: 'border-primary/20' },
    { title: 'Active Round', value: activeRound ? `Round ${activeRound.roundNumber}` : 'None', isString: true, icon: Cpu, color: 'text-accent', glow: '#00f2ff', border: 'border-accent/20' },
    { title: 'Total Solves', value: solvesCount, raw: analytics?.totalSubmissions || 0, icon: ShieldCheck, color: 'text-success', glow: '#00ff41', border: 'border-success/20' },
    { title: 'Active Alerts', value: registeredTeams.filter(t => t.isDisqualified).length, isString: false, icon: AlertTriangle, color: 'text-warning', glow: '#ffaa00', border: 'border-warning/20' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">&gt; system overview</p>
        <h1 className="font-heading font-black text-4xl text-white">
          System <span className="shimmer-text">Status</span>
        </h1>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`relative border ${stat.border} bg-black/70 rounded-xl p-5 overflow-hidden card-shine backdrop-blur-md`}>
                {/* Icon watermark */}
                <div className="absolute -right-3 -bottom-3 opacity-5">
                  <Icon size={80} className={stat.color} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-lg bg-black/60 border border-white/5 ${stat.color}`}>
                      <Icon size={16} />
                    </div>
                    {stat.title === 'Active Alerts' && stat.value > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" />
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-1">{stat.title}</p>
                  <p className={`font-heading font-black text-4xl ${stat.color}`}
                    style={{ textShadow: `0 0 20px ${stat.glow}50` }}>
                    {stat.isString ? stat.value : stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Live Submissions Feed — 3/5 */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="flex flex-col min-h-[420px]">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-primary/10">
              <Eye size={15} className="text-accent" />
              <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white">Live Submission Feed</h2>
              <span className="ml-auto flex items-center gap-1.5 text-xs font-mono text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full">
                <Activity size={10} className="animate-pulse" />
                STREAMING
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {recentActivities.length > 0 ? recentActivities.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg bg-white/2 hover:bg-white/4 border border-white/4 hover:border-white/8 transition-all group"
                >
                  <span className="w-1.5 h-8 rounded-full flex-shrink-0 bg-success shadow-[0_0_6px_rgba(0,255,65,0.6)]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs">
                      <span className="text-white font-bold">{item.team}</span>
                      <span className="text-white/40 mx-1">solved</span>
                      <span className="text-accent">{item.challenge}</span>
                    </p>
                    {item.pts && (
                      <p className="font-mono text-[10px] text-success/70 mt-0.5">+{item.pts} pts</p>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-white/25 flex-shrink-0">{item.time}</span>
                </motion.div>
              )) : (
                <div className="flex items-center justify-center h-full text-white/10 font-mono text-xs italic">
                  Waiting for live submissions...
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Resource Monitor — 2/5 */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="flex flex-col min-h-[420px]">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-primary/10">
              <Cpu size={15} className="text-warning" />
              <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white">System Resources</h2>
            </div>
            <div className="flex-1">
              <RadarWidget />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

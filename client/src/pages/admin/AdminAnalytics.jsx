import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell
} from 'recharts'
import { GlassCard } from '../../components/ui/GlassCard'
import { TrendingUp, Award, Clock, Users } from 'lucide-react'

const performanceData = [
  { time: '10:00', solves: 12 },
  { time: '10:30', solves: 45 },
  { time: '11:00', solves: 80 },
  { time: '11:30', solves: 120 },
  { time: '12:00', solves: 190 },
  { time: '12:30', solves: 250 },
  { time: '13:00', solves: 318 },
]

const challengeStats = [
  { name: 'Warmup', solves: 40, color: '#00ff41' },
  { name: 'Bypass MF', solves: 32, color: '#00f2ff' },
  { name: 'SQL Inj.', solves: 28, color: '#ffaa00' },
  { name: 'RSA', solves: 15, color: '#bf00ff' },
  { name: 'Buffer OVF', solves: 4, color: '#ff4444' },
]

const CustomTooltip = ({ active, payload, label, color = '#00ff41' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black/95 border rounded-lg px-4 py-3 shadow-2xl" style={{ borderColor: `${color}40` }}>
      <p className="font-mono text-[10px] text-white/40 mb-1">{label}</p>
      <p className="font-mono font-black text-lg" style={{ color }}>
        {payload[0].value} <span className="text-xs font-normal opacity-60">solves</span>
      </p>
    </div>
  )
}

const KPI_DATA = [
  { label: 'Participants', value: '42', sub: 'teams registered', icon: Users, color: 'text-primary', glow: '#00ff41' },
  { label: 'Solve Rate', value: '87%', sub: 'avg per team', icon: Award, color: 'text-accent', glow: '#00f2ff' },
  { label: 'Avg Time', value: '14m', sub: 'per challenge', icon: Clock, color: 'text-warning', glow: '#ffaa00' },
  { label: 'Growth', value: '+42%', sub: 'vs last event', icon: TrendingUp, color: 'text-success', glow: '#00ff41' },
]

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">&gt; telemetry</p>
        <h1 className="font-heading font-black text-4xl text-white">
          Analytics & <span className="shimmer-text">Telemetry</span>
        </h1>
      </div>

      {/* ── KPI CHIPS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative border border-white/8 bg-black/60 rounded-xl p-5 overflow-hidden card-shine backdrop-blur-md"
            >
              <div className="absolute -right-2 -bottom-2 opacity-5">
                <Icon size={64} className={kpi.color} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={kpi.color} />
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{kpi.label}</span>
              </div>
              <p className={`font-heading font-black text-3xl ${kpi.color}`}
                style={{ textShadow: `0 0 20px ${kpi.glow}40` }}>
                {kpi.value}
              </p>
              <p className="font-mono text-[10px] text-white/25 mt-1">{kpi.sub}</p>
            </motion.div>
          )
        })}
      </div>

      {/* ── CHARTS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Area Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="h-[380px] flex flex-col">
            <div className="mb-5 pb-4 border-b border-primary/10">
              <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white">
                Global Solve Rate — Timeline
              </h2>
              <p className="font-mono text-[10px] text-white/30 mt-1">Cumulative flag captures over time</p>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ff41" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00ff41" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="time"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono', fontSize: 10 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono', fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip color="#00ff41" />} />
                  <Area
                    type="monotone"
                    dataKey="solves"
                    stroke="#00ff41"
                    strokeWidth={2}
                    fill="url(#areaGreen)"
                    dot={{ fill: '#00ff41', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: '#00ff41', boxShadow: '0 0 10px #00ff41' }}
                    style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,65,0.4))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="h-[380px] flex flex-col">
            <div className="mb-5 pb-4 border-b border-accent/10">
              <h2 className="font-mono font-bold text-sm uppercase tracking-widest text-white">
                Challenge Solve Distribution
              </h2>
              <p className="font-mono text-[10px] text-white/30 mt-1">Total solves per mission node</p>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={challengeStats} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono', fontSize: 10 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono', fontSize: 10 }}
                    width={75}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={<CustomTooltip color="#00f2ff" />}
                  />
                  <Bar dataKey="solves" radius={[0, 4, 4, 0]}>
                    {challengeStats.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                        style={{ filter: `drop-shadow(0 0 4px ${entry.color}80)` }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell
} from 'recharts'
import { GlassCard } from '../../components/ui/GlassCard'
import { TrendingUp, Award, Clock, Users, Activity } from 'lucide-react'



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

import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { useAppStore } from '../../store/useAppStore'

const COLORS = ['#00ff41', '#00f2ff', '#ffaa00', '#bf00ff', '#ff4444']

export default function AdminAnalytics() {
  const { fetchAnalytics, registeredTeams } = useAppStore()
  const [data, setData] = useState(null)
  const [challengeStats, setChallengeStats] = useState([])

  useEffect(() => {
    fetchAnalytics().then(setData)
    api.get('/admin/analytics/challenges').then(r => {
      setChallengeStats(r.data.map((c, i) => ({
        name: c.title,
        solves: c.correctSubmissions,
        color: COLORS[i % COLORS.length]
      })))
    }).catch(() => {})
  }, [fetchAnalytics])

  const KPI_DATA = [
    { label: 'Participants', value: data?.totalTeams || registeredTeams.length || '0', sub: 'teams registered', icon: Users, color: 'text-primary', glow: '#00ff41' },
    { label: 'Solve Rate', value: data?.totalSubmissions || '0', sub: 'total flags captured', icon: Award, color: 'text-accent', glow: '#00f2ff' },
    { label: 'Avg Score', value: data?.averageScore || '0', sub: 'points per team', icon: Clock, color: 'text-warning', glow: '#ffaa00' },
    { label: 'Highest', value: data?.highestScore || '0', sub: 'current top score', icon: TrendingUp, color: 'text-success', glow: '#00ff41' },
  ]
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
                Global Performance Metrics
              </h2>
              <p className="font-mono text-[10px] text-white/30 mt-1">Live system telemetry from MongoDB</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center mb-4">
                 <Activity className="text-primary/40 animate-pulse" />
              </div>
              <p className="font-mono text-xs text-white/40 max-w-xs">
                Real-time solve timeline is automatically populated as teams submit flags.
              </p>
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
              {challengeStats.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-full text-white/10 font-mono text-xs italic">
                   No challenges solved yet.
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ban, Edit3, RotateCcw, Search, Users, Shield, ChevronDown, ChevronRight, RefreshCw, UserX, CheckCircle2 } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { AnimatedButton } from '../../components/ui/AnimatedButton'
import { useAppStore } from '../../store/useAppStore'
import { socket } from '../../lib/socket'

export default function AdminTeams() {
  const { registeredTeams, fetchTeams, disqualifyTeam, reinstateTeam, resetTeamProgress, updateTeamScore } = useAppStore()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [editScore, setEditScore] = useState({ teamId: null, delta: '' })

  useEffect(() => {
    fetchTeams()

    // Real-time listener for anti-cheat triggers
    const handleDQAlert = () => {
      fetchTeams()
    }
    socket.on('teamDisqualifiedAlert', handleDQAlert)
    return () => socket.off('teamDisqualifiedAlert', handleDQAlert)
  }, [fetchTeams])

  const filtered = registeredTeams.filter(t =>
    t.teamName.toLowerCase().includes(search.toLowerCase()) ||
    (t.code && t.code.includes(search.toUpperCase()))
  )

  const toggleExpand = (id) => setExpanded(e => e === id ? null : id)

  const handleScoreEdit = (teamId) => {
    const delta = parseInt(editScore.delta)
    if (!isNaN(delta)) {
      updateTeamScore(teamId, delta)
      setEditScore({ teamId: null, delta: '' })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="font-mono text-primary/40 text-xs uppercase tracking-widest mb-1">&gt; team management</p>
          <h1 className="font-heading font-black text-4xl text-white">
            Team <span className="shimmer-text">Registry</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          {[
            { label: 'Registered', val: registeredTeams.length, color: 'text-white' },
            { label: 'Active', val: registeredTeams.filter(t => !t.isDisqualified).length, color: 'text-success' },
            { label: 'Members', val: registeredTeams.reduce((a, t) => a + (t.members?.length || 0), 0), color: 'text-accent' },
            { label: 'DQ\'d', val: registeredTeams.filter(t => t.isDisqualified).length, color: 'text-error' },
          ].map(s => (
            <div key={s.label} className="text-center bg-black/50 border border-white/8 rounded-xl px-4 py-2.5">
              <p className={`font-heading font-black text-xl ${s.color}`}>{s.val}</p>
              <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
        <input type="text" placeholder="Search by name or code..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-black/60 border border-primary/20 rounded-lg pl-10 pr-4 py-3 font-mono text-sm text-primary placeholder:text-primary/20 outline-none focus:border-primary/50 transition-all"
        />
      </div>

      {/* Empty state */}
      {registeredTeams.length === 0 && (
        <GlassCard className="py-20 text-center">
          <Users size={40} className="text-primary/20 mx-auto mb-4" />
          <p className="font-terminal text-primary/30 text-2xl">NO TEAMS REGISTERED</p>
          <p className="font-mono text-white/20 text-sm mt-2">Teams will appear here as players register.</p>
        </GlassCard>
      )}

      {/* Team list */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((team, i) => {
            const isExpanded = expanded === team._id
            const isActive = !team.isDisqualified

            return (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border rounded-xl overflow-hidden backdrop-blur-md transition-all duration-200 ${
                  isActive
                    ? 'border-primary/15 bg-black/60'
                    : 'border-red-500/20 bg-red-950/10 opacity-70'
                }`}
              >
                {/* ── Row header ── */}
                <div
                  className="flex items-center gap-4 p-4 md:p-5 cursor-pointer group hover:bg-white/2 transition-colors"
                  onClick={() => toggleExpand(team._id)}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-heading font-black text-lg border ${
                    isActive ? 'bg-primary/10 border-primary/25 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {team.teamName[0]}
                  </div>

                  {/* Name + code */}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-white text-base truncate">{team.teamName}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="font-terminal text-primary/60 text-xs tracking-widest">#{team.code || 'NO-CODE'}</span>
                      <span className="font-mono text-[10px] text-white/25">
                        {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px] uppercase ${
                    isActive ? 'bg-success/10 text-success border-success/25' : 'bg-error/10 text-error border-error/25'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-error'}`} />
                    {isActive ? 'Active' : 'Disqualified'}
                  </div>

                  {/* Score */}
                  <div className="text-right hidden md:block">
                    <p className="font-mono font-black text-xl text-white/90">{team.score.toLocaleString()}</p>
                    <p className="font-mono text-[10px] text-white/25">pts</p>
                  </div>

                  {/* Expand chevron */}
                  <ChevronDown size={16} className={`text-white/25 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* ── Expanded panel ── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-white/5 overflow-hidden"
                    >
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Member list */}
                        <div>
                          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Users size={11} /> Team Members
                          </p>
                          <div className="space-y-2">
                            {team.members?.map((member, mi) => (
                              <div key={mi} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/2 border border-white/5">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="font-heading font-bold text-xs text-primary">{member[0]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-mono text-xs text-white/80 truncate">{member}</p>
                                  <p className="font-mono text-[10px] text-white/30 mt-0.5">Agent</p>
                                </div>
                              </div>
                            )) || <p className="text-white/20 font-mono text-xs italic">No members identified.</p>}
                          </div>
                        </div>

                        {/* Controls */}
                        <div>
                          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Shield size={11} /> Admin Controls
                          </p>

                          {/* Score adjustment */}
                          <div className="mb-4">
                            <p className="font-mono text-[10px] text-white/25 mb-2">Manual Score Adjustment</p>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="+50"
                                value={editScore.teamId === team._id ? editScore.delta : ''}
                                onChange={e => setEditScore({ teamId: team._id, delta: e.target.value })}
                                className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-primary/50 transition-all"
                              />
                              <button
                                onClick={() => handleScoreEdit(team._id)}
                                className="px-4 py-2 bg-primary/10 border border-primary/25 text-primary rounded-lg font-mono text-xs hover:bg-primary/20 transition-all"
                              >
                                Apply
                              </button>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => resetTeamProgress(team._id)}
                              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-warning/8 border border-warning/20 text-warning/70 rounded-lg font-mono text-xs hover:bg-warning/15 hover:text-warning transition-all"
                            >
                              <RefreshCw size={12} /> Reset Score
                            </button>

                            {isActive ? (
                              <button
                                onClick={() => disqualifyTeam(team._id)}
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-error/8 border border-error/20 text-error/70 rounded-lg font-mono text-xs hover:bg-error/15 hover:text-error transition-all"
                              >
                                <UserX size={12} /> Disqualify
                              </button>
                            ) : (
                              <button
                                onClick={() => reinstateTeam(team._id)}
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-success/8 border border-success/20 text-success/70 rounded-lg font-mono text-xs hover:bg-success/15 hover:text-success transition-all"
                              >
                                <CheckCircle2 size={12} /> Reinstate
                              </button>
                            )}
                          </div>

                          {/* Info */}
                          <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                            <div className="flex justify-between font-mono text-[10px]">
                              <span className="text-white/25">DB ID</span>
                              <span className="text-white/45 truncate ml-4 max-w-[120px]">{team._id}</span>
                            </div>
                            <div className="flex justify-between font-mono text-[10px]">
                              <span className="text-white/25">Status</span>
                              <span className={isActive ? 'text-success/70' : 'text-error/70'}>{isActive ? 'VERIFIED' : 'COMPROMISED'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {filtered.length === 0 && registeredTeams.length > 0 && (
        <div className="py-12 text-center">
          <p className="font-terminal text-primary/30 text-2xl">NO MATCH FOUND</p>
        </div>
      )}
    </div>
  )
}

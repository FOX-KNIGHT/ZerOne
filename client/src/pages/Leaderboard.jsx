import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Crown, Star } from 'lucide-react'
import { cn } from '../lib/utils'

const DUMMY_LEADERBOARD = [
  { rank: 1, team: 'Omega Red', score: 9800, change: 'up', solves: 18, isCurrentTeam: false },
  { rank: 2, team: 'Cipher Punks', score: 8550, change: 'down', solves: 15, isCurrentTeam: false },
  { rank: 3, team: 'Null Pointers', score: 7200, change: 'same', solves: 13, isCurrentTeam: false },
  { rank: 4, team: 'Alpha Squad', score: 6900, change: 'up', solves: 12, isCurrentTeam: true },
  { rank: 5, team: 'Byte Me', score: 5400, change: 'down', solves: 10, isCurrentTeam: false },
  { rank: 6, team: 'Ghost Protocol', score: 4750, change: 'same', solves: 9, isCurrentTeam: false },
  { rank: 7, team: 'Neon Genesis', score: 3200, change: 'down', solves: 6, isCurrentTeam: false },
]

const RANK_CONFIG = {
  1: {
    bg: 'bg-gradient-to-r from-gold/10 via-yellow-500/5 to-transparent',
    border: 'border-gold/40',
    shadow: 'shadow-[0_0_30px_rgba(255,215,0,0.12)]',
    badge: 'bg-gold text-black shadow-neon-gold',
    num: 'text-gold text-glow-gold',
    scale: 'scale-[1.02]',
    icon: Crown,
  },
  2: {
    bg: 'bg-gradient-to-r from-silver/8 to-transparent',
    border: 'border-silver/30',
    shadow: 'shadow-[0_0_20px_rgba(192,192,192,0.08)]',
    badge: 'bg-silver text-black',
    num: 'text-silver',
    scale: '',
    icon: Medal,
  },
  3: {
    bg: 'bg-gradient-to-r from-bronze/8 to-transparent',
    border: 'border-bronze/30',
    shadow: '',
    badge: 'bg-bronze text-black',
    num: 'text-bronze',
    scale: '',
    icon: Medal,
  },
}

export default function Leaderboard() {
  const podium = DUMMY_LEADERBOARD.slice(0, 3)
  const rest = DUMMY_LEADERBOARD.slice(3)

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-gold/10 border border-gold/25 shadow-neon-gold">
          <Trophy size={28} className="text-gold" />
        </div>
        <h1 className="font-heading font-black text-5xl md:text-6xl text-white mb-3">
          Global <span className="shimmer-text">Rankings</span>
        </h1>
        <p className="font-mono text-white/30 text-sm tracking-wider">
          Live leaderboard · Updates in real-time
        </p>
      </motion.div>

      {/* ── PODIUM TOP 3 ── */}
      <div className="grid grid-cols-3 gap-3 items-end">
        {/* 2nd place */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="order-1"
        >
          <PodiumCard entry={podium[1]} height="h-32" />
        </motion.div>

        {/* 1st place — center + tallest */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="order-2 -mb-4"
        >
          <PodiumCard entry={podium[0]} height="h-48" isFirst />
        </motion.div>

        {/* 3rd place */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="order-3"
        >
          <PodiumCard entry={podium[2]} height="h-24" />
        </motion.div>
      </div>

      <div className="neon-divider" />

      {/* ── RANK LIST ── */}
      <div className="space-y-3">
        <AnimatePresence>
          {DUMMY_LEADERBOARD.map((team, index) => {
            const rc = RANK_CONFIG[team.rank]
            const isTop3 = team.rank <= 3

            return (
              <motion.div
                key={team.team}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className={cn(
                  'relative flex items-center justify-between p-4 md:p-5 rounded-xl border backdrop-blur-md transition-all duration-200 group overflow-hidden',
                  rc?.bg || 'bg-black/50',
                  rc?.border || (team.isCurrentTeam ? 'border-primary/40' : 'border-white/8'),
                  rc?.shadow || (team.isCurrentTeam ? 'shadow-[0_0_20px_rgba(0,255,65,0.08)]' : ''),
                  rc?.scale || '',
                  team.isCurrentTeam && !isTop3 ? 'bg-primary/5 border-primary/30' : '',
                  'hover:border-white/20'
                )}
              >
                {/* Hover shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.02] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center gap-4 md:gap-6">
                  {/* Rank badge */}
                  <div className={cn(
                    'w-11 h-11 flex items-center justify-center rounded-xl font-mono font-black text-lg flex-shrink-0',
                    rc?.badge || (team.isCurrentTeam ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-white/50 border border-white/10')
                  )}>
                    {team.rank <= 3 ? team.rank : `#${team.rank}`}
                  </div>

                  {/* Team info */}
                  <div>
                    <h3 className={cn(
                      'font-heading font-bold text-lg',
                      rc?.num || (team.isCurrentTeam ? 'text-primary text-glow' : 'text-white/90')
                    )}>
                      {team.team}
                      {team.isCurrentTeam && (
                        <span className="ml-2 text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded border border-primary/25 font-mono tracking-widest align-middle">
                          YOU
                        </span>
                      )}
                    </h3>
                    <p className="font-mono text-xs text-white/30 mt-0.5">{team.solves} flags captured</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                  {/* Score */}
                  <div className="text-right">
                    <p className="font-mono text-[10px] text-white/30 uppercase mb-0.5">Score</p>
                    <p className={cn(
                      'font-mono font-black text-xl md:text-2xl',
                      rc?.num || (team.isCurrentTeam ? 'text-primary' : 'text-white/90')
                    )}>
                      {team.score.toLocaleString()}
                    </p>
                  </div>

                  {/* Change arrow */}
                  <div className="w-8 flex justify-center">
                    {team.change === 'up' && (
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <TrendingUp size={18} className="text-success drop-shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
                      </motion.div>
                    )}
                    {team.change === 'down' && (
                      <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <TrendingDown size={18} className="text-red-400" />
                      </motion.div>
                    )}
                    {team.change === 'same' && <Minus size={18} className="text-white/20" />}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function PodiumCard({ entry, height, isFirst = false }) {
  const rc = RANK_CONFIG[entry.rank]
  const Icon = rc.icon

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar / rank badge */}
      <div className={cn(
        'relative w-14 h-14 rounded-full flex items-center justify-center border-2 font-heading font-black text-xl',
        entry.rank === 1
          ? 'bg-gold/15 border-gold text-gold shadow-neon-gold animate-float'
          : entry.rank === 2
            ? 'bg-silver/10 border-silver text-silver'
            : 'bg-bronze/10 border-bronze text-bronze'
      )}>
        <Icon size={20} />
        {isFirst && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center text-black text-[10px]">★</span>}
      </div>

      <p className={cn('font-heading font-bold text-center', isFirst ? 'text-base' : 'text-sm', rc.num)}>
        {entry.team}
      </p>

      {/* Podium block */}
      <div className={cn(
        'w-full rounded-t-xl flex flex-col items-center justify-start pt-4 border-t border-l border-r',
        height,
        entry.rank === 1 ? 'bg-gold/10 border-gold/40' : entry.rank === 2 ? 'bg-silver/8 border-silver/25' : 'bg-bronze/8 border-bronze/25'
      )}>
        <p className={cn('font-mono font-black text-lg', rc.num)}>{entry.score.toLocaleString()}</p>
        <p className="font-mono text-[10px] text-white/30 mt-1">pts</p>
        <p className="font-mono text-[10px] text-white/20 mt-1">{entry.solves} flags</p>
      </div>
    </div>
  )
}

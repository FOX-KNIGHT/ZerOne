import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Trophy, LogOut, Menu, X, Wifi, BookOpen, Terminal, KeyRound, Cpu } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function Layout() {
  const location = useLocation()
  const logout = useAppStore(state => state.logout)
  const { user, timeLeft, activeRound } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard',  path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leaderboard',path: '/leaderboard',icon: Trophy },
    { name: 'Phase 0',    path: '/phase0',    icon: BookOpen },
    { name: 'Section 2',  path: '/dashboard', icon: Cpu,      badge: 'Offline' },
    { name: 'Section 3',  path: '/section3',  icon: Terminal },
    { name: 'Final',      path: '/final',     icon: KeyRound },
  ]

  const formatTimeShort = (s) => {
    if (!s) return '--:--'
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-background text-primary">
      {/* Aurora background */}
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />
      <div className="aurora-orb-3" />

      {/* CRT effects */}
      <div className="crt-overlay" />
      <div className="crt-vignette" />
      <div className="crt-scanline-moving" />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16">
        <div className="h-full bg-black/80 border-b border-primary/20 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shadow-[0_4px_40px_rgba(0,0,0,0.8)]">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <div className="w-8 h-8 border-2 border-primary flex items-center justify-center font-terminal text-xl text-primary shadow-[0_0_10px_rgba(0,255,65,0.5)] group-hover:shadow-[0_0_20px_rgba(0,255,65,0.8)] transition-shadow">
                &gt;
              </div>
              <span className="absolute -inset-1 border border-primary/20 animate-ping opacity-30 rounded-sm" />
            </div>
            <span className="font-heading font-bold text-lg tracking-wider text-primary text-glow hidden sm:block">
              GFG<span className="text-accent">:</span>CHAMPION
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-black/50 border border-primary/15 rounded-full px-2 py-1 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono font-bold uppercase tracking-wider transition-all duration-200',
                    isActive
                      ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,255,65,0.5)]'
                      : 'text-primary/50 hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <Icon size={15} />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Right: Status + Timer + Logout */}
          <div className="flex items-center gap-3">
            {/* Live status */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
              <Wifi size={11} className="animate-pulse" />
              LIVE
            </div>

            {/* Mini timer */}
            {timeLeft && (
              <div className="hidden lg:flex items-center gap-1.5 font-mono text-sm text-error bg-error/10 border border-error/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                {formatTimeShort(timeLeft)}
              </div>
            )}

            {/* User chip */}
            {user?.teamName && (
              <span className="hidden md:block text-xs font-mono text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                {user.teamName}
              </span>
            )}

            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-white/40 hover:text-error transition-colors font-mono text-xs uppercase"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Exit</span>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-primary"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 inset-x-0 z-40 bg-black/95 border-b border-primary/20 backdrop-blur-xl p-4 space-y-2"
          >
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg font-mono font-bold uppercase text-sm transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'text-white/50 hover:text-primary hover:bg-primary/5'
                  )}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}

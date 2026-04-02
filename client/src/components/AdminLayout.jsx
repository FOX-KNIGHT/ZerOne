import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Database, Clock, Users, BarChart3, LogOut, ShieldAlert, ChevronRight, Wifi, Menu, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout() {
  const location = useLocation()
  const logout = useAppStore(state => state.logout)
  const { activeRound, timeLeft } = useAppStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
    { name: 'Challenges', path: '/admin/challenges', icon: Database },
    { name: 'Round Control', path: '/admin/rounds', icon: Clock },
    { name: 'Teams', path: '/admin/teams', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ]

  const pageTitle = location.pathname.split('/').pop().replace(/-/g, ' ').toUpperCase()

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col h-screen bg-black/90 border-r border-red-500/20 backdrop-blur-xl transition-all duration-300 z-50',
      !mobile && (collapsed ? 'w-[72px]' : 'w-60'),
      mobile && 'w-72'
    )}>
      {/* Brand */}
      <div className={cn(
        'flex items-center border-b border-red-500/20 py-5 px-4 gap-3',
        collapsed && !mobile ? 'justify-center px-2' : ''
      )}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 flex items-center justify-center border-2 border-red-500 text-red-500 font-terminal text-xl shadow-[0_0_15px_rgba(255,68,68,0.4)]">
            ⚠
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="font-heading font-bold text-base bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              ROOT ACCESS
            </p>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Admin Panel</p>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className={cn('ml-auto text-white/30 hover:text-white transition-colors', collapsed && 'hidden')}
          >
            <ChevronRight size={16} className={collapsed ? 'rotate-180' : ''} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-mono text-sm relative group',
                collapsed && !mobile ? 'justify-center px-0' : '',
                isActive
                  ? 'bg-red-500/10 text-red-400 border border-red-500/25 shadow-[0_0_15px_rgba(255,68,68,0.08)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
              )}
            >
              {/* Active left stripe */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-red-500 rounded-r-full shadow-[0_0_8px_rgba(255,68,68,0.8)]" />
              )}
              <Icon size={16} className={isActive ? 'text-red-400 drop-shadow-[0_0_6px_rgba(255,68,68,0.8)]' : ''} />
              {(!collapsed || mobile) && (
                <span className="font-bold uppercase tracking-wide text-xs">{item.name}</span>
              )}
              {collapsed && !mobile && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-black border border-white/10 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                  {item.name}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle (expanded state) */}
      {!collapsed && !mobile && (
        <div className="px-3 pb-2">
          <button
            onClick={() => setCollapsed(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-white/20 hover:text-white/50 transition-colors text-xs font-mono border border-white/5 rounded-lg hover:border-white/10"
          >
            <ChevronRight size={12} className="rotate-180" />
            Collapse
          </button>
        </div>
      )}
      {collapsed && !mobile && (
        <div className="px-2 pb-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center py-2 text-white/20 hover:text-white/50 transition-colors border border-white/5 rounded-lg"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => logout()}
          className={cn(
            'w-full flex items-center gap-3 py-3 px-3 rounded-lg transition-all font-mono text-sm',
            'bg-red-950/30 text-red-400 hover:bg-red-500/20 border border-red-500/20',
            'hover:shadow-[0_0_20px_rgba(255,68,68,0.2)]',
            collapsed && !mobile ? 'justify-center px-0' : ''
          )}
        >
          <LogOut size={16} />
          {(!collapsed || mobile) && <span className="font-bold uppercase tracking-wider text-xs">Terminate Session</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Aurora */}
      <div className="aurora-orb-1" style={{ background: 'radial-gradient(circle, rgba(255,68,68,0.06) 0%, transparent 70%)' }} />
      <div className="aurora-orb-2" />
      <div className="aurora-orb-3" />

      {/* Desktop Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -272 }}
              animate={{ x: 0 }}
              exit={{ x: -272 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full z-50 md:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-x-hidden min-w-0">
        <div className="crt-overlay" />
        <div className="crt-vignette pointer-events-none" />
        <div className="crt-scanline-moving" />

        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-black/80 backdrop-blur-xl border-b border-primary/10 flex items-center px-4 md:px-8 gap-4">
          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/50 hover:text-primary transition-colors mr-2"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-white/30">
            <span>ADMIN</span>
            <ChevronRight size={12} />
            <span className="text-primary font-bold">{pageTitle} PANEL</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Active round chip */}
            {activeRound?.name && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                {activeRound.name}
              </div>
            )}
            {/* Socket status */}
            <div className="flex items-center gap-2 text-xs font-mono text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
              <Wifi size={11} className="animate-pulse" />
              <span className="hidden sm:inline">Sockets Online</span>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 pb-20 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

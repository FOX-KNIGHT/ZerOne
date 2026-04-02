import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { setupSocketListeners, connectSocket, disconnectSocket } from './lib/socket'

import Layout from './components/Layout'
import Login from './pages/Login'
import PlayerDashboard from './pages/PlayerDashboard'
import ChallengeList from './pages/ChallengeList'
import ChallengeDetail from './pages/ChallengeDetail'
import Leaderboard from './pages/Leaderboard'
import AntiCheatWrapper from './components/AntiCheatWrapper'

import AdminLayout from './components/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminChallenges from './pages/admin/AdminChallenges'
import AdminRounds from './pages/admin/AdminRounds'
import AdminTeams from './pages/admin/AdminTeams'
import AdminAnalytics from './pages/admin/AdminAnalytics'

import ProjectorScreen from './pages/ProjectorScreen'

function App() {
  const { token, user } = useAppStore()
  const location = useLocation()

  useEffect(() => {
    setupSocketListeners()
    if (token) {
      connectSocket(token)
    }
    return () => {
      disconnectSocket()
    }
  }, [token])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={!token ? <PageTransition><Login /></PageTransition> : <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} />} />
        <Route path="/display" element={<PageTransition><ProjectorScreen /></PageTransition>} />
        
        {/* Player Routes */}
        <Route path="/" element={token ? <AntiCheatWrapper><PageTransition><Layout /></PageTransition></AntiCheatWrapper> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<PlayerDashboard />} />
          <Route path="challenges" element={<ChallengeList />} />
          <Route path="challenges/:id" element={<ChallengeDetail />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={token ? <PageTransition><AdminLayout /></PageTransition> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/admin/overview" />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="challenges" element={<AdminChallenges />} />
          <Route path="rounds" element={<AdminRounds />} />
          <Route path="teams" element={<AdminTeams />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App

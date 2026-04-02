import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { setupSocketListeners, connectSocket, disconnectSocket } from './lib/socket'

import Layout from './components/Layout'
import Login from './pages/Login'
import PlayerDashboard from './pages/PlayerDashboard'
import Leaderboard from './pages/Leaderboard'
import Round1 from './pages/Round1'
import Section2 from './pages/Section2'
import Round3 from './pages/Round3'
import Phase0Quiz from './pages/Phase0Quiz'
import Section3 from './pages/Section3'
import FinalPhase from './pages/FinalPhase'
import ChallengeList from './pages/ChallengeList'
import ChallengeDetail from './pages/ChallengeDetail'
import AntiCheatWrapper from './components/AntiCheatWrapper'

import AdminLayout from './components/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminRounds from './pages/admin/AdminRounds'
import AdminTeams from './pages/admin/AdminTeams'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminCipherConfig from './pages/admin/AdminCipherConfig'

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

  const isAdmin = user?.role === 'superadmin' || user?.role === 'judge' || user?.role === 'admin'

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/login" element={!token ? <PageTransition><Login /></PageTransition> : <Navigate to={isAdmin ? '/admin' : '/dashboard'} />} />
        <Route path="/display" element={<PageTransition><ProjectorScreen /></PageTransition>} />

        {/* Player Routes */}
        <Route path="/" element={token && !isAdmin ? <AntiCheatWrapper><PageTransition><Layout /></PageTransition></AntiCheatWrapper> : <Navigate to={token ? '/admin' : '/login'} />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<PlayerDashboard />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="round1" element={<Round1 />} />
          <Route path="section2" element={<Section2 />} />
          <Route path="round3" element={<Round3 />} />
          <Route path="phase0" element={<Phase0Quiz />} />
          <Route path="section3" element={<Section3 />} />
          <Route path="final" element={<FinalPhase />} />
          <Route path="challenges" element={<ChallengeList />} />
          <Route path="challenge/:id" element={<ChallengeDetail />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={token && isAdmin ? <PageTransition><AdminLayout /></PageTransition> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/admin/overview" />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="rounds" element={<AdminRounds />} />
          <Route path="teams" element={<AdminTeams />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="cipher-config" element={<AdminCipherConfig />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={token ? (isAdmin ? '/admin' : '/dashboard') : '/login'} />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── Auth ───
      user:  null,
      token: null,

      // ─── Real-time Hackathon Data ───
      activeRound:      null,
      timeLeft:         null,
      leaderboard:      [],
      recentActivities: [],
      socketConnected:  false,
      isDisqualified:   false,
      disqualifyReason: null,
      cheatWarnings:    0,

      registeredTeams: [],
      challenges:     [],
      solvedChallenges: [],


      // ─── Set auth from API response ───
      setAuth: (user, token) => set({ user, token }),

      logout: () => set({
        user:             null,
        token:            null,
        cheatWarnings:    0,
        isDisqualified:   false,
        disqualifyReason: null,
      }),

      // ─── CREATE TEAM (Team Lead) ──────────────────────────────────────────
      // POST /api/auth/create → returns { token, teamCode, team }
      createTeam: async (teamName, leadName, password) => {
        try {
          const res = await fetch(`${API}/auth/create`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ teamName: teamName.trim(), leadName: leadName.trim(), password }),
          })
          const data = await res.json()
          if (!res.ok) return { success: false, error: data.message || 'Registration failed' }

          // Immediately log the lead in
          set({ token: data.token, user: { ...data.team, role: 'team' } })
          return { success: true, teamCode: data.teamCode }
        } catch {
          return { success: false, error: 'Network error. Is the server running?' }
        }
      },

      // ─── JOIN TEAM (Teammate via code) ────────────────────────────────────
      // POST /api/auth/join → returns { token, team }
      joinTeam: async (teamCode, memberName) => {
        try {
          const res = await fetch(`${API}/auth/join`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ teamCode: teamCode.trim().toUpperCase(), memberName: memberName.trim() }),
          })
          const data = await res.json()
          if (!res.ok) return { success: false, error: data.message || 'Failed to join team' }

          set({ token: data.token, user: { ...data.team, role: 'team' } })
          return { success: true }
        } catch {
          return { success: false, error: 'Network error. Is the server running?' }
        }
      },

      // ─── TEAM LOGIN (Lead re-authenticates) ──────────────────────────────
      // POST /api/auth/login → returns { token, team }
      loginTeam: async (teamName, password) => {
        try {
          const res = await fetch(`${API}/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ teamName: teamName.trim(), password }),
          })
          const data = await res.json()
          if (!res.ok) return { success: false, error: data.message || 'Login failed' }

          set({ token: data.token, user: { ...data.team, role: 'team' } })
          return { success: true }
        } catch {
          return { success: false, error: 'Network error. Is the server running?' }
        }
      },

      // ─── ADMIN LOGIN ──────────────────────────────────────────────────────
      loginAdmin: async (email, password) => {
        try {
          const res = await fetch(`${API}/auth/admin/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email: email.trim(), password }),
          })
          const data = await res.json()
          if (!res.ok) return { success: false, error: data.message || 'Admin login failed' }

          set({ token: data.token, user: { ...data.admin, role: data.admin.role } })
          return { success: true }
        } catch {
          return { success: false, error: 'Network error. Is the server running?' }
        }
      },

      // ─── SELF-DISQUALIFY (called by AntiCheatWrapper on fullscreen exit) ─
      selfDisqualify: async () => {
        const token = get().token
        if (!token) return
        try {
          await fetch(`${API}/auth/disqualify-self`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
        } catch { /* fire and forget */ }
      },

      // ─── Admin team controls ──────────────────────────────────────────────
      fetchTeams: async () => {
        try {
          const res = await fetch(`${API}/admin/teams`, {
            headers: { Authorization: `Bearer ${get().token}` },
          })
          if (!res.ok) return
          const data = await res.json()
          if (Array.isArray(data)) set({ registeredTeams: data })
        } catch (err) { console.error('Fetch teams failed:', err) }
      },

      fetchAnalytics: async () => {
        try {
          const res = await fetch(`${API}/admin/analytics/overview`, {
            headers: { Authorization: `Bearer ${get().token}` },
          })
          if (!res.ok) return null
          const data = await res.json()
          return data
        } catch (err) { console.error('Fetch analytics failed:', err); return null }
      },

      fetchActiveRound: async () => {
        try {
          const res = await fetch(`${API}/display/round`)
          if (!res.ok) {
            set({ activeRound: null })
            return null
          }
          const data = await res.json()
          set({ activeRound: data })
          return data
        } catch (err) { 
          console.error('Fetch active round failed:', err)
          set({ activeRound: null })
          return null 
        }
      },

      updateTeamScore: async (teamId, delta) => {
        try {
          await fetch(`${API}/admin/team/adjust-score`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${get().token}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify({ teamId, amount: delta }),
          })
          set(state => ({
            registeredTeams: state.registeredTeams.map(t =>
              t._id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t
            ),
          }))
        } catch (e) { console.error(e) }
      },

      updateRound2Score: async (teamId, delta) => {
        try {
          await fetch(`${API}/admin/team/adjust-round2-score`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${get().token}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify({ teamId, amount: delta }),
          })
          set(state => ({
            registeredTeams: state.registeredTeams.map(t =>
              t._id === teamId ? { ...t, score: Math.max(0, t.score + delta), round2Score: Math.max(0, (t.round2Score || 0) + delta) } : t
            ),
          }))
        } catch (e) { console.error(e) }
      },

      disqualifyTeam: async (teamId) => {
        try {
          await fetch(`${API}/admin/team/disqualify`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${get().token}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify({ teamId }),
          })
          set(state => ({
            registeredTeams: state.registeredTeams.map(t =>
              t._id === teamId ? { ...t, isDisqualified: true } : t
            ),
          }))
        } catch (e) { console.error(e) }
      },

      reinstateTeam: async (teamId) => {
        try {
          await fetch(`${API}/admin/team/reinstate`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${get().token}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify({ teamId }),
          })
          set(state => ({
            registeredTeams: state.registeredTeams.map(t =>
              t._id === teamId ? { ...t, isDisqualified: false } : t
            ),
          }))
        } catch (e) { console.error(e) }
      },

      resetTeamProgress: async (teamId) => {
        try {
          await fetch(`${API}/admin/team/reset`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${get().token}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify({ teamId }),
          })
          set(state => ({
            registeredTeams: state.registeredTeams.map(t =>
              t._id === teamId ? { ...t, score: 0, round2Score: 0, round3Score: 0, currentRound: 1 } : t
            ),
          }))
        } catch (e) { console.error(e) }
      },

      startRound: async (roundNumber, durationSeconds) => {
        try {
          const res = await fetch(`${API}/admin/round/start`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${get().token}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify({ roundNumber, duration: durationSeconds }),
          })
          const data = await res.json()
          if (res.ok) set({ activeRound: data })
          return { success: res.ok, data }
        } catch (e) { console.error(e); return { success: false } }
      },

      endRound: async () => {
        try {
          const res = await fetch(`${API}/admin/round/end`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${get().token}`, 'Content-Type': 'application/json' },
          })
          const data = await res.json()
          if (res.ok) set({ activeRound: null, timeLeft: null })
          return { success: res.ok, data }
        } catch (e) { console.error(e); return { success: false } }
      },

      // ─── Anti-cheat ───────────────────────────────────────────────────────
      setGlobalDisqualified: (status, reason = null) =>
        set({ isDisqualified: status, disqualifyReason: reason }),
      incrementWarning: () =>
        set(state => ({ cheatWarnings: Math.min(3, state.cheatWarnings + 1) })),
      resetWarnings: () => set({ cheatWarnings: 0 }),

      // ─── Socket / Real-time ───────────────────────────────────────────────
      setSocketConnected: (status) => set({ socketConnected: status }),
      updateTimer:        (time)   => set({ timeLeft: time }),
      setActiveRound:     (round)  => set({ activeRound: round }),
      updateScores:       (scores) => set({ leaderboard: scores }),
      addRecentActivity:  (act)    => set(state => ({
        recentActivities: [act, ...state.recentActivities].slice(0, 10),
      })),

      // ─── Challenges API ───────────────────────────────────────────────────
      fetchChallenges: async () => {
        try {
          const res = await fetch(`${API}/challenges`, {
            headers: { Authorization: `Bearer ${get().token}` },
          })
          if (!res.ok) return []
          const data = await res.json()
          set({ challenges: data.challenges || [] })
          return data.challenges || []
        } catch (err) {
          console.error('Fetch challenges failed:', err)
          return []
        }
      },

      fetchChallengeById: async (id) => {
        try {
          const res = await fetch(`${API}/challenges/${id}`, {
            headers: { Authorization: `Bearer ${get().token}` },
          })
          if (!res.ok) return null
          const data = await res.json()
          return data
        } catch (err) {
          console.error('Fetch challenge detail failed:', err)
          return null
        }
      },

      submitChallenge: async (challengeId, answer, hintUsed = false) => {
        try {
          const res = await fetch(`${API}/submissions`, {
            method:  'POST',
            headers: { 
              Authorization: `Bearer ${get().token}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ challengeId, answer, hintUsed }),
          })
          const data = await res.json()
          if (data.isCorrect) {
            set(state => ({
              solvedChallenges: [...state.solvedChallenges, challengeId]
            }))
          }
          return data
        } catch (err) {
          console.error('Submission failed:', err)
          return { isCorrect: false, message: 'Network error' }
        }
      },

      fetchHint: async (challengeId) => {
        try {
          const res = await fetch(`${API}/challenges/${challengeId}/hint`, {
            headers: { Authorization: `Bearer ${get().token}` },
          })
          if (!res.ok) return null
          const data = await res.json()
          return data.hint
        } catch (err) {
          console.error('Fetch hint failed:', err)
          return null
        }
      },
    }),
    {
      name: 'zerone-app-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        token:            state.token,
        user:             state.user,
        activeRound:      state.activeRound,
        timeLeft:         state.timeLeft,
        isDisqualified:   state.isDisqualified,
        disqualifyReason: state.disqualifyReason,
        cheatWarnings:    state.cheatWarnings,
      }),
    }
  )
)

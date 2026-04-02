import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Utility: generate a unique 6-character team code
const generateTeamCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── Auth ───
      user: null,
      token: null,

      // ─── Real-time Hackathon Data ───
      activeRound: null,
      timeLeft: 3605,
      leaderboard: [],
      recentActivities: [],
      socketConnected: false,
      isDisqualified: false,
      disqualifyReason: null,
      cheatWarnings: 0,

      // ─── Team Registry (shared state simulates backend) ───
      // Each team: { id, code, name, password, leaderId, members: [{id, name}], score, solves, status, createdAt }
      registeredTeams: [],

      // ─── Auth Actions ───
      setAuth: (user, token) => {
        set({ user, token })
      },

      logout: () => {
        set({ user: null, token: null, cheatWarnings: 0 })
      },

      // ─── Team Registration ───
      createTeam: (teamName, password, leaderName) => {
        const existingTeams = get().registeredTeams
        // Check for duplicate name
        if (existingTeams.find(t => t.name.toLowerCase() === teamName.toLowerCase())) {
          return { success: false, error: 'Team name already taken. Choose another.' }
        }

        const code = generateTeamCode()
        const leaderId = `user_${Date.now()}`
        const newTeam = {
          id: `team_${Date.now()}`,
          code,
          name: teamName,
          password,
          leaderId,
          members: [{ id: leaderId, name: leaderName, role: 'Lead', joinedAt: new Date().toISOString() }],
          score: 0,
          solves: 0,
          status: 'Active',
          createdAt: new Date().toISOString(),
        }

        set(state => ({
          registeredTeams: [...state.registeredTeams, newTeam],
          user: {
            id: leaderId,
            role: 'team',
            teamId: newTeam.id,
            teamName: teamName,
            teamCode: code,
            name: leaderName,
            isLead: true,
            score: 0,
          },
          token: `team_token_${leaderId}`,
        }))

        return { success: true, code, team: newTeam }
      },

      // ─── Join existing team with code ───
      joinTeam: (code, memberName) => {
        const teams = get().registeredTeams
        const team = teams.find(t => t.code === code.toUpperCase().trim())

        if (!team) {
          return { success: false, error: 'Invalid team code. Check with your Team Lead.' }
        }
        if (team.status === 'Disqualified') {
          return { success: false, error: 'This team has been disqualified.' }
        }
        if (team.members.length >= 5) {
          return { success: false, error: 'Team is full (max 5 members).' }
        }

        const memberId = `user_${Date.now()}`
        const newMember = { id: memberId, name: memberName, role: 'Member', joinedAt: new Date().toISOString() }

        const updatedTeams = teams.map(t =>
          t.id === team.id ? { ...t, members: [...t.members, newMember] } : t
        )

        set({
          registeredTeams: updatedTeams,
          user: {
            id: memberId,
            role: 'team',
            teamId: team.id,
            teamName: team.name,
            teamCode: team.code,
            name: memberName,
            isLead: false,
            score: team.score,
          },
          token: `team_token_${memberId}`,
        })

        return { success: true, team }
      },

      // ─── Admin login ───
      loginAsAdmin: () => {
        set({
          user: { id: 'admin', role: 'admin', username: 'admin' },
          token: 'admin_token',
        })
        return { success: true }
      },

      // ─── Admin team controls ───
      fetchTeams: async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/teams`, {
            headers: { Authorization: `Bearer ${get().token}` }
          })
          const data = await res.json()
          if (Array.isArray(data)) {
            set({ registeredTeams: data })
          }
        } catch (err) {
          console.error('Fetch teams failed:', err)
        }
      },

      updateTeamScore: async (teamId, delta) => {
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team/adjust-score`, {
            method: 'POST',
            headers: { 
              Authorization: `Bearer ${get().token}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ teamId, amount: delta })
          })
          // Local update for immediate feedback
          set(state => ({
            registeredTeams: state.registeredTeams.map(t =>
              t._id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t
            )
          }))
        } catch (e) {
          console.error(e)
        }
      },

      disqualifyTeam: async (teamId) => {
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team/disqualify`, {
            method: 'POST',
            headers: { 
              Authorization: `Bearer ${get().token}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ teamId })
          })
          set(state => ({
            registeredTeams: state.registeredTeams.map(t =>
              t._id === teamId ? { ...t, isDisqualified: true } : t
            )
          }))
        } catch (e) {
          console.error(e)
        }
      },

      reinstateTeam: async (teamId) => {
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/team/reinstate`, {
            method: 'POST',
            headers: { 
              Authorization: `Bearer ${get().token}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ teamId })
          })
          set(state => ({
            registeredTeams: state.registeredTeams.map(t =>
              t._id === teamId ? { ...t, isDisqualified: false } : t
            )
          }))
        } catch (e) {
          console.error(e)
        }
      },

      resetTeamProgress: (teamId) => {
        set(state => ({
          registeredTeams: state.registeredTeams.map(t =>
            t._id === teamId ? { ...t, score: 0, solves: 0 } : t
          )
        }))
      },

      setGlobalDisqualified: (status, reason = null) => {
        set({ isDisqualified: status, disqualifyReason: reason })
      },

      incrementWarning: () => {
        set(state => ({ cheatWarnings: Math.min(3, state.cheatWarnings + 1) }))
      },

      resetWarnings: () => {
        set({ cheatWarnings: 0 })
      },

      // ─── Socket / Real-time ───
      setSocketConnected: (status) => set({ socketConnected: status }),
      updateTimer: (time) => set({ timeLeft: time }),
      setActiveRound: (round) => set({ activeRound: round }),
      updateScores: (newScores) => set({ leaderboard: newScores }),
      addRecentActivity: (activity) => set((state) => ({
        recentActivities: [activity, ...state.recentActivities].slice(0, 10)
      })),
    }),
    {
      name: 'zerone-app-store',
      partialize: (state) => ({ 
        registeredTeams: state.registeredTeams,
        activeRound: state.activeRound,
        timeLeft: state.timeLeft,
        isDisqualified: state.isDisqualified,
        disqualifyReason: state.disqualifyReason,
        cheatWarnings: state.cheatWarnings
      }),
    }
  )
)

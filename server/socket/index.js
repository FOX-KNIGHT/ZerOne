import Team from '../models/Team.js'

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Team joins their own room (for sync across 3 computers)
    socket.on('joinTeam', (teamId) => {
      socket.join(teamId)
      console.log(`Socket ${socket.id} joined team room: ${teamId}`)
    })

    socket.on('playerDisqualified', async ({ teamId, reason }) => {
      try {
        console.warn(`DISQUALIFIED: Team ${teamId} - Reason: ${reason}`)
        
        if (teamId) {
          await Team.findByIdAndUpdate(teamId, { isDisqualified: true })
        }

        io.to(teamId).emit('forceLogout', { reason })
        io.emit('teamDisqualifiedAlert', { teamId, reason })
      } catch (err) {
        console.error('Failed to process disqualification:', err)
      }
    })

    // Admin broadcasts round activation (Can also be done via API)
    socket.on('activateRound', (roundNumber) => {
      io.emit('roundActivated', { roundNumber })
    })

    // Sync submission across team's 3 computers
    socket.on('challengeSolved', ({ teamId, challengeId }) => {
      io.to(teamId).emit('challengeSolved', { challengeId })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}
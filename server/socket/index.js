export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Team joins their own room (for sync across 3 computers)
    socket.on('joinTeam', (teamId) => {
      socket.join(teamId)
      console.log(`Socket ${socket.id} joined team room: ${teamId}`)
    })

    // Admin broadcasts round activation
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
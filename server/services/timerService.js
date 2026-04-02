import Round from '../models/Round.js'

let timerInterval = null

export const startTimerService = (io) => {
  if (timerInterval) clearInterval(timerInterval)

  console.log('Starting background Timer Service...')
  
  timerInterval = setInterval(async () => {
    try {
      const activeRound = await Round.findOne({ isActive: true })
      if (!activeRound) return

      const now = new Date()
      const endsAt = activeRound.endsAt

      if (endsAt && now >= endsAt) {
        // Time's up
        activeRound.isActive = false
        await activeRound.save()

        io.emit('roundEnded', { roundNumber: activeRound.roundNumber })
        console.log(`Round ${activeRound.roundNumber} automatically ended by Timer Service.`)
      } else if (endsAt) {
        const remainingTime = Math.max(0, Math.floor((endsAt - now) / 1000))
        io.emit('timerTick', { remainingTime, roundNumber: activeRound.roundNumber })
      }
    } catch (error) {
      console.error('Timer Service Error:', error)
    }
  }, 1000)
}

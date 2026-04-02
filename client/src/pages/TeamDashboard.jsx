import React, { useState, useEffect } from 'react'
import { socket } from '../App'

export default function TeamDashboard() {
  const [token, setToken] = useState(localStorage.getItem('teamToken') || '')
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  
  const [teamData, setTeamData] = useState(null)
  const [roundStats, setRoundStats] = useState({ activeRound: null, remainingTime: 0 })
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    socket.on('timerTick', ({ remainingTime, roundNumber }) => {
      setRoundStats({ remainingTime, activeRound: roundNumber })
    })

    socket.on('roundEnded', () => {
      setRoundStats({ activeRound: null, remainingTime: 0 })
    })

    return () => {
      socket.off('timerTick')
      socket.off('roundEnded')
    }
  }, [])

  const login = async (e) => {
    e.preventDefault()
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, password })
    })
    const data = await res.json()
    if (data.token) {
      setToken(data.token)
      setTeamData(data.team)
      localStorage.setItem('teamToken', data.token)
      // Join team room for sync
      socket.emit('joinTeam', data.team.teamId)
    } else {
      alert(data.message)
    }
  }

  const submitFlag = async () => {
    if (!answer) return
    // Hardcoded challengeId for demo purposes assuming id exists
    // In real app, they'd select from a list.
    const fakeChallengeId = "60c72b2f9b1d8b3a4c8e4d1e" // Placeholder

    try {
      const res = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: fakeChallengeId, answer, hintUsed: false })
      })
      const data = await res.json()
      alert(data.message)
      setAnswer('')
    } catch(e) {
      console.error(e)
    }
  }

  if (!token) {
    return (
      <div className="container flex-col items-center justify-center mt-8 text-center" style={{maxWidth: '400px'}}>
        <h2 className="glitch border-none text-xl mb-4">IDENTIFY YOUR NODE</h2>
        <form className="flex gap-4 flex-col" onSubmit={login}>
          <input placeholder="NODE ALIAS" value={teamName} onChange={e=>setTeamName(e.target.value)} />
          <input placeholder="AUTH KEY" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="submit">ESTABLISH UPLINK</button>
        </form>
      </div>
    )
  }

  const m = Math.floor(roundStats.remainingTime / 60).toString().padStart(2, '0')
  const s = (roundStats.remainingTime % 60).toString().padStart(2, '0')

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{fontSize: '1.5rem', margin: 0}}>UPLINK ESTABLISHED.</h1>
          <p style={{ opacity: 0.7 }}>NODE: {teamData?.teamName}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
           <h2 style={{ color: roundStats.activeRound ? 'var(--color-primary)' : 'var(--color-border)', margin: 0, borderBottom: 'none' }}>
            {roundStats.activeRound ? `COMBAT ROUND ${roundStats.activeRound}` : 'STANDBY MODE'}
          </h2>
          {roundStats.activeRound && (
            <h1 className={roundStats.remainingTime < 30 ? 'blink' : ''} style={{ color: roundStats.remainingTime < 30 ? 'red' : 'var(--color-primary)', margin: 0 }}>
              {m}:{s}
            </h1>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        <div className="card" style={{ flex: 1 }}>
          <h2>■ VULNERABILITY LIST</h2>
          <div style={{ padding: '1rem', border: '1px dashed var(--color-border)', opacity: 0.7 }}>
            [1] BYPASS_FIREWALL_0X <br/>
            [2] INJECT_PAYLOAD_A2 <br/>
            [3] DECRYPT_HASH_5X <br/>
            <p className="mt-4">» Awaiting user payload interface...</p>
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h2>■ PAYLOAD DELIVERY</h2>
          <p className="mb-4">Enter decrypted hash or flag data to capture vulnerability cluster.</p>
          <input 
            placeholder="FLAG_OR_ANSWER..." 
            value={answer} 
            onChange={e => setAnswer(e.target.value)} 
          />
          <button className="mt-4" style={{width: '100%'}} onClick={submitFlag}>INJECT SEQUENCE</button>
        </div>
      </div>
    </div>
  )
}

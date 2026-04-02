import React, { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    if (token) fetchAnalytics()
  }, [token])

  const login = async (e) => {
    e.preventDefault()
    const res = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (data.token) {
      setToken(data.token)
      localStorage.setItem('adminToken', data.token)
    } else {
      alert(data.message)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/analytics/overview', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setAnalytics(data)
    } catch(e) { console.error(e) }
  }

  const startRound = async () => {
    const min = prompt("Duration in minutes?", "1")
    if (!min) return

    await fetch('http://localhost:5000/api/admin/round/start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundNumber: Date.now()%100, duration: parseInt(min)*60 })
    })
    alert("Round Started")
  }

  if (!token) {
    return (
      <div className="container" style={{maxWidth: '400px', margin: '4rem auto'}}>
        <div className="card text-center">
          <h2 className="glitch">RESTRICTED AREA</h2>
          <p>Provide Administrator Credentials.</p>
          <form className="flex-col gap-4 mt-4" onSubmit={login}>
            <input placeholder="EMAIL" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
            <br />
            <input placeholder="PASSWORD" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <br />
            <button type="submit" style={{width: '100%'}}>INITIALIZE LOGIN</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-8">
      <h1>JUDGE CONTROL CONSOLE</h1>
      <button onClick={() => { setToken(''); localStorage.removeItem('adminToken') }}>TERMINATE SESSION</button>

      <div className="flex gap-8 mt-4">
        {/* Actions panel */}
        <div className="card" style={{ flex: 1 }}>
          <h2>■ COMMAND MODULE</h2>
          <div className="flex flex-col gap-4">
            <button className="mt-4" style={{width: '100%', borderColor: 'red', color: 'red'}} onClick={startRound}>START NEW COMBAT ROUND</button>
            <button style={{width: '100%'}}>CONFIGURE CHALLENGES</button>
            <button style={{width: '100%'}}>MANAGE TEAMS</button>
          </div>
        </div>

        {/* Analytics panel */}
        <div className="card" style={{ flex: 2 }}>
          <h2>■ GLOBAL ANALYTICS</h2>
          {analytics ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ border: '1px solid var(--color-border)', padding: '1rem' }}>
                <div style={{ opacity: 0.7 }}>TOTAL TEAMS</div>
                <div style={{ fontSize: '2rem' }}>{analytics.totalTeams}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', padding: '1rem' }}>
                <div style={{ opacity: 0.7 }}>TOTAL ATTEMPTS</div>
                <div style={{ fontSize: '2rem' }}>{analytics.totalSubmissions}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', padding: '1rem' }}>
                <div style={{ opacity: 0.7 }}>AVERAGE SCORE</div>
                <div style={{ fontSize: '2rem' }}>{analytics.averageScore}</div>
              </div>
              <div style={{ border: '1px solid var(--color-border)', padding: '1rem' }}>
                <div style={{ opacity: 0.7 }}>HIGHEST SCORE</div>
                <div style={{ fontSize: '2rem', color: 'var(--color-primary-glow)' }}>{analytics.highestScore}</div>
              </div>
              {analytics.mostSolvedChallenge && (
                <div style={{ gridColumn: 'span 2', border: '1px solid var(--color-border)', padding: '1rem' }}>
                   MOST SOLVED VULNERABILITY: <span style={{ color: 'var(--color-primary)' }}>{analytics.mostSolvedChallenge.title}</span> ({analytics.mostSolvedChallenge.solves} solves)
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 opacity-50">FETCHING DATA STREAM...</p>
          )}
        </div>
      </div>
    </div>
  )
}

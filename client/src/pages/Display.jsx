import React, { useEffect, useState } from 'react'
import { socket } from '../App'

export default function Display() {
  const [data, setData] = useState({
    activeRound: null,
    remainingTime: 0,
    topTeams: [],
    recentSolves: []
  })

  useEffect(() => {
    // Initial fetch
    fetch('http://localhost:5000/api/display/live')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error)

    socket.on('timerTick', ({ remainingTime, roundNumber }) => {
      setData(prev => ({ ...prev, remainingTime, activeRound: roundNumber }))
    })

    socket.on('roundEnded', () => {
      setData(prev => ({ ...prev, activeRound: null, remainingTime: 0 }))
    })

    socket.on('scoreUpdate', () => fetchDisplay())
    socket.on('recentSolve', () => fetchDisplay())

    function fetchDisplay() {
      fetch('http://localhost:5000/api/display/live')
        .then(res => res.json())
        .then(json => setData(json))
    }

    return () => {
      socket.off('timerTick')
      socket.off('roundEnded')
      socket.off('scoreUpdate')
      socket.off('recentSolve')
    }
  }, [])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="container px-8">
      <div className="flex justify-between items-center mb-8" style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>GFG EVENT DISPLAY</h1>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ color: data.activeRound ? 'var(--color-primary)' : 'var(--color-border)', margin: 0, textShadow: 'none' }}>
            ROUND: {data.activeRound || 'INACTIVE'}
          </h2>
          <h1 className={data.remainingTime && data.remainingTime < 30 ? 'blink' : ''} style={{ fontSize: '4rem', margin: 0, color: data.remainingTime && data.remainingTime < 30 ? 'red' : 'var(--color-primary)' }}>
            {data.activeRound ? formatTime(data.remainingTime) : '--:--'}
          </h1>
        </div>
      </div>

      <div className="flex gap-8" style={{ alignItems: 'flex-start' }}>
        {/* Leaderboard */}
        <div className="card" style={{ flex: 1, minHeight: '400px' }}>
          <h2>■ LIVE LEADERBOARD</h2>
          {data.topTeams.map((team, idx) => (
            <div key={team._id} className="flex justify-between items-center" style={{ padding: '1rem', borderBottom: '1px solid var(--color-surface-hover)', fontSize: '1.2rem', backgroundColor: idx === 0 ? 'var(--color-surface)' : 'transparent' }}>
              <div><span style={{opacity: 0.5}}>0{idx + 1}</span> {team.teamName}</div>
              <div style={{ fontWeight: 'bold' }}>{team.score} PTS</div>
            </div>
          ))}
          {data.topTeams.length === 0 && <p className="mt-4 opacity-50">NO DATA FOUND</p>}
        </div>

        {/* Activity feed */}
        <div className="card" style={{ flex: 1, minHeight: '400px' }}>
          <h2>■ SYSTEM LOGS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {data.recentSolves.slice(0, 8).map((solve, idx) => (
              <div key={idx} style={{ fontSize: '0.9rem', opacity: 1 - (idx * 0.1) }}>
                <span style={{ color: 'var(--color-text-dim)' }}>[{new Date(solve.timestamp).toLocaleTimeString()}]</span>
                {' '}» {solve.teamName} bypassed {solve.challengeTitle} 
                <span style={{ color: 'var(--color-primary-glow)' }}> (+{solve.points})</span>
              </div>
            ))}
            {data.recentSolves.length === 0 && <p className="opacity-50">AWAITING SYSTEM ACTIVITY...</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

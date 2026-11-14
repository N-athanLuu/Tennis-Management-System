import { useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const [page, setPage] = useState(() => window.location.hash || '#home')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [busy, setBusy] = useState(false)
  const [clubTab, setClubTab] = useState('overview')
  useEffect(() => {
    fetch('/api/session').then(async (response) => {
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    }).catch(() => { /* The public homepage works without account services. */ })
  }, [])
  useEffect(() => {
    const navigate = () => {
      setPage(window.location.hash || '#home')
      setMessage('')
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [])
  const signup = page === '#signup'
  const accountPage = !user && (signup || page === '#login')
  async function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (signup && data.get('password') !== data.get('confirm')) {
      setMessage('Your passwords do not match.')
      return
    }
    const form = event.currentTarget
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(signup ? '/api/signup' : '/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to continue.')
      form.reset()
      if (signup) {
        setPage('#login')
        window.history.replaceState(null, '', '#login')
        setMessage('Account created. Please log in.')
      } else {
        setUser(result.user)
        window.location.hash = '#home'
      }
    } catch (error) {
      setMessage(error instanceof SyntaxError ? 'Account services are unavailable.' : error.message)
    } finally { setBusy(false) }
  }
  async function logout() {
    setBusy(true)
    try {
      const response = await fetch('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      if (!response.ok) throw new Error('Unable to log out. Please try again.')
      setUser(null)
      window.location.hash = '#home'
    } catch (error) { setMessage(error.message) }
    finally { setBusy(false) }
  }
  return (
    <div className="page" id="home">
      <div className="court" aria-hidden="true"><div className="singles" /><div className="service" /><div className="net" /></div>
      <header>
        <span className="brand">◉ Carden Dang, Nathan Luu, Troy Quach</span>
        <nav className="account-nav" aria-label="Account">{user ? <button className="logout-button" onClick={logout} disabled={busy}>Log out</button> : <a href="#login">Log in</a>}</nav></header>
      <main>
        {accountPage ? <section className="account-panel" aria-labelledby="account-title" key={page}>
          <a href="#home">← Back to home</a>
          <h1 id="account-title">{signup ? 'Sign up' : 'Welcome back.'}</h1>
          <form onSubmit={submit}>
            {signup && <label>Full name<input name="name" autoComplete="name" required /></label>}
            <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
            <label>Password<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} required /></label>
            {signup && <><small>Use at least 8 characters.</small><label>Confirm password<input name="confirm" type="password" autoComplete="new-password" minLength={8} required /></label></>}
            <button className="button" type="submit" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Sign up' : 'Log in'} ↗</button>
            <p role="status">{message}</p>
          </form>
          <p>{signup ? 'Already have an account?' : 'New here?'} <a href={signup ? '#login' : '#signup'}>{signup ? 'Log in' : 'Sign up'}</a></p>
        </section> : <>
        <p className="eyebrow">● &nbsp; MANAGING MATCHPLAY AND LEADERBOARD</p>
        {message && <p role="status">{message}</p>}
        <h1>Racquet Sport<br />Management <em>System</em></h1>
        <p className="intro">Your next great match starts here. A simple space to bring the tennis, pickleball, and badminton community together, on and off the court.</p>
        <div className="caption" style={{ justifyContent: 'flex-end' }}><span>GAME. SET. GO.</span></div>
        </>}</main>
      {!accountPage && <section className="club-dashboard" aria-label="Club activity">
        <aside className="club-sidebar">
          <p className="label">YOUR CLUB</p>
          <nav aria-label="Club sections">
            <button type="button" aria-pressed={clubTab === 'overview'} onClick={() => setClubTab('overview')}><span aria-hidden="true">▤</span> Overview</button>
            <button type="button" aria-pressed={clubTab === 'leaderboard'} onClick={() => setClubTab('leaderboard')}><span aria-hidden="true">♛</span> Leaderboard</button>
            <button type="button" aria-pressed={clubTab === 'schedules'} onClick={() => setClubTab('schedules')}><span aria-hidden="true">▦</span> Schedules</button>
          </nav>
        </aside>
        <section className="club-content" aria-labelledby="club-heading" aria-live="polite">
          <p className="label">{clubTab === 'overview' ? 'AT A GLANCE' : clubTab === 'leaderboard' ? 'THE STANDINGS' : 'ON THE CALENDAR'}</p>
          <h2 id="club-heading">{clubTab === 'overview' ? 'Overview' : clubTab === 'leaderboard' ? 'Leaderboard' : 'Schedules'}</h2>
          <p className="club-description">{clubTab === 'overview' ? 'Your community, your matches, and your next game—all in one place.' : clubTab === 'leaderboard' ? 'Follow your community’s progress, one match at a time.' : 'See what’s coming up on the court.'}</p>
          {clubTab === 'overview' ? <div className="sport-schedules overview-cards">
            <section className="schedule-empty"><h3>Club standings</h3><p>See how players rank across your community.</p><button type="button" className="overview-link" onClick={() => setClubTab('leaderboard')}>View leaderboard ↗</button></section>
            <section className="schedule-empty"><h3>Upcoming matches</h3><p>Find schedules for badminton, tennis, and pickleball.</p><button type="button" className="overview-link" onClick={() => setClubTab('schedules')}>View schedules ↗</button></section>
            <section className="schedule-empty"><h3>Three sports. One community.</h3><p>Badminton · Tennis · Pickleball</p><p>Match results and upcoming games will appear once club data is connected.</p></section>
          </div> : clubTab === 'leaderboard' ? <>
            <div className="standings-scroll"><table className="standings"><caption className="visually-hidden">Club leaderboard</caption><thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Played</th><th scope="col">Wins</th><th scope="col">Points</th></tr></thead><tbody><tr><td colSpan={5}>No rankings yet. Standings will appear once match results are available.</td></tr></tbody></table></div>
          </> : <div className="sport-schedules">
            {['Badminton', 'Tennis', 'Pickleball'].map((sport) => (
              <section className="schedule-empty" key={sport} aria-labelledby={`schedule-${sport.toLowerCase()}`}>
                <span aria-hidden="true">▦</span>
                <h3 id={`schedule-${sport.toLowerCase()}`}>{sport}</h3>
                <p>No {sport.toLowerCase()} matches are scheduled yet. Upcoming matches will appear here.</p>
              </section>
            ))}
          </div>}
        </section>
      </section>}
    </div>
  )
}


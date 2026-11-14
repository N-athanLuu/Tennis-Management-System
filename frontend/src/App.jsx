import { useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const [page, setPage] = useState(() => window.location.hash || '#home')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [busy, setBusy] = useState(false)
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
      <footer id="club">
        <div><p className="label">BUILT AROUND THE GAME</p><h2>A place for every player.</h2></div>
        <p>From your first serve to your next friendly rivalry.<br />Make yourself at home on the court.</p>
        <span className="arrow" aria-hidden="true">↗</span>
      </footer>
    </div>
  )
}


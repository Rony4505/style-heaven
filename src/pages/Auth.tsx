import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useStore } from '../store'
import { Chrome } from '../components/Chrome'

export function LoginPage() {
  const { login } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [mode, setMode] = useState<'in' | 'up'>('in')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    login(email, mode === 'up' ? email.split('@')[0] : undefined)
    navigate(email.toLowerCase().includes('admin') ? '/admin' : '/')
  }

  return (
    <div className="login-page">
      <div className="login-silk" />
      <div className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="sparkle">✦</div>
          <h1>Style Heaven</h1>
          <p className="luxury">Luxury. Redefined.</p>
          <h2>{mode === 'in' ? 'Welcome back' : 'Create account'}</h2>
          <p className="sub">
            {mode === 'in'
              ? 'Sign in to continue your Style Heaven experience.'
              : 'Join the house. A quieter kind of luxury.'}
          </p>

          <label>
            Email
            <div className="field">
              <Mail size={16} />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>
          <label>
            Password
            <div className="field">
              <Lock size={16} />
              <input
                type={show ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="eye" onClick={() => setShow((s) => !s)}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          {mode === 'in' && (
            <button type="button" className="forgot">
              Forgot password?
            </button>
          )}
          <button className="gold-btn full continue" type="submit">
            Continue <span>→</span>
          </button>
          <div className="or">Or continue with</div>
          <div className="socials">
            <button
              type="button"
              onClick={() => {
                login('google.guest@styleheaven.com', 'Guest')
                navigate('/')
              }}
            >
              <GoogleMark />
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                login('apple.guest@styleheaven.com', 'Guest')
                navigate('/')
              }}
            >
              <AppleMark />
              Apple
            </button>
          </div>
          <p className="switch">
            {mode === 'in' ? "Don't have an account? " : 'Already a member? '}
            <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
              {mode === 'in' ? 'Create one' : 'Sign in'}
            </button>
          </p>
          <p className="demo-hint">
            Admin demo: <code>admin@styleheaven.com</code>
          </p>
        </form>
      </div>
      <Chrome />
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l6.2 5.2C37.9 38.2 44 32.5 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
      <path d="M11.4 8.4c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8s-1.6-.7-2.7-.7C2.8 3.7 1 5 1 8.1c0 1 .2 2 .6 2.9.5 1.2 2.2 4.1 3.9 4.1 1 .0 1.7-.7 2.8-.7s1.7.7 2.8.7c1.8 0 3.3-2.7 3.8-3.9-2.4-1-2.5-2.8-2.5-2.8ZM9.3 2.6c.5-.7.9-1.6.8-2.6-1 .1-2.1.7-2.7 1.4-.6.6-1.1 1.6-.9 2.5 1.1.1 2.2-.5 2.8-1.3Z" />
    </svg>
  )
}

export function AccountPage() {
  const { user, logout, orders } = useStore()
  const navigate = useNavigate()
  const mine = user ? orders.filter((o) => o.customer === user.name).slice(0, 6) : orders.slice(0, 0)

  if (!user) {
    return (
      <div className="account-gate">
        <p>Please sign in to view your account.</p>
        <Link className="gold-btn" to="/login">
          Sign in
        </Link>
        <Chrome />
      </div>
    )
  }

  return (
    <div className="account-page">
      <div className="account-card">
        <p className="luxury">Style Heaven</p>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <p className="role">{user.role === 'admin' ? 'Super Administrator' : 'Collector'}</p>
        {user.role === 'admin' && (
          <Link className="gold-btn" to="/admin">
            Open back office
          </Link>
        )}
        <div className="order-list">
          <h2>Recent orders</h2>
          {mine.length === 0 && <p className="muted">No orders yet.</p>}
          {mine.map((o) => (
            <div key={o.id} className="order-row">
              <span>{o.id}</span>
              <span>{o.status}</span>
              <strong>BDT {o.total.toLocaleString('en-BD')}</strong>
            </div>
          ))}
        </div>
        <button
          className="text-btn"
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          Sign out
        </button>
      </div>
      <Chrome />
    </div>
  )
}

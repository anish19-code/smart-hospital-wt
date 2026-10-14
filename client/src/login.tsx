
import { useState } from 'react'
import type { FormEvent } from 'react'
import './Login.css'

export type UserRole = 'Admin' | 'Staff' | 'Viewer'

type LoginProps = {
  onLogin: (role: UserRole) => void
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('Admin')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setError('')
    onLogin(role)
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <header className="login-brand-header">
          <div className="login-brand-logo" aria-label="Smart Hospital logo">
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path
                d="M32 4L53 13V28C53 41 44 52 32 59C20 52 11 41 11 28V13L32 4Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M32 18V38M22 28H42"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M16 45H24L29 37L35 48L40 40H47"
                stroke="#7EF0D0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="login-brand-copy">
            <h1>SMART HOSPITAL MANAGEMENT</h1>
            <div className="login-tagline">
              <span />
              <p>Smarter care. Better outcomes.</p>
              <span />
            </div>
          </div>
        </header>

        <div className="login-brand-content">
        <div className="login-feature-list">
            <article className="login-feature">
            <div className="login-feature-icon feature-teal">✚</div>
            <div>
                <h3>Better Asset Management</h3>
                <p>Keep medical equipment organized and efficient.</p>
            </div>
            </article>

            <article className="login-feature">
            <div className="login-feature-icon feature-blue">♡</div>
            <div>
                <h3>Improved Patient Care</h3>
                <p>Help ensure critical equipment is always ready.</p>
            </div>
            </article>

            <article className="login-feature">
            <div className="login-feature-icon feature-purple">⚙</div>
            <div>
                <h3>Operational Efficiency</h3>
                <p>Reduce downtime and improve productivity.</p>
            </div>
            </article>

            <article className="login-feature">
            <div className="login-feature-icon feature-aqua">↗</div>
            <div>
                <h3>Data-Driven Decisions</h3>
                <p>Get useful insights and equipment reports.</p>
            </div>
            </article>
        </div>
        </div>


        <p className="login-brand-footer">
          Smart systems. Safer healthcare.
        </p>
      </section>

      <section className="login-form-panel">
        <div className="login-form-card">
          <div className="login-welcome-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#E6F2FF" />
              <circle
                cx="32"
                cy="23"
                r="9"
                stroke="#123B70"
                strokeWidth="3"
              />
              <path
                d="M14 51C14 41 21 36 32 36C43 36 50 41 50 51"
                stroke="#123B70"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="login-eyebrow">YOUR HEALTHCARE WORKSPACE</p>
          <h2 className="login-welcome-title">Welcome!</h2>
          <p className="login-subtitle">Sign in to your account</p>
          <p className="login-description">
            Enter your details to access your workspace.
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <section className="login-credentials-card">
              <div className="login-field">
                <label htmlFor="login-email">Email address</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M4 7L12 13L20 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@hospital.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Password</label>
                <div className="login-input-wrap login-password-wrap">
                  <span className="login-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect
                        x="4"
                        y="10"
                        width="16"
                        height="11"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 10V7A4 4 0 0116 7V10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </section>

            <fieldset className="login-role-card">
              <legend className="login-role-legend">Choose Your Role</legend>
              <p className="login-role-description">
                Select your role to continue
              </p>

              <div className="login-role-options">
                <button
                  type="button"
                  className={`login-role-option role-admin ${
                    role === 'Admin' ? 'selected' : ''
                  }`}
                  onClick={() => setRole('Admin')}
                  aria-pressed={role === 'Admin'}
                >
                  <span className="role-symbol role-admin-symbol">✚</span>
                  <strong>Admin</strong>
                  <small>Full Access</small>
                  {role === 'Admin' && <span className="role-check">✓</span>}
                </button>

                <button
                  type="button"
                  className={`login-role-option role-staff ${
                    role === 'Staff' ? 'selected' : ''
                  }`}
                  onClick={() => setRole('Staff')}
                  aria-pressed={role === 'Staff'}
                >
                  <span className="role-symbol role-staff-symbol">✚</span>
                  <strong>Staff</strong>
                  <small>Update Status</small>
                  {role === 'Staff' && <span className="role-check">✓</span>}
                </button>

                <button
                  type="button"
                  className={`login-role-option role-viewer ${
                    role === 'Viewer' ? 'selected' : ''
                  }`}
                  onClick={() => setRole('Viewer')}
                  aria-pressed={role === 'Viewer'}
                >
                  <span className="role-symbol role-viewer-symbol">◉</span>
                  <strong>Viewer</strong>
                  <small>Read Only</small>
                  {role === 'Viewer' && <span className="role-check">✓</span>}
                </button>
              </div>
            </fieldset>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-submit-button" type="submit">
              <span>Sign In to Workspace</span>
              <span className="login-submit-arrow" aria-hidden="true">
                →
              </span>
            </button>

            <p className="login-demo-note">
              Frontend demo · Authentication will be enabled after backend setup.
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Login

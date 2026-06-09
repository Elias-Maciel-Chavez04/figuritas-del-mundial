import React, { useState } from 'react'

const AVATARS = ['🙂', '⚽', '🦊', '🐯', '🦁', '🐼', '🐲', '🦅', '🐙', '👑']

export default function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('🙂')
  const [step, setStep] = useState('intro') // intro | form

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onLogin({ name: name.trim(), email: email.trim() || null, avatar })
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-badge">⚽</div>
        <h1>Figus Mundial 2026</h1>
        <p className="login-sub">
          Tu álbum digital. Marcá las que tenés, encontrá tus repes y cambialas
          con otra gente.
        </p>

        {step === 'intro' ? (
          <>
            <button className="google-btn" onClick={() => setStep('form')}>
              <GoogleIcon />
              Entrar con Google
            </button>
            <p className="login-note">
              Login simulado para la demo · no se conecta a Google de verdad
            </p>
          </>
        ) : (
          <form className="login-form" onSubmit={submit}>
            <label>
              Nombre para mostrar
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </label>
            <label>
              Email (opcional)
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@gmail.com"
                type="email"
              />
            </label>
            <div className="avatar-picker">
              <span>Avatar</span>
              <div className="avatar-row">
                {AVATARS.map((a) => (
                  <button
                    type="button"
                    key={a}
                    className={`avatar-opt ${avatar === a ? 'active' : ''}`}
                    onClick={() => setAvatar(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <button className="primary-btn" type="submit" disabled={!name.trim()}>
              Crear mi perfil
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => setStep('intro')}
            >
              ← Volver
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9 40.4 15.9 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C40.9 35.9 45 30.5 45 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  )
}

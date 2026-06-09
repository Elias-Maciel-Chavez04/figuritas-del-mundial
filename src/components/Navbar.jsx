import React from 'react'

const TABS = [
  { key: 'album', label: 'Mi álbum', icon: '📒' },
  { key: 'buscar', label: 'Buscar figuritas', icon: '🔍' },
  { key: 'comunidad', label: 'Comunidad', icon: '👥' },
]

export default function Navbar({ user, tab, onTab, onLogout, onReset }) {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-badge">⚽</span>
        <span className="brand-name">Figus Mundial 2026</span>
      </div>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => onTab(t.key)}
          >
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="user-box">
        <span className="user-avatar">{user.avatar}</span>
        <span className="user-name">{user.name}</span>
        <button className="ghost-btn" onClick={onReset} title="Reiniciar demo">
          ↻
        </button>
        <button className="ghost-btn" onClick={onLogout}>
          Salir
        </button>
      </div>
    </header>
  )
}

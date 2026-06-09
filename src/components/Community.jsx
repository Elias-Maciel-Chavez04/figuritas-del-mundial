import React, { useMemo, useState } from 'react'
import { STICKERS, TEAM_LIST } from '../data/stickers.js'
import StickerCard from './StickerCard.jsx'

export default function Community({ users, currentUserId }) {
  const [openId, setOpenId] = useState(null)

  const ranked = useMemo(() => {
    return users
      .map((u) => {
        const have = STICKERS.filter((s) => (u.owned?.[s.id] || 0) > 0).length
        const repes = STICKERS.reduce(
          (acc, s) => acc + Math.max(0, (u.owned?.[s.id] || 0) - 1),
          0
        )
        return { ...u, have, repes, pct: Math.round((have / STICKERS.length) * 100) }
      })
      .sort((a, b) => b.have - a.have)
  }, [users])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Comunidad</h2>
          <p className="muted">
            Estos son los perfiles. Tocá uno para ver su álbum y qué repes tiene.
          </p>
        </div>
      </div>

      <div className="people-grid">
        {ranked.map((u) => (
          <button
            key={u.id}
            className={`person-card ${u.id === currentUserId ? 'me' : ''}`}
            onClick={() => setOpenId(openId === u.id ? null : u.id)}
          >
            <span className="person-avatar">{u.avatar}</span>
            <span className="person-name">
              {u.name}
              {u.id === currentUserId && <span className="me-tag"> (vos)</span>}
            </span>
            {u.city && <span className="person-city">{u.city}</span>}
            <div className="person-stats">
              <span>{u.have}/{STICKERS.length}</span>
              <span className="dot">·</span>
              <span>{u.repes} repes</span>
            </div>
            <div className="mini-progress">
              <div style={{ width: `${u.pct}%` }} />
            </div>
            <span className="open-hint">{openId === u.id ? 'Ocultar álbum ▲' : 'Ver álbum ▼'}</span>
          </button>
        ))}
      </div>

      {openId && <PersonAlbum user={users.find((u) => u.id === openId)} />}
    </div>
  )
}

function PersonAlbum({ user }) {
  const [team, setTeam] = useState('')
  const [onlyRepes, setOnlyRepes] = useState(false)
  const owned = user.owned || {}

  const filtered = useMemo(() => {
    return STICKERS.filter((s) => {
      if (team && s.team !== team) return false
      const count = owned[s.id] || 0
      if (onlyRepes && count < 2) return false
      return true
    })
  }, [team, onlyRepes, owned])

  return (
    <div className="person-album">
      <h3>
        {user.avatar} Álbum de {user.name}
      </h3>
      <div className="filters">
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">Todos los equipos</option>
          {TEAM_LIST.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyRepes}
            onChange={(e) => setOnlyRepes(e.target.checked)}
          />
          Solo repes
        </label>
      </div>
      <div className="sticker-grid">
        {filtered.map((s) => (
          <StickerCard key={s.id} sticker={s} count={owned[s.id] || 0} />
        ))}
      </div>
    </div>
  )
}

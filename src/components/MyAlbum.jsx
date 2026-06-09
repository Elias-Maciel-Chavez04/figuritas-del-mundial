import React, { useMemo, useState } from 'react'
import { STICKERS, TEAM_LIST } from '../data/stickers.js'
import StickerCard from './StickerCard.jsx'

export default function MyAlbum({ user, onSetCount }) {
  const [team, setTeam] = useState('')
  const [player, setPlayer] = useState('')
  const [onlyMissing, setOnlyMissing] = useState(false)
  const [onlyRepes, setOnlyRepes] = useState(false)

  const owned = user.owned || {}

  const stats = useMemo(() => {
    const total = STICKERS.length
    const have = STICKERS.filter((s) => (owned[s.id] || 0) > 0).length
    const repes = STICKERS.reduce(
      (acc, s) => acc + Math.max(0, (owned[s.id] || 0) - 1),
      0
    )
    return { total, have, repes, pct: Math.round((have / total) * 100) }
  }, [owned])

  const filtered = useMemo(() => {
    const q = player.trim().toLowerCase()
    return STICKERS.filter((s) => {
      if (team && s.team !== team) return false
      if (q && !s.name.toLowerCase().includes(q)) return false
      const count = owned[s.id] || 0
      if (onlyMissing && count > 0) return false
      if (onlyRepes && count < 2) return false
      return true
    })
  }, [team, player, onlyMissing, onlyRepes, owned])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Mi álbum</h2>
          <p className="muted">
            Marcá las figuritas que tenés. Si tenés más de una, sumá la cantidad
            y se cuenta como repe para cambiar.
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-num">{stats.have}/{stats.total}</span>
            <span className="stat-label">completado</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.pct}%</span>
            <span className="stat-label">del álbum</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.repes}</span>
            <span className="stat-label">repes</span>
          </div>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${stats.pct}%` }} />
      </div>

      <div className="filters">
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">Todos los equipos</option>
          {TEAM_LIST.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          className="search-input"
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          placeholder="Buscar jugador…"
        />

        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyMissing}
            onChange={(e) => {
              setOnlyMissing(e.target.checked)
              if (e.target.checked) setOnlyRepes(false)
            }}
          />
          Solo las que faltan
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyRepes}
            onChange={(e) => {
              setOnlyRepes(e.target.checked)
              if (e.target.checked) setOnlyMissing(false)
            }}
          />
          Solo repes
        </label>
      </div>

      <div className="result-count">{filtered.length} figuritas</div>

      <div className="sticker-grid">
        {filtered.map((s) => (
          <StickerCard
            key={s.id}
            sticker={s}
            count={owned[s.id] || 0}
            onSetCount={onSetCount}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty">No hay figuritas con esos filtros.</div>
      )}
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import { STICKERS, COUNTRY_LIST } from '../data/stickers.js'

// initials del equipo para el "escudo"
function initials(team) {
  return team.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()
}

export default function SearchStickers({ users, currentUserId }) {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const hasFilter = q || country
    if (!hasFilter) return []

    const matched = STICKERS.filter((s) => {
      if (country && s.country !== country) return false
      if (q && !s.name.toLowerCase().includes(q)) return false
      return true
    })

    return matched.map((s) => {
      const holders = []
      for (const u of users) {
        const count = u.owned?.[s.id] || 0
        if (count > 0) {
          holders.push({
            id: u.id,
            name: u.name,
            avatar: u.avatar,
            city: u.city,
            isMe: u.id === currentUserId,
            repes: Math.max(0, count - 1),
          })
        }
      }
      // Primero los que tienen repes (para cambio), después por nombre.
      holders.sort((a, b) => b.repes - a.repes || a.name.localeCompare(b.name))
      return { sticker: s, holders }
    })
  }, [query, country, users, currentUserId])

  const hasFilter = query.trim() || country

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Buscar figuritas</h2>
          <p className="muted">
            Buscá un cromo por nombre o país y mirá quién lo tiene.
            Los que tienen <strong>repes</strong> pueden cambiártelo.
          </p>
        </div>
      </div>

      <div className="filters">
        <input
          className="search-input grow"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre del jugador… (ej: Messi)"
          autoFocus
        />
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">Cualquier país</option>
          {COUNTRY_LIST.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {!hasFilter && (
        <div className="empty">
          Escribí un nombre o elegí un país para empezar a buscar.
        </div>
      )}

      {hasFilter && results.length === 0 && (
        <div className="empty">No se encontró ninguna figurita con esos criterios.</div>
      )}

      {hasFilter && results.length > 0 && (
        <div className="result-count">
          {results.length} cromo{results.length > 1 ? 's' : ''} encontrado
          {results.length > 1 ? 's' : ''}
        </div>
      )}

      <div className="search-results">
        {results.map(({ sticker, holders }) => {
          const withRepes = holders.filter((h) => h.repes > 0)
          return (
            <div className="search-card" key={sticker.id}>
              <div className="search-card-head">
                <span
                  className="mini-crest"
                  style={{ background: sticker.color }}
                  title={sticker.team}
                >
                  {initials(sticker.team)}
                </span>
                <div className="search-card-info">
                  <div className="search-card-name">
                    #{sticker.number} · {sticker.name}
                  </div>
                  <div className="search-card-sub">
                    {sticker.country}
                  </div>
                </div>
              </div>

              {holders.length === 0 ? (
                <div className="no-holders">Nadie la tiene todavía.</div>
              ) : (
                <>
                  <div className="holders-summary">
                    {holders.length} {holders.length > 1 ? 'personas la tienen' : 'persona la tiene'}
                    {withRepes.length > 0 && (
                      <span className="trade-hint">
                        · {withRepes.length} con repe para cambio
                      </span>
                    )}
                  </div>
                  <ul className="holders">
                    {holders.map((h) => (
                      <li key={h.id} className={`holder ${h.repes > 0 ? 'tradable' : ''}`}>
                        <span className="holder-avatar">{h.avatar}</span>
                        <span className="holder-name">
                          {h.name}
                          {h.isMe && <span className="me-tag"> (vos)</span>}
                        </span>
                        {h.city && <span className="holder-city">{h.city}</span>}
                        {h.repes > 0 ? (
                          <span className="holder-repe">cambia {h.repes}</span>
                        ) : (
                          <span className="holder-norepe">sin repe</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

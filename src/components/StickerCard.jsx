import React, { useState } from 'react'

// initials del equipo para el "escudo" (respaldo si falta la imagen)
function initials(team) {
  return team
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

export default function StickerCard({ sticker, count = 0, onSetCount }) {
  const has = count > 0
  const repes = Math.max(0, count - 1)
  const interactive = typeof onSetCount === 'function'
  const [imgOk, setImgOk] = useState(true)

  return (
    <div className={`sticker ${has ? 'owned' : 'missing'}`}>
      <div className="sticker-top" style={{ background: sticker.color }}>
        {imgOk ? (
          <img
            className="sticker-img"
            src={`figus/${sticker.id}.jpg`}
            alt={sticker.name}
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="sticker-crest">{initials(sticker.team)}</span>
        )}
        <span className="sticker-num">#{sticker.number}</span>
        {repes > 0 && <span className="repe-badge">+{repes} repe{repes > 1 ? 's' : ''}</span>}
      </div>

      <div className="sticker-body">
        <div className="sticker-name">{sticker.name}</div>
        <div className="sticker-meta">
          <span className="chip team-chip">{sticker.team}</span>
        </div>
      </div>

      {interactive ? (
        <div className="sticker-actions">
          {!has ? (
            <button className="own-btn" onClick={() => onSetCount(sticker.id, 1)}>
              + La tengo
            </button>
          ) : (
            <div className="counter">
              <button onClick={() => onSetCount(sticker.id, count - 1)} aria-label="menos">
                −
              </button>
              <span className="count-val">{count}</span>
              <button onClick={() => onSetCount(sticker.id, count + 1)} aria-label="más">
                +
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="sticker-actions view-only">
          {has ? (
            <span className="have-tag">La tiene{repes > 0 ? ` · ${repes} para cambio` : ''}</span>
          ) : (
            <span className="missing-tag">No la tiene</span>
          )}
        </div>
      )}
    </div>
  )
}

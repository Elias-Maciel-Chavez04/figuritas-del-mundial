import React, { useEffect, useMemo, useState } from 'react'
import {
  loadUsers,
  saveUsers,
  loadCurrentUserId,
  saveCurrentUserId,
  resetAll,
} from './lib/storage.js'
import { buildFakeUsers } from './lib/seed.js'
import Login from './components/Login.jsx'
import Navbar from './components/Navbar.jsx'
import MyAlbum from './components/MyAlbum.jsx'
import SearchStickers from './components/SearchStickers.jsx'
import Community from './components/Community.jsx'

export default function App() {
  const [users, setUsers] = useState(() => loadUsers() || buildFakeUsers())
  const [currentUserId, setCurrentUserId] = useState(() => loadCurrentUserId())
  const [tab, setTab] = useState('album')

  // Persistir cambios.
  useEffect(() => {
    saveUsers(users)
  }, [users])
  useEffect(() => {
    saveCurrentUserId(currentUserId)
  }, [currentUserId])

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  )

  // --- Sesión (Google simulado) -------------------------------------------
  function handleLogin({ name, email, avatar }) {
    const id = `me_${email || name}`.toLowerCase().replace(/[^a-z0-9]/g, '_')
    setUsers((prev) => {
      const existing = prev.find((u) => u.id === id)
      if (existing) return prev
      const me = {
        id,
        name,
        email,
        avatar: avatar || '🙂',
        city: '',
        isFake: false,
        owned: {},
      }
      return [me, ...prev]
    })
    setCurrentUserId(id)
    setTab('album')
  }

  function handleLogout() {
    setCurrentUserId(null)
  }

  function handleReset() {
    if (!confirm('¿Reiniciar la demo? Se borran tu sesión y todos los datos guardados.'))
      return
    resetAll()
    const fresh = buildFakeUsers()
    setUsers(fresh)
    setCurrentUserId(null)
    setTab('album')
  }

  // Actualiza la cantidad de una figurita del usuario actual.
  function setOwnedCount(stickerId, count) {
    if (!currentUser) return
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u
        const owned = { ...u.owned }
        if (count <= 0) delete owned[stickerId]
        else owned[stickerId] = count
        return { ...u, owned }
      })
    )
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <Navbar
        user={currentUser}
        tab={tab}
        onTab={setTab}
        onLogout={handleLogout}
        onReset={handleReset}
      />
      <main className="content">
        {tab === 'album' && (
          <MyAlbum user={currentUser} onSetCount={setOwnedCount} />
        )}
        {tab === 'buscar' && (
          <SearchStickers users={users} currentUserId={currentUser.id} />
        )}
        {tab === 'comunidad' && (
          <Community users={users} currentUserId={currentUser.id} />
        )}
      </main>
      <footer className="footer">
        Figus Mundial 2026 · demo · datos guardados en tu navegador
      </footer>
    </div>
  )
}

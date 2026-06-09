// Persistencia simple en localStorage del navegador.

const USERS_KEY = 'figus_users_v2'
const CURRENT_KEY = 'figus_current_user_v2'

export function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function loadCurrentUserId() {
  return localStorage.getItem(CURRENT_KEY) || null
}

export function saveCurrentUserId(id) {
  if (id) localStorage.setItem(CURRENT_KEY, id)
  else localStorage.removeItem(CURRENT_KEY)
}

// Borra todo (útil para resetear la demo).
export function resetAll() {
  localStorage.removeItem(USERS_KEY)
  localStorage.removeItem(CURRENT_KEY)
}

// Genera perfiles falsos con figuritas repartidas al azar, para poder ver
// cómo queda la app y probar la búsqueda / intercambio desde el primer minuto.

import { STICKERS } from '../data/stickers.js'

const FAKE_PEOPLE = [
  { name: 'Sofía Gómez', avatar: '🦊', city: 'Buenos Aires' },
  { name: 'Mateo Fernández', avatar: '🐯', city: 'Rosario' },
  { name: 'Valentina Ríos', avatar: '🦉', city: 'Córdoba' },
  { name: 'Bruno Acosta', avatar: '🐻', city: 'Montevideo' },
  { name: 'Camila Torres', avatar: '🦄', city: 'Mendoza' },
  { name: 'Lucas Medina', avatar: '🐺', city: 'La Plata' },
  { name: 'Martina Silva', avatar: '🐱', city: 'Santiago' },
  { name: 'Thiago Romero', avatar: '🦁', city: 'Asunción' },
  { name: 'Julieta Castro', avatar: '🐧', city: 'Mar del Plata' },
  { name: 'Benjamín Díaz', avatar: '🐢', city: 'Lima' },
]

// PRNG determinístico para que la demo sea estable entre recargas.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildFakeUsers() {
  return FAKE_PEOPLE.map((person, i) => {
    const rand = mulberry32(1000 + i * 37)
    const owned = {}
    for (const sticker of STICKERS) {
      const roll = rand()
      // ~55% de probabilidad de tener cada figurita.
      if (roll < 0.55) {
        // De las que tiene, algunas son repetidas.
        let count = 1
        const repRoll = rand()
        if (repRoll > 0.8) count = 3
        else if (repRoll > 0.55) count = 2
        owned[sticker.id] = count
      }
    }
    return {
      id: `fake_${i}`,
      name: person.name,
      email: null,
      avatar: person.avatar,
      city: person.city,
      isFake: true,
      owned,
    }
  })
}

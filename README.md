# ⚽ Figus Mundial 2026 — Álbum & Intercambio

App web para llevar tu álbum de figuritas del Mundial 2026, marcar las que tenés
y tus repes, y encontrar gente con quien cambiar.

## Cómo correrla

```bash
cd figus-mundial
npm install        # solo la primera vez
npm run dev        # abre http://localhost:5173
```

Para una versión optimizada de producción:

```bash
npm run build      # genera la carpeta dist/
npm run preview    # sirve la versión compilada
```

## Qué tiene

- **Álbum real Panini Mundial 2026:** 48 selecciones × 18 jugadores = **864
  figuritas**, con nombres del checklist oficial (verificados contra los PDFs).
- **Login con Google (simulado):** botón que crea tu sesión al instante. No se
  conecta a Google de verdad todavía — ver más abajo cómo activarlo.
- **Mi álbum:** todas las figuritas ya vienen cargadas. Marcás las que *tenés*,
  y si tenés más de una sumás la cantidad (la 2ª en adelante cuenta como *repe*).
  Filtros por **equipo** y búsqueda por **jugador**, más atajos
  "solo las que faltan" / "solo repes".
- **Buscar figuritas:** buscás un cromo por **nombre o país** y te muestra
  **qué personas lo tienen**, primero las que tienen repe para cambiar.
- **Comunidad:** perfiles (incluidos los falsos de demostración) rankeados por
  completado; tocás uno para ver su álbum y sus repes.

Los datos se guardan en el navegador (localStorage). El botón **↻** de la barra
superior reinicia la demo.

> **Nota sobre datos:** las figuritas no traen la posición impresa, así que la
> app filtra por equipo/jugador/país (sin posición). Las selecciones extra
> (Doradas, Hologramas, Extra Stickers) todavía no están cargadas; se pueden
> agregar como categorías aparte.

## 📋 Cargar TU lista real de figuritas

El álbum está en [`src/data/stickers.js`](src/data/stickers.js). Para corregir
un nombre o agregar/quitar jugadores, editá la lista `players` del equipo:

```js
const TEAMS = [
  {
    team: 'Argentina', country: 'Argentina', color: '#6CACE4',
    players: ['Lionel Messi', 'Julián Álvarez', /* ... */],
  },
  // ... más equipos
]
```

La numeración de las figuritas se genera sola. Si querés que corrija varios
nombres de una, pasame la lista de cambios.

## 🔐 Activar Google real (más adelante)

La versión actual usa login simulado para que se pueda ver funcionando ya.
Para login real con Google se necesita:

1. Un backend con base de datos (recomendado migrar a Next.js + Prisma/SQLite).
2. Credenciales OAuth de Google Cloud Console (Client ID + Secret).
3. Integrar NextAuth (o similar) y mover los datos del navegador a la base.

Avisá cuando quieras dar ese paso y lo armamos.

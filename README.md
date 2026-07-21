# entidades-digitales

Plataforma multitenant de entidades digitales dinámicas: perfiles accesibles vía QR, NFC, enlace directo o código corto (`/q/{slug}`), con activación por reclamo y edición restringida al propietario.

## Estado del desarrollo

Desarrollo por fases. No se avanza de fase sin ≥90% de cumplimiento funcional y de tests.

- [x] **Fase 1 — Arquitectura base, modelos y autenticación** (completa)
- [x] **Fase 2 — Motor de slugs, acceso multicanal y reclamación** (completa)
- [x] **Fase 3 — CRUD de entidades y modelado JSONB dinámico** (completa)
- [x] **Fase 4 — Frontend y renderizado dinámico (mobile-first)** (completa)
- [ ] Fase 5 — Testing de integración, seguridad y refinamiento

## Arquitectura

- `backend/`: API REST en Node.js + TypeScript + Express 5 + Prisma 7 + PostgreSQL.
- `frontend/`: SPA en React + TypeScript + Vite, mobile-first, consume la API.

## Fase 1 — Arquitectura base y autenticación

**Esquema de base de datos** (`backend/prisma/schema.prisma`):
- `users`: `id` (UUID), `email` (único), `password_hash`, `created_at`, `updated_at`.
- `entities`: `id` (UUID), `slug` (único), `user_id` (FK nulo), `is_claimed`, `entity_type` (enum: `sports_team`, `tournament`, `sports_player`, `menu`, `catalog`, `vcard`, `emergency_id`), `title`, `is_active`, `payload` (JSONB), `created_at`, `updated_at`.

**Autenticación** (`backend/src/routes/auth.routes.ts`):
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` — JWT + bcrypt.

## Fase 2 — Slugs, acceso multicanal y reclamación

- `GET /api/entities/resolve/:slug` (público): resuelve un código corto — distingue inexistente / no reclamado / reclamado, con `isOwner` cuando el visitante autenticado es el dueño. Es el mismo endpoint que usan el escaneo de QR/NFC (`/q/{slug}`) y el buscador de la home.
- `POST /api/entities/claim` (autenticado): reclama un slug pre-provisto o crea uno nuevo asociado a la cuenta.

## Fase 3 — CRUD de entidades (JSONB dinámico + RBAC)

- `POST /api/entities`, `GET /api/entities/mine`, `GET /api/entities/:id`, `PATCH /api/entities/:id`, `DELETE /api/entities/:id` — solo el propietario puede escribir (RBAC verificado por `user_id`).
- Validación de `payload` por `entity_type` (`backend/src/schemas/payloads.ts`), flexible (permite campos adicionales) pero valida la forma esperada de cada tipo.

## Fase 4 — Frontend mobile-first

- **Landing** (`/`): buscador de código corto.
- **`/q/:slug`**: resuelve el código — si no existe o no está reclamado, muestra el flujo de reclamación (login/registro + formulario); si está reclamado, renderiza la vista dinámica según `entity_type` (7 vistas: equipo, torneo, ficha de jugador, menú, catálogo, vCard, identificación de emergencia), con código QR descargable y botón "Editar perfil" visible solo para el dueño.
- **`/dashboard`**: lista las entidades del usuario autenticado.
- **`/entities/new`** y **`/entities/:id/edit`**: formularios de creación/edición con campos adaptados a cada `entity_type`.
- vCard exporta un archivo `.vcf` descargable; identificación de emergencia expone botones directos de llamada y WhatsApp.
- Verificado manualmente en viewport mobile (Playwright, iPhone 12) para los 7 tipos de entidad: renderizado, RBAC (sin botón de edición para visitantes no dueños), exportación `.vcf`, enlaces `tel:`/`wa.me` y descarga de QR.

## Tests

49 tests de integración de backend (Jest + Supertest) contra una base de datos Postgres real: autenticación, modelo `Entity`, resolución/reclamación de slugs, CRUD y RBAC de entidades para los 7 tipos.

## Cómo correr el proyecto localmente

### Backend

```bash
cd backend
npm install

# Base de datos Postgres (dev y test)
createdb entidades_digitales
createdb entidades_digitales_test

cp .env.example .env   # y completar DATABASE_URL / JWT_SECRET
npm run prisma:migrate            # aplica migraciones a la DB de dev
npm run prisma:migrate:test       # aplica migraciones a la DB de test (usa .env.test)

npm run dev     # servidor en http://localhost:3000
npm test        # suite de tests de integración
npm run build   # compila a dist/
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173 (usa VITE_API_URL del .env, por defecto http://localhost:3000/api)
npm run build   # build de producción a dist/
```

# entidades-digitales

Plataforma multitenant de entidades digitales dinámicas: perfiles accesibles vía QR, NFC, enlace directo o código corto (`/q/{slug}`), con activación por reclamo y edición restringida al propietario.

## Estado del desarrollo

Desarrollo por fases. No se avanza de fase sin ≥90% de cumplimiento funcional y de tests.

- [x] **Fase 1 — Arquitectura base, modelos y autenticación** (completa)
- [ ] Fase 2 — Motor de slugs, acceso multicanal y reclamación
- [ ] Fase 3 — CRUD de entidades y modelado JSONB dinámico
- [ ] Fase 4 — Frontend y renderizado dinámico (mobile-first)
- [ ] Fase 5 — Testing de integración, seguridad y refinamiento

## Fase 1 — Resumen

**Stack:** Node.js + TypeScript + Express 5 + Prisma 7 (driver adapter `@prisma/adapter-pg`) + PostgreSQL + JWT + Jest/Supertest.

**Esquema de base de datos** (`backend/prisma/schema.prisma`):
- `users`: `id` (UUID), `email` (único), `password_hash`, `created_at`, `updated_at`.
- `entities`: `id` (UUID), `slug` (único), `user_id` (FK nulo), `is_claimed`, `entity_type` (enum: `sports_team`, `tournament`, `sports_player`, `menu`, `catalog`, `vcard`, `emergency_id`), `title`, `is_active`, `payload` (JSONB), `created_at`, `updated_at`.

**Autenticación** (`backend/src/routes/auth.routes.ts`):
- `POST /api/auth/register` — crea cuenta (email + password, hash con bcrypt), devuelve JWT.
- `POST /api/auth/login` — valida credenciales, devuelve JWT.
- `GET /api/auth/me` — perfil del usuario autenticado (requiere `Authorization: Bearer <token>`).

**Tests:** 15 pruebas de integración (Jest + Supertest) contra una base de datos Postgres real, cubriendo registro, login, `/me`, validación, duplicados, y comportamiento del modelo `Entity` (JSONB, slug único, reclamación, `ON DELETE SET NULL`). Todas pasan.

## Cómo correr el backend localmente

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

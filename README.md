# entidades-digitales

Plataforma multitenant de **entidades digitales multiacceso**: perfiles dinámicos
accesibles vía QR, NFC, URL directa o código corto (`/q/{slug}`), con reclamación
de propiedad y edición restringida al dueño.

Este repo se desarrolla por fases. Estado actual: **Fase 1 — Arquitectura base,
modelos y autenticación**.

## Stack

- Node.js 22 + TypeScript + Express
- PostgreSQL + Prisma (payload de entidades en `jsonb`)
- JWT (access token) + refresh token opaco persistido en DB (rotación + revocación)
- bcryptjs para hashing de contraseñas
- Jest + Supertest para tests de integración

## Modelo de datos (Fase 1)

- **`users`**: `id`, `email` (único), `password_hash`, timestamps.
- **`refresh_tokens`**: sesiones activas por usuario, con `expires_at` y
  `revoked_at` para poder cerrar sesión y rotar tokens sin usar JWT stateless
  para el refresh.
- **`entities`**: tabla única para todos los tipos de entidad (`sports_team`,
  `tournament`, `sports_player`, `menu`, `catalog`, `vcard`, `emergency_id`),
  con `slug` único, `user_id` nulable (hasta que se reclama), `is_claimed`,
  `is_active` y `payload jsonb` para el contenido específico de cada tipo. El
  CRUD de `payload` y el resolutor `/q/{slug}` se implementan en fases
  posteriores.

Ver `prisma/schema.prisma` para el detalle completo.

## Setup local

1. Instalar dependencias:

   ```sh
   npm install
   ```

2. Tener Postgres corriendo y crear las bases (dev y test):

   ```sh
   createdb entidades_dev
   createdb entidades_test
   ```

3. Copiar `.env.example` a `.env` (y a `.env.test` con otra base de datos) y
   completar las variables.

4. Aplicar migraciones:

   ```sh
   npm run prisma:migrate          # contra .env (dev)
   npx dotenv -e .env.test -- npx prisma migrate deploy   # contra .env.test
   ```

5. Levantar la API en modo desarrollo:

   ```sh
   npm run dev
   ```

## Tests

```sh
npm test
```

Corre contra una base de datos Postgres real (`.env.test`), limpiando las
tablas relevantes antes de cada test (`tests/setup.ts`).

## Endpoints de autenticación (Fase 1)

| Método | Ruta                  | Auth requerida | Descripción                                  |
| ------ | --------------------- | -------------- | --------------------------------------------- |
| POST   | `/api/auth/register`  | No             | Crea una cuenta y devuelve `accessToken`/`refreshToken` |
| POST   | `/api/auth/login`     | No             | Autentica y devuelve `accessToken`/`refreshToken` |
| POST   | `/api/auth/refresh`   | No             | Rota el refresh token y emite un nuevo par de tokens |
| POST   | `/api/auth/logout`    | No             | Revoca un refresh token                       |
| GET    | `/api/auth/me`        | Sí (`Bearer`)  | Devuelve el usuario autenticado               |

`GET /health` expone un healthcheck simple.

## Próximas fases

- **Fase 2**: resolutor `/q/{slug}`, búsqueda por código corto y flujo de
  reclamación de entidades no asignadas.
- **Fase 3**: CRUD de `payload` por `entity_type` con RBAC (solo el dueño
  edita).
- **Fase 4**: renderizado dinámico mobile-first y generación/exportación de QR.
- **Fase 5**: e2e, auditoría de seguridad y refinamiento.

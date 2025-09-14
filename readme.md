# README

Monorepo com **Next.js** (frontend) e **Express** (backend).

## Estrutura

```
apps/
  web/   # Frontend (Next.js / App Router)
  api/   # Backend (Express + Sequelize)
```

---

## Requisitos

* Node.js 18+
* npm ou yarn
* Banco (MySQL) configurado no Sequelize

---

## Backend — `apps/api`

### 1) Variáveis de ambiente (`apps/api/.env`)

```env
PORT=4000
JWT_SECRET=supersecretchangeit
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=desafio
DB_PASSWORD=desafio
DB_NAME=desafio
NODE_ENV=development
```

### 2) Instalar e preparar DB

```bash
cd apps/api
npm i
npx sequelize db:migrate
npx sequelize db:seed:all
```

### 3) Rodar a API

```bash
npm run dev
# sobe em http://localhost:4000
```

### Endpoints (resumo)

* `POST /auth/login` — login (gera cookie/JWT)
* `POST /auth/logout` — logout
* `GET  /users/me` — usuário autenticado
* `GET  /users` — admin: lista; customer: perfil (flat)
* `GET  /users/:id` — admin: detalhe
* `PATCH /users` — atualiza (self/admin)
* `GET  /rooms` — lista salas (use `?full=1` p/ horários/slot)
* `POST /rooms` — admin: cria
* `PATCH /rooms/:id` — admin: atualiza
* `GET  /bookings` — lista agendamentos (admin vê todos)
* `POST /bookings` — cria agendamento
* `DELETE /bookings/:id` — cancela
* `PATCH /bookings/:id/status` — altera status (regras por role)
* `GET  /logs` — lista logs (admin)

---

## Frontend — `apps/web`

### 1) Variáveis de ambiente (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 2) Instalar e rodar

```bash
cd apps/web
npm i
npm run dev
# abre em http://localhost:3000
```

### Rotas principais

* Público:

  * `/login` – login do usuário
  * `/cadastro` – cadastro (se aplicável)
* App (cliente):

  * `/agendamentos` – meus agendamentos
  * `/perfil` – minha conta
  * `/logs` – meus logs (se expostos)
* Admin (App Router com grupo `(admin)`):

  * `/admin` – login admin
  * `/admin/agendamentos` – todos os agendamentos
  * `/admin/clientes` – lista de clientes
  * `/admin/logs` – logs gerais
  * `/admin/perfil` – perfil do admin

> **Obs.:** O admin usa a **mesma rota de login** do backend (`/auth/login`), mas redireciona para `/admin/agendamentos` se o `role` for `ADMIN`.

---

## Fluxo de desenvolvimento

1. Inicie a API:

   ```bash
   cd apps/api
   npm run dev
   ```
2. Inicie o front:

   ```bash
   cd apps/web
   npm run dev
   ```
3. Acesse:

   * Front: [http://localhost:3000](http://localhost:3000)
   * API: [http://localhost:4000](http://localhost:4000)

---

## Scripts úteis

### API

* `npm run dev` — nodemon
* `npm run migrate` — aplica migrations
* `npm run seed` — aplica seeds

### Web

* `npm run dev` — next dev
* `npm run build` — build
* `npm start` — produção

---

## Dicas

* Se usar **cookies httpOnly** no login, garanta `credentials: 'include'` no fetch do front e `CORS` configurado com `WEB_ORIGIN`.
* O Sequelize está com `underscored: true` e migrations criando `snake_case` (ex.: `created_at`/`updated_at`).
* O serviço de **audit** (`services/audit.js`) registra ações como `VIEW`, `UPDATE`, `LOGIN`, `LOGOUT` em `logs`.
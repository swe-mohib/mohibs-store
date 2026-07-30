# Contributing to Mohibs Store

This guide covers everything needed to get both apps running locally and how to submit changes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting the Code](#getting-the-code)
- [Setting Up `backend-cms-admin`](#setting-up-backend-cms-admin)
- [Setting Up `frontend`](#setting-up-frontend)
- [Running Both Together](#running-both-together)
- [Database Workflow](#database-workflow)
- [Testing Docker Builds Locally](#testing-docker-builds-locally)
- [Branching & Commit Conventions](#branching--commit-conventions)
- [Making a Contribution](#making-a-contribution)
- [Code Style](#code-style)
- [Common Local Issues](#common-local-issues)

---

## Prerequisites

Install these before starting:

| Tool    | Version                               | Check with         |
| ------- | ------------------------------------- | ------------------ |
| Node.js | 20.x (match production)               | `node -v`          |
| npm     | 10.x                                  | `npm -v`           |
| Git     | any recent                            | `git --version`    |
| Docker  | recent (optional, for testing builds) | `docker --version` |

You'll also need accounts/credentials for:

- A Postgres database (a free [Neon](https://neon.tech) branch works well for local dev, keeps prod data untouched)
- [Clerk](https://clerk.com) test-mode keys (for `backend-cms-admin`)
- [Razorpay](https://razorpay.com) test-mode keys
- [Cloudinary](https://cloudinary.com) account (for `backend-cms-admin`)

Ask a maintainer for test/dev credentials if you don't have your own — never use production keys locally.

## Getting the Code

```bash
git clone https://github.com/<org>/mohibs-store.git
cd mohibs-store
```

Repo layout:

```
mohibs-store/
├─ frontend/             Storefront (Next.js 15)
└─ backend-cms-admin/    Admin CMS + API (Next.js 15, Prisma)
```

Each app has its own `package.json`, `node_modules`, and `.env` — they are not a single workspace, so install/run steps happen independently in each folder.

## Setting Up `backend-cms-admin`

```bash
cd backend-cms-admin
cp .env.example .env
```

Fill in `.env` with your dev credentials:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

DATABASE_URL=postgresql://user:pass@your-dev-db-host/dbname?sslmode=require

NODE_ENV=development

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-dev-cloud-name

ALLOWED_ORIGIN=http://localhost:3001

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
```

Install dependencies and set up the database:

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

`prisma migrate dev` creates the dev database schema and prompts you to name a migration if your local `prisma/schema.prisma` has uncommitted changes — only do this when you're intentionally changing the schema (see [Database Workflow](#database-workflow)).

Run the dev server:

```bash
npm run dev
```

Runs at `http://localhost:3000` by default.

## Setting Up `frontend`

Open a **new terminal tab/window** (both apps run simultaneously):

```bash
cd frontend
cp .env.example .env
```

Fill in `.env`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> `NEXT_PUBLIC_API_URL` should point at wherever `backend-cms-admin` is running locally. Since both apps default to port 3000, run frontend on a different port (see below) to avoid a clash.

Install and run on a separate port:

```bash
npm install
npm run dev -- -p 3001
```

Runs at `http://localhost:3001`.

## Running Both Together

Recommended: two terminal tabs, one per app.

```bash
# Terminal 1
cd backend-cms-admin && npm run dev            # http://localhost:3000

# Terminal 2
cd frontend && npm run dev -- -p 3001          # http://localhost:3001
```

Make sure `frontend/.env`'s `NEXT_PUBLIC_API_URL` matches wherever `backend-cms-admin` is actually listening (`http://localhost:3000` in the example above).

## Database Workflow

Schema lives at `backend-cms-admin/prisma/schema.prisma`. This is the **only** place migrations are defined — `frontend` has no direct database access, it talks to `backend-cms-admin`'s API.

**Changing the schema:**

```bash
cd backend-cms-admin
# edit prisma/schema.prisma
npx prisma migrate dev --name describe_your_change
```

This generates a new folder under `prisma/migrations/` — **commit this folder** along with your schema change. Production applies these automatically via `prisma migrate deploy` at container startup (see main [README](./README.md#database-migrations)) — never run `migrate dev` against production data.

**Inspecting data locally:**

```bash
npx prisma studio
```

Opens a browser GUI at `http://localhost:5555` for browsing/editing your dev database.

## Testing Docker Builds Locally

Before opening a PR that touches a `Dockerfile`, `docker-entrypoint.sh`, or anything affecting the production build, test it locally:

```bash
# From repo root

docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx \
  -t mohibs-frontend-test ./frontend

docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/ \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/ \
  --build-arg NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-dev-cloud-name \
  -t mohibs-backend-cms-admin-test ./backend-cms-admin
```

If both build without errors, run the backend container standalone to confirm migrations + startup work:

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@your-dev-db-host/dbname?sslmode=require" \
  -e NODE_ENV=production \
  -e CLERK_SECRET_KEY=sk_test_xxxx \
  -e ALLOWED_ORIGIN=http://localhost:3001 \
  -e RAZORPAY_KEY_ID=rzp_test_xxxx \
  -e RAZORPAY_KEY_SECRET=xxxx \
  mohibs-backend-cms-admin-test
```

A build passing locally with the same `docker build` invocation used in CI is the strongest signal a PR won't break the pipeline — this is exactly what `.github/workflows/deploy.yml` runs, just on your machine instead of a GitHub runner.

## Branching & Commit Conventions

- Branch off `main`: `git checkout -b feature/short-description` or `fix/short-description`
- Keep commits scoped and descriptive. Prefixes like `feat:`, `fix:`, `chore:`, `docs:` are encouraged but not strictly enforced.
- Rebase on latest `main` before opening a PR if your branch has drifted:
  ```bash
  git fetch origin
  git rebase origin/main
  ```

## Making a Contribution

1. Fork or branch, make your changes.
2. Run the app(s) locally and confirm your change works end-to-end.
3. If you touched `backend-cms-admin/prisma/schema.prisma`, confirm a migration file was generated and committed.
4. If you touched a `Dockerfile` or `docker-entrypoint.sh`, test the Docker build locally (see above).
5. Push your branch and open a PR against `main`.
6. CI runs automatically — a failing `build-frontend` or `build-backend-cms-admin` job means something needs fixing before merge (check the Actions log for the specific step).
7. Once merged to `main`, the deploy pipeline automatically rebuilds and redeploys only the app(s) whose folder changed — no manual deployment steps needed.

> Note: since this repo deploys straight from `main` (single production environment, no staging branch), be confident in a change before merging — it goes live on the next push.

## Code Style

- TypeScript throughout both apps — avoid introducing untyped `any` where a real type is available.
- Match existing formatting; run your editor's Prettier/ESLint integration if configured in the repo (check `.eslintrc`/`.prettierrc` if present).
- Next.js build already runs lint + type checks (`Linting and checking validity of types...`) — a PR with lint/type errors will fail CI at the build step, so run `npm run build` locally before pushing if unsure.
- Keep secrets out of code and commits — always through `.env` (local) or SSM (production), never hardcoded.

## Common Local Issues

| Symptom                                                | Likely cause                                                         | Fix                                                                                             |
| ------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `Error: connect ECONNREFUSED` on frontend pages        | `backend-cms-admin` isn't running, or `NEXT_PUBLIC_API_URL` is wrong | Confirm backend is running and the URL/port match                                               |
| Prisma client errors after pulling latest `main`       | Schema changed, client wasn't regenerated                            | `npx prisma generate`                                                                           |
| `npx prisma migrate dev` prompts to reset the database | Your local migration history has diverged from the committed one     | Usually safe to reset in dev: confirm the reset prompt (never do this against a shared/prod DB) |
| Port 3000 already in use                               | Both apps trying to use the same port                                | Run frontend with `npm run dev -- -p 3001`                                                      |
| Clerk/Razorpay/Cloudinary calls fail locally           | Using production keys, or keys not in test mode                      | Double-check you're using **test-mode** credentials in your local `.env`                        |

For anything related to production deployment, Docker, CI/CD, or infrastructure, see the main [README.md](./README.md).

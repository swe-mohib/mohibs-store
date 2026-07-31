# Mohibs Store

Production e-commerce platform consisting of a customer-facing storefront and an admin CMS/API, deployed via Docker on a single EC2 instance with automated CI/CD through GitHub Actions.

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker](#docker)
- [CI/CD Pipeline](#cicd-pipeline)
- [Infrastructure Setup (One-Time)](#infrastructure-setup-one-time)
- [Deployment](#deployment)
- [HTTPS / SSL](#https--ssl)
- [Database Migrations](#database-migrations)
- [Secrets Management](#secrets-management)
- [Troubleshooting](#troubleshooting)
- [Manual Operations Cheat Sheet](#manual-operations-cheat-sheet)

---

## Architecture

```
                        ┌──────────────────────────┐
                        │        Internet          │
                        └────────────┬─────────────┘
                                     │  :80 / :443
                        ┌────────────▼───────────────┐
                        │      Nginx (reverse        │
                        │      proxy + SSL)          │
                        └──────┬─────────────┬───────┘
             store.mohibs.in   │             │  cms.store.mohibs.in
                        ┌──────▼───────┐ ┌───▼────────────────────┐
                        │  frontend    │ │  backend-cms-admin     │
                        │  (Next.js)   │ │  (Next.js + Prisma)    │
                        │  :3000       │ │  :3000                 │
                        └──────────────┘ └─────────┬──────────────┘
                                                   │
                                          ┌────────▼───────────┐
                                          │   Neon Postgres    │
                                          │   (managed DB)     │
                                          └────────────────────┘
```

All three application containers run on a single EC2 instance via Docker Compose. Nginx is the only container exposed to the internet (ports 80/443); `frontend` and `backend-cms-admin` are reachable only inside the Docker network.

## Project Structure

```
mohibs-store/
├─ frontend/                   Storefront (Next.js 15)
│  ├─ Dockerfile
│  ├─ .dockerignore
│  ├─ .env.example
│  └─ ..
├─ backend-cms-admin/          Admin CMS + API (Next.js 15, Prisma)
│  ├─ Dockerfile
│  ├─ .dockerignore
│  ├─ docker-entrypoint.sh     Runs `prisma migrate deploy` before app start
│  ├─ .env.example
│  ├─ ..
│  └─ prisma/
│     └─ schema.prisma
├─ nginx/
│  └─ default.conf             Reverse proxy + SSL config
├─ docker-compose.yml
├─ .github/
│  └─ workflows/
│     └─ deploy.yml            CI/CD pipeline
├─ .gitattributes              Forces LF line endings for .sh files
└─ .gitignore
```

## Tech Stack

| Layer            | Technology                      |
| ---------------- | ------------------------------- |
| Frontend         | Next.js 15, deployed standalone |
| Backend/CMS      | Next.js 15 + Prisma ORM         |
| Auth             | Clerk                           |
| Payments         | Razorpay                        |
| Media            | Cloudinary                      |
| Database         | Neon (managed Postgres)         |
| Containerization | Docker (multi-stage builds)     |
| Reverse proxy    | Nginx                           |
| CI/CD            | GitHub Actions                  |
| Image registry   | Docker Hub                      |
| Secrets          | AWS SSM Parameter Store         |
| Hosting          | AWS EC2 (Ubuntu)                |

## Environment Variables

### `frontend/.env` (local dev only — never committed)

```dotenv
NEXT_PUBLIC_API_URL=https://cms.store.mohibs.in
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

Both variables are `NEXT_PUBLIC_*`, meaning they're public by design (bundled into client-side JS) and baked in at **Docker build time** as build args — the frontend container needs no runtime secrets and has no `.env` file on the server.

### `backend-cms-admin/.env` (local dev only — never committed)

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

NODE_ENV=production

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxxxxxxxx

ALLOWED_ORIGIN=https://store.mohibs.in

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
```

Variables split into two categories:

| Category                         | Variables                                                                                                                                                                                                                                        | Where they live in production                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **Build-time** (`NEXT_PUBLIC_*`) | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | GitHub Actions **repository variables**, passed as Docker `build-args`                      |
| **Runtime secrets**              | `CLERK_SECRET_KEY`, `DATABASE_URL`, `NODE_ENV`, `ALLOWED_ORIGIN`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`                                                                                                                                       | AWS SSM Parameter Store, fetched fresh on every deploy into `.env.backend-cms-admin` on EC2 |

> ⚠️ Any SDK client that requires a runtime secret (Razorpay, etc.) **must be instantiated inside the request handler**, not at module top level — otherwise Next.js's build-time page-data collection will try to run it with no secrets available and fail the Docker build.

## Local Development

Each app runs independently with the standard Next.js workflow — Docker is only used for production builds/deployment, not local dev.

```bash
cd frontend
cp .env.example .env      # fill in real values
npm install
npm run dev                # http://localhost:3000
```

```bash
cd backend-cms-admin
cp .env.example .env      # fill in real values
npm install
npx prisma generate
npx prisma migrate dev     # applies migrations against your dev DB
npm run dev                # http://localhost:3000
```

## Docker

Both apps use multi-stage Dockerfiles (`deps` → `builder` → `runner`) producing a minimal `node:20-alpine`-based production image using Next.js's `output: 'standalone'` mode.

### Frontend build

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://cms.store.mohibs.in \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx \
  -t mohibs-frontend ./frontend
```

### Backend build

```bash
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/ \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/ \
  --build-arg NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxxxxxxxx \
  -t mohibs-backend-cms-admin ./backend-cms-admin
```

### Important Dockerfile details

- **`backend-cms-admin/Dockerfile`** copies the _entire_ `node_modules` (not a cherry-picked subset) into the final runner stage. Prisma's CLI (needed for `prisma migrate deploy` at container startup) pulls in transitive dependencies beyond `.prisma`/`@prisma`/`prisma` — cherry-picking folders leads to `Cannot find module 'effect'`-style errors.
- **`docker-entrypoint.sh`** must use LF line endings, not CRLF — a `.gitattributes` rule enforces this (`*.sh text eol=lf`). CRLF causes a cryptic `exit code 127` / "not found" failure at container start.
- Both Dockerfiles include a `HEALTHCHECK` — used by `docker-compose.yml`'s `depends_on: condition: service_healthy` to sequence startup correctly.

## CI/CD Pipeline

Defined in `.github/workflows/deploy.yml`. Triggers on push to `main`, or manually via **Actions → Build and Deploy → Run workflow**.

**Flow:**

1. **`changes`** — detects whether `frontend/` and/or `backend-cms-admin/` changed (via `dorny/paths-filter`), so only the affected app(s) rebuild.
2. **`build-frontend`** / **`build-backend-cms-admin`** — build each Docker image with the correct build args, push to Docker Hub tagged `:latest` and `:<commit-sha>`. Uses `docker/setup-buildx-action` (required for GitHub Actions cache export) and GHA layer caching to speed up repeat builds.
3. **`deploy`** — runs only after both build jobs succeed or are skipped:
   - Copies `docker-compose.yml` and `nginx/default.conf` to the EC2 instance via SCP.
   - SSHes into EC2, pulls fresh secrets from AWS SSM into `.env.backend-cms-admin`.
   - Logs into Docker Hub, runs `docker compose pull && docker compose up -d --remove-orphans`.
   - Prunes dangling images.

### Required GitHub repository secrets

`Settings → Secrets and variables → Actions → Secrets`

| Secret               | Purpose                      |
| -------------------- | ---------------------------- |
| `DOCKERHUB_USERNAME` | Docker Hub login             |
| `DOCKERHUB_TOKEN`    | Docker Hub access token      |
| `EC2_HOST`           | EC2 public IP/domain         |
| `EC2_USER`           | SSH user (`ubuntu`)          |
| `EC2_SSH_KEY`        | Private key contents for SSH |

### Required GitHub repository variables

`Settings → Secrets and variables → Actions → Variables`

| Variable                                          | Example value                 |
| ------------------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL`                             | `https://cms.store.mohibs.in` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`                     | `rzp_test_xxxxxxxxxxxx`       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`               | `pk_test_xxxxxxxxxxxx`        |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                   | `/sign-in`                    |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                   | `/sign-up`                    |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/`                           |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/`                           |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`               | `xxxxxxxxx`                   |

## Infrastructure Setup (One-Time)

### 1. EC2 instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# AWS CLI
sudo apt update && sudo apt install -y awscli

# App directory (matches CI/CD's target path)
mkdir -p ~/app/nginx

# Optional: silence docker-compose variable warning for manual commands
echo "DOCKERHUB_USERNAME=your-dockerhub-username" > ~/app/.env
```

**Security group:** open inbound ports `22` (SSH, ideally IP-restricted), `80` (HTTP), `443` (HTTPS).

### 2. IAM role for EC2 → SSM access

Create an IAM policy scoped to this project's SSM path:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParametersByPath", "ssm:GetParameter"],
      "Resource": "arn:aws:ssm:*:*:parameter/prod/backend-cms-admin/*"
    },
    {
      "Effect": "Allow",
      "Action": ["kms:Decrypt"],
      "Resource": "*"
    }
  ]
}
```

Attach it to a role (`mohibs-ec2-ssm-role`), and attach that role to the EC2 instance via **EC2 → Instance → Actions → Security → Modify IAM role**.

### 3. IAM user for local secret management

Create a separate IAM user (e.g. `mohib-admin`) with `AmazonSSMFullAccess`, generate CLI access keys, and run `aws configure` locally to push/update secrets (see [Secrets Management](#secrets-management)).

### 4. DNS

Point both subdomains (A records) at the EC2 instance's public IP:

- `store.mohibs.in` → EC2 IP
- `cms.store.mohibs.in` → EC2 IP

## Deployment

Deployment is fully automated — pushing to `main` (or running the workflow manually) rebuilds changed images and redeploys via SSH. No manual server steps are needed for routine deploys.

**Force a rebuild with no code changes:**

```bash
git commit --allow-empty -m "Trigger CI/CD rebuild"
git push origin main
```

Or use the **Run workflow** button in the Actions tab (enabled via `workflow_dispatch` in the workflow file) — this ignores the path filter and rebuilds both images regardless of what changed.

## HTTPS / SSL

Certificates are issued via Let's Encrypt (`certbot`, standalone mode) for both domains under one certificate.

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
sudo apt install -y certbot

cd ~/app
docker compose stop nginx
sudo certbot certonly --standalone -d store.mohibs.in -d cms.store.mohibs.in
```

`nginx/default.conf` includes an HTTP→HTTPS redirect and SSL server blocks for both domains, referencing:

```
/etc/letsencrypt/live/store.mohibs.in/fullchain.pem
/etc/letsencrypt/live/store.mohibs.in/privkey.pem
```

(Certbot names the folder after the first `-d` domain passed — both subdomains share this one cert.)

**Auto-renewal** (crontab on EC2, runs daily, only renews if within 30 days of expiry):

```bash
sudo crontab -e
```

```
0 3 * * * docker compose -f /home/ubuntu/app/docker-compose.yml stop nginx && certbot renew --standalone --quiet && docker compose -f /home/ubuntu/app/docker-compose.yml start nginx
```

## Database Migrations

`backend-cms-admin` runs `prisma migrate deploy` automatically on every container start, via `docker-entrypoint.sh`:

```sh
#!/bin/sh
set -e
echo "Running prisma migrate deploy..."
npx prisma migrate deploy
echo "Starting Next.js server..."
exec "$@"
```

This is idempotent — it only applies pending migrations, so it's safe to run on every deploy/restart. New migrations should be created locally with `npx prisma migrate dev`, committed to `prisma/migrations/`, and will be applied automatically on the next production deploy.

## Secrets Management

Production secrets live in **AWS SSM Parameter Store** under `/prod/backend-cms-admin/*`, encrypted (`SecureString`), fetched fresh on every deploy — never committed to git, never passed through Docker build layers, never stored in GitHub Actions logs.

**Push/update a secret:**

```bash
aws ssm put-parameter --name /prod/backend-cms-admin/DATABASE_URL \
  --value "postgresql://user:pass@host/db?sslmode=require" \
  --type SecureString --overwrite
```

**List current values:**

```bash
aws ssm get-parameters-by-path --path /prod/backend-cms-admin/ --with-decryption
```

The deploy workflow reconstructs `.env.backend-cms-admin` on the server using:

```bash
aws ssm get-parameters-by-path --path /prod/backend-cms-admin/ --with-decryption \
  --query "Parameters[*].[Name,Value]" --output text | \
  awk -F'\t' '{n=split($1,a,"/"); print a[n]"="$2}' > .env.backend-cms-admin
```

> Note the `-F'\t'` (tab) delimiter for the outer split, with a separate `/`-split applied only to the parameter _name_ column — splitting the whole line by `/` corrupts any value containing slashes (e.g. `DATABASE_URL`).

Rotating a secret takes effect on the next deploy, or immediately via:

```bash
docker compose restart backend-cms-admin
```

## Troubleshooting

| Symptom                                                                    | Cause                                                                                                                  | Fix                                                                                               |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Cache export is not supported for the docker driver`                      | Default buildx driver can't export GHA cache                                                                           | Add `docker/setup-buildx-action@v3` step before build                                             |
| Build fails prerendering a page: `ECONNREFUSED`                            | A server component fetches your live API at build time, but the CI runner can't reach it                               | Add `export const dynamic = 'force-dynamic'` and wrap the fetch in try/catch with a safe fallback |
| Build fails in "Collecting page data": `key_id or oauthToken is mandatory` | An SDK client (Razorpay, etc.) is instantiated at module top level, needing a runtime secret unavailable at build time | Move client instantiation inside the request handler function                                     |
| `npm ci` fails: `Could not find Prisma Schema`                             | `postinstall` runs `prisma generate` before `prisma/` folder is copied into the deps stage                             | Add `COPY prisma ./prisma` before `RUN npm ci`                                                    |
| Container `Restarting`, exit code 127                                      | CRLF line endings in `docker-entrypoint.sh`                                                                            | `sed -i 's/\r$//' docker-entrypoint.sh`; enforce via `.gitattributes`                             |
| `sh: prisma: not found`                                                    | `node_modules/.bin` wasn't copied into the runner stage                                                                | Copy `.bin`, or better, copy the full `node_modules`                                              |
| `Cannot find module 'effect'`                                              | Cherry-picked `node_modules` subfolders miss Prisma CLI's transitive deps                                              | Copy the entire `node_modules` from the builder stage instead of individual folders               |
| `.env` parse error: unexpected character `?`                               | `awk -F'/'` splits the whole line (including the value) by `/`, corrupting URLs                                        | Split only on tab for columns, and only split the name column by `/`                              |
| 502 Bad Gateway on `cms.store.mohibs.in`                                   | `backend-cms-admin` container isn't healthy/running                                                                    | `docker logs backend-cms-admin --tail 50` to diagnose                                             |

## Manual Operations Cheat Sheet

```bash
# SSH in
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check running containers
docker ps

# View logs
docker logs backend-cms-admin --tail 50
docker logs frontend --tail 50
docker logs nginx --tail 50

# Restart a single service (e.g. after rotating a secret)
cd ~/app
docker compose restart backend-cms-admin

# Full redeploy manually (normally handled by CI/CD)
docker compose pull
docker compose up -d --remove-orphans

# Check SSL cert status
sudo certbot certificates

# Verify both domains are live
curl -I https://store.mohibs.in
curl -I https://cms.store.mohibs.in
```

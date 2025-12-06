# NativeX

NativeX is an AI-powered code generation and orchestration platform. It allows users to prompt for full-stack applications, generates the code using LLMs, and instantaneously spins up live, isolated development environments running in Docker containers.

---

## 🏗 System Architecture

NativeX operates as a **monorepo** using **TurboRepo** and **Bun**. It employs a "Docker-Sibling" architecture to manage dynamic development environments.

- **Frontend**: Next.js 15 (App Router), TailwindCSS, Clerk Auth
- **Primary Backend**: Express/Node.js (TypeScript) handling API requests and orchestration
- **Worker/Builder**: Background services that process AI generation tasks
- **Infrastructure**: Docker Compose, Traefik (Reverse Proxy), Postgres, Redis

### How it Works

1. User sends a prompt via the **Frontend**
2. **Backend** creates a DB entry and pushes a job to **Redis**
3. **Worker** picks up the job, uses LLMs to generate code, and writes files to the **Host Filesystem**
4. **Backend** interacts with the **Docker Socket** (`/var/run/docker.sock`) to spin up a new "Editor" container on the host
5. **Traefik** dynamically routes `https://{project-id}.nativex.yourdomain.com` to that specific container

---

## 🛠 Tech Stack

- **Package Manager**: Bun (v1.x)
- **Monorepo**: TurboRepo
- **Frontend**: Next.js 15, Shadcn/UI, Lucide React
- **Database**: PostgreSQL (via Prisma ORM)
- **Queue**: Redis
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Traefik v3

---

## ⚡ Prerequisites

- **Bun** installed locally
- **Docker** & **Docker Compose** running
- **PostgreSQL** (Local or Containerized)
- **Redis** (Local or Containerized)

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/nativex.git
cd nativex

# Install dependencies from root (using Bun Workspaces)
bun install
```

### 2. Environment Configuration

Create a `.env` file in `apps/primary-backend` and `apps/frontend`.

#### Backend `.env` (apps/primary-backend/.env):

```bash
PORT=3002

# IMPORTANT: Use port 5432 if running inside Docker network, 5434/5432 if local
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"

REDIS_URL="redis://localhost:6379"

# Directory on the HOST machine where projects are stored
HOST_ROOT="/home/user/projects"

# Google Gemini / OpenAI Key
GEMINI_API_KEY="AIzaSy..."

# JWT Configuration (PEM Format)
# ⚠️ CRITICAL: Ensure newlines are preserved if pasting into Docker envs
# Use actual line breaks in .env files, NOT \n escape sequences
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCA...
-----END PUBLIC KEY-----"

# Clerk Keys (Frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

#### Frontend `.env` (apps/frontend/.env):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_API_URL="http://localhost:3002"
```

### 3. Database Setup

Push the Prisma schema to your database:

```bash
# Run from root or packages/db
bunx prisma db push
bunx prisma generate
```

### 4. Running Locally (Dev Mode)

```bash
# Starts Frontend, Backend, and Worker via Turbo
bun run dev
```

The services will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3002

---

## 🐳 Docker Deployment (Production)

NativeX relies heavily on Docker networking and the Docker-Sibling pattern.

### 1. Directory Setup

Ensure the `HOST_ROOT` directory exists on your server so the backend can write project files to it:

```bash
mkdir -p /home/user/projects
chmod -R 777 /home/user/projects
```

### 2. Docker Compose

Run the entire stack (Traefik, Postgres, Redis, Backend) using the compose file:

```bash
docker compose -f docker-compose.nativex.yml up -d --build
```

### 3. Verification

- **Frontend**: https://nativex.yourdomain.com
- **Backend**: https://backend.nativex.yourdomain.com
- **Traefik Dashboard**: http://localhost:8080 (if enabled)

---

## ⚠️ Important Troubleshooting Notes

### 1. "Connect ECONNREFUSED" / Port Issues

**Internal vs External Ports:**
- When services talk **inside Docker** (e.g., Backend → Redis), use the **Service Name** and **Internal Port**:
  - ✅ `redis:6379`
  - ✅ `postgres:5432`
- **Do NOT use** `localhost` or external mapped ports (like `6381` or `5434`) inside `docker-compose` service definitions

**Example:**
```yaml
# ❌ WRONG - will fail inside Docker
DATABASE_URL="postgresql://postgres:password@localhost:5434/postgres"

# ✅ CORRECT - uses internal Docker network
DATABASE_URL="postgresql://postgres:password@postgres:5432/postgres"
```

### 2. Docker Socket Mounting

The backend must have access to the host's Docker daemon to spawn new environments. Ensure your `docker run` or compose file includes:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

**Security Note:** This grants the container significant privileges. Only use in trusted environments.

### 3. Host Root Permissions

If the Worker crashes with **"Permission Denied"** when creating folders:

1. Ensure `HOST_ROOT` in your `.env` matches the mounted volume in `docker-compose`
2. Ensure the directory on the host allows writing:
   ```bash
   chmod -R 777 /home/user/projects  # Quick fix for dev
   ```
3. For production, use proper user/group permissions instead of 777

### 4. Prisma & Bun

If you see `PrismaClientInitializationError`:

1. Ensure you ran `bunx prisma generate` after installing dependencies
2. If running in Docker, ensure the `DATABASE_URL` uses `postgres:5432` (the container name), **not** `localhost`

### 5. JWT Public Key Format Issues

**Problem:** PEM keys contain newlines that must be preserved exactly.

**Common Mistakes:**
- ❌ Using `\n` literal strings instead of actual newlines
- ❌ Stripping newlines when copying keys
- ❌ Adding quotes incorrectly in `.env` files

**Solutions:**

**For `.env` files (local development):**
```bash
# Use actual line breaks (multiline string)
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCA...
-----END PUBLIC KEY-----"
```

**For Docker environment variables:**
```yaml
environment:
  JWT_PUBLIC_KEY: |
    -----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCA...
    -----END PUBLIC KEY-----
```

**For inline Docker commands:**
```bash
docker run -e JWT_PUBLIC_KEY="$(cat public_key.pem)" ...
```

### 6. Redis Connection Failures

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Cause:** Backend trying to connect to `localhost:6379` from inside Docker.

**Solution:** Update `REDIS_URL` to use the service name:
```bash
# ❌ WRONG (inside Docker)
REDIS_URL="redis://localhost:6379"

# ✅ CORRECT (inside Docker)
REDIS_URL="redis://redis:6379"
```

### 7. Traefik Routing Issues

If dynamic project URLs aren't working:

1. Verify Traefik is running: `docker ps | grep traefik`
2. Check Traefik dashboard at http://localhost:8080
3. Ensure containers have proper labels:
   ```yaml
   labels:
     - "traefik.enable=true"
     - "traefik.http.routers.myapp.rule=Host(`myapp.nativex.yourdomain.com`)"
   ```
4. Verify DNS points `*.nativex.yourdomain.com` to your server

---

## 📁 Project Structure

```
nativex/
├── apps/
│   ├── frontend/          # Next.js 15 frontend
│   ├── primary-backend/   # Express API server
│   └── worker/            # Background job processor
├── packages/
│   ├── db/                # Prisma schema & client
│   └── shared/            # Shared types & utilities
├── docker-compose.nativex.yml
├── turbo.json
└── README.md
```

---

## 🧪 Development Workflow

### Running Individual Services

```bash
# Frontend only
cd apps/frontend && bun run dev

# Backend only
cd apps/primary-backend && bun run dev

# Worker only
cd apps/worker && bun run dev
```

### Database Migrations

```bash
# Create a new migration
bunx prisma migrate dev --name add_new_feature

# Apply migrations in production
bunx prisma migrate deploy
```

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.nativex.yml logs -f

# Specific service
docker compose -f docker-compose.nativex.yml logs -f primary-backend
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT

---

## 🆘 Support

If you encounter issues not covered in this README:

1. Review Docker logs: `docker compose logs -f`
2. Open an issue on GitHub with:
   - Error messages
   - Relevant logs
   - Your environment (OS, Docker version, etc.)

---

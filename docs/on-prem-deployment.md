# On-Premise Deployment Guide

Complete guide to deploy the Real Estate ERP system on a client's own servers.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client's Server                       │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐   │
│  │  Nginx   │──▶│  API x2  │──▶│  PostgreSQL 16   │   │
│  │ (port 80)│   │ (NestJS) │   │  (persistent vol)│   │
│  │ Frontend │   └──────────┘   └──────────────────┘   │
│  └──────────┘         │                                 │
│       │          ┌────┴─────┐   ┌──────────────────┐   │
│       │          │  Worker  │──▶│   Redis 7         │   │
│       │          │ (BullMQ) │   │   (cache/queue)   │   │
│       │          └──────────┘   └──────────────────┘   │
│       │                                                 │
│       │          ┌──────────────────┐                   │
│       │          │  MinIO (S3)      │                   │
│       │          │  (doc storage)   │                   │
│       │          └──────────────────┘                   │
│       │                                                 │
│       │          ┌──────────────────┐ (optional)        │
│       │          │ Prometheus+Grafana│                   │
│       │          └──────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

**All services run inside Docker containers** — no native installation required on the host.

---

## 2. Server Requirements

| Resource      | Minimum          | Recommended       |
|---------------|------------------|-------------------|
| **OS**        | Ubuntu 22.04 LTS / Windows Server 2022 / RHEL 9 | Ubuntu 22.04 LTS |
| **CPU**       | 4 cores          | 8 cores           |
| **RAM**       | 8 GB             | 16 GB             |
| **Disk**      | 50 GB SSD        | 200 GB NVMe SSD   |
| **Network**   | 100 Mbps         | 1 Gbps            |
| **Docker**    | 24.0+            | Latest stable      |

### Software Prerequisites
- **Docker Engine** 24.0+ with Docker Compose v2
- **Git** (to clone the repository)
- **openssl** (for generating secrets — included in most OS)

---

## 3. Quick Installation (One Command)

### Linux / macOS
```bash
git clone <repo-url> erp-system
cd erp-system
chmod +x scripts/install.sh
./scripts/install.sh
```

### Windows (PowerShell)
```powershell
git clone <repo-url> erp-system
cd erp-system
powershell -ExecutionPolicy Bypass -File scripts\install.ps1
```

The install script will:
1. ✅ Check prerequisites (Docker, disk space, RAM)
2. ✅ Generate a secure `.env` file with random secrets
3. ✅ Build all Docker images
4. ✅ Start infrastructure (PostgreSQL, Redis, MinIO)
5. ✅ Run database migrations (create all 35+ tables)
6. ✅ Seed initial data (tenant, admin user, demo data)
7. ✅ Start all application services
8. ✅ Run health checks
9. ✅ Print access URL and credentials

---

## 4. Manual Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone <repo-url> /opt/erp-system
cd /opt/erp-system
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set **strong passwords** for:
```env
DB_PASSWORD=<generate-strong-password>
REDIS_PASSWORD=<generate-strong-password>
JWT_SECRET=<min-32-random-chars>
JWT_REFRESH_SECRET=<different-min-32-random-chars>
S3_ACCESS_KEY=<random-key>
S3_SECRET_KEY=<random-secret>
CORS_ORIGINS=https://erp.client-domain.com
```

Generate secure secrets:
```bash
openssl rand -base64 48  # Use for each secret
```

### Step 3: Build Docker Images
```bash
docker compose -f docker-compose.prod.yml --env-file .env build
```

### Step 4: Start Infrastructure
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d postgres redis minio
```

Wait for PostgreSQL:
```bash
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U erp_user
```

### Step 5: Run Database Migrations
```bash
docker compose -f docker-compose.prod.yml --env-file .env run --rm api \
  npx typeorm migration:run -d dist/database/data-source.js
```

### Step 6: Seed Initial Data
```bash
docker compose -f docker-compose.prod.yml --env-file .env run --rm api \
  node dist/database/seeds/index.js
```

### Step 7: Start All Services
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### Step 8: Verify
```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Check API health
curl http://localhost/api/v1/health

# Open browser
open http://localhost
```

---

## 5. Default Login Credentials

| Field    | Value          |
|----------|----------------|
| Email    | `ahmad@groz.ae` |
| Password | `Demo@2026!`   |

⚠️ **Change the default password immediately after first login!**

Additional demo users (all share password `Demo@2026!`):
- `sarah@groz.ae` — Sales Agent
- `omar@groz.ae` — Sales Agent
- `fatima@groz.ae` — Sales Agent
- `david@groz.ae` — Finance
- `layla@groz.ae` — HR

---

## 6. SSL/HTTPS Setup

### Option A: Reverse Proxy (Recommended)
Place a reverse proxy (e.g., Caddy, Traefik, or the client's existing load balancer) in front:

```
Client Browser → HTTPS → Reverse Proxy (port 443) → HTTP → Docker web (port 80)
```

**Caddy example** (auto-HTTPS with Let's Encrypt):
```
erp.client-domain.com {
    reverse_proxy localhost:80
}
```

### Option B: Self-Signed Certificate
For internal networks without public DNS:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/server.key -out ssl/server.crt \
  -subj "/CN=erp.local"
```

Mount into the nginx container and update nginx.conf for SSL.

---

## 7. Custom Domain Configuration

1. Update `.env`:
   ```env
   CORS_ORIGINS=https://erp.client-domain.com
   ```

2. Point DNS `erp.client-domain.com` → server IP

3. Restart services:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env up -d
   ```

---

## 8. Backup & Restore

### Enable Automated Daily Backups
```bash
docker compose -f docker-compose.prod.yml --profile backup up -d
```
Backups are stored in `./backups/` — auto-cleaned after 7 days.

### Manual Backup
```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U erp_user re_erp | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore from Backup
```bash
gunzip -c backup_20260212.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U erp_user re_erp
```

---

## 9. Monitoring (Optional)

Enable Prometheus + Grafana:
```bash
docker compose -f docker-compose.prod.yml --profile monitoring up -d
```

| Service    | URL                    | Credentials     |
|------------|------------------------|-----------------|
| Grafana    | `http://server:3001`   | admin / (from .env) |
| Prometheus | `http://server:9090`   | —               |

---

## 10. Updating the System

```bash
cd /opt/erp-system

# Pull latest code
git pull origin main

# Rebuild images
docker compose -f docker-compose.prod.yml --env-file .env build

# Run any new migrations
docker compose -f docker-compose.prod.yml --env-file .env run --rm api \
  npx typeorm migration:run -d dist/database/data-source.js

# Restart with zero downtime (rolling update)
docker compose -f docker-compose.prod.yml --env-file .env up -d --no-deps api worker web
```

---

## 11. Troubleshooting

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 80 already in use | Change `WEB_PORT=8080` in `.env` |
| Database connection refused | Check `docker compose ps` — postgres must be healthy |
| API returns 401 | Token expired — login again; check JWT_SECRET hasn't changed |
| Migrations fail | Check DB_PASSWORD matches between `.env` and running container |
| Images fail to build | Ensure Docker has internet access for pulling base images |
| Out of disk space | Run `docker system prune -a` to clean old images |

### Reset Everything (Nuclear Option)
```bash
docker compose -f docker-compose.prod.yml down -v  # ⚠️ DELETES ALL DATA
docker compose -f docker-compose.prod.yml --env-file .env up -d
# Re-run migrations and seed
```

---

## 12. Security Checklist

Before handing off to the client:

- [ ] All passwords in `.env` are strong and unique (not defaults)
- [ ] JWT secrets are random 48+ character strings
- [ ] Default admin password changed after first login
- [ ] CORS_ORIGINS set to actual domain (not `*` or `localhost`)
- [ ] SSL/HTTPS enabled via reverse proxy
- [ ] `.env` file permissions restricted (`chmod 600 .env`)
- [ ] Firewall: only ports 80/443 exposed externally
- [ ] Database port (5432) NOT exposed to the internet
- [ ] Redis port (6379) NOT exposed to the internet
- [ ] MinIO port (9000) NOT exposed to the internet
- [ ] Automated backups enabled
- [ ] Server OS auto-updates enabled

---

## 13. Scaling

The system supports horizontal scaling:

- **API**: Increase `replicas` in docker-compose.prod.yml (default: 2)
- **Worker**: Scale independently for background job throughput
- **Database**: For large deployments, consider external managed PostgreSQL (AWS RDS, Azure Database, etc.)
- **Kubernetes**: Migrate to K8s using the existing Dockerfiles + Helm charts (future)

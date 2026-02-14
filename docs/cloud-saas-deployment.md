# Cloud SaaS Deployment Guide

Deploy the Real Estate ERP as a multi-tenant SaaS platform at `realestater.grozai.net`.

---

## 1. Architecture

```
                         ┌──────────────────┐
    Tenants access       │   DNS (Cloudflare)│
    realestater.         │   grozai.net      │
    grozai.net           └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │  Caddy (HTTPS)   │  ← Auto Let's Encrypt
                         │  Port 443        │
                         └────────┬─────────┘
                    ┌─────────────┼─────────────┐
                    ▼             ▼              ▼
             ┌──────────┐ ┌──────────┐  ┌──────────────┐
             │ Web (SPA) │ │ API x3   │  │ Worker x2    │
             │ Nginx     │ │ NestJS   │  │ BullMQ jobs  │
             └──────────┘ └────┬─────┘  └──────┬───────┘
                               │               │
                    ┌──────────┼───────────────┘
                    ▼          ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │PostgreSQL │ │  Redis   │ │  MinIO   │
             │   16      │ │   7      │ │  (S3)    │
             └──────────┘ └──────────┘ └──────────┘
```

### User Roles
| Role | Access | Description |
|------|--------|-------------|
| **Platform Super Admin** | `/platform/*` | Creates/manages tenants, activates/deactivates accounts |
| **Tenant Admin** | `/dashboard/*` | Manages their own tenant's data, users, settings |
| **Tenant User** | `/dashboard/*` | Works within their tenant's scope (sales, finance, etc.) |

---

## 2. Server Requirements

| Resource | Recommended |
|----------|-------------|
| **Cloud Provider** | AWS / Azure / DigitalOcean / Hetzner |
| **Server** | 8 CPU, 32 GB RAM, 500 GB NVMe SSD |
| **OS** | Ubuntu 22.04 LTS |
| **Docker** | 24.0+ with Compose v2 |
| **Domain** | `realestater.grozai.net` pointed to server IP |

---

## 3. Quick Deployment

### Option A: One-Command Automated Setup
```bash
ssh root@<server-ip>
export ERP_DOMAIN=realestater.grozai.net
export REPO_URL=<your-git-repo-url>
curl -sSL <raw-git-url>/scripts/cloud-setup.sh | bash
```
This script automatically installs Docker, generates secure secrets, builds images, runs migrations, seeds data, and configures the firewall.

### Option B: Manual Step-by-Step

#### Step 1: Provision Server & Point DNS
```bash
# Point DNS: realestater.grozai.net → <server-ip>
# SSH into server
ssh root@<server-ip>
```

#### Step 2: Install Docker
```bash
curl -fsSL https://get.docker.com | sh
```

#### Step 3: Clone & Configure
```bash
git clone <repo-url> /opt/erp
cd /opt/erp
cp .env.example .env
```

Edit `.env` for production:
```env
# Database (strong passwords!)
DB_PASSWORD=<generate: openssl rand -base64 32>
REDIS_PASSWORD=<generate: openssl rand -base64 32>

# JWT (MUST be unique random strings)
JWT_SECRET=<generate: openssl rand -base64 64>
JWT_REFRESH_SECRET=<generate: openssl rand -base64 64>

# S3
S3_ACCESS_KEY=<generate: openssl rand -base64 20>
S3_SECRET_KEY=<generate: openssl rand -base64 40>

# App
NODE_ENV=production
CORS_ORIGINS=https://realestater.grozai.net

# Email (for notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
SMTP_FROM=noreply@grozai.net
```

### Step 4: Deploy
```bash
# Build & start everything
docker compose -f docker-compose.cloud.yml --env-file .env build
docker compose -f docker-compose.cloud.yml --env-file .env up -d postgres redis minio

# Wait for PostgreSQL
sleep 15

# Run migrations
docker compose -f docker-compose.cloud.yml --env-file .env run --rm api \
  npx typeorm migration:run -d dist/database/data-source.js

# Seed initial data (creates super admin + demo tenant)
docker compose -f docker-compose.cloud.yml --env-file .env run --rm api \
  node dist/database/seeds/index.js

# Start all services
docker compose -f docker-compose.cloud.yml --env-file .env up -d
```

### Step 5: Verify
```bash
# Check all containers
docker compose -f docker-compose.cloud.yml ps

# Test HTTPS
curl https://realestater.grozai.net/api/v1/health
```

---

## 4. Login Credentials

### Platform Super Admin
| Field | Value |
|-------|-------|
| URL | `https://realestater.grozai.net/login` |
| Email | `superadmin@grozai.net` |
| Password | `Demo@2026!` |

After login, the super admin is redirected to `/platform` where they can:
- View platform-wide statistics
- Create new tenants (auto-provisions admin user, roles, chart of accounts)
- Activate/deactivate tenants
- Manage users across all tenants

### Demo Tenant Admin
| Field | Value |
|-------|-------|
| Email | `ahmad@groz.ae` |
| Password | `Demo@2026!` |

⚠️ **Change all default passwords immediately after deployment!**

---

## 5. Creating a New Tenant

1. Login as `superadmin@grozai.net`
2. Navigate to **Tenants** → **New Tenant**
3. Fill in:
   - Company name
   - Slug (URL identifier, e.g. `sunrise-properties`)
   - Optional custom domain
   - Admin user credentials
4. Click **Create**

The system automatically provisions:
- Tenant record
- Admin user account
- Default roles (Tenant Admin, Sales Manager, Sales Agent, Finance Manager, Accountant)
- Default chart of accounts (16 standard accounts)

The tenant admin can then login and start using the ERP immediately.

---

## 6. Multi-Tenant Data Isolation

Every database query is scoped by `tenant_id`:
- Users can only see data belonging to their tenant
- The JWT token contains `tenantId` which is enforced by middleware
- Super admins (`isSystemAdmin = true`) have no `tenantId` and access `/platform/*` routes
- The `SuperAdminGuard` protects all platform management endpoints

---

## 7. Custom Domains (Optional)

If a tenant wants their own domain (e.g., `erp.sunrise.com`):

1. Tenant points their DNS to the server IP
2. Update the Caddyfile:
```
erp.sunrise.com {
    handle /api/* {
        reverse_proxy api:3000
    }
    handle {
        reverse_proxy web:80
    }
}
```
3. Reload Caddy: `docker compose -f docker-compose.cloud.yml exec caddy caddy reload`

---

## 8. Backups

Automated backups run every 6 hours, kept for 30 days:
```bash
# Backups stored in ./backups/
ls -la backups/

# Manual backup
docker compose -f docker-compose.cloud.yml exec postgres \
  pg_dump -U erp_user re_erp | gzip > backup_manual.sql.gz

# Restore
gunzip -c backup_manual.sql.gz | docker compose -f docker-compose.cloud.yml exec -T postgres \
  psql -U erp_user re_erp
```

---

## 9. Scaling

| Component | How to Scale |
|-----------|-------------|
| **API** | Increase `replicas` in docker-compose (default: 3) |
| **Worker** | Increase `replicas` (default: 2) |
| **Database** | Migrate to managed PostgreSQL (AWS RDS, Azure DB) |
| **Redis** | Migrate to managed Redis (ElastiCache, Azure Cache) |
| **Storage** | Migrate MinIO to AWS S3 or Azure Blob |

For high-traffic (100+ tenants), consider:
- Kubernetes migration with Helm charts
- Database read replicas
- CDN for static assets (Cloudflare)
- Connection pooling (PgBouncer)

---

## 10. Monitoring

```bash
# Enable Prometheus + Grafana
docker compose -f docker-compose.cloud.yml --profile monitoring up -d

# Access Grafana
# https://realestater.grozai.net/grafana
# Login: admin / <GRAFANA_PASSWORD from .env>
```

---

## 11. Updating

```bash
cd /opt/erp
git pull origin main

# Rebuild
docker compose -f docker-compose.cloud.yml --env-file .env build

# Run migrations
docker compose -f docker-compose.cloud.yml --env-file .env run --rm api \
  npx typeorm migration:run -d dist/database/data-source.js

# Rolling restart (zero downtime)
docker compose -f docker-compose.cloud.yml --env-file .env up -d --no-deps api worker web
```

---

## 12. Security Checklist

- [ ] All passwords are strong, unique, randomly generated
- [ ] SSL/HTTPS enabled (automatic via Caddy + Let's Encrypt)
- [ ] `CORS_ORIGINS` set to `https://realestater.grozai.net`
- [ ] Default super admin password changed
- [ ] Firewall: only ports 80 and 443 open
- [ ] Database/Redis/MinIO NOT exposed to internet
- [ ] Automated backups running
- [ ] Server OS auto-updates enabled
- [ ] Rate limiting active (NestJS throttler)
- [ ] Monitoring enabled

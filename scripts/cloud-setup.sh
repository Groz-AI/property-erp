#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Real Estate ERP — Cloud SaaS Setup Script
# Run this on a fresh Ubuntu 22.04 server
# Usage: curl -sSL <raw-git-url>/scripts/cloud-setup.sh | bash
# ============================================================================

DOMAIN="${ERP_DOMAIN:-property.grozai.net}"
INSTALL_DIR="/opt/erp"

echo "============================================"
echo "  Real Estate ERP — Cloud SaaS Setup"
echo "  Domain: $DOMAIN"
echo "============================================"
echo ""

# ----- 1. Prerequisites -----
echo "▸ [1/8] Installing prerequisites..."
apt-get update -qq
apt-get install -y -qq curl git jq openssl > /dev/null 2>&1

# ----- 2. Docker -----
if ! command -v docker &> /dev/null; then
  echo "▸ [2/8] Installing Docker..."
  curl -fsSL https://get.docker.com | sh > /dev/null 2>&1
  systemctl enable docker
  echo "  ✅ Docker installed ($(docker --version))"
else
  echo "▸ [2/8] Docker already installed ($(docker --version))"
fi

# ----- 3. Clone / Pull -----
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "▸ [3/8] Updating existing installation..."
  cd "$INSTALL_DIR"
  git pull --rebase
else
  echo "▸ [3/8] Cloning repository..."
  if [ -z "${REPO_URL:-}" ]; then
    read -rp "  Enter Git repository URL: " REPO_URL
  fi
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# ----- 4. Generate .env -----
if [ ! -f .env ]; then
  echo "▸ [4/8] Generating secure .env..."
  cp .env.example .env

  # Generate cryptographically secure values
  DB_PASSWORD=$(openssl rand -base64 32 | tr -d '=/+' | head -c 40)
  REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '=/+' | head -c 40)
  JWT_SECRET=$(openssl rand -base64 64 | tr -d '=/+' | head -c 80)
  JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '=/+' | head -c 80)
  S3_ACCESS_KEY=$(openssl rand -base64 20 | tr -d '=/+' | head -c 20)
  S3_SECRET_KEY=$(openssl rand -base64 40 | tr -d '=/+' | head -c 40)

  # Replace placeholders in .env
  sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" .env
  sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" .env
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
  sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" .env
  sed -i "s|^S3_ACCESS_KEY=.*|S3_ACCESS_KEY=$S3_ACCESS_KEY|" .env
  sed -i "s|^S3_SECRET_KEY=.*|S3_SECRET_KEY=$S3_SECRET_KEY|" .env
  sed -i "s|^NODE_ENV=.*|NODE_ENV=production|" .env
  sed -i "s|^CORS_ORIGINS=.*|CORS_ORIGINS=https://$DOMAIN|" .env

  echo "  ✅ .env generated with secure random secrets"
else
  echo "▸ [4/8] .env already exists, skipping..."
fi

# ----- 5. Update Caddyfile domain -----
echo "▸ [5/8] Configuring domain ($DOMAIN)..."
if [ -f infra/caddy/Caddyfile ]; then
  sed -i "s|realestater.grozai.net|$DOMAIN|g" infra/caddy/Caddyfile
  echo "  ✅ Caddyfile updated for $DOMAIN"
fi

# ----- 6. Build -----
echo "▸ [6/8] Building Docker images (this may take a few minutes)..."
docker compose -f docker-compose.cloud.yml --env-file .env build --quiet

# ----- 7. Start infrastructure, run migrations, seed -----
echo "▸ [7/8] Starting infrastructure services..."
docker compose -f docker-compose.cloud.yml --env-file .env up -d postgres redis minio

echo "  Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker compose -f docker-compose.cloud.yml exec -T postgres pg_isready -U erp_user > /dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "  Running database migrations..."
docker compose -f docker-compose.cloud.yml --env-file .env run --rm api \
  npx typeorm migration:run -d dist/database/data-source.js 2>&1 | tail -5

echo "  Seeding initial data..."
docker compose -f docker-compose.cloud.yml --env-file .env run --rm api \
  node dist/database/seeds/index.js 2>&1 | tail -10

# ----- 8. Start all services -----
echo "▸ [8/8] Starting all services..."
docker compose -f docker-compose.cloud.yml --env-file .env up -d

echo ""
echo "============================================"
echo "  ✅ Deployment Complete!"
echo "============================================"
echo ""
echo "  URL:         https://$DOMAIN"
echo "  API Docs:    https://$DOMAIN/api/docs"
echo ""
echo "  Super Admin:"
echo "    Email:     superadmin@grozai.net"
echo "    Password:  Demo@2026!"
echo ""
echo "  Tenant Admin:"
echo "    Email:     ahmad@groz.ae"
echo "    Password:  Demo@2026!"
echo ""
echo "  ⚠️  IMPORTANT: Change all default passwords after first login!"
echo ""
echo "  Useful commands:"
echo "    Logs:      docker compose -f docker-compose.cloud.yml logs -f"
echo "    Status:    docker compose -f docker-compose.cloud.yml ps"
echo "    Stop:      docker compose -f docker-compose.cloud.yml down"
echo "    Backup:    ls -la backups/"
echo "============================================"

# ----- Firewall -----
if command -v ufw &> /dev/null; then
  echo ""
  echo "  Setting up firewall (UFW)..."
  ufw allow 22/tcp   > /dev/null 2>&1  # SSH
  ufw allow 80/tcp   > /dev/null 2>&1  # HTTP
  ufw allow 443/tcp  > /dev/null 2>&1  # HTTPS
  ufw --force enable  > /dev/null 2>&1
  echo "  ✅ Firewall: only ports 22, 80, 443 open"
fi

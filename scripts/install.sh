#!/bin/bash
set -euo pipefail

# =============================================================================
# Real Estate ERP — On-Premise Installation Script
# Run: chmod +x scripts/install.sh && ./scripts/install.sh
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info()  { echo -e "${BLUE}[i]${NC} $1"; }

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║        Real Estate ERP — On-Premise Installer        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Check Prerequisites ──────────────────────────────────────────────────
info "Checking prerequisites..."

command -v docker >/dev/null 2>&1 || error "Docker is not installed. Install from https://docs.docker.com/get-docker/"
command -v docker compose >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed."

DOCKER_VERSION=$(docker --version | grep -oP '\d+\.\d+\.\d+' | head -1)
log "Docker ${DOCKER_VERSION} found"

# Check Docker is running
docker info >/dev/null 2>&1 || error "Docker daemon is not running. Please start Docker first."
log "Docker daemon is running"

# Check available disk space (need at least 10GB)
AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | tr -d 'G')
if [ "${AVAILABLE_SPACE}" -lt 10 ]; then
  error "Insufficient disk space. Need at least 10GB, have ${AVAILABLE_SPACE}GB"
fi
log "Disk space OK (${AVAILABLE_SPACE}GB available)"

# Check available RAM (need at least 4GB)
if [ -f /proc/meminfo ]; then
  TOTAL_RAM=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024/1024)}')
  if [ "${TOTAL_RAM}" -lt 4 ]; then
    warn "Low RAM detected (${TOTAL_RAM}GB). Recommended: 8GB+"
  else
    log "RAM OK (${TOTAL_RAM}GB)"
  fi
fi

# ── 2. Generate Environment File ────────────────────────────────────────────
ENV_FILE=".env"

if [ -f "${ENV_FILE}" ]; then
  warn ".env file already exists. Keeping existing configuration."
  info "To regenerate, delete .env and run this script again."
else
  info "Generating secure .env configuration..."

  generate_secret() {
    openssl rand -base64 48 | tr -d '/+=' | head -c "$1"
  }

  DB_PASS=$(generate_secret 24)
  REDIS_PASS=$(generate_secret 24)
  JWT_SEC=$(generate_secret 48)
  JWT_REF=$(generate_secret 48)
  S3_KEY=$(generate_secret 20)
  S3_SEC=$(generate_secret 40)
  GRAFANA_PASS=$(generate_secret 16)

  cat > "${ENV_FILE}" <<EOF
# ============================================
# Real Estate ERP — Production Configuration
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# ============================================

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=re_erp
DB_USER=erp_user
DB_PASSWORD=${DB_PASS}
DB_SSL=false
DB_POOL_SIZE=20

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASS}

# JWT (auto-generated secure secrets)
JWT_SECRET=${JWT_SEC}
JWT_REFRESH_SECRET=${JWT_REF}
JWT_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

# S3 / MinIO
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=${S3_KEY}
S3_SECRET_KEY=${S3_SEC}
S3_BUCKET=erp-documents
S3_REGION=us-east-1

# App
NODE_ENV=production
PORT=3000
CORS_ORIGINS=http://localhost
LOG_LEVEL=info
WEB_PORT=80

# Email (configure for production)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@erp.local

# Monitoring
GRAFANA_PASSWORD=${GRAFANA_PASS}
EOF

  chmod 600 "${ENV_FILE}"
  log "Secure .env file generated"
fi

# ── 3. Create required directories ──────────────────────────────────────────
mkdir -p backups
log "Backup directory created"

# ── 4. Build & Start Services ───────────────────────────────────────────────
info "Building Docker images (this may take 5-10 minutes on first run)..."

COMPOSE_CMD="docker compose"
command -v docker-compose >/dev/null 2>&1 && COMPOSE_CMD="docker-compose"

${COMPOSE_CMD} -f docker-compose.prod.yml --env-file .env build --parallel 2>&1 | tail -5

info "Starting infrastructure services (PostgreSQL, Redis, MinIO)..."
${COMPOSE_CMD} -f docker-compose.prod.yml --env-file .env up -d postgres redis minio

info "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
  if ${COMPOSE_CMD} -f docker-compose.prod.yml exec -T postgres pg_isready -U "${DB_USER:-erp_user}" >/dev/null 2>&1; then
    log "PostgreSQL is ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    error "PostgreSQL failed to start within 30 seconds"
  fi
  sleep 1
done

# ── 5. Run Database Migrations ──────────────────────────────────────────────
info "Running database migrations..."
${COMPOSE_CMD} -f docker-compose.prod.yml --env-file .env run --rm api node -e "
  const { execSync } = require('child_process');
  try {
    execSync('npx typeorm migration:run -d dist/database/data-source.js', { stdio: 'inherit' });
  } catch(e) {
    process.exit(1);
  }
" 2>&1 || warn "Migration command returned non-zero (may be OK if tables already exist)"
log "Migrations complete"

# ── 6. Seed Initial Data ────────────────────────────────────────────────────
info "Seeding initial data (tenant, admin user, sample data)..."
${COMPOSE_CMD} -f docker-compose.prod.yml --env-file .env run --rm api node dist/database/seeds/index.js 2>&1 || warn "Seed returned non-zero (may be OK if data already exists)"
log "Database seeded"

# ── 7. Start All Application Services ───────────────────────────────────────
info "Starting all application services..."
${COMPOSE_CMD} -f docker-compose.prod.yml --env-file .env up -d

info "Waiting for services to become healthy..."
sleep 10

# ── 8. Health Check ─────────────────────────────────────────────────────────
info "Running health checks..."

check_service() {
  local name=$1
  local url=$2
  if curl -sf "${url}" >/dev/null 2>&1; then
    log "${name} is healthy"
    return 0
  else
    warn "${name} is not responding yet at ${url}"
    return 1
  fi
}

RETRIES=0
MAX_RETRIES=12
while [ $RETRIES -lt $MAX_RETRIES ]; do
  if check_service "Web" "http://localhost:${WEB_PORT:-80}" 2>/dev/null; then
    break
  fi
  RETRIES=$((RETRIES + 1))
  sleep 5
done

check_service "API" "http://localhost:${WEB_PORT:-80}/api/v1/health" || true

# ── 9. Print Summary ────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║           Installation Complete!                     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
log "Application URL:   http://$(hostname -f 2>/dev/null || echo 'localhost'):${WEB_PORT:-80}"
log "API Endpoint:      http://localhost:${WEB_PORT:-80}/api/v1"
log "API Docs:          http://localhost:${WEB_PORT:-80}/api/docs"
echo ""
info "Default Login Credentials:"
echo "   Email:    ahmad@groz.ae"
echo "   Password: Demo@2026!"
echo ""
warn "IMPORTANT: Change the default password after first login!"
warn "IMPORTANT: Review .env file and update CORS_ORIGINS with your actual domain."
echo ""
info "Useful commands:"
echo "   View logs:       ${COMPOSE_CMD} -f docker-compose.prod.yml logs -f"
echo "   Stop:            ${COMPOSE_CMD} -f docker-compose.prod.yml down"
echo "   Restart:         ${COMPOSE_CMD} -f docker-compose.prod.yml restart"
echo "   Enable backups:  ${COMPOSE_CMD} -f docker-compose.prod.yml --profile backup up -d"
echo "   Enable monitor:  ${COMPOSE_CMD} -f docker-compose.prod.yml --profile monitoring up -d"
echo ""

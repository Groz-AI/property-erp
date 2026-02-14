# =============================================================================
# Real Estate ERP — On-Premise Installation Script (Windows)
# Run: powershell -ExecutionPolicy Bypass -File scripts\install.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

function Log($msg)  { Write-Host "[OK] $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "[!]  $msg" -ForegroundColor Yellow }
function Info($msg) { Write-Host "[i]  $msg" -ForegroundColor Cyan }
function Fail($msg) { Write-Host "[X]  $msg" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "=============================================="
Write-Host "  Real Estate ERP - On-Premise Installer"
Write-Host "=============================================="
Write-Host ""

# ── 1. Check Prerequisites ──────────────────────────────────────────────────
Info "Checking prerequisites..."

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Fail "Docker is not installed. Install Docker Desktop from https://www.docker.com/products/docker-desktop"
}
Log "Docker found: $(docker --version)"

try { docker info 2>$null | Out-Null } catch { Fail "Docker daemon is not running. Start Docker Desktop first." }
Log "Docker daemon is running"

# ── 2. Generate .env file ───────────────────────────────────────────────────
$envFile = ".env"

if (Test-Path $envFile) {
    Warn ".env already exists. Keeping existing configuration."
} else {
    Info "Generating secure .env configuration..."

    function New-Secret($len) {
        $bytes = New-Object byte[] $len
        [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
        return [Convert]::ToBase64String($bytes).Substring(0, $len) -replace '[/+=]', 'x'
    }

    $dbPass    = New-Secret 24
    $redisPass = New-Secret 24
    $jwtSec    = New-Secret 48
    $jwtRef    = New-Secret 48
    $s3Key     = New-Secret 20
    $s3Sec     = New-Secret 40

    @"
# ============================================
# Real Estate ERP - Production Configuration
# Generated: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
# ============================================

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=re_erp
DB_USER=erp_user
DB_PASSWORD=$dbPass
DB_SSL=false
DB_POOL_SIZE=20

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$redisPass

# JWT
JWT_SECRET=$jwtSec
JWT_REFRESH_SECRET=$jwtRef
JWT_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

# S3 / MinIO
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=$s3Key
S3_SECRET_KEY=$s3Sec
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
GRAFANA_PASSWORD=$(New-Secret 16)
"@ | Out-File -FilePath $envFile -Encoding UTF8

    Log "Secure .env file generated"
}

# ── 3. Create directories ───────────────────────────────────────────────────
New-Item -ItemType Directory -Path "backups" -Force | Out-Null
Log "Backup directory created"

# ── 4. Build & Start ────────────────────────────────────────────────────────
Info "Building Docker images (5-10 minutes on first run)..."
docker compose -f docker-compose.prod.yml --env-file .env build 2>&1 | Select-Object -Last 5

Info "Starting infrastructure (PostgreSQL, Redis, MinIO)..."
docker compose -f docker-compose.prod.yml --env-file .env up -d postgres redis minio

Info "Waiting for PostgreSQL..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    $result = docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U erp_user 2>$null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 2
}
if (-not $ready) { Fail "PostgreSQL did not start in 60 seconds" }
Log "PostgreSQL is ready"

# ── 5. Run Migrations ───────────────────────────────────────────────────────
Info "Running database migrations..."
docker compose -f docker-compose.prod.yml --env-file .env run --rm api node -e "require('child_process').execSync('npx typeorm migration:run -d dist/database/data-source.js',{stdio:'inherit'})" 2>&1
Log "Migrations complete"

# ── 6. Seed Data ────────────────────────────────────────────────────────────
Info "Seeding initial data..."
docker compose -f docker-compose.prod.yml --env-file .env run --rm api node dist/database/seeds/index.js 2>&1
Log "Database seeded"

# ── 7. Start All Services ───────────────────────────────────────────────────
Info "Starting all services..."
docker compose -f docker-compose.prod.yml --env-file .env up -d

Start-Sleep -Seconds 10

# ── 8. Health Check ─────────────────────────────────────────────────────────
Info "Running health checks..."
$healthy = $false
for ($i = 0; $i -lt 12; $i++) {
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:80" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($resp.StatusCode -eq 200) { $healthy = $true; break }
    } catch {}
    Start-Sleep -Seconds 5
}
if ($healthy) { Log "Web frontend is healthy" } else { Warn "Web frontend not responding yet - check logs" }

try {
    $resp = Invoke-WebRequest -Uri "http://localhost:80/api/v1/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($resp.StatusCode -eq 200) { Log "API is healthy" }
} catch { Warn "API health check failed - may still be starting" }

# ── 9. Summary ──────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=============================================="
Write-Host "  Installation Complete!"
Write-Host "=============================================="
Write-Host ""
Log "Application URL:  http://localhost:80"
Log "API Docs:         http://localhost:80/api/docs"
Write-Host ""
Info "Default Login:"
Write-Host "   Email:    ahmad@groz.ae"
Write-Host "   Password: Demo@2026!"
Write-Host ""
Warn "CHANGE the default password after first login!"
Warn "Update CORS_ORIGINS in .env with your actual domain."
Write-Host ""
Info "Commands:"
Write-Host "   View logs:   docker compose -f docker-compose.prod.yml logs -f"
Write-Host "   Stop:        docker compose -f docker-compose.prod.yml down"
Write-Host "   Restart:     docker compose -f docker-compose.prod.yml restart"
Write-Host "   Backup DB:   docker compose -f docker-compose.prod.yml --profile backup up -d"
Write-Host ""

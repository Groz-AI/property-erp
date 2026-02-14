# Real Estate ERP — DevOps, Deployment & Operations

## 1. Docker Setup

### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:80/ || exit 1
```

### Frontend Nginx Config
```nginx
# frontend/nginx.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://api:3000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

---

## 2. Docker Compose (MVP)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: re_erp
      POSTGRES_USER: ${DB_USER:-erp_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-erp_pass_change_me}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/src/database/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-erp_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD:-redis_pass_change_me}
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-redis_pass_change_me}", "ping"]
      interval: 10s

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-minio_access}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-minio_secret_change_me}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 30s

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: re_erp
      DB_USER: ${DB_USER:-erp_user}
      DB_PASSWORD: ${DB_PASSWORD:-erp_pass_change_me}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-redis_pass_change_me}
      JWT_SECRET: ${JWT_SECRET:-change_me_in_production_32chars}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-change_me_refresh_32chars}
      JWT_EXPIRY: 900
      JWT_REFRESH_EXPIRY: 604800
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${MINIO_ACCESS_KEY:-minio_access}
      S3_SECRET_KEY: ${MINIO_SECRET_KEY:-minio_secret_change_me}
      S3_BUCKET: erp-documents
      S3_REGION: us-east-1
      CORS_ORIGINS: http://localhost:5173,http://localhost:80
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    restart: unless-stopped

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: ["node", "dist/worker.js"]
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: re_erp
      DB_USER: ${DB_USER:-erp_user}
      DB_PASSWORD: ${DB_PASSWORD:-erp_pass_change_me}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-redis_pass_change_me}
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${MINIO_ACCESS_KEY:-minio_access}
      S3_SECRET_KEY: ${MINIO_SECRET_KEY:-minio_secret_change_me}
      S3_BUCKET: erp-documents
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheusdata:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
    ports:
      - "3001:3000"
    volumes:
      - grafanadata:/var/lib/grafana
      - ./infra/grafana/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus

volumes:
  pgdata:
  redisdata:
  miniodata:
  prometheusdata:
  grafanadata:
```

---

## 3. Environment Variables

```bash
# .env.example

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=re_erp
DB_USER=erp_user
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DB_SSL=false
DB_POOL_SIZE=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD

# JWT
JWT_SECRET=CHANGE_ME_MIN_32_CHARS_RANDOM_STRING
JWT_REFRESH_SECRET=CHANGE_ME_DIFFERENT_32_CHARS_STRING
JWT_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

# S3 / MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio_access
S3_SECRET_KEY=CHANGE_ME_MINIO_SECRET
S3_BUCKET=erp-documents
S3_REGION=us-east-1

# App
NODE_ENV=development
PORT=3000
CORS_ORIGINS=http://localhost:5173
API_BASE_URL=http://localhost:3000/api/v1
LOG_LEVEL=debug

# Email (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SENDGRID_API_KEY
SMTP_FROM=noreply@erp.example.com

# Monitoring
GRAFANA_PASSWORD=admin

# Feature Flags
FEATURE_SSO_ENABLED=false
FEATURE_WHATSAPP_ENABLED=false
FEATURE_PAYMENT_GATEWAY_ENABLED=false
```

---

## 4. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ghcr.io/${{ github.repository }}

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}' }
      - name: Backend lint
        run: cd backend && npm ci && npm run lint && npm run type-check
      - name: Frontend lint
        run: cd frontend && npm ci && npm run lint && npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}' }
      - run: cd backend && npm ci && npm run test:unit -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: backend/coverage

  integration-tests:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: re_erp_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}' }
      - name: Run integration tests
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: re_erp_test
          DB_USER: test_user
          DB_PASSWORD: test_pass
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-jwt-secret-32-chars-minimum
          JWT_REFRESH_SECRET: test-refresh-secret-32chars-min
        run: |
          cd backend
          npm ci
          npm run migration:run
          npm run seed:test
          npm run test:integration

  build-and-push:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push API
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ env.IMAGE_PREFIX }}/api:${{ github.sha }},${{ env.IMAGE_PREFIX }}/api:latest
      - name: Build and push Web
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ env.IMAGE_PREFIX }}/web:${{ github.sha }},${{ env.IMAGE_PREFIX }}/web:latest

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          # SSH into staging server and pull new images
          # Or kubectl apply for K8s
          echo "Deploy to staging with tag ${{ github.sha }}"
```

---

## 5. Monitoring & Alerting

### Prometheus Config
```yaml
# infra/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: /metrics

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Key Metrics & Alerts
| Metric | Warning | Critical | Action |
|---|---|---|---|
| API response time P95 | > 500ms | > 2s | Scale up / optimize queries |
| API error rate | > 1% | > 5% | Investigate logs |
| DB connections used | > 70% | > 90% | Increase pool / scale |
| DB query time P95 | > 200ms | > 1s | Index tuning |
| Redis memory usage | > 70% | > 90% | Eviction policy / scale |
| Queue depth (BullMQ) | > 100 | > 1000 | Scale workers |
| Disk usage | > 70% | > 90% | Expand / archive |
| Failed login attempts | > 50/min | > 200/min | Rate limit / block |
| Background job failures | > 5/hour | > 20/hour | Investigate, retry |

### Health Check Endpoint
```typescript
// GET /health
{
  "status": "healthy",
  "timestamp": "2026-02-10T21:00:00Z",
  "checks": {
    "database": { "status": "up", "responseTime": "5ms" },
    "redis": { "status": "up", "responseTime": "2ms" },
    "storage": { "status": "up", "responseTime": "15ms" }
  },
  "version": "1.0.0",
  "uptime": "72h15m"
}
```

---

## 6. Backup & Recovery

### Backup Strategy
| Type | Frequency | Retention | Tool |
|---|---|---|---|
| Full DB backup | Daily 02:00 UTC | 30 days | pg_dump / pg_basebackup |
| WAL archiving | Continuous | 7 days | pg_receivewal |
| S3 documents | Versioned | Indefinite | S3 versioning |
| Redis snapshot | Every 6 hours | 3 days | RDB dump |
| Config/secrets | On change | Indefinite | Git (encrypted) |

### Backup Script
```bash
#!/bin/bash
# infra/scripts/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
S3_BACKUP_BUCKET="erp-backups"

# PostgreSQL full backup
pg_dump -h $DB_HOST -U $DB_USER -Fc $DB_NAME > "$BACKUP_DIR/re_erp_$DATE.dump"

# Upload to S3
aws s3 cp "$BACKUP_DIR/re_erp_$DATE.dump" \
  "s3://$S3_BACKUP_BUCKET/postgres/re_erp_$DATE.dump" \
  --storage-class STANDARD_IA

# Clean local backups older than 7 days
find $BACKUP_DIR -name "*.dump" -mtime +7 -delete

# Verify backup integrity
pg_restore --list "$BACKUP_DIR/re_erp_$DATE.dump" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Backup verified: re_erp_$DATE.dump"
else
  echo "BACKUP VERIFICATION FAILED" | notify-admin
fi
```

### Restore Procedure
```bash
# 1. Stop application
docker-compose stop api worker

# 2. Restore from backup
pg_restore -h $DB_HOST -U $DB_USER -d re_erp --clean --if-exists re_erp_YYYYMMDD.dump

# 3. Verify data integrity
psql -h $DB_HOST -U $DB_USER -d re_erp -c "SELECT count(*) FROM tenants;"

# 4. Restart application
docker-compose start api worker
```

### Disaster Recovery Plan
| Scenario | RTO | RPO | Procedure |
|---|---|---|---|
| Single service crash | < 5 min | 0 | Auto-restart (Docker restart policy) |
| DB corruption | < 2 hours | < 1 hour | Restore from WAL + latest backup |
| Full server loss | < 4 hours | < 1 hour | Provision new server, restore from S3 backups |
| Data center outage | < 8 hours | < 1 hour | Failover to secondary region (if configured) |

---

## 7. Deployment Guide

### First-Time Setup
```bash
# 1. Clone repository
git clone https://github.com/org/re-erp.git
cd re-erp

# 2. Copy environment file
cp .env.example .env
# Edit .env with production values (especially secrets!)

# 3. Start infrastructure
docker-compose up -d postgres redis minio

# 4. Run migrations
cd backend && npm run migration:run

# 5. Seed initial data (COA template, system admin, default roles)
npm run seed:init

# 6. Start application
cd .. && docker-compose up -d api worker web

# 7. Create first tenant via API or CLI
npm run cli -- create-tenant --name "Acme RE" --slug acme --admin-email admin@acme.com

# 8. Verify
curl http://localhost:3000/health
```

### Rolling Update
```bash
# 1. Build new images
docker-compose build api web

# 2. Run any new migrations
docker-compose run --rm api npm run migration:run

# 3. Rolling restart (zero-downtime with multiple replicas)
docker-compose up -d --no-deps api
docker-compose up -d --no-deps worker
docker-compose up -d --no-deps web
```

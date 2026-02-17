#!/bin/sh
# Extract specific error messages from recent API logs
cd /opt/erp
docker compose -f docker-compose.cloud.yml logs api --tail=300 --no-log-prefix 2>&1 | grep -o '"message":"[^"]*"' | sort -u | head -30
echo "---DETAILED---"
docker compose -f docker-compose.cloud.yml logs api --tail=300 --no-log-prefix 2>&1 | grep -oE 'column "[^"]+" of relation "[^"]+" does not exist|null value in column "[^"]+" of relation "[^"]+"' | sort -u

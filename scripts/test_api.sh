#!/bin/bash
# Test API permissions from inside the api container
# Usage: docker exec -i erp-api-1 sh < scripts/test_api.sh

echo "=== Login as ahmad@groz.ae ==="
LOGIN=$(wget -qO- --post-data='{"email":"ahmad@groz.ae","password":"Demo@2026!"}' \
  --header='Content-Type: application/json' \
  http://localhost:3000/api/v1/auth/login 2>&1)
echo "Login response: ${LOGIN:0:200}"

TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:40}..."

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get token"
  exit 1
fi

echo ""
echo "=== GET /hr/employees ==="
RESULT=$(wget -qO- --header="Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/hr/employees 2>&1)
echo "Response: ${RESULT:0:300}"

echo ""
echo "=== POST /hr/employees (create test employee) ==="
CREATE=$(wget -qO- --post-data='{"firstName":"Test","lastName":"Employee","email":"test@groz.ae","phone":"+971500000000","hireDate":"2026-01-15","jobTitle":"Tester","basicSalary":5000}' \
  --header="Authorization: Bearer $TOKEN" \
  --header='Content-Type: application/json' \
  http://localhost:3000/api/v1/hr/employees 2>&1)
echo "Response: ${CREATE:0:500}"

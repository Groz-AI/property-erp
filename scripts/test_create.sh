#!/bin/sh
LOGIN=$(wget -qO- --post-data='{"email":"ahmad@groz.ae","password":"Demo@2026!"}' \
  --header='Content-Type: application/json' \
  http://localhost:3000/api/v1/auth/login)
TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token OK: ${TOKEN:0:20}..."

# Try create with verbose error output
wget -O- -S --post-data='{"firstName":"Test","lastName":"Employee","email":"test@groz.ae","phone":"+971500000000","hireDate":"2026-01-15","jobTitle":"Tester","basicSalary":5000}' \
  --header="Authorization: Bearer $TOKEN" \
  --header='Content-Type: application/json' \
  http://localhost:3000/api/v1/hr/employees 2>&1

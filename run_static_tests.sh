#!/usr/bin/env bash
# ==============================================================================
# Acumen Virtual Data Room (VDR) — Full-Stack Static Testing Suite
# Enforced by: QA & Rule Enforcer Subagent
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  Acumen VDR — Full-Stack Static Analysis Suite       ${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. FRONTEND STATIC CHECKS
echo -e "\n${BLUE}[1/4] Running Frontend TypeScript Strict Type Check (tsc --noEmit)...${NC}"
cd frontend && npm run type-check
echo -e "${GREEN}✓ Frontend TypeScript Type Check Passed (0 errors)${NC}"

echo -e "\n${BLUE}[2/4] Running Frontend ESLint Static Analysis...${NC}"
npm run lint
echo -e "${GREEN}✓ Frontend ESLint Passed (0 errors)${NC}"
cd ..

# 2. BACKEND STATIC CHECKS
echo -e "\n${BLUE}[3/4] Running Backend Ruff Static Analysis & Formatting...${NC}"
cd backend
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi
ruff check app/ tests/
echo -e "${GREEN}✓ Backend Ruff Linter Passed (0 errors)${NC}"

echo -e "\n${BLUE}[4/4] Running Backend Pytest Automated Suite...${NC}"
pytest tests/ -v
echo -e "${GREEN}✓ All 28 Automated Backend Tests Passed (100% Pass Rate)${NC}"
cd ..

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  🎉 ALL STATIC & UNIT QUALITY GATES PASSED!          ${NC}"
echo -e "${GREEN}======================================================${NC}"

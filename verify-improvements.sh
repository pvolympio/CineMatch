#!/bin/bash
# Script de verificação das melhorias implementadas

echo "🔍 Verificando melhorias do CineMatch..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Função de verificação
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAILED++))
    fi
}

# 1. Verificar estrutura de arquivos
echo "📁 Verificando estrutura de arquivos..."

[ -f "backend/src/config/redis.js" ]
check "Redis config criado"

[ -f "backend/src/config/logger.js" ]
check "Logger config criado"

[ -f "backend/src/config/addIndexes.js" ]
check "Script de índices criado"

[ -f "backend/src/routes/watchlist.js" ]
check "Rota watchlist criada"

[ -f "backend/src/routes/lists.js" ]
check "Rota lists criada"

[ -f "backend/Dockerfile" ]
check "Dockerfile backend criado"

[ -f "frontend/Dockerfile" ]
check "Dockerfile frontend criado"

[ -f "docker-compose.yml" ]
check "docker-compose.yml criado"

[ -f ".github/workflows/ci.yml" ]
check "CI/CD workflow criado"

[ -f "frontend/components/ErrorBoundary.tsx" ]
check "ErrorBoundary criado"

echo ""

# 2. Verificar dependências
echo "📦 Verificando dependências..."

cd backend

if grep -q "compression" package.json; then
    echo -e "${GREEN}✓${NC} compression instalado"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} compression não encontrado"
    ((FAILED++))
fi

if grep -q "ioredis" package.json; then
    echo -e "${GREEN}✓${NC} ioredis instalado"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} ioredis não encontrado"
    ((FAILED++))
fi

if grep -q "winston" package.json; then
    echo -e "${GREEN}✓${NC} winston instalado"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} winston não encontrado"
    ((FAILED++))
fi

if grep -q "rate-limit-redis" package.json; then
    echo -e "${GREEN}✓${NC} rate-limit-redis instalado"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} rate-limit-redis não encontrado"
    ((FAILED++))
fi

cd ..

echo ""

# 3. Verificar scripts npm
echo "🔧 Verificando scripts npm..."

cd backend

if grep -q "db:indexes" package.json; then
    echo -e "${GREEN}✓${NC} Script db:indexes adicionado"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Script db:indexes não encontrado"
    ((FAILED++))
fi

cd ..

echo ""

# 4. Verificar configurações de segurança
echo "🔒 Verificando segurança..."

if ! grep -q "your_secure_password_here" backend/.env.example 2>/dev/null; then
    echo -e "${RED}✗${NC} .env.example ainda contém placeholders genéricos"
    ((FAILED++))
else
    echo -e "${GREEN}✓${NC} .env.example com placeholders seguros"
    ((PASSED++))
fi

if grep -q "express-validator" backend/src/routes/ratings.js; then
    echo -e "${GREEN}✓${NC} Validação implementada em ratings"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Validação não encontrada em ratings"
    ((FAILED++))
fi

echo ""

# 5. Verificar testes
echo "🧪 Verificando testes..."

[ -f "backend/src/services/__tests__/recommendationService.test.js" ]
check "Testes de recommendationService criados"

[ -f "backend/src/services/__tests__/tmdbService.test.js" ]
check "Testes de tmdbService criados"

echo ""

# 6. Verificar logs
echo "📝 Verificando configuração de logs..."

if [ -d "backend/logs" ]; then
    echo -e "${GREEN}✓${NC} Diretório de logs criado"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Diretório de logs não existe (será criado automaticamente)"
fi

echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passou: $PASSED${NC}"
echo -e "${RED}Falhou: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Todas as melhorias foram implementadas com sucesso!${NC}"
    echo ""
    echo "🚀 Próximos passos:"
    echo "  1. Configure o arquivo .env com suas credenciais"
    echo "  2. Inicie o Redis: docker run -d -p 6379:6379 redis:7-alpine"
    echo "  3. Execute: npm run db:indexes"
    echo "  4. Inicie o servidor: npm run dev"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Algumas verificações falharam. Revise os itens acima.${NC}"
    echo ""
    exit 1
fi

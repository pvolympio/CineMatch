# 🎬 CineMatch - Guia de Início Rápido (Desenvolvimento Local)

## ⚡ Início Rápido (Desenvolvimento Local)

```bash
# 1. Pré-requisitos
# - Node.js 18+
# - PostgreSQL 15+
# - Redis 7+

# 2. Backend
cd backend
npm install
cp .env.example .env
# Edite o .env com suas credenciais
npm run db:init
npm run db:indexes
npm run dev

# 3. Frontend (em outro terminal)
cd frontend
npm install
cp .env.local.example .env.local
npm run dev

# 4. Acesse
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/health
```

## 🔑 Obter Chave TMDB (Gratuita)

1. Crie conta em https://www.themoviedb.org
2. Vá em Settings > API
3. Solicite chave de API
4. Copie para `TMDB_API_KEY` no `.env`

## ✅ Verificar Instalação

```bash
# Verificar melhorias implementadas
bash verify-improvements.sh

# Testar backend
curl http://localhost:3001/health

# Testar Redis
docker-compose exec redis redis-cli ping
# Deve retornar: PONG

# Testar PostgreSQL
docker-compose exec postgres psql -U postgres -d cinematch -c "SELECT COUNT(*) FROM users;"
```

## 🧪 Executar Testes

```bash
cd backend
npm test
npm run test:coverage
```

## 📊 Endpoints Principais

### Públicos
- `GET /health` - Status da API
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/movies/search?q=inception` - Buscar filmes
- `GET /api/movies/popular` - Filmes populares

### Autenticados (requer header `Authorization: Bearer <token>`)
- `GET /api/profile` - Perfil cinematográfico
- `GET /api/profile/recommendations` - Recomendações personalizadas
- `POST /api/ratings` - Avaliar filme
- `GET /api/watchlist` - Ver watchlist
- `GET /api/lists` - Listas personalizadas

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ver logs
docker-compose logs backend
```

### Redis não conecta
```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Testar conexão
docker-compose exec redis redis-cli ping
```

### Erro "TMDB_API_KEY not set"
```bash
# Adicione a chave no .env
echo "TMDB_API_KEY=sua_chave_aqui" >> backend/.env

# Reinicie o backend
docker-compose restart backend
```

### Erro de permissão nos logs
```bash
mkdir -p backend/logs
chmod 777 backend/logs
```

## 📚 Documentação Completa

- [README.md](README.md) - Documentação completa
- [DOCKER.md](DOCKER.md) - Guia Docker detalhado
- [IMPROVEMENTS.md](IMPROVEMENTS.md) - Lista de melhorias implementadas

## 🚀 Próximos Passos

1. Crie uma conta no frontend
2. Complete o onboarding avaliando alguns filmes
3. Veja suas recomendações personalizadas
4. Explore o grafo de conexões entre filmes
5. Crie listas personalizadas

## 💡 Dicas

- Use `docker-compose logs -f backend` para ver logs em tempo real
- Acesse `http://localhost:3001/health` para verificar status da API
- O cache Redis melhora muito a performance - mantenha-o rodando
- Execute `npm run db:indexes` após adicionar muitos dados

## 🆘 Precisa de Ajuda?

- Abra uma issue no GitHub
- Verifique os logs: `docker-compose logs`
- Execute o script de verificação: `bash verify-improvements.sh`

---

**Tempo estimado de setup**: 5-10 minutos
**Última atualização**: 20 de abril de 2026

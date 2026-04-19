# 🎬 CineMatch Backend

API REST para o sistema de descoberta inteligente de filmes CineMatch.

## Stack Tecnológica

- **Runtime**: Node.js
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **API de Filmes**: TMDB (The Movie Database)

## Estrutura do Projeto

```
cinematch-backend/
├── src/
│   ├── server.js              # Entry point - servidor Express
│   ├── config/
│   │   ├── database.js        # Conexão com PostgreSQL (pool)
│   │   └── initDb.js          # Script para criar as tabelas
│   ├── middleware/
│   │   └── auth.js            # Middleware JWT de autenticação
│   ├── routes/
│   │   ├── auth.js            # POST /register, POST /login, GET /me
│   │   ├── movies.js          # GET /search, /popular, /trending, /:id
│   │   ├── ratings.js         # POST /, POST /batch, GET /, DELETE /:id
│   │   └── profile.js         # GET /, GET /recommendations, GET /graph/:id
│   └── services/
│       ├── tmdbService.js     # Integração com TMDB API
│       └── recommendationService.js  # Motor de recomendações
├── .env.example               # Template de variáveis de ambiente
├── package.json
└── README.md
```

## Configuração

### 1. Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Conta gratuita no TMDB: https://www.themoviedb.org

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinematch
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=uma_chave_secreta_muito_longa_e_aleatoria

# TMDB (obrigatório para dados de filmes)
TMDB_API_KEY=sua_chave_tmdb_aqui
```

### 4. Criar banco de dados

```sql
-- No PostgreSQL:
CREATE DATABASE cinematch;
```

### 5. Inicializar tabelas

```bash
npm run db:init
```

### 6. Iniciar servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor inicia em `http://localhost:3001`

---

## Endpoints da API

### Autenticação (`/api/auth`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Criar nova conta |
| POST | `/api/auth/login` | Fazer login |
| GET | `/api/auth/me` | Dados do usuário logado |

### Filmes (`/api/movies`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/movies/search?q=title` | Buscar filmes |
| GET | `/api/movies/popular` | Filmes populares |
| GET | `/api/movies/trending` | Filmes em alta |
| GET | `/api/movies/genres` | Lista de gêneros |
| GET | `/api/movies/:id` | Detalhes de um filme |
| GET | `/api/movies/:id/similar` | Filmes similares |

### Avaliações (`/api/ratings`) 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/ratings` | Avaliar um filme |
| POST | `/api/ratings/batch` | Avaliar vários (onboarding) |
| GET | `/api/ratings` | Ver todas as avaliações |
| DELETE | `/api/ratings/:movieId` | Remover avaliação |

### Perfil (`/api/profile`) 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/profile` | Perfil cinematográfico |
| POST | `/api/profile/compute` | Recalcular perfil |
| GET | `/api/profile/recommendations` | Hidden gems personalizados |
| GET | `/api/profile/graph/:movieId` | Grafo de conexões |
| GET | `/api/profile/stats` | Estatísticas do usuário |

🔒 = Requer header: `Authorization: Bearer <token>`

---

## Motor de Recomendações

### Como funciona

```
Score = (Genre Affinity × 0.50) + (Quality Score × 0.30) + (Obscurity Bonus × 0.20)
```

1. **Genre Affinity**: Quanto o filme corresponde aos gêneros favoritos do usuário
2. **Quality Score**: Normalização da nota TMDB (≥ 6.5)
3. **Obscurity Bonus**: Filmes com BAIXA popularidade recebem bônus (hidden gems)

### Perfil Cinematográfico

O sistema analisa os filmes avaliados e computa:
- **Pesos por gênero**: Quais gêneros o usuário mais aprecia
- **Perfil narrativo**: Complexo, emocional, ação, leveza
- **Personalidade**: O Visionário, O Empático, O Aventureiro, etc.

---

## Banco de Dados

```
users → user_ratings → user_preferences
users → recommendation_log
movie_cache (cache de dados TMDB)
```

---

## Desenvolvimento

```bash
# Verificar saúde da API
curl http://localhost:3001/health

# Registrar usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"123456"}'
```

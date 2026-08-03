# 🎬 CineMatch - Sistema de Descoberta Inteligente de Filmes

Sistema completo de recomendação de filmes com perfil cinematográfico personalizado, motor de recomendações baseado em IA e interface moderna.

## 🎨 Design System - CineMatch Atelier

O CineMatch possui uma identidade visual distintiva inspirada em salas de cinema vintage e ateliês de curadoria editorial:

### Paleta de Cores
- **Vinyl (#C9A36F)** - Dourado de anel de filme vintage
- **Velvet (#1E4D3E)** - Capa de filme verde profundo
- **Bordô (#53262A)** - Vinil de filme clássico
- **Metal (#2D2D33)** - Superfícies de projeção
- **Cinza Cinema (#3C372E)** - Cenário de filme preto-and-branco

### Tipografia
- **Display**: Libre Franklin - fonte moderna com personalidade editorial
- **Body**: Libre Franklin - textos principais
- **Mono**: Space Mono - para dados técnicos e metadados
- **Serif**: Cormorant Garamond - para citações

### Características Visuais
- Textura de filme vintage sutil (não ruído de IA)
- Animações "flicker" de projeção de cinema
- Cartões com sombra de filme projetado
- Botões com estilo "selo de filme"
- Gradientes naturais inspirados em luz de projeção

## 🚀 Stack Tecnológica

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL 15
- **Cache**: Redis 7
- **Autenticação**: JWT
- **API Externa**: TMDB (The Movie Database)
- **Logs**: Winston
- **Testes**: Jest + Supertest

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Estado**: Zustand
- **Gráficos**: Recharts
- **Visualização**: React Force Graph

## 📦 Instalação e Execução Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Conta TMDB (gratuita)

### Passos de Instalação

#### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL, Redis e TMDB

# Inicializar o banco de dados e criar índices
npm run db:init
npm run db:indexes

# Iniciar o servidor backend em desenvolvimento
npm run dev
```

#### 2. Frontend (em outro terminal)

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local

# Iniciar aplicação
npm run dev
```

Acessem a aplicação em:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔑 Configuração

### Variáveis de Ambiente

#### Backend (.env)
```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinematch
DB_USER=postgres
DB_PASSWORD=sua_senha

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d

# TMDB API
TMDB_API_KEY=sua_chave_tmdb

# Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Obter Chave TMDB

1. Crie uma conta em [themoviedb.org](https://www.themoviedb.org)
2. Acesse [Settings > API](https://www.themoviedb.org/settings/api)
3. Solicite uma chave de API (gratuita)
4. Copie a chave para `TMDB_API_KEY` no `.env`

## 📚 Documentação da API

### Autenticação

#### POST /api/auth/register
Criar nova conta
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "senha123"
}
```

#### POST /api/auth/login
Fazer login
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

#### GET /api/auth/me
Obter dados do usuário autenticado (requer token)

### Filmes

#### GET /api/movies/search?q=titulo&year=2020&genre=28
Buscar filmes com filtros avançados

#### GET /api/movies/popular?page=1
Filmes populares

#### GET /api/movies/trending
Filmes em alta

#### GET /api/movies/:id
Detalhes de um filme

#### GET /api/movies/:id/similar
Filmes similares

### Avaliações (requer autenticação)

#### POST /api/ratings
Avaliar um filme
```json
{
  "tmdb_movie_id": 550,
  "rating": 8.5,
  "movie_title": "Fight Club",
  "watched": true
}
```

#### GET /api/ratings?page=1&limit=20&sort=updated_at
Listar avaliações do usuário

#### DELETE /api/ratings/:movieId
Remover avaliação

### Watchlist (requer autenticação)

#### POST /api/watchlist
Adicionar à watchlist

#### GET /api/watchlist?page=1&limit=20
Listar watchlist

#### DELETE /api/watchlist/:movieId
Remover da watchlist

### Listas Personalizadas (requer autenticação)

#### POST /api/lists
Criar lista personalizada

#### GET /api/lists
Listar todas as listas do usuário

#### GET /api/lists/:listId
Obter detalhes de uma lista

#### POST /api/lists/:listId/movies
Adicionar filme à lista

#### DELETE /api/lists/:listId/movies/:movieId
Remover filme da lista

### Perfil (requer autenticação)

#### GET /api/profile
Obter perfil cinematográfico

#### GET /api/profile/recommendations
Obter recomendações personalizadas (hidden gems)

#### GET /api/profile/graph/:movieId
Obter grafo de conexões de um filme

## 🧪 Testes

```bash
# Backend
cd backend
npm test                # Executar testes
npm run test:watch      # Modo watch
npm run test:coverage   # Cobertura

# Frontend
cd frontend
npm run lint            # Linter
npm run build           # Build de produção
```

## 🔒 Segurança

- ✅ Helmet para headers HTTP seguros
- ✅ Rate limiting por usuário/IP com Redis
- ✅ Validação e sanitização de entrada (express-validator)
- ✅ Proteção contra SQL injection (queries parametrizadas)
- ✅ Senhas hasheadas com bcrypt
- ✅ JWT para autenticação stateless
- ✅ CORS configurado
- ✅ Logs estruturados com Winston

## 🚀 Performance

- ✅ Cache Redis para dados TMDB
- ✅ Compressão de resposta (gzip)
- ✅ Índices otimizados no PostgreSQL
- ✅ Paginação em todos os endpoints de lista
- ✅ Connection pooling no PostgreSQL

## 📊 Monitoramento

- Logs estruturados em `backend/logs/`
- Health check: `GET /health`
- Métricas de cache e rate limiting via Redis

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🙏 Agradecimentos

- [TMDB](https://www.themoviedb.org) pelos dados de filmes
- Comunidade open source

## 📧 Contato

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

Desenvolvido com ❤️ usando Node.js, React e PostgreSQL

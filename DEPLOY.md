# 🚀 Guia de Deploy - CineMatch

## 📋 Pré-requisitos para Produção

- Servidor com Docker e Docker Compose
- Domínio configurado (opcional)
- Certificado SSL (Let's Encrypt recomendado)
- Conta TMDB com API key
- PostgreSQL 15+ (ou usar container)
- Redis 7+ (ou usar container)

## 🔧 Configuração para Produção

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=cinematch
DB_USER=postgres
DB_PASSWORD=SENHA_FORTE_AQUI_MINIMO_16_CARACTERES

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=SENHA_REDIS_AQUI

# JWT (gere com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=SUA_CHAVE_JWT_SECRETA_AQUI_MINIMO_64_CARACTERES
JWT_EXPIRES_IN=7d

# TMDB
TMDB_API_KEY=sua_chave_tmdb_aqui

# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seu-dominio.com

# Logs
LOG_LEVEL=info
```

### 2. Deploy com Docker Compose

```bash
# 1. Clone o repositório no servidor
git clone https://github.com/seu-usuario/cinematch.git
cd cinematch

# 2. Configure as variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas credenciais

# 3. Build e inicie os containers
docker-compose up -d --build

# 4. Inicialize o banco de dados
docker-compose exec backend npm run db:init
docker-compose exec backend npm run db:indexes

# 5. Verifique os logs
docker-compose logs -f

# 6. Teste a aplicação
curl http://localhost:3001/health
```

### 3. Configurar Nginx (Reverse Proxy)

Crie `/etc/nginx/sites-available/cinematch`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site:
```bash
sudo ln -s /etc/nginx/sites-available/cinematch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificados
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com -d api.seu-dominio.com

# Renovação automática (já configurada pelo certbot)
sudo certbot renew --dry-run
```

## 🔒 Checklist de Segurança

- [ ] Senhas fortes para DB e Redis (mínimo 16 caracteres)
- [ ] JWT_SECRET com 64+ caracteres aleatórios
- [ ] Firewall configurado (apenas portas 80, 443, 22)
- [ ] SSL/TLS ativado (HTTPS)
- [ ] Rate limiting configurado
- [ ] Logs de acesso habilitados
- [ ] Backups automáticos do banco
- [ ] Variáveis de ambiente não commitadas no Git
- [ ] Docker containers rodando como non-root
- [ ] Atualizações de segurança automáticas

## 📊 Monitoramento

### Logs

```bash
# Ver logs em tempo real
docker-compose logs -f backend

# Logs do PostgreSQL
docker-compose logs postgres

# Logs do Redis
docker-compose logs redis

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks

```bash
# Backend
curl https://api.seu-dominio.com/health

# Frontend
curl https://seu-dominio.com

# Redis
docker-compose exec redis redis-cli ping

# PostgreSQL
docker-compose exec postgres pg_isready
```

## 🔄 Backup e Restore

### Backup do PostgreSQL

```bash
# Backup manual
docker-compose exec postgres pg_dump -U postgres cinematch > backup_$(date +%Y%m%d).sql

# Backup automático (cron)
# Adicione ao crontab: crontab -e
0 2 * * * cd /path/to/cinematch && docker-compose exec -T postgres pg_dump -U postgres cinematch > backups/backup_$(date +\%Y\%m\%d).sql
```

### Restore do PostgreSQL

```bash
# Restore
cat backup_20260420.sql | docker-compose exec -T postgres psql -U postgres cinematch
```

### Backup do Redis

```bash
# Redis faz backup automático (appendonly.aof)
# Para backup manual:
docker-compose exec redis redis-cli BGSAVE
docker cp cinematch-redis:/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

## 🔄 Atualizações

```bash
# 1. Fazer backup
docker-compose exec postgres pg_dump -U postgres cinematch > backup_pre_update.sql

# 2. Pull das mudanças
git pull origin main

# 3. Rebuild e restart
docker-compose up -d --build

# 4. Executar migrações (se houver)
docker-compose exec backend npm run db:migrate

# 5. Verificar logs
docker-compose logs -f backend
```

## 📈 Otimizações de Produção

### PostgreSQL

Edite `docker-compose.yml` para adicionar:

```yaml
postgres:
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

### Redis

```yaml
redis:
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Node.js

```yaml
backend:
  environment:
    NODE_ENV: production
    NODE_OPTIONS: --max-old-space-size=2048
```

## 🚨 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar recursos
docker stats

# Reiniciar container específico
docker-compose restart backend
```

### Banco de dados lento

```bash
# Verificar conexões
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Analisar queries lentas
docker-compose exec postgres psql -U postgres cinematch -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

### Redis com memória cheia

```bash
# Verificar uso de memória
docker-compose exec redis redis-cli INFO memory

# Limpar cache (CUIDADO!)
docker-compose exec redis redis-cli FLUSHDB
```

## 📞 Suporte

- Logs: `docker-compose logs -f`
- Health: `curl http://localhost:3001/health`
- Documentação: [README.md](README.md)

---

**Última atualização**: 20 de abril de 2026
**Versão**: 1.0.0

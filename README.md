# Backadmin - Lusio Cidadania

> Sistema de backoffice para gestão de pedidos de nacionalidade portuguesa

**Status:** Experimental (Desenvolvimento)
**Versão:** 0.3.0
**URL Dev:** https://dev.lusio.market/backadmin
**Última atualização:** 2025-10-23

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Features Implementadas](#features-implementadas)
- [Arquitetura](#arquitetura)
- [Stack Técnico](#stack-técnico)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)
- [Changelog](#changelog)

---

## 🎯 Sobre o Projeto

O Backadmin é uma interface de gestão para o sistema de pedidos de nacionalidade portuguesa. Funciona como uma camada front-end que irá consumir a API do sistema de cidadania (em desenvolvimento pela empresa parceira).

### Modelo de Dados

O sistema segue um modelo **e-commerce**:
- **1 Usuário** pode criar **N Pedidos** (para si, família, amigos)
- Cada pedido representa um processo de nacionalidade de uma pessoa específica
- Usuários podem acompanhar múltiplos pedidos em diferentes estágios

### Documentação Base

O fluxo completo do processo está documentado em:
- **Jornada do Usuário:** `~/Claude/docs/projects/JORNADA-BACKADMIN.md`
- **Schema do Banco:** `~/Claude/projects/third-party/cidadania/luzio-api/prisma/schema.prisma`

---

## ✨ Features Implementadas

### v0.3.0 (2025-10-23)

#### 🎨 Visualização "Por Usuário"

Sistema de agrupamento de pedidos por usuário com interface intuitiva.

**Funcionalidades:**
- Lista todos os usuários que possuem pedidos no sistema
- Avatar com inicial do nome do usuário
- Badge mostrando quantidade de pedidos (dinâmico conforme filtros)
- Click no usuário para ver seus pedidos específicos
- Breadcrumb de navegação "← Voltar para todos os usuários"

**Filtros Integrados:**
- ✅ Busca por nome/email do usuário
- ✅ Filtro por status dos pedidos
- ✅ Filtro por intervalo de datas
- ✅ Combinação de múltiplos filtros

**Comportamento dos Filtros:**
- Usuários sem pedidos que atendam aos filtros são ocultados
- Badge mostra apenas pedidos que passam pelos filtros ativos
- Todos os filtros funcionam em conjunto (AND lógico)

**Arquivos modificados:**
- `src/app/dashboard/page.tsx` - Implementação da lógica de agrupamento e filtragem

#### 📊 Interface do Dashboard

**Visualizações disponíveis:**
1. **📁 Todos Processos** - Lista tradicional de todos os pedidos
2. **👤 Por Usuário** - Agrupamento por usuário (NOVO)

**Filtros disponíveis:**
- 🔍 Busca textual (nome, email, ID)
- 📊 Multi-seleção de status
- 📅 Intervalo de datas (criação do pedido)

---

## 🏗️ Arquitetura

### Modelo de Dados

```
User (1) -----> (N) Services
                     |
                     +---> Person (requerente)
                     +---> Address
                     +---> Documents[]
                     +---> DocumentsAttorney[]
```

### Context API

**ServicesContext** (`src/contexts/ServicesContext.tsx`)
- Gerencia estado global dos pedidos
- Funções: `updateService()`, `getService()`
- Inicializado com dados mockados até API estar pronta

### Dados Mockados

**Localização:** `src/lib/mockData.ts`

**Estrutura:**
- 5 usuários fictícios
- 15 pedidos distribuídos (3 pedidos por usuário)
- Todos os status do fluxo representados
- Dados completos: pessoa, endereço, documentos

---

## 🛠️ Stack Técnico

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** Shadcn/UI
- **State Management:** React Context API
- **Database Schema:** Prisma (referência)
- **Deploy:** PM2 + Nginx (VPS)

---

## 📁 Estrutura do Projeto

```
backadmin/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Página principal do dashboard
│   │   │   └── page.tsx        # Lógica de visualizações e filtros
│   │   ├── pedidos/
│   │   │   └── [id]/           # Página de detalhes do pedido
│   │   ├── layout.tsx          # Layout raiz com ServicesProvider
│   │   └── page.tsx            # Redirect para /dashboard
│   ├── components/
│   │   ├── pedidos/
│   │   │   ├── service-modal.tsx    # Modal de detalhes
│   │   │   └── status-badge.tsx     # Badge de status
│   │   └── ui/                 # Componentes Shadcn
│   ├── contexts/
│   │   └── ServicesContext.tsx # Context API de serviços
│   ├── lib/
│   │   ├── mockData.ts         # Dados mockados (5 users, 15 services)
│   │   ├── types.ts            # TypeScript types (Prisma-aligned)
│   │   └── utils.ts            # Helpers
│   └── styles/
│       └── globals.css
├── public/
├── README.md                   # Este arquivo
└── package.json
```

---

## 💻 Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Setup Local

```bash
cd ~/Claude/projects/experimental/backadmin

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

### Estrutura de Branches

- `main` - Branch de desenvolvimento (deploy em dev.lusio.market)
- Não há branch de produção ainda (projeto experimental)

---

## 🚀 Deploy

### Ambiente de Desenvolvimento

**URL:** https://dev.lusio.market/backadmin
**Servidor:** VPS 72.61.165.88
**Processo:** PM2 (`backadmin-dev`)
**Path:** `/var/www/dev/backadmin`

### Fazer Deploy

```bash
# Na máquina local
cd ~/Claude/projects/experimental/backadmin
git add .
git commit -m "feat: descrição"
git push origin main

# Deploy na VPS
ssh root@72.61.165.88 'cd /var/www/dev/backadmin && \
  git pull origin main && \
  /usr/bin/npm install && \
  /usr/bin/npm run build && \
  pm2 restart backadmin-dev'
```

### Verificar Status

```bash
ssh root@72.61.165.88 'pm2 list | grep backadmin'
ssh root@72.61.165.88 'pm2 logs backadmin-dev --lines 50'
```

---

## 📝 Changelog

### v0.3.0 - 2025-10-23

**🎨 Nova Visualização "Por Usuário"**
- Implementado agrupamento de pedidos por usuário
- Interface de lista com avatares e badges
- Navegação click-to-drill-down nos pedidos do usuário
- Breadcrumb para voltar à lista de usuários

**🔧 Filtros Integrados**
- Filtros de status agora afetam lista de usuários
- Filtros de data agora afetam lista de usuários
- Badge dinâmico mostra apenas pedidos filtrados
- Usuários sem pedidos nos filtros são ocultados

**📁 Arquivos modificados:**
- `src/app/dashboard/page.tsx` (+45 linhas)

**Commits:**
- `02ccc9d` - feat: Adicionar filtros de status e data na visualização por usuário
- `667e21a` - feat: Implementar visualização "Por Usuário" no dashboard

### v0.2.0 - 2025-10-22

**🚀 Remoção de Autenticação**
- Login desabilitado durante prototipagem
- Redirect direto para `/dashboard`

**🎨 Redesign do Layout**
- Menu horizontal (removida sidebar)
- Filtros multi-status com checkboxes
- Filtro por intervalo de datas

### v0.1.0 - Inicial

**⚡ Setup do Projeto**
- Next.js 14 + TypeScript
- Context API com dados mockados
- Modal de detalhes do pedido
- Badges de status do processo

---

## 🔗 Links Importantes

- **Dashboard Dev:** https://dev.lusio.market/backadmin
- **Repositório:** https://github.com/lusiopt/backadmin
- **Documentação Geral:** `~/Claude/docs/INDEX.md`
- **Jornada do Usuário:** `~/Claude/docs/projects/JORNADA-BACKADMIN.md`

---

## 👥 Time

- **Desenvolvimento:** Euclides Gomes + Claude Code
- **Design/UX:** Baseado em mockups HTML
- **API Backend:** Em desenvolvimento (empresa parceira)

---

## 📌 Próximos Passos

- [ ] Integração com API real (quando disponível)
- [ ] Sistema de autenticação OAuth 2.0
- [ ] Filtros adicionais (por tipo de documento, etc.)
- [ ] Exportação de relatórios
- [ ] Notificações de mudanças de status
- [ ] Dashboard com métricas e gráficos

---

**Última atualização:** 2025-10-23
**Mantido por:** Euclides Gomes + Claude Code

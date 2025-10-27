# Changelog - Backadmin

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.4.0] - 2025-10-27

### ✨ Adicionado

#### Sistema de Ordenação de Colunas
- Ordenação clicável em colunas da tabela (Nome, Email, Status, Criado Em)
- Indicadores visuais de ordenação com ícones:
  - `ArrowUpDown` (cinza) - Coluna não ordenada
  - `ArrowUp` (azul) - Ordenação ascendente
  - `ArrowDown` (azul) - Ordenação descendente
- Toggle automático entre ASC/DESC ao clicar na mesma coluna
- Reset para página 1 ao mudar ordenação

#### Sistema de Paginação
- Controle de itens por página (10, 25, 50, 100)
- Navegação entre páginas com botões "Anterior" e "Próxima"
- Numeração de páginas inteligente:
  - Sempre mostra primeira e última página
  - Mostra página atual e ±1 página adjacente
  - Reticências (...) para indicar gap entre páginas
- Contador de resultados: "Mostrando X a Y de Z resultados"
- Estados disabled em botões quando não há mais páginas

### 🔧 Modificado

#### Refatoração de Lógica de Filtragem
- `filteredServices` renomeado para `filteredAndSortedServices`
- Lógica de ordenação integrada ao useMemo de filtragem
- Novo useMemo `paginatedServices` para slice paginado
- Constante `totalPages` calculada automaticamente
- Handlers `handleSort()` e `renderSortIcon()` para controle de UI

#### Melhorias na UI da Lista
- Header da lista agora inclui seletor de itens por página
- Layout flex para alinhar título e controles
- Controles de paginação em rodapé com background cinza claro
- Botões de ordenação em cabeçalhos de coluna com hover state

### 🐛 Corrigido
- Referências a `filteredServices` atualizadas para `filteredAndSortedServices`
- Correção no `servicesByUser` para usar dados filtrados e ordenados

### 📊 Comportamentos
- Ordenação mantém filtros ativos
- Paginação reseta ao mudar ordenação
- Paginação reseta ao mudar quantidade de itens por página
- Indicador visual sempre mostra coluna e direção ativa

### 📝 Ícones Adicionados
- `ArrowUpDown` - Ordenação neutra
- `ArrowUp` - Ordenação ascendente
- `ArrowDown` - Ordenação descendente
- `ChevronLeft` - Botão "Anterior"
- `ChevronRight` - Botão "Próxima" (já existia)

### 📦 Arquivos Modificados
- `src/app/page.tsx`:
  - Adicionados states: `sortColumn`, `sortDirection`, `currentPage`, `itemsPerPage`
  - Implementadas funções: `handleSort()`, `renderSortIcon()`
  - Refatorado: `filteredServices` → `filteredAndSortedServices`
  - Adicionado: `paginatedServices` useMemo
  - Modificada tabela da view "Lista" com ordenação e paginação

---

## [0.3.0] - 2025-10-23

### ✨ Adicionado

#### Visualização "Por Usuário"
- Nova visualização que agrupa pedidos por usuário
- Lista de usuários com avatar (inicial do nome)
- Badge dinâmico mostrando quantidade de pedidos
- Click-to-drill-down: clicar no usuário mostra apenas seus pedidos
- Breadcrumb de navegação "← Voltar para todos os usuários"
- Alternância entre visualizações: 📁 Todos Processos / 👤 Por Usuário

#### Filtros Integrados na Visualização "Por Usuário"
- Filtro de busca por nome/email do usuário
- Filtro por status dos pedidos
- Filtro por intervalo de datas (criação)
- Combinação de múltiplos filtros (AND lógico)

### 🔧 Modificado
- `src/app/dashboard/page.tsx`:
  - Adicionado state `selectedUserId` para controle de drill-down
  - Implementado `userGroups` useMemo para agrupar services por user
  - Implementado `filteredUsers` useMemo com lógica de filtragem avançada
  - Modificado `filteredServices` para incluir filtro por usuário selecionado
  - Adicionada renderização condicional de tabelas (usuários vs processos)
  - Badge agora mostra `filteredCount` em vez de total de pedidos

### 📊 Comportamentos
- Usuários sem pedidos que atendam aos filtros são ocultados
- Badge mostra apenas pedidos que passam pelos filtros ativos
- Filtros funcionam em ambas visualizações (Todos Processos e Por Usuário)
- Ao trocar de visualização, `selectedUserId` é resetado

### 🐛 Corrigido
- Deploy em dev não estava atualizando corretamente (caminho npm corrigido)

### 📝 Commits
- `02ccc9d` - feat: Adicionar filtros de status e data na visualização por usuário
- `667e21a` - feat: Implementar visualização "Por Usuário" no dashboard

---

## [0.2.0] - 2025-10-22

### 🚀 Modificado

#### Autenticação Desabilitada
- Login removido temporariamente durante fase de prototipagem
- Redirect automático de `/` para `/dashboard`
- Comentado código de verificação de auth

#### Redesign do Layout
- Removida sidebar lateral
- Implementado menu horizontal fixo no topo
- Filtros reorganizados em layout horizontal

#### Sistema de Filtros
- Adicionado filtro multi-status com checkboxes
- Adicionado filtro por intervalo de datas (Data Inicial / Data Final)
- Validação de datas (início < fim)
- Botões "Limpar" em cada filtro
- Click outside para fechar dropdowns

### 📝 Commits
- `29c116c` - feat: Remover página de login e redirect direto para dashboard
- `63821ce` - Implementar filtro por intervalo de datas
- `5feebc7` - Remover sidebar e corrigir checkboxes do filtro de status
- `c0f17a5` - Redesign do layout: menu horizontal e filtro multi-status

---

## [0.1.0] - 2025-10 (Data exata não registrada)

### ✨ Adicionado

#### Setup Inicial do Projeto
- Inicializado projeto Next.js 14 com App Router
- Configurado TypeScript
- Configurado Tailwind CSS
- Adicionado Shadcn/UI components

#### Estrutura de Dados
- Criado `ServicesContext` para gerenciamento de estado global
- Criado arquivo `mockData.ts` com dados fictícios:
  - 5 usuários
  - 15 pedidos (3 por usuário)
  - Todos os status do fluxo representados
- Criado `types.ts` alinhado com schema Prisma

#### Interface Principal
- Página de dashboard (`/dashboard`)
- Tabela de processos com colunas:
  - ID (abreviado)
  - Nome do usuário
  - Email (link mailto)
  - Status (badge colorido)
  - Data de criação
  - Ações (botão Ver Detalhes)
- Busca textual por nome, email ou ID
- Hover states e cursor pointer

#### Componentes
- `ServiceModal` - Modal de detalhes do pedido
- `StatusBadge` - Badge visual para status dos pedidos
- Componentes Shadcn/UI (Input, Card, etc.)

#### Utilitários
- Função `formatDate()` para formatação de datas
- Helpers de busca e filtragem

---

## Roadmap Futuro

### v0.5.0 (Planejado)
- [ ] Estatísticas por usuário (quantos em cada status)
- [ ] Exportação de dados (CSV/Excel)

### v0.6.0 (Planejado)
- [ ] Integração com API real
- [ ] Sistema de autenticação OAuth 2.0
- [ ] Roles e permissões (admin, operador, visualizador)

### v1.0.0 (Futuro)
- [ ] Dashboard com gráficos e métricas
- [ ] Sistema de notificações
- [ ] Histórico de alterações (audit log)
- [ ] Upload de documentos
- [ ] Edição inline de status

---

## Tipos de Mudanças

- `✨ Adicionado` - Novas funcionalidades
- `🔧 Modificado` - Mudanças em funcionalidades existentes
- `🗑️ Removido` - Funcionalidades removidas
- `🐛 Corrigido` - Correções de bugs
- `🔒 Segurança` - Vulnerabilidades corrigidas
- `📊 Comportamentos` - Mudanças de comportamento sem código novo
- `📝 Commits` - Lista de commits da versão

---

**Mantido por:** Euclides Gomes + Claude Code

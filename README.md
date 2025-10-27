# 🚀 Lusio Backadmin - Sistema de Backoffice

> Interface administrativa moderna para gestão de pedidos de cidadania portuguesa

## 📊 Status do Desenvolvimento

```
Progresso: ██████████ 95%

✅ Dashboard com estatísticas
✅ Listagem de processos
✅ Filtros avançados
✅ Detalhes do pedido
✅ Ações do advogado
✅ Upload de documentos
✅ Sistema de notificações (UI)
✅ Sistema de permissões por role
✅ Permissões por fase do processo
✅ Página de configurações com tabs
✅ Mobile Responsiveness completa
✅ Brand header com logo
🔄 Integração com API real
⏳ Modo produção
```

## 🎨 Features Implementadas

### 1. Dashboard Completo
- **Estatísticas em tempo real** - Cards com métricas principais
- **Gráfico de distribuição** - Visualização por fase do processo
- **Atividade recente** - Últimas atualizações com timestamps
- **Ações rápidas** - Acesso direto às tarefas pendentes
- **Status do sistema** - Monitoramento de serviços

### 2. Gestão de Processos
- **Listagem completa** com paginação
- **Filtros múltiplos** (status, datas, busca, comunicações pendentes)
- **Filtro de Comunicações Pendentes** - toggle para mostrar apenas processos com mensagens não lidas
- **Visualização por usuário** ou todos
- **Detalhes expandidos** em modal
- **Timeline do processo** visual
- **Ordenação de colunas** (nome, email, status, data criação)
- **Paginação configurável** (10, 25, 50, 100 itens por página)

### 3. Ações do Advogado
- **Aprovar processo** com dados IRN
- **Recusar** com justificativa
- **Marcar como quase completo**
- **Formulários validados**
- **Confirmações de segurança**
- **Interface limpa** sem blocos de instruções

### 4. Sistema de Documentos
- **Upload drag & drop**
- **Categorização automática**
- **Validação de tipos** (PDF, JPG, PNG)
- **Preview de documentos**
- **Download individual**
- **Exclusão com confirmação**

### 5. Sistema de Permissões e Roles
- **4 perfis de usuário**: Admin, Backoffice, Advogada, Visualizador
- **Permissões granulares** por funcionalidade
- **Permissões por fase** do processo (Passo 1-8, status especiais)
- **Configuração dinâmica** via interface
- **Filtro automático** de processos por permissão de fase
- **Indicador visual** de permissões ativas

### 6. Página de Configurações
- **Interface com tabs** (Usuários e Perfis)
- **Gerenciamento de usuários** (criar, editar, deletar)
- **Configuração de permissões** por perfil
- **Botões "Selecionar Todos"** por categoria
- **Persistência** em localStorage
- **Preview de permissões** ativas

### 7. Tab Histórico
- **Timeline completa** de todos eventos do processo
- **Agregação automática** de:
  - Criação e atualizações do processo
  - Mudanças de status com detalhes
  - Mensagens (advogada e backoffice)
  - Uploads de documentos
  - Pagamentos (taxa e governo)
  - Submissão e atribuição
- **Ordenação cronológica** (mais recente primeiro)
- **Ícones e cores** diferenciados por tipo de evento
- **Data/hora formatada** para cada evento
- **Scroll vertical** para históricos longos

### 8. Interface Moderna
- **Design responsivo** mobile-first
- **Animações suaves** com Framer Motion
- **Cores e ícones intuitivos**
- **Feedback visual** em todas ações
- **Loading states** apropriados

### 9. Mobile Responsiveness (✨ NOVO)
- **Design totalmente responsivo** com suporte mobile-first
- **Brand Header** com logo e título da empresa
- **Breakpoints otimizados**: Mobile (<768px), Tablet (768-1023px), Desktop (≥1024px)
- **Componentes compactos** para telas pequenas
- **Filtros centralizados** em todos os dispositivos
- **Settings visível** em mobile e desktop
- **iOS Safari compatível** com fixes específicos para inputs
- **Touch-friendly** com áreas de toque otimizadas
- **Testado** em iPhone SE, iPhone 12 Pro, Samsung Galaxy S21, iPad Mini, Desktop 1920px

## 🛠️ Tecnologias

```javascript
{
  "framework": "Next.js 14.2.4",
  "linguagem": "TypeScript",
  "estilo": "TailwindCSS",
  "estado": "React Query + Context API",
  "api": "Axios",
  "data": "date-fns",
  "ícones": "Lucide React"
}
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard unificado (toggle entre visão geral e lista)
│   └── pedidos/
│       └── [id]/
│           ├── page.tsx   # Detalhes do pedido
│           └── components/
│               ├── LawyerActions.tsx
│               └── DocumentUpload.tsx
│
├── components/            # Componentes reutilizáveis
│   ├── stats/            # Cards de estatísticas
│   ├── charts/           # Gráficos
│   ├── tables/           # Tabelas e listagens
│   ├── pedidos/          # Componentes de pedidos
│   └── ui/               # Componentes base
│
├── lib/                  # Utilitários
│   ├── api.ts           # Cliente API
│   ├── types.ts         # TypeScript types
│   └── mockData.ts      # Dados mock (15 pedidos)
│
├── hooks/               # Custom hooks
│   └── useApi.ts       # Hooks para API
│
└── providers/          # Context providers
    └── QueryProvider.tsx
```

## 🚀 Como Rodar

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Rodar em modo dev
npm run dev

# Acessar
http://localhost:3001
```

### Configuração
```bash
# Copiar arquivo de ambiente
cp .env.local.example .env.local

# Configurar API backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🔌 Integração com Backend

### Estado Atual
- ✅ Usando dados **mock** (15 pedidos fictícios)
- ✅ API service **configurado** e pronto
- ✅ React Query **implementado** para cache
- ✅ Hooks customizados **criados**

### Para Conectar com API Real

1. **Configurar CORS no backend** (`luzio-api`)
```javascript
// No server.ts do luzio-api
this.app.register(cors, {
  origin: ['http://localhost:3001', 'https://backadmin.lusio.market']
});
```

2. **Substituir mock por hooks**
```typescript
// Antes (mock)
import { mockServices } from '@/lib/mockData';

// Depois (API real)
import { useServices } from '@/hooks/useApi';
const { data: services, isLoading } = useServices();
```

3. **Configurar autenticação**
```typescript
// Login
const { mutate: login } = useLogin();
login({ email, password });

// Token é gerenciado automaticamente
```

## 📱 Páginas Disponíveis

| Rota | Descrição | Status |
|------|-----------|--------|
| `/` | Redireciona para dashboard | ✅ |
| `/login` | Tela de login com autenticação | ✅ |
| `/pedidos/[id]` | Detalhes do pedido | ✅ |
| `/configuracoes` | Configurações (tabs: Usuários e Perfis) | ✅ |

## 🔐 Sistema de Permissões

### Perfis de Usuário

| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| **Admin** | Acesso total ao sistema | Todas as permissões + gerenciar usuários |
| **Backoffice** | Operação completa | Todas exceto gerenciar usuários |
| **Advogada** | Análise e decisão | Visualização, análise, mudança de status (Passo 7+) |
| **Visualizador** | Apenas leitura | Visualização de todas as fases |

### Permissões por Fase

O sistema implementa controle granular de acesso por fase do processo:

- **Passos 1-8**: Permissões individuais para cada passo
- **Status especiais**: Cancelado, Submetido, Em Análise, etc.
- **Filtro automático**: Processos são filtrados automaticamente baseado nas permissões do usuário

### Configuração de Permissões

Administradores podem:
- ✅ Criar/editar/deletar usuários
- ✅ Configurar permissões por perfil
- ✅ Selecionar/desmarcar permissões por categoria
- ✅ Visualizar permissões ativas em tempo real
- ✅ Resetar para configurações padrão

## 🎯 Próximos Passos

### Alta Prioridade
- [ ] Conectar com API real do backend
- [ ] Implementar autenticação JWT
- [ ] Adicionar WebSocket para real-time

### Média Prioridade
- [ ] Criar página de relatórios
- [ ] Implementar exportação PDF/Excel
- [ ] Adicionar filtros salvos

### Baixa Prioridade
- [ ] Modo dark/light
- [ ] Configurações do usuário
- [ ] Tour guiado para novos usuários

## 📝 Notas Importantes

### Segurança
- JWT tokens armazenados no localStorage
- Interceptors Axios para refresh automático
- Validação de formulários no frontend e backend

### Performance
- React Query cache de 1 minuto
- Lazy loading de componentes pesados
- Otimização de re-renders com memo

### UX/UI
- Feedback visual em todas ações
- Estados de loading apropriados
- Mensagens de erro claras
- Confirmações antes de ações destrutivas

## 📱 Mobile Responsiveness - Guia Técnico

### Implementação

O sistema foi desenvolvido com abordagem **mobile-first**, garantindo experiência otimizada em todos dispositivos.

#### Breakpoints Tailwind CSS

```javascript
{
  // Mobile (padrão)
  default: '< 640px',

  // Tablet
  sm: '≥ 640px',  // Small screens
  md: '≥ 768px',  // Medium screens
  lg: '≥ 1024px', // Large screens (Desktop)

  // Desktop grande
  xl: '≥ 1280px',
  '2xl': '≥ 1536px'
}
```

#### Componentes Responsivos

**1. Brand Header (`src/app/page.tsx:296-310`)**
```tsx
// Cabeçalho da marca com logo e título
<div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
  <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
    {/* Logo Lusio Cidadania */}
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg">
      <span className="text-2xl sm:text-3xl font-bold text-blue-600">L</span>
    </div>
  </div>
</div>
```

**Como substituir o logo placeholder:**
```tsx
// Substituir de:
<span className="text-2xl sm:text-3xl font-bold text-blue-600">L</span>

// Para:
<Image
  src="/logo-lusio.png"
  alt="Lusio Cidadania"
  width={48}
  height={48}
  className="w-10 h-10 sm:w-12 sm:h-12"
/>
```

**2. ProfileSwitcher Compacto (`src/components/ProfileSwitcher.tsx:54-66`)**
```tsx
// Mobile: ícones menores, sem texto "Perfil Atual"
<button className="px-2 sm:px-3 py-1.5 sm:py-2">
  <RoleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
  <span className="text-xs opacity-75 hidden sm:inline">Perfil Atual</span>
  <span className="font-semibold text-xs sm:text-sm">{roleLabels[user.role]}</span>
</button>
```

**3. Settings Button Visível (`src/app/page.tsx:393-402`)**
```tsx
// Removido: hidden sm:block
// Adicionado: paddings responsivos
<button className="p-1 sm:p-1.5 md:p-2 rounded-lg">
  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
</button>
```

**4. Filtros Centralizados (`src/app/page.tsx:440`)**
```tsx
// Centralizado em mobile e desktop
<div className="flex flex-wrap gap-2 justify-center">
  {/* Botões de filtro */}
</div>
```

#### Fixes para iOS Safari

**Problema:** Inputs `type="date"` transbordavam do container no Safari/iOS

**Solução:** (`src/app/globals.css:122-143`)
```css
/* Fix para inputs type="date" no Safari/iOS */
input[type="date"] {
  min-width: 0 !important;
  max-width: 100% !important;
}

/* Controla o ícone do calendário */
input[type="date"]::-webkit-calendar-picker-indicator {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  flex-shrink: 0;
}

/* Previne zoom automático em mobile */
@media screen and (max-width: 768px) {
  input[type="date"] {
    font-size: 16px !important;
  }
}
```

#### Testes de Responsividade

**Script automatizado:** `test-responsive-final.js`

```bash
# Rodar testes em múltiplos dispositivos
node test-responsive-final.js

# Dispositivos testados:
# - iPhone SE (375x667)
# - iPhone 12 Pro (390x844)
# - Samsung Galaxy S21 (360x800)
# - iPad Mini (768x1024)
# - Desktop 1920 (1920x1080)

# Screenshots gerados em: screenshots/final-*
```

**Testes manuais:**
- ✅ Navegação mobile (hamburger menu)
- ✅ Cards responsivos vs tabelas
- ✅ Modais em telas pequenas
- ✅ Inputs e formulários touch-friendly
- ✅ Botões com área de toque adequada (mínimo 44px)

#### Estrutura de Layout

**Mobile (<1024px):**
- Cards verticais para processos
- Menu hamburger
- Filtros empilhados
- Ícones compactos
- ProfileSwitcher sem texto adicional

**Desktop (≥1024px):**
- Tabela completa de processos
- Menu horizontal
- Filtros em linha
- Ícones tamanho normal
- ProfileSwitcher com texto completo

### Customização

Para ajustar breakpoints do projeto:

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',  // Ponto principal mobile → desktop
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

## 🤝 Integração com Equipe Externa

O backend (`luzio-api`) é mantido por equipe terceirizada.

**NÃO MODIFICAR:**
- `/projects/third-party/cidadania/luzio-api/`
- `/projects/third-party/cidadania/luzio-front/`

**Quando a API estiver pronta:**
1. Receberemos endpoint de staging
2. Credenciais de teste
3. Documentação de webhooks
4. Fazer integração gradual

## 🐛 Debug

```bash
# Ver logs do React Query
# DevTools aparecem no canto inferior direito em dev

# Testar API manualmente
curl http://localhost:3000/service \
  -H "Authorization: Bearer TOKEN"

# Ver estado do React Query
# Abrir console do navegador
window.__REACT_QUERY_STATE__
```

## 📞 Suporte

**Desenvolvedor:** Euclides Gomes + Claude Code
**Última Atualização:** 27 Outubro 2025
**Versão:** v0.6.0

---

🎉 **Sistema 95% completo com mobile responsiveness total!**

## 🏷️ Versões

- **v0.6.0** (atual - 27/10/2025)
  - 📱 **Mobile Responsiveness Completa**
  - Brand header com logo Lusio Cidadania
  - Settings visível em mobile
  - ProfileSwitcher compacto
  - Filtros centralizados em todos dispositivos
  - Fixes específicos para iOS Safari (inputs date)
  - Testado em 5 dispositivos diferentes
  - Deploy em dev: https://dev.lusio.market:3004/backadmin

- **v0.5.1** (27/10/2025)
  - Filtro de Comunicações Pendentes
  - Toggle visual com badge dinâmico
  - Combinação com outros filtros (AND lógico)

- **v0.5.0** (27/10/2025)
  - Sistema completo de roles e permissões (RBAC)
  - 4 perfis: Admin, Backoffice, Advogada, Visualizador
  - ProfileSwitcher e PermissionIndicator
  - Controle de UI baseado em permissões

- **v0.4.0**
  - Sistema de ordenação de colunas
  - Paginação completa

- **v0.3.0**
  - Visualização "Por Usuário"
  - Filtros de status e data

- **v0.2.0-config-consolidation**
  - Sistema de configurações consolidado com tabs
  - Permissões por fase implementadas
  - Botões "Selecionar Todos" por categoria

- **v0.1.0**
  - Versão inicial do dashboard
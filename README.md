# 🚀 Lusio Backadmin - Sistema de Backoffice

> Interface administrativa moderna para gestão de pedidos de cidadania portuguesa

## 📊 Status do Desenvolvimento

```
Progresso: ██████████ 90%

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
- **Filtros múltiplos** (status, data, busca)
- **Visualização por usuário** ou todos
- **Detalhes expandidos** em modal
- **Timeline do processo** visual

### 3. Ações do Advogado
- **Aprovar processo** com dados IRN
- **Recusar** com justificativa
- **Marcar como quase completo**
- **Formulários validados**
- **Confirmações de segurança**

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

### 7. Interface Moderna
- **Design responsivo** mobile-first
- **Animações suaves** com Framer Motion
- **Cores e ícones intuitivos**
- **Feedback visual** em todas ações
- **Loading states** apropriados

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
**Versão:** v0.2.0-config-consolidation

---

🎉 **Sistema 90% completo com sistema de permissões robusto!**

## 🏷️ Versões

- **v0.2.0-config-consolidation** (atual)
  - Sistema de configurações consolidado com tabs
  - Permissões por fase implementadas
  - Botões "Selecionar Todos" por categoria

- **v1.0.0-stable**
  - Versão inicial estável do dashboard
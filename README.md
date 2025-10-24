# 🚀 Lusio Backadmin - Sistema de Backoffice

> Interface administrativa moderna para gestão de pedidos de cidadania portuguesa

## 📊 Status do Desenvolvimento

```
Progresso: ████████░░ 85%

✅ Dashboard com estatísticas
✅ Listagem de processos
✅ Filtros avançados
✅ Detalhes do pedido
✅ Ações do advogado
✅ Upload de documentos
✅ Sistema de notificações (UI)
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

### 5. Interface Moderna
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
| `/dashboard` | Dashboard unificado (toggle visão geral/lista) | ✅ |
| `/pedidos/[id]` | Detalhes do pedido | ✅ |
| `/login` | Tela de login | 🔄 |

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
**Última Atualização:** 24 Outubro 2025

---

🎉 **Sistema 85% completo e pronto para testes com dados mock!**
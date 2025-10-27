# 📨 Sistema de Comunicações - Documentação Técnica

**Data:** 27 Outubro 2025
**Status:** 🟡 Parcialmente Implementado (40%)
**Última Atualização:** Claude Code Session

---

## 🎯 Objetivo

Criar um sistema de mensagens/chat entre **Advogada** e **Backoffice** para comunicação sobre processos de cidadania. Substituir a aba "Notas" por "Comunicações" no modal de detalhes do pedido.

---

## ✅ O Que Já Foi Implementado

### 1. Tipos TypeScript (`src/lib/types.ts`)

```typescript
// Novos tipos adicionados (linhas 383-435):

export enum MessageType {
  SYSTEM = "system",
  USER = "user",
  LAWYER_REQUEST = "lawyer_request",      // Solicitação da advogada
  BACKOFFICE_RESPONSE = "backoffice_response", // Resposta do backoffice
}

export enum MessageStatus {
  UNREAD = "unread",
  READ = "read",
}

export interface Message {
  id: string;
  serviceId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  type: MessageType;
  content: string;
  status: MessageStatus;
  createdAt: Date | string;
  readAt?: Date | string | null;
  requestType?: "document" | "clarification" | "other";
  documentType?: DocumentType | string;
  metadata?: {
    actionType?: "approve" | "refuse" | "almost";
    previousStatus?: ServiceStatus | string;
    newStatus?: ServiceStatus | string;
  };
}

export interface MessageThread {
  serviceId: string;
  messages: Message[];
  unreadCount: number;
  lastMessageAt: Date | string;
}

export interface CreateMessageInput {
  serviceId: string;
  content: string;
  type?: MessageType;
  requestType?: "document" | "clarification" | "other";
  documentType?: DocumentType | string;
}

// Service type atualizado (linha 149):
export interface Service {
  // ... campos existentes ...
  messages?: Message[]; // ✅ NOVO CAMPO ADICIONADO
}
```

### 2. Componente MessageThread (`src/components/MessageThread.tsx`)

**Arquivo criado:** ✅ Completo
**Funcionalidades:**
- Interface de chat estilo timeline
- Envio de mensagens com Enter (Shift+Enter para nova linha)
- Botões de tipo de solicitação para advogada (Documento, Esclarecimento, Outro)
- Indicador visual de mensagens não lidas
- Auto-scroll para última mensagem
- Diferenciação visual por role (cores diferentes)
- Ícones por tipo de mensagem

**Props:**
```typescript
interface MessageThreadProps {
  serviceId: string;
  messages: Message[];
  onSendMessage: (input: CreateMessageInput) => void;
}
```

### 3. Modal de Detalhes (`src/components/pedidos/service-modal.tsx`)

**Alterações feitas:**
- ✅ Linha 149: Tab renomeada de "Notas" para "Comunicações"
  ```typescript
  <TabsTrigger value="comunicacoes" icon="💬">Comunicações</TabsTrigger>
  ```
- ✅ Linhas 359-362: TabContent value atualizado
  ```typescript
  <TabsContent value="comunicacoes">
    <p className="text-sm text-gray-500 py-8 text-center">Comunicações em desenvolvimento</p>
  </TabsContent>
  ```

**Status:** Tab renomeada, mas conteúdo ainda é placeholder.

---

## 🔄 O Que Falta Implementar

### PASSO 1: Adicionar Mensagens Mock
**Arquivo:** `src/lib/mockData.ts`

Adicionar mensagens de exemplo em alguns serviços:

```typescript
// Exemplo de mensagens para o serviço s4 (João Pedro - Passo 7 Quase):
messages: [
  {
    id: "msg1",
    serviceId: "s4",
    senderId: "sys3", // Advogada
    senderName: "Dra. Ana Advogada",
    senderRole: UserRole.ADVOGADA,
    type: MessageType.LAWYER_REQUEST,
    content: "A certidão de nascimento está ilegível. Por favor, solicitar ao cliente uma nova cópia com melhor qualidade.",
    status: MessageStatus.UNREAD,
    createdAt: "2025-01-25T14:30:00Z",
    requestType: "document",
    documentType: DocumentType.BIRTH_CERTIFICATE,
  },
  {
    id: "msg2",
    serviceId: "s4",
    senderId: "sys2", // Backoffice
    senderName: "Patricia Backoffice",
    senderRole: UserRole.BACKOFFICE,
    type: MessageType.BACKOFFICE_RESPONSE,
    content: "Ok, vou contactar o cliente hoje ainda e solicitar novo documento.",
    status: MessageStatus.READ,
    createdAt: "2025-01-25T15:15:00Z",
  },
]
```

### PASSO 2: Integrar MessageThread no Modal
**Arquivo:** `src/components/pedidos/service-modal.tsx`

**Linha 360-362 - Substituir o placeholder por:**

```typescript
import { MessageThread } from "@/components/MessageThread";

// No início do componente, adicionar import dos tipos:
import { CreateMessageInput, MessageType } from "@/lib/types";

// Dentro do componente ServiceModal, adicionar handler:
const handleSendMessage = (input: CreateMessageInput) => {
  const { user } = useAuth(); // Já existe no componente

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    serviceId: service.id,
    senderId: user!.id,
    senderName: user!.fullName,
    senderRole: user!.role,
    type: input.type || MessageType.USER,
    content: input.content,
    status: MessageStatus.UNREAD,
    createdAt: new Date().toISOString(),
    requestType: input.requestType,
    documentType: input.documentType,
  };

  // Adicionar mensagem ao serviço
  updateService(service.id, {
    messages: [...(service.messages || []), newMessage]
  });
};

// Substituir o TabsContent:
<TabsContent value="comunicacoes">
  <MessageThread
    serviceId={service.id}
    messages={service.messages || []}
    onSendMessage={handleSendMessage}
  />
</TabsContent>
```

### PASSO 3: Conectar Formulário "Quase Lá"
**Arquivo:** `src/components/pedidos/service-modal.tsx`

**Função handleAlmost (linhas 71-83) - Modificar para criar mensagem:**

```typescript
const handleAlmost = () => {
  if (!almostNote.trim()) {
    alert("Explique o que falta");
    return;
  }

  // Criar mensagem da advogada
  const { user } = useAuth();
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    serviceId: service.id,
    senderId: user!.id,
    senderName: user!.fullName,
    senderRole: user!.role,
    type: MessageType.LAWYER_REQUEST,
    content: almostNote,
    status: MessageStatus.UNREAD,
    createdAt: new Date().toISOString(),
    requestType: "other", // Pode ser selecionado com dropdown
    metadata: {
      actionType: "almost",
      previousStatus: service.status,
      newStatus: ServiceStatus.STEP_7_ALMOST,
    }
  };

  updateService(service.id, {
    status: ServiceStatus.STEP_7_ALMOST,
    almostJustification: almostNote,
    messages: [...(service.messages || []), newMessage]
  });

  setShowAlmostModal(false);
  setAlmostNote("");
  alert("⚠️ Status alterado e mensagem enviada ao backoffice");
};
```

### PASSO 4: Indicador de Mensagens Não Lidas
**Arquivo:** `src/components/pedidos/service-modal.tsx`

**Na linha 149, adicionar badge:**

```typescript
<TabsTrigger value="comunicacoes" icon="💬">
  Comunicações
  {service.messages && service.messages.some(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id) && (
    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
      {service.messages.filter(m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id).length}
    </span>
  )}
</TabsTrigger>
```

### PASSO 5: Marcar Mensagens como Lidas
**Arquivo:** `src/components/pedidos/service-modal.tsx`

**Adicionar useEffect para marcar mensagens como lidas:**

```typescript
// Quando a tab de comunicações é aberta
useEffect(() => {
  if (activeTab === "comunicacoes" && service.messages) {
    const { user } = useAuth();
    const unreadMessages = service.messages.filter(
      m => m.status === MessageStatus.UNREAD && m.senderId !== user?.id
    );

    if (unreadMessages.length > 0) {
      const updatedMessages = service.messages.map(m =>
        m.status === MessageStatus.UNREAD && m.senderId !== user?.id
          ? { ...m, status: MessageStatus.READ, readAt: new Date().toISOString() }
          : m
      );

      updateService(service.id, { messages: updatedMessages });
    }
  }
}, [activeTab, service.id]);
```

---

## 🧪 Como Testar

1. **Abrir aplicação:** http://localhost:3001
2. **Fazer login** (qualquer usuário do mockSystemUsers)
3. **Clicar em "Ver Detalhes"** de um processo
4. **Ir na tab "Comunicações"**
5. **Verificar:**
   - Chat está vazio inicialmente (ou com mensagens mock se implementadas)
   - Campo de texto funciona
   - Botão "Enviar" funciona
   - Mensagens aparecem em ordem cronológica
   - Cores diferentes para advogada vs backoffice

6. **Teste do "Quase Lá":**
   - Ir na tab "Ações"
   - Clicar "⚠️ Quase Lá"
   - Escrever mensagem
   - Enviar
   - Voltar na tab "Comunicações"
   - Verificar se mensagem apareceu

---

## 📁 Arquivos Modificados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `src/lib/types.ts` | ✅ Completo | Tipos Message, MessageType, MessageStatus |
| `src/components/MessageThread.tsx` | ✅ Criado | Componente de chat |
| `src/components/pedidos/service-modal.tsx` | 🟡 Parcial | Tab renomeada, falta integrar |
| `src/lib/mockData.ts` | ❌ Pendente | Adicionar mensagens mock |

---

## 🚀 Próximos Passos (Ordem)

1. ✅ **Adicionar mensagens mock** em 2-3 serviços
2. ✅ **Integrar MessageThread** na tab Comunicações
3. ✅ **Conectar formulário "Quase Lá"** para criar mensagens
4. ✅ **Adicionar indicador** de não lidas na tab
5. ✅ **Testar** tudo funcionando
6. ✅ **Commit e Deploy** para VPS

---

## ⚠️ Notas Importantes

- **NÃO modificar** nada fora desses arquivos para não quebrar funcionalidades existentes
- **Testar localmente** antes de fazer deploy
- **Usar tipos corretos** (Message, MessageType, MessageStatus) importados de `@/lib/types`
- **useAuth()** já existe no modal - reutilizar
- **updateService()** já existe no modal - reutilizar
- **Messages devem ser ordenadas** por `createdAt` no MessageThread (já implementado)

---

## 🔗 Contexto Adicional

**Sistema existente:**
- ServicesContext gerencia estado dos serviços
- AuthContext gerencia usuário logado e permissões
- mockData.ts tem 15 serviços de exemplo
- Modal service-modal.tsx já tem tabs funcionando (Dados, Documentos, Timeline, Ações)

**Workflow atual "Quase Lá":**
1. Advogada clica "⚠️ Quase Lá"
2. Abre popup com textarea
3. Advogada escreve o que falta
4. Salva em `almostJustification`
5. Muda status para `STEP_7_ALMOST`

**Workflow novo desejado:**
1. Advogada clica "⚠️ Quase Lá"
2. Abre popup com textarea
3. Advogada escreve o que falta
4. Salva em `almostJustification` **E cria mensagem**
5. Muda status para `STEP_7_ALMOST`
6. Backoffice vê notificação na tab "Comunicações"
7. Backoffice responde no chat
8. Histórico fica salvo como timeline

---

**FIM DA DOCUMENTAÇÃO**

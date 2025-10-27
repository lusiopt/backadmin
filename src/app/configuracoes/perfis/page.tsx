"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, Permission, ROLE_PERMISSIONS } from "@/lib/types";

interface RolePermissionConfig {
  role: UserRole;
  permissions: Permission[];
}

const PERMISSION_LABELS: Record<Permission, { label: string; description: string; category: string }> = {
  [Permission.VIEW_SERVICES]: {
    label: "Ver Serviços",
    description: "Visualizar lista de serviços",
    category: "Serviços"
  },
  [Permission.CREATE_SERVICE]: {
    label: "Criar Serviço",
    description: "Criar novos serviços",
    category: "Serviços"
  },
  [Permission.EDIT_SERVICE]: {
    label: "Editar Serviço",
    description: "Editar serviços existentes",
    category: "Serviços"
  },
  [Permission.DELETE_SERVICE]: {
    label: "Deletar Serviço",
    description: "Remover serviços",
    category: "Serviços"
  },
  [Permission.CHANGE_STATUS]: {
    label: "Mudar Status",
    description: "Alterar status dos serviços",
    category: "Serviços"
  },
  [Permission.VIEW_DOCUMENTS]: {
    label: "Ver Documentos",
    description: "Visualizar documentos",
    category: "Documentos"
  },
  [Permission.UPLOAD_DOCUMENTS]: {
    label: "Enviar Documentos",
    description: "Fazer upload de documentos",
    category: "Documentos"
  },
  [Permission.DELETE_DOCUMENTS]: {
    label: "Deletar Documentos",
    description: "Remover documentos",
    category: "Documentos"
  },
  [Permission.VIEW_USERS]: {
    label: "Ver Usuários",
    description: "Visualizar lista de usuários",
    category: "Usuários"
  },
  [Permission.MANAGE_USERS]: {
    label: "Gerenciar Usuários",
    description: "Criar, editar e remover usuários",
    category: "Usuários"
  },
  [Permission.VIEW_ALL_SERVICES]: {
    label: "Ver Todos Serviços",
    description: "Ver serviços de todos os usuários",
    category: "Especial"
  },
  [Permission.ASSIGN_SERVICES]: {
    label: "Atribuir Serviços",
    description: "Atribuir serviços a outros usuários",
    category: "Especial"
  },
  [Permission.VIEW_STATISTICS]: {
    label: "Ver Estatísticas",
    description: "Acessar dashboards e estatísticas",
    category: "Especial"
  },
  [Permission.EXPORT_DATA]: {
    label: "Exportar Dados",
    description: "Exportar relatórios e dados",
    category: "Especial"
  },
  // Phase-specific permissions
  [Permission.ACCESS_STEP_1]: {
    label: "Passo 1",
    description: "Acesso a processos no Passo 1",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_2]: {
    label: "Passo 2",
    description: "Acesso a processos no Passo 2",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_3]: {
    label: "Passo 3",
    description: "Acesso a processos no Passo 3",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_4]: {
    label: "Passo 4",
    description: "Acesso a processos no Passo 4",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_5]: {
    label: "Passo 5",
    description: "Acesso a processos no Passo 5",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_6]: {
    label: "Passo 6",
    description: "Acesso a processos no Passo 6",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_7]: {
    label: "Passo 7",
    description: "Acesso a processos no Passo 7",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_8]: {
    label: "Passo 8",
    description: "Acesso a processos no Passo 8",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_CANCELLED]: {
    label: "Cancelado",
    description: "Acesso a processos cancelados",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_SUBMITTED]: {
    label: "Submetido",
    description: "Acesso a processos submetidos",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_UNDER_ANALYSIS]: {
    label: "Em Análise",
    description: "Acesso a processos em análise",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_WAITING_RESPONSE]: {
    label: "Aguardando Resposta",
    description: "Acesso a processos aguardando resposta",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_FOR_DECISION]: {
    label: "Para Decisão",
    description: "Acesso a processos para decisão",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_COMPLETED]: {
    label: "Concluído",
    description: "Acesso a processos concluídos",
    category: "Acesso por Fase"
  },
};

const ROLE_LABELS: Record<UserRole, { label: string; description: string }> = {
  [UserRole.ADMIN]: {
    label: "Admin",
    description: "Acesso total ao sistema"
  },
  [UserRole.BACKOFFICE]: {
    label: "Backoffice",
    description: "Operação completa, exceto gerenciar usuários"
  },
  [UserRole.ADVOGADA]: {
    label: "Advogada",
    description: "Visualização, análise e mudança de status"
  },
  [UserRole.VISUALIZADOR]: {
    label: "Visualizador",
    description: "Apenas leitura"
  },
};

export default function PerfilConfigPage() {
  const { user, hasPermission } = useAuth();
  const [configs, setConfigs] = useState<Record<UserRole, Permission[]>>(ROLE_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.BACKOFFICE);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Carregar configurações do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("role_permissions_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfigs(parsed);
      } catch (e) {
        console.error("Error loading permissions config:", e);
      }
    }
  }, []);

  // Verificar se usuário tem permissão
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  const togglePermission = (role: UserRole, permission: Permission) => {
    setConfigs(prev => {
      const rolePerms = prev[role] || [];
      const hasPermission = rolePerms.includes(permission);

      return {
        ...prev,
        [role]: hasPermission
          ? rolePerms.filter(p => p !== permission)
          : [...rolePerms, permission]
      };
    });
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const saveConfig = () => {
    localStorage.setItem("role_permissions_config", JSON.stringify(configs));
    setHasChanges(false);
    setSaveSuccess(true);

    // Esconder mensagem de sucesso após 3 segundos
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const resetToDefault = () => {
    if (confirm("Tem certeza que deseja resetar para as permissões padrão?")) {
      setConfigs(ROLE_PERMISSIONS);
      localStorage.removeItem("role_permissions_config");
      setHasChanges(false);
      setSaveSuccess(false);
    }
  };

  // Agrupar permissões por categoria
  const permissionsByCategory = Object.entries(PERMISSION_LABELS).reduce((acc, [perm, data]) => {
    const category = data.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm as Permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const rolePermissions = configs[selectedRole] || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuração de Perfis e Permissões
          </h1>
          <p className="text-gray-600">
            Customize as permissões de cada perfil de usuário do sistema.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Seleção de Perfil */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfis</h2>
              <div className="space-y-2">
                {Object.entries(ROLE_LABELS).map(([role, data]) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role as UserRole)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedRole === role
                        ? "bg-blue-100 text-blue-900 font-semibold"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">{data.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {configs[role as UserRole]?.length || 0} permissões
                    </div>
                  </button>
                ))}
              </div>

              {/* Botões de Ação */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={saveConfig}
                  disabled={!hasChanges}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    hasChanges
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Salvar Alterações
                </button>
                <button
                  onClick={resetToDefault}
                  className="w-full px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Resetar Padrão
                </button>
              </div>

              {saveSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
                  Configurações salvas com sucesso!
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Permissões */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {ROLE_LABELS[selectedRole].label}
                </h2>
                <p className="text-gray-600 mt-1">
                  {ROLE_LABELS[selectedRole].description}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Total: {rolePermissions.length} de {Object.keys(Permission).length} permissões
                </div>
              </div>

              {/* Permissões por Categoria */}
              <div className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {permissions.map((permission) => {
                        const isChecked = rolePermissions.includes(permission);
                        const info = PERMISSION_LABELS[permission];

                        return (
                          <label
                            key={permission}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              isChecked
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-gray-50 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(selectedRole, permission)}
                              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {info.label}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {info.description}
                              </div>
                              <div className="text-xs text-gray-400 mt-1 font-mono">
                                {permission}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

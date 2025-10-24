"use client";

import { StatsCards } from "@/components/stats/StatsCards";
import { ProcessChart } from "@/components/charts/ProcessChart";
import { RecentActivity } from "@/components/tables/RecentActivity";
import { Card } from "@/components/ui/card";
import { mockServices } from "@/lib/mockData";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Bell,
  Search,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function OverviewPage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Aqui virá a atualização real quando conectar com API
    }, 1000);
  };

  // Quick actions
  const quickActions = [
    {
      label: "Processos Pendentes",
      count: mockServices.filter(s => s.status === "Passo 7 Esperando").length,
      icon: <Bell className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-700",
      href: "/dashboard?status=STEP_7_WAITING"
    },
    {
      label: "Aprovar Processos",
      count: mockServices.filter(s => s.status === "Passo 7 Esperando").length,
      icon: <ChevronRight className="w-5 h-5" />,
      color: "bg-green-100 text-green-700",
      href: "/pedidos/aprovar"
    },
    {
      label: "Documentos Faltantes",
      count: mockServices.filter(s => s.status === "Passo 7 Recusado").length,
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-red-100 text-red-700",
      href: "/dashboard?status=STEP_7_RECUSED"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Painel de Controle
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Visão geral do sistema de cidadania
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Buscar processo..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* Actions */}
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                disabled={isRefreshing}
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>

              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>

              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Download className="w-5 h-5 text-gray-600" />
              </button>

              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              {/* User */}
              <div className="flex items-center gap-3 ml-3 pl-3 border-l border-gray-200">
                <div className="relative">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    E
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">
                    Euclides
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-8">
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {action.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {action.count}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProcessChart />
          <RecentActivity />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Pending Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ações Pendentes
            </h3>
            <div className="space-y-3">
              {[
                { label: "Documentos para revisar", count: 8, urgent: true },
                { label: "Processos aguardando IRN", count: 3, urgent: false },
                { label: "Pagamentos pendentes", count: 5, urgent: false },
                { label: "Emails não respondidos", count: 2, urgent: true },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.urgent
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.count}
                    </span>
                    {item.urgent && (
                      <span className="text-red-500 text-xs">Urgente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* System Health */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status do Sistema
            </h3>
            <div className="space-y-4">
              {[
                { service: "API Backend", status: "online", latency: "45ms" },
                { service: "Base de Dados", status: "online", latency: "12ms" },
                { service: "Stripe", status: "online", latency: "120ms" },
                { service: "Email Service", status: "online", latency: "88ms" },
                { service: "File Storage", status: "online", latency: "67ms" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-700">
                      {item.service}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {item.latency}
                    </span>
                    <span className={`text-xs font-medium ${
                      item.status === 'online' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Última verificação: há 2 minutos
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver detalhes
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
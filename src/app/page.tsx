"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/contexts/ServicesContext";
import { Service, ServiceStatus, ServiceWithRelations, Permission } from "@/lib/types";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { ServiceModal } from "@/components/pedidos/service-modal";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { filterServicesByPhasePermissions } from "@/lib/permissions";
import { StatsCards } from "@/components/stats/StatsCards";
import { ProcessChart } from "@/components/charts/ProcessChart";
import { RecentActivity } from "@/components/tables/RecentActivity";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  Calendar,
  Filter,
  RefreshCw,
  Settings,
  Search,
  ChevronRight,
  Users as UsersIcon,
  FileText,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  Shield,
  MessageSquare
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { services } = useServices();
  const { user, hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"dashboard" | "list" | "by-user">("dashboard");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Função auxiliar para contar mensagens não lidas de um serviço
  const getUnreadMessagesCount = (service: Service): number => {
    if (!service.messages || !user) return 0;
    return service.messages.filter(
      (m) => m.status === "unread" && m.senderId !== user.id
    ).length;
  };

  // Calcular total de mensagens não lidas (todas as comunicações)
  const totalUnreadMessages = useMemo(() => {
    return services.reduce((total, service) => {
      return total + getUnreadMessagesCount(service);
    }, 0);
  }, [services, user]);

  // Sorting
  const [sortColumn, setSortColumn] = useState<'name' | 'email' | 'status' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Handle sorting
  const handleSort = (column: 'name' | 'email' | 'status' | 'createdAt') => {
    if (sortColumn === column) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Render sort icon
  const renderSortIcon = (column: 'name' | 'email' | 'status' | 'createdAt') => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  // Filter services by phase permissions FIRST
  const accessibleServices = useMemo(() => {
    return filterServicesByPhasePermissions(services, hasPermission);
  }, [services, hasPermission]);

  // Get unique statuses from accessible services only
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(accessibleServices.map((s) => s.status).filter(Boolean));
    return Array.from(statuses);
  }, [accessibleServices]);

  // Filtered and sorted services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = accessibleServices.filter((service) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          service.user.fullName.toLowerCase().includes(searchLower) ||
          service.user.email.toLowerCase().includes(searchLower) ||
          service.id.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatuses.length > 0) {
        if (!service.status || !selectedStatuses.includes(service.status)) {
          return false;
        }
      }

      // Date filter
      if (dateFrom || dateTo) {
        const serviceDate = new Date(service.createdAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (serviceDate < fromDate) return false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (serviceDate > toDate) return false;
        }
      }

      return true;
    });

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortColumn) {
          case 'name':
            aValue = a.user.fullName.toLowerCase();
            bValue = b.user.fullName.toLowerCase();
            break;
          case 'email':
            aValue = a.user.email.toLowerCase();
            bValue = b.user.email.toLowerCase();
            break;
          case 'status':
            aValue = a.status?.toLowerCase() || '';
            bValue = b.status?.toLowerCase() || '';
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [accessibleServices, search, selectedStatuses, dateFrom, dateTo, sortColumn, sortDirection]);

  // Paginated services for list view
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedServices.slice(startIndex, endIndex);
  }, [filteredAndSortedServices, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage);

  // Group services by user
  const servicesByUser = useMemo(() => {
    const grouped = new Map<string, ServiceWithRelations[]>();

    filteredAndSortedServices.forEach((service) => {
      const userId = service.user.id;
      if (!grouped.has(userId)) {
        grouped.set(userId, []);
      }
      grouped.get(userId)!.push(service as ServiceWithRelations);
    });

    return Array.from(grouped.entries()).map(([userId, userServices]) => ({
      user: userServices[0].user,
      services: userServices,
      totalServices: userServices.length,
    }));
  }, [filteredAndSortedServices]);

  // Quick actions (using accessible services only)
  const quickActions = [
    {
      label: "Processos Pendentes",
      count: accessibleServices.filter(s => s.status === "Passo 7 Esperando").length,
      icon: <Bell className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-700",
      action: () => {
        setSelectedStatuses(["Passo 7 Esperando"]);
        setViewMode("list");
      }
    },
    {
      label: "Aprovar Processos",
      count: accessibleServices.filter(s => s.status === "Passo 7 Esperando").length,
      icon: <ChevronRight className="w-5 h-5" />,
      color: "bg-green-100 text-green-700",
      action: () => {
        setSelectedStatuses(["Passo 7 Esperando"]);
        setViewMode("list");
      }
    },
    {
      label: "Documentos Faltantes",
      count: accessibleServices.filter(s => s.status === "Passo 7 Recusado").length,
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-red-100 text-red-700",
      action: () => {
        setSelectedStatuses(["Passo 7 Recusado"]);
        setViewMode("list");
      }
    },
  ];

  const handleServiceClick = (service: ServiceWithRelations) => {
    setSelectedService(service);
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Gestão - Lusio Cidadania
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {viewMode === "dashboard" ? "Visão geral do sistema" : viewMode === "list" ? "Lista de processos" : "Agrupado por usuário"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode("dashboard")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === "dashboard"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    📊 Dashboard
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    📋 Lista
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("by-user")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === "by-user"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    👤 Por Usuário
                  </span>
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                disabled={isRefreshing}
                title="Atualizar dados"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>

              {/* Notifications Bell */}
              <button
                onClick={() => {
                  // TODO: Abrir painel de notificações
                  setViewMode("list");
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                title={`${totalUnreadMessages} notificação${totalUnreadMessages !== 1 ? 'ões' : ''} não lida${totalUnreadMessages !== 1 ? 's' : ''}`}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                    {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                  </span>
                )}
              </button>

              {/* Settings - Only for admins */}
              {hasPermission(Permission.MANAGE_USERS) && (
                <button
                  onClick={() => router.push("/configuracoes")}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Configurações"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {/* User Switcher (Shows current user and role) */}
              <div className="ml-3 pl-3 border-l border-gray-200">
                <ProfileSwitcher />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, email ou ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowStatusFilter(!showStatusFilter)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    📊 Status
                    {selectedStatuses.length > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {selectedStatuses.length}
                      </span>
                    )}
                  </button>

                  {showStatusFilter && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
                      <div className="space-y-2">
                        {uniqueStatuses.map((status) => (
                          <label key={status} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={status ? selectedStatuses.includes(status) : false}
                              onChange={(e) => {
                                if (e.target.checked && status) {
                                  setSelectedStatuses([...selectedStatuses, status]);
                                } else {
                                  setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <StatusBadge status={status as ServiceStatus} />
                          </label>
                        ))}
                      </div>
                      {selectedStatuses.length > 0 && (
                        <button
                          onClick={() => setSelectedStatuses([])}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                        >
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    📅 Datas
                    {(dateFrom || dateTo) && (
                      <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </button>

                  {showDateFilter && (
                    <div className="absolute top-full mt-2 right-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            De:
                          </label>
                          <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Até:
                          </label>
                          <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        {(dateFrom || dateTo) && (
                          <button
                            onClick={() => {
                              setDateFrom("");
                              setDateTo("");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Limpar datas
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-8">
        {viewMode === "dashboard" ? (
          <>
            {/* Quick Actions */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
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
            <StatsCards
              onFilterChange={setSelectedStatuses}
              onViewChange={setViewMode}
            />

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProcessChart
                onFilterChange={setSelectedStatuses}
                onViewChange={setViewMode}
              />
              <RecentActivity
                onServiceClick={handleServiceClick}
                onViewAllClick={() => setViewMode("list")}
              />
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
          </>
        ) : viewMode === "list" ? (
          <>
            {/* List View */}
            <div className="mb-4 sm:mb-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold">
                Processos ({filteredAndSortedServices.length})
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Items por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                        >
                          Nome
                          {renderSortIcon('name')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('email')}
                          className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                        >
                          Email
                          {renderSortIcon('email')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                        >
                          Status
                          {renderSortIcon('status')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                        >
                          Criado Em
                          {renderSortIcon('createdAt')}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedServices.map((service) => (
                      <tr
                        key={service.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleServiceClick(service as ServiceWithRelations)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 font-mono">
                            {service.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {service.user.fullName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={`mailto:${service.user.email}`}
                            className="text-sm text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {service.user.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={service.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(service.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {hasPermission(Permission.VIEW_SERVICES) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleServiceClick(service as ServiceWithRelations);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium relative inline-flex items-center gap-2"
                            >
                              Ver Detalhes
                              {getUnreadMessagesCount(service) > 0 && (
                                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                                  {getUnreadMessagesCount(service)}
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredAndSortedServices.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      Nenhum processo encontrado
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Tente ajustar os filtros ou a busca
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {filteredAndSortedServices.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedServices.length)} de {filteredAndSortedServices.length} resultados
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return page === 1 ||
                                 page === totalPages ||
                                 (page >= currentPage - 1 && page <= currentPage + 1);
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;

                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsisBefore && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </>
        ) : (
          <>
            {/* By User View */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                Por Usuário ({servicesByUser.length} usuários)
              </h2>
            </div>

            <div className="space-y-4">
              {servicesByUser.map((userGroup) => {
                const isExpanded = expandedUsers.has(userGroup.user.id);

                return (
                  <Card key={userGroup.user.id} className="overflow-hidden">
                    {/* User Header - Clickable */}
                    <div
                      className="bg-gray-50 px-6 py-4 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleUserExpand(userGroup.user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {userGroup.user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {userGroup.user.fullName}
                            </h3>
                            <a
                              href={`mailto:${userGroup.user.email}`}
                              className="text-sm text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {userGroup.user.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {userGroup.totalServices}
                            </div>
                            <div className="text-sm text-gray-500">
                              {userGroup.totalServices === 1 ? "processo" : "processos"}
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Services Table - Collapsible */}
                    {isExpanded && (
                      <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Criado Em
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {userGroup.services.map((service) => (
                          <tr
                            key={service.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedService(service)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 font-mono">
                                {service.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={service.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {formatDate(service.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {hasPermission(Permission.VIEW_SERVICES) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedService(service);
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium relative inline-flex items-center gap-2"
                                >
                                  Ver Detalhes
                                  {getUnreadMessagesCount(service) > 0 && (
                                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                                      {getUnreadMessagesCount(service)}
                                    </span>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                      </div>
                    )}
                  </Card>
                );
              })}

              {servicesByUser.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Nenhum usuário encontrado
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Tente ajustar os filtros ou a busca
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal
          open={true}
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
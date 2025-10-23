"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/contexts/ServicesContext";
import { ServiceStatus, ServiceWithRelations } from "@/lib/types";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { ServiceModal } from "@/components/pedidos/service-modal";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { services } = useServices();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "by-user">("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Auth check disabled during prototyping
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const isAuth = localStorage.getItem("isAuthenticated");
  //     if (!isAuth) {
  //       router.push("/login");
  //     }
  //   }
  // }, [router]);

  // Get unique statuses
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(services.map((s) => s.status).filter(Boolean));
    return Array.from(statuses);
  }, [services]);

  // Group services by user (for "by-user" view)
  const userGroups = useMemo(() => {
    const groups = new Map<string, {
      user: { id: string; fullName: string; email: string };
      services: ServiceWithRelations[];
    }>();

    services.forEach((service) => {
      const userId = service.user.id;
      if (!groups.has(userId)) {
        groups.set(userId, {
          user: {
            id: service.user.id,
            fullName: service.user.fullName,
            email: service.user.email,
          },
          services: [],
        });
      }
      groups.get(userId)!.services.push(service as ServiceWithRelations);
    });

    return Array.from(groups.values());
  }, [services]);

  // Toggle status selection
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        search === "" ||
        service.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        service.user.email.toLowerCase().includes(search.toLowerCase()) ||
        service.processNumber?.toLowerCase().includes(search.toLowerCase()) ||
        service.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(service.status || "");

      // Date filter
      const serviceDate = new Date(service.createdAt);
      const matchesDateFrom = !dateFrom || serviceDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || serviceDate <= new Date(dateTo + "T23:59:59");

      // User filter (when a user is selected in by-user mode)
      const matchesUser = !selectedUserId || service.user.id === selectedUserId;

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo && matchesUser;
    });
  }, [services, search, selectedStatuses, dateFrom, dateTo, selectedUserId]);

  // Filter users by search, status and date
  const filteredUsers = useMemo(() => {
    return userGroups
      .map((group) => {
        // Filter the user's services by status and date
        const filteredServices = group.services.filter((service) => {
          const matchesStatus =
            selectedStatuses.length === 0 || selectedStatuses.includes(service.status || "");

          const serviceDate = new Date(service.createdAt);
          const matchesDateFrom = !dateFrom || serviceDate >= new Date(dateFrom);
          const matchesDateTo = !dateTo || serviceDate <= new Date(dateTo + "T23:59:59");

          return matchesStatus && matchesDateFrom && matchesDateTo;
        });

        return {
          ...group,
          services: filteredServices,
          filteredCount: filteredServices.length,
        };
      })
      .filter((group) => {
        // Only show users that have at least one service matching the filters
        const hasMatchingServices = group.filteredCount > 0;

        // Also apply search filter on user name/email
        const matchesSearch =
          search === "" ||
          group.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
          group.user.email.toLowerCase().includes(search.toLowerCase());

        return hasMatchingServices && matchesSearch;
      });
  }, [userGroups, search, selectedStatuses, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-3 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🇵🇹</span>
              <h1 className="text-base sm:text-xl font-bold text-blue-600">Lusio Backoffice</h1>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-sm text-gray-600">Euclides</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <Input
                type="text"
                placeholder="Buscar por nome, email ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Horizontal Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <button
              onClick={() => {
                setViewMode("all");
                setSelectedUserId(null);
              }}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                viewMode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📁 <span className="hidden sm:inline">Todos Processos</span><span className="sm:hidden">Todos</span>
            </button>
            <button
              onClick={() => {
                setViewMode("by-user");
                setSelectedUserId(null);
              }}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                viewMode === "by-user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👤 <span className="hidden sm:inline">Por Usuário</span><span className="sm:hidden">Usuário</span>
            </button>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatuses.length > 0
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                📊 Status
                {selectedStatuses.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
                    {selectedStatuses.length}
                  </span>
                )}
              </button>

              {/* Status Dropdown */}
              {showStatusFilter && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Filtrar por Status</span>
                      {selectedStatuses.length > 0 && (
                        <button
                          onClick={() => setSelectedStatuses([])}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {uniqueStatuses.map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status || "")}
                          onChange={() => toggleStatus(status || "")}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                        <StatusBadge status={status} />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dates Filter */}
            <div className="relative">
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateFrom || dateTo
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                📅 Datas
                {(dateFrom || dateTo) && (
                  <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
                    ✓
                  </span>
                )}
              </button>

              {/* Date Dropdown */}
              {showDateFilter && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Filtrar por Data de Criação</span>
                    {(dateFrom || dateTo) && (
                      <button
                        onClick={() => {
                          setDateFrom("");
                          setDateTo("");
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo) && (
                      <p className="text-xs text-red-600">
                        A data inicial deve ser anterior à data final
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-3 sm:p-8">
        {/* Header com breadcrumb se usuário selecionado */}
        {selectedUserId && viewMode === "by-user" && (
          <div className="mb-4">
            <button
              onClick={() => setSelectedUserId(null)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              ← Voltar para todos os usuários
            </button>
          </div>
        )}

        <div className="mb-4 sm:mb-6">
          {viewMode === "all" ? (
            <h2 className="text-xl sm:text-2xl font-bold">Processos ({filteredServices.length})</h2>
          ) : selectedUserId ? (
            <h2 className="text-xl sm:text-2xl font-bold">
              Pedidos do Usuário ({filteredServices.length})
            </h2>
          ) : (
            <h2 className="text-xl sm:text-2xl font-bold">Usuários ({filteredUsers.length})</h2>
          )}
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            {viewMode === "all" || selectedUserId ? (
              // TABELA DE PROCESSOS
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
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
                  {filteredServices.map((service) => (
                    <tr
                      key={service.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedService(service as ServiceWithRelations)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">{service.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{service.user.fullName}</div>
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
                        <div className="text-sm text-gray-600">{formatDate(service.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService(service as ServiceWithRelations);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Nenhum processo encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              // TABELA DE USUÁRIOS
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedidos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredUsers.map((group) => (
                    <tr
                      key={group.user.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedUserId(group.user.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {group.user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{group.user.fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`mailto:${group.user.email}`}
                          className="text-sm text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {group.user.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {group.filteredCount} {group.filteredCount === 1 ? "pedido" : "pedidos"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(group.user.id);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Ver Pedidos
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Click outside to close filters */}
      {showStatusFilter && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowStatusFilter(false)}
        />
      )}
      {showDateFilter && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowDateFilter(false)}
        />
      )}

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal
          service={selectedService}
          open={!!selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

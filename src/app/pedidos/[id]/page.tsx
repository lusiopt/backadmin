"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useServices } from "@/contexts/ServicesContext";
import { ServiceStatus } from "@/lib/types";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function PedidoDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const { getService, updateService } = useServices();
  const service = getService(serviceId);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showAlmostModal, setShowAlmostModal] = useState(false);
  const [showIRNModal, setShowIRNModal] = useState(false);
  const [showProcessDataModal, setShowProcessDataModal] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);

  const [almostNote, setAlmostNote] = useState("");
  const [processNumber, setProcessNumber] = useState(service?.processNumber || "");
  const [processPassword, setProcessPassword] = useState(service?.processPassword || "");
  const [entity, setEntity] = useState(service?.entity || "");
  const [reference, setReference] = useState(service?.reference || "");

  // Client editable fields
  const [editableClient, setEditableClient] = useState({
    firstName: service?.person?.firstName || "",
    lastName: service?.person?.lastName || "",
    profession: service?.person?.profession || "",
    nationality: service?.person?.nationality || "",
    birthDate: service?.person?.birthDate || "",
    fatherFullName: service?.person?.fatherFullName || "",
    motherFullName: service?.person?.motherFullName || "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("isAuthenticated");
      if (!isAuth) router.push("/login");
    }
  }, [router]);

  if (!service) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pedido não encontrado</h1>
          <Link href="/" className="text-primary hover:underline">
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    updateService(serviceId, { status: ServiceStatus.STEP_7_APPROVED });
    setShowApproveModal(false);
    alert("✅ Documentos aprovados! Status: 'Passo 7 Aprovado'. Cliente recebeu email.");
  };

  const handleAlmost = () => {
    if (!almostNote.trim()) {
      alert("Por favor, explique o que falta para aprovar");
      return;
    }
    updateService(serviceId, {
      status: ServiceStatus.STEP_7_ALMOST,
      almostJustification: almostNote
    });
    setShowAlmostModal(false);
    setAlmostNote("");
    alert("⚠️ Status: 'Passo 7 Quase'. Backoffice contactará o cliente.");
  };

  const handleAddIRN = () => {
    if (!entity || !reference) {
      alert("Preencha Entidade e Referência");
      return;
    }
    updateService(serviceId, {
      entity,
      reference,
      status: ServiceStatus.STEP_8
    });
    setShowIRNModal(false);
    alert("✅ Dados do IRN inseridos! Status: 'Passo 8'. Cliente recebeu email com instruções de pagamento.");
  };

  const handleConfirmGovernmentPayment = () => {
    updateService(serviceId, {
      status: ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT,
      isPaidGovernment: true,
      paidGovernmentAt: new Date().toISOString()
    });
    alert("✅ Pagamento confirmado pelo governo! Agora insira o número do processo e senha.");
  };

  const handleSubmitProcess = () => {
    if (!processNumber || !processPassword) {
      alert("Preencha o Número do Processo e a Senha");
      return;
    }
    updateService(serviceId, {
      processNumber,
      processPassword,
      status: ServiceStatus.SUBMITTED,
      submissionDate: new Date().toISOString()
    });
    setShowProcessDataModal(false);
    alert("✅ Processo submetido! Cliente recebeu email com número do processo e senha.");
  };

  const handleSaveClientEdit = () => {
    if (!service.person) return;

    updateService(serviceId, {
      person: {
        ...service.person,
        ...editableClient
      } as any
    });
    setIsEditingClient(false);
    alert("✅ Dados do cliente atualizados com sucesso!");
  };

  const handleCancelClientEdit = () => {
    // Reset to original values
    setEditableClient({
      firstName: service?.person?.firstName || "",
      lastName: service?.person?.lastName || "",
      profession: service?.person?.profession || "",
      nationality: service?.person?.nationality || "",
      birthDate: service?.person?.birthDate || "",
      fatherFullName: service?.person?.fatherFullName || "",
      motherFullName: service?.person?.motherFullName || "",
    });
    setIsEditingClient(false);
  };

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-primary hover:underline mb-4 inline-block">
          ← Voltar
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{service.user?.fullName || 'N/A'}</h1>
            <p className="text-gray-600 mt-1">{service.user?.email || 'N/A'}</p>
          </div>
          <StatusBadge status={service.status} className="text-base px-4 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados do Cliente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dados do Requerente</CardTitle>
            {!isEditingClient ? (
              <Button
                onClick={() => setIsEditingClient(true)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                ✏️ Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveClientEdit}
                  size="sm"
                  className="text-xs bg-green-600 hover:bg-green-700"
                >
                  💾 Salvar
                </Button>
                <Button
                  onClick={handleCancelClientEdit}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  ❌ Cancelar
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isEditingClient ? (
              <>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-xs text-gray-600">Nome:</span>
                  <Input
                    value={editableClient.firstName}
                    onChange={(e) => setEditableClient({...editableClient, firstName: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-xs text-gray-600">Sobrenome:</span>
                  <Input
                    value={editableClient.lastName}
                    onChange={(e) => setEditableClient({...editableClient, lastName: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-xs text-gray-600">Profissão:</span>
                  <Input
                    value={editableClient.profession}
                    onChange={(e) => setEditableClient({...editableClient, profession: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-xs text-gray-600">Nacionalidade:</span>
                  <Input
                    value={editableClient.nationality}
                    onChange={(e) => setEditableClient({...editableClient, nationality: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-xs text-gray-600">Data Nascimento:</span>
                  <Input
                    type="date"
                    value={editableClient.birthDate ? new Date(editableClient.birthDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditableClient({...editableClient, birthDate: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-xs text-gray-600">Pai:</span>
                  <Input
                    value={editableClient.fatherFullName}
                    onChange={(e) => setEditableClient({...editableClient, fatherFullName: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-xs text-gray-600">Mãe:</span>
                  <Input
                    value={editableClient.motherFullName}
                    onChange={(e) => setEditableClient({...editableClient, motherFullName: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
              </>
            ) : (
              <>
                <div><span className="font-medium">Nome:</span> {service.person?.firstName} {service.person?.lastName}</div>
                <div><span className="font-medium">Profissão:</span> {service.person?.profession || "-"}</div>
                <div><span className="font-medium">Nacionalidade:</span> {service.person?.nationality || "-"}</div>
                <div><span className="font-medium">Data Nascimento:</span> {formatDate(service.person?.birthDate)}</div>
                <div><span className="font-medium">Pai:</span> {service.person?.fatherFullName || "-"}</div>
                <div><span className="font-medium">Mãe:</span> {service.person?.motherFullName || "-"}</div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dados do Processo */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Processo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="font-medium">Criado em:</span> {formatDate(service.createdAt)}</div>
            <div><span className="font-medium">Atualizado:</span> {formatDate(service.updatedAt)}</div>
            <div><span className="font-medium">Taxa Paga:</span> {service.isPaidTax ? "✅ Sim" : "❌ Não"}</div>
            <div><span className="font-medium">Governo Pago:</span> {service.isPaidGovernment ? "✅ Sim" : "❌ Não"}</div>
            {service.paidGovernmentAt && (
              <div><span className="font-medium">Data Pag. Governo:</span> {formatDate(service.paidGovernmentAt)}</div>
            )}
            <div><span className="font-medium">Entidade:</span> {service.entity || "-"}</div>
            <div><span className="font-medium">Referência:</span> {service.reference || "-"}</div>
            <div><span className="font-medium">Nº Processo:</span> {service.processNumber || "-"}</div>
            {service.processPassword && (
              <div><span className="font-medium">Senha:</span> {service.processPassword}</div>
            )}
            {service.submissionDate && (
              <div><span className="font-medium">Data Submissão:</span> {formatDate(service.submissionDate)}</div>
            )}
          </CardContent>
        </Card>

        {/* Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos ({service.documents?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {service.documents && service.documents.length > 0 ? (
              service.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{doc.name}</span>
                  <button className="text-xs text-primary hover:underline">Download</button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhum documento anexado</p>
            )}
          </CardContent>
        </Card>

        {/* Ações da Advogada - Fluxo em Sequência */}
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Aprovação</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Siga os passos em ordem</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* PASSO 1: Revisão de Documentos */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8
                      ? 'bg-green-500 text-white'
                      : service.status === ServiceStatus.STEP_7_ALMOST
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8 ? '✓' : '1'}
                  </div>
                  <div>
                    <h3 className="font-semibold">Revisão de Documentos</h3>
                    <p className="text-xs text-gray-600">Aprovar ou solicitar correções</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowApproveModal(true)}
                  disabled={service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  ✅ Aprovar
                </Button>
                <Button
                  onClick={() => setShowAlmostModal(true)}
                  disabled={service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8}
                  variant="secondary"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  ⚠️ Quase Lá
                </Button>
              </div>

              {service.status === ServiceStatus.STEP_7_APPROVED && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✓ Documentos aprovados com sucesso
                </div>
              )}
              {service.status === ServiceStatus.STEP_7_ALMOST && service.almostJustification && (
                <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
                  ⚠️ Pendente: {service.almostJustification}
                </div>
              )}
            </div>

            {/* PASSO 2: Dados IRN */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    service.status === ServiceStatus.STEP_8 ||
                    service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ||
                    service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ||
                    service.status === ServiceStatus.SUBMITTED
                      ? 'bg-green-500 text-white'
                      : service.status === ServiceStatus.STEP_7_APPROVED
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {service.status === ServiceStatus.STEP_8 ||
                     service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ||
                     service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ||
                     service.status === ServiceStatus.SUBMITTED ? '✓' : '2'}
                  </div>
                  <div>
                    <h3 className="font-semibold">Inserir Dados do IRN</h3>
                    <p className="text-xs text-gray-600">Referência de pagamento do governo</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowIRNModal(true)}
                disabled={service.status !== ServiceStatus.STEP_7_APPROVED}
                className="w-full"
              >
                📝 Inserir Dados IRN
              </Button>

              {service.status !== ServiceStatus.STEP_7_APPROVED &&
               service.status !== ServiceStatus.STEP_8 &&
               service.status !== ServiceStatus.STEP_8_CLIENT_CONFIRMED &&
               service.status !== ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT &&
               service.status !== ServiceStatus.SUBMITTED && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ⚠️ Primeiro aprove os documentos (Passo 1)
                </p>
              )}
              {(service.status === ServiceStatus.STEP_8 ||
                service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ||
                service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ||
                service.status === ServiceStatus.SUBMITTED) && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✓ Dados IRN inseridos: Entidade {service.entity} | Ref {service.reference}
                </div>
              )}
            </div>

            {/* PASSO 3: Aguardar Cliente Pagar */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ||
                    service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ||
                    service.status === ServiceStatus.SUBMITTED
                      ? 'bg-green-500 text-white'
                      : service.status === ServiceStatus.STEP_8
                      ? 'bg-yellow-500 text-white animate-pulse'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ||
                     service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ||
                     service.status === ServiceStatus.SUBMITTED ? '✓' : '3'}
                  </div>
                  <div>
                    <h3 className="font-semibold">Cliente Pagar Taxa Governamental</h3>
                    <p className="text-xs text-gray-600">Cliente paga €250 e confirma no app</p>
                  </div>
                </div>
              </div>

              {service.status === ServiceStatus.STEP_8 && (
                <>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm mb-3">
                    <p className="text-yellow-800 font-medium">⏳ Aguardando Pagamento do Cliente</p>
                    <p className="text-yellow-700 text-xs mt-1">
                      O cliente recebeu email com os dados (Entidade: {service.entity} | Ref: {service.reference}).
                      Quando pagar, ele confirmará no app.lusio.pt.
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-600 mb-2">🧪 Para testes/simulação:</p>
                    <Button
                      onClick={() => {
                        updateService(serviceId, {
                          status: ServiceStatus.STEP_8_CLIENT_CONFIRMED
                        });
                        alert("✅ Pagamento do cliente confirmado (simulação)");
                      }}
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                    >
                      🎭 Simular Confirmação do Cliente
                    </Button>
                  </div>
                </>
              )}

              {service.status !== ServiceStatus.STEP_8 &&
               service.status !== ServiceStatus.STEP_8_CLIENT_CONFIRMED &&
               service.status !== ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT &&
               service.status !== ServiceStatus.SUBMITTED && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ⚠️ Primeiro insira os dados do IRN (Passo 2)
                </p>
              )}

              {(service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ||
                service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ||
                service.status === ServiceStatus.SUBMITTED) && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✓ Cliente confirmou pagamento no app.lusio.pt
                </div>
              )}
            </div>

            {/* PASSO 4: Confirmar Recebimento pelo Governo */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ||
                    service.status === ServiceStatus.SUBMITTED
                      ? 'bg-green-500 text-white'
                      : service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ||
                     service.status === ServiceStatus.SUBMITTED ? '✓' : '4'}
                  </div>
                  <div>
                    <h3 className="font-semibold">Confirmar Recebimento Governo</h3>
                    <p className="text-xs text-gray-600">Governo confirmou recebimento</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConfirmGovernmentPayment}
                disabled={service.status !== ServiceStatus.STEP_8_CLIENT_CONFIRMED}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                ✅ Governo Confirmou
              </Button>

              {service.status !== ServiceStatus.STEP_8_CLIENT_CONFIRMED &&
               service.status !== ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT &&
               service.status !== ServiceStatus.SUBMITTED && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ⚠️ Primeiro confirme o pagamento do cliente (Passo 3)
                </p>
              )}
              {(service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ||
                service.status === ServiceStatus.SUBMITTED) && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✓ Governo confirmou recebimento em {formatDate(service.paidGovernmentAt)}
                </div>
              )}
            </div>

            {/* PASSO 5: Inserir Número do Processo e Senha */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    service.status === ServiceStatus.SUBMITTED
                      ? 'bg-green-500 text-white'
                      : service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {service.status === ServiceStatus.SUBMITTED ? '✓' : '5'}
                  </div>
                  <div>
                    <h3 className="font-semibold">Inserir Dados do Processo</h3>
                    <p className="text-xs text-gray-600">Número e senha do IRN</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowProcessDataModal(true)}
                disabled={service.status !== ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT}
                className="w-full bg-primary hover:bg-primaryHover"
              >
                🔐 Inserir Processo e Senha
              </Button>

              {service.status !== ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT &&
               service.status !== ServiceStatus.SUBMITTED && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ⚠️ Primeiro confirme o recebimento pelo governo (Passo 4)
                </p>
              )}
              {service.status === ServiceStatus.SUBMITTED && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  ✓ Processo {service.processNumber} submetido em {formatDate(service.submissionDate)}
                </div>
              )}
            </div>

            {/* Status Atual */}
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500 mb-2">Status Atual:</p>
              <StatusBadge status={service.status} className="text-sm" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Aprovar Documentos?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Confirma que todos os documentos estão corretos e aprovados?</p>
              <div className="flex gap-3">
                <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">Sim, Aprovar</Button>
                <Button onClick={() => setShowApproveModal(false)} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showAlmostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Quase Lá - Falta algo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Explique o que falta para aprovar. O backoffice entrará em contacto com o cliente.
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">O que falta? *</label>
                <textarea
                  value={almostNote}
                  onChange={(e) => setAlmostNote(e.target.value)}
                  className="w-full p-3 border rounded-md"
                  rows={4}
                  placeholder="Ex: Título de residência desfocado. Solicitar nova foto nítida."
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAlmost} className="flex-1 bg-yellow-500 hover:bg-yellow-600">Salvar Nota</Button>
                <Button onClick={() => setShowAlmostModal(false)} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showIRNModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Inserir Dados do IRN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Após submeter ao portal IRN, insira os dados de pagamento gerados pelo governo:
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">Entidade *</label>
                <Input
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                />
                <p className="text-xs text-gray-500 mt-1">5 dígitos fornecidos pelo IRN</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Referência *</label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="123 456 789"
                  maxLength={11}
                />
                <p className="text-xs text-gray-500 mt-1">9 dígitos fornecidos pelo IRN</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs text-blue-800">
                  💡 Valor fixo: €250,00 | Validade: 30 dias
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddIRN} className="flex-1">Inserir e Notificar Cliente</Button>
                <Button onClick={() => setShowIRNModal(false)} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showProcessDataModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Inserir Dados do Processo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Após o governo confirmar o pagamento, o IRN fornece os dados do processo:
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">Número do Processo *</label>
                <Input
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  placeholder="XXXXX/XX"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">Formato: XXXXX/XX</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Senha de Acompanhamento *</label>
                <Input
                  value={processPassword}
                  onChange={(e) => setProcessPassword(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  maxLength={19}
                />
                <p className="text-xs text-gray-500 mt-1">Formato: XXXX-XXXX-XXXX-XXXX</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs text-blue-800">
                  💡 Cliente poderá acompanhar o processo no portal IRN com estes dados
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSubmitProcess} className="flex-1">Submeter e Notificar Cliente</Button>
                <Button onClick={() => setShowProcessDataModal(false)} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

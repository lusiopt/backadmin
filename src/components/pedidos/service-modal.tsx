"use client";

import { useState, useEffect } from "react";
import { ServiceWithRelations, ServiceStatus } from "@/lib/types";
import { useServices } from "@/contexts/ServicesContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ServiceModalProps {
  service: ServiceWithRelations;
  open: boolean;
  onClose: () => void;
}

export function ServiceModal({ service: initialService, open, onClose }: ServiceModalProps) {
  const { getService, updateService } = useServices();
  const service = getService(initialService.id) || initialService;

  const [activeTab, setActiveTab] = useState("acoes");
  const [isEditingClient, setIsEditingClient] = useState(false);

  // Client edit state
  const [editableClient, setEditableClient] = useState({
    firstName: service?.person?.firstName || "",
    lastName: service?.person?.lastName || "",
    profession: service?.person?.profession || "",
    nationality: service?.person?.nationality || "",
    birthDate: service?.person?.birthDate || "",
    fatherFullName: service?.person?.fatherFullName || "",
    motherFullName: service?.person?.motherFullName || "",
  });

  // Workflow state
  const [almostNote, setAlmostNote] = useState("");
  const [entity, setEntity] = useState(service?.entity || "");
  const [reference, setReference] = useState(service?.reference || "");
  const [processNumber, setProcessNumber] = useState(service?.processNumber || "");
  const [processPassword, setProcessPassword] = useState(service?.processPassword || "");

  // Mini modals for actions
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showAlmostModal, setShowAlmostModal] = useState(false);
  const [showIRNModal, setShowIRNModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);

  const handleSaveClientEdit = () => {
    if (!service.person) return;
    updateService(service.id, {
      person: {
        ...service.person,
        ...editableClient
      } as any
    });
    setIsEditingClient(false);
    alert("✅ Dados atualizados!");
  };

  const handleApprove = () => {
    updateService(service.id, { status: ServiceStatus.STEP_7_APPROVED });
    setShowApproveModal(false);
    alert("✅ Documentos aprovados!");
  };

  const handleAlmost = () => {
    if (!almostNote.trim()) {
      alert("Explique o que falta");
      return;
    }
    updateService(service.id, {
      status: ServiceStatus.STEP_7_ALMOST,
      almostJustification: almostNote
    });
    setShowAlmostModal(false);
    setAlmostNote("");
    alert("⚠️ Status alterado para Quase Lá");
  };

  const handleAddIRN = () => {
    if (!entity || !reference) {
      alert("Preencha Entidade e Referência");
      return;
    }
    updateService(service.id, {
      entity,
      reference,
      status: ServiceStatus.STEP_8
    });
    setShowIRNModal(false);
    alert("✅ Dados do IRN inseridos!");
  };

  const handleConfirmGovernment = () => {
    updateService(service.id, {
      status: ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT,
      isPaidGovernment: true,
      paidGovernmentAt: new Date().toISOString()
    });
    alert("✅ Pagamento confirmado pelo governo!");
  };

  const handleSubmitProcess = () => {
    if (!processNumber || !processPassword) {
      alert("Preencha Número e Senha");
      return;
    }
    updateService(service.id, {
      processNumber,
      processPassword,
      status: ServiceStatus.SUBMITTED,
      submissionDate: new Date().toISOString()
    });
    setShowProcessModal(false);
    alert("✅ Processo submetido!");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent onClose={onClose}>
          {/* Header */}
          <DialogHeader>
            <div className="flex items-start justify-between pr-8">
              <div>
                <DialogTitle>{service.user.fullName}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">{service.user.email}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="text-xs">
                  {service.id}
                </Badge>
                <StatusBadge status={service.status} />
              </div>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-50">
              <TabsTrigger value="dados" icon="📋">Dados</TabsTrigger>
              <TabsTrigger value="documentos" icon="📄">Documentos</TabsTrigger>
              <TabsTrigger value="timeline" icon="📅">Timeline</TabsTrigger>
              <TabsTrigger value="notas" icon="💬">Notas</TabsTrigger>
              <TabsTrigger value="acoes" icon="⚡">Ações</TabsTrigger>
            </TabsList>

            <DialogBody className="min-h-[400px] max-h-[500px]">
              {/* TAB: Dados */}
              <TabsContent value="dados" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Dados do Requerente</h3>
                  {!isEditingClient ? (
                    <Button onClick={() => setIsEditingClient(true)} size="sm" variant="outline">
                      ✏️ Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveClientEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                        💾 Salvar
                      </Button>
                      <Button onClick={() => setIsEditingClient(false)} size="sm" variant="outline">
                        ❌ Cancelar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {isEditingClient ? (
                    <>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Nome</label>
                        <Input
                          value={editableClient.firstName}
                          onChange={(e) => setEditableClient({...editableClient, firstName: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Sobrenome</label>
                        <Input
                          value={editableClient.lastName}
                          onChange={(e) => setEditableClient({...editableClient, lastName: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Profissão</label>
                        <Input
                          value={editableClient.profession}
                          onChange={(e) => setEditableClient({...editableClient, profession: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Nacionalidade</label>
                        <Input
                          value={editableClient.nationality}
                          onChange={(e) => setEditableClient({...editableClient, nationality: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Data Nascimento</label>
                        <Input
                          type="date"
                          value={editableClient.birthDate ? new Date(editableClient.birthDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setEditableClient({...editableClient, birthDate: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-medium">Pai</label>
                        <Input
                          value={editableClient.fatherFullName}
                          onChange={(e) => setEditableClient({...editableClient, fatherFullName: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-600 font-medium">Mãe</label>
                        <Input
                          value={editableClient.motherFullName}
                          onChange={(e) => setEditableClient({...editableClient, motherFullName: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div><span className="font-medium">Nome:</span> {service.person?.firstName} {service.person?.lastName}</div>
                      <div><span className="font-medium">Profissão:</span> {service.person?.profession || "-"}</div>
                      <div><span className="font-medium">Nacionalidade:</span> {service.person?.nationality || "-"}</div>
                      <div><span className="font-medium">Nascimento:</span> {formatDate(service.person?.birthDate)}</div>
                      <div><span className="font-medium">Pai:</span> {service.person?.fatherFullName || "-"}</div>
                      <div><span className="font-medium">Mãe:</span> {service.person?.motherFullName || "-"}</div>
                    </>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Dados do Processo</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Criado:</span> {formatDate(service.createdAt)}</div>
                    <div><span className="font-medium">Atualizado:</span> {formatDate(service.updatedAt)}</div>
                    <div><span className="font-medium">Taxa Paga:</span> {service.isPaidTax ? "✅" : "❌"}</div>
                    <div><span className="font-medium">Governo:</span> {service.isPaidGovernment ? "✅" : "❌"}</div>
                    <div><span className="font-medium">Entidade:</span> {service.entity || "-"}</div>
                    <div><span className="font-medium">Referência:</span> {service.reference || "-"}</div>
                    <div><span className="font-medium">Nº Processo:</span> {service.processNumber || "-"}</div>
                    {service.processPassword && (
                      <div><span className="font-medium">Senha:</span> {service.processPassword}</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB: Documentos */}
              <TabsContent value="documentos" className="space-y-3">
                <h3 className="font-semibold">Documentos ({service.documents?.length || 0})</h3>
                {service.documents && service.documents.length > 0 ? (
                  <div className="space-y-2">
                    {service.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100">
                        <span className="text-sm">{doc.name}</span>
                        <button className="text-xs text-primary hover:underline">Download</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-8 text-center">Nenhum documento anexado</p>
                )}
              </TabsContent>

              {/* TAB: Timeline */}
              <TabsContent value="timeline">
                <p className="text-sm text-gray-500 py-8 text-center">Timeline em desenvolvimento</p>
              </TabsContent>

              {/* TAB: Notas */}
              <TabsContent value="notas">
                <p className="text-sm text-gray-500 py-8 text-center">Notas em desenvolvimento</p>
              </TabsContent>

              {/* TAB: Ações */}
              <TabsContent value="acoes" className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <h3 className="font-semibold text-sm mb-1">📋 Instruções:</h3>
                  <ol className="text-xs text-blue-900 space-y-0.5 ml-4 list-decimal">
                    <li>Revise e aprove os documentos</li>
                    <li>Insira dados do IRN (Entidade e Referência)</li>
                    <li>Aguarde cliente pagar e confirmar</li>
                    <li>Confirme recebimento do governo</li>
                    <li>Insira número do processo e senha</li>
                  </ol>
                </div>

                {/* Passo 1 */}
                <div className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8 ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8 ? '✓' : '1'}
                    </div>
                    <h4 className="font-semibold text-sm">Revisão de Documentos</h4>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowApproveModal(true)}
                      disabled={service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-8"
                    >
                      ✅ Aprovar
                    </Button>
                    <Button
                      onClick={() => setShowAlmostModal(true)}
                      disabled={service.status === ServiceStatus.STEP_7_APPROVED || service.status === ServiceStatus.STEP_8}
                      size="sm"
                      variant="secondary"
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs h-8"
                    >
                      ⚠️ Quase Lá
                    </Button>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.STEP_8 || service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.STEP_8 || service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? '✓' : '2'}
                    </div>
                    <h4 className="font-semibold text-sm">Inserir Dados IRN</h4>
                  </div>
                  <Button
                    onClick={() => setShowIRNModal(true)}
                    disabled={service.status !== ServiceStatus.STEP_7_APPROVED}
                    size="sm"
                    className="w-full text-xs h-8"
                  >
                    📝 Dados IRN
                  </Button>
                  {service.entity && (
                    <p className="text-xs text-green-700 mt-1">✓ Ent: {service.entity} | Ref: {service.reference}</p>
                  )}
                </div>

                {/* Passo 3 */}
                <div className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? 'bg-green-500 text-white' : service.status === ServiceStatus.STEP_8 ? 'bg-yellow-500 text-white animate-pulse' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED ? '✓' : '3'}
                    </div>
                    <h4 className="font-semibold text-sm">Cliente Pagar (€250)</h4>
                  </div>
                  {service.status === ServiceStatus.STEP_8 && (
                    <div className="space-y-2">
                      <p className="text-xs text-yellow-700">⏳ Aguardando pagamento...</p>
                      <Button
                        onClick={() => {
                          updateService(service.id, { status: ServiceStatus.STEP_8_CLIENT_CONFIRMED });
                          alert("✅ Pagamento simulado");
                        }}
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-8"
                      >
                        🎭 Simular Pagamento
                      </Button>
                    </div>
                  )}
                  {service.status === ServiceStatus.STEP_8_CLIENT_CONFIRMED && (
                    <p className="text-xs text-green-700">✓ Cliente confirmou pagamento</p>
                  )}
                </div>

                {/* Passo 4 */}
                <div className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT ? '✓' : '4'}
                    </div>
                    <h4 className="font-semibold text-sm">Confirmar Governo</h4>
                  </div>
                  <Button
                    onClick={handleConfirmGovernment}
                    disabled={service.status !== ServiceStatus.STEP_8_CLIENT_CONFIRMED}
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
                  >
                    ✅ Governo Confirmou
                  </Button>
                </div>

                {/* Passo 5 */}
                <div className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      service.status === ServiceStatus.SUBMITTED ? 'bg-green-500 text-white' : 'bg-gray-300'
                    }`}>
                      {service.status === ServiceStatus.SUBMITTED ? '✓' : '5'}
                    </div>
                    <h4 className="font-semibold text-sm">Inserir Processo e Senha</h4>
                  </div>
                  <Button
                    onClick={() => setShowProcessModal(true)}
                    disabled={service.status !== ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT}
                    size="sm"
                    className="w-full text-xs h-8"
                  >
                    🔐 Processo e Senha
                  </Button>
                  {service.status === ServiceStatus.SUBMITTED && (
                    <p className="text-xs text-green-700 mt-1">✓ Proc: {service.processNumber}</p>
                  )}
                </div>
              </TabsContent>
            </DialogBody>
          </Tabs>

          <DialogFooter>
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mini Modals */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-3">Aprovar Documentos?</h3>
            <p className="text-sm text-gray-600 mb-4">Cliente receberá email de confirmação.</p>
            <div className="flex gap-2">
              <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">Confirmar</Button>
              <Button onClick={() => setShowApproveModal(false)} variant="outline" className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {showAlmostModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-3">Quase Lá</h3>
            <p className="text-sm text-gray-600 mb-2">Explique o que falta:</p>
            <textarea
              value={almostNote}
              onChange={(e) => setAlmostNote(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-4"
              rows={3}
              placeholder="Ex: Falta certidão de nascimento..."
            />
            <div className="flex gap-2">
              <Button onClick={handleAlmost} className="flex-1">Enviar</Button>
              <Button onClick={() => setShowAlmostModal(false)} variant="outline" className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {showIRNModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-3">Dados do IRN</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Entidade (5 dígitos)</label>
                <Input
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  placeholder="Ex: 12345"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Referência (9 dígitos)</label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: 123 456 789"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valor (€)</label>
                <Input value="200" disabled />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddIRN} className="flex-1 bg-green-600 hover:bg-green-700">Submeter</Button>
              <Button onClick={() => setShowIRNModal(false)} variant="outline" className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {showProcessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg mb-3">Dados do Processo</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Número do Processo</label>
                <Input
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  placeholder="Ex: 2024/12345"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Senha</label>
                <Input
                  value={processPassword}
                  onChange={(e) => setProcessPassword(e.target.value)}
                  placeholder="Senha do processo"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSubmitProcess} className="flex-1 bg-green-600 hover:bg-green-700">Submeter</Button>
              <Button onClick={() => setShowProcessModal(false)} variant="outline" className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

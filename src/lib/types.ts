// Types baseados no schema Prisma do Lusio Cidadania
// Gerado em: 2025-10-23

// =====================================================
// ENUMS
// =====================================================

export enum ServiceStatus {
  STEP_1 = "Passo 1",
  STEP_2 = "Passo 2",
  STEP_3 = "Passo 3",
  STEP_4 = "Passo 4",
  STEP_5 = "Passo 5",
  STEP_6 = "Passo 6",
  STEP_7 = "Passo 7",
  STEP_7_WAITING = "Passo 7 Esperando",
  STEP_7_APPROVED = "Passo 7 Aprovado",
  STEP_7_RECUSED = "Passo 7 Recusado",
  STEP_7_ALMOST = "Passo 7 Quase",
  STEP_8 = "Passo 8",
  STEP_8_CLIENT_CONFIRMED = "Passo 8 Confirmado pelo Cliente",
  STEP_8_CONFIRMED_BY_GOVERNMENT = "Passo 8 Confirmado pelo Governo",
  CANCELLED = "Cancelado",
  SUBMITTED = "Submetido",
  UNDER_ANALYSIS = "Em análise",
  WAITING_RESPONSE = "Aguarda resposta",
  FOR_DECISION = "Para decisão",
  COMPLETED = "Concluído",
}

export enum DocumentType {
  IDENTITY = "identity",
  BIRTH_CERTIFICATE = "birth_certificate",
  CRIMINAL_RECORD = "criminal_record",
  RESIDENCE_TITLE = "residence_title",
  MARRIAGE_CERTIFICATE = "marriage_certificate",
  OTHER = "other",
}

// =====================================================
// INTERFACES
// =====================================================

export interface User {
  id: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  areaCode?: string | null;
  phone?: string | null;
  email: string;
  active: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  alternativeNames?: string | null;
  profession?: string | null;
  fatherFullName?: string | null;
  fatherAlternativeNames?: string | null;
  fatherBirthPlace?: string | null;
  motherFullName?: string | null;
  motherAlternativeNames?: string | null;
  motherBirthPlace?: string | null;
  civilState?: string | null;
  nationality?: string | null;
  birthDate?: Date | string | null;
  cityPlace?: string | null;
  statePlace?: string | null;
  countryPlace?: string | null;
  gender?: string | null;
  residenceCountries?: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface Address {
  id: string;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  serviceId: string;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type?: DocumentType | string;
  size?: number;
  uploadedAt: Date | string;
  serviceId: string;
}

export interface DocumentAttorney {
  id: string;
  name: string;
  url: string;
  type?: string;
  uploadedAt: Date | string;
  serviceId: string;
}

export interface Service {
  id: string;
  status: ServiceStatus | string | null;
  processNumber?: string | null;
  processPassword?: string | null;
  entity?: string | null;
  reference?: string | null;
  assignedAt?: Date | string | null;
  isPaidTax: boolean;
  paidTaxAt?: Date | string | null;
  isPaidGovernment: boolean;
  paidGovernmentAt?: Date | string | null;
  paymentReferenceId?: string | null;
  hasResidenceTitle?: boolean | null;
  hasBirthCertificate?: boolean | null;
  hasCriminalRecord?: boolean | null;
  hasIdentificationDocument?: boolean | null;
  hasBrasilianCriminalRecord?: boolean | null;
  documentPromotion?: boolean | null;
  refuseJustification?: string | null;
  almostJustification?: string | null;
  sendSolicitationDate?: Date | string | null;
  submissionDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt?: Date | string | null;
  userId: string;
  personId?: string | null;

  // Relacionamentos
  user: User;
  person?: Person | null;
  address?: Address | null;
  documents?: Document[];
  documentsAttorney?: DocumentAttorney[];
}

// =====================================================
// HELPER TYPES
// =====================================================

export type ServiceWithRelations = Service & {
  user: User;
  person: Person;
  address?: Address;
  documents: Document[];
  documentsAttorney: DocumentAttorney[];
};

export interface StatusHistory {
  id: string;
  serviceId: string;
  fromStatus: ServiceStatus | string;
  toStatus: ServiceStatus | string;
  changedBy: string;
  changedAt: Date | string;
  notes?: string;
}

export interface LawyerAction {
  type: "approve" | "refuse" | "almost" | "add_irn_data";
  serviceId: string;
  notes?: string;
  processNumber?: string;
  entity?: string;
  reference?: string;
}

// =====================================================
// FILTERS & PAGINATION
// =====================================================

export interface ServiceFilters {
  status?: ServiceStatus | string;
  search?: string; // busca por nome, email, processo
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =====================================================
// ROLES & PERMISSIONS
// =====================================================

export enum UserRole {
  ADMIN = "admin",
  BACKOFFICE = "backoffice",
  ADVOGADA = "advogada",
  VISUALIZADOR = "visualizador",
}

export enum Permission {
  // Service permissions
  VIEW_SERVICES = "view_services",
  CREATE_SERVICE = "create_service",
  EDIT_SERVICE = "edit_service",
  DELETE_SERVICE = "delete_service",
  CHANGE_STATUS = "change_status",

  // Document permissions
  VIEW_DOCUMENTS = "view_documents",
  UPLOAD_DOCUMENTS = "upload_documents",
  DELETE_DOCUMENTS = "delete_documents",

  // User permissions
  VIEW_USERS = "view_users",
  MANAGE_USERS = "manage_users",

  // Special permissions
  VIEW_ALL_SERVICES = "view_all_services", // Ver todos os processos (não só os atribuídos)
  ASSIGN_SERVICES = "assign_services", // Atribuir processos a outros usuários
  VIEW_STATISTICS = "view_statistics", // Ver estatísticas e dashboards
  EXPORT_DATA = "export_data", // Exportar dados
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

// Definição de permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Acesso total
    Permission.VIEW_SERVICES,
    Permission.CREATE_SERVICE,
    Permission.EDIT_SERVICE,
    Permission.DELETE_SERVICE,
    Permission.CHANGE_STATUS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DELETE_DOCUMENTS,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_ALL_SERVICES,
    Permission.ASSIGN_SERVICES,
    Permission.VIEW_STATISTICS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.BACKOFFICE]: [
    // Operação completa, exceto gerenciar usuários
    Permission.VIEW_SERVICES,
    Permission.CREATE_SERVICE,
    Permission.EDIT_SERVICE,
    Permission.CHANGE_STATUS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DELETE_DOCUMENTS,
    Permission.VIEW_USERS,
    Permission.VIEW_ALL_SERVICES,
    Permission.ASSIGN_SERVICES,
    Permission.VIEW_STATISTICS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.ADVOGADA]: [
    // Visualização + análise + mudança de status
    Permission.VIEW_SERVICES,
    Permission.EDIT_SERVICE,
    Permission.CHANGE_STATUS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_ALL_SERVICES,
    Permission.VIEW_STATISTICS,
  ],
  [UserRole.VISUALIZADOR]: [
    // Apenas leitura
    Permission.VIEW_SERVICES,
    Permission.VIEW_DOCUMENTS,
    Permission.VIEW_STATISTICS,
  ],
};

// User estendido com role
export interface AuthUser extends User {
  role: UserRole;
}

// Context de autenticação
export interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

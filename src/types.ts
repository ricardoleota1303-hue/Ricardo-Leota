export type UserRole = 'admin_principal' | 'supervisor_produccion' | 'asesor_ventas' | 'encargado_despachos';

export type ProtectedModuleId = 'pedidos' | 'inventario' | 'reportes' | 'usuarios' | 'seguimiento' | 'catalogo';

export interface ModulePermission {
  canView: boolean; // Visualización
  canEdit: boolean; // Creación, edición y modificación
}

export interface UserPermissions {
  pedidos: ModulePermission;       // Pedidos y Entregas
  inventario: ModulePermission;    // Inventario de dotaciones
  reportes: ModulePermission;      // Reportes mensuales de ventas
  usuarios: ModulePermission;      // Gestión de empleados
  seguimiento: ModulePermission;   // Rastreo y guías de transporte
  catalogo: ModulePermission;      // Catálogo de precios y cotizaciones
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: ProtectedModuleId | 'admin' | 'seguridad' | 'sesion';
  details: string;
  severity: 'info' | 'warning' | 'security';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  department: string;
  active: boolean;
  avatarUrl?: string;
  createdAt: string;
  pin?: string; // PIN de 4 dígitos para autenticación/desbloqueo
  permissions: UserPermissions; // Permisos delegados por el Administrador Principal
  bio?: string; // Especialidad o biografía laboral (personalizada por el empleado)
  shiftHours?: string; // Turno u horario habitual (personalizado)
  statusMessage?: string; // Estado actual (ej. "🟢 En planta", "📞 Con clientes")
  badgeColor?: string; // Color distintivo personal (ej. amber, blue, emerald, purple, rose)
}

export type UniformCategory = 
  | 'Overoles y Mamelucos'
  | 'Camisas y Blusas Industriales'
  | 'Pantalones y Jeans de Trabajo'
  | 'Calzado de Seguridad'
  | 'Alta Visibilidad y Vial'
  | 'Protección Térmica e Ignífuga'
  | 'Batas y Salud Ocupacional'
  | 'Accesorios y EPP Complementario';

export type GarmentGender = 'dama' | 'caballero' | 'unisex' | 'nino' | 'nina';

export interface PriceTier {
  minQuantity: number;
  pricePerUnit: number;
  label: string; // e.g., "1 - 11 unds", "12 - 49 unds", "50+ unds"
}

export interface SizeStock {
  size: string; // 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '38', '40', etc.
  stock: number;
  minAlert: number;
  gender?: GarmentGender;
}

export interface UniformProduct {
  id: string;
  code: string; // e.g., "UNI-OVR-01"
  name: string;
  category: UniformCategory;
  description: string;
  fabric: string; // e.g., "Dril Vulcano 100% Algodón 280g/m²"
  safetyNorms: string[]; // e.g., ["NFPA 2112", "ANSI/ISEA 107"]
  colors: string[];
  availableGenders?: GarmentGender[]; // ['dama', 'caballero', 'unisex']
  basePrice: number; // Precio al detal (1 unidad)
  priceTiers: PriceTier[]; // Precios escalonados al por mayor
  sizeStock: SizeStock[];
  totalStock: number;
  minStockLevel: number;
  imageUrl?: string;
  featured?: boolean;
}

export type OrderStatus = 
  | 'pendiente'
  | 'en_confeccion'
  | 'en_bordado'
  | 'control_calidad'
  | 'listo_despacho'
  | 'en_ruta'
  | 'entregado'
  | 'cancelado';

export interface CustomizationDetail {
  embroideryType: 'ninguno' | 'bordado_pecho' | 'bordado_espalda' | 'estampado_reflectivo' | 'logo_doble';
  embroideryText?: string;
  notes?: string;
  extraCostPerUnit: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  category: UniformCategory;
  gender?: GarmentGender; // 'dama' | 'caballero' | 'unisex' | 'nino' | 'nina'
  size: string;
  color: string;
  colorHex?: string; // Código de color hexadecimal exacto (ej. #1E3A8A)
  colorCode?: string; // Código de color textil o Pantone (ej. Pantone 286 C)
  detailedDescription?: string; // Texto detallando especificaciones de confección de la prenda
  quantity: number;
  unitPrice: number;
  customization: CustomizationDetail;
  subtotal: number;
}

export interface DeliveryInfo {
  companyName: string;
  taxId: string; // NIT / RUT
  recipientName: string;
  recipientRoleOrArea: string; // e.g. "Jefe de Almacén y EPP"
  phone: string;
  email: string;
  address: string;
  city: string;
  branch: string; // e.g. "Planta Industrial Norte / Sede Principal"
  deliveryNotes?: string; // e.g., "Entregar en muelle 4 con documento de identidad y casco"
}

export interface OrderEvent {
  id: string;
  status: OrderStatus;
  timestamp: string;
  updatedByUserName: string;
  updatedByUserRole: string;
  comment: string;
  trackingNumber?: string;
  carrierName?: string;
}

export interface OrderReferenceImage {
  id: string;
  url: string; // Base64 data URL o URL de imagen
  name: string; // Nombre del archivo o etiqueta
  uploadedAt: string; // Timestamp ISO
  uploadedByName: string; // Nombre de quien subió la imagen
  garmentItemId?: string; // ID de la prenda específica o "general"
  garmentItemName?: string; // Nombre de la prenda asociada (ej. "Overol Industrial Dril")
  notes?: string; // Especificaciones o anotaciones de la muestra
  fileSizeBytes?: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., "PED-2026-0042"
  createdAt: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  
  // Who makes the order (salesperson / internal employee)
  createdByUserId: string;
  createdByUserName: string;
  createdByUserEmail: string;
  
  // Delivery destination and client information
  deliveryInfo: DeliveryInfo;
  
  // Items in the order
  items: OrderItem[];
  
  // Financial breakdown
  subtotal: number;
  customizationTotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number; // e.g. 19%
  taxAmount: number;
  total: number;
  
  // Status and Tracking
  status: OrderStatus;
  carrierName?: string;
  trackingNumber?: string;
  events: OrderEvent[];
  
  internalNotes?: string;
  referenceImages?: OrderReferenceImage[];
}

export interface ClientCompany {
  id: string;
  name: string;
  taxId: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  branches: string[];
  totalOrdersCount: number;
}

export type Client = ClientCompany;

export interface ThemeColorsConfig {
  presetId?: string; // 'amber' | 'navy' | 'emerald' | 'red' | 'orange' | 'purple' | 'custom'
  primaryColor: string; // e.g. '#f59e0b'
  primaryHoverColor?: string; // e.g. '#d97706'
  primaryTextColor?: string; // e.g. '#020617' or '#ffffff'
  headerBgColor: string; // e.g. '#0f172a'
  headerTextColor?: string; // e.g. '#ffffff'
  accentColor: string; // e.g. '#f59e0b'
}

export interface CustomTextsConfig {
  companyShortName?: string; // e.g. "JF12"
  companySlogan?: string; // e.g. "Dotaciones & Uniformes Industriales"
  navbarBadge?: string; // e.g. "Industrial"
  
  // Modulo Pedidos
  ordersTitle?: string;
  ordersSubtitle?: string;
  
  // Modulo Inventario
  inventoryTitle?: string;
  inventorySubtitle?: string;
  
  // Modulo Rastreo / Trazabilidad
  trackingTitle?: string;
  trackingSubtitle?: string;
  
  // Modulo Catálogo
  catalogTitle?: string;
  catalogSubtitle?: string;
  
  // Modulo Reportes
  reportsTitle?: string;
  reportsSubtitle?: string;
  
  // Nota de Entrega / Remisión Impresa
  deliveryNoteTitle?: string; // e.g. "REMISIÓN DE DOTACIÓN & NOTA DE ENTREGA"
  deliveryNoteSubtitle?: string; // e.g. "Documento Oficial de Confección, Entrega y Trazabilidad"
  deliveryNoteHeaderNote?: string; // e.g. "Favor verificar prendas y acabados al momento de recibir."
  deliveryNoteTerms?: string; // e.g. "Garantía de confección industrial por costuras y materiales..."
  deliverySignatureCompany?: string; // e.g. "Entregado por: Confecciones y Dotaciones Industriales"
  deliverySignatureClient?: string; // e.g. "Recibido a Conformidad por el Cliente (Firma, Cédula y Sello)"
}

export interface SystemConfig {
  companyName: string;
  companyTaxId: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  companyCity: string;
  logoUrl?: string; // Custom company logo (Base64 dataURL or image URL)
  logoHeight?: number; // e.g. 40-80px
  currencySymbol: string;
  defaultTaxRate: number; // e.g., 19
  orderPrefix: string; // e.g., "ORD-"
  minStockGlobalAlert: number;
  embroideryPricing: {
    bordado_pecho: number;
    bordado_espalda: number;
    estampado_reflectivo: number;
    logo_doble: number;
  };
  adminPin: string; // PIN for sensitive actions (e.g. 1234)
  requirePinForSensitiveActions: boolean;
  autoLockMinutes: number; // 0 for disabled, e.g. 5, 10, 15
  
  // Admin visual and text customizations
  themeColors?: ThemeColorsConfig;
  customTexts?: CustomTextsConfig;
}

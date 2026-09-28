import { OrderStatus, UserRole, GarmentGender } from '../types';

export const formatCurrency = (amount: number, symbol: string = '$'): string => {
  return `${symbol} ${Math.round(amount).toLocaleString('es-CO')}`;
};

export const formatDate = (isoString?: string): string => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const formatDateOnly = (isoString?: string): string => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export const ORDER_STATUS_INFO: Record<
  OrderStatus,
  { label: string; step: number; color: string; bg: string; border: string; description: string }
> = {
  pendiente: {
    label: 'Pendiente / Recibido',
    step: 1,
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: 'Pedido registrado en espera de corte o programación en taller.',
  },
  en_confeccion: {
    label: 'En Confección y Corte',
    step: 2,
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Prendas en mesa de trazo, corte y ensamble de piezas.',
  },
  en_bordado: {
    label: 'En Bordado / Estampado',
    step: 3,
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    description: 'Bordado de logos corporativos y aplicación de reflectivos.',
  },
  control_calidad: {
    label: 'Control de Calidad',
    step: 4,
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    description: 'Inspección técnica de medidas, costuras reforzadas y terminados.',
  },
  listo_despacho: {
    label: 'Listo para Despacho',
    step: 5,
    color: 'text-teal-800',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    description: 'Empacado, rotulado y paletizado en zona de muelle de salida.',
  },
  en_ruta: {
    label: 'En Ruta / Despachado',
    step: 6,
    color: 'text-sky-800',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    description: 'En tránsito con transportadora o flota propia hacia el cliente.',
  },
  entregado: {
    label: 'Entregado a Conformidad',
    step: 7,
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'Recibido por el contacto en la sucursal de destino con remisión firmada.',
  },
  cancelado: {
    label: 'Cancelado',
    step: 0,
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    description: 'Orden anulada.',
  },
};

export const ROLE_INFO: Record<
  UserRole,
  { label: string; badgeColor: string; description: string }
> = {
  admin_principal: {
    label: 'Administrador Principal',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    description: 'Control total del sistema: precios base, eliminación, usuarios y configuración global.',
  },
  supervisor_produccion: {
    label: 'Supervisor de Producción',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Gestión de confección, bordado, control de calidad y despacho.',
  },
  asesor_ventas: {
    label: 'Asesor Comercial / Ventas',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Creación de pedidos, catálogo de precios, consulta de clientes y cotizaciones.',
  },
  encargado_despachos: {
    label: 'Logística y Despachos',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Gestión de guías de envío, transportadoras y confirmación de entrega en destino.',
  },
};

export const GARMENT_GENDER_INFO: Record<
  GarmentGender,
  { 
    label: string; 
    shortLabel: string; 
    icon: string; 
    badge: string; 
    activeBadge: string;
    border: string;
    description: string;
    recommendedSizes: string[];
  }
> = {
  dama: {
    label: 'Corte Dama (Femenino)',
    shortLabel: 'Dama',
    icon: '👩',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    activeBadge: 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-300',
    border: 'border-rose-200 hover:border-rose-400',
    description: 'Silueta anatómica femenina entallada, con pinzas de busto y curva en cintura. Tallas XS a 5XL y numéricas 6 a 20.',
    recommendedSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
  },
  caballero: {
    label: 'Corte Caballero (Masculino)',
    shortLabel: 'Caballero',
    icon: '👨',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    activeBadge: 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300',
    border: 'border-blue-200 hover:border-blue-400',
    description: 'Corte clásico recto masculino con amplitud ergonómica en hombros. Tallas XS a 5XL y pantalones 28 a 48.',
    recommendedSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
  },
  unisex: {
    label: 'Corte Unisex (Estándar)',
    shortLabel: 'Unisex',
    icon: '👥',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeBadge: 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300',
    border: 'border-emerald-200 hover:border-emerald-400',
    description: 'Corte estándar industrial holgado y versátil, ideal para cuadrillas mixtas y dotación general. Tallas XS a 5XL.',
    recommendedSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
  },
  nino: {
    label: 'Línea Niño (Infantil)',
    shortLabel: 'Niño',
    icon: '👦',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    activeBadge: 'bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-300',
    border: 'border-sky-200 hover:border-sky-400',
    description: 'Línea infantil y colegial para niños. Tallas desde la 4 hasta la 16 de dos en dos (4, 6, 8, 10, 12, 14, 16).',
    recommendedSizes: ['4', '6', '8', '10', '12', '14', '16'],
  },
  nina: {
    label: 'Línea Niña (Infantil)',
    shortLabel: 'Niña',
    icon: '👧',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    activeBadge: 'bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-300',
    border: 'border-purple-200 hover:border-purple-400',
    description: 'Línea infantil y colegial para niñas. Tallas desde la 4 hasta la 16 de dos en dos (4, 6, 8, 10, 12, 14, 16).',
    recommendedSizes: ['4', '6', '8', '10', '12', '14', '16'],
  },
};

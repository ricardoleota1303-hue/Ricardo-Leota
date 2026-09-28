import { ThemeColorsConfig, CustomTextsConfig } from '../types';

export interface ThemePresetOption {
  id: string;
  name: string;
  description: string;
  theme: ThemeColorsConfig;
  previewBg: string;
  previewAccent: string;
}

export const THEME_PRESETS: ThemePresetOption[] = [
  {
    id: 'amber',
    name: 'JF12 Oro & Grafito (Oficial)',
    description: 'Paleta corporativa original: amarillo ámbar industrial y carbón profundo.',
    previewBg: '#0f172a',
    previewAccent: '#f59e0b',
    theme: {
      presetId: 'amber',
      primaryColor: '#f59e0b',
      primaryHoverColor: '#d97706',
      primaryTextColor: '#020617',
      headerBgColor: '#0f172a',
      headerTextColor: '#ffffff',
      accentColor: '#f59e0b'
    }
  },
  {
    id: 'navy',
    name: 'Azul Marino Industrial & Zafiro',
    description: 'Elegancia institucional de alta resistencia para dotaciones y plantas.',
    previewBg: '#0b1938',
    previewAccent: '#2563eb',
    theme: {
      presetId: 'navy',
      primaryColor: '#2563eb',
      primaryHoverColor: '#1d4ed8',
      primaryTextColor: '#ffffff',
      headerBgColor: '#0b1938',
      headerTextColor: '#ffffff',
      accentColor: '#38bdf8'
    }
  },
  {
    id: 'emerald',
    name: 'Verde Seguridad & EPP',
    description: 'Enfocado en salud ocupacional, brigadas y bioseguridad industrial.',
    previewBg: '#062e24',
    previewAccent: '#059669',
    theme: {
      presetId: 'emerald',
      primaryColor: '#059669',
      primaryHoverColor: '#047857',
      primaryTextColor: '#ffffff',
      headerBgColor: '#062e24',
      headerTextColor: '#ffffff',
      accentColor: '#34d399'
    }
  },
  {
    id: 'red',
    name: 'Rojo Brigada & Alta Visibilidad',
    description: 'Resaltado de alto impacto para plantas de emergencia y operaciones críticas.',
    previewBg: '#1f1315',
    previewAccent: '#dc2626',
    theme: {
      presetId: 'red',
      primaryColor: '#dc2626',
      primaryHoverColor: '#b91c1c',
      primaryTextColor: '#ffffff',
      headerBgColor: '#1f1315',
      headerTextColor: '#ffffff',
      accentColor: '#f87171'
    }
  },
  {
    id: 'orange',
    name: 'Naranja Operaciones & Maquinaria',
    description: 'Color normativo de construcción, vialidad y maquinaria pesada.',
    previewBg: '#1c1917',
    previewAccent: '#ea580c',
    theme: {
      presetId: 'orange',
      primaryColor: '#ea580c',
      primaryHoverColor: '#c2410c',
      primaryTextColor: '#ffffff',
      headerBgColor: '#1c1917',
      headerTextColor: '#ffffff',
      accentColor: '#fb923c'
    }
  },
  {
    id: 'purple',
    name: 'Púrpura Dotaciones VIP & Ejecutivo',
    description: 'Acabado premium y distintivo para uniformes ejecutivos y administrativos.',
    previewBg: '#1a102f',
    previewAccent: '#7c3aed',
    theme: {
      presetId: 'purple',
      primaryColor: '#7c3aed',
      primaryHoverColor: '#6d28d9',
      primaryTextColor: '#ffffff',
      headerBgColor: '#1a102f',
      headerTextColor: '#ffffff',
      accentColor: '#c084fc'
    }
  }
];

export const DEFAULT_THEME_COLORS: ThemeColorsConfig = THEME_PRESETS[0].theme;

export const DEFAULT_CUSTOM_TEXTS: CustomTextsConfig = {
  companyShortName: 'JF12',
  companySlogan: 'Uniformes & Dotaciones Industriales',
  navbarBadge: 'Industrial',
  
  ordersTitle: 'Gestión de Pedidos & Despachos Industriales',
  ordersSubtitle: 'Control integral: quién solicita el pedido, especificaciones de dotación y destinatario final de entrega.',
  
  inventoryTitle: 'Control de Inventario & Existencias de Dotación',
  inventorySubtitle: 'Monitorea existencias por tallas, umbrales de alerta mínima y entrada de lotes de confección.',
  
  trackingTitle: 'Rastreo de Dotaciones & Pedidos Industriales',
  trackingSubtitle: 'Consulta el estado de corte, bordado, despacho y entrega de uniformes con el número de pedido o número de guía de transporte.',
  
  catalogTitle: 'Catálogo Oficial de Precios & Escalas por Volumen',
  catalogSubtitle: 'Tarifas escalonadas para dotaciones corporativas, licitaciones y personalización de bordados técnicos.',
  
  reportsTitle: 'Reportes Mensuales de Ventas & Facturación',
  reportsSubtitle: 'Indicadores de facturación, volumen de prendas, clientes corporativos y rendimiento comercial.',
  
  deliveryNoteTitle: 'Remisión de Dotación & Orden de Despacho',
  deliveryNoteSubtitle: 'Documento Oficial de Confección, Entrega y Trazabilidad',
  deliveryNoteHeaderNote: 'Comprobante formal de entrega y garantía técnica de prendas industriales confeccionadas.',
  deliveryNoteTerms: 'Garantía técnica de confección y costuras reforzadas. Cualquier novedad en tallas o cantidades debe reportarse en un plazo máximo de 5 días hábiles a partir de la firma de este documento.',
  deliverySignatureCompany: 'Entregado por: Confecciones y Dotaciones JF12 S.A.S.',
  deliverySignatureClient: 'Recibido a Conformidad por el Cliente (Firma, Cédula y Sello de Almacén)'
};

export const PRESET_LOGOS = [
  {
    id: 'default_vector',
    name: 'Isotipo Oficial JF12 Monograma (Vectorial)',
    description: 'Monograma geométrico original con inclinación aerodinámica.',
    url: ''
  },
  {
    id: 'industrial_shield',
    name: 'Emblema Escudo Seguridad Industrial',
    description: 'Diseño tipo escudo con casco y engranaje para máxima presencia técnica.',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'modern_textile',
    name: 'Textiles & Confección Moderna',
    description: 'Logo de líneas textiles de alta precisión y calidad.',
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=250'
  }
];

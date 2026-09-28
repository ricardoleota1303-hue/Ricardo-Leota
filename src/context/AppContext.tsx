import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, 
  UniformProduct, 
  Order, 
  OrderStatus, 
  ClientCompany, 
  SystemConfig,
  ProtectedModuleId,
  UserPermissions,
  SecurityAuditLog
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_CLIENTS, 
  INITIAL_ORDERS, 
  INITIAL_CONFIG,
  INITIAL_SECURITY_LOGS
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAdmin: boolean;
  isProduction: boolean;
  isSales: boolean;
  isDispatch: boolean;
  
  // Access Control & Permissions (Delegación por el Administrador)
  canView: (module: ProtectedModuleId) => boolean;
  canEdit: (module: ProtectedModuleId) => boolean;
  updateUserPermissions: (userId: string, permissions: UserPermissions) => boolean;

  // Security & Screen Lock
  isScreenLocked: boolean;
  lockScreen: () => void;
  unlockScreen: (pin: string) => boolean;
  securityLogs: SecurityAuditLog[];
  addSecurityLog: (
    action: string, 
    module: ProtectedModuleId | 'admin' | 'seguridad' | 'sesion', 
    details: string, 
    severity?: 'info' | 'warning' | 'security'
  ) => void;

  // Products & Inventory
  products: UniformProduct[];
  addProduct: (product: Omit<UniformProduct, 'id'>) => void;
  updateProduct: (product: UniformProduct) => void;
  deleteProduct: (productId: string) => boolean;
  adjustProductStock: (productId: string, size: string, quantityChange: number, reason: string) => void;
  lowStockProducts: UniformProduct[];

  // Orders & Tracking
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'events'>) => Order;
  updateOrderStatus: (
    orderId: string, 
    newStatus: OrderStatus, 
    comment: string, 
    carrierName?: string, 
    trackingNumber?: string
  ) => void;
  updateOrder: (order: Order) => void;
  cancelOrder: (orderId: string, reason: string) => void;

  // Clients
  clients: ClientCompany[];
  addClient: (client: Omit<ClientCompany, 'id' | 'totalOrdersCount'>) => ClientCompany;
  updateClient: (client: ClientCompany) => void;

  // Employees & Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (user: User) => void;
  toggleUserActive: (userId: string) => void;
  updateCurrentUserProfile: (profileData: {
    name: string;
    phone: string;
    avatarUrl?: string;
    pin?: string;
    bio?: string;
    shiftHours?: string;
    statusMessage?: string;
    badgeColor?: string;
  }) => boolean;

  // System Config (Admin Only)
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  verifyAdminPin: (pin: string) => boolean;
  resetToDemoData: () => void;

  // Session & Profile Selection
  isSessionAuthenticated: boolean;
  isProfileSelectorOpen: boolean;
  openProfileSelector: () => void;
  closeProfileSelector: () => void;
  selectEmployeeSession: (user: User, pinEntered?: string) => { success: boolean; error?: string };
  logoutSession: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'jf12_users_v2',
  PRODUCTS: 'jf12_products_v2',
  CLIENTS: 'jf12_clients_v2',
  ORDERS: 'jf12_orders_v3',
  CONFIG: 'jf12_config_v2',
  CURRENT_USER_ID: 'jf12_current_user_id_v2',
  SECURITY_LOGS: 'jf12_security_logs_v2',
  SCREEN_LOCKED: 'jf12_screen_locked_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or seed
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Ensure all users have permissions and PIN
        return parsed.map(u => {
          const matchInitial = INITIAL_USERS.find(iu => iu.id === u.id);
          return {
            ...u,
            pin: u.pin || matchInitial?.pin || '1234',
            bio: u.bio || matchInitial?.bio || '',
            shiftHours: u.shiftHours || matchInitial?.shiftHours || 'Lunes a Viernes 8:00 AM - 5:00 PM',
            statusMessage: u.statusMessage || matchInitial?.statusMessage || '🟢 Disponible',
            badgeColor: u.badgeColor || matchInitial?.badgeColor || 'amber',
            permissions: u.permissions || matchInitial?.permissions || {
              pedidos: { canView: u.role === 'admin_principal', canEdit: u.role === 'admin_principal' },
              inventario: { canView: u.role === 'admin_principal', canEdit: u.role === 'admin_principal' },
              reportes: { canView: u.role === 'admin_principal', canEdit: u.role === 'admin_principal' },
              usuarios: { canView: u.role === 'admin_principal', canEdit: u.role === 'admin_principal' },
              seguimiento: { canView: u.role === 'admin_principal', canEdit: u.role === 'admin_principal' },
              catalogo: { canView: u.role === 'admin_principal', canEdit: u.role === 'admin_principal' },
            }
          };
        });
      } catch (e) {
        console.error('Failed to parse saved users, resetting', e);
      }
    }
    return INITIAL_USERS;
  });

  // Profile and Session Selection: Always opens when entering the web app
  const [isSessionAuthenticated, setIsSessionAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('jf12_session_authenticated') === 'true';
  });

  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState<boolean>(() => {
    return sessionStorage.getItem('jf12_session_authenticated') !== 'true';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    // If there is an active session in sessionStorage:
    const sessionAuth = sessionStorage.getItem('jf12_session_authenticated');
    const sessionUserId = sessionStorage.getItem('jf12_session_user_id');
    if (sessionAuth === 'true' && sessionUserId) {
      const found = users.find(u => u.id === sessionUserId);
      if (found) return found;
    }
    // Never start as Admin without explicit PIN authentication!
    const safeEmployee = users.find(u => u.role !== 'admin_principal');
    return safeEmployee || users[1] || INITIAL_USERS[1] || users[0];
  });

  const [products, setProducts] = useState<UniformProduct[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed: UniformProduct[] = JSON.parse(saved);
        return parsed.map(p => {
          const matchInitial = INITIAL_PRODUCTS.find(ip => ip.id === p.id || ip.code === p.code);
          return {
            ...p,
            availableGenders: p.availableGenders || matchInitial?.availableGenders || ['dama', 'caballero', 'unisex'],
          };
        });
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [clients, setClients] = useState<ClientCompany[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      localStorage.removeItem('jf12_orders_v2');
    } catch {
      // ignore
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        const parsed: Order[] = JSON.parse(saved);
        if (parsed.length > 0) {
          return parsed.map(o => ({
            ...o,
            items: o.items.map(it => ({
              ...it,
              gender: it.gender || 'unisex',
            })),
          }));
        }
      } catch {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CONFIG,
          ...parsed,
          companyName: parsed.companyName && !parsed.companyName.includes('InduTextil') ? parsed.companyName : INITIAL_CONFIG.companyName,
          companyTaxId: parsed.companyTaxId && !parsed.companyTaxId.includes('900.582') ? parsed.companyTaxId : INITIAL_CONFIG.companyTaxId,
          themeColors: {
            ...INITIAL_CONFIG.themeColors,
            ...(parsed.themeColors || {})
          },
          customTexts: {
            ...INITIAL_CONFIG.customTexts,
            ...(parsed.customTexts || {})
          }
        };
      } catch (e) {
        console.error('Error parsing config', e);
      }
    }
    return INITIAL_CONFIG;
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SECURITY_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_LOGS;
  });

  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SCREEN_LOCKED) === 'true';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SECURITY_LOGS, JSON.stringify(securityLogs));
  }, [securityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCREEN_LOCKED, isScreenLocked ? 'true' : 'false');
  }, [isScreenLocked]);

  // Roles helpers
  const isAdmin = currentUser.role === 'admin_principal';
  const isProduction = currentUser.role === 'supervisor_produccion' || isAdmin;
  const isSales = currentUser.role === 'asesor_ventas' || isAdmin;
  const isDispatch = currentUser.role === 'encargado_despachos' || isAdmin;

  // Add Security Audit Log Entry
  const addSecurityLog = useCallback((
    action: string, 
    module: ProtectedModuleId | 'admin' | 'seguridad' | 'sesion', 
    details: string, 
    severity: 'info' | 'warning' | 'security' = 'info'
  ) => {
    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      details,
      severity
    };
    setSecurityLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, [currentUser]);

  // Check Granular Visibility Permission
  const canView = useCallback((module: ProtectedModuleId): boolean => {
    // Master Administrator always has full permission
    if (isAdmin) return true;
    // Check user's specific permissions granted by admin
    return Boolean(currentUser.permissions?.[module]?.canView);
  }, [isAdmin, currentUser]);

  // Check Granular Edit/Action Permission
  const canEdit = useCallback((module: ProtectedModuleId): boolean => {
    // Master Administrator always has full permission
    if (isAdmin) return true;
    // Check user's specific permissions granted by admin
    return Boolean(currentUser.permissions?.[module]?.canEdit);
  }, [isAdmin, currentUser]);

  // Update User Permissions (Admin Only)
  const updateUserPermissions = (userId: string, newPermissions: UserPermissions): boolean => {
    if (!isAdmin) {
      addSecurityLog(
        'INTENTO_VIOLACION_SEGURIDAD',
        'usuarios',
        `Usuario ${currentUser.name} intentó modificar permisos sin privilegios de Administrador Principal`,
        'security'
      );
      return false;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, permissions: newPermissions };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, permissions: newPermissions }));
    }

    const targetUser = users.find(u => u.id === userId);
    addSecurityLog(
      'PERMISOS_ACTUALIZADOS',
      'usuarios',
      `El Administrador Principal ${currentUser.name} actualizó la matriz de permisos para el empleado ${targetUser?.name || userId}`,
      'security'
    );

    return true;
  };

  // Lock and Unlock Screen with PIN
  const lockScreen = () => {
    setIsScreenLocked(true);
    addSecurityLog('BLOQUEO_TERMINAL_MANUAL', 'sesion', `Terminal bloqueada por el usuario ${currentUser.name}`, 'info');
  };

  const unlockScreen = (pin: string): boolean => {
    const isMasterPin = pin === config.adminPin;
    const isUserPin = currentUser.pin && pin === currentUser.pin;

    if (isMasterPin || isUserPin) {
      setIsScreenLocked(false);
      addSecurityLog('DESBLOQUEO_TERMINAL_EXITOSO', 'sesion', `Terminal desbloqueada exitosamente por ${currentUser.name}`, 'info');
      return true;
    }

    addSecurityLog('INTENTO_DESBLOQUEO_FALLIDO', 'sesion', `Intento de desbloqueo fallido con PIN erróneo en sesión de ${currentUser.name}`, 'warning');
    return false;
  };

  // Low stock products
  const lowStockProducts: UniformProduct[] = [];

  // Products CRUD (Catálogo de Dotaciones)
  const addProduct = (productData: Omit<UniformProduct, 'id'>) => {
    if (!canEdit('catalogo')) {
      console.warn('Permiso denegado: No tienes autorización para agregar productos al catálogo.');
      return;
    }
    const newProduct: UniformProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts(prev => [newProduct, ...prev]);
    addSecurityLog('CREACION_PRENDA_CATALOGO', 'catalogo', `Prenda creada: ${newProduct.name} (${newProduct.code})`, 'info');
  };

  const updateProduct = (updated: UniformProduct) => {
    if (!canEdit('catalogo')) {
      console.warn('Permiso denegado: No tienes autorización para editar prendas del catálogo.');
      return;
    }
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    addSecurityLog('EDICION_PRENDA_CATALOGO', 'catalogo', `Prenda actualizada: ${updated.name} (${updated.code})`, 'info');
  };

  const deleteProduct = (productId: string): boolean => {
    if (!canEdit('catalogo')) {
      console.warn('Permiso denegado: No tienes autorización para eliminar prendas del catálogo.');
      return false;
    }
    const target = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    addSecurityLog('ELIMINACION_PRENDA_CATALOGO', 'catalogo', `Prenda eliminada: ${target?.name || productId}`, 'warning');
    return true;
  };

  const adjustProductStock = (productId: string, size: string, quantityChange: number, _reason: string) => {
    setProducts(prev => prev.map(prod => {
      if (prod.id !== productId) return prod;
      return {
        ...prod,
        sizeStock: prod.sizeStock.map(s => {
          if (s.size !== size) return s;
          const updatedStock = Math.max(0, s.stock + quantityChange);
          return { ...s, stock: updatedStock };
        })
      };
    }));
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'events'>): Order => {
    if (!canEdit('pedidos')) {
      throw new Error('Permiso denegado: No tienes autorización para crear pedidos.');
    }

    // Start strictly from order 1: PED-0001
    const orderNumbers = orders.map(o => {
      const match = o.orderNumber.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const nextSeqNum = orderNumbers.length > 0 ? Math.max(...orderNumbers) + 1 : 1;
    const orderSeq = nextSeqNum.toString().padStart(4, '0');
    const orderNumber = `${config.orderPrefix || 'PED-'}${orderSeq}`;
    const now = new Date().toISOString();

    const initialEvent = {
      id: `evt-${Date.now()}-1`,
      status: 'borrador' as OrderStatus,
      timestamp: now,
      updatedByUserName: currentUser.name,
      updatedByUserRole: currentUser.role,
      comment: 'Pedido industrial ingresado y registrado en el sistema JF12.'
    };

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: now,
      events: [initialEvent],
    };

    // Deduct stock for inventory tracking
    newOrder.items.forEach(item => {
      adjustProductStock(
        item.productId, 
        item.size, 
        -item.quantity, 
        `Reserva por pedido ${orderNumber} para ${newOrder.deliveryInfo.companyName}`
      );
    });

    setOrders(prev => [newOrder, ...prev]);

    // Update client total orders
    setClients(prev => prev.map(c => {
      if (c.name.toLowerCase() === newOrder.deliveryInfo.companyName.toLowerCase() || c.taxId === newOrder.deliveryInfo.taxId) {
        return { ...c, totalOrdersCount: c.totalOrdersCount + 1 };
      }
      return c;
    }));

    addSecurityLog(
      'CREACION_PEDIDO_INDUSTRIAL',
      'pedidos',
      `Nuevo pedido ${orderNumber} creado para ${newOrder.deliveryInfo.companyName} por valor de $${newOrder.total.toLocaleString()}`,
      'info'
    );

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string, 
    newStatus: OrderStatus, 
    comment: string, 
    carrierName?: string, 
    trackingNumber?: string
  ) => {
    if (!canEdit('pedidos') && !canEdit('seguimiento')) {
      alert('Permiso denegado: No tienes autorización para modificar el estado del pedido.');
      return;
    }

    const now = new Date().toISOString();
    const newEvent = {
      id: `evt-${Date.now()}`,
      status: newStatus,
      timestamp: now,
      updatedByUserName: currentUser.name,
      updatedByUserRole: currentUser.role,
      comment,
      carrierName,
      trackingNumber,
    };

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status: newStatus,
        carrierName: carrierName || o.carrierName,
        trackingNumber: trackingNumber || o.trackingNumber,
        actualDeliveryDate: newStatus === 'entregado' ? now : o.actualDeliveryDate,
        events: [...o.events, newEvent],
      };
    }));

    addSecurityLog(
      'CAMBIO_ESTADO_PEDIDO',
      'pedidos',
      `Pedido ${orderId} actualizado a etapa: ${newStatus}. ${comment}`,
      'info'
    );
  };

  const updateOrder = (updated: Order) => {
    if (!canEdit('pedidos')) {
      alert('Permiso denegado: No tienes autorización para editar pedidos.');
      return;
    }
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    addSecurityLog('EDICION_PEDIDO', 'pedidos', `Pedido ${updated.orderNumber} modificado`, 'info');
  };

  const cancelOrder = (orderId: string, reason: string) => {
    if (!canEdit('pedidos')) {
      alert('Permiso denegado: No tienes autorización para cancelar pedidos.');
      return;
    }
    const target = orders.find(o => o.id === orderId);
    if (!target) return;
    
    // Restock items
    target.items.forEach(item => {
      adjustProductStock(item.productId, item.size, item.quantity, `Reingreso por cancelación pedido ${target.orderNumber}`);
    });

    updateOrderStatus(orderId, 'cancelado', `Cancelación de pedido: ${reason}`);
    addSecurityLog('CANCELACION_PEDIDO', 'pedidos', `Pedido ${target.orderNumber} cancelado. Motivo: ${reason}`, 'warning');
  };

  // Clients
  const addClient = (clientData: Omit<ClientCompany, 'id' | 'totalOrdersCount'>): ClientCompany => {
    const newClient: ClientCompany = {
      ...clientData,
      id: `cli-${Date.now()}`,
      totalOrdersCount: 0,
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (updated: ClientCompany) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Users
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (!isAdmin) {
      alert('Acceso denegado: Solo el Administrador Principal puede crear nuevos usuarios.');
      return;
    }
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      pin: userData.pin || '1234',
      permissions: userData.permissions || {
        pedidos: { canView: false, canEdit: false },
        inventario: { canView: false, canEdit: false },
        reportes: { canView: false, canEdit: false },
        usuarios: { canView: false, canEdit: false },
        seguimiento: { canView: false, canEdit: false },
        catalogo: { canView: false, canEdit: false },
      }
    };
    setUsers(prev => [...prev, newUser]);
    addSecurityLog('CREACION_USUARIO_EMPLEADO', 'usuarios', `Empleado registrado: ${newUser.name} (${newUser.email}) - Cargo: ${newUser.department}`, 'security');
  };

  const updateUser = (updated: User) => {
    if (!isAdmin) {
      alert('Acceso denegado: Solo el Administrador Principal puede modificar empleados.');
      return;
    }
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
    addSecurityLog('EDICION_USUARIO_EMPLEADO', 'usuarios', `Datos de empleado modificados: ${updated.name}`, 'security');
  };

  const toggleUserActive = (userId: string) => {
    if (!isAdmin) {
      alert('Acceso denegado: Solo el Administrador Principal puede activar o desactivar empleados.');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.active;
        addSecurityLog('CAMBIO_ESTADO_CUENTA', 'usuarios', `Cuenta de ${u.name} marcada como ${nextState ? 'ACTIVA' : 'INACTIVA'}`, 'security');
        return { ...u, active: nextState };
      }
      return u;
    }));
  };

  // Profile customization for EVERY employee
  const updateCurrentUserProfile = (profileData: {
    name: string;
    phone: string;
    avatarUrl?: string;
    pin?: string;
    bio?: string;
    shiftHours?: string;
    statusMessage?: string;
    badgeColor?: string;
  }): boolean => {
    const updatedUser: User = {
      ...currentUser,
      name: profileData.name.trim() || currentUser.name,
      phone: profileData.phone.trim() || currentUser.phone,
      avatarUrl: profileData.avatarUrl || currentUser.avatarUrl,
      pin: profileData.pin ? profileData.pin.trim() : currentUser.pin,
      bio: profileData.bio !== undefined ? profileData.bio : currentUser.bio,
      shiftHours: profileData.shiftHours !== undefined ? profileData.shiftHours : currentUser.shiftHours,
      statusMessage: profileData.statusMessage !== undefined ? profileData.statusMessage : currentUser.statusMessage,
      badgeColor: profileData.badgeColor || currentUser.badgeColor,
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    addSecurityLog(
      'ACTUALIZACION_PERFIL_PERSONAL',
      'usuarios',
      `El empleado ${updatedUser.name} (${updatedUser.department}) actualizó su perfil personal (avatar/foto, PIN o datos de contacto)`,
      'info'
    );

    return true;
  };

  // System Config
  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    if (!isAdmin) {
      alert('Acceso denegado: Solo el Administrador Principal puede modificar las configuraciones del sistema.');
      return;
    }
    setConfig(prev => ({ ...prev, ...newConfig }));
    addSecurityLog('MODIFICACION_CONFIGURACION_SISTEMA', 'admin', 'Configuraciones globales de JF12 actualizadas', 'security');
  };

  const verifyAdminPin = (pin: string): boolean => {
    return pin === config.adminPin;
  };

  const openProfileSelector = () => {
    setIsProfileSelectorOpen(true);
  };

  const closeProfileSelector = () => {
    if (isSessionAuthenticated) {
      setIsProfileSelectorOpen(false);
    }
  };

  const selectEmployeeSession = (targetUser: User, pinEntered?: string): { success: boolean; error?: string } => {
    // 1. If target is Administrator Principal, strict verification of Admin PIN
    if (targetUser.role === 'admin_principal') {
      if (!pinEntered || pinEntered.trim() === '') {
        return { success: false, error: 'Se requiere el PIN Maestro de Administrador para este perfil.' };
      }
      if (pinEntered !== config.adminPin) {
        addSecurityLog(
          'ACCESO_ADMIN_DENEGADO',
          'seguridad',
          `Intento fallido de ingreso al perfil de Administrador Principal (${targetUser.name}) con PIN erróneo.`,
          'security'
        );
        return { success: false, error: 'PIN de Administrador incorrecto. Acceso restringido exclusivamente a la Dirección General.' };
      }

      // PIN matches Admin PIN!
      setCurrentUser(targetUser);
      setIsSessionAuthenticated(true);
      setIsProfileSelectorOpen(false);
      try {
        sessionStorage.setItem('jf12_session_authenticated', 'true');
        sessionStorage.setItem('jf12_session_user_id', targetUser.id);
      } catch {
        // ignore
      }
      addSecurityLog(
        'ACCESO_ADMIN_EXITOSO',
        'sesion',
        `El Administrador Principal ${targetUser.name} ingresó al sistema con autenticación de PIN Maestro.`,
        'info'
      );
      return { success: true };
    }

    // 2. Operational Employee Profile
    // If the employee has a configured personal PIN and entered a PIN:
    if (targetUser.pin && pinEntered && pinEntered.trim() !== '') {
      if (pinEntered !== targetUser.pin && pinEntered !== config.adminPin) {
        return { success: false, error: 'El PIN ingresado no coincide con el perfil del empleado.' };
      }
    }

    setCurrentUser(targetUser);
    setIsSessionAuthenticated(true);
    setIsProfileSelectorOpen(false);
    try {
      sessionStorage.setItem('jf12_session_authenticated', 'true');
      sessionStorage.setItem('jf12_session_user_id', targetUser.id);
    } catch {
      // ignore
    }
    addSecurityLog(
      'INICIO_TURNO_EMPLEADO',
      'sesion',
      `Empleado ${targetUser.name} inició su turno en el cargo de ${targetUser.department || targetUser.role}.`,
      'info'
    );
    return { success: true };
  };

  const logoutSession = () => {
    try {
      sessionStorage.removeItem('jf12_session_authenticated');
      sessionStorage.removeItem('jf12_session_user_id');
    } catch {
      // ignore
    }
    setIsSessionAuthenticated(false);
    setIsProfileSelectorOpen(true);
    // Switch currentUser to a default safe non-admin employee
    const safeEmployee = users.find(u => u.role !== 'admin_principal');
    if (safeEmployee) {
      setCurrentUser(safeEmployee);
    }
    addSecurityLog(
      'CIERRE_TURNO_SESION',
      'sesion',
      `Sesión de trabajo finalizada. Retorno a pantalla de selección de empleado y cargo.`,
      'info'
    );
  };

  const resetToDemoData = () => {
    if (!isAdmin) return;
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setProducts(INITIAL_PRODUCTS);
    setClients(INITIAL_CLIENTS);
    setOrders(INITIAL_ORDERS);
    setConfig(INITIAL_CONFIG);
    setSecurityLogs(INITIAL_SECURITY_LOGS);
    localStorage.clear();
    addSecurityLog('REINICIO_DATOS_DEMO', 'admin', 'Base de datos restaurada a valores iniciales de JF12 por el Administrador Maestro', 'security');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAdmin,
        isProduction,
        isSales,
        isDispatch,
        canView,
        canEdit,
        updateUserPermissions,
        isScreenLocked,
        lockScreen,
        unlockScreen,
        securityLogs,
        addSecurityLog,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustProductStock,
        lowStockProducts,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrder,
        cancelOrder,
        clients,
        addClient,
        updateClient,
        users,
        addUser,
        updateUser,
        toggleUserActive,
        updateCurrentUserProfile,
        config,
        updateConfig,
        verifyAdminPin,
        resetToDemoData,
        isSessionAuthenticated,
        isProfileSelectorOpen,
        openProfileSelector,
        closeProfileSelector,
        selectEmployeeSession,
        logoutSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

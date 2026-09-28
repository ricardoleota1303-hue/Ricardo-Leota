import React from 'react';
import { 
  X, 
  ClipboardList, 
  Search, 
  Tag, 
  BarChart3, 
  Users, 
  Settings, 
  PlusCircle, 
  Lock, 
  LogOut, 
  UserCog, 
  ShieldCheck, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_INFO } from '../../utils/formatters';
import { Logo } from '../Logo';
import { ProtectedModuleId } from '../../types';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateOrder: () => void;
  onOpenProfile: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenCreateOrder,
  onOpenProfile,
}) => {
  const { 
    currentUser, 
    isAdmin, 
    canView, 
    canEdit, 
    config, 
    lockScreen, 
    logoutSession 
  } = useApp();

  if (!isOpen) return null;

  const primaryThemeColor = config.themeColors?.primaryColor || '#f59e0b';
  const primaryTextColor = config.themeColors?.primaryTextColor || '#020617';
  const accentThemeColor = config.themeColors?.accentColor || '#f59e0b';

  const menuItems = [
    {
      id: 'pedidos',
      label: 'Pedidos y Entregas',
      subtitle: 'Órdenes de dotación, remisiones y muestras',
      icon: ClipboardList,
      moduleId: 'pedidos' as ProtectedModuleId,
    },
    {
      id: 'seguimiento',
      label: 'Rastreo y Guías',
      subtitle: 'Trazabilidad y transportadoras en tiempo real',
      icon: Search,
      moduleId: 'seguimiento' as ProtectedModuleId,
    },
    {
      id: 'catalogo',
      label: 'Catálogo de Precios',
      subtitle: 'Escalas por volumen, fichas técnicas y simulador',
      icon: Tag,
      moduleId: 'catalogo' as ProtectedModuleId,
    },
    {
      id: 'reportes',
      label: 'Reportes Mensuales',
      subtitle: 'Finanzas, volumen entregado y balance de metas',
      icon: BarChart3,
      moduleId: 'reportes' as ProtectedModuleId,
    },
    {
      id: 'usuarios',
      label: 'Gestión de Empleados',
      subtitle: 'Control de turnos, roles y permisos individuales',
      icon: Users,
      moduleId: 'usuarios' as ProtectedModuleId,
    },
    {
      id: 'admin',
      label: 'Control Administrador',
      subtitle: 'Parámetros del sistema, textos y auditoría de seguridad',
      icon: Settings,
      moduleId: 'admin' as const,
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  const handleCreateOrderClick = () => {
    onClose();
    onOpenCreateOrder();
  };

  const handleLockClick = () => {
    onClose();
    lockScreen();
  };

  const handleLogoutClick = () => {
    onClose();
    logoutSession();
  };

  const handleProfileClick = () => {
    onClose();
    onOpenProfile();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xs bg-slate-900 text-white shadow-2xl border-l border-slate-800 flex flex-col justify-between overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center space-x-2.5">
              <div className="bg-white p-1.5 rounded-lg shadow-sm">
                <Logo className="h-6 w-auto" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>{config.customTexts?.companyShortName || 'JF12'}</span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800">
                    Móvil
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Menú de Navegación</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Active User Card */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2.5 shadow-sm">
              <div className="flex items-center space-x-2.5">
                <img 
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                  alt={currentUser.name} 
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400/80 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-400 font-semibold truncate flex items-center gap-1">
                    <span>{ROLE_INFO[currentUser.role]?.label}</span>
                    {isAdmin && (
                      <span className="text-[8px] bg-red-950 text-red-300 border border-red-800 px-1 rounded font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.department}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex gap-2">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="flex-1 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCog className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mi Perfil</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="py-1.5 px-2 bg-slate-700/70 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slate-600 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Cambiar turno / empleado"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Turno</span>
                </button>
              </div>
            </div>

            {/* Quick Action Button: New Order */}
            {canEdit('pedidos') && (
              <button
                type="button"
                onClick={handleCreateOrderClick}
                style={{ backgroundColor: primaryThemeColor, color: primaryTextColor }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-opacity hover:opacity-90 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Crear Nuevo Pedido de Dotación</span>
              </button>
            )}

            {/* Modules List */}
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Módulos del Sistema</span>
                <span className="text-[10px] text-slate-500 font-normal">Acceso directo</span>
              </div>

              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isAccessible = item.id === 'admin'
                  ? isAdmin
                  : canView(item.moduleId as ProtectedModuleId);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : isAccessible
                        ? 'hover:bg-slate-800 text-slate-200'
                        : 'text-slate-500 hover:bg-slate-800/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs leading-tight truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.subtitle}</div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {!isAccessible ? (
                        <Lock className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Terminal Utilities */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Seguridad & Terminal
              </div>

              <button
                type="button"
                onClick={handleLockClick}
                className="w-full flex items-center space-x-2.5 p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors text-left cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold text-xs">Bloquear Pantalla de Terminal</div>
                  <div className="text-[10px] text-slate-400">Requiere PIN para desbloquear</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full flex items-center space-x-2.5 p-2 rounded-lg text-slate-300 hover:text-red-300 hover:bg-slate-800 transition-colors text-left cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-xs">Cambiar de Empleado</div>
                  <div className="text-[10px] text-slate-400">Elegir otro cargo o turno de trabajo</div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>JF12 Uniformes v2.4</span>
            </span>
            <span className="text-slate-400 font-mono">Diseño Móvil & Tablet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

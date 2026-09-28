import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_INFO } from '../utils/formatters';
import { Logo } from './Logo';
import { ProtectedModuleId, User } from '../types';
import { ProfileModal } from './Users/ProfileModal';
import { MobileNavDrawer } from './Navigation/MobileNavDrawer';
import { 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Search, 
  Tag, 
  BarChart3, 
  Users, 
  Settings, 
  Lock, 
  ShieldAlert, 
  ChevronDown, 
  PlusCircle, 
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  UserCog,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  LogOut,
  UserCheck,
  Menu
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateOrder: () => void;
  isMobileDrawerOpen?: boolean;
  setIsMobileDrawerOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenCreateOrder,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    isAdmin, 
    canView, 
    canEdit, 
    lowStockProducts, 
    config, 
    lockScreen,
    verifyAdminPin,
    logoutSession,
    openProfileSelector
  } = useApp();
  
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const showDrawer = isMobileDrawerOpen !== undefined ? isMobileDrawerOpen : internalDrawerOpen;
  const setDrawerOpen = setIsMobileDrawerOpen || setInternalDrawerOpen;

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [targetUserForAuth, setTargetUserForAuth] = useState<User | null>(null);
  const [authPinInput, setAuthPinInput] = useState('');
  const [authPinError, setAuthPinError] = useState(false);
  const [showAuthPin, setShowAuthPin] = useState(false);

  const handleSelectUser = (u: User) => {
    setShowUserDropdown(false);
    if (u.id === currentUser.id) return;

    // Any worker trying to switch to Admin must enter the Admin PIN
    if (u.role === 'admin_principal' && currentUser.role !== 'admin_principal') {
      setTargetUserForAuth(u);
      setAuthPinInput('');
      setAuthPinError(false);
      return;
    }

    // If a non-admin employee tries to switch to another user profile, verify that user's PIN or admin PIN
    if (currentUser.role !== 'admin_principal') {
      setTargetUserForAuth(u);
      setAuthPinInput('');
      setAuthPinError(false);
      return;
    }

    // Admin switching to another profile for testing
    setCurrentUser(u);
  };

  const handleAuthPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForAuth) return;

    const isTargetAdmin = targetUserForAuth.role === 'admin_principal';
    const isMasterValid = verifyAdminPin(authPinInput);
    const isUserPinValid = !isTargetAdmin && targetUserForAuth.pin && authPinInput === targetUserForAuth.pin;

    if (isTargetAdmin ? isMasterValid : (isMasterValid || isUserPinValid)) {
      setCurrentUser(targetUserForAuth);
      setTargetUserForAuth(null);
      setAuthPinInput('');
      setAuthPinError(false);
    } else {
      setAuthPinError(true);
    }
  };

  const tabs: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number | null;
    moduleId?: ProtectedModuleId | 'admin';
  }[] = [
    { id: 'pedidos', label: 'Pedidos y Entregas', icon: ClipboardList, moduleId: 'pedidos' },
    { id: 'seguimiento', label: 'Rastreo y Guías', icon: Search, moduleId: 'seguimiento' },
    { id: 'catalogo', label: 'Catálogo de Precios', icon: Tag, moduleId: 'catalogo' },
    { id: 'reportes', label: 'Reportes Mensuales', icon: BarChart3, moduleId: 'reportes' },
    { id: 'usuarios', label: 'Gestión de Empleados', icon: Users, moduleId: 'usuarios' },
    { id: 'admin', label: 'Control Administrador', icon: Settings, moduleId: 'admin' },
  ];

  const hasOrderCreationPermission = canEdit('pedidos');

  const brandShortName = config.customTexts?.companyShortName || 'JF12';
  const brandSlogan = config.customTexts?.companySlogan || 'Dotaciones & Uniformes';
  const navbarBadge = config.customTexts?.navbarBadge || 'Industrial';
  const headerBgColor = config.themeColors?.headerBgColor || '#0f172a';
  const primaryThemeColor = config.themeColors?.primaryColor || '#f59e0b';
  const primaryTextColor = config.themeColors?.primaryTextColor || '#020617';
  const accentThemeColor = config.themeColors?.accentColor || '#f59e0b';

  return (
    <header 
      style={{ backgroundColor: headerBgColor }} 
      className="text-white border-b border-white/10 sticky top-0 z-40 shadow-md transition-colors"
    >
      {/* Top bar info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-white px-2.5 py-1.5 rounded-xl shadow-md border border-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <Logo className="h-7 w-auto" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">{brandShortName}</span>
                <span 
                  style={{ borderColor: `${accentThemeColor}50`, color: accentThemeColor, backgroundColor: `${accentThemeColor}20` }}
                  className="text-[10px] uppercase px-2 py-0.5 rounded font-bold border"
                >
                  {navbarBadge}
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Seguridad Activa
                </span>
              </div>
              <p className="text-xs text-slate-300/80 hidden sm:block">
                {config.companyName} • {brandSlogan}
              </p>
            </div>
          </div>

          {/* Quick Actions, Lock Screen & User Switcher */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* New Order Button (Restricted if no edit permission) */}
            {hasOrderCreationPermission ? (
              <button
                id="btn-nav-crear-pedido"
                onClick={onOpenCreateOrder}
                style={{ backgroundColor: primaryThemeColor, color: primaryTextColor }}
                className="flex items-center space-x-1.5 sm:space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-opacity hover:opacity-90 shadow-sm cursor-pointer"
                title="Crear Nuevo Pedido de Dotación"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Pedido</span>
              </button>
            ) : (
              <div 
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 text-xs"
                title="Creación restringida: Requiere permiso de edición otorgado por el Administrador"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Solo Lectura</span>
              </div>
            )}

            {/* Lock Terminal Button */}
            <button
              id="btn-lock-terminal"
              onClick={lockScreen}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs font-medium cursor-pointer transition-colors"
              title="Bloquear Terminal JF12 por Seguridad (Requiere PIN para desbloquear)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Bloquear</span>
            </button>

            {/* Personalize Profile Button for Current Employee */}
            <button
              id="btn-personalizar-perfil"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              title="Personalizar mi foto, PIN de seguridad y perfil"
            >
              <UserCog className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Mi Perfil</span>
            </button>

            {/* Logout / Change Employee Shift Button */}
            <button
              id="btn-cerrar-turno"
              onClick={logoutSession}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800/60 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              title="Cerrar turno actual y seleccionar otro empleado o cargo"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden xl:inline">Cerrar Turno</span>
            </button>

            {/* Current User & Role Selector */}
            <div className="relative">
              <button
                id="btn-user-switcher"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-slate-600"
                />
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-slate-100 leading-tight">{currentUser.name.split(' ')[0]}</div>
                  <div className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                    {ROLE_INFO[currentUser.role]?.label}
                    {isAdmin && <span className="text-[9px] bg-red-950 text-red-300 border border-red-800 px-1 rounded">MASTER</span>}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div 
                  id="dropdown-role-selector"
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* Current Active Employee Card with Personalize Button */}
                  <div className="mx-1 mb-2 p-2 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <img 
                        src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                        alt={currentUser.name} 
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-amber-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                        <div className="text-[10px] text-amber-400 font-medium truncate">{currentUser.statusMessage || '🟢 En servicio'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowProfileModal(true);
                      }}
                      className="ml-2 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
                    >
                      <UserCog className="w-3 h-3" />
                      <span>Personalizar</span>
                    </button>
                  </div>

                  <div className="px-3 py-2 border-b border-slate-700/80 mb-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Cambio de Sesión / Empleado</p>
                      <span className="text-[10px] text-slate-400 font-mono">JF12-RBAC</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Verifica cómo cada empleado solo puede ver y editar lo que el Administrador Principal le ha autorizado:
                    </p>
                  </div>
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      const isUserAdmin = u.role === 'admin_principal';
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSelectUser(u)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' 
                              : 'hover:bg-slate-700/60 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                            <div>
                              <div className="font-medium text-slate-100 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isUserAdmin && (
                                  <span className="text-[9px] font-bold px-1 rounded bg-red-900/80 text-red-200 border border-red-700">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">{u.department}</div>
                            </div>
                          </div>
                          
                          {/* Mini badges of permissions */}
                          <div className="text-[9px] text-right text-slate-400">
                            {isUserAdmin ? (
                              <span className="text-emerald-400 font-bold">Control Total</span>
                            ) : (
                              <span>
                                {[
                                  u.permissions?.pedidos?.canView ? 'Ped' : null,
                                  u.permissions?.reportes?.canView ? 'Rep' : null,
                                  u.permissions?.usuarios?.canView ? 'Emp' : null,
                                ].filter(Boolean).join(' • ') || 'Sin acceso'}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-700/80 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        logoutSession();
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Elegir Otro Empleado / Cerrar Turno</span>
                    </button>

                    <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Acceso seguro JF12</span>
                      </span>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          lockScreen();
                        }}
                        className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                      >
                        Bloquear Pantalla
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Drawer Toggle Button */}
            <button
              type="button"
              id="btn-mobile-menu-drawer"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden flex items-center justify-center p-2 rounded-xl bg-slate-800 text-amber-400 hover:text-white border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer shadow-xs shrink-0"
              title="Abrir menú completo con todos los módulos y opciones"
              aria-label="Abrir menú de opciones"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            // Check visibility permission
            const isAccessible = tab.id === 'admin' 
              ? isAdmin 
              : canView(tab.id as ProtectedModuleId);

            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={
                  isActive
                    ? {
                        borderBottomColor: accentThemeColor,
                        color: accentThemeColor,
                        backgroundColor: 'rgba(255, 255, 255, 0.12)'
                      }
                    : undefined
                }
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-b-2 shadow-sm font-bold'
                    : isAccessible
                    ? 'text-slate-300 hover:text-white hover:bg-white/10'
                    : 'text-slate-500 hover:text-slate-400 hover:bg-white/5 opacity-70'
                }`}
                title={isAccessible ? `Módulo ${tab.label}` : `Restringido: Requiere permiso del Administrador`}
              >
                <Icon 
                  style={isActive ? { color: accentThemeColor } : undefined}
                  className={`w-4 h-4 ${isActive ? '' : isAccessible ? 'text-slate-400' : 'text-slate-600'}`} 
                />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                    {tab.badge}
                  </span>
                )}

                {/* Lock icon if user is NOT authorized to view */}
                {!isAccessible && (
                  <span className="text-red-400 ml-0.5" title="Bloqueado por seguridad: Requiere autorización del Administrador">
                    <Lock className="w-3 h-3 inline" />
                  </span>
                )}

                {/* If user can VIEW but cannot EDIT */}
                {isAccessible && tab.id !== 'admin' && !canEdit(tab.id as ProtectedModuleId) && (
                  <span className="text-[9px] text-sky-400 ml-1 px-1 py-0.2 rounded bg-sky-950/80 border border-sky-800" title="Permiso de Solo Lectura / Visualización">
                    Lectura
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Employee Profile Customization Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      {/* Mobile Slide-Over Navigation Drawer */}
      <MobileNavDrawer
        isOpen={showDrawer}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateOrder={onOpenCreateOrder}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* PIN Authentication Modal to switch user (Worker Protection) */}
      {targetUserForAuth && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Autenticación de Acceso</h3>
                  <p className="text-[11px] text-slate-500">Ingreso restringido por credencial</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setTargetUserForAuth(null);
                  setAuthPinInput('');
                  setAuthPinError(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <img 
                src={targetUserForAuth.avatarUrl} 
                alt={targetUserForAuth.name} 
                className="w-10 h-10 rounded-full object-cover border border-slate-300"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900 truncate">{targetUserForAuth.name}</div>
                <div className="text-[10px] text-amber-700 font-semibold">{targetUserForAuth.department}</div>
                <div className="text-[10px] text-slate-500">
                  {targetUserForAuth.role === 'admin_principal' ? 'Administrador Principal' : 'Empleado Autorizado'}
                </div>
              </div>
            </div>

            <form onSubmit={handleAuthPinSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ingresa el PIN de seguridad:
                </label>
                <div className="relative">
                  <input
                    type={showAuthPin ? 'text' : 'password'}
                    maxLength={6}
                    autoFocus
                    placeholder="••••"
                    value={authPinInput}
                    onChange={(e) => {
                      setAuthPinInput(e.target.value.replace(/\D/g, ''));
                      setAuthPinError(false);
                    }}
                    className="w-full text-center text-xl tracking-[0.4em] py-2.5 px-3 pr-10 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPin(!showAuthPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showAuthPin ? 'Ocultar' : 'Mostrar'}
                  >
                    {showAuthPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authPinError && (
                <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>PIN incorrecto. Acceso restringido.</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetUserForAuth(null);
                    setAuthPinInput('');
                    setAuthPinError(false);
                  }}
                  className="w-1/2 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={authPinInput.length < 4}
                  className="w-1/2 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 transition-colors cursor-pointer shadow-xs"
                >
                  Confirmar PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;

import React from 'react';
import { 
  ClipboardList, 
  Truck, 
  Tag, 
  Menu, 
  Plus, 
  BarChart3, 
  Users, 
  Settings 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProtectedModuleId } from '../../types';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateOrder: () => void;
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateOrder,
  onOpenDrawer,
}) => {
  const { canView, canEdit, isAdmin, config } = useApp();

  const primaryThemeColor = config.themeColors?.primaryColor || '#f59e0b';
  const primaryTextColor = config.themeColors?.primaryTextColor || '#020617';
  const accentThemeColor = config.themeColors?.accentColor || '#f59e0b';

  const hasCreatePermission = canEdit('pedidos');

  return (
    <nav 
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-300 md:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-2xl transition-all"
    >
      <div className="flex items-center justify-around h-16 px-1.5 max-w-md mx-auto">
        {/* 1. Pedidos */}
        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors cursor-pointer relative ${
            activeTab === 'pedidos'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'pedidos' && (
            <span 
              style={{ backgroundColor: accentThemeColor }}
              className="absolute top-0 w-8 h-0.5 rounded-full" 
            />
          )}
          <ClipboardList className={`w-5 h-5 ${activeTab === 'pedidos' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">Pedidos</span>
        </button>

        {/* 2. Rastreo */}
        <button
          type="button"
          onClick={() => setActiveTab('seguimiento')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors cursor-pointer relative ${
            activeTab === 'seguimiento'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'seguimiento' && (
            <span 
              style={{ backgroundColor: accentThemeColor }}
              className="absolute top-0 w-8 h-0.5 rounded-full" 
            />
          )}
          <Truck className={`w-5 h-5 ${activeTab === 'seguimiento' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">Rastreo</span>
        </button>

        {/* 3. Center Action: Crear Pedido (FAB) */}
        <div className="flex-1 flex justify-center -mt-5">
          {hasCreatePermission ? (
            <button
              type="button"
              onClick={onOpenCreateOrder}
              style={{ backgroundColor: primaryThemeColor, color: primaryTextColor }}
              className="w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-slate-900 active:scale-90 transition-transform cursor-pointer"
              title="Crear Nuevo Pedido de Dotación"
              aria-label="Crear Nuevo Pedido"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('pedidos')}
              className="w-11 h-11 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border-2 border-slate-700 shadow-md cursor-pointer"
              title="Ver Pedidos"
            >
              <ClipboardList className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 4. Catálogo */}
        <button
          type="button"
          onClick={() => setActiveTab('catalogo')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors cursor-pointer relative ${
            activeTab === 'catalogo'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'catalogo' && (
            <span 
              style={{ backgroundColor: accentThemeColor }}
              className="absolute top-0 w-8 h-0.5 rounded-full" 
            />
          )}
          <Tag className={`w-5 h-5 ${activeTab === 'catalogo' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">Catálogo</span>
        </button>

        {/* 5. Menú Completo / Más */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors cursor-pointer relative ${
            ['reportes', 'usuarios', 'admin'].includes(activeTab)
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Abrir menú con todas las opciones del sistema"
        >
          {['reportes', 'usuarios', 'admin'].includes(activeTab) && (
            <span 
              style={{ backgroundColor: accentThemeColor }}
              className="absolute top-0 w-8 h-0.5 rounded-full" 
            />
          )}
          <div className="relative">
            <Menu className="w-5 h-5" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">Menú</span>
        </button>
      </div>
    </nav>
  );
};

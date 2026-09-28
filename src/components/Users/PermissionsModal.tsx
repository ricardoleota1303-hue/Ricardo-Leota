import React, { useState } from 'react';
import { User, UserPermissions, ProtectedModuleId } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  X, 
  Check, 
  Lock, 
  Eye, 
  Edit3, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Truck,
  Tag,
  Key
} from 'lucide-react';

interface PermissionsModalProps {
  user: User | null;
  onClose: () => void;
}

const MODULE_DEFINITIONS: {
  id: ProtectedModuleId;
  name: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'pedidos',
    name: 'Pedidos y Entregas',
    description: 'Creación de órdenes, datos del destinatario, emisor y avance de etapas de confección.',
    icon: ShoppingCart,
  },
  {
    id: 'reportes',
    name: 'Reportes Mensuales',
    description: 'Analíticas mensuales de ventas, ingresos, prendas más vendidas y exportación ejecutiva.',
    icon: BarChart3,
  },
  {
    id: 'usuarios',
    name: 'Gestión de Empleados',
    description: 'Listado de personal, asignación de cargos, departamentos y estado de cuentas.',
    icon: Users,
  },
  {
    id: 'seguimiento',
    name: 'Rastreo Logístico & Guías',
    description: 'Monitoreo de guías con transportadoras (Coordinadora, Servientrega, Envia) y entregas.',
    icon: Truck,
  },
  {
    id: 'catalogo',
    name: 'Catálogo de Precios',
    description: 'Tarifas escalonadas por volumen, costos de bordado técnico y simulador de cotizaciones.',
    icon: Tag,
  },
];

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ user, onClose }) => {
  const { updateUserPermissions, isAdmin, addSecurityLog } = useApp();

  if (!user) return null;

  const isTargetAdmin = user.role === 'admin_principal';

  // Initialize permissions
  const [permissions, setPermissions] = useState<UserPermissions>(() => {
    return (
      user.permissions || {
        pedidos: { canView: false, canEdit: false },
        inventario: { canView: false, canEdit: false },
        reportes: { canView: false, canEdit: false },
        usuarios: { canView: false, canEdit: false },
        seguimiento: { canView: false, canEdit: false },
        catalogo: { canView: false, canEdit: false },
      }
    );
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleView = (moduleId: ProtectedModuleId) => {
    if (isTargetAdmin) return;
    setPermissions(prev => {
      const current = prev[moduleId] || { canView: false, canEdit: false };
      const newCanView = !current.canView;
      return {
        ...prev,
        [moduleId]: {
          canView: newCanView,
          // If cannot view, cannot edit either
          canEdit: newCanView ? current.canEdit : false,
        },
      };
    });
  };

  const toggleEdit = (moduleId: ProtectedModuleId) => {
    if (isTargetAdmin) return;
    setPermissions(prev => {
      const current = prev[moduleId] || { canView: false, canEdit: false };
      const newCanEdit = !current.canEdit;
      return {
        ...prev,
        [moduleId]: {
          canView: newCanEdit ? true : current.canView, // Editing requires viewing
          canEdit: newCanEdit,
        },
      };
    });
  };

  const applyPreset = (presetName: string) => {
    if (isTargetAdmin) return;
    if (presetName === 'vendedor') {
      setPermissions({
        pedidos: { canView: true, canEdit: true },
        inventario: { canView: false, canEdit: false },
        reportes: { canView: false, canEdit: false },
        usuarios: { canView: false, canEdit: false },
        seguimiento: { canView: true, canEdit: false },
        catalogo: { canView: true, canEdit: false },
      });
    } else if (presetName === 'taller') {
      setPermissions({
        pedidos: { canView: true, canEdit: true },
        inventario: { canView: true, canEdit: true },
        reportes: { canView: false, canEdit: false },
        usuarios: { canView: false, canEdit: false },
        seguimiento: { canView: true, canEdit: true },
        catalogo: { canView: true, canEdit: false },
      });
    } else if (presetName === 'almacen') {
      setPermissions({
        pedidos: { canView: true, canEdit: false },
        inventario: { canView: true, canEdit: true },
        reportes: { canView: false, canEdit: false },
        usuarios: { canView: false, canEdit: false },
        seguimiento: { canView: true, canEdit: true },
        catalogo: { canView: false, canEdit: false },
      });
    } else if (presetName === 'solo_lectura') {
      setPermissions({
        pedidos: { canView: true, canEdit: false },
        inventario: { canView: true, canEdit: false },
        reportes: { canView: true, canEdit: false },
        usuarios: { canView: false, canEdit: false },
        seguimiento: { canView: true, canEdit: false },
        catalogo: { canView: true, canEdit: false },
      });
    } else if (presetName === 'acceso_total') {
      setPermissions({
        pedidos: { canView: true, canEdit: true },
        inventario: { canView: true, canEdit: true },
        reportes: { canView: true, canEdit: true },
        usuarios: { canView: true, canEdit: true },
        seguimiento: { canView: true, canEdit: true },
        catalogo: { canView: true, canEdit: true },
      });
    } else if (presetName === 'sin_acceso') {
      setPermissions({
        pedidos: { canView: false, canEdit: false },
        inventario: { canView: false, canEdit: false },
        reportes: { canView: false, canEdit: false },
        usuarios: { canView: false, canEdit: false },
        seguimiento: { canView: false, canEdit: false },
        catalogo: { canView: false, canEdit: false },
      });
    }
  };

  const handleSave = () => {
    if (!isAdmin) return;
    updateUserPermissions(user.id, permissions);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Matriz de Permisos & Delegación de Acceso
                </h3>
                <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded border border-red-500/30 uppercase">
                  Control Exclusivo Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configura individualmente qué módulos puede <strong className="text-amber-300">Visualizar</strong> y <strong className="text-amber-300">Editar</strong> este empleado en JF12.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge Info */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-slate-900">{user.name}</span>
              <span className="text-slate-500 ml-2">({user.email})</span>
              <div className="text-[11px] text-slate-500">{user.department} • Rol: <strong className="text-amber-700 uppercase">{user.role}</strong></div>
            </div>
          </div>

          {isTargetAdmin && (
            <div className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Administrador Maestro (Acceso Total Irrevocable)
            </div>
          )}
        </div>

        {/* Quick presets */}
        {!isTargetAdmin && (
          <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-[11px]">
            <span className="font-bold text-slate-600 shrink-0">Plantillas Rápidas:</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => applyPreset('vendedor')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium cursor-pointer"
              >
                Asesor Ventas
              </button>
              <button
                type="button"
                onClick={() => applyPreset('taller')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium cursor-pointer"
              >
                Taller/Producción
              </button>
              <button
                type="button"
                onClick={() => applyPreset('almacen')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium cursor-pointer"
              >
                Almacén/Logística
              </button>
              <button
                type="button"
                onClick={() => applyPreset('solo_lectura')}
                className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium cursor-pointer"
              >
                Solo Lectura
              </button>
              <button
                type="button"
                onClick={() => applyPreset('acceso_total')}
                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold cursor-pointer"
              >
                Acceso Total
              </button>
            </div>
          </div>
        )}

        {/* Permissions Table Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {MODULE_DEFINITIONS.map(mod => {
              const Icon = mod.icon;
              const perm = permissions[mod.id] || { canView: false, canEdit: false };
              const canView = isTargetAdmin || perm.canView;
              const canEdit = isTargetAdmin || perm.canEdit;

              return (
                <div
                  key={mod.id}
                  className={`p-4 rounded-xl border transition-all ${
                    canView 
                      ? 'bg-white border-slate-300 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Module info */}
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg shrink-0 ${canView ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{mod.name}</h4>
                          {!canView && (
                            <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                              Bloqueado
                            </span>
                          )}
                          {canView && !canEdit && (
                            <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                              Solo Visualizar
                            </span>
                          )}
                          {canView && canEdit && (
                            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              Visualizar + Editar
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                      </div>
                    </div>

                    {/* Permissions Switches */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Can View Switch */}
                      <button
                        type="button"
                        disabled={isTargetAdmin}
                        onClick={() => toggleView(mod.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          canView
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                        } ${isTargetAdmin ? 'cursor-not-allowed opacity-75' : ''}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{canView ? 'Visualizar: SÍ' : 'Visualizar: NO'}</span>
                      </button>

                      {/* Can Edit Switch */}
                      <button
                        type="button"
                        disabled={isTargetAdmin || !canView}
                        onClick={() => toggleEdit(mod.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          canEdit
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                        } ${(isTargetAdmin || !canView) ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{canEdit ? 'Editar: SÍ' : 'Editar: NO'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {savedSuccess ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Permisos actualizados y auditados en el sistema JF12.
              </span>
            ) : (
              <span>Los cambios surten efecto inmediatamente para la sesión de este empleado.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isTargetAdmin}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Permisos</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default PermissionsModal;

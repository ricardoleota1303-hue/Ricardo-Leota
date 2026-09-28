import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { ROLE_INFO } from '../../utils/formatters';
import { PermissionsModal } from './PermissionsModal';
import { ProfileModal } from './ProfileModal';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building2, 
  Edit3, 
  UserCheck, 
  Lock, 
  Check, 
  X, 
  ShieldAlert, 
  KeyRound, 
  Eye, 
  Sliders,
  UserCog,
  Clock,
  Sparkles
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const { users, currentUser, addUser, updateUser, toggleUserActive, isAdmin, canEdit } = useApp();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [managingPermissionsUser, setManagingPermissionsUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const canEditUsers = isAdmin || canEdit('usuarios');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Gestión de Usuarios & Empleados de la Empresa
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Administración de cuentas para el personal de ventas, supervisión de confección, despachos y control maestro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                id="btn-crear-empleado"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrar Nuevo Empleado</span>
              </button>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Solo el Administrador Principal puede crear o editar usuarios</span>
              </div>
            )}
          </div>
        </div>

        {/* Roles Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-red-50/70 p-3 rounded-lg border border-red-200">
            <span className="font-bold text-red-900 block flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
              Administrador Principal
            </span>
            <span className="text-red-700 text-[11px] mt-0.5 block">
              Control total del sistema, configuración global y precios base.
            </span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200">
            <span className="font-bold text-blue-900 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              Supervisor de Producción
            </span>
            <span className="text-blue-700 text-[11px] mt-0.5 block">
              Control de corte, bordado, calidad e ingresos de stock terminado.
            </span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
            <span className="font-bold text-emerald-900 block flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              Asesor Comercial / Ventas
            </span>
            <span className="text-emerald-700 text-[11px] mt-0.5 block">
              Creación de pedidos, catálogo de precios y gestión de clientes.
            </span>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
            <span className="font-bold text-amber-900 block flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              Logística & Despachos
            </span>
            <span className="text-amber-700 text-[11px] mt-0.5 block">
              Asignación de guías de envío, transportadoras y entregas.
            </span>
          </div>
        </div>
      </div>

      {/* Current Employee Profile Card & Quick Personalize */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md bg-white"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center" title="En línea">
              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-white">{currentUser.name}</h2>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Tu Perfil
              </span>
              <span className="text-[11px] bg-slate-700/80 text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-slate-600 flex items-center gap-1">
                PIN: ••••
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentUser.department} • {ROLE_INFO[currentUser.role]?.label}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px]">
              <span className="text-amber-400 font-medium">
                {currentUser.statusMessage || '🟢 Disponible'}
              </span>
              {currentUser.shiftHours && (
                <span className="text-slate-400">
                  • {currentUser.shiftHours}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <UserCog className="w-4 h-4" />
          <span>Personalizar Mi Perfil</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const roleData = ROLE_INFO[user.role];
          const isCurrent = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between ${
                isCurrent 
                  ? 'border-amber-400 ring-2 ring-amber-100 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border mt-1 ${roleData?.badgeColor}`}>
                        {roleData?.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCurrent && (
                      <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                        TÚ
                      </span>
                    )}
                    {user.pin && isCurrent && (
                      <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-1.5 py-0.5 rounded border border-slate-200" title="PIN protegido">
                        PIN: ••••
                      </span>
                    )}
                  </div>
                </div>

                {/* Status & Shift Badge */}
                <div className="mt-3 flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-lg">
                  <span className="font-semibold text-slate-800 truncate">{user.statusMessage || '🟢 En servicio'}</span>
                  {user.shiftHours && (
                    <span className="text-slate-500 font-medium text-[10px] ml-1 shrink-0">{user.shiftHours}</span>
                  )}
                </div>

                {/* Bio snippet if available */}
                {user.bio && (
                  <p className="mt-2 text-[11px] text-slate-600 bg-amber-50/40 p-2 rounded-lg border border-amber-100 italic line-clamp-2">
                    "{user.bio}"
                  </p>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{user.department}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.phone}</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Registrado el {user.createdAt}</span>
                  {isCurrent && (
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(true)}
                      className="text-amber-600 hover:text-amber-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <UserCog className="w-3 h-3" />
                      <span>Editar Mi Perfil</span>
                    </button>
                  )}
                </div>

                {/* Permissions Matrix Pills Preview */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-semibold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Permisos Delegados:
                    </span>
                    {user.role === 'admin_principal' ? (
                      <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded font-bold">
                        Acceso Total
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setManagingPermissionsUser(user)}
                        className="text-[10px] text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded font-bold cursor-pointer"
                      >
                        Configurar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <div className={`p-1 rounded text-center border ${user.permissions?.pedidos?.canView ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      Ped: {user.permissions?.pedidos?.canView ? (user.permissions?.pedidos?.canEdit ? 'Ver+Edit' : 'Ver') : 'No'}
                    </div>
                    <div className={`p-1 rounded text-center border ${user.permissions?.catalogo?.canView ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      Cat: {user.permissions?.catalogo?.canView ? (user.permissions?.catalogo?.canEdit ? 'Ver+Edit' : 'Ver') : 'No'}
                    </div>
                    <div className={`p-1 rounded text-center border ${user.permissions?.reportes?.canView ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      Rep: {user.permissions?.reportes?.canView ? (user.permissions?.reportes?.canEdit ? 'Ver+Edit' : 'Ver') : 'No'}
                    </div>
                    <div className={`p-1 rounded text-center border ${user.permissions?.usuarios?.canView ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      Emp: {user.permissions?.usuarios?.canView ? (user.permissions?.usuarios?.canEdit ? 'Ver+Edit' : 'Ver') : 'No'}
                    </div>
                    <div className={`p-1 rounded text-center border ${user.permissions?.seguimiento?.canView ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      Rastreo: {user.permissions?.seguimiento?.canView ? (user.permissions?.seguimiento?.canEdit ? 'Ver+Edit' : 'Ver') : 'No'}
                    </div>
                    <div className={`p-1 rounded text-center border ${user.permissions?.catalogo?.canView ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      Catál: {user.permissions?.catalogo?.canView ? (user.permissions?.catalogo?.canEdit ? 'Ver+Edit' : 'Ver') : 'No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Actions (Admin only) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className={`inline-flex items-center space-x-1 font-medium ${user.active ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span>{user.active ? 'Cuenta Activa' : 'Inactivo'}</span>
                </span>

                {isAdmin ? (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setManagingPermissionsUser(user)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Configurar permisos de acceso a módulos"
                    >
                      <Sliders className="w-3 h-3 text-amber-600" />
                      <span>Permisos</span>
                    </button>
                    <button
                      onClick={() => toggleUserActive(user.id)}
                      className="text-slate-500 hover:text-slate-800 text-[11px] font-medium cursor-pointer underline px-1"
                    >
                      {user.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                      title="Editar Datos"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Solo Admin puede modificar</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Modal */}
      {managingPermissionsUser && (
        <PermissionsModal
          user={managingPermissionsUser}
          onClose={() => setManagingPermissionsUser(null)}
        />
      )}

      {/* Employee Profile Customization Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Add User Modal (Admin Only) */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onAdd={(userData) => {
            addUser(userData);
            setShowAddUserModal(false);
          }}
        />
      )}

      {/* Edit User Modal (Admin Only) */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={(updated) => {
            updateUser(updated);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Add User Modal
interface AddUserModalProps {
  onClose: () => void;
  onAdd: (data: Omit<User, 'id' | 'createdAt'>) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('asesor_ventas');
  const [phone, setPhone] = useState('+57 310 ');
  const [department, setDepartment] = useState('Ventas Corporativas & Licitaciones');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAdd({
      name,
      email,
      role,
      phone,
      department,
      active: true,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000000)}?auto=format&fit=crop&q=80&w=150`,
      permissions: {
        pedidos: { 
          canView: role === 'admin_principal' || role === 'asesor_ventas', 
          canEdit: role === 'admin_principal' || role === 'asesor_ventas' 
        },
        inventario: { 
          canView: role === 'admin_principal' || role === 'supervisor_produccion', 
          canEdit: role === 'admin_principal' 
        },
        reportes: { 
          canView: role === 'admin_principal', 
          canEdit: role === 'admin_principal' 
        },
        usuarios: { 
          canView: role === 'admin_principal', 
          canEdit: role === 'admin_principal' 
        },
        seguimiento: { 
          canView: true, 
          canEdit: role === 'admin_principal' || role === 'encargado_despachos' 
        },
        catalogo: { 
          canView: true, 
          canEdit: role === 'admin_principal' 
        },
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            Registrar Nuevo Empleado (Admin)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
            <input
              type="text"
              placeholder="Ej: Laura Camila Vargas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico Corporativo *</label>
            <input
              type="email"
              placeholder="ejemplo@indutextil.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rol en el Sistema *</label>
            <select
              value={role}
              onChange={(e) => {
                const r = e.target.value as UserRole;
                setRole(r);
                if (r === 'admin_principal') setDepartment('Gerencia & Dirección General');
                if (r === 'supervisor_produccion') setDepartment('Planta de Confección & Bordado');
                if (r === 'asesor_ventas') setDepartment('Ventas Corporativas & Licitaciones');
                if (r === 'encargado_despachos') setDepartment('Logística & Despachos');
              }}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
            >
              <option value="asesor_ventas">Asesor Comercial / Ventas</option>
              <option value="supervisor_produccion">Supervisor de Producción</option>
              <option value="encargado_despachos">Logística & Despachos</option>
              <option value="admin_principal">Administrador Principal (Master)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Departamento / Área</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Teléfono Móvil</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              Crear Empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-component: Edit User Modal
interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<User>({ ...user });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-600" />
            Editar Empleado (Admin)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Correo</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
            >
              <option value="asesor_ventas">Asesor Comercial / Ventas</option>
              <option value="supervisor_produccion">Supervisor de Producción</option>
              <option value="encargado_despachos">Logística & Despachos</option>
              <option value="admin_principal">Administrador Principal (Master)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Departamento</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

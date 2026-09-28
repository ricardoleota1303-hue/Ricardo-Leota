import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { ROLE_INFO } from '../../utils/formatters';
import { Logo } from '../Logo';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  UserCheck, 
  AlertCircle, 
  ChevronRight, 
  Briefcase, 
  Clock, 
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export const ProfileSelectionModal: React.FC = () => {
  const { 
    users, 
    isProfileSelectorOpen, 
    selectEmployeeSession, 
    config 
  } = useApp();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customStatusMessage, setCustomStatusMessage] = useState('');
  const [customShiftHours, setCustomShiftHours] = useState('');

  if (!isProfileSelectorOpen) return null;

  // Separate Admin from standard operational employees
  const adminUser = users.find(u => u.role === 'admin_principal');
  const employeeUsers = users.filter(u => u.role !== 'admin_principal');

  const handleSelectEmployee = (user: User) => {
    setSelectedUser(user);
    setPinInput('');
    setErrorMsg(null);
    setCustomStatusMessage(user.statusMessage || '🟢 En servicio');
    setCustomShiftHours(user.shiftHours || 'Lunes a Viernes 8:00 AM - 5:00 PM');
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setPinInput('');
    setErrorMsg(null);
  };

  const handleKeypadPress = (num: string) => {
    if (pinInput.length < 6) {
      setPinInput(prev => prev + num);
      setErrorMsg(null);
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleConfirmLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) return;

    const result = selectEmployeeSession(selectedUser, pinInput);
    if (!result.success) {
      setErrorMsg(result.error || 'Autenticación fallida.');
      setPinInput('');
    } else {
      // Success
      setErrorMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Branding Banner */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-700 shrink-0">
              <Logo className="h-9 w-auto" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Control de Acceso y Turnos JF12
                </span>
                <span className="text-[10px] text-slate-400 font-mono">v2.6 Seguro</span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {config.companyName || 'JF12 Uniformes & Dotaciones Industriales'}
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-right">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">Inicio de Jornada Laboral</div>
              <div className="text-[11px] text-slate-400">Identificación por perfil y cargo</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7">
          {!selectedUser ? (
            /* STEP 1: SELECT PROFILE & CARGO */
            <div className="space-y-6">
              <div className="text-center sm:text-left max-w-2xl">
                <h2 className="text-xl font-extrabold text-white">
                  ¿Quién está ingresando al sistema hoy?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Selecciona tu perfil de empleado y tu cargo asignado para comenzar tu turno. El perfil de Administrador requiere validación con PIN de seguridad.
                </p>
              </div>

              {/* Group 1: Employee Profiles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Personal Operativo, Comercial y Despachos
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {employeeUsers.length} perfiles disponibles
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employeeUsers.map((user) => {
                    const roleInfo = ROLE_INFO[user.role];
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectEmployee(user)}
                        className="group flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 transition-all text-left cursor-pointer hover:shadow-lg hover:shadow-amber-500/5"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                            alt={user.name}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700 group-hover:ring-amber-400 transition-all"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 truncate">
                              {user.name}
                            </h3>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-amber-500/20 truncate">
                              {user.department || roleInfo?.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{user.shiftHours || 'Turno estándar'}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Administrator Profile (Secured) */}
              {adminUser && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Dirección General & Administración Principal
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/60">
                      REQUIERE PIN MAESTRO
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectEmployee(adminUser)}
                    className="w-full group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-red-950/30 via-slate-800/90 to-amber-950/20 border border-red-500/30 hover:border-red-500/70 transition-all text-left cursor-pointer shadow-sm hover:shadow-red-500/10"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={adminUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={adminUser.name}
                          className="w-13 h-13 rounded-xl object-cover ring-2 ring-red-500/50 group-hover:ring-red-400 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-0.5 border-2 border-slate-900">
                          <Lock className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-red-300">
                            {adminUser.name}
                          </h3>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-900/80 text-red-200 border border-red-700">
                            ADMINISTRADOR
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          {adminUser.department} • Control Total
                        </div>
                        <div className="text-[11px] text-red-300/80 mt-1 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-red-400" />
                          <span>Acceso protegido con clave maestra. Prohibido a personal operativo.</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center space-x-2 text-right">
                      <span className="text-xs font-bold text-amber-400 group-hover:underline">
                        Ingresar como Administrador →
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: CONFIRMATION / PIN VALIDATION VIEW */
            <div className="max-w-md mx-auto space-y-6">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Elegir otro empleado o cargo</span>
              </button>

              {/* Selected User Identity Card */}
              <div className={`p-4 rounded-2xl border text-center space-y-3 ${
                selectedUser.role === 'admin_principal'
                  ? 'bg-red-950/20 border-red-500/40 text-red-100'
                  : 'bg-slate-800/90 border-slate-700 text-slate-100'
              }`}>
                <div className="relative inline-block">
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.name}
                    className={`w-16 h-16 rounded-2xl object-cover mx-auto ring-2 ${
                      selectedUser.role === 'admin_principal' ? 'ring-red-400' : 'ring-amber-400'
                    }`}
                  />
                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-slate-900 ${
                    selectedUser.role === 'admin_principal' ? 'bg-red-600' : 'bg-emerald-500'
                  }`}>
                    {selectedUser.role === 'admin_principal' ? (
                      <Lock className="w-3 h-3 text-white" />
                    ) : (
                      <UserCheck className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                  <div className="text-xs font-semibold text-amber-400 mt-0.5">
                    {selectedUser.department}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {ROLE_INFO[selectedUser.role]?.label}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {selectedUser.shiftHours || 'Jornada activa'}
                  </span>
                  <span>•</span>
                  <span>{selectedUser.statusMessage || '🟢 En servicio'}</span>
                </div>
              </div>

              {/* If Admin Principal: MUST Enter Admin PIN */}
              {selectedUser.role === 'admin_principal' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/40 text-red-300 border border-red-700/60 text-xs font-bold mb-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Perfil de Administrador Protegido</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Ingresa el PIN Maestro de Administrador (4 dígitos) para acceder:
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* PIN Input */}
                  <form onSubmit={handleConfirmLogin} className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        maxLength={8}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        autoFocus
                        className="w-full bg-slate-950 border border-red-500/50 rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.4em] font-mono text-white focus:outline-none focus:ring-2 focus:ring-red-400 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Numeric Keypad for Convenience */}
                    <div className="grid grid-cols-3 gap-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleKeypadPress(num)}
                          className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base transition-colors cursor-pointer border border-slate-700 shadow-sm active:scale-95"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPinInput('')}
                        className="h-11 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs font-semibold cursor-pointer border border-slate-700/60"
                      >
                        Limpiar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadPress('0')}
                        className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base transition-colors cursor-pointer border border-slate-700 active:scale-95"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleBackspace}
                        className="h-11 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs font-semibold cursor-pointer border border-slate-700/60"
                      >
                        ⌫
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={pinInput.length === 0}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Validar PIN y Entrar como Administrador</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* OPERATIONAL EMPLOYEE: DIRECT ENTRY OR OPTIONAL PIN */
                <div className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Optional Employee PIN validation if configured */}
                  {selectedUser.pin && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-300 text-center">
                        PIN personal del empleado (Opcional si tu supervisor lo configuró):
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ingresa PIN si aplica (ej. 2222)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  )}

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-300">Permisos asignados para este cargo:</div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {selectedUser.permissions?.pedidos?.canView && (
                        <li>Registro y seguimiento de pedidos y prendas</li>
                      )}
                      {selectedUser.permissions?.seguimiento?.canView && (
                        <li>Control de estados de confección, bordado y despacho</li>
                      )}
                      {selectedUser.permissions?.catalogo?.canView && (
                        <li>Consulta de catálogo técnico de dotaciones</li>
                      )}
                      <li className="text-amber-400 font-medium">
                        Sin acceso a precios confidenciales ni configuraciones maestras
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConfirmLogin()}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Iniciar Turno como {selectedUser.name.split(' ')[0]} ({selectedUser.department.split('&')[0]})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Sistema de Gestión Operativa JF12 Uniformes S.A.S.</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3 h-3 text-amber-500" />
            <span>Los usuarios sin PIN Maestro no pueden ingresar a Administración</span>
          </span>
        </div>

      </div>
    </div>
  );
};

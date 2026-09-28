import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Lock, Key, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Logo } from '../Logo';
import { ProtectedModuleId } from '../../types';

interface AccessRestrictedProps {
  moduleId: ProtectedModuleId | 'admin';
  moduleName: string;
  onGoBack?: () => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  moduleId,
  moduleName,
  onGoBack,
}) => {
  const { currentUser, setCurrentUser, users, verifyAdminPin, addSecurityLog } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [unlockedTemporarily, setUnlockedTemporarily] = useState(false);

  const adminUser = users.find(u => u.role === 'admin_principal');

  const handleUnlockWithAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setPinError(false);
      setUnlockedTemporarily(true);
      if (adminUser) {
        addSecurityLog(
          'DESBLOQUEO_TEMPORAL_PIN',
          moduleId,
          `Acceso temporal concedido a ${currentUser.name} mediante PIN del Administrador Principal para el módulo ${moduleName}`,
          'security'
        );
        setCurrentUser(adminUser);
      }
    } else {
      setPinError(true);
      addSecurityLog(
        'INTENTO_ACCESO_FALLIDO_PIN',
        moduleId,
        `Intento fallido de desbloqueo con PIN erróneo en ${moduleName} por usuario ${currentUser.name}`,
        'warning'
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-2xl border border-red-200 shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95">
      {/* Icon & Logo */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl shadow-xs">
          <Logo className="h-10 w-auto" />
        </div>
        <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 text-red-600 flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase font-extrabold tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
          Control de Seguridad JF12 Activo
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Acceso Restringido: {moduleName}
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Por directriz corporativa de <strong className="text-slate-900">JF12</strong>, la visualización y gestión de este módulo está reservada exclusivamente para el <strong className="text-slate-900">Administrador Principal</strong> y para aquellos empleados a quienes el Administrador les haya otorgado el permiso expreso de acceso.
        </p>
      </div>

      {/* User Context */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-700 font-bold border-b border-slate-200 pb-2">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" /> Estado de la Sesión Actual
          </span>
          <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            Sin Permiso Delegado
          </span>
        </div>
        <div className="text-slate-600">
          Usuario: <strong className="text-slate-900">{currentUser.name}</strong> • Cargo: <span className="font-semibold text-slate-800">{currentUser.department}</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Si requieres consultar o editar este módulo para tus funciones laborales, solicita al Administrador Principal que te conceda los permisos desde la sección de <em>Gestión de Empleados</em>.
        </div>
      </div>

      {/* Admin PIN Unlock Form (For terminals when Admin is present) */}
      <div className="border-t border-slate-200 pt-6">
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-3 text-left">
          <div className="flex items-center space-x-2 font-bold text-amber-900">
            <Key className="w-4 h-4 text-amber-700" />
            <span>¿Está el Administrador Principal presente en este puesto?</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Ingresa el PIN maestro del Administrador para cambiar inmediatamente a la sesión de control total:
          </p>

          <form onSubmit={handleUnlockWithAdminPin} className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              maxLength={8}
              placeholder="PIN de Seguridad del Administrador"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              className="p-2.5 border border-slate-300 rounded-lg text-xs bg-white flex-1 focus:ring-2 focus:ring-amber-500 outline-none font-mono tracking-wider"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validar PIN & Acceder</span>
            </button>
          </form>

          {pinError && (
            <p className="text-red-600 font-semibold text-[11px] animate-pulse">
              PIN incorrecto. El intento de acceso ha sido registrado en la bitácora de seguridad.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default AccessRestricted;

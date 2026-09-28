import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../Logo';
import { Lock, Unlock, ShieldCheck, AlertCircle, KeyRound, UserCheck, Eye, EyeOff } from 'lucide-react';

export const LockScreenModal: React.FC = () => {
  const { 
    isScreenLocked, 
    unlockScreen, 
    currentUser, 
    setCurrentUser, 
    users,
    config
  } = useApp();
  
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);

  if (!isScreenLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockScreen(pin);
    if (success) {
      setPin('');
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleKeypadPress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center text-white space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Brand & Security Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-700">
            <Logo className="h-10 w-auto" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              Terminal JF12 Bloqueada
            </span>
            <h2 className="text-xl font-extrabold mt-2 text-white">
              {config.companyName}
            </h2>
            <p className="text-xs text-slate-400">
              Protección de datos industriales y confidencialidad activa
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 text-left">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-base">
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-white truncate">{currentUser.name}</div>
            <div className="text-xs text-amber-300 font-medium capitalize">
              {currentUser.role.replace('_', ' ')}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentUser.department} {currentUser.statusMessage ? `• ${currentUser.statusMessage}` : ''}
            </div>
          </div>
          <div className="text-right">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          </div>
        </div>

        {/* PIN Entry */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Ingresa tu PIN de Desbloqueo:
            </label>
            <div className="flex justify-center items-center gap-2">
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(false);
                  }}
                  autoFocus
                  placeholder="••••"
                  className="w-48 text-center text-2xl tracking-[0.4em] py-2.5 px-4 pr-10 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono focus:border-amber-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  title={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Terminal protegida con PIN confidencial</span>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1.5 animate-shake">
              <AlertCircle className="w-4 h-4" />
              <span>PIN incorrecto. Intenta nuevamente.</span>
            </div>
          )}

          {/* Quick numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl font-bold text-base transition-colors cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-10 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-400 rounded-xl transition-colors cursor-pointer"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="h-10 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl font-bold text-base transition-colors cursor-pointer"
            >
              0
            </button>
            <button
              type="submit"
              className="h-10 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Desbloquear Terminal JF12</span>
          </button>
        </form>

        {/* Switch user selector */}
        <div className="pt-2 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 mb-2">¿Deseas cambiar a otro empleado o al Administrador?</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setCurrentUser(u);
                  setPin('');
                  setError(false);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  u.id === currentUser.id 
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {u.name.split(' ')[0]} ({u.role === 'admin_principal' ? 'Admin' : u.role.split('_')[0]})
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
export default LockScreenModal;

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_INFO } from '../../utils/formatters';
import { 
  User as UserIcon, 
  Camera, 
  Upload, 
  Check, 
  X, 
  KeyRound, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Mail, 
  Palette, 
  Eye, 
  EyeOff, 
  Briefcase, 
  Building2,
  Sparkles,
  Smile,
  BadgeCheck,
  CheckCircle2
} from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

// Preset Industrial Avatars
const PRESET_AVATARS = [
  {
    id: 'admin-male',
    label: 'Ejecutivo / Gerencia',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    gender: 'General'
  },
  {
    id: 'supervisor-female',
    label: 'Supervisora Textil',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    gender: 'Femenino'
  },
  {
    id: 'sales-male',
    label: 'Asesor Comercial',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    gender: 'Masculino'
  },
  {
    id: 'sales-female',
    label: 'Especialista Cuentas',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    gender: 'Femenino'
  },
  {
    id: 'dispatch-male',
    label: 'Logística & Despacho',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    gender: 'Masculino'
  },
  {
    id: 'plant-engineer',
    label: 'Ingeniero de Planta',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    gender: 'Masculino'
  },
  {
    id: 'quality-inspector',
    label: 'Control de Calidad',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200',
    gender: 'Femenino'
  },
  {
    id: 'confection-master',
    label: 'Maestro Confección',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    gender: 'Masculino'
  }
];

// Status presets
const STATUS_PRESETS = [
  '🟢 Disponible en planta',
  '🧵 En taller de confección',
  '📦 En empaque y despacho',
  '📞 Atendiendo clientes',
  '🤝 En reunión de producción',
  '🔍 En control de calidad',
  '⏸️ En pausa activa'
];

// Color badges
const COLOR_OPTIONS = [
  { id: 'amber', label: 'Ámbar JF12', bg: 'bg-amber-500', ring: 'ring-amber-500', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-800 border-amber-300' },
  { id: 'blue', label: 'Azul Industrial', bg: 'bg-blue-600', ring: 'ring-blue-600', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-800 border-blue-300' },
  { id: 'emerald', label: 'Verde Seguridad', bg: 'bg-emerald-600', ring: 'ring-emerald-600', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { id: 'rose', label: 'Rojo Alta Visibilidad', bg: 'bg-rose-600', ring: 'ring-rose-600', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-800 border-rose-300' },
  { id: 'purple', label: 'Púrpura Corporativo', bg: 'bg-purple-600', ring: 'ring-purple-600', text: 'text-purple-600', badge: 'bg-purple-50 text-purple-800 border-purple-300' },
  { id: 'slate', label: 'Grafito Acero', bg: 'bg-slate-700', ring: 'ring-slate-700', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800 border-slate-300' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { currentUser, updateCurrentUserProfile } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [pin, setPin] = useState(currentUser.pin || '1234');
  const [showPin, setShowPin] = useState(false);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [shiftHours, setShiftHours] = useState(currentUser.shiftHours || 'Lunes a Viernes 8:00 AM - 5:00 PM');
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage || '🟢 Disponible');
  const [badgeColor, setBadgeColor] = useState(currentUser.badgeColor || 'amber');
  
  const [activeTab, setActiveTab] = useState<'info' | 'avatar' | 'card'>('info');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedColorConfig = COLOR_OPTIONS.find(c => c.id === badgeColor) || COLOR_OPTIONS[0];

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('La imagen es muy pesada. Por favor selecciona una foto menor a 4MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatarUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('El nombre no puede estar vacío.');
      return;
    }
    if (pin.length < 4) {
      setErrorMessage('El PIN debe tener al menos 4 dígitos numéricos.');
      return;
    }

    const success = updateCurrentUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      avatarUrl,
      pin: pin.trim(),
      bio: bio.trim(),
      shiftHours: shiftHours.trim(),
      statusMessage: statusMessage.trim(),
      badgeColor,
    });

    if (success) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col my-6">
        
        {/* Header with employee banner */}
        <div className={`p-5 text-white relative overflow-hidden flex items-center justify-between ${selectedColorConfig.bg} transition-colors duration-300`}>
          <div className="flex items-center space-x-3.5 z-10">
            <div className="relative">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt={name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/90 shadow-md bg-white"
              />
              <button
                type="button"
                onClick={() => setActiveTab('avatar')}
                className="absolute -bottom-1.5 -right-1.5 bg-slate-900 text-amber-400 p-1.5 rounded-xl shadow border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">{name || 'Mi Perfil'}</h2>
                <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded-full backdrop-blur-xs uppercase tracking-wider">
                  Personalizar Perfil
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">
                {currentUser.department} • {ROLE_INFO[currentUser.role]?.label}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Background subtle watermark icon */}
          <Sparkles className="absolute right-12 -bottom-4 w-32 h-32 text-white/10 pointer-events-none" />
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'border-amber-500 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4 text-amber-600" />
            <span>Datos Personales & PIN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'avatar'
                ? 'border-amber-500 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-600" />
            <span>Foto & Avatar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'card'
                ? 'border-amber-500 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BadgeCheck className="w-4 h-4 text-amber-600" />
            <span>Credencial Digital JF12</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(85vh-200px)] space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2 animate-shake">
              <X className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>¡Tu perfil ha sido actualizado con éxito en el sistema JF12!</span>
            </div>
          )}

          {/* TAB 1: DATOS PERSONALES & PIN */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="Ej. Martha Liliana Gómez"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Nombre que verán tus compañeros en pedidos y reportes.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp Laboral
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      placeholder="+57 312 000 0000"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Para contacto rápido sobre despachos y confección.
                  </span>
                </div>
              </div>

              {/* Security PIN Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Mi PIN Personal de Seguridad (Terminal)
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    Desbloqueo de Pantalla
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Usa este código secreto de 4 a 6 dígitos numéricos para desbloquear la terminal de trabajo cuando bloquees tu pantalla:
                </p>

                <div className="flex items-center space-x-3">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-2.5 border border-slate-300 bg-white rounded-xl text-sm font-mono font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none pr-10 text-center"
                      placeholder="••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {pin.length >= 4 ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> PIN Válido ({pin.length} dígitos)
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        Mínimo 4 dígitos requeridos
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio & Responsibilities */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Especialidad / Funciones en JF12
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ej. Supervisión de líneas de costura, control de telas retardantes de llama y calibración de maquinaria textil..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Shift and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horario / Turno Habitual
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={shiftHours}
                      onChange={(e) => setShiftHours(e.target.value)}
                      className="w-full pl-9 p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      placeholder="Ej. Lunes a Viernes 7:30 AM - 5:30 PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado de Disponibilidad Actual
                  </label>
                  <input
                    type="text"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    placeholder="Ej. 🟢 Disponible en planta"
                  />
                </div>
              </div>

              {/* Status Preset Chips */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Selección rápida de estado:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStatusMessage(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        statusMessage === preset
                          ? 'bg-amber-500/20 text-amber-900 border-amber-400 font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge Color Customization */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span>Color Distintivo del Carné / Credencial</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setBadgeColor(c.id)}
                      className={`flex items-center space-x-2.5 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        badgeColor === c.id
                          ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${c.bg} shrink-0 shadow-xs`} />
                      <span className="text-slate-800 text-[11px] truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FOTO & AVATAR */}
          {activeTab === 'avatar' && (
            <div className="space-y-6">
              {/* Current photo preview & Upload Options */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt="Previsualización"
                    className={`w-24 h-24 rounded-2xl object-cover ring-4 ${selectedColorConfig.ring} shadow-md bg-white`}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Personaliza tu Foto de Empleado
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sube una foto desde tu computadora o celular, o selecciona uno de los avatares industriales diseñados para el equipo de JF12.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Subir Foto del Equipo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAvatarUrl(currentUser.avatarUrl || '')}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
                    >
                      Restablecer Original
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset Avatars Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Galería de Avatares Industriales JF12
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Haz clic en cualquiera para seleccionarlo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((av) => {
                    const isSelected = avatarUrl === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatarUrl(av.url)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/50'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={av.url}
                            alt={av.label}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] font-bold text-slate-800 leading-tight">
                          {av.label}
                        </div>
                        <span className="text-[9px] text-slate-400">
                          {av.gender}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom URL Input option */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  O pega el enlace URL directo de tu foto:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                    className="flex-1 p-2 border border-slate-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setAvatarUrl(customUrlInput.trim());
                        setCustomUrlInput('');
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Aplicar URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CREDENCIAL DIGITAL JF12 PREVIEW */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 text-center">
                Así se verá tu carné digital institucional y credencial de seguridad en la empresa:
              </p>

              {/* Virtual Badge Card */}
              <div className="max-w-sm mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden text-center relative">
                {/* Header ribbon */}
                <div className={`p-4 text-white ${selectedColorConfig.bg} relative`}>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/90 mb-1">
                    <span>JF12 INDUSTRIAL</span>
                    <span>CREDENCIAL DIGITAL</span>
                  </div>
                  <div className="text-xs font-semibold text-white/90">
                    Dotaciones & Confección S.A.S.
                  </div>
                </div>

                {/* Body of Badge */}
                <div className="p-6 space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={name}
                      className={`w-28 h-28 rounded-2xl object-cover mx-auto ring-4 ${selectedColorConfig.ring} shadow-md`}
                    />
                    <span className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1 rounded-full shadow border border-white">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{name}</h3>
                    <div className="inline-block mt-1">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${selectedColorConfig.badge}`}>
                        {ROLE_INFO[currentUser.role]?.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      {currentUser.department}
                    </div>
                  </div>

                  {/* Status & Shift */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Estado:</span>
                      <span className="font-semibold text-slate-800">{statusMessage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Jornada:</span>
                      <span className="font-semibold text-slate-800 truncate ml-2">{shiftHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Contacto:</span>
                      <span className="font-semibold text-slate-800">{phone}</span>
                    </div>
                  </div>

                  {bio && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      "{bio}"
                    </p>
                  )}

                  {/* Security chip footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>ID: {currentUser.id}</span>
                    <span className="text-emerald-700 font-bold uppercase">AUTORIZADO JF12</span>
                    <span>PIN: ••••</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className={`px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-md transition-all flex items-center space-x-1.5 cursor-pointer ${
                  selectedColorConfig.bg
                } hover:opacity-90`}
              >
                <Check className="w-4 h-4" />
                <span>Guardar Mi Perfil</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

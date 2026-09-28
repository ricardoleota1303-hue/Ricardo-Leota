import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { Logo } from '../Logo';
import { PermissionsModal } from '../Users/PermissionsModal';
import { User, ThemeColorsConfig, CustomTextsConfig } from '../../types';
import { 
  THEME_PRESETS, 
  DEFAULT_THEME_COLORS, 
  DEFAULT_CUSTOM_TEXTS, 
  PRESET_LOGOS 
} from '../../utils/themePresets';
import { 
  Settings, 
  Lock, 
  Building2, 
  DollarSign, 
  Tag, 
  Save, 
  RotateCcw, 
  Download, 
  Check, 
  AlertTriangle,
  Key,
  ShieldCheck,
  Image as ImageIcon,
  KeyRound,
  FileText,
  Clock,
  Palette,
  Type,
  Upload,
  Printer,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Sliders
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    isAdmin, 
    config, 
    updateConfig, 
    resetToDemoData, 
    securityLogs,
    products, 
    orders, 
    clients,
    verifyAdminPin 
  } = useApp();

  // Active Admin Sub-tab
  const [activeAdminTab, setActiveAdminTab] = useState<'branding' | 'texts' | 'business' | 'security'>('branding');
  const [adminPinGateInput, setAdminPinGateInput] = useState('');
  const [adminPinGateError, setAdminPinGateError] = useState(false);
  const [showAdminPinGate, setShowAdminPinGate] = useState(false);
  const [showAdminPinConfig, setShowAdminPinConfig] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ 
    ...config,
    adminPin: config.adminPin || '1234',
    autoLockMinutes: config.autoLockMinutes || 15,
    requirePinForSensitiveActions: config.requirePinForSensitiveActions ?? true,
    logoUrl: config.logoUrl || '',
    themeColors: {
      ...DEFAULT_THEME_COLORS,
      ...(config.themeColors || {})
    },
    customTexts: {
      ...DEFAULT_CUSTOM_TEXTS,
      ...(config.customTexts || {})
    }
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Non-admin block
  if (!isAdmin) {
    const adminUser = users.find(u => u.role === 'admin_principal');

    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-md text-center max-w-2xl mx-auto space-y-5 my-8 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-red-100 border border-red-200 text-red-700 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Control Restringido por Seguridad
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Acceso Exclusivo para el Administrador Principal
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Esta sección contiene la personalización de identidad corporativa, edición de títulos, logotipo de impresión, paletas de colores, tarifas de confección y auditoría de la empresa.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2 text-slate-600">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Tu sesión actual:
          </div>
          <div>
            Usuario: <strong className="text-slate-900">{currentUser.name}</strong> • Rol: <span className="font-semibold text-amber-700">{currentUser.role}</span>
          </div>
        </div>

        {adminUser && (
          <div className="pt-3 border-t border-slate-200 text-left">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                <KeyRound className="w-4 h-4 text-amber-700" />
                <span>¿Eres el Administrador Principal? Desbloquea con tu PIN</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Ingresa tu clave de administrador para cambiar a la sesión con acceso a todas las funciones:
              </p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (verifyAdminPin(adminPinGateInput)) {
                    setCurrentUser(adminUser);
                    setAdminPinGateError(false);
                    setAdminPinGateInput('');
                  } else {
                    setAdminPinGateError(true);
                  }
                }}
                className="flex flex-col sm:flex-row gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type={showAdminPinGate ? 'text' : 'password'}
                    maxLength={6}
                    placeholder="PIN del Administrador"
                    value={adminPinGateInput}
                    onChange={(e) => {
                      setAdminPinGateInput(e.target.value.replace(/\D/g, ''));
                      setAdminPinGateError(false);
                    }}
                    className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-500 outline-none font-mono tracking-widest text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPinGate(!showAdminPinGate)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAdminPinGate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={adminPinGateInput.length < 4}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-400 font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validar PIN & Acceder</span>
                </button>
              </form>
              {adminPinGateError && (
                <p className="text-red-600 font-bold text-[11px] animate-pulse">
                  PIN incorrecto. Acceso restringido para proteger las funciones de la empresa.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle Logo File Upload (PNG, JPG, SVG, WebP)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG o WebP).');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setLogoUploadError('La imagen es demasiado pesada. El tamaño máximo recomendado es de 2.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFormData(prev => ({
        ...prev,
        logoUrl: dataUrl
      }));
    };
    reader.onerror = () => {
      setLogoUploadError('Ocurrió un error al leer la imagen seleccionada.');
    };
    reader.readAsDataURL(file);
  };

  // Preset Theme Selector
  const handleSelectPresetTheme = (presetId: string) => {
    const found = THEME_PRESETS.find(p => p.id === presetId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        themeColors: {
          ...found.theme
        }
      }));
    }
  };

  // Restore Default Texts
  const handleResetTexts = () => {
    if (window.confirm('¿Deseas restablecer todos los títulos, subtítulos y membretes a los valores predeterminados de fábrica?')) {
      setFormData(prev => ({
        ...prev,
        customTexts: { ...DEFAULT_CUSTOM_TEXTS }
      }));
    }
  };

  // Restore Default Theme Colors
  const handleResetColors = () => {
    if (window.confirm('¿Deseas restaurar la paleta de colores oficial JF12 (Ámbar & Grafito)?')) {
      setFormData(prev => ({
        ...prev,
        themeColors: { ...DEFAULT_THEME_COLORS }
      }));
    }
  };

  // Clear Custom Logo (Back to vector SVG)
  const handleClearCustomLogo = () => {
    setFormData(prev => ({
      ...prev,
      logoUrl: ''
    }));
  };

  // Save Settings
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Backup Export
  const handleBackupExport = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      config: formData,
      products,
      orders,
      clients,
      users,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Copia_Seguridad_${formData.companyName.split(' ')[0]}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Factory Reset
  const handleReset = () => {
    const conf = window.confirm(
      '¿Estás completamente seguro de restaurar los datos del sistema a los valores de fábrica? Se restablecerán los pedidos, el catálogo de prendas y las configuraciones de demostración.'
    );
    if (conf) {
      resetToDemoData();
      setFormData({ 
        ...config,
        logoUrl: config.logoUrl || '',
        themeColors: { ...DEFAULT_THEME_COLORS },
        customTexts: { ...DEFAULT_CUSTOM_TEXTS }
      });
      alert('Sistema restaurado a datos iniciales correctamente.');
    }
  };

  const currentTheme = formData.themeColors || DEFAULT_THEME_COLORS;
  const currentTexts = formData.customTexts || DEFAULT_CUSTOM_TEXTS;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5" style={{ color: currentTheme.primaryColor }} />
                Panel de Control Maestro & Marca de la Empresa
              </h1>
              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 uppercase">
                Administrador
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Personaliza el logo corporativo para impresión y pantalla, colores de la interfaz, títulos, subtítulos, textos de remisiones y seguridad.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBackupExport}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Copia de Seguridad (JSON)</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveAdminTab('branding')}
            className={`flex items-center justify-center space-x-2 p-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'branding'
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>1. Logo & Colores Visuales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('texts')}
            className={`flex items-center justify-center space-x-2 p-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'texts'
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>2. Textos, Títulos & Remisiones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('business')}
            className={`flex items-center justify-center space-x-2 p-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'business'
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>3. Datos Fiscales & Tarifas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('security')}
            className={`flex items-center justify-center space-x-2 p-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'security'
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>4. Seguridad, PIN & Auditoría</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-sm">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>¡Configuración y personalización de marca guardada con éxito! Los cambios se aplican de inmediato en la interfaz y en todos los documentos impresos.</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: LOGO & COLORES VISUALES (BRANDING & WHITE LABEL) */}
        {/* ============================================================== */}
        {activeAdminTab === 'branding' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Logo Manager */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>Logo de la Empresa (Para Pantalla y Documentos Impresos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Printer className="w-3 h-3" /> Sale en Nota de Entrega & Remisión
                  </span>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleClearCustomLogo}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline ml-2"
                    >
                      Restablecer Logo JF12 Original
                    </button>
                  )}
                </div>
              </div>

              {/* Dual Preview Box: Print Document (White) vs App Navbar (Dark) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Print Preview Box */}
                <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-slate-700 font-bold">
                      <Printer className="w-3.5 h-3.5 text-amber-600" />
                      Vista Previa: En Documento Impreso (Fondo Blanco)
                    </span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">Nota de Entrega / Remisión</span>
                  </div>
                  <div className="h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-3">
                    <Logo customLogoUrl={formData.logoUrl} className="h-14 w-auto max-w-[220px]" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Así aparecerá el membrete de tu empresa al imprimir la Nota de Entrega, Remisión de Dotación o Reporte de Ventas.
                  </p>
                </div>

                {/* Navbar Preview Box */}
                <div 
                  style={{ backgroundColor: currentTheme.headerBgColor }}
                  className="rounded-xl p-4 shadow-xs space-y-2 border border-slate-800 text-white"
                >
                  <div className="flex justify-between items-center text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Vista Previa: En Barra Superior (Navbar App)
                    </span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">Barra de Navegación</span>
                  </div>
                  <div className="h-24 rounded-lg flex items-center justify-center p-3 bg-white/5 border border-white/10">
                    <div className="bg-white p-2 rounded-xl shadow-xs">
                      <Logo customLogoUrl={formData.logoUrl} className="h-10 w-auto max-w-[200px]" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300/80">
                    Así se visualiza en la cabecera fija de la aplicación para todos los empleados.
                  </p>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-600" />
                      Subir Archivo de Logo desde tu Equipo
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Soporta archivos PNG con fondo transparente, SVG vectorial, JPG o WebP.
                    </p>
                  </div>

                  <div>
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
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Seleccionar Archivo de Logo</span>
                    </button>
                  </div>
                </div>

                {logoUploadError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{logoUploadError}</span>
                  </div>
                )}

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    O escribe la dirección URL directa del logo (opcional):
                  </label>
                  <input
                    type="url"
                    placeholder="https://tuempresa.com/assets/logo.png"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Colors & Themes Manager */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span>Personalización de Colores de la Interfaz (Tema Visual)</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetColors}
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restaurar Paleta Oficial JF12
                </button>
              </div>

              {/* Theme Presets Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Paletas Profesionales Preconfiguradas (Selecciona con 1 clic):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = currentTheme.presetId === preset.id || currentTheme.primaryColor === preset.theme.primaryColor;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPresetTheme(preset.id)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-slate-900">{preset.name}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                              Activa
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div 
                            style={{ backgroundColor: preset.previewBg }} 
                            className="w-7 h-7 rounded-md border border-slate-300 shadow-2xs" 
                            title="Color de cabecera"
                          />
                          <div 
                            style={{ backgroundColor: preset.previewAccent }} 
                            className="w-7 h-7 rounded-md border border-slate-300 shadow-2xs" 
                            title="Color primario"
                          />
                          <div 
                            style={{ backgroundColor: preset.theme.accentColor }} 
                            className="w-7 h-7 rounded-md border border-slate-300 shadow-2xs" 
                            title="Color de acento"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {preset.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  Ajuste Fino de Colores (Color Pickers HTML & Hexadecimal)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {/* Primary Color */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Color Primario (Botones)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentTheme.primaryColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          themeColors: {
                            ...currentTheme,
                            presetId: 'custom',
                            primaryColor: e.target.value,
                            primaryHoverColor: e.target.value
                          }
                        })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.primaryColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          themeColors: {
                            ...currentTheme,
                            presetId: 'custom',
                            primaryColor: e.target.value
                          }
                        })}
                        className="flex-1 p-1.5 border border-slate-300 rounded font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  {/* Header Background */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Fondo Cabecera (Navbar)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentTheme.headerBgColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          themeColors: {
                            ...currentTheme,
                            presetId: 'custom',
                            headerBgColor: e.target.value
                          }
                        })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.headerBgColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          themeColors: {
                            ...currentTheme,
                            presetId: 'custom',
                            headerBgColor: e.target.value
                          }
                        })}
                        className="flex-1 p-1.5 border border-slate-300 rounded font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Color de Acento & Pestañas
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentTheme.accentColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          themeColors: {
                            ...currentTheme,
                            presetId: 'custom',
                            accentColor: e.target.value
                          }
                        })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={currentTheme.accentColor}
                        onChange={(e) => setFormData({
                          ...formData,
                          themeColors: {
                            ...currentTheme,
                            presetId: 'custom',
                            accentColor: e.target.value
                          }
                        })}
                        className="flex-1 p-1.5 border border-slate-300 rounded font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  {/* Text Color for Buttons */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Texto en Botones Primarios
                    </label>
                    <select
                      value={currentTheme.primaryTextColor || '#020617'}
                      onChange={(e) => setFormData({
                        ...formData,
                        themeColors: {
                          ...currentTheme,
                          presetId: 'custom',
                          primaryTextColor: e.target.value
                        }
                      })}
                      className="w-full p-1.5 border border-slate-300 rounded text-xs"
                    >
                      <option value="#020617">Oscuro (#020617 - Para fondos claros/amarillos)</option>
                      <option value="#ffffff">Blanco (#ffffff - Para fondos oscuros/azules)</option>
                    </select>
                  </div>
                </div>

                {/* Live Preview Strip */}
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">Previsualización de Botón:</span>
                  <button
                    type="button"
                    style={{
                      backgroundColor: currentTheme.primaryColor,
                      color: currentTheme.primaryTextColor || '#020617'
                    }}
                    className="px-4 py-2 rounded-lg font-bold text-xs shadow-xs"
                  >
                    Botón de Acción Primaria
                  </button>
                  <span 
                    style={{ 
                      borderColor: currentTheme.accentColor, 
                      color: currentTheme.accentColor 
                    }}
                    className="px-3 py-1 rounded-full text-xs font-bold border"
                  >
                    Insignia de Acento
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: TEXTOS, TÍTULOS & REMISIONES IMPRESAS */}
        {/* ============================================================== */}
        {activeAdminTab === 'texts' && (
          <div className="space-y-6 animate-in fade-in">
            {/* General Brand Texts */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <Type className="w-4 h-4 text-amber-600" />
                  <span>1. Nombre & Membrete de la Marca</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetTexts}
                  className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restablecer Textos Originales
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre Corto / Sigla (Aparece en el Navbar y sellos)
                  </label>
                  <input
                    type="text"
                    value={currentTexts.companyShortName || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTexts: { ...currentTexts, companyShortName: e.target.value }
                    })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                    placeholder="Ej: JF12"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Slogan / Subtítulo de la Empresa
                  </label>
                  <input
                    type="text"
                    value={currentTexts.companySlogan || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTexts: { ...currentTexts, companySlogan: e.target.value }
                    })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Ej: Uniformes & Dotaciones Industriales"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Insignia de la Barra Superior (Badge)
                  </label>
                  <input
                    type="text"
                    value={currentTexts.navbarBadge || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTexts: { ...currentTexts, navbarBadge: e.target.value }
                    })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                    placeholder="Ej: Industrial"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Note / Remisión Document Texts (FOR PRINTING) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <Printer className="w-4 h-4 text-amber-600" />
                  <span>2. Textos de la Remisión / Nota de Entrega Impresa</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Documento Oficial de Impresión
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Estos textos se imprimen físicamente en las notas de entrega junto con el logotipo de la empresa cuando se hace clic en &quot;Imprimir Remisión&quot;.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Título Principal del Documento Impreso
                  </label>
                  <input
                    type="text"
                    value={currentTexts.deliveryNoteTitle || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTexts: { ...currentTexts, deliveryNoteTitle: e.target.value }
                    })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                    placeholder="Remisión de Dotación & Orden de Despacho"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subtítulo del Documento Impreso
                  </label>
                  <input
                    type="text"
                    value={currentTexts.deliveryNoteSubtitle || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTexts: { ...currentTexts, deliveryNoteSubtitle: e.target.value }
                    })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Documento Oficial de Confección, Entrega y Trazabilidad"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nota Informativa en el Encabezado de la Remisión
                </label>
                <input
                  type="text"
                  value={currentTexts.deliveryNoteHeaderNote || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    customTexts: { ...currentTexts, deliveryNoteHeaderNote: e.target.value }
                  })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  placeholder="Comprobante formal de entrega y garantía técnica de uniformes industriales."
                />
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-slate-700 mb-1">
                  Cláusula de Garantía & Términos al Pie de Página
                </label>
                <textarea
                  rows={2}
                  value={currentTexts.deliveryNoteTerms || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    customTexts: { ...currentTexts, deliveryNoteTerms: e.target.value }
                  })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
                  placeholder="Garantía técnica de confección y costuras reforzadas..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Línea de Firma: Empresa Remitente (Izquierda)
                  </label>
                  <input
                    type="text"
                    value={currentTexts.deliverySignatureCompany || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTexts: { ...currentTexts, deliverySignatureCompany: e.target.value }
                    })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold"
                    placeholder="Entregado por: Confecciones y Dotaciones JF12 S.A.S."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Línea de Firma: Cliente Receptor (Derecha)
                  </label>
                  <input
                    type="text"
                    value={currentTexts.deliverySignatureClient || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customTexts: { ...currentTexts, deliverySignatureClient: e.target.value }
                    })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold"
                    placeholder="Recibido a Conformidad por el Cliente"
                  />
                </div>
              </div>
            </div>

            {/* Modules Titles & Subtitles */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>3. Títulos y Subtítulos de los Módulos de la Aplicación</span>
              </div>

              <div className="space-y-4 text-xs divide-y divide-slate-100">
                {/* Orders Module */}
                <div className="pt-3 first:pt-0 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Módulo de Pedidos y Despachos
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Título en Pantalla:</span>
                      <input
                        type="text"
                        value={currentTexts.ordersTitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, ordersTitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Subtítulo Descriptivo:</span>
                      <input
                        type="text"
                        value={currentTexts.ordersSubtitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, ordersSubtitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Inventory Module */}
                <div className="pt-3 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Módulo de Inventario y Bodega
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Título en Pantalla:</span>
                      <input
                        type="text"
                        value={currentTexts.inventoryTitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, inventoryTitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Subtítulo Descriptivo:</span>
                      <input
                        type="text"
                        value={currentTexts.inventorySubtitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, inventorySubtitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Tracking Module */}
                <div className="pt-3 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Módulo de Rastreo & Trazabilidad
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Título en Pantalla:</span>
                      <input
                        type="text"
                        value={currentTexts.trackingTitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, trackingTitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Subtítulo Descriptivo:</span>
                      <input
                        type="text"
                        value={currentTexts.trackingSubtitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, trackingSubtitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Catalog Module */}
                <div className="pt-3 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    Módulo de Catálogo & Precios
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Título en Pantalla:</span>
                      <input
                        type="text"
                        value={currentTexts.catalogTitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, catalogTitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Subtítulo Descriptivo:</span>
                      <input
                        type="text"
                        value={currentTexts.catalogSubtitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, catalogSubtitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Reports Module */}
                <div className="pt-3 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Módulo de Reportes Mensuales & Facturación
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Título en Pantalla:</span>
                      <input
                        type="text"
                        value={currentTexts.reportsTitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, reportsTitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Subtítulo Descriptivo:</span>
                      <input
                        type="text"
                        value={currentTexts.reportsSubtitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          customTexts: { ...currentTexts, reportsSubtitle: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DATOS FISCALES & TARIFAS */}
        {/* ============================================================== */}
        {activeAdminTab === 'business' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Legal & Fiscal Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>1. Información Legal & Dirección de la Empresa</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Razón Social Completa</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIT / Identificación Fiscal</label>
                  <input
                    type="text"
                    value={formData.companyTaxId}
                    onChange={(e) => setFormData({ ...formData, companyTaxId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfonos de Contacto</label>
                  <input
                    type="text"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico Oficial</label>
                  <input
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dirección de la Planta / Bodega</label>
                  <input
                    type="text"
                    value={formData.companyAddress}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ciudad y País</label>
                  <input
                    type="text"
                    value={formData.companyCity}
                    onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Invoicing Settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>2. Parámetros de Facturación & Consecutivo de Pedidos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tasa de Impuesto / IVA (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.defaultTaxRate}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Se aplica automáticamente a los nuevos pedidos.</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prefijo de Pedidos</label>
                  <input
                    type="text"
                    value={formData.orderPrefix}
                    onChange={(e) => setFormData({ ...formData, orderPrefix: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Ejemplo: JF12-2026- o ORD-</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Símbolo de Moneda</label>
                  <input
                    type="text"
                    value={formData.currencySymbol}
                    onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Ejemplo: $ o USD</span>
                </div>
              </div>
            </div>

            {/* Embroidery & Stock Threshold Pricing */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>3. Matriz de Tarifas de Bordados & Alerta de Existencias</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block font-semibold text-slate-800 mb-1">Bordado Pecho Izq. ($)</label>
                  <input
                    type="number"
                    value={formData.embroideryPricing.bordado_pecho}
                    onChange={(e) => setFormData({
                      ...formData,
                      embroideryPricing: { ...formData.embroideryPricing, bordado_pecho: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full p-2 border border-slate-300 bg-white rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block font-semibold text-slate-800 mb-1">Bordado Espalda ($)</label>
                  <input
                    type="number"
                    value={formData.embroideryPricing.bordado_espalda}
                    onChange={(e) => setFormData({
                      ...formData,
                      embroideryPricing: { ...formData.embroideryPricing, bordado_espalda: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full p-2 border border-slate-300 bg-white rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block font-semibold text-slate-800 mb-1">Estampado Reflectivo ($)</label>
                  <input
                    type="number"
                    value={formData.embroideryPricing.estampado_reflectivo}
                    onChange={(e) => setFormData({
                      ...formData,
                      embroideryPricing: { ...formData.embroideryPricing, estampado_reflectivo: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full p-2 border border-slate-300 bg-white rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block font-semibold text-slate-800 mb-1">Logo Doble ($)</label>
                  <input
                    type="number"
                    value={formData.embroideryPricing.logo_doble}
                    onChange={(e) => setFormData({
                      ...formData,
                      embroideryPricing: { ...formData.embroideryPricing, logo_doble: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full p-2 border border-slate-300 bg-white rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="max-w-xs text-xs pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alerta Global de Stock Bajo (Unidades)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.minStockGlobalAlert}
                  onChange={(e) => setFormData({ ...formData, minStockGlobalAlert: parseInt(e.target.value) || 10 })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SEGURIDAD, PIN & AUDITORÍA */}
        {/* ============================================================== */}
        {activeAdminTab === 'security' && (
          <div className="space-y-6 animate-in fade-in">
            {/* PIN Master and Auto-lock */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                <KeyRound className="w-4 h-4 text-red-600" />
                <span>1. Políticas de Seguridad, PIN de Desbloqueo & Terminal</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block font-semibold text-slate-800 mb-1">
                    PIN Maestro de Administrador (Desbloqueo de Pantalla)
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPinConfig ? 'text' : 'password'}
                      maxLength={6}
                      value={formData.adminPin}
                      onChange={(e) => setFormData({ ...formData, adminPin: e.target.value.replace(/\D/g, '') })}
                      className="w-full p-2 pr-9 border border-slate-300 bg-white rounded-lg text-xs font-mono font-bold text-center tracking-widest text-base"
                      placeholder="••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPinConfig(!showAdminPinConfig)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showAdminPinConfig ? 'Ocultar PIN' : 'Mostrar PIN'}
                    >
                      {showAdminPinConfig ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Clave maestra confidencial. Mantenla en secreto para que los trabajadores no puedan acceder a todas las funciones.
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block font-semibold text-slate-800 mb-1">
                    Tiempo de Auto-Bloqueo (Minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.autoLockMinutes}
                    onChange={(e) => setFormData({ ...formData, autoLockMinutes: parseInt(e.target.value) || 15 })}
                    className="w-full p-2 border border-slate-300 bg-white rounded-lg text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    La pantalla se bloqueará tras este tiempo sin actividad.
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="block font-semibold text-slate-800 mb-1">
                      Exigir PIN en Acciones Críticas
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Protege la base de datos contra borrados accidentales.
                    </span>
                  </div>
                  <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requirePinForSensitiveActions}
                      onChange={(e) => setFormData({ ...formData, requirePinForSensitiveActions: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-800">Protección Activa</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Delegated Permissions Matrix */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Matriz de Permisos Delegados para Empleados</span>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  {users.length} Empleados en el Sistema
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Empleado</th>
                      <th className="p-3">Cargo</th>
                      <th className="p-3 text-center">Pedidos</th>
                      <th className="p-3 text-center">Catálogo</th>
                      <th className="p-3 text-center">Reportes</th>
                      <th className="p-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => {
                      const isMasterAdmin = u.role === 'admin_principal';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </td>
                          <td className="p-3">
                            <span className="text-[11px] font-semibold text-slate-700">{u.department}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isMasterAdmin || u.permissions?.pedidos?.canEdit
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.permissions?.pedidos?.canView
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {isMasterAdmin ? 'Total' : u.permissions?.pedidos?.canEdit ? 'Ver+Editar' : u.permissions?.pedidos?.canView ? 'Solo Ver' : 'Bloqueado'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isMasterAdmin || u.permissions?.catalogo?.canEdit
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.permissions?.catalogo?.canView
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {isMasterAdmin ? 'Total' : u.permissions?.catalogo?.canEdit ? 'Ver+Editar' : u.permissions?.catalogo?.canView ? 'Solo Ver' : 'Bloqueado'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isMasterAdmin || u.permissions?.reportes?.canEdit
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.permissions?.reportes?.canView
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {isMasterAdmin ? 'Total' : u.permissions?.reportes?.canEdit ? 'Ver+Editar' : u.permissions?.reportes?.canView ? 'Solo Ver' : 'Bloqueado'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {isMasterAdmin ? (
                              <span className="text-[11px] text-slate-400 italic">Irrevocable</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedUserForPermissions(u)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                Modificar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>3. Bitácora de Auditoría en Tiempo Real (Security Audit Logs)</span>
                </div>
                <span className="text-[10px] bg-slate-900 text-amber-400 font-mono px-2 py-0.5 rounded">
                  {securityLogs.length} Eventos Registrados
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {securityLogs.map(log => {
                  const dateStr = new Date(log.timestamp).toLocaleString('es-CO', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <div key={log.id} className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded border uppercase bg-slate-100 text-slate-700">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600">
                            Módulo: {log.module}
                          </span>
                        </div>
                        <p className="text-slate-800 text-xs">{log.details}</p>
                        <div className="text-[10px] text-slate-400">
                          Ejecutado por: <strong>{log.userName}</strong> ({log.userRole})
                        </div>
                      </div>
                      <div className="text-right shrink-0 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dateStr}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Factory Reset */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-2">
              <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Restaurar Datos a Valores de Fábrica</span>
              </div>
              <p className="text-xs text-rose-800">
                Restablece pedidos, clientes y catálogo al estado de prueba inicial. Esta acción no se puede deshacer.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Datos Iniciales</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Save Button at bottom of all tabs */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="submit"
            id="btn-guardar-config-admin"
            style={{
              backgroundColor: currentTheme.primaryColor,
              color: currentTheme.primaryTextColor || '#020617'
            }}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-opacity hover:opacity-90 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Todos los Cambios (Logo, Colores, Textos & Parámetros)</span>
          </button>
        </div>
      </form>

      {/* Permissions Modal if opened */}
      {selectedUserForPermissions && (
        <PermissionsModal
          user={selectedUserForPermissions}
          onClose={() => setSelectedUserForPermissions(null)}
        />
      )}
    </div>
  );
};

export default AdminSettings;

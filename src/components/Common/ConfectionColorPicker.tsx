import React, { useState, useEffect } from 'react';
import { Pipette, Check, Palette, Sparkles, Hash, Layers } from 'lucide-react';

export interface ConfectionColorValue {
  name: string;
  hex: string;
  code: string; // e.g. "Pantone 286 C" or "RAL 5002"
}

interface ConfectionColorPickerProps {
  value: ConfectionColorValue;
  onChange: (val: ConfectionColorValue) => void;
  availableProductColors?: string[];
}

// Catálogo técnico de colores industriales de confección con código HEX y Pantone oficial
export const INDUSTRIAL_TEXTILE_COLORS: Array<{
  name: string;
  hex: string;
  code: string;
  family: 'azules' | 'visibilidad' | 'neutros' | 'corporativos';
}> = [
  // Azules y Marinos
  { name: 'Azul Marino / Navy', hex: '#0a192f', code: 'Pantone 19-4010 TCX', family: 'azules' },
  { name: 'Azul Royal / Rey', hex: '#1e3a8a', code: 'Pantone 286 C', family: 'azules' },
  { name: 'Azul Petróleo Industrial', hex: '#0e7490', code: 'Pantone 18-4726 TCX', family: 'azules' },
  { name: 'Azul Celeste Institucional', hex: '#0284c7', code: 'Pantone 16-4134 TCX', family: 'azules' },

  // Alta Visibilidad y Seguridad Vial
  { name: 'Naranja Vial Reflectivo', hex: '#ea580c', code: 'Pantone 16-1364 TCX / ANSI 107', family: 'visibilidad' },
  { name: 'Amarillo Neón Hi-Vis', hex: '#eab308', code: 'Pantone 13-0630 TCX / EN 20471', family: 'visibilidad' },
  { name: 'Rojo Brigadista / Bomberos', hex: '#dc2626', code: 'Pantone 18-1662 TCX', family: 'visibilidad' },

  // Neutros y Driles
  { name: 'Kaki / Caqui Minero', hex: '#927c62', code: 'Pantone 16-1107 TCX', family: 'neutros' },
  { name: 'Gris Ratón Industrial', hex: '#475569', code: 'Pantone 17-4402 TCX', family: 'neutros' },
  { name: 'Gris Plomo Mecánico', hex: '#334155', code: 'Pantone 19-3908 TCX', family: 'neutros' },
  { name: 'Negro Grafito / Carbono', hex: '#18181b', code: 'Pantone 19-4004 TCX', family: 'neutros' },
  { name: 'Blanco Clínico / Sanitario', hex: '#f8fafc', code: 'Pantone 11-0601 TCX', family: 'neutros' },

  // Corporativos y Especiales
  { name: 'Verde Quirúrgico / Botella', hex: '#15803d', code: 'Pantone 18-5624 TCX', family: 'corporativos' },
  { name: 'Verde Oliva / Militar', hex: '#3f6212', code: 'Pantone 19-0419 TCX', family: 'corporativos' },
  { name: 'Vinotinto / Borgoña Ejecutivo', hex: '#881337', code: 'Pantone 19-1650 TCX', family: 'corporativos' },
  { name: 'Beige Claro Sanitario', hex: '#d4c5b9', code: 'Pantone 14-1108 TCX', family: 'corporativos' },
];

export const ConfectionColorPicker: React.FC<ConfectionColorPickerProps> = ({
  value,
  onChange,
  availableProductColors = [],
}) => {
  const [hexInput, setHexInput] = useState<string>(value.hex || '#1e3a8a');
  const [nameInput, setNameInput] = useState<string>(value.name || 'Azul Royal');
  const [codePantoneInput, setCodePantoneInput] = useState<string>(value.code || 'Pantone 286 C');
  const [hasEyeDropper, setHasEyeDropper] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'palette' | 'custom'>('palette');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value.hex) setHexInput(value.hex);
    if (value.name) setNameInput(value.name);
    if (value.code) setCodePantoneInput(value.code);
  }, [value.hex, value.name, value.code]);

  // Convert hex to rgb for technical display
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    return 'rgb(30, 58, 138)';
  };

  // Trigger EyeDropper API
  const handleUseEyeDropper = async () => {
    if (hasEyeDropper && (window as any).EyeDropper) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const sampledHex = result.sRGBHex;
          setHexInput(sampledHex);
          
          // Match with nearest preset or create custom code
          const matched = INDUSTRIAL_TEXTILE_COLORS.find(
            c => c.hex.toLowerCase() === sampledHex.toLowerCase()
          );
          
          const newName = matched ? matched.name : `Tono Muestreado (${sampledHex.toUpperCase()})`;
          const newCode = matched ? matched.code : `Muestra Pipeta ${sampledHex.toUpperCase()}`;
          setNameInput(newName);
          setCodePantoneInput(newCode);

          onChange({
            hex: sampledHex,
            name: newName,
            code: newCode,
          });
        }
      } catch (e) {
        // User cancelled or not supported
      }
    } else {
      // Fallback: trigger color input click
      const el = document.getElementById('native-color-picker-input');
      if (el) el.click();
    }
  };

  // Handle native color picker change
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexInput(newHex);
    
    const matched = INDUSTRIAL_TEXTILE_COLORS.find(
      c => c.hex.toLowerCase() === newHex.toLowerCase()
    );

    const newName = matched ? matched.name : `Color Confección (${newHex.toUpperCase()})`;
    const newCode = matched ? matched.code : `Hex ${newHex.toUpperCase()}`;
    setNameInput(newName);
    setCodePantoneInput(newCode);

    onChange({
      hex: newHex,
      name: newName,
      code: newCode,
    });
  };

  // Select swatch from industrial textile catalog
  const handleSelectSwatch = (swatch: typeof INDUSTRIAL_TEXTILE_COLORS[0]) => {
    setHexInput(swatch.hex);
    setNameInput(swatch.name);
    setCodePantoneInput(swatch.code);
    onChange({
      hex: swatch.hex,
      name: swatch.name,
      code: swatch.code,
    });
  };

  // Handle manual HEX input change
  const handleHexTextChange = (text: string) => {
    let clean = text.trim();
    if (!clean.startsWith('#') && clean.length > 0) {
      clean = '#' + clean;
    }
    setHexInput(clean);
    if (/^#[0-9A-F]{6}$/i.test(clean)) {
      onChange({
        hex: clean,
        name: nameInput,
        code: codePantoneInput || `Hex ${clean.toUpperCase()}`,
      });
    }
  };

  // Handle manual name or code change
  const handleCommitCustomValues = (newName: string, newCode: string) => {
    setNameInput(newName);
    setCodePantoneInput(newCode);
    onChange({
      hex: hexInput.startsWith('#') ? hexInput : `#${hexInput}`,
      name: newName,
      code: newCode,
    });
  };

  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      {/* Header with Cuenta Gotas & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            Color de Confección & Código Exacto:
          </label>
          <span className="text-[11px] text-slate-500">
            Define el tono textil con cuenta gotas, código HEX o Pantone de fábrica
          </span>
        </div>

        {/* Cuenta Gotas / Dropper action button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseEyeDropper}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Activar cuenta gotas de precisión para extraer el color exacto"
          >
            <Pipette className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Usar Cuenta Gotas</span>
          </button>

          {/* Hidden native input[type=color] as fallback/direct picker */}
          <label
            htmlFor="native-color-picker-input"
            className="w-8 h-8 rounded-lg border-2 border-slate-300 overflow-hidden cursor-pointer shadow-xs relative flex items-center justify-center hover:border-amber-500 transition-colors"
            title="Abrir selector de color del sistema"
          >
            <span
              className="absolute inset-0"
              style={{ backgroundColor: hexInput }}
            />
            <input
              id="native-color-picker-input"
              type="color"
              value={hexInput.startsWith('#') && hexInput.length === 7 ? hexInput : '#1e3a8a'}
              onChange={handleColorInputChange}
              className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {/* Active Color Spec Bar (Exact Hex, Pantone, Preview) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2.5">
          {/* Swatch preview with subtle textile weave border */}
          <div
            className="w-10 h-10 rounded-lg shadow-sm border border-slate-300/80 shrink-0 relative overflow-hidden flex items-end justify-end p-0.5"
            style={{ backgroundColor: hexInput }}
          >
            <span className="text-[9px] font-black text-white px-1 bg-black/40 rounded backdrop-blur-xs font-mono">
              {hexInput.toUpperCase()}
            </span>
          </div>

          <div>
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <span>{nameInput}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {hexInput.toUpperCase()}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
              <span>{codePantoneInput || 'Pantone / Código Industrial'}</span>
              <span>•</span>
              <span className="text-slate-400">{hexToRgb(hexInput)}</span>
            </div>
          </div>
        </div>

        {/* Tab Toggle: Catálogo vs Manual */}
        <div className="flex items-center rounded-lg bg-slate-200 p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('palette')}
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'palette'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Carta Textil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Código Exacto
          </button>
        </div>
      </div>

      {/* VIEW 1: Swatches Palette */}
      {activeTab === 'palette' && (
        <div className="space-y-2">
          {availableProductColors.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500">Colores de fábrica de la prenda:</span>
              {availableProductColors.map(cName => {
                const isSelected = nameInput.toLowerCase() === cName.toLowerCase();
                return (
                  <button
                    key={cName}
                    type="button"
                    onClick={() => {
                      const matched = INDUSTRIAL_TEXTILE_COLORS.find(
                        tc => tc.name.toLowerCase().includes(cName.toLowerCase())
                      );
                      const targetHex = matched ? matched.hex : hexInput;
                      const targetCode = matched ? matched.code : `Estándar ${cName}`;
                      setNameInput(cName);
                      if (matched) {
                        setHexInput(matched.hex);
                        setCodePantoneInput(matched.code);
                      }
                      onChange({
                        name: cName,
                        hex: targetHex,
                        code: targetCode,
                      });
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {cName}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Swatches Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {INDUSTRIAL_TEXTILE_COLORS.map(item => {
              const isSelected = hexInput.toLowerCase() === item.hex.toLowerCase();
              return (
                <button
                  key={item.hex + item.name}
                  type="button"
                  onClick={() => handleSelectSwatch(item)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-1 ring-amber-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-md shrink-0 border border-slate-300/80 shadow-2xs"
                    style={{ backgroundColor: item.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                      {item.name.split('/')[0]}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 truncate leading-tight">
                      {item.hex.toUpperCase()}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3 h-3 text-amber-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Manual exact codes input */}
      {activeTab === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-400" />
              Código HEX Exacto:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="#1E3A8A"
                value={hexInput}
                onChange={(e) => handleHexTextChange(e.target.value)}
                maxLength={7}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 uppercase"
              />
              <span
                className="absolute right-2 top-2 w-4 h-4 rounded border border-slate-300 shadow-2xs"
                style={{ backgroundColor: hexInput }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              Código Pantone / Textil:
            </label>
            <input
              type="text"
              placeholder="Ej: Pantone 286 C"
              value={codePantoneInput}
              onChange={(e) => handleCommitCustomValues(nameInput, e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nombre Comercial del Tono:
            </label>
            <input
              type="text"
              placeholder="Ej: Azul Rey Corporativo"
              value={nameInput}
              onChange={(e) => handleCommitCustomValues(e.target.value, codePantoneInput)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { UniformProduct, UniformCategory, PriceTier, SizeStock, GarmentGender } from '../../types';
import { formatCurrency, GARMENT_GENDER_INFO } from '../../utils/formatters';
import { 
  X, 
  Tag, 
  DollarSign, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Package, 
  Layers,
  Percent,
  Sliders,
  ShieldCheck,
  Shirt
} from 'lucide-react';

const CATEGORIES: UniformCategory[] = [
  'Overoles y Mamelucos',
  'Camisas y Blusas Industriales',
  'Pantalones y Jeans de Trabajo',
  'Calzado de Seguridad',
  'Alta Visibilidad y Vial',
  'Protección Térmica e Ignífuga',
  'Batas y Salud Ocupacional',
  'Accesorios y EPP Complementario',
];

const DEFAULT_SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const DEFAULT_SIZES_FOOTWEAR = ['37', '38', '39', '40', '41', '42', '43', '44'];

interface ProductModalProps {
  product?: UniformProduct | null; // If present, edit mode; otherwise, create mode
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: UniformProduct | Omit<UniformProduct, 'id'>) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = !!product;

  // Form State
  const [name, setName] = useState(product?.name || '');
  const [code, setCode] = useState(product?.code || `UNI-${Date.now().toString().slice(-4)}`);
  const [category, setCategory] = useState<UniformCategory>(product?.category || 'Camisas y Blusas Industriales');
  const [fabric, setFabric] = useState(product?.fabric || 'Dril Vulcano 100% Algodón 280g/m²');
  const [description, setDescription] = useState(product?.description || '');
  const [colorsText, setColorsText] = useState(product?.colors.join(', ') || 'Azul Marino, Caqui, Gris Plomo');
  const [safetyNormsText, setSafetyNormsText] = useState(product?.safetyNorms.join(', ') || '');
  const [basePrice, setBasePrice] = useState<number>(product?.basePrice || 85000);
  const [minStockLevel, setMinStockLevel] = useState<number>(product?.minStockLevel || 15);
  const [availableGenders, setAvailableGenders] = useState<GarmentGender[]>(
    product?.availableGenders || ['dama', 'caballero', 'unisex']
  );

  // Price Tiers state
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(() => {
    if (product?.priceTiers && product.priceTiers.length > 0) {
      return [...product.priceTiers];
    }
    const base = product?.basePrice || 85000;
    return [
      { minQuantity: 1, pricePerUnit: base, label: '1 - 11 unds (Detal)' },
      { minQuantity: 12, pricePerUnit: Math.round(base * 0.9), label: '12 - 49 unds (Pyme)' },
      { minQuantity: 50, pricePerUnit: Math.round(base * 0.8), label: '50 - 199 unds (Mayorista)' },
      { minQuantity: 200, pricePerUnit: Math.round(base * 0.72), label: '200+ unds (Corporativo)' },
    ];
  });

  // Size Stock state
  const [sizeStock, setSizeStock] = useState<SizeStock[]>(() => {
    if (product?.sizeStock && product.sizeStock.length > 0) {
      return [...product.sizeStock];
    }
    const defaultSizes = category === 'Calzado de Seguridad' ? DEFAULT_SIZES_FOOTWEAR : DEFAULT_SIZES_CLOTHING;
    return defaultSizes.map(size => ({
      size,
      stock: 25,
      minAlert: 5,
    }));
  });

  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'stock'>('info');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-generate standard volume tiers based on current base price
  const handleAutoGenerateTiers = () => {
    if (basePrice <= 0) return;
    setPriceTiers([
      { minQuantity: 1, pricePerUnit: basePrice, label: '1 - 11 unds (Detal)' },
      { minQuantity: 12, pricePerUnit: Math.round(basePrice * 0.9), label: '12 - 49 unds (Pyme -10%)' },
      { minQuantity: 50, pricePerUnit: Math.round(basePrice * 0.8), label: '50 - 199 unds (Mayorista -20%)' },
      { minQuantity: 200, pricePerUnit: Math.round(basePrice * 0.72), label: '200+ unds (Corporativo -28%)' },
    ]);
  };

  const handleUpdateTierPrice = (index: number, newPrice: number) => {
    setPriceTiers(prev => prev.map((tier, i) => {
      if (i !== index) return tier;
      return { ...tier, pricePerUnit: Math.max(0, newPrice) };
    }));
  };

  const handleUpdateTierLabel = (index: number, newLabel: string) => {
    setPriceTiers(prev => prev.map((tier, i) => {
      if (i !== index) return tier;
      return { ...tier, label: newLabel };
    }));
  };

  const handleUpdateTierMinQty = (index: number, newMinQty: number) => {
    setPriceTiers(prev => prev.map((tier, i) => {
      if (i !== index) return tier;
      return { ...tier, minQuantity: Math.max(1, newMinQty) };
    }));
  };

  const handleAddTier = () => {
    const lastTier = priceTiers[priceTiers.length - 1];
    const newMin = lastTier ? lastTier.minQuantity * 2 : 100;
    const newPrice = lastTier ? Math.round(lastTier.pricePerUnit * 0.95) : basePrice;
    setPriceTiers([
      ...priceTiers,
      { minQuantity: newMin, pricePerUnit: newPrice, label: `${newMin}+ unds (Especial)` }
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (priceTiers.length <= 1) {
      alert('Debe existir al menos una escala de precio para la prenda.');
      return;
    }
    setPriceTiers(prev => prev.filter((_, i) => i !== index));
  };

  const handleStockChange = (sizeIndex: number, newStock: number) => {
    setSizeStock(prev => prev.map((item, i) => {
      if (i !== sizeIndex) return item;
      return { ...item, stock: Math.max(0, newStock) };
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Debes ingresar el nombre de la prenda.');
      setActiveTab('info');
      return;
    }

    if (!code.trim()) {
      setErrorMsg('Debes ingresar el código SKU de la prenda.');
      setActiveTab('info');
      return;
    }

    if (basePrice <= 0) {
      setErrorMsg('El precio detal base debe ser mayor a cero.');
      setActiveTab('pricing');
      return;
    }

    const colors = colorsText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const safetyNorms = safetyNormsText
      .split(',')
      .map(n => n.trim())
      .filter(Boolean);

    const totalStock = sizeStock.reduce((acc, curr) => acc + (curr.stock || 0), 0);

    const productPayload = {
      ...(product ? { id: product.id } : {}),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      fabric: fabric.trim(),
      description: description.trim() || `Prenda de confección industrial de alta durabilidad modelo ${name.trim()}.`,
      colors: colors.length > 0 ? colors : ['Azul Marino', 'Negro'],
      safetyNorms,
      availableGenders: availableGenders.length > 0 ? availableGenders : ['unisex'],
      basePrice: Math.round(basePrice),
      priceTiers: priceTiers.sort((a, b) => a.minQuantity - b.minQuantity),
      sizeStock,
      totalStock,
      minStockLevel: Math.max(1, minStockLevel),
      featured: product?.featured || false,
      imageUrl: product?.imageUrl,
    };

    onSave(productPayload as UniformProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? `Editar Prenda: ${product.name}` : 'Añadir Nueva Prenda al Catálogo'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing 
                  ? 'Modifica el nombre, precios escalonados por volumen y especificaciones técnicas.' 
                  : 'Registra una nueva prenda de confección para el catálogo comercial y cotizaciones.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-amber-500 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>1. Nombre & Especificaciones</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'border-amber-500 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>2. Precios & Escalas por Volumen</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stock'
                ? 'border-amber-500 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>3. Tallas Disponibles</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            
            {/* TAB 1: General Info */}
            {activeTab === 'info' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nombre Oficial de la Prenda *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Ej: Camisa Oxford Manga Larga con Cinta Reflectiva"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Este es el nombre visible en el catálogo, pedidos, cotizaciones e impresiones de remisión.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Código SKU / Referencia de Taller *
                    </label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Ej: UNI-CAM-01"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Línea / Categoría de Dotación *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as UniformCategory)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Available Genders / Silhouettes */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="block font-bold text-slate-800 text-xs">
                      Siluetas y Cortes Disponibles para Confección:
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Indica si esta prenda se fabrica en Dama, Caballero o Unisex
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['dama', 'caballero', 'unisex', 'nino', 'nina'] as GarmentGender[]).map((g) => {
                      const info = GARMENT_GENDER_INFO[g];
                      const isChecked = availableGenders.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              if (availableGenders.length <= 1) {
                                alert('Debe haber al menos una silueta habilitada para la prenda.');
                                return;
                              }
                              setAvailableGenders(prev => prev.filter(item => item !== g));
                            } else {
                              setAvailableGenders(prev => [...prev, g]);
                            }
                          }}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                            isChecked
                              ? info.activeBadge
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{info.icon}</span>
                          <span>{info.shortLabel}</span>
                          <span className="text-[10px] ml-1">{isChecked ? '✓' : '+'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Composición Textil & Gramaje *
                    </label>
                    <input
                      type="text"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      placeholder="Ej: Dril 100% Algodón 280g/m²"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Colores Disponibles (separados por coma)
                    </label>
                    <input
                      type="text"
                      value={colorsText}
                      onChange={(e) => setColorsText(e.target.value)}
                      placeholder="Azul Petróleo, Gris Perla, Blanco"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Normas Técnicas y Certificaciones (opcional, separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={safetyNormsText}
                    onChange={(e) => setSafetyNormsText(e.target.value)}
                    placeholder="NFPA 2112, ANSI/ISEA 107, ASTM F1506"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Descripción Técnica y Usos Industriales
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Indica recomendaciones de uso, bolsillos especiales, refuerzos en costuras, etc."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-normal text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Pricing & Volume Tiers */}
            {activeTab === 'pricing' && (
              <div className="space-y-5 text-xs">
                {/* Base Price Banner */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="block font-black text-slate-900 text-sm mb-1">
                      Precio Base al Detal (1 a 11 unidades) *
                    </label>
                    <span className="text-slate-600 text-xs">
                      Tarifa unitaria inicial antes de IVA para compras al por menor o reposición individual.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-base">$</span>
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      required
                      value={basePrice}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setBasePrice(val);
                        // Also update tier 0 if it's detal
                        if (priceTiers[0]?.minQuantity === 1) {
                          handleUpdateTierPrice(0, val);
                        }
                      }}
                      className="w-36 px-3 py-2 rounded-xl border border-amber-300 bg-white font-black text-slate-900 text-base focus:ring-2 focus:ring-amber-500 outline-none text-right"
                    />
                  </div>
                </div>

                {/* Auto generate button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">Escalas de Descuento por Volumen (Mayoristas & Licitaciones)</span>
                    <span className="text-slate-500 text-[11px]">Define los precios que se aplicarán automáticamente cuando el cliente pida en lote.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoGenerateTiers}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Auto-Calcular Escalas (-10%, -20%, -28%)</span>
                  </button>
                </div>

                {/* Tiers List */}
                <div className="space-y-2.5">
                  {priceTiers.map((tier, idx) => {
                    const discountPercent = basePrice > 0 
                      ? Math.round(((basePrice - tier.pricePerUnit) / basePrice) * 100)
                      : 0;

                    return (
                      <div 
                        key={idx}
                        className="bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                          <div>
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                              Nombre / Etiqueta de Escala
                            </label>
                            <input
                              type="text"
                              value={tier.label}
                              onChange={(e) => handleUpdateTierLabel(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                              Cantidad Mínima Requerida
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                value={tier.minQuantity}
                                onChange={(e) => handleUpdateTierMinQty(idx, parseInt(e.target.value) || 1)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                              />
                              <span className="text-[11px] text-slate-500 shrink-0">piezas</span>
                            </div>
                          </div>
                        </div>

                        {/* Price input & discount badge */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <div>
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5 text-right">
                              Precio Unitario ($)
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={tier.pricePerUnit}
                                onChange={(e) => handleUpdateTierPrice(idx, parseFloat(e.target.value) || 0)}
                                className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-900 text-right focus:border-amber-500 outline-none"
                              />
                            </div>
                          </div>

                          <div className="w-16 text-center">
                            <span className="text-[10px] text-slate-400 block">Ahorro</span>
                            {discountPercent > 0 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full inline-block">
                                -{discountPercent}%
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-medium">0%</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer mt-3"
                            title="Eliminar escala"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir Otra Escala de Precio</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Tallas de Confección Disponibles */}
            {activeTab === 'stock' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 text-sm mb-1">Tallas Habilitadas para Pedidos y Confección</div>
                  <p className="text-slate-500 text-xs">
                    Las siguientes tallas estarán disponibles para que los asesores y clientes puedan solicitarlas en los pedidos y cotizaciones:
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {sizeStock.map((s, idx) => (
                      <div key={s.size} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-200">
                            {s.size}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-700">Habilitada</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (sizeStock.length <= 1) {
                              setErrorMsg('Debes mantener al menos una talla habilitada para la prenda.');
                              return;
                            }
                            setSizeStock(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Remover talla"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Preset Size Loaders */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Cargar plantillas de tallas por silueta y tipo de prenda:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const kidsSizes = ['4', '6', '8', '10', '12', '14', '16'];
                          setSizeStock(kidsSizes.map(size => ({ size, stock: 25, minAlert: 5 })));
                        }}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        👦👧 Infantil Niños/Niñas (4 a 16 de 2 en 2)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const damaSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
                          setSizeStock(damaSizes.map(size => ({ size, stock: 25, minAlert: 5 })));
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        👩 Plantilla Dama (XS a 5XL)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const cabSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
                          setSizeStock(cabSizes.map(size => ({ size, stock: 25, minAlert: 5 })));
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        👨 Plantilla Caballero (XS a 5XL)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const uniSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
                          setSizeStock(uniSizes.map(size => ({ size, stock: 25, minAlert: 5 })));
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        👥 Plantilla Unisex (XS a 5XL)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const pantSizes = ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'];
                          setSizeStock(pantSizes.map(size => ({ size, stock: 25, minAlert: 5 })));
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        👖 Pantalón Caballero (28 a 48 de 2 en 2)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const pantDamaSizes = ['6', '8', '10', '12', '14', '16', '18', '20'];
                          setSizeStock(pantDamaSizes.map(size => ({ size, stock: 25, minAlert: 5 })));
                        }}
                        className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        🌸 Pantalón Dama (6 a 20 de 2 en 2)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const bootSizes = [
                            '34', '35', '36', '37', '38', '39', '40',
                            '41', '42', '43', '44', '45', '46', '47',
                            '48', '49', '50'
                          ];
                          setSizeStock(bootSizes.map(size => ({ size, stock: 20, minAlert: 5 })));
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        🥾 Calzado y Botas (34 a 50)
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-600">Añadir talla individual:</span>
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38', '40', '38', '39', '40', '41', '42'].filter(
                      sz => !sizeStock.some(s => s.size === sz)
                    ).slice(0, 7).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setSizeStock(prev => [...prev, { size: sz, stock: 25, minAlert: 5 }]);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                      >
                        + {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer actions */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Total Prenda: <strong className="text-slate-900">{formatCurrency(basePrice)}</strong> (Base Detal)
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Guardar Cambios de la Prenda' : 'Añadir Prenda al Catálogo'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProductModal;

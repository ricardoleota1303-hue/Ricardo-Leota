import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UniformProduct, GarmentGender } from '../../types';
import { formatCurrency, GARMENT_GENDER_INFO } from '../../utils/formatters';
import { ProductModal } from './ProductModal';
import { 
  Tag, 
  Search, 
  ShieldCheck, 
  Layers, 
  Calculator, 
  Sparkles, 
  Printer, 
  Check, 
  ChevronRight,
  Info,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react';

interface PriceCatalogProps {
  onOpenCreateOrder: () => void;
}

export const PriceCatalog: React.FC<PriceCatalogProps> = ({ onOpenCreateOrder }) => {
  const { 
    products, 
    config, 
    isAdmin, 
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('todas');

  // Modal State for Adding or Editing Product & Prices
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<UniformProduct | null>(null);

  // Interactive quick calculator state
  const [calcProductId, setCalcProductId] = useState<string>(products[0]?.id || '');
  const [calcGender, setCalcGender] = useState<GarmentGender>('unisex');
  const [calcQuantity, setCalcQuantity] = useState<number>(50);
  const [calcEmbroidery, setCalcEmbroidery] = useState<string>('bordado_pecho');

  const handleOpenAddProduct = () => {
    setSelectedProductForEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: UniformProduct) => {
    setSelectedProductForEdit(prod);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (prod: UniformProduct) => {
    if (!isAdmin) {
      alert('Restricción de seguridad: Solo el Administrador Principal puede eliminar prendas del catálogo.');
      return;
    }
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente la prenda "${prod.name}" (${prod.code}) del catálogo y de la bodega de existencias?`
    );
    if (confirmed) {
      deleteProduct(prod.id);
      if (calcProductId === prod.id) {
        setCalcProductId(products.find(p => p.id !== prod.id)?.id || '');
      }
    }
  };

  const handleSaveProduct = (productData: UniformProduct | Omit<UniformProduct, 'id'>) => {
    if ('id' in productData && productData.id) {
      updateProduct(productData as UniformProduct);
    } else {
      addProduct(productData as Omit<UniformProduct, 'id'>);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fabric.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'todas' || p.category === selectedCategory;
    const available = p.availableGenders || ['dama', 'caballero', 'unisex'];
    const matchesGender = selectedGenderFilter === 'todas' || available.includes(selectedGenderFilter as GarmentGender);
    return matchesSearch && matchesCat && matchesGender;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  // Calculate quote in simulator
  const activeCalcProd = products.find(p => p.id === calcProductId) || products[0];
  const getSimulatedUnitPrice = (prod: UniformProduct, qty: number): number => {
    if (!prod.priceTiers || prod.priceTiers.length === 0) return prod.basePrice;
    const sorted = [...prod.priceTiers].sort((a, b) => b.minQuantity - a.minQuantity);
    const matched = sorted.find(t => qty >= t.minQuantity);
    return matched ? matched.pricePerUnit : prod.basePrice;
  };

  const simUnitPrice = activeCalcProd ? getSimulatedUnitPrice(activeCalcProd, calcQuantity) : 0;
  const simEmbroideryCost = 
    calcEmbroidery === 'ninguno' ? 0 : 
    calcEmbroidery === 'bordado_pecho' ? config.embroideryPricing.bordado_pecho :
    calcEmbroidery === 'bordado_espalda' ? config.embroideryPricing.bordado_espalda :
    calcEmbroidery === 'estampado_reflectivo' ? config.embroideryPricing.estampado_reflectivo :
    config.embroideryPricing.logo_doble;

  const simUnitTotal = simUnitPrice + simEmbroideryCost;
  const simSubtotal = simUnitTotal * calcQuantity;
  const simIva = (simSubtotal * config.defaultTaxRate) / 100;
  const simTotal = simSubtotal + simIva;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-600" style={{ color: config.themeColors?.primaryColor }} />
              {config.customTexts?.catalogTitle || 'Catálogo Oficial de Precios & Escalas por Volumen'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {config.customTexts?.catalogSubtitle || 'Tarifas escalonadas para dotaciones corporativas, licitaciones y personalización de bordados técnicos.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Añadir Prenda al Catálogo</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Lista</span>
            </button>
            <button
              onClick={onOpenCreateOrder}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <span>Generar Pedido con Catálogo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pricing Tiers summary banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Escala Detal (1 - 11 unds)</span>
            <span className="text-slate-500">Tarifa base unitaria para reposiciones inmediatas.</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="font-bold text-amber-900 block">Escala Pyme (12 - 49 unds)</span>
            <span className="text-amber-700 font-medium">~10% a 12% de ahorro en lote.</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <span className="font-bold text-blue-900 block">Escala Mayorista (50 - 199 unds)</span>
            <span className="text-blue-700 font-medium">~18% a 22% de descuento industrial.</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="font-bold text-emerald-900 block">Corporativo / Licitación (200+ unds)</span>
            <span className="text-emerald-700 font-medium">Hasta 30% descuento directo de fábrica.</span>
          </div>
        </div>
      </div>

      {/* Simulator Calculator Strip */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-md">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
          <Calculator className="w-4 h-4" />
          <span>Simulador Rápido de Cotización por Escala</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Prenda a Cotizar</label>
            <select
              value={calcProductId}
              onChange={(e) => setCalcProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Silueta / Corte</label>
            <select
              value={calcGender}
              onChange={(e) => setCalcGender(e.target.value as GarmentGender)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
            >
              <option value="dama">👩 Dama (Femenino)</option>
              <option value="caballero">👨 Caballero (Masculino)</option>
              <option value="unisex">👥 Unisex (Estándar)</option>
              <option value="nino">👦 Niño (Infantil)</option>
              <option value="nina">👧 Niña (Infantil)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Cantidad Requerida</label>
            <input
              type="number"
              min="1"
              value={calcQuantity}
              onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Acabado / Bordado</label>
            <select
              value={calcEmbroidery}
              onChange={(e) => setCalcEmbroidery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
            >
              <option value="ninguno">Sin Bordado ($0)</option>
              <option value="bordado_pecho">Bordado Pecho (+{formatCurrency(config.embroideryPricing.bordado_pecho)})</option>
              <option value="bordado_espalda">Bordado Espalda (+{formatCurrency(config.embroideryPricing.bordado_espalda)})</option>
              <option value="estampado_reflectivo">Estampado Reflectivo (+{formatCurrency(config.embroideryPricing.estampado_reflectivo)})</option>
              <option value="logo_doble">Logo Doble (+{formatCurrency(config.embroideryPricing.logo_doble)})</option>
            </select>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <span className="text-[11px] text-slate-400">Precio Unitario Escala:</span>
            <div className="text-sm font-bold text-amber-400">
              {formatCurrency(simUnitTotal)} <span className="text-[10px] text-slate-400 font-normal">c/u + IVA</span>
            </div>
            <div className="text-xs font-semibold text-white mt-1 border-t border-slate-700 pt-1 flex justify-between">
              <span>Total ({calcQuantity} unds):</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(simTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar prenda, tela o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Gender Filter */}
          <select
            value={selectedGenderFilter}
            onChange={(e) => setSelectedGenderFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="todas">Todos los Cortes & Líneas</option>
            <option value="dama">👩 Silueta Dama</option>
            <option value="caballero">👨 Silueta Caballero</option>
            <option value="unisex">👥 Silueta Unisex</option>
            <option value="nino">👦 Infantil Niño</option>
            <option value="nina">👧 Infantil Niña</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="todas">Todas las Líneas</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Grid Cards */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Tag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No se encontraron prendas en esta búsqueda</h3>
          <p className="text-xs text-slate-500">Prueba con otra palabra clave o añade una nueva prenda al catálogo.</p>
          {isAdmin && (
            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Añadir Prenda al Catálogo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Col 1: Details & Specs (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {product.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {product.category}
                      </span>
                    </div>

                    {/* Admin Actions: Edit garment & prices, Delete */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditProduct(product)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-bold cursor-pointer transition-colors"
                          title="Editar nombre de la prenda y escalas de precios"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Editar Precios / Prenda</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-colors"
                          title="Quitar esta prenda del catálogo"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Quitar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg leading-snug">
                    {product.name}
                  </h3>

                  {/* Silhouettes / Genders Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-500">Siluetas:</span>
                    {(product.availableGenders || ['dama', 'caballero', 'unisex']).map((g) => {
                      const info = GARMENT_GENDER_INFO[g];
                      return (
                        <span
                          key={g}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${info.badge}`}
                        >
                          <span>{info.icon}</span>
                          <span>{info.shortLabel}</span>
                        </span>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-500 font-medium">Composición Textil:</span>{' '}
                      <span className="font-semibold text-slate-800">{product.fabric}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Colores Disponibles:</span>{' '}
                      <span className="text-slate-700">{product.colors.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Tallas Habilitadas:</span>{' '}
                      <span className="font-mono text-slate-800 font-bold">
                        {product.sizeStock.map(s => s.size).join(', ')}
                      </span>
                    </div>
                    {product.safetyNorms.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        <span className="text-slate-500 font-medium">Normativas:</span>
                        {product.safetyNorms.map((norm, i) => (
                          <span key={i} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-700">
                            {norm}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Col 2: Price Tiers Table (7 cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between flex-wrap gap-2">
                      <span>Escalas de Precio por Volumen de Compra:</span>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenEditProduct(product)}
                            className="text-[11px] text-amber-700 hover:text-amber-900 underline font-semibold cursor-pointer"
                          >
                            Modificar tarifas de esta prenda
                          </button>
                        )}
                        <span className="text-[11px] font-normal text-slate-400">Precios antes de IVA</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {product.priceTiers.map((tier, idx) => {
                        const discountFromBase = Math.round(((product.basePrice - tier.pricePerUnit) / product.basePrice) * 100);
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              idx === 0 
                                ? 'bg-slate-50 border-slate-200' 
                                : idx === product.priceTiers.length - 1
                                  ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200'
                                  : 'bg-amber-50/50 border-amber-200'
                            }`}
                          >
                            <span className="text-[11px] font-semibold text-slate-600 block truncate">
                              {tier.label}
                            </span>
                            <div className="text-base font-bold text-slate-900 mt-1">
                              {formatCurrency(tier.pricePerUnit)}
                            </div>
                            {discountFromBase > 0 ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full inline-block mt-1">
                                -{discountFromBase}% dcto.
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 block mt-1">Precio Detal</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional services strip */}
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Servicio de Bordado:</span> Pecho (+{formatCurrency(config.embroideryPricing.bordado_pecho)}) • Espalda (+{formatCurrency(config.embroideryPricing.bordado_espalda)})
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEditProduct(product)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-slate-600" />
                          <span>Editar Precios</span>
                        </button>
                      )}
                      <button
                        onClick={onOpenCreateOrder}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        <span>Cotizar en Pedido</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unified Product & Price Tiers Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        product={selectedProductForEdit}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProductForEdit(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

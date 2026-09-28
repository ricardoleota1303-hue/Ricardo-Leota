import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  OrderItem, 
  CustomizationDetail, 
  DeliveryInfo, 
  UniformProduct,
  Client,
  User,
  SizeStock,
  GarmentGender,
  OrderReferenceImage
} from '../../types';
import { GARMENT_GENDER_INFO } from '../../utils/formatters';
import { 
  ConfectionColorPicker, 
  ConfectionColorValue, 
  INDUSTRIAL_TEXTILE_COLORS 
} from '../Common/ConfectionColorPicker';
import { 
  X, 
  Building2, 
  MapPin, 
  UserCheck, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Package, 
  Calendar,
  Sparkles,
  FileText,
  SlidersHorizontal,
  Ruler,
  Palette,
  CheckCircle2,
  Info,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { 
    products, 
    clients, 
    users, 
    currentUser, 
    createOrder, 
    config, 
    addClient,
    isAdmin 
  } = useApp();

  // Selected client or custom
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'custom');
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    companyName: clients[0]?.name || '',
    taxId: clients[0]?.taxId || '',
    recipientName: clients[0]?.contactPerson || '',
    recipientRoleOrArea: 'Jefe de Dotaciones y EPP',
    phone: clients[0]?.phone || '',
    email: clients[0]?.email || '',
    address: clients[0]?.address || '',
    city: clients[0]?.city || '',
    branch: clients[0]?.branches[0] || 'Sede Principal',
    deliveryNotes: 'Recepción en horario de oficina de 8:00 AM a 5:00 PM.'
  });

  // Who creates the order
  const [createdByUserId, setCreatedByUserId] = useState<string>(currentUser.id);

  // Delivery date (default to 10 days in the future)
  const defaultEstDate = new Date();
  defaultEstDate.setDate(defaultEstDate.getDate() + 10);
  const [estimatedDate, setEstimatedDate] = useState<string>(defaultEstDate.toISOString().split('T')[0]);

  // Order Items
  const [items, setItems] = useState<OrderItem[]>([]);

  // Item currently being added
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedGender, setSelectedGender] = useState<GarmentGender>('unisex');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Exact color data with cuenta gotas & codes
  const [selectedColorData, setSelectedColorData] = useState<ConfectionColorValue>({
    name: 'Azul Royal / Rey',
    hex: '#1e3a8a',
    code: 'Pantone 286 C',
  });

  // Toggle for two-step letter progression (XS, M, XL, 3XL, 5XL) vs complete scale (XS to 5XL)
  const [showTwoStepLetterScale, setShowTwoStepLetterScale] = useState<boolean>(false);

  // Text detailing the product or garment requested before adding to order
  const [itemDetailedDescription, setItemDetailedDescription] = useState<string>('');

  const [quantity, setQuantity] = useState<number>(10);
  const [embroideryType, setEmbroideryType] = useState<CustomizationDetail['embroideryType']>('ninguno');
  const [embroideryText, setEmbroideryText] = useState<string>('');
  const [itemNotes, setItemNotes] = useState<string>('');

  // Discount & global order notes
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [internalNotes, setInternalNotes] = useState<string>('');

  // Reference images uploaded for the garments
  const [referenceImages, setReferenceImages] = useState<OrderReferenceImage[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false);

  // Validation errors
  const [errorMessage, setErrorMessage] = useState<string>('');

  const compressFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleUploadOrderImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessingImages(true);
    try {
      const added: OrderReferenceImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const base64 = await compressFile(file);
        added.push({
          id: `ref-img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          url: base64,
          name: file.name,
          uploadedAt: new Date().toISOString(),
          uploadedByName: currentUser.name,
          notes: 'Adjuntada durante la creación del pedido',
          fileSizeBytes: file.size,
        });
      }
      setReferenceImages(prev => [...prev, ...added]);
    } catch (err) {
      console.error('Error cargando imágenes de referencia:', err);
    } finally {
      setIsProcessingImages(false);
    }
  };

  if (!isOpen) return null;

  const currentProduct = products.find((p: UniformProduct) => p.id === selectedProductId) || products[0];

  // Dynamic sizes based on product type (botas 34-50, pantalones caballero 28-48 de 2 en 2, niños/niñas 4-16 de 2 en 2, adultos XS-5XL)
  const getDynamicSizes = (
    prod: UniformProduct | undefined, 
    gender: GarmentGender, 
    twoStepScale = false
  ): string[] => {
    if (!prod) return ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

    const prodName = prod.name.toLowerCase();
    const prodCat = prod.category.toLowerCase();

    const isFootwear = prodCat.includes('calzado') || 
      prodName.includes('bota') || 
      prodName.includes('calzado') || 
      prodName.includes('zapato');

    const isPants = prodCat.includes('pantalones') || 
      prodName.includes('pantalon') || 
      prodName.includes('pantalón') || 
      prodName.includes('jean') ||
      prodName.includes('cargo');

    // 1. BOTAS Y CALZADO: desde la talla 34 hasta la 50
    if (isFootwear) {
      return [
        '34', '35', '36', '37', '38', '39', '40',
        '41', '42', '43', '44', '45', '46', '47',
        '48', '49', '50'
      ];
    }

    // 2. LÍNEA NIÑOS Y NIÑAS: desde la talla 4 hasta las 16 de dos en dos
    if (gender === 'nino' || gender === 'nina') {
      return ['4', '6', '8', '10', '12', '14', '16'];
    }

    // 3. PANTALONES
    if (isPants) {
      // Pantalones de caballero: desde la 28 hasta las 48 de dos en dos
      if (gender === 'caballero') {
        return ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'];
      }
      // Pantalones de dama: tallas numéricas de 2 en 2 y letras
      if (gender === 'dama') {
        return ['6', '8', '10', '12', '14', '16', '18', '20', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
      }
      // Unisex
      return ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    }

    // 4. DAMA Y CABALLERO (Prendas superiores, overoles, chalecos, camisas, etc.)
    // Desde XS hasta 5XL (con opción de ver de 2 en 2: XS, M, XL, 3XL, 5XL o escala completa)
    if (twoStepScale) {
      return ['XS', 'M', 'XL', '3XL', '5XL'];
    }

    return ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  };

  const dynamicSizes = getDynamicSizes(currentProduct, selectedGender, showTwoStepLetterScale);
  const availableColors = currentProduct?.colors || [];

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p: UniformProduct) => p.id === prodId);
    if (prod) {
      let nextGender = selectedGender;
      const lower = prod.name.toLowerCase();
      if (lower.includes('blusa') || lower.includes('dama')) {
        nextGender = 'dama';
      } else if (lower.includes('caballero')) {
        nextGender = 'caballero';
      } else if (lower.includes('niño')) {
        nextGender = 'nino';
      } else if (lower.includes('niña')) {
        nextGender = 'nina';
      }
      setSelectedGender(nextGender);
      const newSizes = getDynamicSizes(prod, nextGender, showTwoStepLetterScale);
      setSelectedSize(newSizes[0] || 'M');

      // Set initial color based on product
      const firstCol = prod.colors[0];
      if (firstCol) {
        const matched = INDUSTRIAL_TEXTILE_COLORS.find(
          c => c.name.toLowerCase().includes(firstCol.toLowerCase())
        );
        setSelectedColorData({
          name: firstCol,
          hex: matched ? matched.hex : '#1e3a8a',
          code: matched ? matched.code : `Estándar ${firstCol}`,
        });
      }
    }
  };

  const handleGenderChange = (gender: GarmentGender) => {
    setSelectedGender(gender);
    const newSizes = getDynamicSizes(currentProduct, gender, showTwoStepLetterScale);
    if (!newSizes.includes(selectedSize)) {
      setSelectedSize(newSizes[0] || 'M');
    }
  };

  // When client dropdown changes
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === 'custom') {
      setDeliveryInfo({
        companyName: '',
        taxId: '',
        recipientName: '',
        recipientRoleOrArea: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        branch: 'Sede Principal',
        deliveryNotes: ''
      });
    } else {
      const c = clients.find((cl: Client) => cl.id === clientId);
      if (c) {
        setDeliveryInfo({
          companyName: c.name,
          taxId: c.taxId,
          recipientName: c.contactPerson,
          recipientRoleOrArea: 'Jefe de Almacén y Suministros',
          phone: c.phone,
          email: c.email,
          address: c.address,
          city: c.city,
          branch: c.branches[0] || 'Sede Principal',
          deliveryNotes: 'Entrega regular con remisión firmada.'
        });
      }
    }
  };

  // Calculate unit price according to tiers
  const getTierPrice = (prod: UniformProduct, qty: number): number => {
    if (!prod.priceTiers || prod.priceTiers.length === 0) return prod.basePrice;
    const sortedTiers = [...prod.priceTiers].sort((a, b) => b.minQuantity - a.minQuantity);
    const matched = sortedTiers.find(t => qty >= t.minQuantity);
    return matched ? matched.pricePerUnit : prod.basePrice;
  };

  const getEmbroideryCost = (type: CustomizationDetail['embroideryType']): number => {
    if (type === 'ninguno') return 0;
    return config.embroideryPricing[type] || 0;
  };

  // Add Item to List
  const handleAddItem = () => {
    setErrorMessage('');
    if (!currentProduct) {
      setErrorMessage('Selecciona un producto válido.');
      return;
    }

    const sizeToUse = selectedSize || dynamicSizes[0] || 'M';
    const colorLabel = `${selectedColorData.name} (${selectedColorData.hex.toUpperCase()})`;

    if (quantity <= 0) {
      setErrorMessage('La cantidad debe ser mayor a cero.');
      return;
    }

    const unitPrice = getTierPrice(currentProduct, quantity);
    const extraCost = getEmbroideryCost(embroideryType);
    const itemSubtotal = (unitPrice + extraCost) * quantity;

    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: currentProduct.id,
      productCode: currentProduct.code,
      productName: currentProduct.name,
      category: currentProduct.category,
      gender: selectedGender,
      size: sizeToUse,
      color: colorLabel,
      colorHex: selectedColorData.hex,
      colorCode: selectedColorData.code,
      detailedDescription: itemDetailedDescription.trim() || undefined,
      quantity,
      unitPrice,
      customization: {
        embroideryType,
        embroideryText: embroideryType !== 'ninguno' ? embroideryText : undefined,
        notes: itemDetailedDescription.trim() || itemNotes || undefined,
        extraCostPerUnit: extraCost,
      },
      subtotal: itemSubtotal,
    };

    setItems(prev => [...prev, newItem]);
    // Reset quick item fields
    setQuantity(10);
    setEmbroideryType('ninguno');
    setEmbroideryText('');
    setItemNotes('');
    setItemDetailedDescription('');
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Financial calculations
  const rawProductsTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const customizationTotal = items.reduce((sum, item) => sum + (item.customization.extraCostPerUnit * item.quantity), 0);
  const grossSubtotal = rawProductsTotal + customizationTotal;
  const discountAmount = (grossSubtotal * (discountPercentage || 0)) / 100;
  const netSubtotal = grossSubtotal - discountAmount;
  const taxPercentage = config.defaultTaxRate || 19;
  const taxAmount = (netSubtotal * taxPercentage) / 100;
  const grandTotal = netSubtotal + taxAmount;

  // Submit
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!deliveryInfo.companyName.trim()) {
      setErrorMessage('Ingresa el nombre de la empresa cliente o destinataria.');
      return;
    }
    if (!deliveryInfo.recipientName.trim()) {
      setErrorMessage('Ingresa el nombre de la persona que recibe en la sucursal.');
      return;
    }
    if (!deliveryInfo.address.trim() || !deliveryInfo.city.trim()) {
      setErrorMessage('Ingresa la dirección y ciudad de entrega completa.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Debes agregar al menos un uniforme o producto al pedido.');
      return;
    }

    const creatorUser = users.find((u: User) => u.id === createdByUserId) || currentUser;

    // Save client if new
    if (selectedClientId === 'custom') {
      addClient({
        name: deliveryInfo.companyName,
        taxId: deliveryInfo.taxId || 'N/A',
        industry: 'Sector Industrial & Comercial',
        contactPerson: deliveryInfo.recipientName,
        email: deliveryInfo.email || '',
        phone: deliveryInfo.phone || '',
        address: deliveryInfo.address,
        city: deliveryInfo.city,
        branches: [deliveryInfo.branch || 'Sede Principal'],
      });
    }

    const created = createOrder({
      estimatedDeliveryDate: new Date(estimatedDate).toISOString(),
      createdByUserId: creatorUser.id,
      createdByUserName: creatorUser.name,
      createdByUserEmail: creatorUser.email,
      deliveryInfo,
      items,
      subtotal: rawProductsTotal,
      customizationTotal,
      discountPercentage,
      discountAmount,
      taxPercentage,
      taxAmount,
      total: grandTotal,
      status: 'pendiente',
      internalNotes,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
    });

    if (onOrderCreated) {
      onOrderCreated(created.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Nuevo Pedido de Dotación Industrial</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Registra los datos de entrega, el vendedor responsable y la personalización de prendas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form with Scrollable Content & Sticky Action Footer */}
        <form onSubmit={handleSubmitOrder} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

          {/* Section 1: Quién hace el pedido & Fechas */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              1. Responsable del Pedido (Quién lo genera)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vendedor / Asesor Comercial Asignado
                </label>
                <select
                  id="select-creador-pedido"
                  value={createdByUserId}
                  onChange={(e) => setCreatedByUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  {users.map((u: User) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Fecha Estimada de Entrega al Cliente
                </label>
                <input
                  type="date"
                  value={estimatedDate}
                  onChange={(e) => setEstimatedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: A quién se le envían las cosas (Destinatario) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                2. Destinatario de Despacho (A quién se le envía)
              </h3>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Cliente Frecuente:</span>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  {clients.map((c: Client) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="custom">+ Registrar Nueva Empresa Cliente</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Empresa Receptora *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Constructora San Juan S.A."
                  value={deliveryInfo.companyName}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, companyName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIT o Identificación Tributaria
                </label>
                <input
                  type="text"
                  placeholder="Ej: 900.123.456-7"
                  value={deliveryInfo.taxId}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, taxId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Persona que Recibe (Contacto en Planta) *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ing. Pedro Morales (Jefe Bodega)"
                  value={deliveryInfo.recipientName}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, recipientName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej: +57 310 987 6543"
                  value={deliveryInfo.phone}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección Exacta de Entrega *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Calle 15 # 45-20 Muelle 3"
                  value={deliveryInfo.address}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ciudad y Departamento *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Barranquilla, Atlántico"
                  value={deliveryInfo.city}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sucursal / Sede Específica
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sede Mina Norte / Obra 2"
                  value={deliveryInfo.branch}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, branch: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instrucciones de Recepción / Seguridad para el Transportador
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ingreso con cédula, casco y chaleco reflectivo. Entregar antes de las 4 PM."
                  value={deliveryInfo.deliveryNotes || ''}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, deliveryNotes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Uniformes & Ítems a Confeccionar / Despachar */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                3. Selección de Uniformes y Personalización de Bordados
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                Precios con descuento automático por escala
              </span>
            </h3>

            {/* Item builder box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prenda del Catálogo de Dotaciones
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {products.map((p: UniformProduct) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} — {p.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Confection Color with Cuenta Gotas & Exact Codes */}
              <ConfectionColorPicker
                value={selectedColorData}
                onChange={setSelectedColorData}
                availableProductColors={availableColors}
              />

              {/* GENDER / SILHOUETTE SELECTOR & SIZE SELECTOR */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Línea, Silueta y Tallas de Confección:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Selecciona silueta (Dama, Caballero, Unisex o Infantil Niño/Niña)
                  </span>
                </div>

                {/* 5-Option Gender / Line Toggle Buttons */}
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['dama', 'caballero', 'unisex', 'nino', 'nina'] as GarmentGender[]).map((genderOption) => {
                      const info = GARMENT_GENDER_INFO[genderOption];
                      const isSelected = selectedGender === genderOption;
                      return (
                        <button
                          key={genderOption}
                          type="button"
                          onClick={() => handleGenderChange(genderOption)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                            isSelected
                              ? info.activeBadge
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-lg">{info.icon}</span>
                          <span className="text-[11px] text-center leading-tight">{info.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Cut / Anatomy explanation note */}
                  <div className={`mt-2 p-2 rounded-lg text-[11px] flex items-center gap-2 border ${
                    selectedGender === 'dama'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                      : selectedGender === 'caballero'
                      ? 'bg-blue-50/70 border-blue-200 text-blue-800'
                      : selectedGender === 'nino'
                      ? 'bg-sky-50/70 border-sky-200 text-sky-800'
                      : selectedGender === 'nina'
                      ? 'bg-purple-50/70 border-purple-200 text-purple-800'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  }`}>
                    <span className="text-sm">{GARMENT_GENDER_INFO[selectedGender].icon}</span>
                    <span>
                      <strong>{GARMENT_GENDER_INFO[selectedGender].shortLabel}:</strong> {GARMENT_GENDER_INFO[selectedGender].description}
                    </span>
                  </div>
                </div>

                {/* SIZES SELECTION */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-amber-600" />
                        Talla Solicitada ({GARMENT_GENDER_INFO[selectedGender].shortLabel}):
                      </span>
                      <span className="text-[11px] text-slate-900 bg-amber-100 font-mono font-bold px-2 py-0.5 rounded border border-amber-300">
                        Talla {selectedSize || dynamicSizes[0] || 'M'}
                      </span>
                    </div>

                    {/* Scale step toggle for adult clothing */}
                    {(selectedGender === 'dama' || selectedGender === 'caballero' || selectedGender === 'unisex') && 
                     !currentProduct?.category.toLowerCase().includes('calzado') &&
                     !currentProduct?.name.toLowerCase().includes('bota') && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 font-medium">Escala letras:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = !showTwoStepLetterScale;
                            setShowTwoStepLetterScale(nextVal);
                            const newSizes = getDynamicSizes(currentProduct, selectedGender, nextVal);
                            if (!newSizes.includes(selectedSize)) {
                              setSelectedSize(newSizes[0] || 'M');
                            }
                          }}
                          className={`px-2 py-0.5 rounded font-bold border transition-colors cursor-pointer ${
                            showTwoStepLetterScale
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {showTwoStepLetterScale ? '✓ De 2 en 2 (XS a 5XL)' : 'Ver de 2 en 2'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTwoStepLetterScale(false);
                            const newSizes = getDynamicSizes(currentProduct, selectedGender, false);
                            if (!newSizes.includes(selectedSize)) {
                              setSelectedSize(newSizes[0] || 'M');
                            }
                          }}
                          className={`px-2 py-0.5 rounded font-bold border transition-colors cursor-pointer ${
                            !showTwoStepLetterScale
                              ? 'bg-slate-800 text-white border-slate-900'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          Todas (XS a 5XL)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick-click size pills */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {dynamicSizes.map((sz) => {
                      const isChosen = (selectedSize || dynamicSizes[0]) === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            isChosen
                              ? selectedGender === 'dama'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : selectedGender === 'caballero'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : selectedGender === 'nino'
                                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                : selectedGender === 'nina'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>

                  {/* Context Helper info based on garment type */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Info className="w-3 h-3 text-slate-400 shrink-0" />
                    {selectedGender === 'nino' || selectedGender === 'nina' ? (
                      <span>Tallas infantiles de dos en dos desde la <strong>talla 4 hasta la 16</strong>.</span>
                    ) : (currentProduct?.category.toLowerCase().includes('calzado') || currentProduct?.name.toLowerCase().includes('bota')) ? (
                      <span>Tallas de calzado y botas de seguridad desde la <strong>talla 34 hasta la 50</strong>.</span>
                    ) : (currentProduct?.category.toLowerCase().includes('pantalones') || currentProduct?.name.toLowerCase().includes('pantalon')) && selectedGender === 'caballero' ? (
                      <span>Tallas de pantalón de caballero de dos en dos desde la <strong>28 hasta la 48</strong>.</span>
                    ) : (
                      <span>Tallas de confección disponibles desde <strong>XS hasta 5XL</strong>.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* TEXT DETAILING THE PRODUCT / PRENDA PEDIDA BEFORE ORDERING */}
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-700" />
                    Detalle & Especificaciones de la Prenda Solicitada:
                  </label>
                  <span className="text-[11px] text-amber-800 font-medium">
                    Describe requerimientos técnicos antes de ordenar
                  </span>
                </div>

                <textarea
                  rows={2}
                  value={itemDetailedDescription}
                  onChange={(e) => setItemDetailedDescription(e.target.value)}
                  placeholder="Ej: Confeccionar con tela Dril Vulcano 100% algodón 280g/m², incluir 2 bolsillos tipo cargo con velcro en laterales, cintas reflectivas 3M de 2 pulgadas en brazos/piernas y costura reforzada en tiro..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
                />

                {/* Quick chip tag inserters */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-amber-800 font-semibold">Insertar detalle rápido:</span>
                  {[
                    '+ Cintas reflectivas 2"',
                    '+ Bolsillos tipo cargo con velcro',
                    '+ Refuerzo en rodilleras y coderas',
                    '+ Cuello camisero reforzado',
                    '+ Costura doble cadeneta industrial',
                    '+ Tela antifluido de alta resistencia'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const cleanTag = tag.replace('+ ', '');
                        setItemDetailedDescription(prev => 
                          prev ? `${prev}, ${cleanTag}` : cleanTag
                        );
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Customization Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cantidad a Fabricar / Despachar
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 font-bold text-base"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Unidades a programar para confección y entrega
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bordado / Estampado
                  </label>
                  <select
                    value={embroideryType}
                    onChange={(e) => setEmbroideryType(e.target.value as CustomizationDetail['embroideryType'])}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ninguno">Sin Bordado (Prenda Lisa)</option>
                    <option value="bordado_pecho">Bordado Pecho Izquierdo</option>
                    <option value="bordado_espalda">Bordado Espalda</option>
                    <option value="estampado_reflectivo">Estampado Reflectivo de Seguridad</option>
                    <option value="logo_doble">Logo Pecho + Logo Espalda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Texto / Detalle del Bordado
                  </label>
                  <input
                    type="text"
                    disabled={embroideryType === 'ninguno'}
                    placeholder={embroideryType === 'ninguno' ? 'N/A' : 'Ej: LOGO CLIENTE + NOMBRE'}
                    value={embroideryText}
                    onChange={(e) => setEmbroideryText(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Add item button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  id="btn-agregar-prenda-pedido"
                  onClick={handleAddItem}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Prenda al Pedido</span>
                </button>
              </div>
            </div>

            {/* List of items in current order */}
            {items.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Prenda & Código</th>
                      <th className="py-2.5 px-2">Corte / Silueta</th>
                      <th className="py-2.5 px-2">Talla / Color Exacto</th>
                      <th className="py-2.5 px-2 text-center">Cant.</th>
                      <th className="py-2.5 px-3">Bordado / Acabado</th>
                      <th className="py-2.5 px-3 text-center">Estado Taller</th>
                      <th className="py-2.5 px-2 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => {
                      const itemGenderInfo = GARMENT_GENDER_INFO[it.gender || 'unisex'];
                      return (
                        <tr key={it.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{it.productName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{it.productCode}</div>
                            {it.detailedDescription && (
                              <div className="mt-1 text-[11px] text-amber-900 bg-amber-50/90 p-1.5 rounded-lg border border-amber-200 leading-tight">
                                <span className="font-bold text-amber-950">📝 Detalle: </span>
                                {it.detailedDescription}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${itemGenderInfo.badge}`}>
                              <span>{itemGenderInfo.icon}</span>
                              <span>{itemGenderInfo.shortLabel}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-slate-700">
                            <div className="font-bold text-slate-800">Talla {it.size}</div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                              {it.colorHex && (
                                <span
                                  className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs shrink-0"
                                  style={{ backgroundColor: it.colorHex }}
                                />
                              )}
                              <span className="truncate max-w-[130px]" title={it.color}>{it.color}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center font-bold text-slate-900">
                            {it.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            {it.customization.embroideryType === 'ninguno' ? (
                              <span className="text-slate-400">Sin bordado</span>
                            ) : (
                              <div>
                                <span className="font-semibold text-amber-700">
                                  {it.customization.embroideryType.replace('_', ' ')}
                                </span>
                                {it.customization.embroideryText && (
                                  <div className="text-[10px] text-slate-500 italic">"{it.customization.embroideryText}"</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                              Programado en Lote
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl">
                No hay prendas agregadas a este pedido aún. Usa el selector de arriba para añadir uniformes.
              </div>
            )}
          </div>

          {/* Section 4: Observaciones & Resumen Operativo */}
          <div className="bg-slate-900 text-white rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Especificaciones Generales del Pedido antes de Confirmar</span>
              </h4>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Texto de detalle global para confección, empaque y despacho
                </label>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ej: Orden corporativa programada para entrega por lotes. Empacar por sedes individuales, marcar con lista de colaboradores y verificar certificado de calidad NFPA 2112..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
                />
              </div>

              {/* Reference images upload during creation */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fotos / Imágenes de Referencia ({referenceImages.length}):</span>
                  </label>
                  <label
                    htmlFor="create-order-img-input"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Adjuntar Fotos</span>
                    <input
                      id="create-order-img-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleUploadOrderImages(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {isProcessingImages && (
                  <div className="text-[11px] text-amber-300 animate-pulse flex items-center gap-1.5 py-1">
                    <div className="w-2.5 h-2.5 rounded-full border border-amber-300 border-t-transparent animate-spin" />
                    <span>Cargando y optimizando imagen...</span>
                  </div>
                )}

                {referenceImages.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {referenceImages.map((img, idx) => (
                      <div key={img.id || idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                        <img src={img.url} alt={img.name} className="w-12 h-12 object-cover" />
                        <button
                          type="button"
                          onClick={() => setReferenceImages(prev => prev.filter(i => i.id !== img.id))}
                          className="absolute inset-0 bg-red-900/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic">
                    Opcional: puedes adjuntar fotos de muestras ahora o más tarde al ver el pedido.
                  </div>
                )}
              </div>
            </div>

            {/* Operational summary */}
            <div className="space-y-2 text-xs border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 flex flex-col justify-center">
              <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80 text-center space-y-2">
                <div className="text-slate-400 text-xs font-medium">Volumen Total del Pedido:</div>
                <div className="text-3xl font-black text-amber-400">
                  {items.reduce((acc, it) => acc + it.quantity, 0)} prendas
                </div>
                <div className="text-[11px] text-slate-400">
                  Control de producción y confección técnica de dotación industrial.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {items.length} prenda(s) agregada(s)
              </span>
              <button
                type="submit"
                id="btn-confirmar-crear-pedido"
                disabled={items.length === 0}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar & Crear Pedido</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

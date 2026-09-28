import React from 'react';
import { Order, OrderStatus, OrderReferenceImage } from '../../types';
import { formatDate, formatDateOnly, ORDER_STATUS_INFO, GARMENT_GENDER_INFO } from '../../utils/formatters';
import { Logo } from '../Logo';
import { useApp } from '../../context/AppContext';
import { OrderReferenceImagesGallery } from './OrderReferenceImagesGallery';
import { QuickGarmentUploadModal } from './QuickGarmentUploadModal';
import { 
  X, 
  Printer, 
  MapPin, 
  UserCheck, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Image as ImageIcon,
  Camera,
  Upload
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenAdvanceStatus: (order: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onOpenAdvanceStatus,
}) => {
  const { config, orders, updateOrder, currentUser, canEdit } = useApp();
  const [isQuickUploadOpen, setIsQuickUploadOpen] = React.useState<boolean>(false);
  const [targetGarmentItemId, setTargetGarmentItemId] = React.useState<string>('general');

  if (!order) return null;

  // Keep synced with state in AppContext
  const currentOrder = orders.find(o => o.id === order.id) || order;

  const statusConfig = ORDER_STATUS_INFO[currentOrder.status];
  const totalUnits = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenQuickUpload = (garmentItemId: string = 'general') => {
    setTargetGarmentItemId(garmentItemId);
    setIsQuickUploadOpen(true);
  };

  const handleSaveReferenceImages = (newImages: OrderReferenceImage[]) => {
    const updatedOrder: Order = {
      ...currentOrder,
      referenceImages: [...(currentOrder.referenceImages || []), ...newImages],
    };
    updateOrder(updatedOrder);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Topbar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 text-white gap-2.5 print:hidden">
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <div className="flex items-center space-x-2.5">
              <span className="font-mono font-bold text-base sm:text-lg text-amber-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                {currentOrder.orderNumber}
              </span>
              <div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                  {statusConfig.label}
                </span>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                  {formatDateOnly(currentOrder.createdAt)}
                </p>
              </div>
            </div>

            {/* Mobile close button on top right */}
            <button
              onClick={onClose}
              className="sm:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => handleOpenQuickUpload('general')}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors shadow-xs"
              title="Subir fotos o muestras de referencia de las prendas para taller"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Subir Fotos ({currentOrder.referenceImages?.length || 0})</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Remisión</span>
            </button>
            <button
              onClick={onClose}
              className="hidden sm:block text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible">
          
          {/* Printable Header (Visible during printing or screen) */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-3.5">
                <div className="bg-white border border-slate-200 p-2 rounded-xl shadow-xs shrink-0 flex items-center justify-center">
                  <Logo className="h-12 w-auto max-h-16" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                      {config.customTexts?.deliveryNoteTitle || 'Remisión de Dotación & Orden de Despacho'}
                    </h1>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 text-amber-400">
                      {config.customTexts?.companyShortName || 'JF12'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">
                    {config.companyName} • {config.customTexts?.deliveryNoteSubtitle || 'Documento Oficial de Confección, Entrega y Trazabilidad'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {config.companyTaxId} • {config.companyAddress}, {config.companyCity} • Tel: {config.companyPhone}
                  </p>
                  {config.customTexts?.deliveryNoteHeaderNote && (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      {config.customTexts.deliveryNoteHeaderNote}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right text-xs shrink-0">
                <div className="font-mono font-bold text-base text-slate-900">{currentOrder.orderNumber}</div>
                <div className="text-slate-500">Fecha Estimada: {formatDateOnly(currentOrder.estimatedDeliveryDate)}</div>
                <div className="text-[11px] text-slate-400 font-mono">Emisión: {formatDate(currentOrder.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* 2-Column Info Grid: Destinatario (A quién se le envía) vs Emisor (Quién hace el pedido) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* DESTINATARIO */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Destinatario (A quién se le envía)</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 text-sm">{currentOrder.deliveryInfo.companyName}</div>
                <div className="text-slate-500 font-mono">NIT: {currentOrder.deliveryInfo.taxId}</div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-800">Receptor:</span> {currentOrder.deliveryInfo.recipientName} ({currentOrder.deliveryInfo.recipientRoleOrArea})
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-800">Sucursal/Sede:</span> {currentOrder.deliveryInfo.branch}
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-800">Dirección:</span> {currentOrder.deliveryInfo.address}, {currentOrder.deliveryInfo.city}
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-800">Teléfono:</span> {currentOrder.deliveryInfo.phone}
                </div>
                {currentOrder.deliveryInfo.deliveryNotes && (
                  <div className="mt-2 p-2 bg-amber-50/80 rounded border border-amber-200/60 text-[11px] text-amber-900">
                    <strong>Instrucciones de entrega:</strong> {currentOrder.deliveryInfo.deliveryNotes}
                  </div>
                )}
              </div>
            </div>

            {/* QUIÉN HACE EL PEDIDO & LOGÍSTICA */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Responsable del Pedido (Quién lo generó)</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900">{currentOrder.createdByUserName}</div>
                <div className="text-slate-500">{currentOrder.createdByUserEmail}</div>
                <div className="text-slate-500 text-[11px]">Asesor Comercial Asignado a la Cuenta</div>
              </div>

              {/* Carrier & Tracking */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>Información de Envío</span>
                </div>
                {currentOrder.carrierName ? (
                  <div className="bg-sky-50 p-2 rounded border border-sky-200 text-xs">
                    <div className="font-semibold text-sky-950">{currentOrder.carrierName}</div>
                    <div className="text-sky-800 font-mono text-[11px]">Guía No: {currentOrder.trackingNumber}</div>
                    {currentOrder.actualDeliveryDate && (
                      <div className="text-emerald-700 font-medium text-[11px] mt-0.5">
                        Entregado el: {formatDate(currentOrder.actualDeliveryDate)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">
                    Sin guía asignada aún (en confección o alistamiento interno).
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Garments Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap justify-between items-center text-xs font-bold text-slate-800 gap-2">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Detalle de Uniformes y Dotaciones ({totalUnits} unidades)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenQuickUpload('general')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>+ Adjuntar Foto de Prenda</span>
                </button>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                  Control Operativo & Logístico
                </span>
              </div>
            </div>

            {/* Mobile Garments List (Visible on phones & small tablets) */}
            <div className="md:hidden divide-y divide-slate-200">
              {currentOrder.items.map((item) => {
                const genderInfo = GARMENT_GENDER_INFO[item.gender || 'unisex'] || GARMENT_GENDER_INFO.unisex;
                const garmentImages = (currentOrder.referenceImages || []).filter(img => img.garmentItemId === item.id);

                return (
                  <div key={item.id} className="p-4 space-y-3 bg-white">
                    {/* Header: Product Name + Qty */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-slate-900 leading-snug">{item.productName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.productCode} • {item.category}</div>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 font-extrabold text-xs font-mono shadow-2xs">
                        {item.quantity} unds
                      </span>
                    </div>

                    {/* Silueta, Talla y Color */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${genderInfo.badge}`}>
                        <span>{genderInfo.icon}</span>
                        <span>{genderInfo.shortLabel}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                        Talla {item.size}
                      </span>

                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px]">
                        {item.colorHex && (
                          <span
                            className="w-3 h-3 rounded-full border border-slate-300 shadow-2xs shrink-0"
                            style={{ backgroundColor: item.colorHex }}
                          />
                        )}
                        <span>{item.color}</span>
                      </span>
                    </div>

                    {/* Personalización / Bordado */}
                    {item.customization.embroideryType !== 'ninguno' ? (
                      <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                        <span className="font-bold">Bordado: </span>
                        <span>{item.customization.embroideryType.replace('_', ' ')}</span>
                        {item.customization.embroideryText && (
                          <div className="italic text-[11px] text-amber-900 mt-0.5">
                            "{item.customization.embroideryText}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Sin personalización / Sin bordado
                      </div>
                    )}

                    {/* Especificaciones de confección */}
                    {item.detailedDescription && (
                      <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900">📝 Especificaciones: </span>
                        {item.detailedDescription}
                      </div>
                    )}

                    {/* Muestras y Fotos de Referencia Section */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-amber-600" />
                          <span>Muestras de Referencia ({garmentImages.length})</span>
                        </span>
                        {garmentImages.length > 0 && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                            {garmentImages.length} foto(s) adjunta(s)
                          </span>
                        )}
                      </div>

                      {garmentImages.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          {garmentImages.map((gImg) => (
                            <a
                              key={gImg.id}
                              href="#seccion-fotos-referencia"
                              className="block relative w-12 h-12 rounded-lg overflow-hidden border border-amber-300 bg-slate-100 shadow-2xs hover:scale-105 transition-transform"
                            >
                              <img src={gImg.url} alt={gImg.name} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenQuickUpload(item.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Camera className="w-4 h-4 text-amber-700" />
                        <span>{garmentImages.length > 0 ? '+ Agregar Otra Foto para esta Prenda' : '📷 + Subir Foto de Muestra de esta Prenda'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Visible on tablets and desktops) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Código & Prenda</th>
                    <th className="py-2.5 px-2">Corte / Silueta</th>
                    <th className="py-2.5 px-2">Talla / Color</th>
                    <th className="py-2.5 px-2 text-center">Cant.</th>
                    <th className="py-2.5 px-3">Personalización / Bordado</th>
                    <th className="py-2.5 px-3">Muestras & Ref. Prenda</th>
                    <th className="py-2.5 px-3 text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentOrder.items.map((item) => {
                    const genderInfo = GARMENT_GENDER_INFO[item.gender || 'unisex'] || GARMENT_GENDER_INFO.unisex;
                    const garmentImages = (currentOrder.referenceImages || []).filter(img => img.garmentItemId === item.id);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{item.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.productCode} • {item.category}</div>
                          {item.detailedDescription && (
                            <div className="mt-1 text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 leading-tight">
                              <span className="font-bold text-amber-950">📝 Especificaciones de Confección: </span>
                              {item.detailedDescription}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${genderInfo.badge}`}>
                            <span>{genderInfo.icon}</span>
                            <span>{genderInfo.shortLabel}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-700">
                          <span className="font-semibold text-slate-900">Talla {item.size}</span>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                            {item.colorHex && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                                style={{ backgroundColor: item.colorHex }}
                              />
                            )}
                            <span>{item.color}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 text-[11px]">
                          {item.customization.embroideryType === 'ninguno' ? (
                            <span className="text-slate-400">Sin bordado</span>
                          ) : (
                            <div>
                              <span className="font-semibold text-amber-800">
                                {item.customization.embroideryType.replace('_', ' ')}
                              </span>
                              {item.customization.embroideryText && (
                                <div className="text-slate-600 italic text-[10px]">
                                  "{item.customization.embroideryText}"
                                </div>
                              )}
                              {item.customization.notes && !item.detailedDescription && (
                                <div className="text-[10px] text-slate-400">{item.customization.notes}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="space-y-1.5">
                            {garmentImages.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1">
                                {garmentImages.map((gImg) => (
                                  <a
                                    key={gImg.id}
                                    href="#seccion-fotos-referencia"
                                    className="block relative group w-8 h-8 rounded-lg overflow-hidden border border-amber-300 bg-slate-100 shadow-2xs hover:scale-105 transition-transform"
                                    title={`Ver foto: ${gImg.notes || gImg.name}`}
                                  >
                                    <img
                                      src={gImg.url}
                                      alt={gImg.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                ))}
                                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded font-mono">
                                  {garmentImages.length}
                                </span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenQuickUpload(item.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                              title={`Subir foto de referencia para ${item.productName}`}
                            >
                              <Camera className="w-3 h-3 text-amber-700" />
                              <span>{garmentImages.length > 0 ? '+ Otra foto' : '+ Subir muestra'}</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            Lote Conforme
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Operational Summary */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Total de Dotación a Entregar: <strong className="text-slate-950 font-bold text-sm">{totalUnits} prendas</strong></span>
              </div>
              <div className="text-[11px] text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Remisión oficial de confección, transporte y entrega a satisfacción.
              </div>
            </div>
          </div>

          {/* Especificaciones Generales de Confección y Taller */}
          {currentOrder.internalNotes && (
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1.5">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <span className="text-base">📋</span>
                <span>Especificaciones Generales de Confección, Empaque & Despacho:</span>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-lg border border-amber-100">
                {currentOrder.internalNotes}
              </p>
            </div>
          )}

          {/* Galería & Subida de Imágenes de Referencia de la Prenda */}
          <OrderReferenceImagesGallery
            order={currentOrder}
            onUpdateOrder={updateOrder}
            canEdit={true}
            currentUserName={currentUser.name}
            onOpenQuickUpload={handleOpenQuickUpload}
          />

          {/* Timeline of Events (Tracking History) */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Línea de Tiempo & Trazabilidad de Producción / Entrega
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {currentOrder.events.map((evt, idx) => {
                const isLast = idx === currentOrder.events.length - 1;
                const stConf = ORDER_STATUS_INFO[evt.status];

                return (
                  <div key={evt.id || idx} className="relative">
                    {/* Circle Dot */}
                    <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      isLast ? 'border-amber-500 bg-amber-500' : 'border-slate-400'
                    }`}>
                      {isLast && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[11px] border ${stConf.bg} ${stConf.color} ${stConf.border}`}>
                          {stConf.label}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {formatDate(evt.timestamp)}
                        </span>
                        <span className="text-slate-600 font-medium">
                          por {evt.updatedByUserName} ({evt.updatedByUserRole})
                        </span>
                      </div>
                      <p className="text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {evt.comment}
                      </p>
                      {evt.trackingNumber && (
                        <div className="mt-1 text-[11px] text-sky-700 font-medium">
                          Transportadora: {evt.carrierName} | Guía: {evt.trackingNumber}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Printable Delivery Terms */}
          {config.customTexts?.deliveryNoteTerms && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">Términos, Garantía & Condiciones de Entrega: </span>
              {config.customTexts.deliveryNoteTerms}
            </div>
          )}

          {/* Printable Signature Footers */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t border-slate-400 pt-2.5">
              <p className="font-bold text-slate-900">
                {config.customTexts?.deliverySignatureCompany || `Entregado por: ${config.companyName}`}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">Despachos, Logística & Control de Calidad</p>
            </div>
            <div className="border-t border-slate-400 pt-2.5">
              <p className="font-bold text-slate-900">
                {config.customTexts?.deliverySignatureClient || 'Recibido a Conformidad por el Cliente'}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">Nombre, Cédula y Sello de Almacén</p>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>

          {currentOrder.status !== 'entregado' && currentOrder.status !== 'cancelado' && (
            <button
              onClick={() => onOpenAdvanceStatus(currentOrder)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors shadow-sm"
            >
              <span>Avanzar Estado del Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Garment Reference Upload Modal */}
      <QuickGarmentUploadModal
        isOpen={isQuickUploadOpen}
        onClose={() => setIsQuickUploadOpen(false)}
        order={currentOrder}
        initialGarmentItemId={targetGarmentItemId}
        onSaveImages={handleSaveReferenceImages}
        currentUserName={currentUser.name}
      />
    </div>
  );
};

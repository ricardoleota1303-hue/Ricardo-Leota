import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { formatDate, formatDateOnly, ORDER_STATUS_INFO } from '../../utils/formatters';
import { 
  Search, 
  Truck, 
  MapPin, 
  UserCheck, 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Printer,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface OrderTrackerViewProps {
  onOpenAdvanceStatus: (order: Order) => void;
  onOpenCreateOrder: () => void;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({
  onOpenAdvanceStatus,
  onOpenCreateOrder,
}) => {
  const { orders, config } = useApp();
  const [searchQuery, setSearchQuery] = useState(orders[0]?.orderNumber || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);

  useEffect(() => {
    if (!selectedOrder && orders.length > 0) {
      setSelectedOrder(orders[0]);
      setSearchQuery(orders[0].orderNumber);
    } else if (orders.length === 0) {
      setSelectedOrder(null);
      setSearchQuery('');
    }
  }, [orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = orders.find(o => 
      o.orderNumber.toLowerCase() === query ||
      (o.trackingNumber && o.trackingNumber.toLowerCase() === query) ||
      o.deliveryInfo.companyName.toLowerCase().includes(query) ||
      o.deliveryInfo.taxId.toLowerCase().includes(query)
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      alert(`No se encontró ningún pedido con el identificador "${searchQuery}". Revisa el número de pedido o guía.`);
    }
  };

  const stepsList: { status: OrderStatus; label: string; short: string }[] = [
    { status: 'pendiente', label: '1. Recibido', short: 'Recibido' },
    { status: 'en_confeccion', label: '2. Confección', short: 'Corte/Confección' },
    { status: 'en_bordado', label: '3. Bordado', short: 'Bordado/Logo' },
    { status: 'control_calidad', label: '4. Calidad', short: 'C. Calidad' },
    { status: 'listo_despacho', label: '5. Empacado', short: 'Listo Despacho' },
    { status: 'en_ruta', label: '6. En Ruta', short: 'En Transporte' },
    { status: 'entregado', label: '7. Entregado', short: 'Entregado' },
  ];

  const currentStepNumber = selectedOrder ? ORDER_STATUS_INFO[selectedOrder.status].step : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="max-w-3xl mx-auto text-center space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[11px] sm:text-xs font-semibold border border-white/20">
            <Truck className="w-3.5 h-3.5" style={{ color: config.themeColors?.accentColor }} />
            <span>Módulo de Trazabilidad & Guías en Tiempo Real</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {config.customTexts?.trackingTitle || 'Rastreo de Dotaciones & Pedidos Industriales'}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-300 max-w-xl mx-auto">
            {config.customTexts?.trackingSubtitle || 'Consulta el estado de corte, bordado, despacho y entrega de uniformes con el número de pedido o número de guía de transporte.'}
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto pt-1 sm:pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ej: PED-2026-0041, guía TCC o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: config.themeColors?.primaryColor || '#f59e0b',
                color: config.themeColors?.primaryTextColor || '#020617'
              }}
              className="px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-opacity hover:opacity-90 cursor-pointer shadow-sm shrink-0"
            >
              Rastrear
            </button>
          </form>

          {/* Quick select pills */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-2 text-[11px]">
            {orders.length > 0 ? (
              <>
                <span className="text-slate-400">Consultas rápidas:</span>
                {orders.slice(0, 4).map(o => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setSelectedOrder(o);
                      setSearchQuery(o.orderNumber);
                    }}
                    className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                      selectedOrder?.id === o.id
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {o.orderNumber}
                  </button>
                ))}
              </>
            ) : (
              <span className="text-slate-400 italic">No hay pedidos registrados en el sistema</span>
            )}
          </div>
        </div>
      </div>

      {/* Selected Order Detailed Tracking Card */}
      {selectedOrder ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
          
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xl font-bold text-slate-900">
                  {selectedOrder.orderNumber}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${ORDER_STATUS_INFO[selectedOrder.status].bg} ${ORDER_STATUS_INFO[selectedOrder.status].color} ${ORDER_STATUS_INFO[selectedOrder.status].border}`}>
                  {ORDER_STATUS_INFO[selectedOrder.status].label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Registrado en sistema: {formatDate(selectedOrder.createdAt)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Hoja de Ruta</span>
              </button>

              {selectedOrder.status !== 'entregado' && selectedOrder.status !== 'cancelado' && (
                <button
                  onClick={() => onOpenAdvanceStatus(selectedOrder)}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Actualizar Fase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex justify-between items-center">
              <span>Etapas del Proceso Industrial & Logístico</span>
              <span className="text-amber-700 font-semibold">{ORDER_STATUS_INFO[selectedOrder.status].description}</span>
            </div>

            {selectedOrder.status === 'cancelado' ? (
              <div className="bg-rose-100 text-rose-800 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Este pedido fue cancelado en producción y entrega.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {stepsList.map((st, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted = currentStepNumber > stepNum;
                  const isCurrent = currentStepNumber === stepNum;

                  return (
                    <div
                      key={st.status}
                      className={`p-2.5 rounded-lg border text-center transition-all flex flex-col justify-between ${
                        isCurrent 
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-xs ring-2 ring-amber-300' 
                          : isCompleted 
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-medium' 
                            : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <div className="text-[10px] font-mono uppercase">Paso {stepNum}</div>
                      <div className="text-xs font-semibold mt-1">{st.short}</div>
                      <div className="mt-2 text-[10px]">
                        {isCurrent && <span className="bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded-full text-[9px] font-bold">ACTUAL</span>}
                        {isCompleted && <span className="text-emerald-700 font-bold">✓ Completado</span>}
                        {!isCurrent && !isCompleted && <span className="text-slate-400">Pendiente</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed Info 2 Columns: Recipient & Requester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* DESTINATARIO */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-amber-800">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Información de a quién se le envían las cosas</span>
              </div>
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-400 text-[11px] block">Empresa Destinataria:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedOrder.deliveryInfo.companyName}</span>
                  <span className="text-slate-500 font-mono ml-2">NIT: {selectedOrder.deliveryInfo.taxId}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Persona que Recibe en Destino:</span>
                  <span className="font-semibold text-slate-800">{selectedOrder.deliveryInfo.recipientName}</span>
                  <span className="text-slate-500 ml-1">({selectedOrder.deliveryInfo.recipientRoleOrArea})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Sucursal / Planta de Entrega:</span>
                  <span className="font-medium text-slate-800">{selectedOrder.deliveryInfo.branch}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Dirección y Ciudad:</span>
                  <span className="text-slate-700 font-medium">
                    {selectedOrder.deliveryInfo.address}, {selectedOrder.deliveryInfo.city}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Teléfono de Contacto:</span>
                  <span className="text-slate-700">{selectedOrder.deliveryInfo.phone}</span>
                </div>
                {selectedOrder.deliveryInfo.deliveryNotes && (
                  <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px]">
                    <strong>Protocolo de Entrega en Planta:</strong> {selectedOrder.deliveryInfo.deliveryNotes}
                  </div>
                )}
              </div>
            </div>

            {/* RESPONSABLE Y LOGÍSTICA */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-emerald-800">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Información de quién hace el pedido</span>
              </div>
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-400 text-[11px] block">Asesor Comercial Responsable:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.createdByUserName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Correo del Asesor:</span>
                  <span className="text-slate-700">{selectedOrder.createdByUserEmail}</span>
                </div>
              </div>

              {/* Guía y transportadora */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1 font-bold text-sky-800 uppercase tracking-wider text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-sky-600" />
                  <span>Datos de la Transportadora</span>
                </div>
                {selectedOrder.carrierName ? (
                  <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sky-950">{selectedOrder.carrierName}</span>
                      <span className="font-mono text-xs font-bold bg-sky-200 text-sky-900 px-2 py-0.5 rounded">
                        {selectedOrder.trackingNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-700">
                      Fecha estimada de arribo: {formatDateOnly(selectedOrder.estimatedDeliveryDate)}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Prendas en planta de confección. Aún no entregadas a transportadora.</p>
                )}
              </div>
            </div>
          </div>

          {/* Garments Table (Operational View - No Garment Prices Shown) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Prendas en Producción / Envío</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-600">
                  Total: <strong className="text-slate-900">{selectedOrder.items.reduce((s, i) => s + i.quantity, 0)}</strong> unidades
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                  Trazabilidad Operativa (Sin Precios)
                </span>
              </div>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Código & Prenda</th>
                  <th className="py-2.5 px-2">Talla / Color</th>
                  <th className="py-2.5 px-2 text-center">Cant.</th>
                  <th className="py-2.5 px-3">Bordado / Personalización</th>
                  <th className="py-2.5 px-3 text-right">Fase Operativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedOrder.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.productName}
                      <span className="block text-[10px] text-slate-400 font-mono">{item.productCode} • {item.category}</span>
                    </td>
                    <td className="py-2.5 px-2 text-slate-700">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                          item.gender === 'dama'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.gender === 'caballero'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.gender === 'dama' ? '👩 Dama' : item.gender === 'caballero' ? '👨 Caballero' : '👥 Unisex'}
                        </span>
                        <span className="font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                          Talla {item.size}
                        </span>
                        <span className="text-slate-600 text-[11px]">{item.color}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full text-xs">
                        {item.quantity} unds
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {item.customization.embroideryType === 'ninguno' ? (
                        <span className="text-slate-400 italic">Sin bordado</span>
                      ) : (
                        <div>
                          <span className="font-semibold text-amber-900">
                            {item.customization.embroideryType.replace('_', ' ')}
                          </span>
                          {item.customization.embroideryText && (
                            <span className="block text-[10px] text-slate-500 font-normal italic">
                              "{item.customization.embroideryText}"
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${ORDER_STATUS_INFO[selectedOrder.status].bg} ${ORDER_STATUS_INFO[selectedOrder.status].color} ${ORDER_STATUS_INFO[selectedOrder.status].border}`}>
                        {ORDER_STATUS_INFO[selectedOrder.status].label.split('/')[0].trim()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Audit Trail Timeline */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Historial Detallado de Eventos (Bitácora de Trazabilidad)</span>
            </h3>

            <div className="space-y-3 text-xs">
              {selectedOrder.events.map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex flex-wrap justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-800">
                      {ORDER_STATUS_INFO[evt.status].label}
                    </span>
                    <span className="text-slate-400 font-mono">{formatDate(evt.timestamp)}</span>
                  </div>
                  <p className="text-slate-700">{evt.comment}</p>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Actualizado por: {evt.updatedByUserName} ({evt.updatedByUserRole})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl text-center border border-dashed border-slate-300 space-y-3">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">
            {orders.length === 0 ? 'Sin pedidos para rastrear' : 'Pedido no seleccionado'}
          </h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            {orders.length === 0
              ? 'Todos los pedidos han sido eliminados. Comienza registrando el Pedido #1 para activar el seguimiento de producción y entrega.'
              : 'Ingresa un número de pedido o selecciona uno de la lista superior.'}
          </p>
          {orders.length === 0 && onOpenCreateOrder && (
            <button
              onClick={onOpenCreateOrder}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <span>+ Crear Pedido #1</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

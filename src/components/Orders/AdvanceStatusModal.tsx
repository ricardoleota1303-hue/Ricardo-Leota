import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { ORDER_STATUS_INFO } from '../../utils/formatters';
import { X, CheckCircle2, Truck, AlertTriangle, ArrowRight, Package } from 'lucide-react';

interface AdvanceStatusModalProps {
  order: Order | null;
  onClose: () => void;
}

export const AdvanceStatusModal: React.FC<AdvanceStatusModalProps> = ({
  order,
  onClose,
}) => {
  const { updateOrderStatus, cancelOrder } = useApp();

  if (!order) return null;

  const currentInfo = ORDER_STATUS_INFO[order.status];

  // Default next status suggestion
  const getNextSuggestedStatus = (current: OrderStatus): OrderStatus => {
    switch (current) {
      case 'pendiente': return 'en_confeccion';
      case 'en_confeccion': return 'en_bordado';
      case 'en_bordado': return 'control_calidad';
      case 'control_calidad': return 'listo_despacho';
      case 'listo_despacho': return 'en_ruta';
      case 'en_ruta': return 'entregado';
      default: return current;
    }
  };

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(getNextSuggestedStatus(order.status));
  const [comment, setComment] = useState<string>('');
  const [carrierName, setCarrierName] = useState<string>(order.carrierName || 'TCC Carga Especial');
  const [trackingNumber, setTrackingNumber] = useState<string>(order.trackingNumber || `GUIA-${Math.floor(1000000 + Math.random() * 9000000)}`);
  const [cancelReason, setCancelReason] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStatus === 'cancelado') {
      cancelOrder(order.id, cancelReason || 'Cancelado por usuario autorizado.');
    } else {
      updateOrderStatus(
        order.id,
        selectedStatus,
        comment || `Estado actualizado a ${ORDER_STATUS_INFO[selectedStatus].label}`,
        selectedStatus === 'en_ruta' || selectedStatus === 'entregado' ? carrierName : undefined,
        selectedStatus === 'en_ruta' || selectedStatus === 'entregado' ? trackingNumber : undefined
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-amber-400" />
              Actualizar Fase de Producción / Entrega
            </h3>
            <p className="text-xs text-slate-400">
              Pedido: <strong className="text-amber-300">{order.orderNumber}</strong> • {order.deliveryInfo.companyName}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Garments Summary for Operational Reference (No Prices Shown) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-600" />
                <span>Prendas en este Lote ({order.items.reduce((s, i) => s + i.quantity, 0)} unidades):</span>
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                Control Operativo (Sin Precios)
              </span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {order.items.map((item) => (
                <div key={item.id} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{item.productName}</div>
                    <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                        item.gender === 'dama'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.gender === 'caballero'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {item.gender === 'dama' ? '👩 Dama' : item.gender === 'caballero' ? '👨 Caballero' : '👥 Unisex'}
                      </span>
                      <span>• Talla <strong className="text-slate-800">{item.size}</strong> • Color: <strong className="text-slate-800">{item.color}</strong></span>
                      {item.customization.embroideryType !== 'ninguno' && (
                        <span className="text-amber-800 font-medium ml-1">
                          • Bordado: {item.customization.embroideryType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded text-xs shrink-0 ml-2">
                    {item.quantity} unds
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Estado Actual:</span>
            <div className={`mt-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${currentInfo.bg} ${currentInfo.color} ${currentInfo.border}`}>
              {currentInfo.label}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nuevo Estado / Fase del Pedido
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white font-medium focus:ring-2 focus:ring-amber-500"
            >
              <option value="pendiente">Pendiente / Recibido</option>
              <option value="en_confeccion">En Confección y Corte de Tela</option>
              <option value="en_bordado">En Bordado y Aplicación de Logos</option>
              <option value="control_calidad">En Control de Calidad e Inspección</option>
              <option value="listo_despacho">Listo para Despacho / Empacado</option>
              <option value="en_ruta">En Ruta / Despachado con Transportadora</option>
              <option value="entregado">Entregado a Conformidad en Destino</option>
              <option value="cancelado">Anular / Cancelar Pedido</option>
            </select>
          </div>

          {/* If In route or delivered, show logistics inputs */}
          {(selectedStatus === 'en_ruta' || selectedStatus === 'entregado') && (
            <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-sky-900">
                <Truck className="w-4 h-4 text-sky-700" />
                <span>Datos de la Transportadora y Guía</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sky-950 font-semibold mb-1 text-[11px]">
                    Empresa Transportadora
                  </label>
                  <select
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-sky-300 bg-white text-slate-800 text-xs"
                  >
                    <option value="TCC Carga Especial">TCC Carga Especial</option>
                    <option value="Coordinadora Mercantil">Coordinadora Mercantil</option>
                    <option value="Servientrega Industrial">Servientrega Industrial</option>
                    <option value="Envía Colvanes">Envía Colvanes</option>
                    <option value="Flota Propia InduTextil">Flota Propia InduTextil</option>
                    <option value="Entrega Directa en Planta">Entrega Directa en Planta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sky-950 font-semibold mb-1 text-[11px]">
                    Número de Guía / Remesa
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ej: TCC-998822"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-sky-300 bg-white text-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cancellation reason */}
          {selectedStatus === 'cancelado' && (
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Motivo de Cancelación del Pedido</span>
              </div>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Indica la razón por la cual se anula la orden..."
                className="w-full p-2 border border-rose-300 rounded-lg text-xs"
                required
              />
            </div>
          )}

          {/* Comment */}
          {selectedStatus !== 'cancelado' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Nota Técnica / Bitácora de Producción
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ej: Lote cortado según medidas. Pasa a bordado de logos en pecho y espalda."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer transition-colors shadow-sm"
            >
              Registrar Actualización
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderItem, OrderStatus } from '../../types';
import { formatDate, formatDateOnly, ORDER_STATUS_INFO } from '../../utils/formatters';
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  UserCheck, 
  Truck, 
  ArrowRight, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  Plus,
  Package
} from 'lucide-react';

interface OrdersListProps {
  onOpenCreateOrder: () => void;
  onSelectOrder: (order: Order) => void;
  onOpenAdvanceStatus: (order: Order) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  onOpenCreateOrder,
  onSelectOrder,
  onOpenAdvanceStatus,
}) => {
  const { orders, currentUser, isAdmin, isProduction, isDispatch, config } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Filter orders
  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryInfo.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryInfo.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryInfo.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.createdByUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate order stats
  const totalOrders = orders.length;
  const inProductionCount = orders.filter((o: Order) => ['en_confeccion', 'en_bordado', 'control_calidad'].includes(o.status)).length;
  const inRouteCount = orders.filter((o: Order) => o.status === 'en_ruta' || o.status === 'listo_despacho').length;
  const deliveredCount = orders.filter((o: Order) => o.status === 'entregado').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" style={{ color: config.themeColors?.primaryColor }} />
              {config.customTexts?.ordersTitle || 'Gestión de Pedidos & Despachos Industriales'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {config.customTexts?.ordersSubtitle || 'Control integral: quién solicita el pedido, especificaciones de dotación y destinatario final de entrega.'}
            </p>
          </div>

          <button
            id="btn-crear-nuevo-pedido-header"
            onClick={onOpenCreateOrder}
            style={{ 
              backgroundColor: config.themeColors?.primaryColor || '#f59e0b',
              color: config.themeColors?.primaryTextColor || '#020617'
            }}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-opacity hover:opacity-90 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Pedido</span>
          </button>
        </div>

        {/* Quick summary cards with interactive tap-to-filter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setStatusFilter('todos')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'todos'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <span className={`text-[11px] font-semibold block ${statusFilter === 'todos' ? 'text-slate-300' : 'text-slate-500'}`}>
              Total Pedidos
            </span>
            <div className="text-xl font-extrabold mt-0.5">{totalOrders}</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('en_confeccion')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'en_confeccion'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 border-blue-200'
            }`}
          >
            <span className={`text-[11px] font-semibold block ${statusFilter === 'en_confeccion' ? 'text-blue-100' : 'text-blue-700'}`}>
              En Confección
            </span>
            <div className="text-xl font-extrabold mt-0.5">{inProductionCount}</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('en_ruta')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'en_ruta'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-sky-50/70 hover:bg-sky-100/70 text-sky-900 border-sky-200'
            }`}
          >
            <span className={`text-[11px] font-semibold block ${statusFilter === 'en_ruta' ? 'text-sky-100' : 'text-sky-700'}`}>
              En Ruta / Despacho
            </span>
            <div className="text-xl font-extrabold mt-0.5">{inRouteCount}</div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('entregado')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'entregado'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 border-emerald-200'
            }`}
          >
            <span className={`text-[11px] font-semibold block ${statusFilter === 'entregado' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Entregados
            </span>
            <div className="text-xl font-extrabold mt-0.5">{deliveredCount}</div>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-buscar-pedidos"
              type="text"
              placeholder="Buscar por # pedido, cliente, destinatario, ciudad, vendedor o guía..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-800"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="select-filtro-estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendiente / Recibido</option>
              <option value="en_confeccion">En Confección y Corte</option>
              <option value="en_bordado">En Bordado / Estampado</option>
              <option value="control_calidad">Control de Calidad</option>
              <option value="listo_despacho">Listo para Despacho</option>
              <option value="en_ruta">En Ruta / Despachado</option>
              <option value="entregado">Entregado a Conformidad</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {['todos', 'pendiente', 'en_confeccion', 'en_bordado', 'control_calidad', 'listo_despacho', 'en_ruta', 'entregado'].map((st) => {
            const isSelected = statusFilter === st;
            const label = st === 'todos' ? 'Todos' : ORDER_STATUS_INFO[st as OrderStatus]?.label.split('/')[0].trim();
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium ${
                  isSelected 
                    ? 'bg-slate-900 text-amber-300 shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">
            {orders.length === 0 ? 'Sin pedidos registrados' : 'No se encontraron pedidos'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {orders.length === 0
              ? 'Todos los pedidos previos han sido limpiados. El sistema está listo para registrar todo desde el Pedido #1.'
              : 'No hay pedidos que coincidan con la búsqueda o filtro aplicado. Intenta limpiar los filtros o crea un nuevo pedido.'}
          </p>
          <button
            onClick={onOpenCreateOrder}
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{orders.length === 0 ? 'Crear Pedido #1' : 'Crear Pedido Ahora'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: Order) => {
            const statusConfig = ORDER_STATUS_INFO[order.status];
            const totalUnits = order.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0);
            const canAdvance = isAdmin || isProduction || isDispatch;

            return (
              <div
                key={order.id}
                id={`card-pedido-${order.orderNumber}`}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header row with Order # and Status */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-base text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Registrado: {formatDateOnly(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Main details Grid: 3 columns */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Column 1: A quién se le envía (Recipient & Destination) */}
                  <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Destinatario de Entrega</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {order.deliveryInfo.companyName}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        NIT: {order.deliveryInfo.taxId}
                      </p>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="font-medium text-slate-800">
                        Receptor: <span className="font-semibold">{order.deliveryInfo.recipientName}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Sucursal: {order.deliveryInfo.branch}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {order.deliveryInfo.address}, {order.deliveryInfo.city}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Tel: {order.deliveryInfo.phone}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Quién hace el pedido & Resumen de Prendas */}
                  <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Asesor / Solicitante</span>
                    </div>
                    <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                      <div className="font-semibold text-slate-800 text-xs">
                        {order.createdByUserName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.createdByUserEmail}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
                        <span>Dotación ({totalUnits} prendas en total):</span>
                        {order.referenceImages && order.referenceImages.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => onSelectOrder(order)}
                            className="text-[10px] text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Ver fotos de referencia de la prenda en este pedido"
                          >
                            <span>📷</span>
                            <span>{order.referenceImages.length} fotos de ref</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectOrder(order)}
                            className="text-[10px] text-slate-600 hover:text-amber-900 bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Abrir pedido para adjuntar fotos de referencia de la prenda"
                          >
                            <span>📷</span>
                            <span>+ Subir ref</span>
                          </button>
                        )}
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto text-xs pr-1">
                        {order.items.map((item: OrderItem, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-slate-700 text-[11px] py-0.5 border-b border-slate-50 last:border-b-0">
                            <span className="truncate max-w-[210px]" title={`${item.productName} - Talla ${item.size} - ${item.color}`}>
                              • <strong className="text-slate-900">{item.quantity}x</strong> {item.productName}
                            </span>
                            <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 ml-1 flex items-center gap-1">
                              {item.gender === 'dama' ? (
                                <span className="text-rose-600 font-bold">👩 Dama</span>
                              ) : item.gender === 'caballero' ? (
                                <span className="text-blue-600 font-bold">👨 Caballero</span>
                              ) : item.gender === 'nino' ? (
                                <span className="text-sky-600 font-bold">👦 Niño</span>
                              ) : item.gender === 'nina' ? (
                                <span className="text-purple-600 font-bold">👧 Niña</span>
                              ) : (
                                <span className="text-emerald-700 font-bold">👥 Unisex</span>
                              )}
                              <span>• Talla {item.size}</span>
                              {item.colorHex && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0"
                                  style={{ backgroundColor: item.colorHex }}
                                  title={item.color}
                                />
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Estado de Envío, Total y Acciones */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-sky-600" />
                        <span>Logística & Guía</span>
                      </div>
                      
                      {order.carrierName ? (
                        <div className="mt-1.5 bg-sky-50 p-2.5 rounded-lg border border-sky-100 text-xs">
                          <div className="font-semibold text-sky-950 flex items-center justify-between">
                            <span>{order.carrierName}</span>
                            <span className="text-[10px] bg-sky-200/80 text-sky-900 px-1.5 py-0.5 rounded font-mono">
                              {order.trackingNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-sky-700 mt-1">
                            Entrega estimada: {formatDateOnly(order.estimatedDeliveryDate)}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1.5 text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                          En preparación interna de taller. Aún no despachado.
                        </div>
                      )}
                    </div>

                    {/* Volumen de Entrega & Action Buttons */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-baseline mb-3">
                        <span className="text-xs text-slate-500 font-medium">
                          Volumen de Entrega:
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {totalUnits} prendas
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver Trazabilidad</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectOrder(order);
                            setTimeout(() => {
                              window.print();
                            }, 300);
                          }}
                          className="inline-flex items-center justify-center space-x-1 px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors border border-slate-200"
                          title="Imprimir Nota de Entrega / Remisión Oficial con Logo"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">Remisión</span>
                        </button>

                        {canAdvance && order.status !== 'entregado' && order.status !== 'cancelado' && (
                          <button
                            onClick={() => onOpenAdvanceStatus(order)}
                            className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors"
                            title="Actualizar fase o registrar despacho"
                          >
                            <span>Avanzar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Status Progress Bar */}
                <div className="bg-slate-50 px-4 sm:px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-700">Progreso:</span>
                    <span className="text-slate-600">{statusConfig.description}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Última actualiz: {formatDate(order.events[order.events.length - 1]?.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

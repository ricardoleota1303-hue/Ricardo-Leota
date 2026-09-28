import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateOnly } from '../../utils/formatters';
import { Logo } from '../Logo';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Building2,
  FileSpreadsheet
} from 'lucide-react';

export const MonthlyReports: React.FC = () => {
  const { orders, config } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  // Available months from orders
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    months.add('2026-09'); // Default
    orders.forEach(o => {
      if (o.createdAt) {
        months.add(o.createdAt.substring(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [orders]);

  // Filter orders for selected month
  const monthOrders = useMemo(() => {
    return orders.filter(o => {
      if (!o.createdAt) return false;
      return o.createdAt.startsWith(selectedMonth) && o.status !== 'cancelado';
    });
  }, [orders, selectedMonth]);

  // Monthly Metrics
  const totalRevenue = useMemo(() => {
    return monthOrders.reduce((sum, o) => sum + o.total, 0);
  }, [monthOrders]);

  const totalGarments = useMemo(() => {
    return monthOrders.reduce((sum, o) => {
      return sum + o.items.reduce((s, i) => s + i.quantity, 0);
    }, 0);
  }, [monthOrders]);

  const averageTicket = monthOrders.length > 0 ? totalRevenue / monthOrders.length : 0;

  const deliveredCount = monthOrders.filter(o => o.status === 'entregado').length;

  // Breakdown by Garment Gender / Silhouette
  const genderBreakdown = useMemo(() => {
    let dama = 0;
    let caballero = 0;
    let unisex = 0;
    let infantil = 0;
    monthOrders.forEach(o => {
      o.items.forEach(it => {
        if (it.gender === 'dama') dama += it.quantity;
        else if (it.gender === 'caballero') caballero += it.quantity;
        else if (it.gender === 'nino' || it.gender === 'nina') infantil += it.quantity;
        else unisex += it.quantity;
      });
    });
    return { dama, caballero, unisex, infantil };
  }, [monthOrders]);

  // Chart 1: Sales by day of month
  const salesByDay = useMemo(() => {
    const map: Record<string, { day: string; ventas: number; prendas: number }> = {};
    monthOrders.forEach(o => {
      const day = o.createdAt.substring(8, 10);
      const label = `Día ${day}`;
      if (!map[label]) {
        map[label] = { day: label, ventas: 0, prendas: 0 };
      }
      map[label].ventas += o.total;
      map[label].prendas += o.items.reduce((acc, it) => acc + it.quantity, 0);
    });
    return Object.values(map).sort((a, b) => a.day.localeCompare(b.day));
  }, [monthOrders]);

  // Chart 2: Category Breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    monthOrders.forEach(o => {
      o.items.forEach(it => {
        map[it.category] = (map[it.category] || 0) + it.subtotal;
      });
    });

    const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    return Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length]
    }));
  }, [monthOrders]);

  // Top Clients this month
  const topClients = useMemo(() => {
    const map: Record<string, { companyName: string; total: number; ordersCount: number; itemsCount: number }> = {};
    monthOrders.forEach(o => {
      const name = o.deliveryInfo.companyName;
      if (!map[name]) {
        map[name] = { 
          companyName: name, 
          total: 0, 
          ordersCount: 0, 
          itemsCount: 0 
        };
      }
      map[name].total += o.total;
      map[name].ordersCount += 1;
      map[name].itemsCount += o.items.reduce((s, it) => s + it.quantity, 0);
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [monthOrders]);

  // Top Salespeople this month
  const topSalespeople = useMemo(() => {
    const map: Record<string, { name: string; email: string; total: number; count: number }> = {};
    monthOrders.forEach(o => {
      const name = o.createdByUserName;
      if (!map[name]) {
        map[name] = { name, email: o.createdByUserEmail, total: 0, count: 0 };
      }
      map[name].total += o.total;
      map[name].count += 1;
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [monthOrders]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'Numero_Pedido,Fecha,Empresa_Destino,Receptor,Ciudad,Vendedor,Prendas,Total_Facturado,Estado\n';
    const rows = monthOrders.map(o => {
      const totalUnits = o.items.reduce((s, it) => s + it.quantity, 0);
      return `"${o.orderNumber}","${formatDateOnly(o.createdAt)}","${o.deliveryInfo.companyName}","${o.deliveryInfo.recipientName}","${o.deliveryInfo.city}","${o.createdByUserName}",${totalUnits},${o.total},"${o.status}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Ventas_${selectedMonth}_${config.companyName.split(' ')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Month Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm print:border-none print:shadow-none print:p-0">
        
        {/* Printable Official Header (Visible on print) */}
        <div className="hidden print:flex items-center justify-between pb-4 border-b border-slate-300 mb-4">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-auto max-h-14" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">{config.companyName}</h2>
              <p className="text-xs text-slate-600">
                {config.companyTaxId} • {config.customTexts?.reportsTitle || 'Reporte Mensual de Facturación & Despachos'}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div className="font-bold text-slate-800">Mes: {selectedMonth}</div>
            <div>{config.companyCity}</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" style={{ color: config.themeColors?.primaryColor }} />
              {config.customTexts?.reportsTitle || 'Reportes Mensuales de Ventas & Facturación'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {config.customTexts?.reportsSubtitle || 'Indicadores de facturación, volumen de prendas, clientes corporativos y rendimiento comercial.'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Month Picker */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Mes de Análisis:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              title="Descargar datos en Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            {/* Print */}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* 4 Big Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 p-4 rounded-xl border border-amber-200">
            <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider block">
              Ventas Totales del Mes
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(totalRevenue)}
            </div>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">
              {monthOrders.length} pedidos facturados
            </span>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/60 p-4 rounded-xl border border-blue-200">
            <span className="text-xs text-blue-800 font-semibold uppercase tracking-wider block">
              Prendas Confeccionadas
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalGarments} <span className="text-sm font-normal text-slate-600">piezas</span>
            </div>
            <span className="text-[11px] text-blue-700 font-medium mt-1 block">
              Dotación entregada y en ruta
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-4 rounded-xl border border-emerald-200">
            <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block">
              Ticket Promedio
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(averageTicket)}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
              Por orden de compra
            </span>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/60 p-4 rounded-xl border border-purple-200">
            <span className="text-xs text-purple-800 font-semibold uppercase tracking-wider block">
              Efectividad de Entrega
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {monthOrders.length > 0 ? Math.round((deliveredCount / monthOrders.length) * 100) : 0}%
            </div>
            <span className="text-[11px] text-purple-700 font-medium mt-1 block">
              {deliveredCount} de {monthOrders.length} pedidos completados
            </span>
          </div>
        </div>

        {/* Silhouettes / Gender Distribution Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-amber-500" />
            <span>Distribución de Prendas por Silueta ({selectedMonth}):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-medium">
              <span>👩 Dama:</span>
              <strong className="font-bold font-mono">{genderBreakdown.dama} unds</strong>
              <span className="text-[10px] text-rose-600">({totalGarments > 0 ? Math.round((genderBreakdown.dama / totalGarments) * 100) : 0}%)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-medium">
              <span>👨 Caballero:</span>
              <strong className="font-bold font-mono">{genderBreakdown.caballero} unds</strong>
              <span className="text-[10px] text-blue-600">({totalGarments > 0 ? Math.round((genderBreakdown.caballero / totalGarments) * 100) : 0}%)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              <span>👥 Unisex:</span>
              <strong className="font-bold font-mono">{genderBreakdown.unisex} unds</strong>
              <span className="text-[10px] text-emerald-600">({totalGarments > 0 ? Math.round((genderBreakdown.unisex / totalGarments) * 100) : 0}%)</span>
            </span>

            {genderBreakdown.infantil > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                <span>👦👧 Infantil:</span>
                <strong className="font-bold font-mono">{genderBreakdown.infantil} unds</strong>
                <span className="text-[10px] text-purple-600">({totalGarments > 0 ? Math.round((genderBreakdown.infantil / totalGarments) * 100) : 0}%)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Daily Revenue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Evolución Diaria de Facturación ({selectedMonth})
            </h3>
            <span className="text-xs text-slate-400 font-mono">En COP ($)</span>
          </div>

          <div className="h-64 w-full pt-4">
            {salesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByDay} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Facturación']}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <Bar dataKey="ventas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No hay transacciones registradas en este mes.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Distribución por Línea de Uniformes
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Sin datos de categorías este mes.</div>
            )}
          </div>
        </div>
      </div>

      {/* Tables: Top Clients & Top Salespeople */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Clients */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Empresas Clientes Más Importantes del Mes
            </h3>
            <span className="text-xs text-slate-400 font-medium">Por compras totales</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {topClients.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">Sin pedidos registrados en este período.</div>
            ) : (
              topClients.map((client, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{client.companyName}</div>
                      <div className="text-slate-400 text-[11px]">
                        {client.ordersCount} pedidos • {client.itemsCount} prendas dotadas
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatCurrency(client.total)}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Cliente Estratégico</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Salespeople */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              Rendimiento Comercial por Empleado / Asesor
            </h3>
            <span className="text-xs text-slate-400 font-medium">Ventas generadas</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {topSalespeople.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">Sin pedidos registrados en este período.</div>
            ) : (
              topSalespeople.map((seller, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{seller.name}</div>
                      <div className="text-slate-400 text-[11px]">{seller.count} pedidos creados</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatCurrency(seller.total)}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{seller.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

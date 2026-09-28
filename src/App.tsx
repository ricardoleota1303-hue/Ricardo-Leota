/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { OrdersList } from './components/Orders/OrdersList';
import { CreateOrderModal } from './components/Orders/CreateOrderModal';
import { OrderDetailsModal } from './components/Orders/OrderDetailsModal';
import { AdvanceStatusModal } from './components/Orders/AdvanceStatusModal';
import { PriceCatalog } from './components/Catalog/PriceCatalog';
import { OrderTrackerView } from './components/Tracking/OrderTrackerView';
import { MonthlyReports } from './components/Reports/MonthlyReports';
import { UserManager } from './components/Users/UserManager';
import { AdminSettings } from './components/Admin/AdminSettings';
import { AccessRestricted } from './components/Common/AccessRestricted';
import { LockScreenModal } from './components/Common/LockScreenModal';
import { ProfileSelectionModal } from './components/Common/ProfileSelectionModal';
import { Order } from './types';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<string>('pedidos');
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedOrderAdvance, setSelectedOrderAdvance] = useState<Order | null>(null);

  const { orders, canView, isAdmin, config } = useApp();

  // Synchronize CSS variables for theme colors across document
  useEffect(() => {
    const root = document.documentElement;
    const theme = config.themeColors;
    if (theme) {
      root.style.setProperty('--theme-primary', theme.primaryColor || '#f59e0b');
      root.style.setProperty('--theme-primary-hover', theme.primaryHoverColor || theme.primaryColor || '#d97706');
      root.style.setProperty('--theme-header-bg', theme.headerBgColor || '#0f172a');
      root.style.setProperty('--theme-accent', theme.accentColor || theme.primaryColor || '#f59e0b');
    }
  }, [config.themeColors]);

  // If an order gets updated in details, refresh reference
  const currentSelectedOrder = selectedOrderDetails
    ? orders.find(o => o.id === selectedOrderDetails.id) || selectedOrderDetails
    : null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Shift / Profile & Cargo Selection Screen */}
      <ProfileSelectionModal />

      {/* Screen Lock Security Overlay */}
      <LockScreenModal />

      {/* Top Navbar with Navigation Tabs & Role Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
        isMobileDrawerOpen={isMobileDrawerOpen}
        setIsMobileDrawerOpen={setIsMobileDrawerOpen}
      />

      {/* Main Container - with bottom padding on mobile for sticky MobileBottomNav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* 1. Pedidos y Entregas */}
        {activeTab === 'pedidos' && (
          canView('pedidos') ? (
            <OrdersList
              onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
              onSelectOrder={(ord) => setSelectedOrderDetails(ord)}
              onOpenAdvanceStatus={(ord) => setSelectedOrderAdvance(ord)}
            />
          ) : (
            <AccessRestricted 
              moduleId="pedidos" 
              moduleName="Pedidos y Entregas" 
              onGoBack={() => setActiveTab('seguimiento')} 
            />
          )
        )}

        {/* 2. Rastreo y Logística */}
        {activeTab === 'seguimiento' && (
          canView('seguimiento') ? (
            <OrderTrackerView
              onOpenAdvanceStatus={(ord) => setSelectedOrderAdvance(ord)}
              onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
            />
          ) : (
            <AccessRestricted 
              moduleId="seguimiento" 
              moduleName="Rastreo Logístico y Guías de Entrega" 
              onGoBack={() => setActiveTab('pedidos')} 
            />
          )
        )}

        {/* 4. Catálogo de Precios */}
        {activeTab === 'catalogo' && (
          canView('catalogo') ? (
            <PriceCatalog onOpenCreateOrder={() => setIsCreateOrderOpen(true)} />
          ) : (
            <AccessRestricted 
              moduleId="catalogo" 
              moduleName="Catálogo de Precios & Escalas" 
              onGoBack={() => setActiveTab('pedidos')} 
            />
          )
        )}

        {/* 5. Reportes Mensuales de Ventas */}
        {activeTab === 'reportes' && (
          canView('reportes') ? (
            <MonthlyReports />
          ) : (
            <AccessRestricted 
              moduleId="reportes" 
              moduleName="Reportes Mensuales de Ventas & Finanzas" 
              onGoBack={() => setActiveTab('pedidos')} 
            />
          )
        )}

        {/* 6. Gestión de Empleados */}
        {activeTab === 'usuarios' && (
          canView('usuarios') ? (
            <UserManager />
          ) : (
            <AccessRestricted 
              moduleId="usuarios" 
              moduleName="Gestión de Empleados & Roles" 
              onGoBack={() => setActiveTab('pedidos')} 
            />
          )
        )}

        {/* 7. Control Administrador Maestro */}
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminSettings />
          ) : (
            <AccessRestricted 
              moduleId="admin" 
              moduleName="Control Administrador Principal" 
              onGoBack={() => setActiveTab('pedidos')} 
            />
          )
        )}
      </main>

      {/* Modals */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onOrderCreated={(orderId) => {
          const created = orders.find(o => o.id === orderId);
          if (created) {
            setSelectedOrderDetails(created);
          }
        }}
      />

      <OrderDetailsModal
        order={currentSelectedOrder}
        onClose={() => setSelectedOrderDetails(null)}
        onOpenAdvanceStatus={(ord) => {
          setSelectedOrderDetails(null);
          setSelectedOrderAdvance(ord);
        }}
      />

      <AdvanceStatusModal
        order={selectedOrderAdvance}
        onClose={() => setSelectedOrderAdvance(null)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-700">
            {config.companyName} • NIT {config.companyTaxId}
          </span>
          <span className="text-[11px] text-slate-400">
            Seguridad RBAC Activa • Confección y Dotaciones Industriales
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
        onOpenDrawer={() => setIsMobileDrawerOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

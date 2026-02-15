import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useAuthStore } from '@/stores/auth.store';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PlatformLayout } from '@/layouts/PlatformLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProjectsPage } from '@/pages/properties/ProjectsPage';
import { UnitsPage } from '@/pages/properties/UnitsPage';
import { LeadsPage } from '@/pages/crm/LeadsPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { BookingsPage } from '@/pages/bookings/BookingsPage';
import { ContractsPage } from '@/pages/contracts/ContractsPage';
import { ReceiptsPage } from '@/pages/collections/ReceiptsPage';
import { ChartOfAccountsPage } from '@/pages/accounting/ChartOfAccountsPage';
import { JournalEntriesPage } from '@/pages/accounting/JournalEntriesPage';
import { EmployeesPage } from '@/pages/hr/EmployeesPage';
import { PayrollPage } from '@/pages/payroll/PayrollPage';
import { MaintenancePage } from '@/pages/maintenance/MaintenancePage';
import { BrokersPage } from '@/pages/brokers/BrokersPage';
import { InventoryPage } from '@/pages/inventory/InventoryPage';
import { ProcurementPage } from '@/pages/procurement/ProcurementPage';
import { ContractorsPage } from '@/pages/contractors/ContractorsPage';
import { HandoverPage } from '@/pages/handover/HandoverPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { PlatformDashboard } from '@/pages/platform/PlatformDashboard';
import { TenantsPage } from '@/pages/platform/TenantsPage';
import { TenantDetailPage } from '@/pages/platform/TenantDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isSystemAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function SmartRedirect() {
  const user = useAuthStore((s) => s.user);
  if (user?.isSystemAdmin) return <Navigate to="/platform" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Platform Admin Routes (Super Admin only) */}
        <Route
          element={
            <SuperAdminRoute>
              <PlatformLayout />
            </SuperAdminRoute>
          }
        >
          <Route path="/platform" element={<PlatformDashboard />} />
          <Route path="/platform/tenants" element={<TenantsPage />} />
          <Route path="/platform/tenants/:id" element={<TenantDetailPage />} />
        </Route>

        {/* Protected Admin Routes (Tenant users) */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<SmartRedirect />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Properties */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/units" element={<UnitsPage />} />

          {/* CRM */}
          <Route path="/leads" element={<LeadsPage />} />

          {/* Customers & Contracting */}
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/contracts" element={<ContractsPage />} />

          {/* Collections */}
          <Route path="/receipts" element={<ReceiptsPage />} />

          {/* Accounting */}
          <Route path="/accounting/coa" element={<ChartOfAccountsPage />} />
          <Route path="/accounting/journals" element={<JournalEntriesPage />} />

          {/* HR & Payroll */}
          <Route path="/hr/employees" element={<EmployeesPage />} />
          <Route path="/hr/payroll" element={<PayrollPage />} />

          {/* Operations */}
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/brokers" element={<BrokersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/procurement" element={<ProcurementPage />} />
          <Route path="/contractors" element={<ContractorsPage />} />
          <Route path="/handover" element={<HandoverPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

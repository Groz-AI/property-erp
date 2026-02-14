import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  projectsApi, unitsApi, leadsApi, customersApi, bookingsApi,
  contractsApi, receiptsApi, brokersApi, coaApi, journalEntriesApi,
  employeesApi, payrollApi, maintenanceApi, inventoryApi,
  reportsApi, notificationsApi, platformApi,
} from '@/services/api';

// ── Generic hook factory ──────────────────────────────────
function useResourceList<T = any>(
  key: string,
  listFn: (params?: Record<string, unknown>) => Promise<{ data: { data: T[] } }>,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: params ? [key, params] : [key],
    queryFn: async () => {
      const res = await listFn(params);
      return res.data.data;
    },
  });
}

function useResourceMutation<T = any>(
  key: string,
  createFn: (data: any) => Promise<{ data: { data: T } }>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await createFn(data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
    },
  });
}

// ── Projects ──────────────────────────────────────────────
export function useProjects(params?: Record<string, unknown>) {
  return useResourceList('projects', projectsApi.list, params);
}
export function useCreateProject() {
  return useResourceMutation('projects', projectsApi.create);
}

// ── Units ─────────────────────────────────────────────────
export function useUnits(params?: Record<string, unknown>) {
  return useResourceList('units', unitsApi.list, params);
}
export function useCreateUnit() {
  return useResourceMutation('units', unitsApi.create);
}

// ── Leads ─────────────────────────────────────────────────
export function useLeads(params?: Record<string, unknown>) {
  return useResourceList('leads', leadsApi.list, params);
}
export function useCreateLead() {
  return useResourceMutation('leads', leadsApi.create);
}

// ── Customers ─────────────────────────────────────────────
export function useCustomers(params?: Record<string, unknown>) {
  return useResourceList('customers', customersApi.list, params);
}
export function useCreateCustomer() {
  return useResourceMutation('customers', customersApi.create);
}

// ── Bookings ──────────────────────────────────────────────
export function useBookings(params?: Record<string, unknown>) {
  return useResourceList('bookings', bookingsApi.list, params);
}
export function useCreateBooking() {
  return useResourceMutation('bookings', bookingsApi.create);
}

// ── Contracts ─────────────────────────────────────────────
export function useContracts(params?: Record<string, unknown>) {
  return useResourceList('contracts', contractsApi.list, params);
}

// ── Receipts ──────────────────────────────────────────────
export function useReceipts(params?: Record<string, unknown>) {
  return useResourceList('receipts', receiptsApi.list, params);
}
export function useCreateReceipt() {
  return useResourceMutation('receipts', receiptsApi.create);
}

// ── Brokers ───────────────────────────────────────────────
export function useBrokers(params?: Record<string, unknown>) {
  return useResourceList('brokers', brokersApi.list, params);
}
export function useCreateBroker() {
  return useResourceMutation('brokers', brokersApi.create);
}

// ── Chart of Accounts ─────────────────────────────────────
export function useChartOfAccounts(params?: Record<string, unknown>) {
  return useResourceList('coa', coaApi.list, params);
}
export function useCreateAccount() {
  return useResourceMutation('coa', coaApi.create);
}

// ── Journal Entries ───────────────────────────────────────
export function useJournalEntries(params?: Record<string, unknown>) {
  return useResourceList('journals', journalEntriesApi.list, params);
}

// ── Employees ─────────────────────────────────────────────
export function useEmployees(params?: Record<string, unknown>) {
  return useResourceList('employees', employeesApi.list, params);
}
export function useCreateEmployee() {
  return useResourceMutation('employees', employeesApi.create);
}

// ── Payroll ───────────────────────────────────────────────
export function usePayroll(params?: Record<string, unknown>) {
  return useResourceList('payroll', payrollApi.list, params);
}
export function useCreatePayslip() {
  return useResourceMutation('payroll', payrollApi.create);
}

// ── Maintenance ───────────────────────────────────────────
export function useMaintenanceTickets(params?: Record<string, unknown>) {
  return useResourceList('maintenance', maintenanceApi.list, params);
}
export function useCreateTicket() {
  return useResourceMutation('maintenance', maintenanceApi.create);
}

// ── Inventory ─────────────────────────────────────────────
export function useInventoryItems(params?: Record<string, unknown>) {
  return useResourceList('inventory', inventoryApi.list, params);
}
export function useCreateInventoryItem() {
  return useResourceMutation('inventory', inventoryApi.create);
}

// ── Reports / Dashboard ───────────────────────────────────
export function useSalesReport(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: async () => {
      const res = await reportsApi.sales(params);
      return res.data.data;
    },
  });
}

export function useCollectionsReport(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['reports', 'collections', params],
    queryFn: async () => {
      const res = await reportsApi.collections(params);
      return res.data.data;
    },
  });
}

export function useAgingReport() {
  return useQuery({
    queryKey: ['reports', 'aging'],
    queryFn: async () => {
      const res = await reportsApi.aging();
      return res.data.data;
    },
  });
}

// ── Notifications ─────────────────────────────────────────
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationsApi.list();
      return res.data.data;
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useDismissNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.dismiss(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ── Platform Admin ───────────────────────────────────────
export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform', 'stats'],
    queryFn: async () => {
      const res = await platformApi.stats();
      return res.data.data;
    },
  });
}

export function usePlatformTenants() {
  return useQuery({
    queryKey: ['platform', 'tenants'],
    queryFn: async () => {
      const res = await platformApi.listTenants();
      return res.data.data;
    },
  });
}

export function usePlatformTenant(id: string) {
  return useQuery({
    queryKey: ['platform', 'tenants', id],
    queryFn: async () => {
      const res = await platformApi.getTenant(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function usePlatformTenantUsers(tenantId: string) {
  return useQuery({
    queryKey: ['platform', 'tenants', tenantId, 'users'],
    queryFn: async () => {
      const res = await platformApi.getTenantUsers(tenantId);
      return res.data.data;
    },
    enabled: !!tenantId,
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await platformApi.createTenant(data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform'] });
    },
  });
}

export function useToggleTenantActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (active) await platformApi.activateTenant(id);
      else await platformApi.deactivateTenant(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform'] });
    },
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (active) await platformApi.activateUser(id);
      else await platformApi.deactivateUser(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform'] });
    },
  });
}

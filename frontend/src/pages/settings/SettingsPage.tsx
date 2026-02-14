import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { FormField, FormInput, FormSelect, FormRow } from '@/components/ui/form-dialog';
import { Save, User, Building2, Globe, Bell, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TabProps {
  active: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'profile', labelKey: 'settings.tabs.profile', icon: User },
  { id: 'company', labelKey: 'settings.tabs.company', icon: Building2 },
  { id: 'localization', labelKey: 'settings.tabs.localization', icon: Globe },
  { id: 'notifications', labelKey: 'settings.tabs.notifications', icon: Bell },
  { id: 'security', labelKey: 'settings.tabs.security', icon: Shield },
];

function SettingsTabs({ active, onTabChange }: TabProps) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-1 border-b border-border/50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

function ProfileTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-soft">
          AM
        </div>
        <div>
          <h3 className="font-semibold text-lg">Admin Manager</h3>
          <p className="text-sm text-muted-foreground">admin@groz.ae</p>
          <button className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">{t('settings.profile.change_avatar')}</button>
        </div>
      </div>
      <div className="grid gap-4 max-w-2xl">
        <FormRow>
          <FormField label={t('settings.profile.first_name')}>
            <FormInput defaultValue="Admin" />
          </FormField>
          <FormField label={t('settings.profile.last_name')}>
            <FormInput defaultValue="Manager" />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label={t('settings.profile.email')}>
            <FormInput type="email" defaultValue="admin@groz.ae" />
          </FormField>
          <FormField label={t('settings.profile.phone')}>
            <FormInput type="tel" defaultValue="+971-50-100-0000" />
          </FormField>
        </FormRow>
        <FormField label={t('settings.profile.job_title')}>
          <FormInput defaultValue="System Administrator" />
        </FormField>
      </div>
    </div>
  );
}

function CompanyTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 max-w-2xl">
      <FormField label={t('settings.company.name')}>
        <FormInput defaultValue="Groz Properties LLC" />
      </FormField>
      <FormRow>
        <FormField label={t('settings.company.trade_license')}>
          <FormInput defaultValue="TL-2024-123456" />
        </FormField>
        <FormField label={t('settings.company.tax_registration')}>
          <FormInput defaultValue="100-1234-567890" />
        </FormField>
      </FormRow>
      <FormField label={t('settings.company.address')}>
        <FormInput defaultValue="Business Bay, Bay Square Tower 1, Office 1205, Dubai, UAE" />
      </FormField>
      <FormRow>
        <FormField label={t('settings.company.contact_email')}>
          <FormInput type="email" defaultValue="info@groz.ae" />
        </FormField>
        <FormField label={t('settings.company.contact_phone')}>
          <FormInput type="tel" defaultValue="+971-4-123-4567" />
        </FormField>
      </FormRow>
    </div>
  );
}

function LocalizationTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 max-w-2xl">
      <FormRow>
        <FormField label={t('settings.localization.language')}>
          <FormSelect defaultValue="en">
            <option value="en">English</option>
            <option value="ar">العربية (Arabic)</option>
          </FormSelect>
        </FormField>
        <FormField label={t('settings.localization.currency')}>
          <FormSelect defaultValue="AED">
            <option value="AED">AED — UAE Dirham</option>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="SAR">SAR — Saudi Riyal</option>
          </FormSelect>
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label={t('settings.localization.date_format')}>
          <FormSelect defaultValue="yyyy-MM-dd">
            <option value="yyyy-MM-dd">2026-02-11</option>
            <option value="dd/MM/yyyy">11/02/2026</option>
            <option value="MM/dd/yyyy">02/11/2026</option>
            <option value="dd-MMM-yyyy">11-Feb-2026</option>
          </FormSelect>
        </FormField>
        <FormField label={t('settings.localization.number_format')}>
          <FormSelect defaultValue="en-AE">
            <option value="en-AE">1,234,567.89</option>
            <option value="de-DE">1.234.567,89</option>
            <option value="fr-FR">1 234 567,89</option>
          </FormSelect>
        </FormField>
      </FormRow>
      <FormField label={t('settings.localization.timezone')}>
        <FormSelect defaultValue="Asia/Dubai">
          <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
          <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
          <option value="Europe/London">Europe/London (GMT+0)</option>
          <option value="America/New_York">America/New_York (GMT-5)</option>
        </FormSelect>
      </FormField>
    </div>
  );
}

function NotificationsTab() {
  const { t } = useTranslation();
  const items = [
    { label: t('settings.notifications_tab.booking_created'), description: t('settings.notifications_tab.booking_created_desc'), defaultChecked: true },
    { label: t('settings.notifications_tab.payment_received'), description: t('settings.notifications_tab.payment_received_desc'), defaultChecked: true },
    { label: t('settings.notifications_tab.contract_signed'), description: t('settings.notifications_tab.contract_signed_desc'), defaultChecked: true },
    { label: t('settings.notifications_tab.installment_overdue'), description: t('settings.notifications_tab.installment_overdue_desc'), defaultChecked: true },
    { label: t('settings.notifications_tab.lead_assigned'), description: t('settings.notifications_tab.lead_assigned_desc'), defaultChecked: false },
    { label: t('settings.notifications_tab.approval_pending'), description: t('settings.notifications_tab.approval_pending_desc'), defaultChecked: true },
    { label: t('settings.notifications_tab.maintenance_ticket'), description: t('settings.notifications_tab.maintenance_ticket_desc'), defaultChecked: false },
  ];

  return (
    <div className="space-y-1 max-w-2xl">
      <p className="text-sm text-muted-foreground mb-4">{t('settings.notifications_tab.description')}</p>
      {items.map((item) => (
        <label key={item.label} className="flex items-start gap-3 rounded-xl p-3.5 hover:bg-muted/50 transition-all duration-200 cursor-pointer">
          <input type="checkbox" defaultChecked={item.defaultChecked} className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary" />
          <div>
            <div className="text-sm font-medium">{item.label}</div>
            <div className="text-xs text-muted-foreground">{item.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

function SecurityTab() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-medium mb-3">{t('settings.security.change_password')}</h3>
        <div className="space-y-4">
          <FormField label={t('settings.security.current_password')}>
            <FormInput type="password" placeholder={t('settings.security.current_password_placeholder')} />
          </FormField>
          <FormRow>
            <FormField label={t('settings.security.new_password')}>
              <FormInput type="password" placeholder={t('settings.security.new_password_placeholder')} />
            </FormField>
            <FormField label={t('settings.security.confirm_password')}>
              <FormInput type="password" placeholder={t('settings.security.confirm_password_placeholder')} />
            </FormField>
          </FormRow>
        </div>
      </div>
      <div className="border-t border-border/50 pt-6">
        <h3 className="font-medium mb-3">{t('settings.security.two_factor')}</h3>
        <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
          <div>
            <div className="text-sm font-medium">{t('settings.security.enable_2fa')}</div>
            <div className="text-xs text-muted-foreground">{t('settings.security.enable_2fa_desc')}</div>
          </div>
          <button className="rounded-xl border border-border/60 px-4 py-2 text-sm font-medium hover:bg-muted transition-all duration-200">
            {t('settings.security.enable')}
          </button>
        </div>
      </div>
      <div className="border-t border-border/50 pt-6">
        <h3 className="font-medium mb-3">{t('settings.security.active_sessions')}</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-border/60 p-3.5">
            <div>
              <div className="text-sm font-medium">{t('settings.security.current_session')}</div>
              <div className="text-xs text-muted-foreground">Chrome on Windows — 192.168.1.100 — Active now</div>
            </div>
            <span className="text-xs text-green-600 font-medium">{t('settings.security.current')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div>
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white hover:shadow-glow transition-all duration-200">
            <Save className="h-4 w-4" /> {t('settings.save')}
          </button>
        }
      />
      <div className="px-6">
        <SettingsTabs active={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="p-6">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'company' && <CompanyTab />}
        {activeTab === 'localization' && <LocalizationTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}

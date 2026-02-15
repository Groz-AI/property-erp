import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/services/api';
import { toast } from 'sonner';
import { Building2, Eye, EyeOff, Loader2, ArrowRight, Shield, BarChart3, Globe2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/language-toggle';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      const userData = data.data.user;
      setAuth({
        user: userData,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      navigate(userData.isSystemAdmin ? '/platform' : '/dashboard');
      toast.success('Welcome back!', { description: `Signed in as ${email}` });
    } catch (err: any) {
      toast.error('Authentication failed', { description: err?.response?.data?.message || 'Please check your email and password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Branding Panel */}
      <div className="hidden xl:flex xl:w-[48%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        {/* Animated orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-blue-500/20 blur-[100px] animate-pulse-soft" />
          <div className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-indigo-500/15 blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[60%] left-[40%] w-64 h-64 rounded-full bg-violet-500/10 blur-[80px] animate-pulse-soft" style={{ animationDelay: '4s' }} />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 2xl:p-16 w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">PropertyERP</span>
                <span className="block text-[11px] text-blue-300/60 font-medium -mt-0.5">Enterprise Platform</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                Real Estate<br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Management
                </span><br />
                Reimagined.
              </h1>
              <p className="mt-5 text-base text-blue-200/50 leading-relaxed max-w-md">
                End-to-end property management, sales automation, and financial intelligence — all in one unified platform.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Shield, label: 'Bank-Grade Security', sub: 'SOC 2 Compliant' },
                { icon: BarChart3, label: 'Real-Time Analytics', sub: 'Live Dashboards' },
                { icon: Globe2, label: 'Multi-Tenant', sub: 'Scalable SaaS' },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 backdrop-blur-sm">
                  <f.icon className="h-5 w-5 text-blue-400/80 mb-3" />
                  <p className="text-xs font-semibold text-white/90">{f.label}</p>
                  <p className="text-[10px] text-blue-300/40 mt-0.5">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-white/20">
            <span>&copy; {new Date().getFullYear()} Groz AI</span>
            <span>·</span>
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950 relative">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />

        <div className="relative z-10 w-full max-w-[400px] mx-6 sm:mx-auto animate-fade-in">
          {/* Mobile / tablet logo */}
          <div className="xl:hidden flex items-center gap-2.5 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">PropertyERP</span>
              <span className="block text-[10px] text-muted-foreground -mt-0.5">Enterprise Platform</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full h-12 px-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300">{t('auth.password')}</label>
                <button type="button" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">{t('auth.forgot_password')}</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-12 px-4 pr-12 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
              <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 select-none">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 gradient-primary text-white rounded-xl font-semibold text-sm hover:shadow-glow disabled:opacity-60 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between">
            <LanguageToggle />
            <p className="text-[11px] text-gray-400">Powered by <span className="font-semibold text-gray-500">Groz AI</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

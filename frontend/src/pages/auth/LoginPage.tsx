import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/services/api';
import { toast } from 'sonner';
import { Building2, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/language-toggle';

export function LoginPage() {
  const [email, setEmail] = useState('ahmad@groz.ae');
  const [password, setPassword] = useState('Demo@2026!');
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
      toast.error('Invalid credentials', { description: err?.response?.data?.message || err?.message || 'Please check your email and password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-400 blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-purple-400 blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-400 blur-3xl animate-pulse-soft" style={{ animationDelay: '3s' }} />
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 animate-fade-in">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl shadow-soft-lg border border-white/20 dark:border-white/10 p-8 sm:p-10">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-5">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('auth.login')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{t('auth.login_desc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.password')}</label>
                <button type="button" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">{t('auth.forgot_password')}</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  className="w-full px-4 py-3 pr-11 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3 px-4 gradient-primary text-white rounded-xl font-semibold text-sm hover:shadow-glow disabled:opacity-60 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('auth.signing_in')}
                </>
              ) : (
                <>
                  {t('auth.login')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Demo: <code className="font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">ahmad@groz.ae</code> / <code className="font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Demo@2026!</code></span>
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="flex items-center justify-center mt-6 gap-3">
          <LanguageToggle />
          <span className="text-xs text-white/30">|</span>
          <p className="text-xs text-white/40">Powered by Groz AI</p>
        </div>
      </div>
    </div>
  );
}

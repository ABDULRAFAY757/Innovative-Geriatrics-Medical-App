import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Heart,
  Users,
  Activity,
  Shield,
  Stethoscope
} from 'lucide-react';
import { clsx } from 'clsx';
import { TablerButton, TablerInput, TablerCheckbox, TablerAlert, TablerCard, TablerBadge } from '../shared';

const TablerLogin = () => {
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('patient');

  // Demo credentials for easy testing (3 roles: Patient, Doctor, Family)
  const demoCredentials = {
    patient: { email: 'patient1@elderly.sa', password: 'patient123' },
    doctor: { email: 'doctor1@kfmc.sa', password: 'doctor123' },
    family: { email: 'family1@gmail.com', password: 'family123' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);

      if (result.success) {
        const roleRoutes = {
          patient: '/patient',
          doctor: '/doctor',
          family: '/family',
          admin: '/doctor'
        };

        navigate(roleRoutes[result.user.role] || '/');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const credentials = demoCredentials[role];
    setFormData({
      email: credentials.email,
      password: credentials.password,
      rememberMe: false
    });
    setSelectedRole(role);
  };

  const roleCards = [
    {
      role: 'patient',
      title: language === 'ar' ? 'مريض' : 'Patient',
      icon: Users,
      color: 'primary',
      description: language === 'ar' ? 'إدارة الصحة والأدوية' : 'Manage health & medications'
    },
    {
      role: 'doctor',
      title: language === 'ar' ? 'طبيب' : 'Doctor',
      icon: Stethoscope,
      color: 'success',
      description: language === 'ar' ? 'رعاية المرضى' : 'Patient care management'
    },
    {
      role: 'family',
      title: language === 'ar' ? 'عائلة' : 'Family',
      icon: Heart,
      color: 'danger',
      description: language === 'ar' ? 'مراقبة الأحباء' : 'Monitor loved ones'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="avatar avatar-xl bg-white text-blue-600">
              <Heart className="w-8 h-8" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Innovative Geriatrics</h1>
              <p className="text-blue-100 text-sm">رعاية مبتكرة لكبار السن</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                {language === 'ar' ? 'منصة رعاية كبار السن' : 'Elderly Care Platform'}
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                {language === 'ar'
                  ? 'منصة شاملة لإدارة الرعاية الصحية لكبار السن في المملكة العربية السعودية'
                  : 'Comprehensive healthcare management platform for elderly care in Saudi Arabia'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-white/10 backdrop-blur border-white/20">
                <div className="card-body card-sm">
                  <div className="avatar avatar-sm bg-white/20 mb-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-1">{language === 'ar' ? 'آمن ومحمي' : 'Secure & Protected'}</h3>
                  <p className="text-sm text-blue-100">
                    {language === 'ar' ? 'بيانات مشفرة' : 'Encrypted data'}
                  </p>
                </div>
              </div>

              <div className="card bg-white/10 backdrop-blur border-white/20">
                <div className="card-body card-sm">
                  <div className="avatar avatar-sm bg-white/20 mb-3">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-1">{language === 'ar' ? 'متاح دائماً' : '24/7 Available'}</h3>
                  <p className="text-sm text-blue-100">
                    {language === 'ar' ? 'على مدار الساعة' : 'Round the clock'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="card bg-white/5 backdrop-blur border-white/10">
            <div className="card-body card-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-xs font-medium text-blue-200 uppercase">MNGHA Certified Platform</p>
              </div>
              <div className="avatar-list-stacked">
                <span className="avatar avatar-sm bg-gradient-to-br from-rose-400 to-pink-600">LA</span>
                <span className="avatar avatar-sm bg-gradient-to-br from-blue-400 to-indigo-600">KS</span>
                <span className="avatar avatar-sm bg-gradient-to-br from-emerald-400 to-teal-600">AR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Language Toggle */}
          <div className="flex justify-end mb-6">
            <TablerButton
              variant="ghost-secondary"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            >
              {language === 'en' ? 'العربية' : 'English'}
            </TablerButton>
          </div>

          {/* Login Card */}
          <TablerCard className="shadow-lg">
            <div className="text-center mb-6">
              <div className="avatar avatar-xl bg-gradient-to-br from-blue-500 to-blue-600 mx-auto mb-4 lg:hidden">
                <Heart className="w-8 h-8" fill="currentColor" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </h2>
              <p className="text-muted">
                {language === 'ar' ? 'الوصول إلى حسابك' : 'Access your account'}
              </p>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="form-label">
                {language === 'ar' ? 'تسجيل دخول سريع - تجريبي' : 'Quick Demo Login'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roleCards.map((roleCard) => {
                  const Icon = roleCard.icon;
                  const isSelected = selectedRole === roleCard.role;
                  return (
                    <button
                      key={roleCard.role}
                      onClick={() => handleDemoLogin(roleCard.role)}
                      className={clsx(
                        'card p-3 text-center transition-all cursor-pointer',
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      )}
                    >
                      <Icon className={clsx('w-6 h-6 mx-auto mb-2', isSelected ? 'text-blue-600' : 'text-gray-600')} />
                      <p className={clsx('text-xs font-medium', isSelected ? 'text-blue-900' : 'text-gray-700')}>
                        {roleCard.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <TablerInput
                label={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={Mail}
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                required
              />

              <div>
                <label className="form-label">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-control pl-10 pr-10"
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <TablerCheckbox
                  label={language === 'ar' ? 'تذكرني' : 'Remember me'}
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </a>
              </div>

              {error && (
                <TablerAlert type="danger" icon={AlertCircle}>
                  {error}
                </TablerAlert>
              )}

              <TablerButton
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                {loading
                  ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...')
                  : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
              </TablerButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted">
                {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  {language === 'ar' ? 'سجل الآن' : 'Register now'}
                </a>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-100">
              <div className="flex items-start gap-2 text-xs text-blue-900">
                <TablerBadge variant="primary" size="sm">Demo</TablerBadge>
                <p className="text-blue-700">
                  {language === 'ar'
                    ? 'انقر على أي دور أعلاه للتعبئة التلقائية'
                    : 'Click any role card above to auto-fill credentials'}
                </p>
              </div>
            </div>
          </TablerCard>

          <p className="text-center text-sm text-muted mt-6">
            &copy; 2024 Innovative Geriatrics. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TablerLogin;

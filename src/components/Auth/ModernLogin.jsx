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
  CheckCircle,
  Heart,
  Shield,
  Users,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';

const ModernLogin = () => {
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

  // Demo credentials for easy testing
  const demoCredentials = {
    patient: { email: 'patient1@elderly.sa', password: 'patient123' },
    doctor: { email: 'doctor1@kfmc.sa', password: 'doctor123' },
    family: { email: 'family1@gmail.com', password: 'family123' },
    donor: { email: 'donor1@charity.sa', password: 'donor123' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);

      if (result.success) {
        // Redirect based on role
        const roleRoutes = {
          patient: '/patient',
          doctor: '/doctor',
          family: '/family',
          donor: '/donor',
          admin: '/patient' // Admin can access all dashboards
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
      color: 'blue',
      description: language === 'ar' ? 'إدارة الصحة والأدوية' : 'Manage health & medications'
    },
    {
      role: 'doctor',
      title: language === 'ar' ? 'طبيب' : 'Doctor',
      icon: Activity,
      color: 'green',
      description: language === 'ar' ? 'رعاية المرضى' : 'Patient care management'
    },
    {
      role: 'family',
      title: language === 'ar' ? 'عائلة' : 'Family',
      icon: Heart,
      color: 'purple',
      description: language === 'ar' ? 'مراقبة الأحباء' : 'Monitor loved ones'
    },
    {
      role: 'donor',
      title: language === 'ar' ? 'متبرع' : 'Donor',
      icon: Shield,
      color: 'orange',
      description: language === 'ar' ? 'دعم المجتمع' : 'Support community'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-blue-600" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Innovative Geriatrics</h1>
              <p className="text-blue-100 text-sm">رعاية مبتكرة لكبار السن</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                {language === 'ar' ? 'مرحباً بك في منصة رعاية كبار السن' : 'Welcome to Elderly Care Platform'}
              </h2>
              <p className="text-xl text-blue-100">
                {language === 'ar'
                  ? 'منصة شاملة لإدارة الرعاية الصحية لكبار السن في المملكة العربية السعودية'
                  : 'Comprehensive healthcare management platform for elderly care in Saudi Arabia'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{language === 'ar' ? 'آمن ومحمي' : 'Secure & Protected'}</h3>
                <p className="text-sm text-blue-100">
                  {language === 'ar' ? 'بيانات مشفرة ومحمية' : 'End-to-end encrypted data'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{language === 'ar' ? 'متاح دائماً' : '24/7 Available'}</h3>
                <p className="text-sm text-blue-100">
                  {language === 'ar' ? 'وصول على مدار الساعة' : 'Round the clock access'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs font-medium text-blue-200 uppercase tracking-wider">Crafted by Healthcare Innovators</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Overlapping Avatars */}
              <div className="flex -space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold border-3 border-white/30 shadow-lg shadow-pink-500/30 hover:scale-110 hover:z-10 transition-transform cursor-pointer">
                  LA
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold border-3 border-white/30 shadow-lg shadow-blue-500/30 hover:scale-110 hover:z-10 transition-transform cursor-pointer">
                  KS
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-sm font-bold border-3 border-white/30 shadow-lg shadow-teal-500/30 hover:scale-110 hover:z-10 transition-transform cursor-pointer">
                  AR
                </div>
              </div>

              {/* Team Info */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className="text-white font-medium">Dr. Lama A.</span>
                  <span className="text-blue-200">•</span>
                  <span className="text-white font-medium">Khaled B.S.</span>
                  <span className="text-blue-200">•</span>
                  <span className="text-white font-medium">Abdul R.</span>
                </div>
                <p className="text-xs text-blue-300 mt-1">Medical × AI × Engineering</p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-xs text-blue-200">MNGHA Certified</span>
              </div>
              <div className="text-xs text-blue-300">
                Saudi Arabia 🇸🇦
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
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center lg:hidden">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </h2>
              <p className="text-gray-600">
                {language === 'ar' ? 'الوصول إلى حسابك' : 'Access your account'}
              </p>
            </div>

            {/* Role Selection for Demo */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                {language === 'ar' ? 'تسجيل دخول سريع - تجريبي' : 'Quick Demo Login'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {roleCards.map((roleCard) => {
                  const Icon = roleCard.icon;
                  const isSelected = selectedRole === roleCard.role;
                  return (
                    <button
                      key={roleCard.role}
                      onClick={() => handleDemoLogin(roleCard.role)}
                      className={clsx(
                        'p-3 rounded-xl border-2 transition-all text-left',
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      )}
                    >
                      <Icon className={clsx('w-5 h-5 mb-1', isSelected ? 'text-blue-600' : 'text-gray-600')} />
                      <p className={clsx('text-xs font-semibold', isSelected ? 'text-blue-900' : 'text-gray-900')}>
                        {roleCard.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {language === 'ar' ? 'تذكرني' : 'Remember me'}
                  </span>
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...')
                  : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                  {language === 'ar' ? 'سجل الآن' : 'Register now'}
                </a>
              </p>
            </div>

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-semibold mb-1">
                    {language === 'ar' ? 'بيانات تجريبية' : 'Demo Credentials'}
                  </p>
                  <p className="text-blue-700">
                    {language === 'ar'
                      ? 'انقر على أي دور أعلاه للتعبئة التلقائية'
                      : 'Click any role card above to auto-fill credentials'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            &copy; 2024 Innovative Geriatrics. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;

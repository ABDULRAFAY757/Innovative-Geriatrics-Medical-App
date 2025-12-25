import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  Globe,
  LogOut,
  User,
  Home,
  Settings,
  HelpCircle,
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { clsx } from 'clsx';

const Header = ({ user, onLogout }) => {
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const roleColors = {
    patient: 'bg-blue-600',
    family: 'bg-green-600',
    doctor: 'bg-purple-600',
    donor: 'bg-red-600',
  };

  const getNavItems = () => {
    const baseItems = [
      { path: `/${user?.role}`, label: t('dashboard'), icon: Home },
    ];

    switch (user?.role) {
      case 'patient':
        return [
          ...baseItems,
          { path: '/patient/medications', label: t('my_medications') },
          { path: '/patient/appointments', label: t('my_appointments') },
          { path: '/patient/equipment', label: t('equipment_requests') },
        ];
      case 'family':
        return [
          ...baseItems,
          { path: '/family/care-tasks', label: t('care_tasks') },
          { path: '/family/alerts', label: t('recent_alerts') },
        ];
      case 'doctor':
        return [
          ...baseItems,
          { path: '/doctor/patients', label: t('my_patients') },
          { path: '/doctor/appointments', label: t('todays_appointments') },
        ];
      case 'donor':
        return [
          ...baseItems,
          { path: '/donor/marketplace', label: t('equipment_marketplace') },
          { path: '/donor/donations', label: t('my_donations') },
        ];
      default:
        return baseItems;
    }
  };

  const notifications = [
    { id: 1, title: 'Medication Reminder', message: 'Time to take Metformin', time: '5 min ago', unread: true },
    { id: 2, title: 'Appointment Reminder', message: 'Dr. Lama tomorrow at 9 AM', time: '1 hour ago', unread: true },
    { id: 3, title: 'Fall Alert Resolved', message: 'Alert has been addressed', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header 
      className={clsx(
        'bg-white border-b border-gray-200 sticky top-0 z-40',
        isRTL && 'font-arabic'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className={clsx('p-2 rounded-lg', roleColors[user?.role] || 'bg-blue-600')}>
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">{t('app_name')}</h1>
              <p className="text-xs text-gray-500">{t(user?.role || 'patient')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {getNavItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title={language === 'en' ? 'العربية' : 'English'}
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsNotificationsOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">{t('notifications')}</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={clsx(
                            'p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer',
                            notif.unread && 'bg-blue-50'
                          )}
                        >
                          <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        {t('view_all')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold',
                  roleColors[user?.role] || 'bg-blue-600'
                )}>
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user?.name || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to={`/${user?.role}/profile`}
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <User className="w-4 h-4" />
                        {t('profile')}
                      </Link>
                      <Link
                        to={`/${user?.role}/settings`}
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <Settings className="w-4 h-4" />
                        {t('settings')}
                      </Link>
                      <Link
                        to={`/${user?.role}/help`}
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <HelpCircle className="w-4 h-4" />
                        {t('help')}
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            {getNavItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
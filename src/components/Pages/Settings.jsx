import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  Bell,
  Globe,
  Shield,
  Volume2,
  Eye,
  Lock,
  Database,
  Webhook,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Pill,
  Calendar,
  Heart,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Type,
  Smartphone
} from 'lucide-react';
import { Card, Button, Modal } from '../shared/UIComponents';
import { TablerAlert, TablerSelect, TablerBadge } from '../shared/TablerUIComponents';
import WebhookSettings from '../shared/WebhookSettings';
import { clsx } from 'clsx';

const Settings = () => {
  const { t, isRTL, language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const { resetAllData, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultSettings();
      }
    }
    return getDefaultSettings();
  });

  function getDefaultSettings() {
    return {
      // Notifications
      medicationReminders: true,
      appointmentAlerts: true,
      fallAlerts: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      reminderTime: 30, // minutes before

      // Privacy
      shareDataWithDoctors: true,
      shareDataWithFamily: true,
      anonymousAnalytics: true,

      // Display
      darkMode: false,
      largeText: false,
      highContrast: false,

      // Language
      language: language,

      // Sound
      soundEnabled: true,
      voiceAssistant: false,

      // Patient-specific
      medicationReminderSound: 'default',
      emergencyContactEnabled: true,
      healthMetricReminders: true,
      appointmentReminderDays: 1,
    };
  }

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      // Show feedback
      setSaveMessage({ type: 'success', text: language === 'ar' ? 'تم حفظ الإعداد' : 'Setting saved' });
      setTimeout(() => setSaveMessage(null), 2000);
      return newSettings;
    });
  };

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setSaveMessage({ type: 'success', text: language === 'ar' ? 'تم حفظ الإعداد' : 'Setting saved' });
      setTimeout(() => setSaveMessage(null), 2000);
      return newSettings;
    });
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      resetAllData();
      setShowResetModal(false);
      addNotification('success', language === 'ar' ? 'تم إعادة تعيين جميع البيانات' : 'All data has been reset');
    } catch {
      addNotification('error', language === 'ar' ? 'فشل في إعادة تعيين البيانات' : 'Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  const ToggleSwitch = ({ enabled, onToggle, disabled = false }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        enabled ? 'bg-blue-600' : 'bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={clsx(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );

  const SettingRow = ({ icon: Icon, title, description, children, iconColor = 'text-gray-600' }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 -mx-4 px-4 rounded-lg transition-colors">
      <div className="flex items-start gap-3 flex-1">
        {Icon && (
          <div className={clsx('p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm', iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  return (
    <div
      className={clsx('p-6 max-w-4xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl shadow-lg">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('settings')}
            </h1>
            <p className="text-gray-600 text-sm">
              {language === 'ar' ? 'إدارة تفضيلات التطبيق والإعدادات' : 'Manage your app preferences and configurations'}
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{user?.name || 'User'}</h2>
            <p className="text-sm text-gray-600 capitalize flex items-center gap-2">
              <TablerBadge
                variant={
                  user?.role === 'doctor' ? 'purple' :
                  user?.role === 'patient' ? 'primary' :
                  user?.role === 'family' ? 'success' :
                  user?.role === 'admin' ? 'danger' : 'secondary'
                }
                light
                pill
              >
                {user?.role || 'user'}
              </TablerBadge>
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{language === 'ar' ? 'حساب موثق' : 'Verified Account'}</span>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <TablerAlert
          type={saveMessage.type === 'success' ? 'success' : 'danger'}
          icon={CheckCircle}
          dismissible
          onDismiss={() => setSaveMessage(null)}
          className="mb-6 animate-fadeIn"
        >
          {saveMessage.text}
        </TablerAlert>
      )}

      {/* Tab Navigation - Show Webhooks tab for Doctor and Family roles */}
      {(user?.role === 'doctor' || user?.role === 'family' || user?.role === 'admin') && (
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={clsx(
              'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {language === 'ar' ? 'عام' : 'General'}
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={clsx(
              'px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'webhooks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <Webhook className="w-4 h-4" />
            Webhooks
          </button>
        </div>
      )}

      {/* Webhook Settings Tab */}
      {activeTab === 'webhooks' && (user?.role === 'doctor' || user?.role === 'family' || user?.role === 'admin') ? (
        <WebhookSettings />
      ) : (
        <>
          {/* Patient-Specific Settings */}
          {user?.role === 'patient' && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>{language === 'ar' ? 'إعدادات صحية' : 'Health Settings'}</span>
                </div>
              }
              className="mb-6"
            >
              <SettingRow
                icon={Pill}
                iconColor="text-blue-600"
                title={language === 'ar' ? 'تذكيرات الأدوية' : 'Medication Reminders'}
                description={language === 'ar' ? 'تلقي تنبيهات عند حان وقت تناول الدواء' : 'Get alerts when it is time to take medications'}
              >
                <ToggleSwitch
                  enabled={settings.medicationReminders}
                  onToggle={() => toggleSetting('medicationReminders')}
                />
              </SettingRow>

              <SettingRow
                icon={Calendar}
                iconColor="text-purple-600"
                title={language === 'ar' ? 'تذكير المواعيد' : 'Appointment Reminders'}
                description={language === 'ar' ? 'إشعار قبل الموعد' : 'Get notified before appointments'}
              >
                <TablerSelect
                  value={settings.appointmentReminderDays}
                  onChange={(e) => updateSetting('appointmentReminderDays', Number(e.target.value))}
                  options={[
                    { value: 0, label: language === 'ar' ? 'نفس اليوم' : 'Same day' },
                    { value: 1, label: language === 'ar' ? 'يوم واحد قبل' : '1 day before' },
                    { value: 2, label: language === 'ar' ? 'يومين قبل' : '2 days before' },
                    { value: 3, label: language === 'ar' ? '3 أيام قبل' : '3 days before' }
                  ]}
                  size="sm"
                />
              </SettingRow>

              <SettingRow
                icon={Heart}
                iconColor="text-red-600"
                title={language === 'ar' ? 'تذكيرات القياسات الصحية' : 'Health Metric Reminders'}
                description={language === 'ar' ? 'تذكير بقياس ضغط الدم والسكر' : 'Reminders to log blood pressure, glucose'}
              >
                <ToggleSwitch
                  enabled={settings.healthMetricReminders}
                  onToggle={() => toggleSetting('healthMetricReminders')}
                />
              </SettingRow>

              <SettingRow
                icon={AlertTriangle}
                iconColor="text-orange-600"
                title={language === 'ar' ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}
                description={language === 'ar' ? 'السماح بالاتصال التلقائي في حالات الطوارئ' : 'Allow automatic calling in emergencies'}
              >
                <ToggleSwitch
                  enabled={settings.emergencyContactEnabled}
                  onToggle={() => toggleSetting('emergencyContactEnabled')}
                />
              </SettingRow>
            </Card>
          )}

          {/* Notifications */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <span>{language === 'ar' ? 'تفضيلات الإشعارات' : 'Notification Preferences'}</span>
              </div>
            }
            className="mb-6"
          >
            <SettingRow
              icon={Bell}
              iconColor="text-blue-600"
              title={language === 'ar' ? 'تنبيهات المواعيد' : 'Appointment Alerts'}
              description={language === 'ar' ? 'إشعارات للمواعيد القادمة' : 'Notifications for upcoming appointments'}
            >
              <ToggleSwitch
                enabled={settings.appointmentAlerts}
                onToggle={() => toggleSetting('appointmentAlerts')}
              />
            </SettingRow>

            <SettingRow
              icon={AlertTriangle}
              iconColor="text-red-600"
              title={language === 'ar' ? 'تنبيهات السقوط' : 'Fall Alerts'}
              description={language === 'ar' ? 'إشعارات طوارئ لاكتشاف السقوط' : 'Emergency notifications for fall detection'}
            >
              <ToggleSwitch
                enabled={settings.fallAlerts}
                onToggle={() => toggleSetting('fallAlerts')}
              />
            </SettingRow>

            <div className="pt-4 mt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {language === 'ar' ? 'قنوات الإشعارات' : 'Notification Channels'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={clsx(
                  'p-3 rounded-xl border-2 cursor-pointer transition-all',
                  settings.emailNotifications
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                  onClick={() => toggleSetting('emailNotifications')}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                    <ToggleSwitch
                      enabled={settings.emailNotifications}
                      onToggle={() => toggleSetting('emailNotifications')}
                    />
                  </div>
                </div>

                <div className={clsx(
                  'p-3 rounded-xl border-2 cursor-pointer transition-all',
                  settings.smsNotifications
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                  onClick={() => toggleSetting('smsNotifications')}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">SMS</span>
                    <ToggleSwitch
                      enabled={settings.smsNotifications}
                      onToggle={() => toggleSetting('smsNotifications')}
                    />
                  </div>
                </div>

                <div className={clsx(
                  'p-3 rounded-xl border-2 cursor-pointer transition-all',
                  settings.pushNotifications
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                  onClick={() => toggleSetting('pushNotifications')}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{language === 'ar' ? 'الإشعارات الفورية' : 'Push'}</span>
                    <ToggleSwitch
                      enabled={settings.pushNotifications}
                      onToggle={() => toggleSetting('pushNotifications')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy & Data */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>{language === 'ar' ? 'الخصوصية ومشاركة البيانات' : 'Privacy & Data Sharing'}</span>
              </div>
            }
            className="mb-6"
          >
            <SettingRow
              icon={Shield}
              iconColor="text-purple-600"
              title={language === 'ar' ? 'مشاركة البيانات مع الأطباء' : 'Share Data with Doctors'}
              description={language === 'ar' ? 'السماح للأطباء بالوصول إلى سجلاتك الصحية' : 'Allow doctors to access your health records'}
            >
              <ToggleSwitch
                enabled={settings.shareDataWithDoctors}
                onToggle={() => toggleSetting('shareDataWithDoctors')}
              />
            </SettingRow>

            <SettingRow
              icon={Shield}
              iconColor="text-green-600"
              title={language === 'ar' ? 'مشاركة البيانات مع العائلة' : 'Share Data with Family'}
              description={language === 'ar' ? 'السماح لأفراد العائلة بعرض حالتك الصحية' : 'Let family members view your health status'}
            >
              <ToggleSwitch
                enabled={settings.shareDataWithFamily}
                onToggle={() => toggleSetting('shareDataWithFamily')}
              />
            </SettingRow>

            <SettingRow
              icon={Database}
              iconColor="text-gray-600"
              title={language === 'ar' ? 'التحليلات المجهولة' : 'Anonymous Analytics'}
              description={language === 'ar' ? 'المساعدة في تحسين التطبيق ببيانات استخدام مجهولة' : 'Help improve the app with anonymous usage data'}
            >
              <ToggleSwitch
                enabled={settings.anonymousAnalytics}
                onToggle={() => toggleSetting('anonymousAnalytics')}
              />
            </SettingRow>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button variant="outline" icon={Database} className="w-full hover:bg-blue-50 hover:border-blue-300">
                {language === 'ar' ? 'تحميل بياناتي' : 'Download My Data'}
              </Button>
            </div>
          </Card>

          {/* Display & Accessibility */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <span>{language === 'ar' ? 'العرض وإمكانية الوصول' : 'Display & Accessibility'}</span>
              </div>
            }
            className="mb-6"
          >
            <SettingRow
              icon={settings.darkMode ? Moon : Sun}
              iconColor={settings.darkMode ? 'text-indigo-600' : 'text-yellow-600'}
              title={language === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}
              description={language === 'ar' ? 'استخدام السمة الداكنة لتقليل إجهاد العين' : 'Use dark theme for reduced eye strain'}
            >
              <ToggleSwitch
                enabled={settings.darkMode}
                onToggle={() => toggleSetting('darkMode')}
              />
            </SettingRow>

            <SettingRow
              icon={Type}
              iconColor="text-blue-600"
              title={language === 'ar' ? 'نص كبير' : 'Large Text'}
              description={language === 'ar' ? 'زيادة حجم الخط لقراءة أفضل' : 'Increase font size for better readability'}
            >
              <ToggleSwitch
                enabled={settings.largeText}
                onToggle={() => toggleSetting('largeText')}
              />
            </SettingRow>

            <SettingRow
              icon={Eye}
              iconColor="text-gray-600"
              title={language === 'ar' ? 'تباين عالي' : 'High Contrast'}
              description={language === 'ar' ? 'تحسين الوضوح البصري' : 'Enhance visual clarity'}
            >
              <ToggleSwitch
                enabled={settings.highContrast}
                onToggle={() => toggleSetting('highContrast')}
              />
            </SettingRow>
          </Card>

          {/* Language & Region */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <span>{language === 'ar' ? 'اللغة والمنطقة' : 'Language & Region'}</span>
              </div>
            }
            className="mb-6"
          >
            <SettingRow
              icon={Globe}
              iconColor="text-blue-600"
              title={language === 'ar' ? 'اللغة' : 'Language'}
              description={language === 'ar' ? `الحالي: العربية` : `Current: English`}
            >
              <Button
                variant="outline"
                onClick={toggleLanguage}
                className="min-w-[100px]"
              >
                {language === 'en' ? 'العربية' : 'English'}
              </Button>
            </SettingRow>
          </Card>

          {/* Sound & Voice */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-orange-500" />
                <span>{language === 'ar' ? 'الصوت والتحدث' : 'Sound & Voice'}</span>
              </div>
            }
            className="mb-6"
          >
            <SettingRow
              icon={Volume2}
              iconColor="text-orange-600"
              title={language === 'ar' ? 'الصوت مفعل' : 'Sound Enabled'}
              description={language === 'ar' ? 'تشغيل الأصوات للإشعارات والتنبيهات' : 'Play sounds for notifications and alerts'}
            >
              <ToggleSwitch
                enabled={settings.soundEnabled}
                onToggle={() => toggleSetting('soundEnabled')}
              />
            </SettingRow>

            <SettingRow
              icon={Smartphone}
              iconColor="text-purple-600"
              title={language === 'ar' ? 'المساعد الصوتي' : 'Voice Assistant'}
              description={language === 'ar' ? 'تمكين الأوامر الصوتية وتحويل النص إلى كلام' : 'Enable voice commands and text-to-speech'}
            >
              <ToggleSwitch
                enabled={settings.voiceAssistant}
                onToggle={() => toggleSetting('voiceAssistant')}
              />
            </SettingRow>
          </Card>

          {/* Account Actions */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-500" />
                <span>{language === 'ar' ? 'إدارة الحساب' : 'Account Management'}</span>
              </div>
            }
            className="mb-6"
          >
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300">
                <Lock className="w-4 h-4 mr-3" />
                {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:border-purple-300">
                <Database className="w-4 h-4 mr-3" />
                {language === 'ar' ? 'تصدير بيانات الحساب' : 'Export Account Data'}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                onClick={() => setShowResetModal(true)}
              >
                <RefreshCw className="w-4 h-4 mr-3" />
                {language === 'ar' ? 'إعادة تعيين جميع البيانات' : 'Reset All Data'}
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 hover:border-red-300">
                <AlertTriangle className="w-4 h-4 mr-3" />
                {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
              </Button>
            </div>
          </Card>

          {/* App Info */}
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="font-bold text-lg text-gray-900">Innovative Geriatrics Medical App</p>
              <p className="text-gray-600 text-sm mt-1">Version 1.0.0</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700 font-medium">Dr. Lama Algaraini</p>
                <p className="text-xs text-gray-500 mt-1">Medical Intern | MNGHA</p>
              </div>
              <p className="text-xs text-gray-400 mt-4">© 2024 All Rights Reserved</p>
            </div>
          </div>
        </>
      )}

      {/* Reset Data Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            <span>{language === 'ar' ? 'إعادة تعيين البيانات' : 'Reset Data'}</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-orange-800 font-medium">
              {language === 'ar'
                ? 'تحذير: سيؤدي هذا إلى إعادة تعيين جميع بيانات التطبيق إلى الإعدادات الافتراضية.'
                : 'Warning: This will reset all application data to default settings.'}
            </p>
            <p className="text-orange-700 text-sm mt-2">
              {language === 'ar'
                ? 'سيتم حذف جميع المواعيد والأدوية وطلبات المعدات والإعدادات المخصصة.'
                : 'All appointments, medications, equipment requests, and custom settings will be deleted.'}
            </p>
          </div>

          <p className="text-gray-600 text-sm">
            {language === 'ar'
              ? 'هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد من المتابعة؟'
              : 'This action cannot be undone. Are you sure you want to continue?'}
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowResetModal(false)}
              className="flex-1"
              disabled={isResetting}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              onClick={handleResetData}
              className="flex-1"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'ar' ? 'جاري الإعادة...' : 'Resetting...'}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إعادة التعيين' : 'Reset Data'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;

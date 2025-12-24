import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Bell,
  Globe,
  Moon,
  Shield,
  Smartphone,
  Volume2,
  Eye,
  Lock,
  Database,
  Mail
} from 'lucide-react';
import { Card, Button, Badge } from '../shared/UIComponents';
import { clsx } from 'clsx';

const Settings = ({ user }) => {
  const { t, isRTL, language, toggleLanguage } = useLanguage();

  const [settings, setSettings] = useState({
    // Notifications
    medicationReminders: true,
    appointmentAlerts: true,
    fallAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,

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
  });

  const toggleSetting = (key) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      localStorage.setItem('app_settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      )}
    >
      <span
        className={clsx(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );

  return (
    <div
      className={clsx('p-6 max-w-4xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
        <p className="text-gray-600 mt-1">Manage your app preferences and configurations</p>
      </div>

      {/* Notifications */}
      <Card title="Notification Preferences" icon={Bell} className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Medication Reminders</p>
              <p className="text-sm text-gray-600">Get alerts when it&apos;s time to take medications</p>
            </div>
            <ToggleSwitch
              enabled={settings.medicationReminders}
              onToggle={() => toggleSetting('medicationReminders')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Appointment Alerts</p>
              <p className="text-sm text-gray-600">Notifications for upcoming appointments</p>
            </div>
            <ToggleSwitch
              enabled={settings.appointmentAlerts}
              onToggle={() => toggleSetting('appointmentAlerts')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Fall Alerts</p>
              <p className="text-sm text-gray-600">Emergency notifications for fall detection</p>
            </div>
            <ToggleSwitch
              enabled={settings.fallAlerts}
              onToggle={() => toggleSetting('fallAlerts')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications}
              onToggle={() => toggleSetting('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">Get text message alerts</p>
            </div>
            <ToggleSwitch
              enabled={settings.smsNotifications}
              onToggle={() => toggleSetting('smsNotifications')}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Real-time app notifications</p>
            </div>
            <ToggleSwitch
              enabled={settings.pushNotifications}
              onToggle={() => toggleSetting('pushNotifications')}
            />
          </div>
        </div>
      </Card>

      {/* Privacy & Data */}
      <Card title="Privacy & Data Sharing" icon={Shield} className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Share Data with Doctors</p>
              <p className="text-sm text-gray-600">Allow doctors to access your health records</p>
            </div>
            <ToggleSwitch
              enabled={settings.shareDataWithDoctors}
              onToggle={() => toggleSetting('shareDataWithDoctors')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Share Data with Family</p>
              <p className="text-sm text-gray-600">Let family members view your health status</p>
            </div>
            <ToggleSwitch
              enabled={settings.shareDataWithFamily}
              onToggle={() => toggleSetting('shareDataWithFamily')}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Anonymous Analytics</p>
              <p className="text-sm text-gray-600">Help improve the app with anonymous usage data</p>
            </div>
            <ToggleSwitch
              enabled={settings.anonymousAnalytics}
              onToggle={() => toggleSetting('anonymousAnalytics')}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline" icon={Database} className="w-full">
            Download My Data
          </Button>
        </div>
      </Card>

      {/* Display & Accessibility */}
      <Card title="Display & Accessibility" icon={Eye} className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Dark Mode</p>
              <p className="text-sm text-gray-600">Use dark theme for reduced eye strain</p>
            </div>
            <ToggleSwitch
              enabled={settings.darkMode}
              onToggle={() => toggleSetting('darkMode')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Large Text</p>
              <p className="text-sm text-gray-600">Increase font size for better readability</p>
            </div>
            <ToggleSwitch
              enabled={settings.largeText}
              onToggle={() => toggleSetting('largeText')}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">High Contrast</p>
              <p className="text-sm text-gray-600">Enhance visual clarity</p>
            </div>
            <ToggleSwitch
              enabled={settings.highContrast}
              onToggle={() => toggleSetting('highContrast')}
            />
          </div>
        </div>
      </Card>

      {/* Language & Region */}
      <Card title="Language & Region" icon={Globe} className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Language</p>
              <p className="text-sm text-gray-600">Current: {language === 'en' ? 'English' : 'العربية'}</p>
            </div>
            <Button
              variant="outline"
              onClick={toggleLanguage}
            >
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Sound & Voice */}
      <Card title="Sound & Voice" icon={Volume2} className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Sound Enabled</p>
              <p className="text-sm text-gray-600">Play sounds for notifications and alerts</p>
            </div>
            <ToggleSwitch
              enabled={settings.soundEnabled}
              onToggle={() => toggleSetting('soundEnabled')}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Voice Assistant</p>
              <p className="text-sm text-gray-600">Enable voice commands and text-to-speech</p>
            </div>
            <ToggleSwitch
              enabled={settings.voiceAssistant}
              onToggle={() => toggleSetting('voiceAssistant')}
            />
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card title="Account Management" icon={Lock} className="mb-6">
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Export Account Data
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50">
            Delete Account
          </Button>
        </div>
      </Card>

      {/* App Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center text-sm text-gray-600">
          <p className="font-semibold text-gray-900">Innovative Geriatrics Medical App</p>
          <p>Version 1.0.0</p>
          <p className="mt-2">© 2024 Dr. Lama Algaraini</p>
          <p className="text-xs mt-1">Medical Intern | MNGHA</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

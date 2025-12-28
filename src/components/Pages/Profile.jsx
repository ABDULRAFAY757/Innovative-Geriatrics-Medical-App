import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Shield,
  Activity,
  Pill,
  FileText,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../shared/UIComponents';
import { clsx } from 'clsx';

const Profile = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { refreshSession } = useAuth();
  const { patients, appointments, medicationReminders, equipmentRequests } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Get patient data if user is a patient
  const patientData = user?.role === 'patient'
    ? patients.find(p => p.id === user?.id) || {}
    : {};

  const [formData, setFormData] = useState({
    name: user?.nameEn || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || patientData?.phone || '+966 555 123 456',
    address: user?.address || patientData?.address || 'Riyadh, Saudi Arabia',
    dateOfBirth: user?.dateOfBirth || patientData?.dob || '1950-01-01',
    emergencyContact: user?.emergencyContact || patientData?.emergencyContact?.phone || '+966 555 999 888',
    emergencyName: patientData?.emergencyContact?.name || '',
    emergencyRelationship: patientData?.emergencyContact?.relationship || '',
    bloodType: patientData?.bloodType || '',
    medicalConditions: patientData?.conditions?.join(', ') || '',
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      const patient = patients.find(p => p.id === user?.id) || {};
      setFormData({
        name: user?.nameEn || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || patient?.phone || '+966 555 123 456',
        address: user?.address || patient?.address || 'Riyadh, Saudi Arabia',
        dateOfBirth: user?.dateOfBirth || patient?.dob || '1950-01-01',
        emergencyContact: user?.emergencyContact || patient?.emergencyContact?.phone || '+966 555 999 888',
        emergencyName: patient?.emergencyContact?.name || '',
        emergencyRelationship: patient?.emergencyContact?.relationship || '',
        bloodType: patient?.bloodType || '',
        medicalConditions: patient?.conditions?.join(', ') || '',
      });
    }
  }, [user, patients]);

  // Calculate patient statistics
  const patientStats = user?.role === 'patient' ? {
    totalAppointments: appointments.filter(a => a.patient_id === user?.id).length,
    upcomingAppointments: appointments.filter(a => a.patient_id === user?.id && (a.status === 'Scheduled' || a.status === 'Confirmed')).length,
    completedAppointments: appointments.filter(a => a.patient_id === user?.id && a.status === 'Completed').length,
    totalMedications: medicationReminders.filter(m => m.patient_id === user?.id).length,
    activeMedications: medicationReminders.filter(m => m.patient_id === user?.id && m.status === 'Active').length,
    avgAdherence: (() => {
      const meds = medicationReminders.filter(m => m.patient_id === user?.id);
      if (meds.length === 0) return 0;
      return Math.round(meds.reduce((acc, m) => acc + (m.adherence_rate || 0), 0) / meds.length);
    })(),
    equipmentRequests: equipmentRequests.filter(e => e.patient_id === user?.id).length,
    pendingEquipment: equipmentRequests.filter(e => e.patient_id === user?.id && e.status === 'Pending').length,
  } : null;

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s+()-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const now = new Date();
      if (dob > now) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveMessage({ type: 'error', text: 'Please fix the errors before saving' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Save to localStorage
      const savedUser = JSON.parse(localStorage.getItem('geriatrics_user') || '{}');
      const updatedUser = {
        ...savedUser,
        name: formData.name,
        nameEn: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('geriatrics_user', JSON.stringify(updatedUser));

      // Refresh session to update user data
      refreshSession?.();

      setIsEditing(false);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const patient = patients.find(p => p.id === user?.id) || {};
    setFormData({
      name: user?.nameEn || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || patient?.phone || '+966 555 123 456',
      address: user?.address || patient?.address || 'Riyadh, Saudi Arabia',
      dateOfBirth: user?.dateOfBirth || patient?.dob || '1950-01-01',
      emergencyContact: user?.emergencyContact || patient?.emergencyContact?.phone || '+966 555 999 888',
      emergencyName: patient?.emergencyContact?.name || '',
      emergencyRelationship: patient?.emergencyContact?.relationship || '',
      bloodType: patient?.bloodType || '',
      medicalConditions: patient?.conditions?.join(', ') || '',
    });
    setErrors({});
    setIsEditing(false);
    setSaveMessage(null);
  };

  const roleColors = {
    patient: 'from-blue-500 to-blue-600',
    family: 'from-green-500 to-green-600',
    doctor: 'from-purple-500 to-purple-600',
    donor: 'from-red-500 to-red-600',
    admin: 'from-gray-700 to-gray-800',
  };

  const roleLabels = {
    patient: language === 'ar' ? 'مريض' : 'Patient',
    family: language === 'ar' ? 'فرد العائلة' : 'Family Member',
    doctor: language === 'ar' ? 'طبيب' : 'Doctor',
    donor: language === 'ar' ? 'متبرع' : 'Donor',
    admin: language === 'ar' ? 'مسؤول' : 'Administrator',
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div
      className={clsx('p-6 max-w-5xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('profile')}
            </h1>
            <p className="text-gray-600 text-sm">
              {language === 'ar' ? 'إدارة المعلومات الشخصية والتفضيلات' : 'Manage your personal information and preferences'}
            </p>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={clsx(
          'mb-6 p-4 rounded-xl border-2 flex items-center gap-3 animate-fadeIn',
          saveMessage.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        )}>
          {saveMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{saveMessage.text}</span>
        </div>
      )}

      {/* Profile Card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className={clsx(
              'w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg bg-gradient-to-br',
              roleColors[user?.role] || 'from-blue-500 to-blue-600'
            )}>
              {formData.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </div>
            {isEditing && (
              <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full border-2 border-gray-200 hover:bg-gray-50 shadow-md transition-all hover:scale-110">
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-gray-600">{formData.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="primary" className="px-3 py-1">
                {roleLabels[user?.role] || 'User'}
              </Badge>
              <Badge variant="success" className="px-3 py-1">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {language === 'ar' ? 'نشط' : 'Active'}
                </span>
              </Badge>
              {user?.role === 'patient' && patientData?.bloodType && (
                <Badge variant="danger" className="px-3 py-1">
                  <Heart className="w-3 h-3 mr-1" />
                  {patientData.bloodType}
                </Badge>
              )}
              {calculateAge(formData.dateOfBirth) && (
                <Badge variant="default" className="px-3 py-1">
                  {calculateAge(formData.dateOfBirth)} {language === 'ar' ? 'سنة' : 'years'}
                </Badge>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing ? (
            <Button
              variant="outline"
              icon={Edit2}
              onClick={() => setIsEditing(true)}
              className="hover:scale-105 transition-transform"
            >
              {language === 'ar' ? 'تعديل الملف' : 'Edit Profile'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSave}
                disabled={isSaving}
                className="hover:scale-105 transition-transform"
              >
                {isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
              </Button>
              <Button
                variant="secondary"
                icon={X}
                onClick={handleCancel}
                disabled={isSaving}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              {language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
            </label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              disabled={!isEditing}
              max={new Date().toISOString().split('T')[0]}
              className={errors.dateOfBirth ? 'border-red-500' : ''}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              {language === 'ar' ? 'العنوان' : 'Address'}
            </label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>

      {/* Emergency Contact Card */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>{language === 'ar' ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}</span>
          </div>
        }
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'اسم جهة الاتصال' : 'Contact Name'}
            </label>
            <Input
              value={formData.emergencyName}
              onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              disabled={!isEditing}
              placeholder={language === 'ar' ? 'اسم الشخص' : 'Person name'}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'العلاقة' : 'Relationship'}
            </label>
            <Input
              value={formData.emergencyRelationship}
              onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
              disabled={!isEditing}
              placeholder={language === 'ar' ? 'مثال: ابن، ابنة' : 'e.g., Son, Daughter'}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <Input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Emergency Quick Actions */}
        {!isEditing && formData.emergencyContact && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="danger"
              onClick={() => window.location.href = `tel:${formData.emergencyContact.replace(/\s/g, '')}`}
              className="w-full md:w-auto"
            >
              <Phone className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'اتصال طوارئ' : 'Call Emergency Contact'}
            </Button>
          </div>
        )}
      </Card>

      {/* Patient Statistics - Only for Patients */}
      {user?.role === 'patient' && patientStats && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>{language === 'ar' ? 'إحصائيات صحتك' : 'Your Health Statistics'}</span>
            </div>
          }
          className="mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{patientStats.totalAppointments}</p>
                  <p className="text-xs text-blue-600 font-medium">{language === 'ar' ? 'إجمالي المواعيد' : 'Total Appointments'}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                {patientStats.upcomingAppointments} {language === 'ar' ? 'قادمة' : 'upcoming'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{patientStats.activeMedications}</p>
                  <p className="text-xs text-green-600 font-medium">{language === 'ar' ? 'الأدوية النشطة' : 'Active Medications'}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600">
                {patientStats.avgAdherence}% {language === 'ar' ? 'التزام' : 'adherence'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{patientStats.completedAppointments}</p>
                  <p className="text-xs text-purple-600 font-medium">{language === 'ar' ? 'زيارات مكتملة' : 'Completed Visits'}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">{patientStats.equipmentRequests}</p>
                  <p className="text-xs text-orange-600 font-medium">{language === 'ar' ? 'طلبات المعدات' : 'Equipment Requests'}</p>
                </div>
              </div>
              {patientStats.pendingEquipment > 0 && (
                <div className="mt-2 text-xs text-orange-600">
                  {patientStats.pendingEquipment} {language === 'ar' ? 'قيد الانتظار' : 'pending'}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Account Information */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <span>{language === 'ar' ? 'معلومات الحساب' : 'Account Information'}</span>
          </div>
        }
        className="mb-6"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">{language === 'ar' ? 'نوع الحساب' : 'Account Type'}</p>
              <p className="text-sm text-gray-600">{roleLabels[user?.role]}</p>
            </div>
            <Badge variant="primary">{user?.role}</Badge>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">{language === 'ar' ? 'عضو منذ' : 'Member Since'}</p>
              <p className="text-sm text-gray-600">{formatDate(user?.createdAt || '2024-01-15')}</p>
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">{language === 'ar' ? 'حالة الحساب' : 'Account Status'}</p>
              <p className="text-sm text-gray-600">{language === 'ar' ? 'نشط ومتحقق منه' : 'Active and verified'}</p>
            </div>
            <Badge variant="success">
              <CheckCircle className="w-3 h-3 mr-1" />
              {language === 'ar' ? 'متحقق' : 'Verified'}
            </Badge>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium text-gray-900">{language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login'}</p>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'اليوم في ' : 'Today at '}{new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Actions */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <span>{language === 'ar' ? 'الأمان' : 'Security'}</span>
          </div>
        }
      >
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors">
            <Shield className="w-4 h-4 mr-3" />
            {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
          </Button>
          <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:border-purple-300 transition-colors">
            <Shield className="w-4 h-4 mr-3" />
            {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
          </Button>
          <Button variant="outline" className="w-full justify-start hover:bg-green-50 hover:border-green-300 transition-colors">
            <FileText className="w-4 h-4 mr-3" />
            {language === 'ar' ? 'تحميل البيانات الشخصية' : 'Download Personal Data'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;

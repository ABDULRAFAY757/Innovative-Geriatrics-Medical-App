import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';
import { Card, Button, Input, Badge } from '../shared/UIComponents';
import { clsx } from 'clsx';

const Profile = ({ user }) => {
  const { t, isRTL } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+966 555 123 456',
    address: user?.address || 'Riyadh, Saudi Arabia',
    dateOfBirth: user?.dateOfBirth || '1950-01-01',
    emergencyContact: user?.emergencyContact || '+966 555 999 888',
  });

  const handleSave = () => {
    // Save to localStorage
    const savedUser = JSON.parse(localStorage.getItem('geriatrics_user') || '{}');
    const updatedUser = { ...savedUser, ...formData };
    localStorage.setItem('geriatrics_user', JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '+966 555 123 456',
      address: user?.address || 'Riyadh, Saudi Arabia',
      dateOfBirth: user?.dateOfBirth || '1950-01-01',
      emergencyContact: user?.emergencyContact || '+966 555 999 888',
    });
    setIsEditing(false);
  };

  const roleColors = {
    patient: 'bg-blue-600',
    family: 'bg-green-600',
    doctor: 'bg-purple-600',
    donor: 'bg-red-600',
  };

  const roleLabels = {
    patient: 'Patient',
    family: 'Family Member',
    doctor: 'Doctor',
    donor: 'Donor',
  };

  return (
    <div
      className={clsx('p-6 max-w-4xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('profile')}</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className={clsx(
              'w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold',
              roleColors[user?.role] || 'bg-blue-600'
            )}>
              {formData.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border-2 border-gray-200 hover:bg-gray-50">
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-gray-600">{formData.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="primary">{roleLabels[user?.role] || 'User'}</Badge>
              <Badge variant="success">Active</Badge>
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing ? (
            <Button
              variant="outline"
              icon={Edit2}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="secondary"
                icon={X}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date of Birth
            </label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Address
            </label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Emergency Contact
            </label>
            <Input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card title="Account Information">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Account Type</p>
              <p className="text-sm text-gray-600">{roleLabels[user?.role]}</p>
            </div>
            <Badge variant="primary">{user?.role}</Badge>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Member Since</p>
              <p className="text-sm text-gray-600">January 2024</p>
            </div>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Account Status</p>
              <p className="text-sm text-gray-600">Active and verified</p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium text-gray-900">Last Login</p>
              <p className="text-sm text-gray-600">Today at {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Actions */}
      <Card title="Security" className="mt-6">
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Download Personal Data
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;

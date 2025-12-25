import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  Heart,
  Search,
  Download,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Card, Table, Badge, Button, Input } from '../shared/UIComponents';
import { clsx } from 'clsx';

const DonorDonations = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { donations, equipmentRequests } = useApp();

  const donorId = user?.id || 'd1';
  const myDonations = donations.filter(d => d.donor_id === donorId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredDonations = myDonations.filter(donation => {
    const request = equipmentRequests.find(r => r.id === donation.equipment_request_id);
    const equipmentName = language === 'ar' ? request?.equipment_name_ar : request?.equipment_name;
    const matchesSearch = equipmentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'completed' && donation.status === 'Completed') ||
      (filterStatus === 'processing' && donation.status === 'Processing');
    return matchesSearch && matchesFilter;
  });

  const totalDonated = myDonations.reduce((acc, d) => acc + d.amount, 0);
  const completedCount = myDonations.filter(d => d.status === 'Completed').length;
  const patientsHelped = new Set(myDonations.map(d => {
    const req = equipmentRequests.find(r => r.id === d.equipment_request_id);
    return req?.patient_id;
  })).size;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusColors = {
    Completed: 'success',
    Processing: 'info',
    Pending: 'warning',
  };

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('my_donations')}</h1>
        <p className="text-gray-600 mt-1">Track your generous contributions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Donated</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalDonated.toLocaleString()} {t('sar')}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{myDonations.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Patients Helped</p>
              <p className="text-2xl font-bold text-gray-900">{patientsHelped}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </Button>
            <Button
              variant={filterStatus === 'processing' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('processing')}
            >
              Processing
            </Button>
          </div>
        </div>
      </Card>

      {/* Donations Table */}
      <Card title="Donation History">
        {filteredDonations.length > 0 ? (
          <Table
            columns={[
              {
                header: t('date'),
                render: (row) => formatDate(row.created_at)
              },
              {
                header: t('equipment'),
                render: (row) => {
                  const request = equipmentRequests.find(r => r.id === row.equipment_request_id);
                  return language === 'ar' ? request?.equipment_name_ar : request?.equipment_name;
                }
              },
              {
                header: 'Patient',
                render: (row) => {
                  const request = equipmentRequests.find(r => r.id === row.equipment_request_id);
                  return request?.patient_name;
                }
              },
              {
                header: t('amount'),
                render: (row) => (
                  <span className="font-semibold text-green-600">
                    {row.amount} {t('sar')}
                  </span>
                )
              },
              {
                header: t('payment_method'),
                accessor: 'payment_method'
              },
              {
                header: t('status'),
                render: (row) => (
                  <Badge variant={statusColors[row.status]}>{row.status}</Badge>
                )
              },
              {
                header: 'Receipt',
                render: (row) => (
                  <Button variant="ghost" size="sm" icon={Download}>
                    {row.receipt_number}
                  </Button>
                )
              }
            ]}
            data={filteredDonations}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No donations yet</p>
            <p className="text-sm">Start making a difference today!</p>
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      {filteredDonations.length > 0 && (
        <Card title="Recent Donation Activity" className="mt-6">
          <div className="space-y-4">
            {filteredDonations.slice(0, 5).map((donation) => {
              const request = equipmentRequests.find(r => r.id === donation.equipment_request_id);
              return (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      'p-2 rounded-full',
                      donation.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'
                    )}>
                      {donation.status === 'Completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'ar' ? request?.equipment_name_ar : request?.equipment_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        For {request?.patient_name} • {formatDate(donation.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {donation.amount} {t('sar')}
                    </p>
                    <Badge variant={statusColors[donation.status]} size="sm">
                      {donation.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Impact Summary */}
      <Card title="Your Impact" className="mt-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {totalDonated.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">SAR Donated</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {myDonations.length}
              </div>
              <p className="text-sm text-gray-600">Equipment Provided</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {patientsHelped}
              </div>
              <p className="text-sm text-gray-600">Patients Helped</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-green-200 mt-6">
            <p className="text-sm text-gray-700">
              <strong className="text-green-700">Thank you!</strong> Your generosity has helped elderly patients
              in Saudi Arabia access essential medical equipment and improve their quality of life.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DonorDonations;

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  ChevronRight,
  Gift,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  getDonorById,
  getDonationsByDonor,
  patients
} from '../../data/mockData';
import { StatCard, Card, Table, Badge, Button, Input, Tabs, Alert } from '../shared/UIComponents';
import PaymentModal from '../shared/PaymentModal';
import { clsx } from 'clsx';

const DonorDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const {
    equipmentRequests,
    donations,
    makeDonation
  } = useApp();

  const [donor, setDonor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('marketplace');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const donorData = getDonorById(user?.id || 'd1');
    setDonor(donorData);
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDonate = (request) => {
    setSelectedRequest(request);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    // Create donation record
    const donationData = {
      donor_id: donor?.id || 'd1',
      donor_name: donor?.name || 'Anonymous',
      equipment_request_id: selectedRequest.id,
      amount: selectedRequest.estimated_cost,
      payment_method: paymentData.paymentMethod,
      card_type: paymentData.cardType,
      card_last4: paymentData.cardNumber.slice(-4),
      transaction_id: paymentData.transactionId,
    };

    makeDonation(donationData);
    setShowPayment(false);
    setSelectedRequest(null);
  };

  const categories = ['all', 'Mobility', 'Monitoring', 'Safety', 'Home Care'];
  const urgencies = ['all', 'High', 'Medium', 'Low'];

  // Get pending equipment requests
  const pendingRequests = equipmentRequests.filter(
    r => r.status === 'Pending' || r.status === 'In Progress'
  );

  // Get donor's donations
  const myDonations = donations.filter(d => d.donor_id === (donor?.id || 'd1'));

  const filteredRequests = pendingRequests.filter(r => {
    const matchesSearch = (language === 'ar' ? r.equipment_name_ar : r.equipment_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const statusColors = {
    Pending: 'warning',
    'In Progress': 'info',
    Completed: 'success',
    Fulfilled: 'success',
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
  };

  const categoryIcons = {
    Mobility: '🦽',
    Monitoring: '📊',
    Safety: '🛡️',
    'Home Care': '🏠',
  };

  const totalDonated = myDonations.reduce((acc, d) => acc + d.amount, 0);
  const patientsHelped = new Set(myDonations.map(d => {
    const req = equipmentRequests.find(r => r.id === d.equipment_request_id);
    return req?.patient_id;
  })).size;

  if (!donor) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  const tabs = [
    { id: 'marketplace', label: t('equipment_marketplace') },
    { id: 'donations', label: t('my_donations') },
    { id: 'impact', label: t('impact_statistics') },
  ];

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcome')}, {language === 'ar' ? donor.nameAr : donor.name}!
        </h1>
        <p className="text-gray-600 mt-1">{t('donor_dashboard_subtitle')}</p>
      </div>

      {/* Donor Profile Card */}
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-4 bg-red-100 rounded-xl">
            <Heart className="w-12 h-12 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'ar' ? donor.nameAr : donor.name}
              </h2>
              {donor.verified && (
                <Badge variant="success" size="sm">✓ Verified</Badge>
              )}
            </div>
            <p className="text-gray-600">{donor.type}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span>{donor.email}</span>
              <span>•</span>
              <span>Member since {formatDate(donor.joined_at)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{t('total_donated')}</p>
            <p className="text-2xl font-bold text-green-600">
              {totalDonated.toLocaleString()} {t('sar')}
            </p>
            <p className="text-sm text-gray-500">{myDonations.length} donations</p>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t('total_donated')}
          value={`${totalDonated.toLocaleString()} ${t('sar')}`}
          icon={DollarSign}
          color="green"
          subtitle="Your contributions"
        />
        <StatCard
          title={t('patients_helped')}
          value={patientsHelped}
          icon={Users}
          color="blue"
          subtitle="Lives impacted"
        />
        <StatCard
          title={t('pending_requests')}
          value={pendingRequests.length}
          icon={Package}
          color="orange"
          subtitle="Awaiting support"
        />
        <StatCard
          title={t('my_donations')}
          value={myDonations.length}
          icon={Heart}
          color="red"
          subtitle="Completed"
        />
      </div>

      {/* Urgent Requests Alert */}
      {pendingRequests.filter(r => r.urgency === 'High').length > 0 && (
        <Alert type="warning" title="Urgent Requests" className="mb-6">
          <div className="flex items-center justify-between">
            <span>
              {pendingRequests.filter(r => r.urgency === 'High').length} high-priority
              equipment requests need your support!
            </span>
            <Button variant="warning" size="sm" onClick={() => setUrgencyFilter('High')}>
              View Urgent
            </Button>
          </div>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Input
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
                className="w-64"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {urgencies.map(urg => (
                  <option key={urg} value={urg}>
                    {urg === 'all' ? 'All Urgencies' : `${urg} Priority`}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => {
                const patient = patients.find(p => p.id === request.patient_id);
                return (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl">{categoryIcons[request.category]}</span>
                      <Badge variant={statusColors[request.urgency]} size="sm">
                        {request.urgency} Priority
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {language === 'ar' ? request.equipment_name_ar : request.equipment_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{request.description}</p>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500">Requested for</p>
                      <p className="font-medium text-gray-900">{request.patient_name}</p>
                      <p className="text-xs text-gray-500 mt-1">{request.medical_justification}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Needed</p>
                        <p className="text-xl font-bold text-gray-900">
                          {request.estimated_cost} {t('sar')}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        icon={Heart}
                        onClick={() => handleDonate(request)}
                      >
                        {t('donate_now')}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No equipment requests found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}

        {/* My Donations Tab */}
        {activeTab === 'donations' && (
          <Card>
            {myDonations.length > 0 ? (
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
                      <Button variant="ghost" size="sm">
                        {row.receipt_number}
                      </Button>
                    )
                  }
                ]}
                data={myDonations}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No donations yet</p>
                <p className="text-sm">Start making a difference today!</p>
              </div>
            )}
          </Card>
        )}

        {/* Impact Statistics Tab */}
        {activeTab === 'impact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Your Impact Summary">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Contribution</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalDonated.toLocaleString()} {t('sar')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Patients Helped</p>
                    <p className="text-2xl font-bold text-gray-900">{patientsHelped}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Equipment Provided</p>
                    <p className="text-2xl font-bold text-gray-900">{myDonations.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Donation Streak</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {myDonations.length} donations
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Community Impact">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-lg font-semibold text-blue-900">
                    Total Platform Donations
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {donations.reduce((acc, d) => acc + d.amount, 0).toLocaleString()} {t('sar')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {equipmentRequests.filter(r => r.status === 'Fulfilled').length}
                    </p>
                    <p className="text-sm text-gray-500">Requests Fulfilled</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {equipmentRequests.filter(r => r.status === 'Pending').length}
                    </p>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Thank you!</strong> Your generosity has helped elderly patients
                    in Saudi Arabia access essential medical equipment and improve their quality of life.
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Recent Donation Activity" className="lg:col-span-2">
              {myDonations.length > 0 ? (
                <div className="space-y-4">
                  {myDonations.slice(0, 5).map((donation) => {
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
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No donation activity yet</p>
                  <p className="text-sm">Make your first donation to see it here!</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => {
          setShowPayment(false);
          setSelectedRequest(null);
        }}
        amount={selectedRequest?.estimated_cost || 0}
        description={`Donation for ${language === 'ar' ? selectedRequest?.equipment_name_ar : selectedRequest?.equipment_name}`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default DonorDashboard;

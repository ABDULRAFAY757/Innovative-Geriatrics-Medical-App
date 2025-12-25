import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  Heart,
  Search,
  Package,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  Download,
  Gift,
  Users,
  Sparkles
} from 'lucide-react';
import { Card, Badge, Button, Input, Pagination, StatCard } from '../shared/UIComponents';
import PaymentModal from '../shared/PaymentModal';
import { clsx } from 'clsx';

/**
 * Charity Centre - Accessible by Doctor and Family roles
 * Allows viewing equipment requests and making donations to help patients
 */
const CharityCentre = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { equipmentRequests, makeDonation, donations } = useApp();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'donations'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Get user's donation ID (using their user ID)
  const donorId = user?.id || 'anonymous';

  // Filter pending equipment requests
  const pendingRequests = equipmentRequests.filter(
    r => r.status === 'Pending' || r.status === 'In Progress'
  );

  const filteredRequests = pendingRequests.filter(r => {
    const equipmentName = (language === 'ar' ? r.equipment_name_ar : r.equipment_name) || r.equipment_name || '';
    const matchesSearch = equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  // Get user's donations
  const myDonations = donations.filter(d => d.donor_id === donorId);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };
  const resetPage = () => setCurrentPage(1);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    resetPage();
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    resetPage();
  };

  const handleUrgencyChange = (urgency) => {
    setUrgencyFilter(urgency);
    resetPage();
  };

  const categories = ['all', 'Mobility', 'Monitoring', 'Safety', 'Home Care'];
  const urgencies = ['all', 'High', 'Medium', 'Low'];

  const handleDonate = (request) => {
    setSelectedRequest(request);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    const donationData = {
      donor_id: donorId,
      donor_name: user?.nameEn || user?.name || 'Anonymous Donor',
      donor_role: user?.role,
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

  const urgencyColors = {
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

  const statusColors = {
    Completed: 'success',
    Processing: 'info',
    Pending: 'warning',
  };

  // Stats
  const totalDonated = myDonations.reduce((acc, d) => acc + d.amount, 0);
  const highPriorityCount = pendingRequests.filter(r => r.urgency === 'High').length;
  const patientsHelped = useMemo(() => {
    const uniquePatients = new Set(myDonations.map(d => {
      const req = equipmentRequests.find(r => r.id === d.equipment_request_id);
      return req?.patient_id;
    }));
    return uniquePatients.size;
  }, [myDonations, equipmentRequests]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'ar' ? 'مركز التبرعات الخيرية' : 'Charity Centre'}
            </h1>
            <p className="text-gray-600">
              {language === 'ar'
                ? 'ساعد المرضى المسنين بالحصول على المعدات الطبية اللازمة'
                : 'Help elderly patients access essential medical equipment'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title={language === 'ar' ? 'طلبات متاحة' : 'Available Requests'}
          value={pendingRequests.length}
          icon={Package}
          color="blue"
          subtitle={language === 'ar' ? 'تحتاج دعمك' : 'Need your support'}
        />
        <StatCard
          title={language === 'ar' ? 'أولوية عالية' : 'High Priority'}
          value={highPriorityCount}
          icon={Sparkles}
          color="red"
          subtitle={language === 'ar' ? 'عاجل' : 'Urgent'}
        />
        <StatCard
          title={language === 'ar' ? 'تبرعاتي' : 'My Donations'}
          value={myDonations.length}
          icon={Gift}
          color="green"
          subtitle={`${totalDonated.toLocaleString()} ${t('sar')}`}
        />
        <StatCard
          title={language === 'ar' ? 'مرضى تمت مساعدتهم' : 'Patients Helped'}
          value={patientsHelped}
          icon={Users}
          color="purple"
          subtitle={language === 'ar' ? 'شكراً لك' : 'Thank you'}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'requests' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('requests')}
          icon={Package}
        >
          {language === 'ar' ? 'طلبات المعدات' : 'Equipment Requests'}
        </Button>
        <Button
          variant={activeTab === 'donations' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('donations')}
          icon={Heart}
        >
          {language === 'ar' ? 'تبرعاتي' : 'My Donations'}
          {myDonations.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {myDonations.length}
            </span>
          )}
        </Button>
      </div>

      {activeTab === 'requests' ? (
        <>
          {/* Filters */}
          <Card className="mb-6">
            <div className="space-y-4">
              <Input
                placeholder={language === 'ar' ? 'ابحث عن المعدات...' : 'Search equipment...'}
                value={searchTerm}
                onChange={handleSearchChange}
                icon={Search}
              />

              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={categoryFilter === category ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category === 'all' ? (language === 'ar' ? 'الكل' : 'All') : category}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'الأولوية' : 'Urgency'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {urgencies.map(urgency => (
                      <Button
                        key={urgency}
                        variant={urgencyFilter === urgency ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleUrgencyChange(urgency)}
                      >
                        {urgency === 'all' ? (language === 'ar' ? 'الكل' : 'All') : urgency}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Equipment Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.length > 0 ? (
              paginatedRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-3xl">{categoryIcons[request.category] || '📦'}</span>
                    <Badge variant={urgencyColors[request.urgency]} size="sm">
                      {request.urgency} {language === 'ar' ? 'أولوية' : 'Priority'}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {language === 'ar' ? request.equipment_name_ar : request.equipment_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{request.description}</p>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500">
                      {language === 'ar' ? 'مطلوب لـ' : 'Requested for'}
                    </p>
                    <p className="font-medium text-gray-900">{request.patient_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{request.medical_justification}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'المطلوب' : 'Needed'}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {request.estimated_cost} {t('sar')}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      icon={Heart}
                      onClick={() => handleDonate(request)}
                    >
                      {language === 'ar' ? 'تبرع الآن' : 'Donate Now'}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">
                  {language === 'ar' ? 'لا توجد طلبات معدات' : 'No equipment requests found'}
                </p>
                <p className="text-sm">
                  {language === 'ar' ? 'حاول تعديل الفلاتر' : 'Try adjusting your filters'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredRequests.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredRequests.length}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[6, 9, 12, 18]}
                isRTL={isRTL}
                labels={language === 'ar' ? {
                  show: 'عرض',
                  perPage: 'لكل صفحة',
                  of: 'من',
                  first: 'الأولى',
                  previous: 'السابقة',
                  next: 'التالية',
                  last: 'الأخيرة'
                } : {}}
              />
            </div>
          )}
        </>
      ) : (
        /* Donations Tab */
        <>
          {myDonations.length > 0 ? (
            <>
              {/* Donation Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === 'ar' ? 'إجمالي التبرعات' : 'Total Donated'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalDonated.toLocaleString()} {t('sar')}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === 'ar' ? 'عدد التبرعات' : 'Total Donations'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{myDonations.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === 'ar' ? 'مرضى تمت مساعدتهم' : 'Patients Helped'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{patientsHelped}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Donation History */}
              <Card title={language === 'ar' ? 'سجل التبرعات' : 'Donation History'}>
                <div className="space-y-4">
                  {myDonations.map((donation) => {
                    const request = equipmentRequests.find(r => r.id === donation.equipment_request_id);
                    return (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={clsx(
                            'p-3 rounded-full',
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
                              {language === 'ar' ? 'لـ' : 'For'} {request?.patient_name} • {formatDate(donation.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {donation.amount} {t('sar')}
                            </p>
                            <Badge variant={statusColors[donation.status]} size="sm">
                              {donation.status}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm" icon={Download}>
                            {donation.receipt_number}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Thank You Message */}
              <Card className="mt-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'ar' ? 'شكراً لكرمك!' : 'Thank You for Your Generosity!'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {language === 'ar'
                      ? 'تبرعاتك ساعدت المرضى المسنين في المملكة العربية السعودية للحصول على المعدات الطبية الأساسية وتحسين جودة حياتهم.'
                      : 'Your donations have helped elderly patients in Saudi Arabia access essential medical equipment and improve their quality of life.'}
                  </p>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'ar' ? 'لا توجد تبرعات بعد' : 'No Donations Yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {language === 'ar'
                    ? 'ابدأ بإحداث فرق اليوم!'
                    : 'Start making a difference today!'}
                </p>
                <Button variant="primary" icon={Heart} onClick={() => setActiveTab('requests')}>
                  {language === 'ar' ? 'تصفح الطلبات' : 'Browse Requests'}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={selectedRequest?.estimated_cost || 0}
        description={`${language === 'ar' ? 'تبرع لـ' : 'Donation for'} ${language === 'ar' ? selectedRequest?.equipment_name_ar : selectedRequest?.equipment_name}`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CharityCentre;

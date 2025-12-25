import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  Heart,
  Search,
  Package,
  TrendingUp
} from 'lucide-react';
import { Card, Badge, Button, Input, Pagination } from '../shared/UIComponents';
import PaymentModal from '../shared/PaymentModal';
import { clsx } from 'clsx';

const DonorMarketplace = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { equipmentRequests, makeDonation, donations } = useApp();

  const donorId = user?.id || 'd1';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const pendingRequests = equipmentRequests.filter(
    r => r.status === 'Pending' || r.status === 'In Progress'
  );

  const filteredRequests = pendingRequests.filter(r => {
    const matchesSearch = (language === 'ar' ? r.equipment_name_ar : r.equipment_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;
    return matchesSearch && matchesCategory && matchesUrgency;
  });

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

  // Reset page when search/filter changes
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
      donor_name: user?.name || 'Anonymous',
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

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('equipment_marketplace')}</h1>
        <p className="text-gray-600 mt-1">Help elderly patients access essential medical equipment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Requests</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingRequests.filter(r => r.urgency === 'High').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Donations</p>
              <p className="text-2xl font-bold text-gray-900">
                {donations.filter(d => d.donor_id === donorId).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={handleSearchChange}
            icon={Search}
          />

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category === 'all' ? 'All' : category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
              <div className="flex flex-wrap gap-2">
                {urgencies.map(urgency => (
                  <Button
                    key={urgency}
                    variant={urgencyFilter === urgency ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleUrgencyChange(urgency)}
                  >
                    {urgency === 'all' ? 'All' : urgency}
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
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No equipment requests found</p>
            <p className="text-sm">Try adjusting your filters</p>
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={selectedRequest?.estimated_cost || 0}
        description={`Donation for ${language === 'ar' ? selectedRequest?.equipment_name_ar : selectedRequest?.equipment_name}`}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default DonorMarketplace;

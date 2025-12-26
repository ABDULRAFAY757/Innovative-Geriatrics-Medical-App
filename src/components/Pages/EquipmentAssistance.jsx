import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  Heart,
  Search,
  Package,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Gift,
  Users,
  TrendingUp,
  Download,
  Plus
} from 'lucide-react';
import { Card, Badge, Button, Input, Pagination, StatCard, Modal, Select } from '../shared/UIComponents';
import PaymentModal from '../shared/PaymentModal';
import { clsx } from 'clsx';

/**
 * Equipment Assistance Center
 * - Patient: Request equipment and track status
 * - Doctor/Family: View requests (with patient confidentiality) and make full/partial donations
 */
const EquipmentAssistance = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const {
    equipmentRequests,
    createEquipmentRequest,
    makeDonation,
    makePartialDonation,
    donations,
    patients,
    addNotification
  } = useApp();

  const isPatient = user?.role === 'patient';
  const isDonor = user?.role === 'doctor' || user?.role === 'family';

  // Filter options
  const categories = ['all', 'Mobility', 'Respiratory', 'Monitoring', 'Daily Living', 'Other'];
  const urgencies = ['all', 'Low', 'Medium', 'High', 'Critical'];
  const statuses = ['all', 'Pending', 'In Progress', 'Fulfilled', 'Cancelled'];

  const [activeTab, setActiveTab] = useState(isPatient ? 'my-requests' : 'donate');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [showPayment, setShowPayment] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [isPartialPayment, setIsPartialPayment] = useState(false);

  const [newRequest, setNewRequest] = useState({
    equipment_name: '',
    category: 'Mobility',
    description: '',
    urgency: 'Medium',
    estimated_cost: 0,
    medical_justification: '',
  });

  // Get patient's own requests or all pending requests for donors
  const relevantRequests = isPatient
    ? equipmentRequests.filter(r => r.patient_id === user?.id)
    : equipmentRequests.filter(r => r.status !== 'Cancelled');

  // Filter requests
  const filteredRequests = relevantRequests.filter(r => {
    const equipmentName = (language === 'ar' ? r.equipment_name_ar : r.equipment_name) || r.equipment_name || '';
    const matchesSearch = equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (r.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesCategory && matchesUrgency && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + rowsPerPage);

  // Get user's donations (if donor)
  const myDonations = isDonor ? donations.filter(d => d.donor_id === user?.id) : [];

  // Statistics
  const stats = useMemo(() => {
    if (isPatient) {
      const myRequests = relevantRequests;
      return {
        total: myRequests.length,
        pending: myRequests.filter(r => r.status === 'Pending').length,
        inProgress: myRequests.filter(r => r.status === 'In Progress').length,
        fulfilled: myRequests.filter(r => r.status === 'Fulfilled').length,
      };
    } else {
      return {
        available: filteredRequests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length,
        myDonations: myDonations.length,
        totalDonated: myDonations.reduce((sum, d) => sum + d.amount, 0),
        patientsHelped: new Set(myDonations.map(d => d.equipment_request_id)).size,
      };
    }
  }, [relevantRequests, filteredRequests, myDonations, isPatient]);

  // Get anonymous patient name for confidentiality
  const getAnonymousPatientName = (request) => {
    if (isPatient) {
      return request.patient_name;
    }
    // For doctors/family: show anonymous name with patient ID
    const patientData = patients.find(p => p.id === request.patient_id);
    const gender = patientData?.gender || 'male';
    const ageGroup = patientData?.age >= 75 ? 'Senior' : patientData?.age >= 65 ? 'Elder' : 'Adult';
    return language === 'ar'
      ? `${gender === 'male' ? 'مريض' : 'مريضة'} #${request.patient_id.slice(-3)}`
      : `Patient #${request.patient_id.slice(-3)} (${ageGroup})`;
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const handleCreateRequest = () => {
    if (!newRequest.equipment_name || !newRequest.description) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    createEquipmentRequest({
      ...newRequest,
      patient_id: user?.id,
      patient_name: user?.nameAr || user?.name,
    });

    setShowNewRequest(false);
    setNewRequest({
      equipment_name: '',
      category: 'Mobility',
      description: '',
      urgency: 'Medium',
      estimated_cost: 0,
      medical_justification: '',
    });
  };

  const handleDonate = (request, partial = false) => {
    setSelectedRequest(request);
    setIsPartialPayment(partial);
    setPartialAmount('');

    // For partial payment, don't open payment modal yet
    // User needs to enter amount first
    if (!partial) {
      setShowPayment(true);
    }
  };

  const handlePartialAmountConfirm = () => {
    const amount = parseFloat(partialAmount);
    const { totalDonated } = getRequestDonations(selectedRequest.id);
    const remainingAmount = (selectedRequest.estimated_cost || 0) - totalDonated;

    // Validate amount
    if (!amount || amount <= 0) {
      addNotification('error', language === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount');
      return;
    }

    if (amount > remainingAmount) {
      addNotification('error', language === 'ar' ? 'المبلغ يتجاوز المبلغ المتبقي' : 'Amount exceeds remaining amount');
      return;
    }

    // Open payment modal after validation
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    const amount = isPartialPayment
      ? parseFloat(partialAmount)
      : selectedRequest.estimated_cost;

    const donationData = {
      donor_id: user?.id,
      donor_name: user?.nameEn || user?.name || 'Anonymous Donor',
      donor_role: user?.role,
      equipment_request_id: selectedRequest.id,
      amount: amount,
      payment_method: paymentData.paymentMethod,
      card_type: paymentData.cardType,
      is_partial: isPartialPayment,
    };

    let result;
    if (isPartialPayment) {
      result = makePartialDonation(donationData);
    } else {
      result = makeDonation(donationData);
    }

    // Only reset states if donation was successful (not null)
    if (result) {
      // Reset all states
      setShowPayment(false);
      setSelectedRequest(null);
      setPartialAmount('');
      setIsPartialPayment(false);
    } else {
      // Donation failed validation, close payment modal but keep selection
      setShowPayment(false);
    }
  };

  // Get total donations for a request
  const getRequestDonations = (requestId) => {
    const requestDonations = donations.filter(d => d.equipment_request_id === requestId);
    const totalDonated = requestDonations.reduce((sum, d) => sum + d.amount, 0);
    return { donations: requestDonations, totalDonated };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'warning', icon: Clock, label: language === 'ar' ? 'قيد الانتظار' : 'Pending' },
      'In Progress': { color: 'info', icon: TrendingUp, label: language === 'ar' ? 'قيد التنفيذ' : 'In Progress' },
      'Fulfilled': { color: 'success', icon: CheckCircle, label: language === 'ar' ? 'مكتمل' : 'Fulfilled' },
      'Cancelled': { color: 'error', icon: XCircle, label: language === 'ar' ? 'ملغى' : 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <Badge variant={config.color} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      'High': { color: 'error', label: language === 'ar' ? 'عالي' : 'High' },
      'Medium': { color: 'warning', label: language === 'ar' ? 'متوسط' : 'Medium' },
      'Low': { color: 'success', label: language === 'ar' ? 'منخفض' : 'Low' },
    };

    const config = urgencyConfig[urgency] || urgencyConfig['Medium'];
    return <Badge variant={config.color}>{config.label}</Badge>;
  };

  return (
    <div className={clsx('space-y-6', isRTL && 'rtl')}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isPatient
              ? (language === 'ar' ? 'مركز طلبات المعدات' : 'Equipment Assistance Center')
              : (language === 'ar' ? 'مركز التبرعات بالمعدات' : 'Equipment Donation Center')}
          </h1>
          <p className="text-gray-600 mt-1">
            {isPatient
              ? (language === 'ar' ? 'اطلب المعدات الطبية وتتبع طلباتك' : 'Request medical equipment and track your requests')
              : (language === 'ar' ? 'ساعد المرضى من خلال التبرع بالمعدات الطبية' : 'Help patients by donating medical equipment')}
          </p>
        </div>

        {isPatient && (
          <Button
            onClick={() => setShowNewRequest(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg transition-shadow"
          >
            <Plus className="w-5 h-5" />
            {language === 'ar' ? 'طلب معدات جديد' : 'New Equipment Request'}
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isPatient ? (
          <>
            <StatCard
              title={language === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}
              value={stats.total}
              icon={Package}
              trend=""
              trendValue=""
              color="blue"
            />
            <StatCard
              title={language === 'ar' ? 'قيد الانتظار' : 'Pending'}
              value={stats.pending}
              icon={Clock}
              trend=""
              trendValue=""
              color="yellow"
            />
            <StatCard
              title={language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
              value={stats.inProgress}
              icon={TrendingUp}
              trend=""
              trendValue=""
              color="blue"
            />
            <StatCard
              title={language === 'ar' ? 'مكتمل' : 'Fulfilled'}
              value={stats.fulfilled}
              icon={CheckCircle}
              trend=""
              trendValue=""
              color="green"
            />
          </>
        ) : (
          <>
            <StatCard
              title={language === 'ar' ? 'طلبات متاحة' : 'Available Requests'}
              value={stats.available}
              icon={Package}
              trend=""
              trendValue=""
              color="blue"
            />
            <StatCard
              title={language === 'ar' ? 'تبرعاتي' : 'My Donations'}
              value={stats.myDonations}
              icon={Gift}
              trend=""
              trendValue=""
              color="purple"
            />
            <StatCard
              title={language === 'ar' ? 'إجمالي المتبرع' : 'Total Donated'}
              value={`${stats.totalDonated.toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`}
              icon={DollarSign}
              trend=""
              trendValue=""
              color="green"
            />
            <StatCard
              title={language === 'ar' ? 'المرضى المساعدون' : 'Patients Helped'}
              value={stats.patientsHelped}
              icon={Users}
              trend=""
              trendValue=""
              color="blue"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder={language === 'ar' ? 'ابحث عن المعدات...' : 'Search equipment...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                icon={Search}
              />
            </div>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-48"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? (language === 'ar' ? 'جميع الفئات' : 'All Categories') : cat}
                </option>
              ))}
            </Select>

            {/* Urgency Filter */}
            <Select
              value={urgencyFilter}
              onChange={(e) => {
                setUrgencyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-48"
            >
              {urgencies.map(urg => (
                <option key={urg} value={urg}>
                  {urg === 'all' ? (language === 'ar' ? 'جميع الأولويات' : 'All Urgencies') : urg}
                </option>
              ))}
            </Select>

            {/* Status Filter (for patients) */}
            {isPatient && (
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-48"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? (language === 'ar' ? 'جميع الحالات' : 'All Statuses') : status}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>
      </Card>

      {/* Equipment Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedRequests.map(request => {
          const { donations: requestDonations, totalDonated } = getRequestDonations(request.id);
          const estimatedCost = request.estimated_cost || 0;
          const remainingAmount = estimatedCost - totalDonated;
          const fundingProgress = estimatedCost > 0 ? (totalDonated / estimatedCost) * 100 : 0;

          return (
            <Card key={request.id} className="hover:shadow-xl transition-shadow">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {language === 'ar' ? request.equipment_name_ar : request.equipment_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getAnonymousPatientName(request)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 line-clamp-2">
                  {request.description}
                </p>

                {/* Medical Justification */}
                {request.medical_justification && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-gray-700 line-clamp-2">
                      <span className="font-semibold">
                        {language === 'ar' ? 'المبرر الطبي: ' : 'Medical Justification: '}
                      </span>
                      {request.medical_justification}
                    </p>
                  </div>
                )}

                {/* Category & Urgency Badges */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Package className="w-3 h-3" />
                    {request.category}
                  </Badge>
                  {getUrgencyBadge(request.urgency)}
                </div>

                {/* Funding Progress (if donations exist) */}
                {totalDonated > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {language === 'ar' ? 'التمويل' : 'Funding'}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {fundingProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {language === 'ar' ? 'تم جمع' : 'Raised'}: {totalDonated.toLocaleString()} SAR
                      </span>
                      <span>
                        {language === 'ar' ? 'متبقي' : 'Remaining'}: {remainingAmount.toLocaleString()} SAR
                      </span>
                    </div>
                  </div>
                )}

                {/* Cost */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">
                      {language === 'ar' ? 'التكلفة المقدرة' : 'Estimated Cost'}
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {estimatedCost.toLocaleString()} {language === 'ar' ? 'ريال' : 'SAR'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isDonor && request.status !== 'Fulfilled' && request.status !== 'Cancelled' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleDonate(request, false)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white"
                      disabled={remainingAmount <= 0}
                    >
                      <Heart className="w-4 h-4" />
                      {language === 'ar' ? 'تبرع كامل' : 'Donate Full'}
                    </Button>
                    {remainingAmount > 0 && (
                      <Button
                        onClick={() => handleDonate(request, true)}
                        variant="outline"
                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <DollarSign className="w-4 h-4" />
                        {language === 'ar' ? 'تبرع جزئي' : 'Partial'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'ar' ? 'لا توجد طلبات' : 'No Requests Found'}
            </h3>
            <p className="text-gray-600">
              {language === 'ar'
                ? 'لا توجد طلبات معدات تطابق معايير البحث الخاصة بك'
                : 'No equipment requests match your search criteria'}
            </p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          totalItems={filteredRequests.length}
        />
      )}

      {/* New Request Modal (Patients only) */}
      {showNewRequest && (
        <Modal
          isOpen={showNewRequest}
          onClose={() => setShowNewRequest(false)}
          title={language === 'ar' ? 'طلب معدات جديد' : 'New Equipment Request'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'اسم المعدات' : 'Equipment Name'} *
              </label>
              <Input
                value={newRequest.equipment_name}
                onChange={(e) => setNewRequest({ ...newRequest, equipment_name: e.target.value })}
                placeholder={language === 'ar' ? 'مثال: كرسي متحرك' : 'e.g., Wheelchair'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الفئة' : 'Category'} *
              </label>
              <Select
                value={newRequest.category}
                onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
              >
                <option value="Mobility">{language === 'ar' ? 'التنقل' : 'Mobility'}</option>
                <option value="Monitoring">{language === 'ar' ? 'المراقبة' : 'Monitoring'}</option>
                <option value="Safety">{language === 'ar' ? 'السلامة' : 'Safety'}</option>
                <option value="Home Care">{language === 'ar' ? 'الرعاية المنزلية' : 'Home Care'}</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الأولوية' : 'Urgency'} *
              </label>
              <Select
                value={newRequest.urgency}
                onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
              >
                <option value="High">{language === 'ar' ? 'عالي' : 'High'}</option>
                <option value="Medium">{language === 'ar' ? 'متوسط' : 'Medium'}</option>
                <option value="Low">{language === 'ar' ? 'منخفض' : 'Low'}</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الوصف' : 'Description'} *
              </label>
              <textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                placeholder={language === 'ar' ? 'صف المعدات المطلوبة' : 'Describe the equipment needed'}
                className="w-full h-24 px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'التكلفة المقدرة (ريال)' : 'Estimated Cost (SAR)'} *
              </label>
              <Input
                type="number"
                value={newRequest.estimated_cost}
                onChange={(e) => setNewRequest({ ...newRequest, estimated_cost: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                icon={DollarSign}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'المبرر الطبي' : 'Medical Justification'}
              </label>
              <textarea
                value={newRequest.medical_justification}
                onChange={(e) => setNewRequest({ ...newRequest, medical_justification: e.target.value })}
                placeholder={language === 'ar' ? 'لماذا تحتاج هذه المعدات؟' : 'Why do you need this equipment?'}
                className="w-full h-24 px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateRequest}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                {language === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
              </Button>
              <Button
                onClick={() => setShowNewRequest(false)}
                variant="outline"
                className="flex-1"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Partial Amount Modal */}
      {isPartialPayment && selectedRequest && !showPayment && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedRequest(null);
            setPartialAmount('');
            setIsPartialPayment(false);
          }}
          title={language === 'ar' ? 'تبرع جزئي' : 'Partial Donation'}
        >
          <div className="space-y-4">
            {/* Request Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-gray-900">
                {language === 'ar' ? selectedRequest.equipment_name_ar : selectedRequest.equipment_name}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'للمريض: ' : 'For Patient: '}
                {getAnonymousPatientName(selectedRequest)}
              </p>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'التكلفة الإجمالية: ' : 'Total Cost: '}
                <span className="font-semibold">{(selectedRequest.estimated_cost || 0).toLocaleString()} SAR</span>
              </p>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'المتبقي: ' : 'Remaining: '}
                <span className="font-semibold text-blue-600">
                  {((selectedRequest.estimated_cost || 0) - getRequestDonations(selectedRequest.id).totalDonated).toLocaleString()} SAR
                </span>
              </p>
            </div>

            {/* Partial Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'مبلغ التبرع' : 'Donation Amount'} *
              </label>
              <Input
                type="number"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل المبلغ' : 'Enter amount'}
                icon={DollarSign}
                min="1"
                max={(selectedRequest.estimated_cost || 0) - getRequestDonations(selectedRequest.id).totalDonated}
              />
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ar'
                  ? `الحد الأدنى: 1 ريال | الحد الأقصى: ${((selectedRequest.estimated_cost || 0) - getRequestDonations(selectedRequest.id).totalDonated).toLocaleString()} ريال`
                  : `Minimum: 1 SAR | Maximum: ${((selectedRequest.estimated_cost || 0) - getRequestDonations(selectedRequest.id).totalDonated).toLocaleString()} SAR`
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePartialAmountConfirm}
                disabled={!partialAmount || parseFloat(partialAmount) <= 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                {language === 'ar' ? 'المتابعة للدفع' : 'Continue to Payment'}
              </Button>
              <Button
                onClick={() => {
                  setSelectedRequest(null);
                  setPartialAmount('');
                  setIsPartialPayment(false);
                }}
                variant="outline"
                className="flex-1"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      {showPayment && selectedRequest && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            setSelectedRequest(null);
            setPartialAmount('');
            setIsPartialPayment(false);
          }}
          onPaymentSuccess={handlePaymentSuccess}
          amount={isPartialPayment ? parseFloat(partialAmount) || 0 : (selectedRequest.estimated_cost || 0)}
          title={language === 'ar' ? 'معلومات الدفع' : 'Payment Information'}
          description={
            isPartialPayment
              ? `${language === 'ar' ? 'تبرع جزئي بمبلغ' : 'Partial donation of'} ${parseFloat(partialAmount).toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`
              : `${language === 'ar' ? 'تبرع كامل بمبلغ' : 'Full donation of'} ${(selectedRequest.estimated_cost || 0).toLocaleString()} ${language === 'ar' ? 'ريال' : 'SAR'}`
          }
        />
      )}
    </div>
  );
};

export default EquipmentAssistance;

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
  XCircle,
  Gift,
  Users,
  TrendingUp,
  Plus,
  AlertTriangle,
  Zap,
  Sparkles,
  ChevronRight,
  Eye,
  Calendar,
  Star,
  Shield,
  ThumbsUp
} from 'lucide-react';
import { Card, Badge, Button, Input, Pagination, Modal, Select } from '../shared/UIComponents';
import PaymentModal from '../shared/PaymentModal';
import { clsx } from 'clsx';

/**
 * Equipment Assistance Center - Enhanced UI
 * - Patient: Request equipment with intuitive form and track status
 * - Doctor/Family: View requests with featured section, donate, and see impact
 */
const EquipmentAssistance = ({ user }) => {
  const { isRTL, language } = useLanguage();
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

  // Category configurations with icons and colors
  const categoryConfig = {
    'Mobility': {
      icon: '🦽',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: language === 'ar' ? 'التنقل' : 'Mobility',
      description: language === 'ar' ? 'كراسي متحركة، مشايات، عكازات' : 'Wheelchairs, walkers, canes'
    },
    'Respiratory': {
      icon: '💨',
      color: 'cyan',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      label: language === 'ar' ? 'التنفس' : 'Respiratory',
      description: language === 'ar' ? 'أجهزة تنفس، أكسجين' : 'Oxygen, CPAP, nebulizers'
    },
    'Monitoring': {
      icon: '📊',
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      label: language === 'ar' ? 'المراقبة' : 'Monitoring',
      description: language === 'ar' ? 'أجهزة قياس الضغط والسكر' : 'BP monitors, glucose meters'
    },
    'Daily Living': {
      icon: '🏠',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: language === 'ar' ? 'الحياة اليومية' : 'Daily Living',
      description: language === 'ar' ? 'أدوات مساعدة منزلية' : 'Home assistance tools'
    },
    'Safety': {
      icon: '🛡️',
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      label: language === 'ar' ? 'السلامة' : 'Safety',
      description: language === 'ar' ? 'أجهزة إنذار، حماية' : 'Alarms, fall prevention'
    },
    'Other': {
      icon: '📦',
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: language === 'ar' ? 'أخرى' : 'Other',
      description: language === 'ar' ? 'معدات طبية أخرى' : 'Other medical equipment'
    }
  };

  // Urgency configurations
  const urgencyConfig = {
    'Critical': {
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      label: language === 'ar' ? 'حرج' : 'Critical',
      description: language === 'ar' ? 'مطلوب فوراً' : 'Needed immediately'
    },
    'High': {
      icon: Zap,
      color: 'orange',
      bgColor: 'bg-orange-50',
      label: language === 'ar' ? 'عالي' : 'High',
      description: language === 'ar' ? 'مطلوب قريباً' : 'Needed soon'
    },
    'Medium': {
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      label: language === 'ar' ? 'متوسط' : 'Medium',
      description: language === 'ar' ? 'يمكن الانتظار' : 'Can wait'
    },
    'Low': {
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      label: language === 'ar' ? 'منخفض' : 'Low',
      description: language === 'ar' ? 'غير عاجل' : 'Not urgent'
    }
  };

  // Quick cost suggestions
  const quickCosts = [
    { value: 500, label: '500 SAR' },
    { value: 1000, label: '1,000 SAR' },
    { value: 2500, label: '2,500 SAR' },
    { value: 5000, label: '5,000 SAR' },
    { value: 10000, label: '10,000 SAR' },
  ];

  // Filter options
  const categories = ['all', ...Object.keys(categoryConfig)];
  const urgencies = ['all', 'Critical', 'High', 'Medium', 'Low'];
  const statuses = ['all', 'Pending', 'In Progress', 'Fulfilled', 'Cancelled'];

  // State
  const [activeTab, setActiveTab] = useState(isDonor ? 'featured' : 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [showPayment, setShowPayment] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [requestErrors, setRequestErrors] = useState({});

  const [newRequest, setNewRequest] = useState({
    equipment_name: '',
    category: '',
    description: '',
    urgency: 'Medium',
    estimated_cost: 0,
    medical_justification: '',
  });

  // Get patient's own requests or all pending requests for donors
  const relevantRequests = isPatient
    ? equipmentRequests.filter(r => r.patient_id === user?.id)
    : equipmentRequests.filter(r => r.status !== 'Cancelled');

  // Featured/urgent requests for donors
  const featuredRequests = useMemo(() => {
    return relevantRequests
      .filter(r => r.status === 'Pending' || r.status === 'In Progress')
      .filter(r => r.urgency === 'Critical' || r.urgency === 'High')
      .slice(0, 3);
  }, [relevantRequests]);

  // Filter requests
  const filteredRequests = relevantRequests.filter(r => {
    const equipmentName = (language === 'ar' ? r.equipment_name_ar : r.equipment_name) || r.equipment_name || '';
    const matchesSearch = equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (r.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    // Tab filtering for donors
    if (isDonor && activeTab === 'featured') {
      return matchesSearch && matchesCategory && (r.urgency === 'Critical' || r.urgency === 'High') &&
             (r.status === 'Pending' || r.status === 'In Progress');
    }

    return matchesSearch && matchesCategory && matchesUrgency && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + rowsPerPage);

  // Statistics
  const stats = useMemo(() => {
    const userDonations = isDonor ? donations.filter(d => d.donor_id === user?.id) : [];

    if (isPatient) {
      const myRequests = relevantRequests;
      const totalFunded = myRequests.reduce((sum, r) => {
        const { totalDonated } = getRequestDonationsInternal(r.id);
        return sum + totalDonated;
      }, 0);
      return {
        total: myRequests.length,
        pending: myRequests.filter(r => r.status === 'Pending').length,
        inProgress: myRequests.filter(r => r.status === 'In Progress').length,
        fulfilled: myRequests.filter(r => r.status === 'Fulfilled').length,
        totalFunded,
      };
    } else {
      const urgentCount = relevantRequests.filter(r =>
        (r.urgency === 'Critical' || r.urgency === 'High') &&
        (r.status === 'Pending' || r.status === 'In Progress')
      ).length;
      return {
        available: filteredRequests.filter(r => r.status === 'Pending' || r.status === 'In Progress').length,
        urgent: urgentCount,
        myDonations: userDonations.length,
        totalDonated: userDonations.reduce((sum, d) => sum + d.amount, 0),
        patientsHelped: new Set(userDonations.map(d => d.equipment_request_id)).size,
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantRequests, filteredRequests, donations, isDonor, user?.id, isPatient]);

  // Internal function to avoid dependency issues
  function getRequestDonationsInternal(requestId) {
    const requestDonations = donations.filter(d => d.equipment_request_id === requestId);
    const totalDonated = requestDonations.reduce((sum, d) => sum + d.amount, 0);
    return { donations: requestDonations, totalDonated };
  }

  // Get anonymous patient name for confidentiality
  const getAnonymousPatientName = (request) => {
    if (isPatient) {
      return request.patient_name;
    }
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

  // Validate request form
  const validateRequest = () => {
    const errors = {};
    if (!newRequest.equipment_name.trim()) {
      errors.equipment_name = language === 'ar' ? 'اسم المعدات مطلوب' : 'Equipment name is required';
    }
    if (!newRequest.category) {
      errors.category = language === 'ar' ? 'الفئة مطلوبة' : 'Category is required';
    }
    if (!newRequest.description.trim()) {
      errors.description = language === 'ar' ? 'الوصف مطلوب' : 'Description is required';
    }
    if (!newRequest.estimated_cost || newRequest.estimated_cost <= 0) {
      errors.estimated_cost = language === 'ar' ? 'التكلفة المقدرة مطلوبة' : 'Estimated cost is required';
    }
    setRequestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateRequest = () => {
    if (!validateRequest()) return;

    createEquipmentRequest({
      ...newRequest,
      patient_id: user?.id,
      patient_name: user?.nameAr || user?.name,
    });

    setShowNewRequest(false);
    setNewRequest({
      equipment_name: '',
      category: '',
      description: '',
      urgency: 'Medium',
      estimated_cost: 0,
      medical_justification: '',
    });
    setRequestErrors({});
    addNotification?.('success', language === 'ar' ? 'تم إرسال الطلب بنجاح' : 'Request submitted successfully');
  };

  const handleDonate = (request, partial = false) => {
    setSelectedRequest(request);
    setIsPartialPayment(partial);
    setPartialAmount('');

    if (!partial) {
      setShowPayment(true);
    }
  };

  const handlePartialAmountConfirm = () => {
    const amount = parseFloat(partialAmount);
    const { totalDonated } = getRequestDonationsInternal(selectedRequest.id);
    const remainingAmount = (selectedRequest.estimated_cost || 0) - totalDonated;

    if (!amount || amount <= 0) {
      addNotification('error', language === 'ar' ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount');
      return;
    }

    if (amount > remainingAmount) {
      addNotification('error', language === 'ar' ? 'المبلغ يتجاوز المبلغ المتبقي' : 'Amount exceeds remaining amount');
      return;
    }

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

    if (result) {
      setShowPayment(false);
      setSelectedRequest(null);
      setPartialAmount('');
      setIsPartialPayment(false);
    } else {
      setShowPayment(false);
    }
  };

  const getRequestDonations = (requestId) => {
    return getRequestDonationsInternal(requestId);
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

  // Render equipment card
  const renderEquipmentCard = (request, featured = false) => {
    const { totalDonated, donations: requestDonations } = getRequestDonations(request.id);
    const estimatedCost = request.estimated_cost || 0;
    const remainingAmount = estimatedCost - totalDonated;
    const fundingProgress = estimatedCost > 0 ? (totalDonated / estimatedCost) * 100 : 0;
    const catConfig = categoryConfig[request.category] || categoryConfig['Other'];
    const urgConfig = urgencyConfig[request.urgency] || urgencyConfig['Medium'];
    const UrgencyIcon = urgConfig.icon;

    return (
      <div
        key={request.id}
        className={clsx(
          'relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl',
          featured ? 'border-amber-300 shadow-lg' : 'border-gray-200',
          request.urgency === 'Critical' && 'ring-2 ring-red-400 ring-offset-2'
        )}
      >
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="warning" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {language === 'ar' ? 'مميز' : 'Featured'}
            </Badge>
          </div>
        )}

        {/* Category Header */}
        <div className={clsx('px-5 py-4', catConfig.bgColor)}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{catConfig.icon}</span>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                {language === 'ar' ? request.equipment_name_ar : request.equipment_name}
              </h3>
              <p className="text-sm text-gray-600">{getAnonymousPatientName(request)}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Urgency & Status */}
          <div className="flex items-center justify-between">
            <div className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              urgConfig.bgColor
            )}>
              <UrgencyIcon className={clsx('w-4 h-4', `text-${urgConfig.color}-600`)} />
              <span className={`text-${urgConfig.color}-700`}>{urgConfig.label}</span>
            </div>
            {getStatusBadge(request.status)}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 line-clamp-2">
            {request.description}
          </p>

          {/* Medical Justification */}
          {request.medical_justification && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-gray-700 line-clamp-2">
                <span className="font-semibold text-blue-700">
                  {language === 'ar' ? '📋 المبرر الطبي: ' : '📋 Medical Justification: '}
                </span>
                {request.medical_justification}
              </p>
            </div>
          )}

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'التمويل' : 'Funding Progress'}
              </span>
              <span className={clsx(
                'text-sm font-bold',
                fundingProgress >= 100 ? 'text-green-600' : fundingProgress >= 50 ? 'text-blue-600' : 'text-gray-600'
              )}>
                {fundingProgress.toFixed(0)}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  fundingProgress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  fundingProgress >= 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  'bg-gradient-to-r from-gray-400 to-gray-500'
                )}
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-600 font-medium">
                {language === 'ar' ? 'تم جمع:' : 'Raised:'} {totalDonated.toLocaleString()} SAR
              </span>
              <span className="text-gray-500">
                {language === 'ar' ? 'المطلوب:' : 'Goal:'} {estimatedCost.toLocaleString()} SAR
              </span>
            </div>
          </div>

          {/* Donors count */}
          {requestDonations.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-purple-500" />
              <span>
                {requestDonations.length} {language === 'ar' ? 'متبرع' : requestDonations.length === 1 ? 'donor' : 'donors'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            {isDonor && request.status !== 'Fulfilled' && request.status !== 'Cancelled' && remainingAmount > 0 && (
              <>
                <Button
                  onClick={() => handleDonate(request, false)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                >
                  <Heart className="w-4 h-4" />
                  {language === 'ar' ? `تبرع كامل (${remainingAmount.toLocaleString()} ريال)` : `Donate Full (${remainingAmount.toLocaleString()} SAR)`}
                </Button>
                <Button
                  onClick={() => handleDonate(request, true)}
                  variant="outline"
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <DollarSign className="w-4 h-4" />
                  {language === 'ar' ? 'تبرع بمبلغ مخصص' : 'Donate Custom Amount'}
                </Button>
              </>
            )}

            <Button
              onClick={() => setShowRequestDetails(request)}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900"
            >
              <Eye className="w-4 h-4" />
              {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('p-6 space-y-6 max-w-7xl mx-auto', isRTL && 'rtl')}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isPatient ? (
                <Package className="w-10 h-10" />
              ) : (
                <Gift className="w-10 h-10" />
              )}
              <h1 className="text-3xl font-bold">
                {isPatient
                  ? (language === 'ar' ? 'مركز طلبات المعدات' : 'Equipment Assistance Center')
                  : (language === 'ar' ? 'مركز التبرعات بالمعدات' : 'Equipment Donation Center')}
              </h1>
            </div>
            <p className="text-blue-100 text-lg">
              {isPatient
                ? (language === 'ar' ? 'اطلب المعدات الطبية التي تحتاجها وتتبع حالة طلباتك' : 'Request the medical equipment you need and track your request status')
                : (language === 'ar' ? 'ساعد المرضى المحتاجين من خلال التبرع بالمعدات الطبية' : 'Help patients in need by donating medical equipment')}
            </p>
          </div>

          {isPatient && (
            <Button
              onClick={() => setShowNewRequest(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg px-6 py-3"
            >
              <Plus className="w-5 h-5" />
              {language === 'ar' ? 'طلب معدات جديد' : 'New Equipment Request'}
            </Button>
          )}
        </div>

        {/* Quick Stats in Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {isPatient ? (
            <>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-5 h-5" />
                  <span className="text-sm opacity-90">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}</span>
                </div>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm opacity-90">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</span>
                </div>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm opacity-90">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</span>
                </div>
                <p className="text-3xl font-bold">{stats.inProgress}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm opacity-90">{language === 'ar' ? 'مكتمل' : 'Fulfilled'}</span>
                </div>
                <p className="text-3xl font-bold">{stats.fulfilled}</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm opacity-90">{language === 'ar' ? 'طلبات عاجلة' : 'Urgent Requests'}</span>
                </div>
                <p className="text-3xl font-bold">{stats.urgent}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5" />
                  <span className="text-sm opacity-90">{language === 'ar' ? 'تبرعاتي' : 'My Donations'}</span>
                </div>
                <p className="text-3xl font-bold">{stats.myDonations}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm opacity-90">{language === 'ar' ? 'إجمالي المتبرع' : 'Total Donated'}</span>
                </div>
                <p className="text-3xl font-bold">{stats.totalDonated.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="text-sm opacity-90">{language === 'ar' ? 'مرضى تم مساعدتهم' : 'Patients Helped'}</span>
                </div>
                <p className="text-3xl font-bold">{stats.patientsHelped}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Featured Requests for Donors */}
      {isDonor && featuredRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'ar' ? 'طلبات عاجلة تحتاج مساعدتك' : 'Urgent Requests Need Your Help'}
                </h2>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'هذه الطلبات ذات أولوية عالية' : 'These requests have high priority'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('all')}
              className="text-blue-600"
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRequests.map(request => renderEquipmentCard(request, true))}
          </div>
        </div>
      )}

      {/* Tabs for Donors */}
      {isDonor && (
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => { setActiveTab('featured'); setCurrentPage(1); }}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all',
              activeTab === 'featured'
                ? 'bg-amber-100 text-amber-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            {language === 'ar' ? 'العاجلة' : 'Urgent'}
          </button>
          <button
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all',
              activeTab === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Package className="w-4 h-4 inline mr-2" />
            {language === 'ar' ? 'جميع الطلبات' : 'All Requests'}
          </button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="p-5 space-y-4">
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
                  {cat === 'all'
                    ? (language === 'ar' ? 'جميع الفئات' : 'All Categories')
                    : (categoryConfig[cat]?.label || cat)}
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
                  {urg === 'all'
                    ? (language === 'ar' ? 'جميع الأولويات' : 'All Urgencies')
                    : (urgencyConfig[urg]?.label || urg)}
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
        {paginatedRequests.map(request => renderEquipmentCard(request))}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'ar' ? 'لا توجد طلبات' : 'No Requests Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'ar'
                ? 'لا توجد طلبات معدات تطابق معايير البحث الخاصة بك'
                : 'No equipment requests match your search criteria'}
            </p>
            {isPatient && (
              <Button onClick={() => setShowNewRequest(true)} className="bg-blue-600 text-white">
                <Plus className="w-5 h-5" />
                {language === 'ar' ? 'إنشاء طلب جديد' : 'Create New Request'}
              </Button>
            )}
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

      {/* New Request Modal - Enhanced */}
      <Modal
        isOpen={showNewRequest}
        onClose={() => {
          setShowNewRequest(false);
          setRequestErrors({});
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span>{language === 'ar' ? 'طلب معدات جديد' : 'New Equipment Request'}</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6">
          {/* Category Selection Grid */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {language === 'ar' ? 'نوع المعدات' : 'Equipment Category'} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNewRequest({...newRequest, category: key})}
                  className={clsx(
                    'p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all text-center',
                    newRequest.category === key
                      ? `${config.bgColor} ${config.borderColor} shadow-md`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <span className="text-3xl">{config.icon}</span>
                  <span className={clsx(
                    'text-sm font-medium',
                    newRequest.category === key ? `text-${config.color}-700` : 'text-gray-700'
                  )}>{config.label}</span>
                  <span className="text-xs text-gray-500 line-clamp-1">{config.description}</span>
                </button>
              ))}
            </div>
            {requestErrors.category && <p className="text-red-500 text-xs mt-2">{requestErrors.category}</p>}
          </div>

          {/* Equipment Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'اسم المعدات' : 'Equipment Name'} <span className="text-red-500">*</span>
            </label>
            <Input
              value={newRequest.equipment_name}
              onChange={(e) => setNewRequest({...newRequest, equipment_name: e.target.value})}
              placeholder={language === 'ar' ? 'مثال: كرسي متحرك كهربائي' : 'e.g., Electric Wheelchair'}
              className={requestErrors.equipment_name ? 'border-red-500' : ''}
            />
            {requestErrors.equipment_name && <p className="text-red-500 text-xs mt-1">{requestErrors.equipment_name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'وصف المعدات' : 'Equipment Description'} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newRequest.description}
              onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
              placeholder={language === 'ar' ? 'صف المعدات المطلوبة بالتفصيل...' : 'Describe the equipment needed in detail...'}
              className={clsx(
                'w-full h-24 px-4 py-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all',
                requestErrors.description ? 'border-red-500' : 'border-gray-200'
              )}
            />
            {requestErrors.description && <p className="text-red-500 text-xs mt-1">{requestErrors.description}</p>}
          </div>

          {/* Urgency Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {language === 'ar' ? 'مستوى الأولوية' : 'Urgency Level'} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(urgencyConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNewRequest({...newRequest, urgency: key})}
                    className={clsx(
                      'p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all',
                      newRequest.urgency === key
                        ? `${config.bgColor} border-${config.color}-300 shadow-md`
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon className={clsx('w-5 h-5', `text-${config.color}-600`)} />
                    <span className={clsx(
                      'text-xs font-medium',
                      newRequest.urgency === key ? `text-${config.color}-700` : 'text-gray-600'
                    )}>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimated Cost with Quick Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'التكلفة المقدرة (ريال)' : 'Estimated Cost (SAR)'} <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickCosts.map((cost) => (
                <button
                  key={cost.value}
                  type="button"
                  onClick={() => setNewRequest({...newRequest, estimated_cost: cost.value})}
                  className={clsx(
                    'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                    newRequest.estimated_cost === cost.value
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'border-gray-200 hover:border-green-200 hover:bg-green-50 text-gray-600'
                  )}
                >
                  {cost.label}
                </button>
              ))}
            </div>
            <Input
              type="number"
              value={newRequest.estimated_cost || ''}
              onChange={(e) => setNewRequest({...newRequest, estimated_cost: parseFloat(e.target.value) || 0})}
              placeholder={language === 'ar' ? 'أو أدخل مبلغ مخصص' : 'Or enter custom amount'}
              icon={DollarSign}
              className={requestErrors.estimated_cost ? 'border-red-500' : ''}
            />
            {requestErrors.estimated_cost && <p className="text-red-500 text-xs mt-1">{requestErrors.estimated_cost}</p>}
          </div>

          {/* Medical Justification */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'المبرر الطبي (اختياري)' : 'Medical Justification (Optional)'}
            </label>
            <textarea
              value={newRequest.medical_justification}
              onChange={(e) => setNewRequest({...newRequest, medical_justification: e.target.value})}
              placeholder={language === 'ar' ? 'لماذا تحتاج هذه المعدات؟ هذا يساعد في تسريع الموافقة...' : 'Why do you need this equipment? This helps speed up approval...'}
              className="w-full h-20 px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleCreateRequest}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3"
            >
              <Package className="w-5 h-5" />
              {language === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
            </Button>
            <Button
              onClick={() => {
                setShowNewRequest(false);
                setRequestErrors({});
              }}
              variant="outline"
              className="flex-1 py-3"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        isOpen={!!showRequestDetails}
        onClose={() => setShowRequestDetails(null)}
        title={language === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}
        size="lg"
      >
        {showRequestDetails && (
          <div className="space-y-6">
            {/* Header */}
            <div className={clsx(
              'p-4 rounded-xl',
              categoryConfig[showRequestDetails.category]?.bgColor || 'bg-gray-50'
            )}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{categoryConfig[showRequestDetails.category]?.icon || '📦'}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'ar' ? showRequestDetails.equipment_name_ar : showRequestDetails.equipment_name}
                  </h3>
                  <p className="text-gray-600">{getAnonymousPatientName(showRequestDetails)}</p>
                </div>
              </div>
            </div>

            {/* Status & Urgency */}
            <div className="flex items-center gap-4">
              {getStatusBadge(showRequestDetails.status)}
              <Badge variant={urgencyConfig[showRequestDetails.urgency]?.color === 'red' ? 'error' :
                            urgencyConfig[showRequestDetails.urgency]?.color === 'orange' ? 'warning' : 'default'}>
                {urgencyConfig[showRequestDetails.urgency]?.label || showRequestDetails.urgency}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{language === 'ar' ? 'الوصف' : 'Description'}</h4>
              <p className="text-gray-700">{showRequestDetails.description}</p>
            </div>

            {/* Medical Justification */}
            {showRequestDetails.medical_justification && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {language === 'ar' ? 'المبرر الطبي' : 'Medical Justification'}
                </h4>
                <p className="text-blue-800">{showRequestDetails.medical_justification}</p>
              </div>
            )}

            {/* Funding Progress */}
            {(() => {
              const { totalDonated, donations: reqDonations } = getRequestDonations(showRequestDetails.id);
              const estimated = showRequestDetails.estimated_cost || 0;
              const progress = estimated > 0 ? (totalDonated / estimated) * 100 : 0;
              const remaining = estimated - totalDonated;

              return (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">{language === 'ar' ? 'التمويل' : 'Funding'}</span>
                    <span className="text-2xl font-bold text-blue-600">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'المطلوب' : 'Goal'}</p>
                      <p className="font-bold text-gray-900">{estimated.toLocaleString()} SAR</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'تم جمعه' : 'Raised'}</p>
                      <p className="font-bold text-green-600">{totalDonated.toLocaleString()} SAR</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'المتبقي' : 'Remaining'}</p>
                      <p className="font-bold text-blue-600">{remaining.toLocaleString()} SAR</p>
                    </div>
                  </div>

                  {/* Donors List */}
                  {reqDonations.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        {language === 'ar' ? 'المتبرعون' : 'Donors'} ({reqDonations.length})
                      </h5>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {reqDonations.map((donation, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-white rounded-lg p-2">
                            <span className="text-gray-700">{donation.donor_name}</span>
                            <span className="font-medium text-green-600">{donation.amount.toLocaleString()} SAR</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Request Date */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {language === 'ar' ? 'تاريخ الطلب:' : 'Requested on:'} {new Date(showRequestDetails.created_at || Date.now()).toLocaleDateString()}
            </div>

            {/* Action Buttons for Donors */}
            {isDonor && showRequestDetails.status !== 'Fulfilled' && showRequestDetails.status !== 'Cancelled' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setShowRequestDetails(null);
                    handleDonate(showRequestDetails, false);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white"
                >
                  <Heart className="w-5 h-5" />
                  {language === 'ar' ? 'تبرع كامل' : 'Donate Full'}
                </Button>
                <Button
                  onClick={() => {
                    setShowRequestDetails(null);
                    handleDonate(showRequestDetails, true);
                  }}
                  variant="outline"
                  className="flex-1 border-blue-500 text-blue-600"
                >
                  <DollarSign className="w-5 h-5" />
                  {language === 'ar' ? 'تبرع جزئي' : 'Partial Donation'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Partial Amount Modal */}
      {isPartialPayment && selectedRequest && !showPayment && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedRequest(null);
            setPartialAmount('');
            setIsPartialPayment(false);
          }}
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span>{language === 'ar' ? 'تبرع جزئي' : 'Partial Donation'}</span>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Request Summary */}
            <div className={clsx(
              'p-4 rounded-xl',
              categoryConfig[selectedRequest.category]?.bgColor || 'bg-gray-50'
            )}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{categoryConfig[selectedRequest.category]?.icon || '📦'}</span>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {language === 'ar' ? selectedRequest.equipment_name_ar : selectedRequest.equipment_name}
                  </h4>
                  <p className="text-sm text-gray-600">{getAnonymousPatientName(selectedRequest)}</p>
                </div>
              </div>
            </div>

            {/* Funding Info */}
            {(() => {
              const { totalDonated } = getRequestDonations(selectedRequest.id);
              const remaining = (selectedRequest.estimated_cost || 0) - totalDonated;
              return (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'التكلفة الإجمالية' : 'Total Cost'}</p>
                    <p className="text-lg font-bold text-gray-900">{(selectedRequest.estimated_cost || 0).toLocaleString()} SAR</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-600 mb-1">{language === 'ar' ? 'المتبقي' : 'Remaining'}</p>
                    <p className="text-lg font-bold text-blue-700">{remaining.toLocaleString()} SAR</p>
                  </div>
                </div>
              );
            })()}

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {language === 'ar' ? 'اختر مبلغ سريع' : 'Quick Amount Selection'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1000].map((amount) => {
                  const { totalDonated } = getRequestDonations(selectedRequest.id);
                  const remaining = (selectedRequest.estimated_cost || 0) - totalDonated;
                  const isDisabled = amount > remaining;
                  return (
                    <button
                      key={amount}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setPartialAmount(amount.toString())}
                      className={clsx(
                        'p-3 rounded-xl border-2 text-sm font-medium transition-all',
                        isDisabled
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : partialAmount === amount.toString()
                            ? 'bg-green-50 border-green-300 text-green-700 shadow-md'
                            : 'border-gray-200 hover:border-green-200 hover:bg-green-50 text-gray-600'
                      )}
                    >
                      {amount} SAR
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {language === 'ar' ? 'أو أدخل مبلغ مخصص' : 'Or Enter Custom Amount'}
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handlePartialAmountConfirm}
                disabled={!partialAmount || parseFloat(partialAmount) <= 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3"
              >
                <Heart className="w-5 h-5" />
                {language === 'ar' ? 'المتابعة للدفع' : 'Continue to Payment'}
              </Button>
              <Button
                onClick={() => {
                  setSelectedRequest(null);
                  setPartialAmount('');
                  setIsPartialPayment(false);
                }}
                variant="outline"
                className="flex-1 py-3"
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

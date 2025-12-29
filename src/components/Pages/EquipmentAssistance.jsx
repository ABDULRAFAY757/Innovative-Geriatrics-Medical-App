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
  ThumbsUp,
  Activity,
  Target,
  Award,
  Filter,
  LayoutGrid,
  List,
  ArrowUpRight,
  Stethoscope,
  HeartHandshake
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

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

    if (!amount || isNaN(amount) || amount <= 0) {
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

  // Render equipment card - Enhanced Tabler-style design
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
          'group relative bg-white rounded-2xl overflow-hidden transition-all duration-300',
          'border border-gray-200 hover:border-gray-300',
          'shadow-sm hover:shadow-xl hover:shadow-gray-200/50',
          'hover:-translate-y-1',
          featured && 'ring-2 ring-amber-400 ring-offset-2 shadow-lg shadow-amber-100/50',
          request.urgency === 'Critical' && 'ring-2 ring-red-400 ring-offset-2'
        )}
      >
        {/* Featured/Urgent Ribbon */}
        {(featured || request.urgency === 'Critical') && (
          <div className={clsx(
            'absolute top-0 left-0 right-0 h-1',
            featured ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400' :
            request.urgency === 'Critical' ? 'bg-gradient-to-r from-red-500 via-red-400 to-red-500' : ''
          )}></div>
        )}

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-full text-xs font-bold shadow-lg shadow-amber-200/50 animate-pulse">
              <Star className="w-3.5 h-3.5 fill-current" />
              {language === 'ar' ? 'مميز' : 'Featured'}
            </div>
          </div>
        )}

        {/* Category Header with Gradient */}
        <div className={clsx(
          'relative px-5 py-5',
          'bg-gradient-to-br',
          catConfig.color === 'blue' && 'from-blue-50 to-blue-100/50',
          catConfig.color === 'cyan' && 'from-cyan-50 to-cyan-100/50',
          catConfig.color === 'purple' && 'from-purple-50 to-purple-100/50',
          catConfig.color === 'green' && 'from-green-50 to-green-100/50',
          catConfig.color === 'amber' && 'from-amber-50 to-amber-100/50',
          catConfig.color === 'gray' && 'from-gray-50 to-gray-100/50'
        )}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className={clsx(
              'absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2',
              catConfig.color === 'blue' && 'bg-blue-200',
              catConfig.color === 'cyan' && 'bg-cyan-200',
              catConfig.color === 'purple' && 'bg-purple-200',
              catConfig.color === 'green' && 'bg-green-200',
              catConfig.color === 'amber' && 'bg-amber-200',
              catConfig.color === 'gray' && 'bg-gray-200'
            )}></div>
          </div>

          <div className="relative flex items-start gap-4">
            {/* Icon Container */}
            <div className={clsx(
              'flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center',
              'bg-white shadow-md border border-gray-100',
              'group-hover:scale-110 transition-transform duration-300'
            )}>
              <span className="text-3xl">{catConfig.icon}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">
                {language === 'ar' ? request.equipment_name_ar : request.equipment_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-3.5 h-3.5" />
                <span>{getAnonymousPatientName(request)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Urgency & Status Row */}
          <div className="flex items-center justify-between gap-2">
            <div className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
              'transition-colors',
              urgConfig.color === 'red' && 'bg-red-100 text-red-700',
              urgConfig.color === 'orange' && 'bg-orange-100 text-orange-700',
              urgConfig.color === 'yellow' && 'bg-yellow-100 text-yellow-700',
              urgConfig.color === 'green' && 'bg-green-100 text-green-700'
            )}>
              <UrgencyIcon className="w-3.5 h-3.5" />
              <span>{urgConfig.label}</span>
            </div>
            {getStatusBadge(request.status)}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {request.description}
          </p>

          {/* Medical Justification */}
          {request.medical_justification && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700 line-clamp-2">
                  <span className="font-semibold text-blue-700">
                    {language === 'ar' ? 'المبرر الطبي: ' : 'Medical: '}
                  </span>
                  {request.medical_justification}
                </p>
              </div>
            </div>
          )}

          {/* Funding Progress - Enhanced */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                {language === 'ar' ? 'التمويل' : 'Funding'}
              </span>
              <span className={clsx(
                'text-lg font-bold',
                fundingProgress >= 100 ? 'text-green-600' :
                fundingProgress >= 75 ? 'text-blue-600' :
                fundingProgress >= 50 ? 'text-indigo-600' :
                'text-gray-700'
              )}>
                {fundingProgress.toFixed(0)}%
              </span>
            </div>

            {/* Progress Bar - Enhanced */}
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out',
                  fundingProgress >= 100 ? 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500' :
                  fundingProgress >= 75 ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600' :
                  fundingProgress >= 50 ? 'bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-500' :
                  'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
                )}
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>

            {/* Amount Info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-600">
                  <span className="font-semibold text-green-600">{totalDonated.toLocaleString()}</span>
                  <span className="text-gray-400"> SAR {language === 'ar' ? 'تم جمعه' : 'raised'}</span>
                </span>
              </div>
              <span className="text-gray-500 font-medium">
                {language === 'ar' ? 'من' : 'of'} {estimatedCost.toLocaleString()} SAR
              </span>
            </div>
          </div>

          {/* Donors Info */}
          {requestDonations.length > 0 && (
            <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-xl">
              <div className="flex -space-x-2">
                {requestDonations.slice(0, 3).map((d, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm',
                      i === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      i === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                      'bg-gradient-to-br from-pink-500 to-pink-600'
                    )}
                  >
                    {d.donor_name?.charAt(0) || 'D'}
                  </div>
                ))}
                {requestDonations.length > 3 && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 bg-gray-200 border-2 border-white">
                    +{requestDonations.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-600">
                <span className="font-semibold text-gray-700">{requestDonations.length}</span>
                {' '}{language === 'ar' ? 'متبرع' : requestDonations.length === 1 ? 'donor' : 'donors'}
              </span>
            </div>
          )}

          {/* Action Buttons - Enhanced */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5">
            {isDonor && request.status !== 'Fulfilled' && request.status !== 'Cancelled' && remainingAmount > 0 && (
              <>
                <Button
                  onClick={() => handleDonate(request, false)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all py-2.5 rounded-xl font-semibold"
                >
                  <Heart className="w-4 h-4" />
                  {language === 'ar' ? `تبرع كامل (${remainingAmount.toLocaleString()} ريال)` : `Donate Full (${remainingAmount.toLocaleString()} SAR)`}
                </Button>
                <Button
                  onClick={() => handleDonate(request, true)}
                  variant="outline"
                  className="w-full border-2 border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500 transition-all py-2.5 rounded-xl font-medium"
                >
                  <DollarSign className="w-4 h-4" />
                  {language === 'ar' ? 'تبرع بمبلغ مخصص' : 'Custom Amount'}
                </Button>
              </>
            )}

            <Button
              onClick={() => setShowRequestDetails(request)}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all py-2.5 rounded-xl group/btn"
            >
              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
              <ChevronRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render equipment list item for list view
  const renderEquipmentListItem = (request) => {
    const { totalDonated } = getRequestDonations(request.id);
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
          'group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all',
          request.urgency === 'Critical' && 'border-l-4 border-l-red-500'
        )}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={clsx(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
            catConfig.bgColor, 'border', catConfig.borderColor
          )}>
            <span className="text-2xl">{catConfig.icon}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {language === 'ar' ? request.equipment_name_ar : request.equipment_name}
              </h3>
              {getStatusBadge(request.status)}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {getAnonymousPatientName(request)}
              </span>
              <span className={clsx(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                urgConfig.bgColor, `text-${urgConfig.color}-700`
              )}>
                <UrgencyIcon className="w-3 h-3" />
                {urgConfig.label}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="hidden md:flex flex-col items-end gap-1 min-w-[120px]">
            <span className={clsx(
              'text-lg font-bold',
              fundingProgress >= 100 ? 'text-green-600' : 'text-gray-700'
            )}>
              {fundingProgress.toFixed(0)}%
            </span>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full',
                  fundingProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                )}
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {totalDonated.toLocaleString()} / {estimatedCost.toLocaleString()} SAR
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isDonor && request.status !== 'Fulfilled' && request.status !== 'Cancelled' && remainingAmount > 0 && (
              <Button
                onClick={() => handleDonate(request, false)}
                className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-lg text-sm"
              >
                <Heart className="w-4 h-4" />
                {language === 'ar' ? 'تبرع' : 'Donate'}
              </Button>
            )}
            <Button
              onClick={() => setShowRequestDetails(request)}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('p-6 space-y-6 max-w-7xl mx-auto', isRTL && 'rtl')}>
      {/* Enhanced Header with Animated Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl shadow-blue-500/25">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
          {/* Floating Icons */}
          <Stethoscope className="absolute top-8 right-12 w-8 h-8 text-white/10 animate-bounce" style={{ animationDuration: '3s' }} />
          <HeartHandshake className="absolute bottom-12 right-1/4 w-10 h-10 text-white/10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
          <Package className="absolute top-1/3 right-8 w-6 h-6 text-white/10 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
        </div>

        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {/* Animated Icon Container */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-2xl blur animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                    {isPatient ? (
                      <Package className="w-8 h-8 text-white" />
                    ) : (
                      <Gift className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    {isPatient
                      ? (language === 'ar' ? 'مركز طلبات المعدات' : 'Equipment Assistance Center')
                      : (language === 'ar' ? 'مركز التبرعات بالمعدات' : 'Equipment Donation Center')}
                  </h1>
                  <p className="text-blue-100 text-lg mt-1">
                    {isPatient
                      ? (language === 'ar' ? 'اطلب المعدات الطبية التي تحتاجها وتتبع حالة طلباتك' : 'Request medical equipment and track your request status')
                      : (language === 'ar' ? 'ساعد المرضى المحتاجين من خلال التبرع' : 'Help patients in need through your generous donations')}
                  </p>
                </div>
              </div>
            </div>

            {isPatient && (
              <Button
                onClick={() => setShowNewRequest(true)}
                className="group relative bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-white/20 px-8 py-4 text-lg font-semibold rounded-2xl transition-all hover:scale-105 hover:shadow-2xl"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  {language === 'ar' ? 'طلب معدات جديد' : 'New Equipment Request'}
                </span>
              </Button>
            )}
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {isPatient ? (
              <>
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-white/20 rounded-xl">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.total}</p>
                  <span className="text-sm text-blue-100">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}</span>
                </div>
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-amber-400/30 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="px-2 py-0.5 bg-amber-400/30 rounded-full text-xs text-amber-100 font-medium">
                      {language === 'ar' ? 'نشط' : 'Active'}
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.pending}</p>
                  <span className="text-sm text-blue-100">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</span>
                </div>
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-blue-400/30 rounded-xl">
                      <Activity className="w-5 h-5 text-blue-200" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.inProgress}</p>
                  <span className="text-sm text-blue-100">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</span>
                </div>
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-green-400/30 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-200" />
                    </div>
                    <Award className="w-4 h-4 text-green-300" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.fulfilled}</p>
                  <span className="text-sm text-blue-100">{language === 'ar' ? 'مكتمل' : 'Fulfilled'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-red-400/30 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-200" />
                    </div>
                    <span className="px-2 py-0.5 bg-red-400/30 rounded-full text-xs text-red-100 font-medium animate-pulse">
                      {language === 'ar' ? 'عاجل' : 'Urgent'}
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.urgent}</p>
                  <span className="text-sm text-blue-100">{language === 'ar' ? 'طلبات عاجلة' : 'Urgent Requests'}</span>
                </div>
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-pink-400/30 rounded-xl">
                      <Heart className="w-5 h-5 text-pink-200" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.myDonations}</p>
                  <span className="text-sm text-blue-100">{language === 'ar' ? 'تبرعاتي' : 'My Donations'}</span>
                </div>
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-green-400/30 rounded-xl">
                      <DollarSign className="w-5 h-5 text-green-200" />
                    </div>
                    <Target className="w-4 h-4 text-green-300" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.totalDonated.toLocaleString()}</p>
                  <span className="text-sm text-blue-100">{language === 'ar' ? 'إجمالي التبرعات' : 'Total Donated'}</span>
                </div>
                <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-purple-400/30 rounded-xl">
                      <Users className="w-5 h-5 text-purple-200" />
                    </div>
                    <Award className="w-4 h-4 text-purple-300" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats.patientsHelped}</p>
                  <span className="text-sm text-blue-100">{language === 'ar' ? 'مرضى تم مساعدتهم' : 'Patients Helped'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Featured Requests for Donors - Enhanced */}
      {isDonor && featuredRequests.length > 0 && (
        <div className="relative">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'ar' ? 'طلبات عاجلة تحتاج مساعدتك' : 'Urgent Requests Need Your Help'}
                </h2>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  {language === 'ar' ? 'هذه الطلبات ذات أولوية عالية وتحتاج دعمك الآن' : 'These high-priority requests need your support now'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('all')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1 group"
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Featured Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRequests.map(request => renderEquipmentCard(request, true))}
          </div>

          {/* Motivational Banner */}
          <div className="mt-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <HeartHandshake className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-900">
                  {language === 'ar' ? 'كل تبرع يصنع الفرق!' : 'Every Donation Makes a Difference!'}
                </h4>
                <p className="text-sm text-green-700">
                  {language === 'ar'
                    ? 'ساعد مريضاً اليوم على الحصول على المعدات الطبية التي يحتاجها لحياة أفضل.'
                    : 'Help a patient today get the medical equipment they need for a better quality of life.'}
                </p>
              </div>
              <Award className="w-12 h-12 text-green-300" />
            </div>
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

      {/* Category Quick Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-500 mr-2">
          {language === 'ar' ? 'الفئات:' : 'Categories:'}
        </span>
        <button
          onClick={() => { setCategoryFilter('all'); setCurrentPage(1); }}
          className={clsx(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            categoryFilter === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          )}
        >
          {language === 'ar' ? 'الكل' : 'All'}
        </button>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => { setCategoryFilter(key); setCurrentPage(1); }}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              categoryFilter === key
                ? `${config.bgColor} ${config.borderColor} border-2 shadow-md`
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            )}
          >
            <span>{config.icon}</span>
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        ))}
      </div>

      {/* Enhanced Filters Card */}
      <Card className="overflow-hidden">
        <div className="p-5">
          {/* Search and View Toggle Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن المعدات...' : 'Search equipment by name or description...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm"
              />
            </div>

            {/* Filter Toggle & View Mode */}
            <div className="flex items-center gap-3">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  showFilters
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                )}
              >
                <Filter className="w-4 h-4" />
                {language === 'ar' ? 'الفلاتر' : 'Filters'}
                {(urgencyFilter !== 'all' || statusFilter !== 'all') && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={clsx(
                    'p-2.5 rounded-lg transition-all',
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  title={language === 'ar' ? 'عرض شبكي' : 'Grid View'}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={clsx(
                    'p-2.5 rounded-lg transition-all',
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  title={language === 'ar' ? 'عرض قائمة' : 'List View'}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Urgency Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {language === 'ar' ? 'الأولوية' : 'Urgency'}
                </label>
                <Select
                  value={urgencyFilter}
                  onChange={(e) => {
                    setUrgencyFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  {urgencies.map(urg => (
                    <option key={urg} value={urg}>
                      {urg === 'all'
                        ? (language === 'ar' ? 'جميع الأولويات' : 'All Urgencies')
                        : (urgencyConfig[urg]?.label || urg)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Status Filter (for patients) */}
              {isPatient && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? (language === 'ar' ? 'جميع الحالات' : 'All Statuses') : status}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {/* Clear Filters */}
              {(urgencyFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setUrgencyFilter('all');
                      setStatusFilter('all');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Summary Bar */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {language === 'ar'
              ? `عرض ${paginatedRequests.length} من ${filteredRequests.length} طلب`
              : `Showing ${paginatedRequests.length} of ${filteredRequests.length} requests`}
          </span>
          <span className="text-sm text-gray-500">
            {language === 'ar' ? `صفحة ${currentPage} من ${totalPages || 1}` : `Page ${currentPage} of ${totalPages || 1}`}
          </span>
        </div>
      </Card>

      {/* Equipment Requests - Grid or List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedRequests.map(request => renderEquipmentCard(request))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedRequests.map(request => renderEquipmentListItem(request))}
        </div>
      )}

      {/* Enhanced Empty State */}
      {filteredRequests.length === 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border border-gray-200 p-12">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-100/50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

          <div className="relative text-center max-w-md mx-auto">
            {/* Animated Icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gray-200 rounded-full animate-ping opacity-30"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-lg">
                <Package className="w-12 h-12 text-gray-500" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {language === 'ar' ? 'لا توجد طلبات' : 'No Requests Found'}
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {searchTerm || categoryFilter !== 'all' || urgencyFilter !== 'all' || statusFilter !== 'all'
                ? (language === 'ar'
                    ? 'لا توجد طلبات معدات تطابق معايير البحث الخاصة بك. جرب تعديل الفلاتر.'
                    : 'No equipment requests match your search criteria. Try adjusting your filters.')
                : (language === 'ar'
                    ? 'لا توجد طلبات معدات حالياً. كن أول من يقدم طلباً!'
                    : 'No equipment requests at the moment. Be the first to submit a request!')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isPatient && (
                <Button
                  onClick={() => setShowNewRequest(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 px-6 py-3 rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                  {language === 'ar' ? 'إنشاء طلب جديد' : 'Create New Request'}
                </Button>
              )}
              {(searchTerm || categoryFilter !== 'all' || urgencyFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setUrgencyFilter('all');
                    setStatusFilter('all');
                    setCurrentPage(1);
                  }}
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-xl"
                >
                  {language === 'ar' ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
                </Button>
              )}
            </div>
          </div>
        </div>
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

      {/* Request Details Modal - Enhanced */}
      <Modal
        isOpen={!!showRequestDetails}
        onClose={() => setShowRequestDetails(null)}
        title=""
        size="md"
      >
        {showRequestDetails && (() => {
          const { totalDonated, donations: reqDonations } = getRequestDonations(showRequestDetails.id);
          const estimated = showRequestDetails.estimated_cost || 0;
          const progress = estimated > 0 ? (totalDonated / estimated) * 100 : 0;
          const remaining = estimated - totalDonated;
          const catConfig = categoryConfig[showRequestDetails.category] || categoryConfig['Other'];
          const urgConfig = urgencyConfig[showRequestDetails.urgency] || urgencyConfig['Medium'];
          const UrgencyIcon = urgConfig.icon;

          return (
            <div className="space-y-4">
              {/* Hero Header with Equipment Info */}
              <div className={clsx(
                'relative overflow-hidden rounded-xl p-4',
                catConfig.bgColor
              )}>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative flex items-start gap-3">
                  {/* Equipment Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <span className="text-2xl">{catConfig.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                      {language === 'ar' ? showRequestDetails.equipment_name_ar : showRequestDetails.equipment_name}
                    </h2>
                    <p className="text-gray-600 text-xs mb-2">{getAnonymousPatientName(showRequestDetails)}</p>

                    {/* Status & Urgency Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {getStatusBadge(showRequestDetails.status)}
                      <div className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        urgConfig.bgColor
                      )}>
                        <UrgencyIcon className={`w-3 h-3 text-${urgConfig.color}-600`} />
                        <span className={`text-${urgConfig.color}-700`}>{urgConfig.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </h4>
                <p className="text-sm text-gray-800 leading-relaxed">{showRequestDetails.description || 'No description provided.'}</p>
              </div>

              {/* Medical Justification */}
              {showRequestDetails.medical_justification && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 text-xs mb-0.5">
                        {language === 'ar' ? 'المبرر الطبي' : 'Medical Justification'}
                      </h4>
                      <p className="text-blue-800 text-sm leading-relaxed">{showRequestDetails.medical_justification}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Funding Progress Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 space-y-3">
                {/* Progress Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-900 text-sm">{language === 'ar' ? 'حالة التمويل' : 'Funding Status'}</span>
                  </div>
                  <span className={clsx(
                    'text-xl font-bold',
                    progress >= 100 ? 'text-green-600' : progress >= 50 ? 'text-blue-600' : 'text-gray-700'
                  )}>
                    {progress.toFixed(0)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'absolute top-0 left-0 h-full rounded-full transition-all duration-500',
                      progress >= 100 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      progress >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      'bg-gradient-to-r from-gray-400 to-gray-500'
                    )}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                {/* Amount Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500">{language === 'ar' ? 'المطلوب' : 'Goal'}</p>
                    <p className="text-base font-bold text-gray-900">{estimated.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">SAR</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-green-100">
                    <p className="text-xs text-green-600">{language === 'ar' ? 'تم جمعه' : 'Raised'}</p>
                    <p className="text-base font-bold text-green-600">{totalDonated.toLocaleString()}</p>
                    <p className="text-xs text-green-400">SAR</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-blue-100">
                    <p className="text-xs text-blue-600">{language === 'ar' ? 'المتبقي' : 'Remaining'}</p>
                    <p className="text-base font-bold text-blue-600">{remaining > 0 ? remaining.toLocaleString() : '0'}</p>
                    <p className="text-xs text-blue-400">SAR</p>
                  </div>
                </div>

                {/* Donors List */}
                {reqDonations.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-green-500" />
                        {language === 'ar' ? 'المتبرعون' : 'Donors'}
                      </h5>
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                        {reqDonations.length}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                      {reqDonations.map((donation, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {donation.donor_name?.charAt(0) || 'D'}
                            </div>
                            <span className="text-xs text-gray-700 font-medium">{donation.donor_name}</span>
                          </div>
                          <span className="text-xs font-bold text-green-600">{donation.amount.toLocaleString()} SAR</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No donors yet message */}
                {reqDonations.length === 0 && (
                  <div className="pt-3 border-t border-gray-200 text-center py-3">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">{language === 'ar' ? 'لا يوجد متبرعون بعد' : 'No donors yet'}</p>
                  </div>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(showRequestDetails.created_at || showRequestDetails.request_date || Date.now()).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{catConfig.label}</span>
              </div>

              {/* Action Buttons for Donors */}
              {isDonor && showRequestDetails.status !== 'Fulfilled' && showRequestDetails.status !== 'Cancelled' && remaining > 0 && (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <Button
                    onClick={() => {
                      setShowRequestDetails(null);
                      handleDonate(showRequestDetails, false);
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2.5 text-sm font-semibold"
                  >
                    <Heart className="w-4 h-4" />
                    {language === 'ar' ? `تبرع كامل (${remaining.toLocaleString()} ريال)` : `Donate Full (${remaining.toLocaleString()} SAR)`}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRequestDetails(null);
                      handleDonate(showRequestDetails, true);
                    }}
                    variant="outline"
                    className="w-full border-2 border-blue-400 text-blue-600 hover:bg-blue-50 py-2.5 text-sm font-semibold"
                  >
                    <DollarSign className="w-4 h-4" />
                    {language === 'ar' ? 'تبرع بمبلغ مخصص' : 'Donate Custom Amount'}
                  </Button>
                </div>
              )}

              {/* Fulfilled Message */}
              {showRequestDetails.status === 'Fulfilled' && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                    <p className="font-semibold text-green-800 text-sm">{language === 'ar' ? 'تم تمويل هذا الطلب بالكامل!' : 'Fully Funded!'}</p>
                    <p className="text-xs text-green-600">{language === 'ar' ? 'شكراً لجميع المتبرعين' : 'Thank you to all donors'}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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

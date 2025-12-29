import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Heart,
  Phone,
  MapPin,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  Stethoscope,
  Pill,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Droplets,
  Scale,
  DollarSign,
  CreditCard,
  Receipt,
  ArrowRight,
  FileText,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  UserCheck,
  Timer,
  Zap,
  Shield,
  Video,
  RefreshCw,
  X,
  Eye
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { Card, Badge, Button, Modal, Input } from '../shared/UIComponents';
import { RadialBarChart, AreaChart } from '../shared/Charts';
import HealthSummaryChart from '../shared/HealthSummaryChart';
import { clsx } from 'clsx';

const InteractiveFamilyDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const {
    patients,
    careTasks,
    appointments,
    fallAlerts,
    medicationReminders,
    familyMembers,
    doctors,
    transactions,
    completeCareTask,
    addCareTask,
    deleteCareTask,
    resolveFallAlert,
    addNotification,
  } = useApp();

  const [showAddTask, setShowAddTask] = useState(false);
  const [showResolveAlert, setShowResolveAlert] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    task: '',
    notes: '',
    priority: 'Medium',
    family_member: '',
    due_date: '',
    due_time: '',
    category: 'Medication',
    recurrence: 'none',
  });
  const [taskErrors, setTaskErrors] = useState({});
  const [alertResolution, setAlertResolution] = useState('');

  // Category and time slot configurations
  const categoryOptions = [
    { value: 'Medication', label: language === 'ar' ? 'الدواء' : 'Medication', icon: '💊', color: 'blue' },
    { value: 'Appointment', label: language === 'ar' ? 'موعد' : 'Appointment', icon: '📅', color: 'purple' },
    { value: 'Monitoring', label: language === 'ar' ? 'مراقبة' : 'Monitoring', icon: '📊', color: 'cyan' },
    { value: 'Nutrition', label: language === 'ar' ? 'تغذية' : 'Nutrition', icon: '🥗', color: 'green' },
    { value: 'Exercise', label: language === 'ar' ? 'تمرين' : 'Exercise', icon: '🏃', color: 'orange' },
    { value: 'Personal Care', label: language === 'ar' ? 'العناية الشخصية' : 'Personal Care', icon: '🧴', color: 'pink' },
    { value: 'Other', label: language === 'ar' ? 'أخرى' : 'Other', icon: '📝', color: 'gray' },
  ];

  const quickTimeSlots = [
    { value: '08:00', label: language === 'ar' ? '8:00 ص' : '8:00 AM' },
    { value: '09:00', label: language === 'ar' ? '9:00 ص' : '9:00 AM' },
    { value: '10:00', label: language === 'ar' ? '10:00 ص' : '10:00 AM' },
    { value: '12:00', label: language === 'ar' ? '12:00 م' : '12:00 PM' },
    { value: '14:00', label: language === 'ar' ? '2:00 م' : '2:00 PM' },
    { value: '16:00', label: language === 'ar' ? '4:00 م' : '4:00 PM' },
    { value: '18:00', label: language === 'ar' ? '6:00 م' : '6:00 PM' },
    { value: '20:00', label: language === 'ar' ? '8:00 م' : '8:00 PM' },
  ];

  const quickDateOptions = [
    { value: 'today', label: language === 'ar' ? 'اليوم' : 'Today' },
    { value: 'tomorrow', label: language === 'ar' ? 'غداً' : 'Tomorrow' },
    { value: 'in3days', label: language === 'ar' ? 'بعد 3 أيام' : 'In 3 Days' },
    { value: 'nextweek', label: language === 'ar' ? 'الأسبوع القادم' : 'Next Week' },
  ];

  const recurrenceOptions = [
    { value: 'none', label: language === 'ar' ? 'مرة واحدة' : 'One-time' },
    { value: 'daily', label: language === 'ar' ? 'يومياً' : 'Daily' },
    { value: 'weekly', label: language === 'ar' ? 'أسبوعياً' : 'Weekly' },
    { value: 'monthly', label: language === 'ar' ? 'شهرياً' : 'Monthly' },
  ];

  const getQuickDate = (option) => {
    const today = new Date();
    switch(option) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'tomorrow':
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
      case 'in3days':
        today.setDate(today.getDate() + 3);
        return today.toISOString().split('T')[0];
      case 'nextweek':
        today.setDate(today.getDate() + 7);
        return today.toISOString().split('T')[0];
      default:
        return '';
    }
  };

  // Find which patient this family member is connected to
  const familyMember = familyMembers.find(f => f.id === user?.id);
  const patientId = familyMember?.patient_id || '1';
  const patient = patients.find(p => p.id === patientId);

  const myTasks = careTasks.filter(t => t.patient_id === patientId);
  const myAppointments = appointments.filter(a => a.patient_id === patientId);
  const myMedications = medicationReminders.filter(m => m.patient_id === patientId);

  // Get fall alerts for this patient - sorted by date (newest first)
  const displayAlerts = useMemo(() => {
    return fallAlerts
      .filter(a => a.patient_id === patientId)
      .sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at));
  }, [fallAlerts, patientId]);

  // Get upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return myAppointments
      .filter(a => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);
  }, [myAppointments]);

  // Health trend data
  const healthTrendData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      bloodPressure: {
        systolic: [138, 142, 135, 140, 137, 145, 139],
        diastolic: [88, 90, 85, 87, 86, 92, 88],
      },
      heartRate: [72, 75, 70, 78, 74, 76, 73],
      glucose: [110, 115, 108, 120, 112, 118, 114],
      weight: [78, 78.2, 77.8, 78.1, 77.9, 78, 77.7],
      days,
    };
  }, []);

  const weeklyActivityData = useMemo(() => {
    return [65, 78, 52, 88, 71, 45, 82];
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return {
        label: language === 'ar' ? 'اليوم' : 'Today',
        time: date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        color: 'green',
      };
    } else if (isTomorrow) {
      return {
        label: language === 'ar' ? 'غداً' : 'Tomorrow',
        time: date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        color: 'blue',
      };
    } else {
      return {
        label: date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        color: 'gray',
      };
    }
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Task validation
  const validateTask = () => {
    const errors = {};
    if (!newTask.task.trim()) {
      errors.task = language === 'ar' ? 'الوصف مطلوب' : 'Description is required';
    } else if (newTask.task.trim().length < 3) {
      errors.task = language === 'ar' ? 'الوصف قصير جداً' : 'Description is too short';
    }
    if (!newTask.due_date) {
      errors.due_date = language === 'ar' ? 'تاريخ الاستحقاق مطلوب' : 'Due date is required';
    } else {
      const dueDateStr = newTask.due_time
        ? `${newTask.due_date}T${newTask.due_time}`
        : `${newTask.due_date}T23:59`;
      const dueDate = new Date(dueDateStr);
      const now = new Date();
      if (dueDate < now) {
        errors.due_date = language === 'ar' ? 'لا يمكن أن يكون التاريخ في الماضي' : 'Due date cannot be in the past';
      }
    }
    if (!newTask.due_time) {
      errors.due_time = language === 'ar' ? 'الوقت مطلوب' : 'Time is required';
    }
    if (!newTask.family_member.trim()) {
      errors.family_member = language === 'ar' ? 'يرجى تحديد المسؤول' : 'Please assign someone';
    }
    setTaskErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteTask = (taskId) => {
    completeCareTask(taskId);
    addNotification?.('success', language === 'ar' ? 'تم إكمال المهمة' : 'Task completed successfully');
  };

  const handleDeleteTask = (taskId) => {
    deleteCareTask(taskId);
    // Note: deleteCareTask already shows notification in AppContext
  };

  const handleAddTask = async () => {
    if (!validateTask()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Combine date and time
      const dueDateTime = newTask.due_time
        ? `${newTask.due_date}T${newTask.due_time}:00`
        : `${newTask.due_date}T09:00:00`;

      addCareTask({
        title: newTask.task,
        task: newTask.task,
        description: newTask.notes,
        notes: newTask.notes,
        priority: newTask.priority,
        family_member: newTask.family_member,
        due_date: dueDateTime,
        category: newTask.category,
        recurrence: newTask.recurrence,
        patient_id: patientId,
        family_id: user?.id || 'f1',
        created_at: new Date().toISOString(),
      });
      setShowAddTask(false);
      setNewTask({
        task: '',
        notes: '',
        priority: 'Medium',
        family_member: '',
        due_date: '',
        due_time: '',
        category: 'Medication',
        recurrence: 'none',
      });
      setTaskErrors({});
      addNotification?.('success', language === 'ar' ? 'تمت إضافة المهمة بنجاح' : 'Task added successfully');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert || !alertResolution.trim()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      resolveFallAlert(selectedAlert.id, alertResolution);
      setShowResolveAlert(false);
      setSelectedAlert(null);
      setAlertResolution('');
      addNotification?.('success', language === 'ar' ? 'تم حل التنبيه' : 'Alert resolved successfully');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmergencyCall = (type) => {
    if (type === 'emergency') {
      window.location.href = 'tel:997';
    } else if (type === 'patient' && patient?.phone) {
      window.location.href = `tel:${patient.phone.replace(/\s/g, '')}`;
    }
    setShowEmergencyPanel(false);
  };

  const statusColors = {
    Pending: 'warning',
    Completed: 'success',
    'In Progress': 'info',
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
    Resolved: 'success',
    Critical: 'danger',
    Active: 'danger',
  };

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  const pendingTasks = myTasks.filter(t => t.status === 'Pending').length;
  const unresolvedAlerts = displayAlerts.filter(a => a.status === 'Pending' || a.status === 'Active').length;
  const avgAdherence = myMedications.length > 0
    ? Math.round(myMedications.reduce((acc, m) => acc + (m.adherence_rate || 0), 0) / myMedications.length)
    : 100;

  // Calculate patient age
  const patientAge = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : null;

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Enhanced Welcome Header */}
      <div className="mb-6 animate-fadeIn">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return language === 'ar' ? 'صباح الخير' : 'Good Morning';
                  if (hour < 17) return language === 'ar' ? 'مساء الخير' : 'Good Afternoon';
                  return language === 'ar' ? 'مساء الخير' : 'Good Evening';
                })()}
              </h1>
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <p className="text-gray-600 text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              {language === 'ar' ? 'رعاية' : 'Caring for'} <span className="font-semibold text-green-600">{patient.nameEn || patient.name}</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          {/* Status Badges & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Tasks Badge */}
            <div className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {pendingTasks.length} {language === 'ar' ? 'مهام معلقة' : 'pending tasks'}
                </span>
              </div>
            </div>

            {/* Emergency Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={() => setShowEmergencyPanel(true)}
                className="shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'طوارئ' : 'Emergency'}
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowAddTask(true)}
                className="shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'إضافة مهمة' : 'Add Task'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {unresolvedAlerts > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg animate-pulse">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">
                  {unresolvedAlerts} {language === 'ar' ? 'تنبيه نشط يتطلب اهتمامًا فوريًا' : 'Active Alert(s) - Immediate Attention Required!'}
                </p>
                <p className="text-red-100 text-sm">
                  {language === 'ar' ? 'انقر لمراجعة وحل التنبيهات' : 'Click to review and resolve alerts'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-red-600 transition-all"
              onClick={() => {
                const activeAlert = displayAlerts.find(a => a.status === 'Pending' || a.status === 'Active');
                if (activeAlert) {
                  setSelectedAlert(activeAlert);
                  setShowResolveAlert(true);
                }
              }}
            >
              {language === 'ar' ? 'حل الآن' : 'Resolve Now'}
            </Button>
          </div>
        </div>
      )}

      {/* Patient Overview Card - Tabler Style */}
      <Card className="mb-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Patient Info Section */}
          <div className="flex-1 p-6">
            <div className="flex items-start gap-6">
              {/* Avatar with status indicator */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(patient.nameEn || patient.name || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{patient.nameEn || patient.name}</h2>
                  <Badge variant="success" size="sm">
                    <Activity className="w-3 h-3 mr-1" />
                    {language === 'ar' ? 'نشط' : 'Active'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{patient.gender} {patientAge && `• ${patientAge} ${language === 'ar' ? 'سنة' : 'yrs'}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{patient.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span>{patient.bloodType || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {(patient.medicalConditions || []).map((condition, idx) => (
                    <Badge key={idx} variant="info" size="sm" className="bg-blue-50 text-blue-700 border border-blue-200">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="lg:w-80 bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              {language === 'ar' ? 'نظرة سريعة' : 'Quick Overview'}
            </h3>

            <div className="space-y-4">
              {/* Fall Risk */}
              <div className={clsx(
                'p-4 rounded-xl border-2',
                patient.fallRisk === 'High' ? 'bg-red-50 border-red-200' :
                patient.fallRisk === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={clsx(
                      'w-5 h-5',
                      patient.fallRisk === 'High' ? 'text-red-500' :
                      patient.fallRisk === 'Medium' ? 'text-yellow-500' :
                      'text-green-500'
                    )} />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'خطر السقوط' : 'Fall Risk'}
                    </span>
                  </div>
                  <span className={clsx(
                    'font-bold text-lg',
                    patient.fallRisk === 'High' ? 'text-red-600' :
                    patient.fallRisk === 'Medium' ? 'text-yellow-600' :
                    'text-green-600'
                  )}>
                    {patient.fallRisk}
                  </span>
                </div>
              </div>

              {/* Last Activity */}
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'آخر نشاط' : 'Last Activity'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">5 min ago</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                  onClick={() => patient.phone && (window.location.href = `tel:${patient.phone.replace(/\s/g, '')}`)}
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                >
                  <Video className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid - Simple Card Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('care_tasks')}</p>
              <p className="text-2xl font-bold text-gray-900">{myTasks.length}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-600">
                  {pendingTasks} {language === 'ar' ? 'معلقة' : 'pending'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className={unresolvedAlerts > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${unresolvedAlerts > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${unresolvedAlerts > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('fall_alerts')}</p>
              <p className="text-2xl font-bold text-gray-900">{displayAlerts.length}</p>
              <div className="flex items-center gap-1 mt-1">
                {unresolvedAlerts > 0 ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-xs font-medium text-red-600">
                      {unresolvedAlerts} {language === 'ar' ? 'غير محلولة' : 'unresolved'}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      {language === 'ar' ? 'الكل محلول' : 'All resolved'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('my_appointments')}</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">
                  {upcomingAppointments[0]
                    ? `${language === 'ar' ? 'القادم:' : 'Next:'} ${formatAppointmentDate(upcomingAppointments[0].date).label}`
                    : (language === 'ar' ? 'لا يوجد' : 'None scheduled')
                  }
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className={`${avgAdherence >= 80 ? 'bg-green-50 border-green-200' : avgAdherence >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${avgAdherence >= 80 ? 'bg-green-100' : avgAdherence >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <Pill className={`w-6 h-6 ${avgAdherence >= 80 ? 'text-green-600' : avgAdherence >= 60 ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('adherence_rate')}</p>
              <p className="text-2xl font-bold text-gray-900">{avgAdherence}%</p>
              <div className="flex items-center gap-1 mt-1">
                <Activity className={`w-3.5 h-3.5 ${avgAdherence >= 80 ? 'text-green-600' : avgAdherence >= 60 ? 'text-yellow-600' : 'text-red-600'}`} />
                <span className={`text-xs font-medium ${avgAdherence >= 80 ? 'text-green-600' : avgAdherence >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {myMedications.length} {language === 'ar' ? 'أدوية نشطة' : 'active meds'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Health Summary Chart */}
      <div className="mb-8">
        <HealthSummaryChart patient={patient} language={language} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Care Tasks Card */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span>{t('care_tasks')}</span>
              {pendingTasks > 0 && (
                <Badge variant="warning" size="sm">{pendingTasks}</Badge>
              )}
            </div>
          }
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddTask(true)}>
              {t('add_task')}
            </Button>
          }
        >
          <div className="space-y-3">
            {myTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className={clsx(
                  'p-4 rounded-xl border-2 transition-all hover:shadow-md',
                  task.status === 'Completed'
                    ? 'bg-green-50 border-green-200'
                    : task.priority === 'High'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => task.status !== 'Completed' && handleCompleteTask(task.id)}
                      className={clsx(
                        'p-2 rounded-lg transition-all',
                        task.status === 'Completed'
                          ? 'bg-green-100 cursor-default'
                          : 'bg-gray-100 hover:bg-green-100 cursor-pointer'
                      )}
                    >
                      {task.status === 'Completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={clsx(
                        'font-medium',
                        task.status === 'Completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                      )}>
                        {task.task}
                      </p>
                      {task.notes && (
                        <p className="text-sm text-gray-500 mt-1">{task.notes}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {task.family_member}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColors[task.priority]} size="sm">
                      {task.priority}
                    </Badge>
                    {task.status !== 'Completed' && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {myTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium">{language === 'ar' ? 'لا توجد مهام' : 'No tasks yet'}</p>
                <p className="text-sm text-gray-500 mt-1">{language === 'ar' ? 'أضف مهمة للبدء' : 'Add a task to get started'}</p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setShowAddTask(true)}
                  className="mt-4"
                >
                  {t('add_task')}
                </Button>
              </div>
            )}
          </div>
          {myTasks.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/family/care-tasks')}
              >
                {language === 'ar' ? 'عرض جميع المهام' : 'View All Tasks'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </Card>

        {/* Upcoming Appointments Card */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span>{language === 'ar' ? 'المواعيد القادمة' : 'Upcoming Appointments'}</span>
            </div>
          }
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/family/appointments')}>
              {t('view_all')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <div className="space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => {
                const dateInfo = formatAppointmentDate(apt.date);
                const doctor = doctors?.find(d => d.id === apt.doctor_id);
                return (
                  <div
                    key={apt.id}
                    className={clsx(
                      'p-4 rounded-xl border-2 transition-all hover:shadow-md',
                      dateInfo.color === 'green' ? 'bg-green-50 border-green-200' :
                      dateInfo.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        'flex flex-col items-center justify-center w-16 h-16 rounded-xl',
                        dateInfo.color === 'green' ? 'bg-green-100' :
                        dateInfo.color === 'blue' ? 'bg-blue-100' :
                        'bg-gray-100'
                      )}>
                        <span className={clsx(
                          'text-xs font-semibold uppercase',
                          dateInfo.color === 'green' ? 'text-green-600' :
                          dateInfo.color === 'blue' ? 'text-blue-600' :
                          'text-gray-600'
                        )}>
                          {dateInfo.label}
                        </span>
                        <span className={clsx(
                          'text-lg font-bold',
                          dateInfo.color === 'green' ? 'text-green-700' :
                          dateInfo.color === 'blue' ? 'text-blue-700' :
                          'text-gray-700'
                        )}>
                          {dateInfo.time}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900 truncate">
                            {apt.doctor_name || doctor?.name || 'Doctor'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{apt.specialization || doctor?.specialization}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {apt.type}
                          </span>
                          {apt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {apt.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <Badge variant={statusColors[apt.status] || 'default'} size="sm">
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium">{language === 'ar' ? 'لا توجد مواعيد قادمة' : 'No upcoming appointments'}</p>
                <p className="text-sm text-gray-500 mt-1">{language === 'ar' ? 'ستظهر المواعيد هنا' : 'Appointments will appear here'}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Health Summary Section */}
      <Card title={t('health_summary')} className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              {language === 'ar' ? 'ملخص الأسبوع' : 'Weekly Health Summary'}
            </h4>
            {/* Weekly Activity Bars */}
            <div className="space-y-3">
              {[
                { label: language === 'ar' ? 'الأحد' : 'Sun', tasks: 4, completed: 4, color: 'green' },
                { label: language === 'ar' ? 'الاثنين' : 'Mon', tasks: 5, completed: 5, color: 'green' },
                { label: language === 'ar' ? 'الثلاثاء' : 'Tue', tasks: 6, completed: 4, color: 'yellow' },
                { label: language === 'ar' ? 'الأربعاء' : 'Wed', tasks: 5, completed: 5, color: 'green' },
                { label: language === 'ar' ? 'الخميس' : 'Thu', tasks: 4, completed: 3, color: 'yellow' },
                { label: language === 'ar' ? 'الجمعة' : 'Fri', tasks: 3, completed: 3, color: 'green' },
                { label: language === 'ar' ? 'السبت' : 'Sat', tasks: 4, completed: 2, color: 'red' },
              ].map((day, idx) => {
                const percentage = day.tasks > 0 ? Math.round((day.completed / day.tasks) * 100) : 0;
                const barColor = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';
                const bgColor = percentage >= 80 ? 'bg-green-100' : percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100';
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-medium text-gray-600">{day.label}</span>
                    <div className={`flex-1 h-6 ${bgColor} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full ${barColor} rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{percentage}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {day.completed}/{day.tasks} {language === 'ar' ? 'مهام' : 'tasks'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">{language === 'ar' ? 'ممتاز' : 'Excellent'} (≥80%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-600">{language === 'ar' ? 'جيد' : 'Good'} (60-79%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">{language === 'ar' ? 'يحتاج تحسين' : 'Needs Attention'} (&lt;60%)</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Pill className="w-4 h-4 text-green-500" />
              {language === 'ar' ? 'الالتزام بالأدوية' : 'Medication Adherence'}
            </h4>
            <RadialBarChart
              series={[avgAdherence]}
              labels={[language === 'ar' ? 'الالتزام' : 'Adherence']}
              height={200}
              colors={[avgAdherence >= 80 ? '#22c55e' : avgAdherence >= 60 ? '#f59e0b' : '#ef4444']}
            />
          </div>
        </div>

        {/* Quick Vitals Grid - Simple Card Style */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'ضغط الدم' : 'Blood Pressure'}</p>
                <p className="text-xl font-bold text-gray-900">139/88</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-amber-600">
                    {language === 'ar' ? 'مرتفع قليلاً' : 'Slightly High'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-pink-50 border-pink-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-full">
                <Activity className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'معدل النبض' : 'Heart Rate'}</p>
                <p className="text-xl font-bold text-gray-900">73 bpm</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-600">
                    {language === 'ar' ? 'طبيعي' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-full">
                <Droplets className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'مستوى السكر' : 'Glucose'}</p>
                <p className="text-xl font-bold text-gray-900">114 mg/dL</p>
                <div className="flex items-center gap-1 mt-1">
                  <Eye className="w-3.5 h-3.5 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-600">
                    {language === 'ar' ? 'مراقبة' : 'Monitor'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-cyan-50 border-cyan-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-full">
                <Thermometer className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'درجة الحرارة' : 'Temperature'}</p>
                <p className="text-xl font-bold text-gray-900">36.8°C</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-600">
                    {language === 'ar' ? 'طبيعي' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Scale className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{language === 'ar' ? 'الوزن' : 'Weight'}</p>
                <p className="text-xl font-bold text-gray-900">77.7 kg</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-600">-0.3 kg</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Fall Alerts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fall Detection Alerts */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>{language === 'ar' ? 'تنبيهات السقوط' : 'Fall Detection Alerts'}</span>
              {unresolvedAlerts > 0 && (
                <Badge variant="danger" size="sm" className="animate-pulse">{unresolvedAlerts}</Badge>
              )}
            </div>
          }
          action={
            <Button variant="ghost" size="sm" onClick={() => { navigate('/family/alerts'); window.scrollTo(0, 0); }}>
              {t('view_all')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <div className="space-y-3">
            {displayAlerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={clsx(
                  'p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md',
                  alert.status === 'Resolved' ? 'bg-gray-50 border-gray-200' :
                  alert.severity === 'Critical' ? 'bg-red-50 border-red-300' :
                  'bg-yellow-50 border-yellow-200'
                )}
                onClick={() => {
                  if (alert.status !== 'Resolved') {
                    setSelectedAlert(alert);
                    setShowResolveAlert(true);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={clsx(
                      'p-2 rounded-xl',
                      alert.status === 'Resolved' ? 'bg-green-100' :
                      alert.severity === 'Critical' ? 'bg-red-100' :
                      'bg-yellow-100'
                    )}>
                      {alert.status === 'Resolved' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className={clsx(
                          'w-5 h-5',
                          alert.severity === 'Critical' ? 'text-red-600' : 'text-yellow-600'
                        )} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.type}</p>
                      <p className="text-sm text-gray-600">{alert.location}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {getRelativeTime(alert.detected_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusColors[alert.severity] || statusColors[alert.status]} size="sm">
                    {alert.severity || alert.status}
                  </Badge>
                </div>
                {alert.action_taken && (
                  <p className="text-sm text-gray-600 mt-2 ml-11 pt-2 border-t border-gray-200">
                    <strong>{language === 'ar' ? 'الإجراء:' : 'Action:'}</strong> {alert.action_taken}
                  </p>
                )}
              </div>
            ))}
            {displayAlerts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-gray-900 font-medium">{t('no_alerts')}</p>
                <p className="text-sm text-gray-500 mt-1">{language === 'ar' ? 'المريض آمن' : 'Patient is safe'}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Weekly Activity */}
        <Card title={language === 'ar' ? 'نشاط الأسبوع' : 'Weekly Activity'}>
          <div className="mb-4">
            <AreaChart
              series={[{ name: language === 'ar' ? 'درجة النشاط' : 'Activity Score', data: weeklyActivityData }]}
              categories={healthTrendData.days}
              height={180}
              colors={['#8b5cf6']}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">68%</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'متوسط النشاط' : 'Avg. Activity'}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">5</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'أيام نشطة' : 'Active Days'}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">4,250</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'متوسط الخطوات' : 'Avg. Steps'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Medications Schedule */}
      <Card title={language === 'ar' ? 'جدول الأدوية اليومي' : 'Daily Medication Schedule'} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myMedications.map((med) => (
            <div key={med.id} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Pill className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{med.medication_name}</p>
                    <p className="text-sm text-gray-500">{med.dosage}</p>
                  </div>
                </div>
                <Badge variant={med.adherence_rate >= 80 ? 'success' : 'warning'} size="sm">
                  {med.adherence_rate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {med.time} • {med.frequency}
                </span>
                <span className={clsx(
                  'font-medium',
                  med.status === 'Active' ? 'text-green-600' : 'text-gray-400'
                )}>
                  {med.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Navigation */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-600" />
            {language === 'ar' ? 'الوصول السريع' : 'Quick Access'}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/family/care-tasks')}
            className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{language === 'ar' ? 'مهام الرعاية' : 'Care Tasks'}</p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'إدارة جميع المهام' : 'Manage all tasks'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/family/alerts')}
            className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-red-100 hover:border-red-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{language === 'ar' ? 'تنبيهات السقوط' : 'Fall Alerts'}</p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'عرض جميع التنبيهات' : 'View all alerts'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/family/equipment')}
            className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-green-100 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{language === 'ar' ? 'مركز التبرعات' : 'Equipment Donations'}</p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'طلبات المعدات والتبرعات' : 'Equipment & donations'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </button>
        </div>
      </Card>

      {/* Care Cost Summary */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            {language === 'ar' ? 'ملخص تكاليف الرعاية' : 'Care Cost Summary'}
          </h3>
          <Badge variant="info" size="sm">
            {language === 'ar' ? 'هذا الشهر' : 'This Month'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">{language === 'ar' ? 'الاستشارات الطبية' : 'Medical Consultations'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {transactions.filter(t => t.patient_id === patientId && t.transaction_type === 'Consultation').reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()} {t('sar')}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pill className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">{language === 'ar' ? 'تكلفة الأدوية' : 'Medications Cost'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(myMedications.length * 75).toLocaleString()} {t('sar')}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">{language === 'ar' ? 'تغطية التأمين' : 'Insurance Coverage'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">80%</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Receipt className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-600">{language === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(transactions.filter(t => t.patient_id === patientId).reduce((sum, t) => sum + (t.amount || 0), 0) + myMedications.length * 75).toLocaleString()} {t('sar')}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            {language === 'ar' ? 'أحدث المعاملات' : 'Recent Transactions'}
          </h4>
          {transactions.filter(t => t.patient_id === patientId).length > 0 ? (
            <div className="space-y-3">
              {transactions.filter(t => t.patient_id === patientId).slice(0, 4).map((txn) => {
                const txnDoctor = doctors?.find(d => d.id === txn.doctor_id);
                return (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'p-2 rounded-lg',
                        txn.transaction_type === 'Consultation' ? 'bg-blue-100' : 'bg-purple-100'
                      )}>
                        {txn.transaction_type === 'Consultation' ? (
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Pill className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{txn.transaction_type}</p>
                        <p className="text-xs text-gray-500">
                          {txnDoctor ? txnDoctor.nameEn : 'Doctor'} • {formatDate(txn.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{txn.amount} {t('sar')}</p>
                      <Badge variant={txn.status === 'Completed' ? 'success' : 'warning'} size="sm">
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{language === 'ar' ? 'لا توجد معاملات مسجلة' : 'No transactions recorded'}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Task Modal - Improved Intuitive Design */}
      <Modal
        isOpen={showAddTask}
        onClose={() => {
          setShowAddTask(false);
          setTaskErrors({});
        }}
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span>{language === 'ar' ? 'إضافة مهمة رعاية' : 'Add Care Task'}</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-5">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'نوع المهمة' : 'Task Category'} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setNewTask({...newTask, category: cat.value})}
                  className={clsx(
                    'p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all text-center',
                    newTask.category === cat.value
                      ? `bg-${cat.color}-50 border-${cat.color}-300 shadow-md`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className={clsx(
                    'text-xs font-medium',
                    newTask.category === cat.value ? `text-${cat.color}-700` : 'text-gray-600'
                  )}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'وصف المهمة' : 'Task Description'} <span className="text-red-500">*</span>
            </label>
            <Input
              value={newTask.task}
              onChange={(e) => setNewTask({...newTask, task: e.target.value})}
              placeholder={language === 'ar' ? 'مثال: إعطاء الدواء الصباحي' : 'e.g., Administer morning medication'}
              className={taskErrors.task ? 'border-red-500' : ''}
            />
            {taskErrors.task && <p className="text-red-500 text-xs mt-1">{taskErrors.task}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
            </label>
            <textarea
              className="w-full h-20 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base resize-none"
              value={newTask.notes}
              onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
              placeholder={language === 'ar' ? 'تفاصيل إضافية عن المهمة...' : 'Additional details about the task...'}
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'الأولوية' : 'Priority'} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'Low', label: language === 'ar' ? 'منخفضة' : 'Low', color: 'green', icon: '🟢' },
                { value: 'Medium', label: language === 'ar' ? 'متوسطة' : 'Medium', color: 'yellow', icon: '🟡' },
                { value: 'High', label: language === 'ar' ? 'عالية' : 'High', color: 'red', icon: '🔴' },
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setNewTask({...newTask, priority: priority.value})}
                  className={clsx(
                    'p-3 rounded-xl border-2 font-medium text-sm transition-all flex items-center justify-center gap-2',
                    newTask.priority === priority.value
                      ? priority.value === 'High'
                        ? 'bg-red-50 border-red-300 text-red-700 shadow-md'
                        : priority.value === 'Medium'
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700 shadow-md'
                        : 'bg-green-50 border-green-300 text-green-700 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  )}
                >
                  <span>{priority.icon}</span>
                  <span>{priority.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'المسؤول عن المهمة' : 'Assigned To'} <span className="text-red-500">*</span>
            </label>
            <Input
              value={newTask.family_member}
              onChange={(e) => setNewTask({...newTask, family_member: e.target.value})}
              placeholder={language === 'ar' ? 'اسم فرد العائلة' : 'Family member name'}
              icon={UserCheck}
              className={taskErrors.family_member ? 'border-red-500' : ''}
            />
            {taskErrors.family_member && <p className="text-red-500 text-xs mt-1">{taskErrors.family_member}</p>}
          </div>

          {/* Date Selection with Quick Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'} <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickDateOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewTask({...newTask, due_date: getQuickDate(opt.value)})}
                  className={clsx(
                    'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                    newTask.due_date === getQuickDate(opt.value)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Input
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className={taskErrors.due_date ? 'border-red-500' : ''}
            />
            {taskErrors.due_date && <p className="text-red-500 text-xs mt-1">{taskErrors.due_date}</p>}
          </div>

          {/* Time Selection with Quick Slots */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'وقت الاستحقاق' : 'Due Time'} <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickTimeSlots.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setNewTask({...newTask, due_time: slot.value})}
                  className={clsx(
                    'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                    newTask.due_time === slot.value
                      ? 'bg-purple-50 border-purple-300 text-purple-700'
                      : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50 text-gray-600'
                  )}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            <Input
              type="time"
              value={newTask.due_time}
              onChange={(e) => setNewTask({...newTask, due_time: e.target.value})}
              className={taskErrors.due_time ? 'border-red-500' : ''}
            />
            {taskErrors.due_time && <p className="text-red-500 text-xs mt-1">{taskErrors.due_time}</p>}
          </div>

          {/* Recurrence Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'التكرار' : 'Recurrence'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {recurrenceOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewTask({...newTask, recurrence: opt.value})}
                  className={clsx(
                    'p-3 rounded-xl border-2 text-sm font-medium transition-all',
                    newTask.recurrence === opt.value
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddTask(false);
                setTaskErrors({});
              }}
              className="flex-1"
              disabled={isSubmitting}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleAddTask}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'ar' ? 'جاري الإضافة...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إضافة المهمة' : 'Add Task'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resolve Alert Modal */}
      <Modal
        isOpen={showResolveAlert}
        onClose={() => setShowResolveAlert(false)}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>{language === 'ar' ? 'حل تنبيه السقوط' : 'Resolve Fall Alert'}</span>
          </div>
        }
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className={clsx(
              'p-4 rounded-xl border-2',
              selectedAlert.severity === 'Critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={clsx(
                  'w-5 h-5',
                  selectedAlert.severity === 'Critical' ? 'text-red-600' : 'text-yellow-600'
                )} />
                <span className="font-semibold text-gray-900">{selectedAlert.type}</span>
                <Badge variant={statusColors[selectedAlert.severity]} size="sm">
                  {selectedAlert.severity}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{selectedAlert.location}</p>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'ar' ? 'تم الاكتشاف:' : 'Detected:'} {formatDate(selectedAlert.detected_at)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'الإجراء المتخذ' : 'Action Taken'} <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base resize-none"
                value={alertResolution}
                onChange={(e) => setAlertResolution(e.target.value)}
                placeholder={language === 'ar' ? 'صف الإجراء المتخذ لحل هذا التنبيه...' : 'Describe what action was taken to resolve this alert...'}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowResolveAlert(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="success"
                onClick={handleResolveAlert}
                className="flex-1"
                disabled={!alertResolution.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري الحل...' : 'Resolving...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'تعليم كمحلول' : 'Mark as Resolved'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Emergency Panel Modal */}
      <Modal
        isOpen={showEmergencyPanel}
        onClose={() => setShowEmergencyPanel(false)}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <PhoneCall className="w-5 h-5" />
            <span>{language === 'ar' ? 'اتصال طوارئ' : 'Emergency Call'}</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-800 font-medium text-center">
              {language === 'ar'
                ? 'في حالة الطوارئ الطبية، يرجى الاتصال فوراً'
                : 'For medical emergencies, please call immediately'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleEmergencyCall('emergency')}
              className="w-full p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
            >
              <Phone className="w-6 h-6" />
              <span>{language === 'ar' ? 'اتصل بالطوارئ (997)' : 'Call Emergency (997)'}</span>
            </button>

            <button
              onClick={() => handleEmergencyCall('patient')}
              className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
            >
              <Phone className="w-6 h-6" />
              <span>{language === 'ar' ? 'اتصل بالمريض' : 'Call Patient'}</span>
            </button>

            <button
              onClick={() => setShowEmergencyPanel(false)}
              className="w-full p-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
            >
              <X className="w-6 h-6" />
              <span>{language === 'ar' ? 'إلغاء' : 'Cancel'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InteractiveFamilyDashboard;

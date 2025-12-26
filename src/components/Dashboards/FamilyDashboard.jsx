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
  Bell,
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
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { StatCard, Card, Badge, Button, Alert, Avatar, Modal, Input } from '../shared/UIComponents';
import { LineChart, RadialBarChart, AreaChart, SparklineChart } from '../shared/Charts';
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
  } = useApp();

  const [showAddTask, setShowAddTask] = useState(false);
  const [showResolveAlert, setShowResolveAlert] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [newTask, setNewTask] = useState({
    task: '',
    notes: '',
    priority: 'Medium',
    family_member: '',
    due_date: '',
  });
  const [alertResolution, setAlertResolution] = useState('');

  // Find which patient this family member is connected to
  const familyMember = familyMembers.find(f => f.id === user?.id);
  const patientId = familyMember?.patient_id || '1';
  const patient = patients.find(p => p.id === patientId);

  const myTasks = careTasks.filter(t => t.patient_id === patientId);
  const myAppointments = appointments.filter(a => a.patient_id === patientId);
  const myAlerts = fallAlerts.filter(a => a.patient_id === patientId);
  const myMedications = medicationReminders.filter(m => m.patient_id === patientId);

  // Generate dynamic fall alert data for the past 7 days
  const dynamicFallAlerts = useMemo(() => {
    const now = new Date();
    const alerts = [];
    const locations = ['Living Room', 'Bedroom', 'Bathroom', 'Kitchen', 'Garden', 'Hallway'];
    const types = ['Fall Detected', 'Near Fall', 'Balance Issue', 'Sudden Movement'];
    const severities = ['Critical', 'High', 'Medium', 'Low'];

    // Generate some recent alerts
    for (let i = 0; i < 5; i++) {
      const hoursAgo = Math.floor(Math.random() * 168); // Within last 7 days
      const alertTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      alerts.push({
        id: `dynamic_${i}`,
        patient_id: patientId,
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        location: `Home - ${locations[Math.floor(Math.random() * locations.length)]}`,
        detected_at: alertTime.toISOString(),
        status: i < 2 ? 'Active' : 'Resolved',
        response_time: `${Math.floor(Math.random() * 30) + 5} minutes`,
        action_taken: i < 2 ? null : 'Family checked on patient, no injuries found',
      });
    }

    return alerts.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at));
  }, [patientId]);

  // Use dynamic alerts if no real alerts exist
  const displayAlerts = myAlerts.length > 0 ? myAlerts : dynamicFallAlerts;

  // Get upcoming appointments (future dates only)
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return myAppointments
      .filter(a => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);
  }, [myAppointments]);

  // Generate health trend data for charts (must be before early return)
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

  // Activity data for the week (must be before early return)
  const weeklyActivityData = useMemo(() => {
    return [65, 78, 52, 88, 71, 45, 82]; // Sample activity scores
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

  const handleCompleteTask = (taskId) => {
    completeCareTask(taskId);
  };

  const handleDeleteTask = (taskId) => {
    deleteCareTask(taskId);
  };

  const handleAddTask = () => {
    addCareTask({
      ...newTask,
      patient_id: patientId,
    });
    setShowAddTask(false);
    setNewTask({
      task: '',
      notes: '',
      priority: 'Medium',
      family_member: '',
      due_date: '',
    });
  };

  const handleResolveAlert = () => {
    if (selectedAlert && alertResolution) {
      resolveFallAlert(selectedAlert.id, alertResolution);
      setShowResolveAlert(false);
      setSelectedAlert(null);
      setAlertResolution('');
    }
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
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  const pendingTasks = myTasks.filter(t => t.status === 'Pending').length;
  const unresolvedAlerts = displayAlerts.filter(a => a.status !== 'Resolved' && a.status !== 'Active').length + displayAlerts.filter(a => a.status === 'Active').length;
  const avgAdherence = myMedications.length > 0
    ? Math.round(myMedications.reduce((acc, m) => acc + m.adherence_rate, 0) / myMedications.length)
    : 100;

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('family_dashboard')}</h1>
        <p className="text-gray-600 mt-1">Caring for {patient.nameEn}</p>
      </div>

      {/* Alert Banner */}
      {unresolvedAlerts > 0 && (
        <Alert type="error" title={t('fall_alerts')} className="mb-6">
          <div className="flex items-center justify-between">
            <span>
              {unresolvedAlerts} unresolved alert(s) - Immediate attention required!
            </span>
            <Button variant="danger" size="sm" onClick={() => {
              const activeAlert = displayAlerts.find(a => a.status === 'Active' || a.status !== 'Resolved');
              setSelectedAlert(activeAlert);
              setShowResolveAlert(true);
            }}>
              Resolve Now
            </Button>
          </div>
        </Alert>
      )}

      {/* Patient Overview Card */}
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar name={patient.nameEn} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {patient.nameEn}
            </h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {patient.gender} • {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {patient.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {patient.phone}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {patient.medicalConditions.map((condition, idx) => (
                <Badge key={idx} variant="info" size="sm">{condition}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className={clsx(
              'px-4 py-2 rounded-lg text-center',
              patient.fallRisk === 'High' ? 'bg-red-100' : patient.fallRisk === 'Medium' ? 'bg-yellow-100' : 'bg-green-100'
            )}>
              <p className="text-xs text-gray-500">{t('fall_risk')}</p>
              <p className={clsx(
                'font-bold',
                patient.fallRisk === 'High' ? 'text-red-600' : patient.fallRisk === 'Medium' ? 'text-yellow-600' : 'text-green-600'
              )}>
                {patient.fallRisk}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t('care_tasks')}
          value={myTasks.length}
          icon={CheckCircle}
          color="blue"
          subtitle={`${pendingTasks} pending`}
        />
        <StatCard
          title={t('fall_alerts')}
          value={displayAlerts.length}
          icon={AlertTriangle}
          color={unresolvedAlerts > 0 ? 'red' : 'green'}
          subtitle={`${unresolvedAlerts} unresolved`}
        />
        <StatCard
          title={t('my_appointments')}
          value={upcomingAppointments.length}
          icon={Clock}
          color="purple"
          subtitle="Upcoming"
        />
        <StatCard
          title={t('adherence_rate')}
          value={`${avgAdherence}%`}
          icon={Activity}
          color={avgAdherence >= 80 ? 'green' : 'yellow'}
          subtitle="Medication compliance"
        />
      </div>

      {/* Health Summary with Charts */}
      <div className="mb-8">
        <HealthSummaryChart patient={patient} language={language} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Care Tasks - INTERACTIVE */}
        <Card
          title={t('care_tasks')}
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
                  'p-3 rounded-lg border transition-all hover:shadow-md',
                  task.status === 'Completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={clsx(
                      'p-2 rounded-lg',
                      task.status === 'Completed' ? 'bg-green-100' : 'bg-blue-100'
                    )}>
                      {task.status === 'Completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={clsx(
                        'font-medium',
                        task.status === 'Completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                      )}>
                        {task.task}
                      </p>
                      <p className="text-sm text-gray-500">{task.notes}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{t('assigned_to')}: {task.family_member}</span>
                        <span>{t('due_date')}: {formatDate(task.due_date)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={statusColors[task.priority]} size="sm">
                    {task.priority}
                  </Badge>
                </div>
                {task.status !== 'Completed' && (
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      {t('complete_task')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {myTasks.length === 0 && (
              <p className="text-center text-gray-500 py-8">No care tasks yet. Add one to get started!</p>
            )}
          </div>
        </Card>

        {/* Upcoming Appointments - Improved */}
        <Card
          title={language === 'ar' ? 'المواعيد القادمة' : 'Upcoming Appointments'}
          action={
            <Button variant="ghost" size="sm">
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
                      {/* Date/Time Badge */}
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

                      {/* Appointment Details */}
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

                      {/* Status Badge */}
                      <Badge variant={statusColors[apt.status] || 'default'} size="sm">
                        {apt.status}
                      </Badge>
                    </div>
                    {apt.notes && (
                      <p className="text-sm text-gray-500 mt-3 pl-20 border-t pt-2">
                        {apt.notes}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{language === 'ar' ? 'لا توجد مواعيد قادمة' : 'No upcoming appointments'}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Health Summary with Charts */}
      <Card title={t('health_summary')} className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vitals Trends Chart */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {language === 'ar' ? 'اتجاه ضغط الدم' : 'Blood Pressure Trend'}
            </h4>
            <LineChart
              series={[
                { name: language === 'ar' ? 'الانقباضي' : 'Systolic', data: healthTrendData.bloodPressure.systolic },
                { name: language === 'ar' ? 'الانبساطي' : 'Diastolic', data: healthTrendData.bloodPressure.diastolic },
              ]}
              categories={healthTrendData.days}
              height={200}
              colors={['#ef4444', '#3b82f6']}
            />
          </div>

          {/* Medication Adherence Donut */}
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

        {/* Quick Vitals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
          {/* Blood Pressure */}
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <SparklineChart data={healthTrendData.bloodPressure.systolic} height={30} color="#ef4444" />
            </div>
            <p className="text-xs text-gray-500">{language === 'ar' ? 'ضغط الدم' : 'Blood Pressure'}</p>
            <p className="text-lg font-bold text-gray-900">139/88</p>
            <Badge variant="warning" size="sm" className="mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {language === 'ar' ? 'مرتفع قليلاً' : 'Slightly High'}
            </Badge>
          </div>

          {/* Heart Rate */}
          <div className="p-4 bg-pink-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-pink-500" />
              <SparklineChart data={healthTrendData.heartRate} height={30} color="#ec4899" />
            </div>
            <p className="text-xs text-gray-500">{language === 'ar' ? 'معدل النبض' : 'Heart Rate'}</p>
            <p className="text-lg font-bold text-gray-900">73 bpm</p>
            <Badge variant="success" size="sm" className="mt-1">
              {language === 'ar' ? 'طبيعي' : 'Normal'}
            </Badge>
          </div>

          {/* Glucose */}
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="w-5 h-5 text-amber-500" />
              <SparklineChart data={healthTrendData.glucose} height={30} color="#f59e0b" />
            </div>
            <p className="text-xs text-gray-500">{language === 'ar' ? 'مستوى السكر' : 'Glucose'}</p>
            <p className="text-lg font-bold text-gray-900">114 mg/dL</p>
            <Badge variant="warning" size="sm" className="mt-1">
              {language === 'ar' ? 'مراقبة' : 'Monitor'}
            </Badge>
          </div>

          {/* Temperature */}
          <div className="p-4 bg-cyan-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="w-5 h-5 text-cyan-500" />
              <span className="text-xs text-gray-400">Stable</span>
            </div>
            <p className="text-xs text-gray-500">{language === 'ar' ? 'درجة الحرارة' : 'Temperature'}</p>
            <p className="text-lg font-bold text-gray-900">36.8°C</p>
            <Badge variant="success" size="sm" className="mt-1">
              {language === 'ar' ? 'طبيعي' : 'Normal'}
            </Badge>
          </div>

          {/* Weight */}
          <div className="p-4 bg-purple-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Scale className="w-5 h-5 text-purple-500" />
              <SparklineChart data={healthTrendData.weight} height={30} color="#8b5cf6" />
            </div>
            <p className="text-xs text-gray-500">{language === 'ar' ? 'الوزن' : 'Weight'}</p>
            <p className="text-lg font-bold text-gray-900">77.7 kg</p>
            <Badge variant="success" size="sm" className="mt-1">
              <TrendingDown className="w-3 h-3 mr-1" />
              -0.3 kg
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fall Detection Alerts - Dynamic */}
        <Card
          title={language === 'ar' ? 'تنبيهات السقوط' : 'Fall Detection Alerts'}
          action={
            <Button variant="ghost" size="sm">
              {t('view_all')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <div className="space-y-3">
            {displayAlerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={clsx(
                  'p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
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
                      'p-2 rounded-full',
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
                  <p className="text-sm text-gray-600 mt-2 ml-11">
                    <strong>Action:</strong> {alert.action_taken}
                  </p>
                )}
              </div>
            ))}
            {displayAlerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{t('no_alerts')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Weekly Activity Overview */}
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
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">68%</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'متوسط النشاط' : 'Avg. Activity'}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">5</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'أيام نشطة' : 'Active Days'}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">4,250</p>
              <p className="text-xs text-gray-500">{language === 'ar' ? 'متوسط الخطوات' : 'Avg. Steps'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Medications Overview */}
      <Card title={language === 'ar' ? 'جدول الأدوية اليومي' : 'Daily Medication Schedule'}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myMedications.map((med) => (
            <div key={med.id} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
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

      {/* Quick Navigation to Detail Pages */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-600" />
            {language === 'ar' ? 'الوصول السريع' : 'Quick Access'}
          </h3>
          <p className="text-sm text-gray-500">
            {language === 'ar' ? 'عرض التفاصيل الكاملة' : 'View full details'}
          </p>
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
            onClick={() => navigate('/family/charity')}
            className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-green-100 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{language === 'ar' ? 'مركز التبرعات' : 'Charity Centre'}</p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'طلبات المعدات والتبرعات' : 'Equipment & donations'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </button>
        </div>
      </Card>

      {/* Care Expenses & Financial Summary */}
      <Card className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            {language === 'ar' ? 'ملخص تكاليف الرعاية' : 'Care Cost Summary'}
          </h3>
          <Badge variant="info" size="sm">
            {language === 'ar' ? 'هذا الشهر' : 'This Month'}
          </Badge>
        </div>

        {/* Cost Stats */}
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
            <p className="text-sm text-gray-500">
              {transactions.filter(t => t.patient_id === patientId && t.transaction_type === 'Consultation').length} {language === 'ar' ? 'زيارات' : 'visits'}
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
            <p className="text-sm text-gray-500">
              {myMedications.length} {language === 'ar' ? 'أدوية نشطة' : 'active medications'}
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
            <p className="text-sm text-gray-500">
              {language === 'ar' ? 'مغطى بالتأمين' : 'Covered by insurance'}
            </p>
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
            <p className="text-sm text-gray-500">
              {language === 'ar' ? 'هذا الشهر' : 'This month'}
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
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
              <p className="text-sm">{language === 'ar' ? 'سيتم عرض تكاليف الرعاية هنا' : 'Care costs will appear here'}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Task Modal */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Add Care Task">
        <div className="space-y-4">
          <Input
            label="Task Description"
            value={newTask.task}
            onChange={(e) => setNewTask({...newTask, task: e.target.value})}
            placeholder="e.g., Administer morning medication"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              rows="3"
              value={newTask.notes}
              onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
              placeholder="Additional details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={newTask.priority}
              onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <Input
            label="Assigned To"
            value={newTask.family_member}
            onChange={(e) => setNewTask({...newTask, family_member: e.target.value})}
            placeholder="Family member name"
          />
          <Input
            label="Due Date"
            type="datetime-local"
            value={newTask.due_date}
            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddTask(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="flex-1" disabled={!newTask.task || !newTask.due_date}>
              Add Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resolve Alert Modal */}
      <Modal isOpen={showResolveAlert} onClose={() => setShowResolveAlert(false)} title="Resolve Fall Alert">
        {selectedAlert && (
          <div className="space-y-4">
            <div className={clsx(
              'p-4 rounded-lg border',
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
              <p className="text-xs text-gray-400 mt-1">Detected: {formatDate(selectedAlert.detected_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Taken <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
                rows="4"
                value={alertResolution}
                onChange={(e) => setAlertResolution(e.target.value)}
                placeholder="Describe what action was taken to resolve this alert..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowResolveAlert(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleResolveAlert}
                className="flex-1"
                disabled={!alertResolution}
              >
                Mark as Resolved
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InteractiveFamilyDashboard;

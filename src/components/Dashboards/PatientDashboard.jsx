import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Calendar,
  Activity,
  Phone,
  Plus,
  Package,
  Check,
  MapPin,
  Heart,
  Thermometer,
  Droplets,
  TrendingUp,
  Clock,
  Video,
  Building,
  CheckCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { doctors } from '../../data/mockData';
import { Card, Badge, Button, Modal, Input } from '../shared/UIComponents';
import { DonutChart, SparklineChart } from '../shared/Charts';
import { clsx } from 'clsx';

const InteractivePatientDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const {
    patients,
    medicationReminders,
    appointments,
    equipmentRequests,
    takeMedication,
    bookAppointment,
    createEquipmentRequest,
    addNotification,
  } = useApp();

  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewEquipment, setShowNewEquipment] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    doctor_id: '',
    doctor_name: '',
    specialization: '',
    type: 'Consultation',
    date: '',
    time: '',
    location: '',
    locationType: '',
    notes: '',
  });
  const [newEquipmentRequest, setNewEquipmentRequest] = useState({
    equipment_name: '',
    description: '',
    category: 'Mobility',
    medical_justification: '',
  });

  // Local state for current readings to force immediate UI updates
  const [currentReadings, setCurrentReadings] = useState({
    'Blood Pressure': { value: '132/82', unit: 'mmHg', status: 'Normal' },
    'Heart Rate': { value: '72', unit: 'bpm', status: 'Normal' },
    'Temperature': { value: '37.0', unit: '°C', status: 'Normal' },
    'Blood Oxygen': { value: '95', unit: '%', status: 'Normal' },
  });

  // Track when the last reading was taken
  const [lastReadingTime, setLastReadingTime] = useState(null);
  const [timeSinceReading, setTimeSinceReading] = useState(null);
  const [isReadingCooldown, setIsReadingCooldown] = useState(false);

  // Historical readings for charts
  const [readingsHistory, setReadingsHistory] = useState({
    bloodPressure: { systolic: [128, 132, 130, 135, 129, 132], diastolic: [82, 85, 80, 88, 83, 82] },
    heartRate: [70, 72, 68, 75, 71, 72],
    temperature: [36.8, 37.0, 36.9, 37.1, 36.8, 37.0],
    oxygen: [96, 95, 97, 94, 96, 95],
  });
  const [historyLabels] = useState(['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', 'Now']);

  // Update the time since last reading every second
  useEffect(() => {
    if (!lastReadingTime) return;

    const updateTimeSince = () => {
      const now = new Date();
      const diffMs = now - lastReadingTime;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);

      if (diffMin >= 1) {
        setTimeSinceReading(`${diffMin}m ago`);
      } else {
        setTimeSinceReading(`${diffSec}s ago`);
      }
    };

    updateTimeSince();
    const interval = setInterval(updateTimeSince, 1000);

    return () => clearInterval(interval);
  }, [lastReadingTime]);

  const generateSensorReading = () => {
    // Prevent rapid clicking - only allow one reading per 3 seconds
    if (isReadingCooldown) return;

    // Generate new random values
    const newSystolic = Math.floor(Math.random() * 30) + 110;
    const newDiastolic = Math.floor(Math.random() * 20) + 70;
    const newHeartRate = Math.floor(Math.random() * 40) + 60;
    const newTemp = parseFloat((Math.random() * 1.5 + 36.5).toFixed(1));
    const newOxygen = Math.floor(Math.random() * 5) + 95;

    const newReadings = {
      'Blood Pressure': {
        value: `${newSystolic}/${newDiastolic}`,
        unit: 'mmHg',
        status: newSystolic > 130 ? 'High' : 'Normal',
      },
      'Heart Rate': {
        value: `${newHeartRate}`,
        unit: 'bpm',
        status: newHeartRate > 90 ? 'High' : 'Normal',
      },
      'Temperature': {
        value: `${newTemp}`,
        unit: '°C',
        status: newTemp > 37.5 ? 'High' : 'Normal',
      },
      'Blood Oxygen': {
        value: `${newOxygen}`,
        unit: '%',
        status: newOxygen < 95 ? 'Low' : 'Normal',
      },
    };

    // Update local state immediately for instant UI update
    setCurrentReadings(newReadings);

    // Update history for charts
    setReadingsHistory(prev => ({
      bloodPressure: {
        systolic: [...prev.bloodPressure.systolic.slice(1), newSystolic],
        diastolic: [...prev.bloodPressure.diastolic.slice(1), newDiastolic],
      },
      heartRate: [...prev.heartRate.slice(1), newHeartRate],
      temperature: [...prev.temperature.slice(1), newTemp],
      oxygen: [...prev.oxygen.slice(1), newOxygen],
    }));

    // Record the time of this reading
    setLastReadingTime(new Date());

    // Set cooldown to prevent spam
    setIsReadingCooldown(true);
    setTimeout(() => setIsReadingCooldown(false), 3000);

    // Show notification
    addNotification('success', 'Vital signs recorded successfully!');
  };

  const patient = patients.find(p => p.id === (user?.id || '1'));
  const patientId = user?.id || '1';

  const myMedications = medicationReminders.filter(m => m.patient_id === patientId);
  const myAppointments = appointments.filter(a => a.patient_id === patientId);
  const myEquipment = equipmentRequests.filter(e => e.patient_id === patientId);

  // Calculate medication adherence
  const avgAdherence = useMemo(() => {
    if (myMedications.length === 0) return 100;
    return Math.round(myMedications.reduce((acc, m) => acc + m.adherence_rate, 0) / myMedications.length);
  }, [myMedications]);

  // Doctor options for dropdown
  const doctorOptions = useMemo(() =>
    doctors.map(doc => ({
      value: doc.id,
      label: `${doc.nameEn} - ${doc.specialization} (${doc.consultationFee} SAR)`,
    })), []);

  // Get selected doctor details
  const selectedDoctor = useMemo(() =>
    doctors.find(d => d.id === selectedDoctorId), [selectedDoctorId]);

  // Update appointment when doctor is selected
  const handleDoctorSelect = (e) => {
    const doctorId = e.target.value;
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setNewAppointment(prev => ({
        ...prev,
        doctor_id: doctor.id,
        doctor_name: doctor.nameEn,
        specialization: doctor.specialization,
        location: doctor.hospital
      }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBookAppointment = () => {
    if (!selectedDoctorId || !newAppointment.date || !newAppointment.time) {
      return;
    }

    const appointmentData = {
      patient_id: patientId,
      doctor_id: newAppointment.doctor_id,
      doctor_name: newAppointment.doctor_name,
      specialization: newAppointment.specialization,
      type: newAppointment.type,
      date: `${newAppointment.date}T${newAppointment.time}:00Z`,
      location: newAppointment.location,
      notes: newAppointment.notes,
    };

    bookAppointment(appointmentData);
    setShowNewAppointment(false);
    setSelectedDoctorId('');
    setNewAppointment({
      doctor_id: '',
      doctor_name: '',
      specialization: '',
      type: 'Consultation',
      date: '',
      time: '',
      location: '',
      locationType: '',
      notes: ''
    });
  };

  const handleCreateEquipment = () => {
    createEquipmentRequest({
      ...newEquipmentRequest,
      patient_id: patientId,
      patient_name: patient?.name || '',
    });
    setShowNewEquipment(false);
    setNewEquipmentRequest({
      equipment_name: '',
      description: '',
      category: 'Mobility',
      medical_justification: '',
    });
  };

  if (!patient) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  const vitalIcons = {
    'Blood Pressure': Heart,
    'Heart Rate': Activity,
    'Temperature': Thermometer,
    'Blood Oxygen': Droplets,
  };

  const vitalColors = {
    'Blood Pressure': { bg: 'bg-red-50', icon: 'text-red-500', chart: '#ef4444' },
    'Heart Rate': { bg: 'bg-pink-50', icon: 'text-pink-500', chart: '#ec4899' },
    'Temperature': { bg: 'bg-cyan-50', icon: 'text-cyan-500', chart: '#06b6d4' },
    'Blood Oxygen': { bg: 'bg-blue-50', icon: 'text-blue-500', chart: '#3b82f6' },
  };

  const vitalSparklineData = {
    'Blood Pressure': readingsHistory.bloodPressure.systolic,
    'Heart Rate': readingsHistory.heartRate,
    'Temperature': readingsHistory.temperature,
    'Blood Oxygen': readingsHistory.oxygen,
  };

  return (
    <div
      className={clsx('p-4 md:p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Welcome Header - Optimized */}
      <div className="mb-6 animate-fadeIn">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return language === 'ar' ? 'صباح الخير' : 'Good Morning';
                  if (hour < 17) return language === 'ar' ? 'مساء الخير' : 'Good Afternoon';
                  return language === 'ar' ? 'مساء الخير' : 'Good Evening';
                })()}, {patient.nameEn}
              </h1>
              <span className="text-2xl animate-wave">👋</span>
            </div>
            <p className="text-gray-600 text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              {language === 'ar' ? 'نأمل أن تكون بصحة جيدة اليوم' : 'Hope you\'re feeling well today'}
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
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-green-700">
                  {language === 'ar' ? 'مراقبة نشطة' : 'Active Monitoring'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Optimized with Smooth Flow */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
          <span>{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Take Vitals */}
          <button
            onClick={generateSensorReading}
            disabled={isReadingCooldown}
            className={clsx(
              "group relative overflow-hidden p-5 rounded-2xl border-2 transition-all duration-500 text-left transform",
              isReadingCooldown
                ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                : "bg-gradient-to-br from-red-50 via-pink-50 to-red-50 border-red-200 hover:border-red-400 hover:shadow-2xl hover:scale-105 active:scale-95"
            )}
          >
            <div className={clsx(
              "absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-opacity",
              isReadingCooldown ? "bg-gray-200/30" : "bg-red-300/30 group-hover:bg-red-400/40"
            )}></div>
            <Activity className={clsx("w-8 h-8 mb-3 transition-transform group-hover:scale-110", isReadingCooldown ? "text-gray-400" : "text-red-600")} />
            <p className={clsx("font-bold text-sm mb-1", isReadingCooldown ? "text-gray-500" : "text-gray-900")}>
              {isReadingCooldown ? (language === 'ar' ? 'قيد القراءة...' : 'Reading...') : (language === 'ar' ? 'قياس الحيوية' : 'Take Vitals')}
            </p>
            <p className="text-xs text-gray-600 font-medium">
              {timeSinceReading || (language === 'ar' ? 'الآن' : 'Now')}
            </p>
          </button>

          {/* Book Appointment */}
          <button
            onClick={() => setShowNewAppointment(true)}
            className="group relative overflow-hidden p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 text-left transform"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-300/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-400/40 transition-all"></div>
            <Calendar className="w-8 h-8 text-blue-600 mb-3 transition-transform group-hover:scale-110" />
            <p className="font-bold text-sm text-gray-900 mb-1">{language === 'ar' ? 'حجز موعد' : 'Book Appointment'}</p>
            <p className="text-xs text-gray-600 font-medium">{myAppointments.length} {language === 'ar' ? 'نشط' : 'active'}</p>
          </button>

          {/* Medications */}
          <button
            onClick={() => navigate('/patient/medications')}
            className="group relative overflow-hidden p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-2xl hover:border-green-400 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 text-left transform"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-300/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-400/40 transition-all"></div>
            <Pill className="w-8 h-8 text-green-600 mb-3 transition-transform group-hover:scale-110" />
            <p className="font-bold text-sm text-gray-900 mb-1">{language === 'ar' ? 'الأدوية' : 'Medications'}</p>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all" style={{ width: `${avgAdherence}%` }}></div>
              </div>
              <span className="text-xs text-gray-600 font-bold">{avgAdherence}%</span>
            </div>
          </button>

          {/* Request Equipment */}
          <button
            onClick={() => setShowNewEquipment(true)}
            className="group relative overflow-hidden p-5 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 border-2 border-purple-200 rounded-2xl hover:border-purple-400 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 text-left transform"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-300/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-400/40 transition-all"></div>
            <Package className="w-8 h-8 text-purple-600 mb-3 transition-transform group-hover:scale-110" />
            <p className="font-bold text-sm text-gray-900 mb-1">{language === 'ar' ? 'طلب معدات' : 'Get Equipment'}</p>
            <p className="text-xs text-gray-600 font-medium">{myEquipment.filter(e => e.status === 'Pending').length} {language === 'ar' ? 'معلق' : 'pending'}</p>
          </button>
        </div>
      </div>


      {/* Health Metrics with Charts - Enhanced */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>{t('health_metrics')}</span>
          </div>
        }
        className="mb-6"
      >
        {/* Last Reading Info Banner */}
        {timeSinceReading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900">
                {language === 'ar' ? 'آخر قراءة:' : 'Last reading:'} <span className="font-semibold">{timeSinceReading}</span>
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Activity}
              onClick={generateSensorReading}
              disabled={isReadingCooldown}
              className="text-xs"
            >
              {isReadingCooldown ? (language === 'ar' ? 'قيد القراءة...' : 'Reading...') : (language === 'ar' ? 'قراءة جديدة' : 'New Reading')}
            </Button>
          </div>
        )}

        {/* Vitals Grid with Enhanced Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.keys(currentReadings).map((type) => {
            const reading = currentReadings[type];
            const Icon = vitalIcons[type];
            const colors = vitalColors[type];
            const sparkData = vitalSparklineData[type];

            return (
              <div
                key={type}
                className={clsx(
                  'group relative p-5 rounded-2xl transition-all duration-300 cursor-pointer border-2',
                  colors.bg,
                  reading.status === 'Normal'
                    ? 'border-transparent hover:border-gray-200 hover:shadow-lg'
                    : 'border-yellow-200 hover:border-yellow-300 hover:shadow-lg'
                )}
              >
                {/* Status Indicator Dot */}
                <div className="absolute top-3 right-3">
                  <div className={clsx(
                    "w-2.5 h-2.5 rounded-full",
                    reading.status === 'Normal' ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                  )}></div>
                </div>

                {/* Icon and Trend */}
                <div className="flex items-start justify-between mb-3">
                  <div className={clsx('p-2.5 rounded-xl', colors.bg === 'bg-red-50' ? 'bg-red-100' : colors.bg === 'bg-pink-50' ? 'bg-pink-100' : colors.bg === 'bg-cyan-50' ? 'bg-cyan-100' : 'bg-blue-100')}>
                    <Icon className={clsx('w-5 h-5', colors.icon)} />
                  </div>
                  <div className="w-20 h-10">
                    <SparklineChart data={sparkData} height={40} color={colors.chart} />
                  </div>
                </div>

                {/* Label */}
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">{type}</p>

                {/* Value */}
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-2xl font-bold text-gray-900">{reading.value}</p>
                  <span className="text-sm text-gray-500">{reading.unit}</span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={reading.status === 'Normal' ? 'success' : 'warning'}
                    size="sm"
                    className="text-xs"
                  >
                    {reading.status === 'Normal' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" />{reading.status}</>
                    ) : (
                      <><TrendingUp className="w-3 h-3 mr-1" />{reading.status}</>
                    )}
                  </Badge>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/5 group-hover:to-transparent rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* Take Reading Button - Prominent when no recent reading */}
        {!timeSinceReading && (
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              icon={Activity}
              onClick={generateSensorReading}
              disabled={isReadingCooldown}
              className="px-8"
            >
              {isReadingCooldown ? (language === 'ar' ? 'قيد القراءة...' : 'Reading...') : (language === 'ar' ? 'أخذ قراءة الآن' : 'Take Reading Now')}
            </Button>
            <p className="text-sm text-gray-500 mt-2">{language === 'ar' ? 'مراقبة صحتك في الوقت الفعلي' : 'Monitor your health in real-time'}</p>
          </div>
        )}
      </Card>

      {/* Charts Row - Blood Pressure, Adherence, Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Blood Pressure Trend Chart */}
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              {language === 'ar' ? 'اتجاه ضغط الدم' : 'Blood Pressure Trend'}
            </h4>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-gray-800">
                {readingsHistory.bloodPressure.systolic[5]}/{readingsHistory.bloodPressure.diastolic[5]}
              </span>
              <span className="text-xs text-green-600 font-medium">●</span>
            </div>
          </div>

          {/* Simple Card-based Readings Display */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            {historyLabels.map((label, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border-2 transition-all ${
                  i === historyLabels.length - 1
                    ? 'bg-blue-50 border-blue-200 shadow-md scale-105'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-500 mb-1 text-center truncate">{label}</div>
                <div className="space-y-1">
                  {/* Systolic */}
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                    <span className="text-sm font-bold text-gray-800">{readingsHistory.bloodPressure.systolic[i]}</span>
                  </div>
                  {/* Diastolic */}
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-sm font-bold text-gray-800">{readingsHistory.bloodPressure.diastolic[i]}</span>
                  </div>
                </div>
                {/* Visual indicator bars */}
                <div className="mt-2 space-y-1">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(readingsHistory.bloodPressure.systolic[i] / 180) * 100}%` }}
                    ></div>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(readingsHistory.bloodPressure.diastolic[i] / 120) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-gray-600">{language === 'ar' ? 'الانقباضي' : 'Systolic'}</span>
                <span className="font-bold text-gray-800">
                  {Math.round(readingsHistory.bloodPressure.systolic.reduce((a, b) => a + b) / 6)}
                </span>
                <span className="text-gray-400">avg</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">{language === 'ar' ? 'الانبساطي' : 'Diastolic'}</span>
                <span className="font-bold text-gray-800">
                  {Math.round(readingsHistory.bloodPressure.diastolic.reduce((a, b) => a + b) / 6)}
                </span>
                <span className="text-gray-400">avg</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <span className="text-green-600 font-medium">Normal:</span> 120/80 - 130/85
            </div>
          </div>
        </Card>

        {/* Medication Adherence - Dynamic based on actual data */}
        <Card>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4 text-green-500" />
            {language === 'ar' ? 'الالتزام بالأدوية' : 'Med Adherence'}
          </h4>
          <DonutChart
            series={[avgAdherence, 100 - avgAdherence]}
            labels={[language === 'ar' ? 'تم تناوله' : 'Taken', language === 'ar' ? 'فائت' : 'Missed']}
            height={140}
            colors={['#22c55e', '#ef4444']}
            centerText={{
              label: language === 'ar' ? 'الالتزام' : 'Adherence',
              value: `${avgAdherence}%`
            }}
          />
        </Card>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Medication Reminders - INTERACTIVE */}
        <Card
          title={t('medication_reminders')}
          action={
            <Button variant="ghost" size="sm">
              {t('view_all')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <div className="space-y-3">
            {myMedications.slice(0, 3).map((med) => {
              // Parse frequency to get doses per day
              const freq = med.frequency?.toLowerCase() || '';
              let dosesPerDay = 1;
              if (freq.includes('twice') || freq.includes('مرتين')) dosesPerDay = 2;
              else if (freq.includes('three') || freq.includes('ثلاث')) dosesPerDay = 3;

              const takenToday = med.taken_today || 0;
              const isCompleted = takenToday >= dosesPerDay;

              return (
                <div key={med.id} className={clsx(
                  "flex items-center justify-between p-3 rounded-xl transition-colors",
                  isCompleted ? "bg-green-50 border border-green-100" : "bg-gray-50 hover:bg-gray-100"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "p-2 rounded-lg",
                      isCompleted ? "bg-green-100" : "bg-blue-100"
                    )}>
                      <Pill className={clsx("w-5 h-5", isCompleted ? "text-green-600" : "text-blue-600")} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{med.medication_name}</p>
                      <p className="text-sm text-gray-500">{med.dosage} - {med.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Progress indicator */}
                    <div className="text-right">
                      <p className={clsx(
                        "text-xs font-medium",
                        isCompleted ? "text-green-600" : "text-gray-500"
                      )}>
                        {takenToday}/{dosesPerDay}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: dosesPerDay }).map((_, i) => (
                          <div
                            key={i}
                            className={clsx(
                              "w-2 h-2 rounded-full",
                              i < takenToday ? "bg-green-500" : "bg-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Action */}
                    {!isCompleted ? (
                      <Button
                        variant="success"
                        size="sm"
                        icon={Check}
                        onClick={() => takeMedication(med.id)}
                      >
                        {language === 'ar' ? 'تناول' : 'Take'}
                      </Button>
                    ) : (
                      <div className="px-3 py-1.5 bg-green-100 rounded-lg">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {myMedications.length === 0 && (
              <p className="text-center text-gray-500 py-4">{t('no_medications')}</p>
            )}
          </div>

        </Card>

        {/* Upcoming Appointments - INTERACTIVE */}
        <Card
          title={t('my_appointments')}
          action={
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowNewAppointment(true)}
            >
              {t('add')}
            </Button>
          }
        >
          <div className="space-y-4">
            {myAppointments.slice(0, 3).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{apt.doctor_name}</p>
                    <p className="text-sm text-gray-500">{apt.specialization}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{apt.location || 'Clinic'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatDate(apt.date)}</p>
                    <Badge variant={apt.status === 'Confirmed' ? 'success' : 'info'} size="sm">
                      {apt.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Phone}
                    onClick={() => window.open(`tel:${apt.doctor_phone || ''}`, '_self')}
                    title="Call Doctor"
                    className="!p-2"
                  >
                  </Button>
                </div>
              </div>
            ))}
            {myAppointments.length === 0 && (
              <p className="text-center text-gray-500 py-4">{t('no_appointments')}</p>
            )}
          </div>

        </Card>
      </div>

      {/* Equipment Requests - INTERACTIVE */}
      <Card
        title={t('equipment_requests')}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowNewEquipment(true)}
          >
            {t('request_equipment')}
          </Button>
        }
        className="mb-8"
      >
        <div className="space-y-3">
          {myEquipment.length > 0 ? (
            myEquipment.map((req) => (
              <div key={req.id} className="group relative overflow-hidden p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  {/* Icon with category color */}
                  <div className={clsx(
                    'p-3 rounded-xl',
                    req.category === 'Mobility' && 'bg-blue-100',
                    req.category === 'Monitoring' && 'bg-green-100',
                    req.category === 'Safety' && 'bg-orange-100',
                    req.category === 'Home Care' && 'bg-purple-100',
                    !req.category && 'bg-gray-100'
                  )}>
                    <Package className={clsx(
                      'w-5 h-5',
                      req.category === 'Mobility' && 'text-blue-600',
                      req.category === 'Monitoring' && 'text-green-600',
                      req.category === 'Safety' && 'text-orange-600',
                      req.category === 'Home Care' && 'text-purple-600',
                      !req.category && 'text-gray-600'
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{req.equipment_name}</h4>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{req.description}</p>
                      </div>
                      <Badge
                        variant={req.status === 'Fulfilled' ? 'success' : req.status === 'Approved' ? 'info' : 'warning'}
                        className="flex-shrink-0"
                      >
                        {req.status === 'Pending' && '⏳'}
                        {req.status === 'Approved' && '✓'}
                        {req.status === 'Fulfilled' && '✓✓'}
                        {' '}{req.status}
                      </Badge>
                    </div>

                    {/* Category & Date */}
                    <div className="flex items-center gap-3 mt-3">
                      {req.category && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {req.category}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        Requested {new Date(req.request_date || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No equipment requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Request medical equipment you need</p>
            </div>
          )}
        </div>
      </Card>

      {/* Emergency Contacts */}
      <Card title={t('emergency_contacts')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Family Emergency Contact */}
          <button
            onClick={() => window.location.href = `tel:${patient.emergencyContact?.phone?.replace(/\s/g, '') || ''}`}
            className="group relative overflow-hidden p-5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 text-left"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-purple-200 uppercase tracking-wide">{language === 'ar' ? 'جهة اتصال الطوارئ' : 'Family Contact'}</p>
                  <p className="font-bold text-lg">{patient.emergencyContact?.name || 'Not Set'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-200">{patient.emergencyContact?.relationship || ''}</p>
                  <p className="font-semibold mt-1">{patient.emergencyContact?.phone || ''}</p>
                </div>
                <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
              </div>
            </div>
          </button>

          {/* Ambulance Emergency */}
          <button
            onClick={() => window.location.href = 'tel:997'}
            className="group relative overflow-hidden p-5 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/25 text-left"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-red-200 uppercase tracking-wide">{language === 'ar' ? 'طوارئ' : 'Emergency'}</p>
                  <p className="font-bold text-lg">{language === 'ar' ? 'الإسعاف' : 'Ambulance'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-200">{language === 'ar' ? 'استجابة فورية ٢٤/٧' : '24/7 Immediate Response'}</p>
                  <p className="font-bold text-2xl mt-1">997</p>
                </div>
                <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors animate-pulse">
                  <Phone className="w-5 h-5" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </Card>

      {/* Modals */}
      <Modal isOpen={showNewAppointment} onClose={() => setShowNewAppointment(false)} title={language === 'ar' ? 'حجز موعد جديد' : 'Book New Appointment'}>
        <div className="space-y-4">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'اختر الطبيب' : 'Select Doctor'}
            </label>
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white"
              value={selectedDoctorId}
              onChange={handleDoctorSelect}
            >
              <option value="">{language === 'ar' ? 'اختر طبيباً' : 'Choose a doctor...'}</option>
              {doctorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Profile Card Preview */}
          {selectedDoctor && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedDoctor.nameEn.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{selectedDoctor.nameEn}</p>
                  <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{selectedDoctor.rating}</span>
                    <span className="text-sm text-blue-700 font-semibold ml-2">{selectedDoctor.consultationFee} SAR</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'اختر التاريخ' : 'Select Date'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(() => {
                const dates = [];
                for (let i = 0; i < 8; i++) {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();
                  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                  let displayLabel = dayName;
                  if (i === 0) displayLabel = language === 'ar' ? 'اليوم' : 'Today';
                  if (i === 1) displayLabel = language === 'ar' ? 'غداً' : 'Tomorrow';

                  dates.push(
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setNewAppointment(prev => ({ ...prev, date: dateStr }))}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                        newAppointment.date === dateStr
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <div className="text-xs font-medium">{displayLabel}</div>
                      <div className="text-lg font-bold">{dayNum}</div>
                      <div className="text-xs">{monthName}</div>
                    </button>
                  );
                }
                return dates;
              })()}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'اختر الوقت' : 'Select Time'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setNewAppointment(prev => ({ ...prev, time }))}
                  className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 text-sm font-medium ${
                    newAppointment.time === time
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Appointment Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'نوع الموعد' : 'Appointment Type'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'Consultation', labelEn: 'Consultation', labelAr: 'استشارة' },
                { value: 'Follow-up', labelEn: 'Follow-up', labelAr: 'متابعة' },
                { value: 'Checkup', labelEn: 'Checkup', labelAr: 'فحص' },
                { value: 'Lab Review', labelEn: 'Lab Review', labelAr: 'مراجعة معملية' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setNewAppointment(prev => ({ ...prev, type: type.value }))}
                  className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 hover:border-green-400 hover:bg-green-50 text-sm font-medium ${
                    newAppointment.type === type.value
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  {language === 'ar' ? type.labelAr : type.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Location Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'نوع الموقع' : 'Location Type'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* In-Person */}
              <button
                type="button"
                onClick={() => setNewAppointment(prev => ({
                  ...prev,
                  location: selectedDoctor?.hospital || 'In-Person Visit',
                  locationType: 'in-person'
                }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:border-purple-400 hover:bg-purple-50 ${
                  newAppointment.locationType === 'in-person'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Building className={`w-5 h-5 ${
                    newAppointment.locationType === 'in-person' ? 'text-purple-600' : 'text-gray-500'
                  }`} />
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      newAppointment.locationType === 'in-person' ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      {language === 'ar' ? 'في العيادة' : 'In-Person'}
                    </p>
                    {selectedDoctor && (
                      <p className="text-xs text-gray-600 mt-1">{selectedDoctor.hospital}</p>
                    )}
                  </div>
                </div>
              </button>

              {/* Online/Remote */}
              <button
                type="button"
                onClick={() => setNewAppointment(prev => ({
                  ...prev,
                  location: language === 'ar' ? 'استشارة عبر الإنترنت' : 'Online Consultation',
                  locationType: 'online'
                }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 ${
                  newAppointment.locationType === 'online'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Video className={`w-5 h-5 ${
                    newAppointment.locationType === 'online' ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      newAppointment.locationType === 'online' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {language === 'ar' ? 'عبر الإنترنت' : 'Online/Remote'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {language === 'ar' ? 'استشارة فيديو' : 'Video Consultation'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
            </label>
            <textarea
              className="w-full h-20 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              value={newAppointment.notes}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={language === 'ar' ? 'سبب الزيارة...' : 'Reason for visit...'}
            />
          </div>

          {/* Live Appointment Summary */}
          {selectedDoctorId && newAppointment.date && newAppointment.time && newAppointment.location && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 animate-fadeIn">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">
                    {language === 'ar' ? 'ملخص الموعد' : 'Appointment Summary'}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ar' ? 'الطبيب:' : 'Doctor:'}</span>
                      <span className="font-medium text-gray-900">{selectedDoctor?.nameEn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ar' ? 'التاريخ:' : 'Date:'}</span>
                      <span className="font-medium text-gray-900">
                        {new Date(newAppointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ar' ? 'الوقت:' : 'Time:'}</span>
                      <span className="font-medium text-gray-900">{newAppointment.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ar' ? 'النوع:' : 'Type:'}</span>
                      <span className="font-medium text-gray-900">{newAppointment.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'ar' ? 'الموقع:' : 'Location:'}</span>
                      <span className="font-medium text-gray-900">{newAppointment.location}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-gray-600">{language === 'ar' ? 'رسوم الاستشارة:' : 'Consultation Fee:'}</span>
                      <span className="text-lg font-bold text-blue-700">{selectedDoctor?.consultationFee} SAR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowNewAppointment(false);
                setSelectedDoctorId('');
                setNewAppointment({
                  doctor_id: '',
                  doctor_name: '',
                  specialization: '',
                  type: 'Consultation',
                  date: '',
                  time: '',
                  location: '',
                  locationType: '',
                  notes: ''
                });
              }}
              className="flex-1"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleBookAppointment}
              className="flex-1"
              disabled={!selectedDoctorId || !newAppointment.date || !newAppointment.time || !newAppointment.location}
            >
              {language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showNewEquipment} onClose={() => setShowNewEquipment(false)} title="Request Medical Equipment">
        <div className="space-y-5">
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              Submit your equipment request and our team will review it. Approved requests may be fulfilled by generous donors.
            </p>
          </div>

          <Input
            label="Equipment Name"
            value={newEquipmentRequest.equipment_name}
            onChange={(e) => setNewEquipmentRequest({...newEquipmentRequest, equipment_name: e.target.value})}
            placeholder="e.g., Wheelchair, Walking Frame, Blood Pressure Monitor"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white"
              value={newEquipmentRequest.category}
              onChange={(e) => setNewEquipmentRequest({...newEquipmentRequest, category: e.target.value})}
            >
              <option value="Mobility">🦽 Mobility Aids</option>
              <option value="Monitoring">📊 Health Monitoring</option>
              <option value="Safety">🛡️ Safety Equipment</option>
              <option value="Home Care">🏠 Home Care</option>
            </select>
          </div>

          <Input
            label="Description"
            value={newEquipmentRequest.description}
            onChange={(e) => setNewEquipmentRequest({...newEquipmentRequest, description: e.target.value})}
            placeholder="Briefly describe your need..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medical Reason</label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              value={newEquipmentRequest.medical_justification}
              onChange={(e) => setNewEquipmentRequest({...newEquipmentRequest, medical_justification: e.target.value})}
              placeholder="Explain why you need this equipment..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowNewEquipment(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleCreateEquipment}
              className="flex-1"
              disabled={!newEquipmentRequest.equipment_name || !newEquipmentRequest.description}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InteractivePatientDashboard;

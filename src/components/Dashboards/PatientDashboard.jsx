import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Calendar,
  AlertTriangle,
  Activity,
  Phone,
  ChevronRight,
  Plus,
  Package,
  Check,
  MapPin,
  Heart,
  Thermometer,
  Droplets,
  TrendingUp,
  Stethoscope,
  Clock,
  Star
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { doctors } from '../../data/mockData';
import { StatCard, Card, Badge, Button, Modal, Input, Avatar } from '../shared/UIComponents';
import { LineChart, AreaChart, DonutChart, SparklineChart } from '../shared/Charts';
import { clsx } from 'clsx';

const InteractivePatientDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const {
    patients,
    medicationReminders,
    appointments,
    equipmentRequests,
    fallAlerts,
    takeMedication,
    bookAppointment,
    createEquipmentRequest,
    addNotification,
  } = useApp();

  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewEquipment, setShowNewEquipment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctor_name: '',
    type: 'Consultation',
    notes: '',
    date: '',
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
  const myAlerts = fallAlerts.filter(a => a.patient_id === patientId);

  // Calculate medication adherence
  const avgAdherence = useMemo(() => {
    if (myMedications.length === 0) return 100;
    return Math.round(myMedications.reduce((acc, m) => acc + m.adherence_rate, 0) / myMedications.length);
  }, [myMedications]);

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
    bookAppointment({
      ...newAppointment,
      patient_id: patientId,
      doctor_id: '1',
      specialization: 'General',
    });
    setShowNewAppointment(false);
    setNewAppointment({ doctor_name: '', type: 'Consultation', notes: '', date: '' });
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
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcome')}, {language === 'ar' ? patient.name : patient.nameEn}!
        </h1>
        <p className="text-gray-600 mt-1">{t('patient_dashboard_subtitle')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t('my_medications')}
          value={myMedications.length}
          icon={Pill}
          color="blue"
          subtitle={`${myMedications.filter(m => m.adherence_rate >= 80).length} on track`}
        />
        <StatCard
          title={t('my_appointments')}
          value={myAppointments.length}
          icon={Calendar}
          color="green"
          subtitle="Upcoming"
        />
        <StatCard
          title={t('equipment_requests')}
          value={myEquipment.length}
          icon={Package}
          color="purple"
          subtitle={`${myEquipment.filter(e => e.status === 'Pending').length} pending`}
        />
        <StatCard
          title={t('fall_alerts')}
          value={myAlerts.length}
          icon={AlertTriangle}
          color="orange"
          subtitle={`${myAlerts.filter(a => a.status === 'Resolved').length} resolved`}
        />
      </div>

      {/* Health Metrics with Charts */}
      <Card
        title={t('health_metrics')}
        className="mb-8"
        action={
          <div className="flex items-center gap-2">
            {timeSinceReading && (
              <span className="text-sm text-gray-500">{timeSinceReading}</span>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={Activity}
              onClick={generateSensorReading}
              disabled={isReadingCooldown}
            >
              {isReadingCooldown ? 'Reading...' : 'Take Reading'}
            </Button>
          </div>
        }
      >
        {/* Vitals Grid with Sparklines */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.keys(currentReadings).map((type) => {
            const reading = currentReadings[type];
            const Icon = vitalIcons[type];
            const colors = vitalColors[type];
            const sparkData = vitalSparklineData[type];

            return (
              <div key={type} className={clsx('p-4 rounded-xl transition-all', colors.bg)}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={clsx('w-5 h-5', colors.icon)} />
                  <SparklineChart data={sparkData} height={30} color={colors.chart} />
                </div>
                <p className="text-xs text-gray-500">{type}</p>
                <p className="text-xl font-bold text-gray-900">{reading.value}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{reading.unit}</span>
                  <Badge
                    variant={reading.status === 'Normal' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {reading.status === 'Normal' ? (
                      <>{reading.status}</>
                    ) : (
                      <><TrendingUp className="w-3 h-3 mr-1" />{reading.status}</>
                    )}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

      </Card>

      {/* Charts Row - Blood Pressure, Adherence, Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Blood Pressure Trend Chart */}
        <Card className="md:col-span-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            {language === 'ar' ? 'اتجاه ضغط الدم' : 'Blood Pressure Trend'}
          </h4>
          <LineChart
            series={[
              { name: language === 'ar' ? 'الانقباضي' : 'Systolic', data: readingsHistory.bloodPressure.systolic },
              { name: language === 'ar' ? 'الانبساطي' : 'Diastolic', data: readingsHistory.bloodPressure.diastolic },
            ]}
            categories={historyLabels}
            height={160}
            colors={['#ef4444', '#3b82f6']}
          />
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

      {/* Health Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">{language === 'ar' ? 'نصيحة اليوم' : 'Daily Tip'}</h4>
          </div>
          <p className="text-sm text-blue-800">
            {language === 'ar'
              ? 'اشرب 8 أكواب من الماء يومياً للحفاظ على صحتك'
              : 'Drink 8 glasses of water daily to stay hydrated and maintain good health.'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">{language === 'ar' ? 'النشاط البدني' : 'Stay Active'}</h4>
          </div>
          <p className="text-sm text-green-800">
            {language === 'ar'
              ? 'المشي لمدة 30 دقيقة يومياً يحسن صحة القلب'
              : 'Walk for 30 minutes daily to improve heart health and circulation.'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">{language === 'ar' ? 'صحة القلب' : 'Heart Health'}</h4>
          </div>
          <p className="text-sm text-purple-800">
            {language === 'ar'
              ? 'قلل من الملح للحفاظ على ضغط دم صحي'
              : 'Reduce salt intake to maintain healthy blood pressure levels.'}
          </p>
        </div>
      </div>

      {/* Find a Doctor Section */}
      <Card
        title={language === 'ar' ? 'الأطباء المتاحون' : 'Available Doctors'}
        className="mb-8"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/patient/appointments')}>
            {language === 'ar' ? 'عرض الكل' : 'View All'} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.slice(0, 3).map((doctor) => (
            <div
              key={doctor.id}
              className="group p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <Avatar name={doctor.nameEn} size="lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {language === 'ar' ? doctor.name : doctor.nameEn}
                  </h4>
                  <p className="text-sm text-blue-600">{language === 'ar' ? doctor.specializationAr : doctor.specialization}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-600">{doctor.rating}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{doctor.hospital}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{doctor.availability}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Stethoscope className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">{doctor.consultationFee}</span>
                    <span className="text-xs text-gray-500">SAR</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    {language === 'ar' ? 'حجز' : 'Book'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

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

          {/* Medication Adherence Chart - Bar Chart for individual medication adherence */}
          {myMedications.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'معدل الالتزام لكل دواء' : 'Adherence by Medication'}
                </h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {language === 'ar' ? 'المتوسط' : 'Avg'}: {avgAdherence}%
                </span>
              </div>
              <div className="space-y-3">
                {myMedications.map((med) => (
                  <div key={med.id} className="flex items-center gap-3">
                    <div className="w-24 truncate text-sm text-gray-600">{med.medication_name}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-500",
                          med.adherence_rate >= 90 ? "bg-green-500" :
                          med.adherence_rate >= 70 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${med.adherence_rate}%` }}
                      />
                    </div>
                    <div className={clsx(
                      "text-sm font-medium w-12 text-right",
                      med.adherence_rate >= 90 ? "text-green-600" :
                      med.adherence_rate >= 70 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {med.adherence_rate}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

          {/* Weekly Activity Chart */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {language === 'ar' ? 'نشاط الأسبوع' : 'Weekly Activity'}
            </h4>
            <AreaChart
              series={[{ name: language === 'ar' ? 'درجة النشاط' : 'Activity', data: [45, 62, 78, 55, 82, 68, 75] }]}
              categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              height={140}
              colors={['#8b5cf6']}
            />
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
      <Modal isOpen={showNewAppointment} onClose={() => setShowNewAppointment(false)} title="Book New Appointment">
        <div className="space-y-4">
          <Input
            label="Doctor Name"
            value={newAppointment.doctor_name}
            onChange={(e) => setNewAppointment({...newAppointment, doctor_name: e.target.value})}
            placeholder="Dr. Ahmed Hassan"
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            value={newAppointment.date}
            onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
          />
          <Input
            label="Notes"
            value={newAppointment.notes}
            onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
            placeholder="Reason for visit..."
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowNewAppointment(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleBookAppointment} className="flex-1">
              Book Appointment
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

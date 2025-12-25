import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileText,
  Pill,
  Plus,
  Search,
  Stethoscope,
  Activity,
  ChevronRight,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Receipt,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  patients,
  getDoctorById,
  medications
} from '../../data/mockData';
import { StatCard, Card, Table, Badge, Button, Input, Modal, Avatar, Select } from '../shared/UIComponents';
import { DonutChart, AreaChart, RadialBarChart } from '../shared/Charts';
import { clsx } from 'clsx';

const InteractiveDoctorDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const {
    appointments,
    transactions,
    addClinicalNote,
    addPrescription,
    bookAppointment
  } = useApp();

  const [doctor, setDoctor] = useState(null);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAllAppointmentsModal, setShowAllAppointmentsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Clinical Note Form Data
  const [noteFormData, setNoteFormData] = useState({
    chief_complaint: '',
    clinical_notes: '',
    diagnosis: '',
    treatment_plan: ''
  });

  // Prescription Form Data
  const [prescriptionFormData, setPrescriptionFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  // Appointment Form Data
  const [appointmentFormData, setAppointmentFormData] = useState({
    date: '',
    time: '',
    type: 'Follow-up',
    notes: ''
  });

  useEffect(() => {
    const doctorData = getDoctorById(user?.id || '1');
    setDoctor(doctorData);

    const doctorId = user?.id || '1';

    // Filter appointments for this doctor from global state
    const docAppointments = appointments.filter(a => a.doctor_id === doctorId);
    setDoctorAppointments(docAppointments);
  }, [user, appointments]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getPatientAge = (dob) => {
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const filteredPatients = patients.filter(p => {
    const name = p.nameEn;
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.p_no.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const todaysAppointments = doctorAppointments.filter(a => {
    const aptDate = new Date(a.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  // Group appointments by Today, Tomorrow, and Later (only future/current appointments)
  const groupedAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const todayApts = [];
    const tomorrowApts = [];
    const laterApts = [];

    doctorAppointments.forEach(apt => {
      const aptDateTime = new Date(apt.date);
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);

      // Skip past appointments (before current time)
      if (aptDateTime < now && aptDate.getTime() < today.getTime()) {
        return;
      }

      if (aptDate.getTime() === today.getTime()) {
        todayApts.push(apt);
      } else if (aptDate.getTime() === tomorrow.getTime()) {
        tomorrowApts.push(apt);
      } else if (aptDate >= dayAfterTomorrow) {
        laterApts.push(apt);
      }
    });

    // Sort each group by time
    const sortByTime = (a, b) => new Date(a.date) - new Date(b.date);
    todayApts.sort(sortByTime);
    tomorrowApts.sort(sortByTime);
    laterApts.sort(sortByTime);

    return { today: todayApts, tomorrow: tomorrowApts, later: laterApts };
  }, [doctorAppointments]);

  // Total count of upcoming appointments
  const upcomingAppointmentsCount = groupedAppointments.today.length + groupedAppointments.tomorrow.length + groupedAppointments.later.length;

  // Patient demographics for chart
  const patientDemographics = useMemo(() => {
    const male = patients.filter(p => p.gender === 'Male').length;
    const female = patients.filter(p => p.gender === 'Female').length;
    return {
      series: [male, female],
      labels: [language === 'ar' ? 'ذكور' : 'Male', language === 'ar' ? 'إناث' : 'Female']
    };
  }, [language]);

  // Fall risk distribution
  const fallRiskDistribution = useMemo(() => {
    const high = patients.filter(p => p.fallRisk === 'High').length;
    const medium = patients.filter(p => p.fallRisk === 'Medium').length;
    const low = patients.filter(p => p.fallRisk === 'Low').length;
    return {
      series: [high, medium, low],
      labels: [
        language === 'ar' ? 'عالي' : 'High Risk',
        language === 'ar' ? 'متوسط' : 'Medium Risk',
        language === 'ar' ? 'منخفض' : 'Low Risk'
      ]
    };
  }, [language]);

  // Weekly consultation stats (mock data)
  const weeklyConsultations = useMemo(() => ({
    series: [{
      name: language === 'ar' ? 'الاستشارات' : 'Consultations',
      data: [8, 12, 10, 15, 9, 6, 4]
    }],
    categories: language === 'ar'
      ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }), [language]);

  // Appointment types distribution
  const appointmentTypes = useMemo(() => {
    const types = {};
    doctorAppointments.forEach(apt => {
      types[apt.type] = (types[apt.type] || 0) + 1;
    });
    return {
      series: Object.values(types).length > 0 ? Object.values(types) : [3, 2, 1],
      labels: Object.keys(types).length > 0 ? Object.keys(types) : ['Follow-up', 'Consultation', 'Checkup']
    };
  }, [doctorAppointments]);

  // Monthly consultations data for reports
  const monthlyConsultations = useMemo(() => ({
    series: [{
      name: language === 'ar' ? 'الاستشارات' : 'Consultations',
      data: [45, 52, 38, 65, 48, 72, 58, 61, 55, 70, 62, 48]
    }],
    categories: language === 'ar'
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }), [language]);

  // Age distribution for reports
  const ageDistribution = useMemo(() => {
    const ranges = { '60-65': 0, '66-70': 0, '71-75': 0, '76-80': 0, '80+': 0 };
    patients.forEach(p => {
      const age = getPatientAge(p.dateOfBirth);
      if (age <= 65) ranges['60-65']++;
      else if (age <= 70) ranges['66-70']++;
      else if (age <= 75) ranges['71-75']++;
      else if (age <= 80) ranges['76-80']++;
      else ranges['80+']++;
    });
    return {
      series: Object.values(ranges),
      labels: Object.keys(ranges)
    };
  }, []);

  // Medical conditions distribution
  const conditionsDistribution = useMemo(() => {
    const conditions = {};
    patients.forEach(p => {
      p.medicalConditions.forEach(c => {
        conditions[c] = (conditions[c] || 0) + 1;
      });
    });
    const sorted = Object.entries(conditions).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      series: sorted.map(([, count]) => count),
      labels: sorted.map(([name]) => name)
    };
  }, []);

  // Revenue trend data
  const revenueTrend = useMemo(() => ({
    series: [{
      name: language === 'ar' ? 'الإيرادات' : 'Revenue',
      data: [12500, 15000, 11800, 18200, 14500, 21000, 17500, 19200, 16800, 22500, 18900, 15600]
    }],
    categories: language === 'ar'
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }), [language]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get doctor's transactions from global state
  const doctorTransactions = transactions.filter(t => t.doctor_id === (user?.id || '1'));

  const handleAddClinicalNote = (patient) => {
    setSelectedPatient(patient);
    setNoteFormData({
      chief_complaint: '',
      clinical_notes: '',
      diagnosis: '',
      treatment_plan: ''
    });
    setShowNoteModal(true);
  };

  const handleSubmitClinicalNote = () => {
    if (!noteFormData.chief_complaint || !noteFormData.clinical_notes) {
      return;
    }

    const noteData = {
      patient_id: selectedPatient.id,
      doctor_id: doctor.id,
      transaction_type: 'Consultation',
      chief_complaint: noteFormData.chief_complaint,
      clinical_notes: noteFormData.clinical_notes,
      diagnosis: noteFormData.diagnosis || 'N/A',
      treatment_plan: noteFormData.treatment_plan || 'N/A',
      amount: doctor.consultationFee || 300
    };

    addClinicalNote(noteData);
    setShowNoteModal(false);
    setNoteFormData({
      chief_complaint: '',
      clinical_notes: '',
      diagnosis: '',
      treatment_plan: ''
    });
  };

  const handleAddPrescription = (patient) => {
    setSelectedPatient(patient);
    setPrescriptionFormData({
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setShowPrescriptionModal(true);
  };

  const handleSubmitPrescription = () => {
    if (!prescriptionFormData.medication_name || !prescriptionFormData.dosage) {
      return;
    }

    const prescriptionData = {
      patient_id: selectedPatient.id,
      doctor_id: doctor.id,
      transaction_type: 'Prescription',
      medications: [{
        name: prescriptionFormData.medication_name,
        dosage: prescriptionFormData.dosage,
        frequency: prescriptionFormData.frequency,
        duration: prescriptionFormData.duration,
        instructions: prescriptionFormData.instructions
      }],
      clinical_notes: `Prescription: ${prescriptionFormData.medication_name} ${prescriptionFormData.dosage}`,
      chief_complaint: 'Medication prescription',
      amount: 50
    };

    addPrescription(prescriptionData);
    setShowPrescriptionModal(false);
    setPrescriptionFormData({
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  const handleScheduleAppointment = (patient) => {
    setSelectedPatient(patient);
    setAppointmentFormData({
      date: '',
      time: '',
      type: 'Follow-up',
      notes: ''
    });
    setShowAppointmentModal(true);
  };

  const handleSubmitAppointment = () => {
    if (!appointmentFormData.date || !appointmentFormData.time) {
      return;
    }

    const appointmentData = {
      patient_id: selectedPatient.id,
      doctor_id: doctor.id,
      doctor_name: doctor.nameEn,
      date: `${appointmentFormData.date}T${appointmentFormData.time}:00Z`,
      type: appointmentFormData.type,
      notes: appointmentFormData.notes,
      location: doctor.hospital
    };

    bookAppointment(appointmentData);
    setShowAppointmentModal(false);
    setAppointmentFormData({
      date: '',
      time: '',
      type: 'Follow-up',
      notes: ''
    });
  };

  const statusColors = {
    Completed: 'success',
    Scheduled: 'info',
    Confirmed: 'success',
    'In Progress': 'warning',
    Active: 'success',
  };

  if (!doctor) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('welcome')}, {doctor.nameEn}!
        </h1>
        <p className="text-gray-600 mt-1">{t('doctor_dashboard_subtitle')}</p>
      </div>

      {/* Doctor Profile Card */}
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-4 bg-purple-100 rounded-xl">
            <Stethoscope className="w-12 h-12 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {doctor.nameEn}
            </h2>
            <p className="text-gray-600">
              {doctor.specialization}
            </p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span>{doctor.hospital}</span>
              <span>•</span>
              <span>{doctor.experience}</span>
              <span>•</span>
              <span>License: {doctor.license}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t('my_patients')}
          value={patients.length}
          icon={Users}
          color="blue"
          subtitle="Total patients"
        />
        <StatCard
          title={t('todays_appointments')}
          value={todaysAppointments.length}
          icon={Calendar}
          color="green"
          subtitle={`${doctorAppointments.length} total`}
        />
        <StatCard
          title={t('clinical_notes')}
          value={doctorTransactions.length}
          icon={FileText}
          color="purple"
          subtitle="This month"
        />
        <StatCard
          title={t('prescriptions')}
          value={doctorTransactions.filter(t => t.transaction_type === 'Prescription').length}
          icon={Pill}
          color="orange"
          subtitle="Active"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Weekly Consultations Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {language === 'ar' ? 'الاستشارات الأسبوعية' : 'Weekly Consultations'}
            </h3>
            <span className="text-sm text-gray-500">
              {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}
            </span>
          </div>
          <AreaChart
            series={weeklyConsultations.series}
            categories={weeklyConsultations.categories}
            height={180}
            colors={['#3b82f6']}
          />
        </Card>

        {/* Patient Demographics */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            {language === 'ar' ? 'توزيع المرضى' : 'Patient Demographics'}
          </h3>
          <DonutChart
            series={patientDemographics.series}
            labels={patientDemographics.labels}
            height={160}
            colors={['#3b82f6', '#ec4899']}
            centerText={{
              label: language === 'ar' ? 'المجموع' : 'Total',
              value: patients.length.toString()
            }}
          />
        </Card>

        {/* Fall Risk Distribution */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            {language === 'ar' ? 'مخاطر السقوط' : 'Fall Risk'}
          </h3>
          <RadialBarChart
            series={fallRiskDistribution.series.map(v => Math.round((v / patients.length) * 100))}
            labels={fallRiskDistribution.labels}
            height={160}
            colors={['#ef4444', '#f59e0b', '#22c55e']}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Appointments - Timeline View */}
        <Card
          title={language === 'ar' ? 'المواعيد القادمة' : 'Upcoming Appointments'}
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                <CalendarDays className="w-3.5 h-3.5" />
                {upcomingAppointmentsCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllAppointmentsModal(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
              </Button>
            </div>
          }
        >
          {(groupedAppointments.today.length > 0 || groupedAppointments.tomorrow.length > 0 || groupedAppointments.later.length > 0) ? (
            <div className="divide-y divide-gray-100">
              {/* Today's Appointments */}
              {groupedAppointments.today.length > 0 && (
                <>
                  <div className="pb-2 mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'اليوم' : 'Today'}
                    </span>
                  </div>
                  {groupedAppointments.today.map((apt) => {
                    const patient = patients.find(p => p.id === apt.patient_id);
                    return (
                      <div
                        key={apt.id}
                        className="flex items-center py-3 hover:bg-gray-50 -mx-4 px-4 cursor-pointer transition-colors duration-150"
                        onClick={() => handleAddClinicalNote(patient)}
                      >
                        <div className="w-14 flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-900">{formatTime(apt.date)}</span>
                        </div>
                        <div className="w-1 h-8 bg-green-500 rounded-full mx-3 flex-shrink-0" />
                        <Avatar name={patient?.nameEn} size="sm" />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient?.nameEn}
                          </p>
                          <p className="text-xs text-gray-500">{apt.type}</p>
                        </div>
                        <Badge variant={statusColors[apt.status]} size="sm">{apt.status}</Badge>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Tomorrow's Appointments */}
              {groupedAppointments.tomorrow.length > 0 && (
                <>
                  <div className="py-2 mt-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'غداً' : 'Tomorrow'}
                    </span>
                  </div>
                  {groupedAppointments.tomorrow.map((apt) => {
                    const patient = patients.find(p => p.id === apt.patient_id);
                    return (
                      <div
                        key={apt.id}
                        className="flex items-center py-3 hover:bg-gray-50 -mx-4 px-4 cursor-pointer transition-colors duration-150"
                      >
                        <div className="w-14 flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-900">{formatTime(apt.date)}</span>
                        </div>
                        <div className="w-1 h-8 bg-blue-500 rounded-full mx-3 flex-shrink-0" />
                        <Avatar name={patient?.nameEn} size="sm" />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient?.nameEn}
                          </p>
                          <p className="text-xs text-gray-500">{apt.type}</p>
                        </div>
                        <Badge variant={statusColors[apt.status]} size="sm">{apt.status}</Badge>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Later Appointments */}
              {groupedAppointments.later.length > 0 && (
                <>
                  <div className="py-2 mt-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {language === 'ar' ? 'قادم' : 'Upcoming'}
                    </span>
                  </div>
                  {groupedAppointments.later.slice(0, 4).map((apt) => {
                    const patient = patients.find(p => p.id === apt.patient_id);
                    return (
                      <div
                        key={apt.id}
                        className="flex items-center py-3 hover:bg-gray-50 -mx-4 px-4 cursor-pointer transition-colors duration-150"
                      >
                        <div className="w-14 flex-shrink-0 text-center">
                          <p className="text-xs text-gray-400">{formatDayDate(apt.date).split(' ')[0]}</p>
                          <p className="text-sm font-semibold text-gray-900">{new Date(apt.date).getDate()}</p>
                        </div>
                        <div className="w-1 h-8 bg-gray-300 rounded-full mx-3 flex-shrink-0" />
                        <Avatar name={patient?.nameEn} size="sm" />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient?.nameEn}
                          </p>
                          <p className="text-xs text-gray-500">{apt.type} · {formatTime(apt.date)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    );
                  })}
                  {groupedAppointments.later.length > 4 && (
                    <div className="pt-3 text-center">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        {language === 'ar' ? `عرض ${groupedAppointments.later.length - 4} المزيد` : `View ${groupedAppointments.later.length - 4} more`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">{language === 'ar' ? 'لا توجد مواعيد قادمة' : 'No upcoming appointments'}</p>
            </div>
          )}
        </Card>

        {/* Quick Actions & Appointment Types */}
        <Card title={language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}>
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={Plus}
              onClick={() => handleAddClinicalNote(patients[0])}
            >
              {t('add_clinical_note')}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={Pill}
              onClick={() => handleAddPrescription(patients[0])}
            >
              {t('add_prescription')}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={Calendar}
              onClick={() => handleScheduleAppointment(patients[0])}
            >
              {language === 'ar' ? 'جدولة موعد' : 'Schedule Appointment'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={Activity}
              onClick={() => setShowReportsModal(true)}
            >
              {language === 'ar' ? 'عرض التقارير' : 'View Reports'}
            </Button>
          </div>

          {/* Appointment Types Distribution */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-green-500" />
              {language === 'ar' ? 'أنواع المواعيد' : 'Appointment Types'}
            </h4>
            <DonutChart
              series={appointmentTypes.series}
              labels={appointmentTypes.labels}
              height={140}
              colors={['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6']}
            />
          </div>
        </Card>
      </div>

      {/* Patient List */}
      <Card
        title={t('patient_list')}
        action={
          <div className="flex items-center gap-4">
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="w-64"
            />
          </div>
        }
      >
        <Table
          columns={[
            {
              header: t('name'),
              render: (row) => (
                <div className="flex items-center gap-3">
                  <Avatar name={row.nameEn} size="sm" />
                  <div>
                    <p className="font-medium">{row.nameEn}</p>
                    <p className="text-xs text-gray-500">{row.p_no}</p>
                  </div>
                </div>
              )
            },
            {
              header: t('age'),
              render: (row) => getPatientAge(row.dateOfBirth)
            },
            {
              header: t('gender'),
              accessor: 'gender'
            },
            {
              header: t('conditions'),
              render: (row) => (
                <div className="flex flex-wrap gap-1">
                  {row.medicalConditions.slice(0, 2).map((c, i) => (
                    <Badge key={i} variant="info" size="sm">{c}</Badge>
                  ))}
                  {row.medicalConditions.length > 2 && (
                    <Badge variant="default" size="sm">+{row.medicalConditions.length - 2}</Badge>
                  )}
                </div>
              )
            },
            {
              header: t('fall_risk'),
              render: (row) => (
                <Badge variant={row.fallRisk === 'High' ? 'danger' : row.fallRisk === 'Medium' ? 'warning' : 'success'}>
                  {row.fallRisk}
                </Badge>
              )
            },
            {
              header: t('last_visit'),
              render: (row) => formatShortDate(row.lastCheckup)
            },
            {
              header: t('actions'),
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddClinicalNote(row)}
                    title="Add Clinical Note"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddPrescription(row)}
                    title="Add Prescription"
                  >
                    <Pill className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleScheduleAppointment(row)}
                    title="Schedule Appointment"
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              )
            }
          ]}
          data={filteredPatients}
        />
      </Card>

      {/* Quick Navigation to Detail Pages */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            {language === 'ar' ? 'الوصول السريع' : 'Quick Access'}
          </h3>
          <p className="text-sm text-gray-500">
            {language === 'ar' ? 'عرض التفاصيل الكاملة' : 'View full details'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/doctor/patients')}
            className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{language === 'ar' ? 'إدارة المرضى' : 'Patient Management'}</p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'عرض السجلات الكاملة' : 'View full records & history'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/doctor/appointments')}
            className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-green-100 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{language === 'ar' ? 'جميع المواعيد' : 'All Appointments'}</p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'الجدول الكامل والتاريخ' : 'Full schedule & history'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/doctor/records')}
            className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{language === 'ar' ? 'السجلات الطبية' : 'Medical Records'}</p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'الملاحظات والتقارير' : 'Notes & reports'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </button>
        </div>
      </Card>

      {/* Business Transactions / Revenue Summary */}
      <Card className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            {language === 'ar' ? 'ملخص الإيرادات' : 'Revenue Summary'}
          </h3>
          <Badge variant="success" size="sm">
            {language === 'ar' ? 'هذا الشهر' : 'This Month'}
          </Badge>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {doctorTransactions.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()} {t('sar')}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">{language === 'ar' ? 'الاستشارات' : 'Consultations'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {doctorTransactions.filter(t => t.transaction_type === 'Consultation').length}
            </p>
            <p className="text-sm text-gray-500">
              {doctorTransactions.filter(t => t.transaction_type === 'Consultation').reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()} {t('sar')}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pill className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">{language === 'ar' ? 'الوصفات' : 'Prescriptions'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {doctorTransactions.filter(t => t.transaction_type === 'Prescription').length}
            </p>
            <p className="text-sm text-gray-500">
              {doctorTransactions.filter(t => t.transaction_type === 'Prescription').reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()} {t('sar')}
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Receipt className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-600">{language === 'ar' ? 'المعاملات' : 'Transactions'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{doctorTransactions.length}</p>
            <p className="text-sm text-gray-500">
              {language === 'ar' ? 'إجمالي السجلات' : 'Total records'}
            </p>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            {language === 'ar' ? 'أحدث المعاملات' : 'Recent Transactions'}
          </h4>
          {doctorTransactions.length > 0 ? (
            <Table
              columns={[
                {
                  header: t('date'),
                  render: (row) => formatDate(row.created_at)
                },
                {
                  header: t('patient'),
                  render: (row) => {
                    const patient = patients.find(p => p.id === row.patient_id);
                    return (
                      <div className="flex items-center gap-2">
                        <Avatar name={patient?.nameEn} size="sm" />
                        <span>{patient?.nameEn}</span>
                      </div>
                    );
                  }
                },
                {
                  header: t('type'),
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      {row.transaction_type === 'Consultation' ? (
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                      ) : row.transaction_type === 'Prescription' ? (
                        <Pill className="w-4 h-4 text-purple-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-500" />
                      )}
                      <span>{row.transaction_type}</span>
                    </div>
                  )
                },
                {
                  header: t('chief_complaint'),
                  render: (row) => (
                    <p className="max-w-xs truncate">{row.chief_complaint}</p>
                  )
                },
                {
                  header: t('status'),
                  render: (row) => (
                    <div className="flex items-center gap-1">
                      {row.status === 'Completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      <Badge variant={statusColors[row.status]}>{row.status}</Badge>
                    </div>
                  )
                },
                {
                  header: t('amount'),
                  render: (row) => (
                    <span className="font-semibold text-green-600">{row.amount} {t('sar')}</span>
                  )
                }
              ]}
              data={doctorTransactions.slice(0, 5)}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{language === 'ar' ? 'لا توجد معاملات بعد' : 'No transactions yet'}</p>
              <p className="text-sm">{language === 'ar' ? 'ابدأ بإضافة ملاحظة سريرية!' : 'Start by adding a clinical note!'}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Clinical Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title={t('add_clinical_note')}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar name={selectedPatient?.nameEn} />
            <div>
              <p className="font-medium">{selectedPatient?.nameEn}</p>
              <p className="text-sm text-gray-500">{selectedPatient?.p_no}</p>
            </div>
          </div>
          <Input
            label={t('chief_complaint')}
            placeholder="Enter chief complaint"
            value={noteFormData.chief_complaint}
            onChange={(e) => setNoteFormData(prev => ({ ...prev, chief_complaint: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clinical_notes')}
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder="Enter clinical notes..."
              value={noteFormData.clinical_notes}
              onChange={(e) => setNoteFormData(prev => ({ ...prev, clinical_notes: e.target.value }))}
            />
          </div>
          <Input
            label="Diagnosis"
            placeholder="Enter diagnosis (optional)"
            value={noteFormData.diagnosis}
            onChange={(e) => setNoteFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treatment Plan
            </label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder="Enter treatment plan (optional)..."
              value={noteFormData.treatment_plan}
              onChange={(e) => setNoteFormData(prev => ({ ...prev, treatment_plan: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSubmitClinicalNote}
              disabled={!noteFormData.chief_complaint || !noteFormData.clinical_notes}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title={t('add_prescription')}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar name={selectedPatient?.nameEn} />
            <div>
              <p className="font-medium">{selectedPatient?.nameEn}</p>
              <p className="text-sm text-gray-500">{selectedPatient?.p_no}</p>
            </div>
          </div>
          <Select
            label={t('medication')}
            value={prescriptionFormData.medication_name}
            onChange={(e) => {
              const selectedMed = medications.find(m => m.name === e.target.value);
              setPrescriptionFormData(prev => ({
                ...prev,
                medication_name: e.target.value,
                dosage: selectedMed?.dosage?.split(' ')[0] || prev.dosage
              }));
            }}
            options={medications.map(med => ({
              value: med.name,
              label: `${med.name} - ${med.category}`
            }))}
            placeholder={language === 'ar' ? 'اختر الدواء...' : 'Select medication...'}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('dosage')}
              placeholder="e.g., 500mg"
              value={prescriptionFormData.dosage}
              onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, dosage: e.target.value }))}
            />
            <Input
              label={t('frequency')}
              placeholder="e.g., twice daily"
              value={prescriptionFormData.frequency}
              onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, frequency: e.target.value }))}
            />
          </div>
          <Input
            label="Duration"
            placeholder="e.g., 7 days"
            value={prescriptionFormData.duration}
            onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, duration: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder="Special instructions..."
              value={prescriptionFormData.instructions}
              onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, instructions: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowPrescriptionModal(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSubmitPrescription}
              disabled={!prescriptionFormData.medication_name || !prescriptionFormData.dosage}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Appointment Modal */}
      <Modal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        title="Schedule Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar name={selectedPatient?.nameEn} />
            <div>
              <p className="font-medium">{selectedPatient?.nameEn}</p>
              <p className="text-sm text-gray-500">{selectedPatient?.p_no}</p>
            </div>
          </div>

          {/* Quick Date Selection */}
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
                  const isToday = i === 0;
                  const isTomorrow = i === 1;
                  dates.push(
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setAppointmentFormData(prev => ({ ...prev, date: dateStr }))}
                      className={clsx(
                        'p-3 rounded-xl border-2 text-center transition-all',
                        appointmentFormData.date === dateStr
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      )}
                    >
                      <p className="text-xs text-gray-500">
                        {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dayName}
                      </p>
                      <p className="text-lg font-bold">{dayNum}</p>
                      <p className="text-xs text-gray-500">{monthName}</p>
                    </button>
                  );
                }
                return dates;
              })()}
            </div>
          </div>

          {/* Quick Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'اختر الوقت' : 'Select Time'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setAppointmentFormData(prev => ({ ...prev, time }))}
                  className={clsx(
                    'py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all',
                    appointmentFormData.time === time
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Appointment Type - Quick Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'نوع الموعد' : 'Appointment Type'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'Follow-up', label: 'Follow-up' },
                { value: 'Consultation', label: 'Consultation' },
                { value: 'Checkup', label: 'Checkup' },
                { value: 'Lab Review', label: 'Lab Review' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAppointmentFormData(prev => ({ ...prev, type: type.value }))}
                  className={clsx(
                    'py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all',
                    appointmentFormData.type === type.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes - Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="w-full h-16 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm resize-none"
              placeholder="Additional notes..."
              value={appointmentFormData.notes}
              onChange={(e) => setAppointmentFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Summary & Actions */}
          {appointmentFormData.date && appointmentFormData.time && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Scheduled for:</span>{' '}
                {new Date(appointmentFormData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {appointmentFormData.time}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAppointmentModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAppointment}
              disabled={!appointmentFormData.date || !appointmentFormData.time}
            >
              Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* All Appointments Modal */}
      <Modal
        isOpen={showAllAppointmentsModal}
        onClose={() => setShowAllAppointmentsModal(false)}
        title={language === 'ar' ? 'جميع المواعيد' : 'All Appointments'}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Today */}
          {groupedAppointments.today.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {language === 'ar' ? 'اليوم' : 'Today'} ({groupedAppointments.today.length})
              </h3>
              <div className="space-y-2">
                {groupedAppointments.today.map((apt) => {
                  const patient = patients.find(p => p.id === apt.patient_id);
                  return (
                    <div key={apt.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="w-20 flex-shrink-0 text-center">
                        <span className="text-sm font-bold text-green-700">{formatTime(apt.date)}</span>
                      </div>
                      <Avatar name={patient?.nameEn} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{patient?.nameEn}</p>
                        <p className="text-xs text-gray-500 truncate">{apt.type} • {apt.notes}</p>
                      </div>
                      <Badge variant={statusColors[apt.status]} size="sm">{apt.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tomorrow */}
          {groupedAppointments.tomorrow.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {language === 'ar' ? 'غداً' : 'Tomorrow'} ({groupedAppointments.tomorrow.length})
              </h3>
              <div className="space-y-2">
                {groupedAppointments.tomorrow.map((apt) => {
                  const patient = patients.find(p => p.id === apt.patient_id);
                  return (
                    <div key={apt.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-20 flex-shrink-0 text-center">
                        <span className="text-sm font-bold text-blue-700">{formatTime(apt.date)}</span>
                      </div>
                      <Avatar name={patient?.nameEn} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{patient?.nameEn}</p>
                        <p className="text-xs text-gray-500 truncate">{apt.type} • {apt.notes}</p>
                      </div>
                      <Badge variant={statusColors[apt.status]} size="sm">{apt.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {groupedAppointments.later.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                {language === 'ar' ? 'قادم' : 'Upcoming'} ({groupedAppointments.later.length})
              </h3>
              <div className="space-y-2">
                {groupedAppointments.later.map((apt) => {
                  const patient = patients.find(p => p.id === apt.patient_id);
                  return (
                    <div key={apt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-20 flex-shrink-0 text-center">
                        <p className="text-[10px] text-gray-400 uppercase">{formatDayDate(apt.date)}</p>
                        <span className="text-sm font-bold text-gray-700">{formatTime(apt.date)}</span>
                      </div>
                      <Avatar name={patient?.nameEn} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{patient?.nameEn}</p>
                        <p className="text-xs text-gray-500 truncate">{apt.type} • {apt.notes}</p>
                      </div>
                      <Badge variant={statusColors[apt.status]} size="sm">{apt.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {upcomingAppointmentsCount === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{language === 'ar' ? 'لا توجد مواعيد' : 'No upcoming appointments'}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end pt-4 border-t mt-4">
          <Button variant="secondary" onClick={() => setShowAllAppointmentsModal(false)}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </Modal>

      {/* Reports Modal */}
      <Modal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        title={language === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Analytics'}
        size="xl"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              <p className="text-xs text-gray-600">{language === 'ar' ? 'إجمالي المرضى' : 'Total Patients'}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
              <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{doctorAppointments.length}</p>
              <p className="text-xs text-gray-600">{language === 'ar' ? 'المواعيد' : 'Appointments'}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
              <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{doctorTransactions.length}</p>
              <p className="text-xs text-gray-600">{language === 'ar' ? 'السجلات' : 'Records'}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
              <DollarSign className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {doctorTransactions.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">{language === 'ar' ? 'الإيرادات (ر.س)' : 'Revenue (SAR)'}</p>
            </div>
          </div>

          {/* Monthly Consultations Chart */}
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              {language === 'ar' ? 'الاستشارات الشهرية' : 'Monthly Consultations'}
            </h3>
            <AreaChart
              series={monthlyConsultations.series}
              categories={monthlyConsultations.categories}
              height={220}
              colors={['#3b82f6']}
            />
          </div>

          {/* Two Column Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Age Distribution */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                {language === 'ar' ? 'توزيع الأعمار' : 'Age Distribution'}
              </h3>
              <DonutChart
                series={ageDistribution.series}
                labels={ageDistribution.labels}
                height={180}
                colors={['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']}
                centerText={{
                  label: language === 'ar' ? 'المرضى' : 'Patients',
                  value: patients.length.toString()
                }}
              />
            </div>

            {/* Gender Distribution */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-500" />
                {language === 'ar' ? 'توزيع الجنس' : 'Gender Distribution'}
              </h3>
              <DonutChart
                series={patientDemographics.series}
                labels={patientDemographics.labels}
                height={180}
                colors={['#3b82f6', '#ec4899']}
                centerText={{
                  label: language === 'ar' ? 'المجموع' : 'Total',
                  value: patients.length.toString()
                }}
              />
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              {language === 'ar' ? 'اتجاه الإيرادات' : 'Revenue Trend'}
            </h3>
            <AreaChart
              series={revenueTrend.series}
              categories={revenueTrend.categories}
              height={220}
              colors={['#22c55e']}
            />
          </div>

          {/* Two More Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Medical Conditions */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                {language === 'ar' ? 'الحالات الطبية الشائعة' : 'Common Conditions'}
              </h3>
              <DonutChart
                series={conditionsDistribution.series}
                labels={conditionsDistribution.labels}
                height={180}
                colors={['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6']}
              />
            </div>

            {/* Fall Risk Distribution */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {language === 'ar' ? 'توزيع مخاطر السقوط' : 'Fall Risk Distribution'}
              </h3>
              <RadialBarChart
                series={fallRiskDistribution.series.map(v => Math.round((v / patients.length) * 100))}
                labels={fallRiskDistribution.labels}
                height={180}
                colors={['#ef4444', '#f59e0b', '#22c55e']}
              />
            </div>
          </div>

          {/* Appointment Types */}
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              {language === 'ar' ? 'أنواع المواعيد' : 'Appointment Types'}
            </h3>
            <div className="flex items-center justify-center">
              <DonutChart
                series={appointmentTypes.series}
                labels={appointmentTypes.labels}
                height={200}
                colors={['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6']}
                centerText={{
                  label: language === 'ar' ? 'المواعيد' : 'Appointments',
                  value: doctorAppointments.length.toString()
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button variant="secondary" onClick={() => setShowReportsModal(false)}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default InteractiveDoctorDashboard;

import { useState, useEffect, useMemo } from 'react';
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
  CalendarDays
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  patients,
  getDoctorById
} from '../../data/mockData';
import { StatCard, Card, Table, Badge, Button, Input, Modal, Avatar, Select } from '../shared/UIComponents';
import { clsx } from 'clsx';

const InteractiveDoctorDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
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
    const name = language === 'ar' ? p.name : p.nameEn;
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
          {t('welcome')}, {language === 'ar' ? doctor.name : doctor.nameEn}!
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
              {language === 'ar' ? doctor.name : doctor.nameEn}
            </h2>
            <p className="text-gray-600">
              {language === 'ar' ? doctor.specializationAr : doctor.specialization}
            </p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span>{doctor.hospital}</span>
              <span>•</span>
              <span>{doctor.experience}</span>
              <span>•</span>
              <span>License: {doctor.license}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 text-yellow-500">
              {'★'.repeat(Math.floor(doctor.rating))}
              <span className="text-gray-600 ml-1">{doctor.rating}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {doctor.consultationFee} {t('sar')} <span className="text-sm font-normal text-gray-500">/ consultation</span>
            </p>
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
                        <Avatar name={language === 'ar' ? patient?.name : patient?.nameEn} size="sm" />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {language === 'ar' ? patient?.name : patient?.nameEn}
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
                        <Avatar name={language === 'ar' ? patient?.name : patient?.nameEn} size="sm" />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {language === 'ar' ? patient?.name : patient?.nameEn}
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
                        <Avatar name={language === 'ar' ? patient?.name : patient?.nameEn} size="sm" />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {language === 'ar' ? patient?.name : patient?.nameEn}
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

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
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
              Schedule Appointment
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={Activity}
            >
              View Reports
            </Button>
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
                  <Avatar name={language === 'ar' ? row.name : row.nameEn} size="sm" />
                  <div>
                    <p className="font-medium">{language === 'ar' ? row.name : row.nameEn}</p>
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

      {/* Recent Transactions/Consultations */}
      <Card title={t('clinical_notes')} className="mt-8">
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
                  return language === 'ar' ? patient?.name : patient?.nameEn;
                }
              },
              {
                header: t('type'),
                accessor: 'transaction_type'
              },
              {
                header: t('chief_complaint'),
                accessor: 'chief_complaint'
              },
              {
                header: t('notes'),
                render: (row) => (
                  <p className="max-w-xs truncate">{row.clinical_notes}</p>
                )
              },
              {
                header: t('status'),
                render: (row) => (
                  <Badge variant={statusColors[row.status]}>{row.status}</Badge>
                )
              },
              {
                header: t('amount'),
                render: (row) => `${row.amount} ${t('sar')}`
              }
            ]}
            data={doctorTransactions}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No clinical notes yet. Start by adding a consultation note!</p>
          </div>
        )}
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
          <Input
            label={t('medication')}
            placeholder="Medication name"
            value={prescriptionFormData.medication_name}
            onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, medication_name: e.target.value }))}
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={appointmentFormData.date}
              onChange={(e) => setAppointmentFormData(prev => ({ ...prev, date: e.target.value }))}
            />
            <Input
              type="time"
              label="Time"
              value={appointmentFormData.time}
              onChange={(e) => setAppointmentFormData(prev => ({ ...prev, time: e.target.value }))}
            />
          </div>
          <Select
            label={language === 'ar' ? 'نوع الموعد' : 'Appointment Type'}
            value={appointmentFormData.type}
            onChange={(e) => setAppointmentFormData(prev => ({ ...prev, type: e.target.value }))}
            options={[
              { value: 'Follow-up', label: language === 'ar' ? 'متابعة' : 'Follow-up' },
              { value: 'Consultation', label: language === 'ar' ? 'استشارة' : 'Consultation' },
              { value: 'Checkup', label: language === 'ar' ? 'فحص' : 'Checkup' },
              { value: 'Lab Review', label: language === 'ar' ? 'مراجعة المختبر' : 'Lab Review' },
            ]}
            placeholder=""
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder="Additional notes..."
              value={appointmentFormData.notes}
              onChange={(e) => setAppointmentFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3">
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
                      <Avatar name={language === 'ar' ? patient?.name : patient?.nameEn} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{language === 'ar' ? patient?.name : patient?.nameEn}</p>
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
                      <Avatar name={language === 'ar' ? patient?.name : patient?.nameEn} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{language === 'ar' ? patient?.name : patient?.nameEn}</p>
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
                      <Avatar name={language === 'ar' ? patient?.name : patient?.nameEn} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{language === 'ar' ? patient?.name : patient?.nameEn}</p>
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
    </div>
  );
};

export default InteractiveDoctorDashboard;

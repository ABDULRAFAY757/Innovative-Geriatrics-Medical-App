import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  FileText,
  Pill,
  Plus,
  Search,
  Stethoscope,
  Activity
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  patients,
  getDoctorById,
  appointments
} from '../../data/mockData';
import { StatCard, Card, Table, Badge, Button, Input, Modal, Avatar } from '../shared/UIComponents';
import { clsx } from 'clsx';

const InteractiveDoctorDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const {
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

    // Filter appointments for this doctor
    const docAppointments = appointments.filter(a => a.doctor_id === doctorId);
    setDoctorAppointments(docAppointments);
  }, [user]);

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
        {/* Today's Appointments */}
        <Card
          title={t('todays_appointments')}
          className="lg:col-span-2"
        >
          {todaysAppointments.length > 0 ? (
            <div className="space-y-4">
              {todaysAppointments.map((apt) => {
                const patient = patients.find(p => p.id === apt.patient_id);
                return (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar name={language === 'ar' ? patient?.name : patient?.nameEn} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'ar' ? patient?.name : patient?.nameEn}
                        </p>
                        <p className="text-sm text-gray-500">{apt.type} - {apt.notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatDate(apt.date)}</p>
                        <Badge variant={statusColors[apt.status]} size="sm">{apt.status}</Badge>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddClinicalNote(patient)}
                      >
                        Start Consultation
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No appointments scheduled for today</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={appointmentFormData.type}
              onChange={(e) => setAppointmentFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="Follow-up">Follow-up</option>
              <option value="Consultation">Consultation</option>
              <option value="Checkup">Checkup</option>
              <option value="Lab Review">Lab Review</option>
            </select>
          </div>
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
    </div>
  );
};

export default InteractiveDoctorDashboard;

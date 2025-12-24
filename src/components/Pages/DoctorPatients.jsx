import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { patients as allPatients } from '../../data/mockData';
import {
  Users,
  Search,
  FileText,
  Pill,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Card, Table, Badge, Button, Input, Modal, Avatar } from '../shared/UIComponents';
import { clsx } from 'clsx';

const DoctorPatients = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const {
    addClinicalNote,
    addPrescription,
    bookAppointment,
    medicationReminders,
    healthMetrics
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const [noteFormData, setNoteFormData] = useState({
    chief_complaint: '',
    clinical_notes: '',
    diagnosis: '',
    treatment_plan: ''
  });

  const [prescriptionFormData, setPrescriptionFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  const [appointmentFormData, setAppointmentFormData] = useState({
    date: '',
    time: '',
    type: 'Follow-up',
    notes: ''
  });

  const filteredPatients = allPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.p_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleAddNote = (patient) => {
    setSelectedPatient(patient);
    setNoteFormData({
      chief_complaint: '',
      clinical_notes: '',
      diagnosis: '',
      treatment_plan: ''
    });
    setShowNoteModal(true);
  };

  const handleSubmitNote = () => {
    if (!noteFormData.chief_complaint || !noteFormData.clinical_notes) {
      return;
    }

    const noteData = {
      patient_id: selectedPatient.id,
      doctor_id: user?.id || '1',
      transaction_type: 'Consultation',
      chief_complaint: noteFormData.chief_complaint,
      clinical_notes: noteFormData.clinical_notes,
      diagnosis: noteFormData.diagnosis || 'N/A',
      treatment_plan: noteFormData.treatment_plan || 'N/A',
      amount: 300
    };

    addClinicalNote(noteData);
    setShowNoteModal(false);
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
      doctor_id: user?.id || '1',
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
      doctor_id: user?.id || '1',
      doctor_name: user?.name || 'Dr. Ahmed Hassan',
      date: `${appointmentFormData.date}T${appointmentFormData.time}:00Z`,
      type: appointmentFormData.type,
      notes: appointmentFormData.notes,
      location: 'King Fahad Medical City'
    };

    bookAppointment(appointmentData);
    setShowAppointmentModal(false);
  };

  const statusColors = {
    Active: 'success',
    'At Risk': 'warning',
    Critical: 'danger',
  };

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-600 mt-1">Manage and view your patient records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{allPatients.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {allPatients.filter(p => p.status === 'Active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-gray-900">
                {allPatients.filter(p => p.status === 'At Risk').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Notes Today</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <Input
          placeholder="Search patients by name or patient number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />
      </Card>

      {/* Patient List */}
      <Card title="Patient List">
        <Table
          columns={[
            {
              header: 'Patient',
              render: (row) => (
                <div className="flex items-center gap-3">
                  <Avatar name={row.nameEn} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {language === 'ar' ? row.name : row.nameEn}
                    </p>
                    <p className="text-sm text-gray-500">{row.p_no}</p>
                  </div>
                </div>
              )
            },
            {
              header: 'Age',
              accessor: 'age'
            },
            {
              header: 'Conditions',
              render: (row) => (
                <div className="flex flex-wrap gap-1">
                  {(row.conditions || []).slice(0, 2).map((condition, idx) => (
                    <Badge key={idx} variant="info" size="sm">
                      {condition}
                    </Badge>
                  ))}
                  {(row.conditions || []).length > 2 && (
                    <Badge variant="default" size="sm">
                      +{row.conditions.length - 2}
                    </Badge>
                  )}
                </div>
              )
            },
            {
              header: 'Last Visit',
              render: (row) => formatDate(row.lastCheckup)
            },
            {
              header: 'Status',
              render: (row) => (
                <Badge variant={statusColors[row.status]}>
                  {row.status}
                </Badge>
              )
            },
            {
              header: 'Contact',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" title={row.phone}>
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title={row.email}>
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              )
            },
            {
              header: 'Actions',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewPatient(row)}
                    title="View Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddNote(row)}
                    title="Add Note"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddPrescription(row)}
                    title="Prescribe"
                  >
                    <Pill className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleScheduleAppointment(row)}
                    title="Schedule"
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

      {/* Patient Details Modal */}
      <Modal
        isOpen={showPatientDetails}
        onClose={() => setShowPatientDetails(false)}
        title="Patient Details"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar name={selectedPatient.nameEn} size="lg" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPatient.nameEn}</h3>
                <p className="text-gray-600">{selectedPatient.p_no}</p>
                <Badge variant={statusColors[selectedPatient.status]}>
                  {selectedPatient.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{selectedPatient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{selectedPatient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedPatient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedPatient.email}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Medical Conditions</p>
              <div className="flex flex-wrap gap-2">
                {(selectedPatient.conditions || []).map((condition, idx) => (
                  <Badge key={idx} variant="info">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Current Medications</p>
              <div className="space-y-2">
                {medicationReminders
                  .filter(m => m.patient_id === selectedPatient.id)
                  .slice(0, 3)
                  .map((med, idx) => (
                    <div key={idx} className="p-2 bg-blue-50 rounded text-sm">
                      <p className="font-medium">{med.medication_name}</p>
                      <p className="text-gray-600">{med.dosage} - {med.frequency}</p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={() => handleAddNote(selectedPatient)} className="flex-1">
                Add Clinical Note
              </Button>
              <Button variant="outline" onClick={() => handleAddPrescription(selectedPatient)} className="flex-1">
                Write Prescription
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Clinical Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Clinical Note"
        size="lg"
      >
        <div className="space-y-4">
          {selectedPatient && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar name={selectedPatient.nameEn} />
              <div>
                <p className="font-medium">{selectedPatient.nameEn}</p>
                <p className="text-sm text-gray-500">{selectedPatient.p_no}</p>
              </div>
            </div>
          )}
          <Input
            label="Chief Complaint"
            placeholder="Enter chief complaint"
            value={noteFormData.chief_complaint}
            onChange={(e) => setNoteFormData(prev => ({ ...prev, chief_complaint: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinical Notes
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
              Cancel
            </Button>
            <Button
              onClick={handleSubmitNote}
              disabled={!noteFormData.chief_complaint || !noteFormData.clinical_notes}
            >
              Save Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title="Write Prescription"
        size="lg"
      >
        <div className="space-y-4">
          {selectedPatient && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar name={selectedPatient.nameEn} />
              <div>
                <p className="font-medium">{selectedPatient.nameEn}</p>
                <p className="text-sm text-gray-500">{selectedPatient.p_no}</p>
              </div>
            </div>
          )}
          <Input
            label="Medication Name"
            placeholder="Medication name"
            value={prescriptionFormData.medication_name}
            onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, medication_name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dosage"
              placeholder="e.g., 500mg"
              value={prescriptionFormData.dosage}
              onChange={(e) => setPrescriptionFormData(prev => ({ ...prev, dosage: e.target.value }))}
            />
            <Input
              label="Frequency"
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
              Special Instructions
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
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPrescription}
              disabled={!prescriptionFormData.medication_name || !prescriptionFormData.dosage}
            >
              Issue Prescription
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
          {selectedPatient && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar name={selectedPatient.nameEn} />
              <div>
                <p className="font-medium">{selectedPatient.nameEn}</p>
                <p className="text-sm text-gray-500">{selectedPatient.p_no}</p>
              </div>
            </div>
          )}
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
              Schedule Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorPatients;

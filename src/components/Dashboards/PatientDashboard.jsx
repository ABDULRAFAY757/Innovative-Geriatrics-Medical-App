import React, { useState } from 'react';
import {
  Pill,
  Calendar,
  AlertTriangle,
  Activity,
  Phone,
  Clock,
  ChevronRight,
  Plus,
  Clipboard,
  Package,
  Check
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { StatCard, Card, Table, Badge, Button, ProgressBar, Alert, Modal, Input } from '../shared/UIComponents';
import PaymentModal from '../shared/PaymentModal';
import { clsx } from 'clsx';

const InteractivePatientDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const {
    patients,
    medicationReminders,
    appointments,
    equipmentRequests,
    fallAlerts,
    healthMetrics,
    takeMedication,
    bookAppointment,
    createEquipmentRequest,
    addHealthMetric,
  } = useApp();

  const [showPayment, setShowPayment] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewEquipment, setShowNewEquipment] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ amount: 0, description: '' });
  const [newAppointment, setNewAppointment] = useState({
    doctor_name: '',
    type: 'Consultation',
    notes: '',
    date: '',
  });
  const [newEquipmentRequest, setNewEquipmentRequest] = useState({
    equipment_name: '',
    description: '',
    urgency: 'Medium',
    category: 'Mobility',
    estimated_cost: 0,
    medical_justification: '',
  });
  const [newMetric, setNewMetric] = useState({
    type: 'Blood Pressure',
    value: '',
    unit: 'mmHg',
    status: 'Normal',
  });

  const patient = patients.find(p => p.id === (user?.id || '1'));
  const patientId = user?.id || '1';

  const myMedications = medicationReminders.filter(m => m.patient_id === patientId);
  const myAppointments = appointments.filter(a => a.patient_id === patientId);
  const myEquipment = equipmentRequests.filter(e => e.patient_id === patientId);
  const myAlerts = fallAlerts.filter(a => a.patient_id === patientId);
  const myMetrics = healthMetrics.filter(m => m.patient_id === patientId);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTakeMedication = (medicationId) => {
    takeMedication(medicationId);
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
      urgency: 'Medium',
      category: 'Mobility',
      estimated_cost: 0,
      medical_justification: '',
    });
  };

  const handleAddMetric = () => {
    addHealthMetric({
      ...newMetric,
      patient_id: patientId,
    });
    setShowAddMetric(false);
    setNewMetric({ type: 'Blood Pressure', value: '', unit: 'mmHg', status: 'Normal' });
  };

  const handlePayment = (amount, description) => {
    setPaymentDetails({ amount, description });
    setShowPayment(true);
  };

  if (!patient) {
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
          <div className="space-y-4">
            {myMedications.slice(0, 3).map((med) => (
              <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Pill className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{med.medication_name}</p>
                    <p className="text-sm text-gray-500">{med.dosage} - {med.frequency}</p>
                    <div className="mt-1 w-32">
                      <ProgressBar
                        value={med.adherence_rate}
                        color={med.adherence_rate >= 80 ? 'green' : 'yellow'}
                        showLabel={true}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {med.time}
                    </div>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    icon={Check}
                    onClick={() => handleTakeMedication(med.id)}
                  >
                    Take
                  </Button>
                </div>
              </div>
            ))}
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
              <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.doctor_name}</p>
                    <p className="text-sm text-gray-500">{apt.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatDate(apt.date)}</p>
                  <Badge variant={apt.status === 'Confirmed' ? 'success' : 'info'} size="sm">
                    {apt.status}
                  </Badge>
                </div>
              </div>
            ))}
            {myAppointments.length === 0 && (
              <p className="text-center text-gray-500 py-4">{t('no_appointments')}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Health Metrics - INTERACTIVE */}
      <Card
        title={t('health_metrics')}
        className="mb-8"
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddMetric(true)}
          >
            Add Metric
          </Button>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {myMetrics.slice(-4).map((metric) => (
            <div key={metric.id} className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors cursor-pointer">
              <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{metric.type}</p>
              <p className="text-xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-400">{metric.unit}</p>
              <Badge
                variant={metric.status === 'Normal' ? 'success' : 'warning'}
                size="sm"
                className="mt-2"
              >
                {metric.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

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
          {myEquipment.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{req.equipment_name}</p>
                  <p className="text-sm text-gray-500">{req.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={req.urgency === 'High' ? 'danger' : 'warning'}>{req.urgency}</Badge>
                <Badge variant={req.status === 'Fulfilled' ? 'success' : 'info'}>{req.status}</Badge>
                {req.status === 'Pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePayment(req.estimated_cost, req.equipment_name)}
                  >
                    Pay {req.estimated_cost} SAR
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency Contacts */}
      <Card title={t('emergency_contacts')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="p-3 bg-red-100 rounded-full">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{patient.emergencyContact.name}</p>
              <p className="text-sm text-gray-600">{patient.emergencyContact.relationship}</p>
              <p className="text-sm text-red-600 font-medium">{patient.emergencyContact.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clipboard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{t('insurance')}</p>
              <p className="text-sm text-gray-600">{patient.insuranceProvider}</p>
              <p className="text-sm text-blue-600 font-medium">{patient.insuranceNumber}</p>
            </div>
          </div>
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
        <div className="space-y-4">
          <Input
            label="Equipment Name"
            value={newEquipmentRequest.equipment_name}
            onChange={(e) => setNewEquipmentRequest({...newEquipmentRequest, equipment_name: e.target.value})}
            placeholder="Wheelchair, Walker, etc."
          />
          <Input
            label="Description"
            value={newEquipmentRequest.description}
            onChange={(e) => setNewEquipmentRequest({...newEquipmentRequest, description: e.target.value})}
            placeholder="Brief description..."
          />
          <Input
            label="Estimated Cost (SAR)"
            type="number"
            value={newEquipmentRequest.estimated_cost}
            onChange={(e) => setNewEquipmentRequest({...newEquipmentRequest, estimated_cost: parseInt(e.target.value)})}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical Justification</label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              rows="3"
              value={newEquipmentRequest.medical_justification}
              onChange={(e) => setNewEquipmentRequest({...newEquipmentRequest, medical_justification: e.target.value})}
              placeholder="Why is this equipment needed?"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowNewEquipment(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreateEquipment} className="flex-1">
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddMetric} onClose={() => setShowAddMetric(false)} title="Add Health Metric">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metric Type</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={newMetric.type}
              onChange={(e) => setNewMetric({...newMetric, type: e.target.value})}
            >
              <option>Blood Pressure</option>
              <option>Blood Sugar</option>
              <option>Heart Rate</option>
              <option>Weight</option>
              <option>Temperature</option>
            </select>
          </div>
          <Input
            label="Value"
            value={newMetric.value}
            onChange={(e) => setNewMetric({...newMetric, value: e.target.value})}
            placeholder="e.g., 120/80, 98, 72"
          />
          <Input
            label="Unit"
            value={newMetric.unit}
            onChange={(e) => setNewMetric({...newMetric, unit: e.target.value})}
            placeholder="mmHg, mg/dL, bpm, kg, °C"
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddMetric(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddMetric} className="flex-1">
              Add Metric
            </Button>
          </div>
        </div>
      </Modal>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={paymentDetails.amount}
        description={paymentDetails.description}
        onSuccess={() => setShowPayment(false)}
      />
    </div>
  );
};

export default InteractivePatientDashboard;

import { useState, useEffect } from 'react';
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
  MapPin
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { StatCard, Card, Badge, Button, Modal, Input } from '../shared/UIComponents';
import { clsx } from 'clsx';

const InteractivePatientDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
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
    const newReadings = {
      'Blood Pressure': {
        value: `${Math.floor(Math.random() * 30) + 110}/${Math.floor(Math.random() * 20) + 70}`,
        unit: 'mmHg',
        status: Math.random() > 0.7 ? 'High' : 'Normal',
      },
      'Heart Rate': {
        value: `${Math.floor(Math.random() * 40) + 60}`,
        unit: 'bpm',
        status: Math.random() > 0.8 ? 'High' : 'Normal',
      },
      'Temperature': {
        value: `${(Math.random() * 1.5 + 36.5).toFixed(1)}`,
        unit: '°C',
        status: Math.random() > 0.9 ? 'High' : 'Normal',
      },
      'Blood Oxygen': {
        value: `${Math.floor(Math.random() * 5) + 95}`,
        unit: '%',
        status: Math.random() > 0.85 ? 'Low' : 'Normal',
      },
    };

    // Update local state immediately for instant UI update
    setCurrentReadings(newReadings);

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

      {/* Health Metrics - INTERACTIVE */}
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
              {isReadingCooldown ? 'Reading...' : 'Last Reading'}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(currentReadings).map((type) => {
            const reading = currentReadings[type];
            return (
              <div key={type} className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors cursor-pointer">
                <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{type}</p>
                <p className="text-xl font-bold text-gray-900">{reading.value}</p>
                <p className="text-xs text-gray-400">{reading.unit}</p>
                <Badge
                  variant={reading.status === 'Normal' ? 'success' : 'warning'}
                  size="sm"
                  className="mt-2"
                >
                  {reading.status}
                </Badge>
              </div>
            );
          })}
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

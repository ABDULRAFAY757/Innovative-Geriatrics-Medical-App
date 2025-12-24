import React, { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { StatCard, Card, Badge, Button, Alert, Avatar, Modal, Input } from '../shared/UIComponents';
import { clsx } from 'clsx';

const InteractiveFamilyDashboard = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const {
    patients,
    careTasks,
    appointments,
    fallAlerts,
    healthMetrics,
    medicationReminders,
    familyMembers,
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
  const myMetrics = healthMetrics.filter(m => m.patient_id === patientId);
  const myMedications = medicationReminders.filter(m => m.patient_id === patientId);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
  };

  if (!patient) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  const pendingTasks = myTasks.filter(t => t.status === 'Pending').length;
  const unresolvedAlerts = myAlerts.filter(a => a.status !== 'Resolved').length;
  const avgAdherence = myMedications.length > 0
    ? Math.round(myMedications.reduce((acc, m) => acc + m.adherence_rate, 0) / myMedications.length)
    : 0;

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('family_dashboard')}</h1>
        <p className="text-gray-600 mt-1">Caring for {language === 'ar' ? patient.name : patient.nameEn}</p>
      </div>

      {/* Alert Banner */}
      {unresolvedAlerts > 0 && (
        <Alert type="error" title={t('fall_alerts')} className="mb-6">
          <div className="flex items-center justify-between">
            <span>
              {unresolvedAlerts} unresolved alert(s) - Immediate attention required!
            </span>
            <Button variant="danger" size="sm" onClick={() => {
              const activeAlert = myAlerts.find(a => a.status !== 'Resolved');
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
          <Avatar name={language === 'ar' ? patient.name : patient.nameEn} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? patient.name : patient.nameEn}
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
          value={myAlerts.length}
          icon={AlertTriangle}
          color={unresolvedAlerts > 0 ? 'red' : 'green'}
          subtitle={`${unresolvedAlerts} unresolved`}
        />
        <StatCard
          title={t('my_appointments')}
          value={myAppointments.length}
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

        {/* Recent Alerts - INTERACTIVE */}
        <Card
          title={t('recent_alerts')}
          action={
            <Button variant="ghost" size="sm">
              {t('view_all')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <div className="space-y-3">
            {myAlerts.length > 0 ? (
              myAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={clsx(
                    'p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                    alert.status === 'Resolved' ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
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
                        alert.status === 'Resolved' ? 'bg-green-100' : 'bg-red-100'
                      )}>
                        {alert.status === 'Resolved' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
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
                    <Badge variant={statusColors[alert.severity]} size="sm">
                      {alert.severity}
                    </Badge>
                  </div>
                  {alert.action_taken && (
                    <p className="text-sm text-gray-600 mt-2 ml-11">
                      <strong>Action:</strong> {alert.action_taken}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{t('no_alerts')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Health Summary */}
      <Card title={t('health_summary')} className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {myMetrics.slice(-4).map((metric) => (
            <div key={metric.id} className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
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

      {/* Emergency Contact */}
      <Card title={t('emergency_contacts')}>
        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="p-3 bg-red-100 rounded-full">
            <Phone className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{patient.emergencyContact.name}</p>
            <p className="text-sm text-gray-600">{patient.emergencyContact.relationship}</p>
            <p className="text-sm text-red-600 font-medium">{patient.emergencyContact.phone}</p>
          </div>
          <Button variant="danger">
            <Phone className="w-4 h-4 mr-2" />
            Call Now
          </Button>
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
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-gray-900">{selectedAlert.type}</p>
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

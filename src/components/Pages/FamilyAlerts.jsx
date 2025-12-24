import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  AlertTriangle,
  Bell,
  Phone,
  CheckCircle,
  Clock,
  MapPin,
  X,
  Search
} from 'lucide-react';
import { Card, Badge, Button, Input, Modal } from '../shared/UIComponents';
import { clsx } from 'clsx';

const FamilyAlerts = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { fallAlerts, respondToFallAlert } = useApp();

  const familyId = user?.id || 'f1';
  const patientId = user?.patientId || '1';
  const myAlerts = fallAlerts.filter(alert => alert.patient_id === patientId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [responseAction, setResponseAction] = useState('');

  const filteredAlerts = myAlerts.filter(alert => {
    const matchesSearch = alert.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'pending' && alert.status === 'Pending') ||
      (filterStatus === 'resolved' && alert.status === 'Resolved');
    return matchesSearch && matchesFilter;
  });

  const pendingCount = myAlerts.filter(a => a.status === 'Pending').length;
  const resolvedCount = myAlerts.filter(a => a.status === 'Resolved').length;
  const criticalCount = myAlerts.filter(a => a.severity === 'Critical' && a.status === 'Pending').length;

  const handleRespond = (alert) => {
    setSelectedAlert(alert);
    setResponseAction('');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = () => {
    if (!responseAction) {
      return;
    }

    respondToFallAlert(selectedAlert.id, responseAction);
    setShowResponseModal(false);
    setSelectedAlert(null);
    setResponseAction('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const severityColors = {
    Critical: 'danger',
    High: 'warning',
    Medium: 'info',
    Low: 'success',
  };

  const statusColors = {
    Pending: 'warning',
    Resolved: 'success',
  };

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('recent_alerts')}</h1>
        <p className="text-gray-600 mt-1">Monitor and respond to fall detection alerts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{myAlerts.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-gray-900">{criticalCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === 'resolved' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('resolved')}
            >
              Resolved
            </Button>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      <Card title="Fall Detection Alerts">
        {filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={clsx(
                  'p-5 rounded-lg border-2 transition-all',
                  alert.status === 'Pending'
                    ? alert.severity === 'Critical'
                      ? 'bg-red-50 border-red-300 shadow-md'
                      : 'bg-yellow-50 border-yellow-300'
                    : 'bg-gray-50 border-gray-200 opacity-75'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Alert Icon */}
                  <div className={clsx(
                    'p-3 rounded-full flex-shrink-0',
                    alert.severity === 'Critical' ? 'bg-red-100' : 'bg-yellow-100'
                  )}>
                    {alert.status === 'Resolved' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertTriangle className={clsx(
                        'w-6 h-6',
                        alert.severity === 'Critical' ? 'text-red-600' : 'text-yellow-600'
                      )} />
                    )}
                  </div>

                  {/* Alert Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          Fall Detected
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(alert.detected_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={severityColors[alert.severity]}>
                          {alert.severity}
                        </Badge>
                        <Badge variant={statusColors[alert.status]}>
                          {alert.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{alert.location}</span>
                    </div>

                    {alert.response_action && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-900">Response Action:</p>
                        <p className="text-sm text-gray-600">{alert.response_action}</p>
                        {alert.responded_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Responded at: {formatDate(alert.responded_at)}
                          </p>
                        )}
                      </div>
                    )}

                    {alert.status === 'Pending' && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Phone}
                          onClick={() => handleRespond(alert)}
                        >
                          Respond to Alert
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setResponseAction('False Alarm - No action needed');
                            handleSubmitResponse();
                          }}
                        >
                          Mark as False Alarm
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No alerts found</p>
            <p className="text-sm">All clear - no fall detection alerts</p>
          </div>
        )}
      </Card>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="Respond to Fall Alert"
        size="lg"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Fall Alert Details</p>
                  <p className="text-sm text-red-700 mt-1">
                    Detected at {selectedAlert.location}
                  </p>
                  <p className="text-sm text-red-700">
                    Time: {formatDate(selectedAlert.detected_at)}
                  </p>
                  <Badge variant={severityColors[selectedAlert.severity]} className="mt-2">
                    {selectedAlert.severity} Severity
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Response Action
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setResponseAction('Called patient - situation handled')}
                  className={clsx(
                    'w-full p-3 text-left border-2 rounded-lg transition-all',
                    responseAction === 'Called patient - situation handled'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-medium">Call Patient</p>
                  <p className="text-sm text-gray-600">Contacted patient directly</p>
                </button>

                <button
                  onClick={() => setResponseAction('Called emergency services - ambulance dispatched')}
                  className={clsx(
                    'w-full p-3 text-left border-2 rounded-lg transition-all',
                    responseAction === 'Called emergency services - ambulance dispatched'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-medium">Call Emergency Services</p>
                  <p className="text-sm text-gray-600">Dispatch ambulance immediately</p>
                </button>

                <button
                  onClick={() => setResponseAction('On my way to check on patient')}
                  className={clsx(
                    'w-full p-3 text-left border-2 rounded-lg transition-all',
                    responseAction === 'On my way to check on patient'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-medium">Visit Patient</p>
                  <p className="text-sm text-gray-600">Going to check in person</p>
                </button>

                <button
                  onClick={() => setResponseAction('False Alarm - No action needed')}
                  className={clsx(
                    'w-full p-3 text-left border-2 rounded-lg transition-all',
                    responseAction === 'False Alarm - No action needed'
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-medium">False Alarm</p>
                  <p className="text-sm text-gray-600">No assistance required</p>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowResponseModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResponse}
                className="flex-1"
                disabled={!responseAction}
              >
                Submit Response
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FamilyAlerts;

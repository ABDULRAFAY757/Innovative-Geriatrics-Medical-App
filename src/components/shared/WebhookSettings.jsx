import { useState, useEffect } from 'react';
import {
  Webhook,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Shield,
  Bell,
  Activity,
  Calendar,
  Heart,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, Input, Badge, Modal } from './UIComponents';
import { WEBHOOK_EVENTS } from '../../services/WebhookService';
import { clsx } from 'clsx';

/**
 * Webhook Settings Component
 * Allows users to configure webhook endpoints for system events
 */
const WebhookSettings = () => {
  const { webhookService, WEBHOOK_EVENTS: events } = useApp();
  const { language } = useLanguage();
  const [endpoints, setEndpoints] = useState([]);
  const [config, setConfig] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [testingEndpoint, setTestingEndpoint] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);

  // Form state for new/edit endpoint
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [],
    enabled: true,
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEndpoints(webhookService.getEndpoints());
    setConfig(webhookService.getConfig());
    setEventHistory(webhookService.getEventHistory().slice(0, 20));
  };

  // Event categories for grouping
  const eventCategories = {
    fall: {
      label: language === 'ar' ? 'تنبيهات السقوط' : 'Fall Alerts',
      icon: AlertTriangle,
      color: 'red',
      events: [WEBHOOK_EVENTS.FALL_DETECTED, WEBHOOK_EVENTS.FALL_RESOLVED],
    },
    appointment: {
      label: language === 'ar' ? 'المواعيد' : 'Appointments',
      icon: Calendar,
      color: 'blue',
      events: [
        WEBHOOK_EVENTS.APPOINTMENT_BOOKED,
        WEBHOOK_EVENTS.APPOINTMENT_CANCELLED,
        WEBHOOK_EVENTS.APPOINTMENT_COMPLETED,
      ],
    },
    medication: {
      label: language === 'ar' ? 'الأدوية' : 'Medications',
      icon: Heart,
      color: 'green',
      events: [
        WEBHOOK_EVENTS.MEDICATION_TAKEN,
        WEBHOOK_EVENTS.MEDICATION_MISSED,
        WEBHOOK_EVENTS.MEDICATION_ADDED,
      ],
    },
    health: {
      label: language === 'ar' ? 'المقاييس الصحية' : 'Health Metrics',
      icon: Activity,
      color: 'purple',
      events: [
        WEBHOOK_EVENTS.HEALTH_METRIC_RECORDED,
        WEBHOOK_EVENTS.HEALTH_METRIC_ABNORMAL,
        WEBHOOK_EVENTS.VITAL_SIGNS_CRITICAL,
      ],
    },
    equipment: {
      label: language === 'ar' ? 'المعدات' : 'Equipment',
      icon: Package,
      color: 'orange',
      events: [
        WEBHOOK_EVENTS.EQUIPMENT_REQUESTED,
        WEBHOOK_EVENTS.EQUIPMENT_APPROVED,
        WEBHOOK_EVENTS.EQUIPMENT_FULFILLED,
      ],
    },
    careTask: {
      label: language === 'ar' ? 'مهام الرعاية' : 'Care Tasks',
      icon: Bell,
      color: 'cyan',
      events: [
        WEBHOOK_EVENTS.CARE_TASK_CREATED,
        WEBHOOK_EVENTS.CARE_TASK_COMPLETED,
      ],
    },
  };

  const handleAddEndpoint = () => {
    setFormData({
      name: '',
      url: '',
      secret: '',
      events: Object.values(WEBHOOK_EVENTS),
      enabled: true,
    });
    setEditingEndpoint(null);
    setShowAddModal(true);
  };

  const handleEditEndpoint = (endpoint) => {
    setFormData({
      name: endpoint.name,
      url: endpoint.url,
      secret: endpoint.secret || '',
      events: endpoint.events,
      enabled: endpoint.enabled,
    });
    setEditingEndpoint(endpoint);
    setShowAddModal(true);
  };

  const handleSaveEndpoint = () => {
    if (!formData.url || !formData.name) return;

    if (editingEndpoint) {
      webhookService.updateEndpoint(editingEndpoint.id, formData);
    } else {
      webhookService.registerEndpoint(formData);
    }

    loadData();
    setShowAddModal(false);
    setEditingEndpoint(null);
  };

  const handleDeleteEndpoint = (endpointId) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) {
      webhookService.removeEndpoint(endpointId);
      loadData();
    }
  };

  const handleTestEndpoint = async (endpointId) => {
    setTestingEndpoint(endpointId);
    setTestResult(null);

    try {
      const success = await webhookService.testEndpoint(endpointId);
      setTestResult({ success, endpointId });
    } catch (error) {
      setTestResult({ success: false, endpointId, error: error.message });
    }

    setTimeout(() => {
      setTestingEndpoint(null);
      setTestResult(null);
    }, 3000);
  };

  const toggleEventSelection = (event) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  const toggleCategoryEvents = (category) => {
    const categoryEvents = eventCategories[category].events;
    const allSelected = categoryEvents.every(e => formData.events.includes(e));

    setFormData(prev => ({
      ...prev,
      events: allSelected
        ? prev.events.filter(e => !categoryEvents.includes(e))
        : [...new Set([...prev.events, ...categoryEvents])],
    }));
  };

  const toggleWebhooksEnabled = () => {
    webhookService.updateConfig({ enabled: !config.enabled });
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Webhook className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'إعدادات Webhook' : 'Webhook Settings'}
            </h2>
            <p className="text-sm text-gray-500">
              {language === 'ar'
                ? 'أرسل إشعارات للأنظمة الخارجية عند حدوث أحداث'
                : 'Send notifications to external systems when events occur'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-600">
              {language === 'ar' ? 'تفعيل' : 'Enabled'}
            </span>
            <button
              onClick={toggleWebhooksEnabled}
              className={clsx(
                'relative w-12 h-6 rounded-full transition-colors',
                config.enabled ? 'bg-green-500' : 'bg-gray-300'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
                  config.enabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </label>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleAddEndpoint}
          >
            {language === 'ar' ? 'إضافة' : 'Add Endpoint'}
          </Button>
        </div>
      </div>

      {/* Endpoints List */}
      <Card title={language === 'ar' ? 'نقاط النهاية' : 'Endpoints'}>
        {endpoints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Webhook className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{language === 'ar' ? 'لا توجد نقاط نهاية' : 'No webhook endpoints configured'}</p>
            <p className="text-sm mt-1">
              {language === 'ar'
                ? 'أضف نقطة نهاية لتلقي إشعارات الأحداث'
                : 'Add an endpoint to receive event notifications'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className={clsx(
                  'p-4 rounded-lg border transition-colors',
                  endpoint.enabled
                    ? 'bg-white border-gray-200 hover:border-blue-300'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                      <Badge variant={endpoint.enabled ? 'success' : 'secondary'} size="sm">
                        {endpoint.enabled
                          ? (language === 'ar' ? 'نشط' : 'Active')
                          : (language === 'ar' ? 'معطل' : 'Disabled')}
                      </Badge>
                      {endpoint.secret && (
                        <Badge variant="info" size="sm">
                          <Shield className="w-3 h-3 mr-1" />
                          {language === 'ar' ? 'مؤمن' : 'Signed'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {endpoint.url}
                      </code>
                      <a
                        href={endpoint.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {endpoint.events.length} {language === 'ar' ? 'أحداث' : 'events'} •
                      {language === 'ar' ? ' أنشئ ' : ' Created '}
                      {new Date(endpoint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={testingEndpoint === endpoint.id ? RefreshCw : RefreshCw}
                      onClick={() => handleTestEndpoint(endpoint.id)}
                      disabled={testingEndpoint === endpoint.id}
                      className={testingEndpoint === endpoint.id ? 'animate-spin' : ''}
                    >
                      {language === 'ar' ? 'اختبار' : 'Test'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit2}
                      onClick={() => handleEditEndpoint(endpoint)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteEndpoint(endpoint.id)}
                      className="text-red-500 hover:text-red-600"
                    />
                  </div>
                </div>
                {testResult && testResult.endpointId === endpoint.id && (
                  <div
                    className={clsx(
                      'mt-3 p-2 rounded-lg flex items-center gap-2 text-sm',
                      testResult.success
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    )}
                  >
                    {testResult.success ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {language === 'ar' ? 'تم الاختبار بنجاح!' : 'Test successful!'}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        {language === 'ar' ? 'فشل الاختبار' : 'Test failed'}: {testResult.error}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Events */}
      <Card
        title={language === 'ar' ? 'الأحداث الأخيرة' : 'Recent Events'}
        action={
          <Button variant="ghost" size="sm" onClick={() => setEventHistory([])}>
            {language === 'ar' ? 'مسح' : 'Clear'}
          </Button>
        }
      >
        {eventHistory.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            {language === 'ar' ? 'لا توجد أحداث حديثة' : 'No recent events'}
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {eventHistory.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'w-2 h-2 rounded-full',
                      event.delivered ? 'bg-green-500' : 'bg-yellow-500'
                    )}
                  />
                  <code className="text-gray-600">{event.type}</code>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Endpoint Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={
          editingEndpoint
            ? (language === 'ar' ? 'تعديل نقطة النهاية' : 'Edit Endpoint')
            : (language === 'ar' ? 'إضافة نقطة نهاية' : 'Add Endpoint')
        }
      >
        <div className="space-y-4">
          <Input
            label={language === 'ar' ? 'الاسم' : 'Name'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Webhook"
          />
          <Input
            label={language === 'ar' ? 'الرابط' : 'URL'}
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com/webhook"
            type="url"
          />
          <Input
            label={language === 'ar' ? 'المفتاح السري (اختياري)' : 'Secret Key (Optional)'}
            value={formData.secret}
            onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
            placeholder="whsec_..."
            type="password"
          />

          {/* Event Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'الأحداث' : 'Events'}
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3">
              {Object.entries(eventCategories).map(([key, category]) => {
                const Icon = category.icon;
                const allSelected = category.events.every(e => formData.events.includes(e));
                const someSelected = category.events.some(e => formData.events.includes(e));

                return (
                  <div key={key} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => toggleCategoryEvents(key)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      <div
                        className={clsx(
                          'w-4 h-4 rounded border flex items-center justify-center',
                          allSelected
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : someSelected
                            ? 'bg-blue-200 border-blue-300'
                            : 'border-gray-300'
                        )}
                      >
                        {allSelected && <Check className="w-3 h-3" />}
                      </div>
                      <Icon className="w-4 h-4" />
                      {category.label}
                    </button>
                    <div className="ml-6 space-y-1">
                      {category.events.map((event) => (
                        <label
                          key={event}
                          className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-900"
                        >
                          <input
                            type="checkbox"
                            checked={formData.events.includes(event)}
                            onChange={() => toggleEventSelection(event)}
                            className="rounded border-gray-300"
                          />
                          {event}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enable Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              {language === 'ar' ? 'تفعيل نقطة النهاية' : 'Enable this endpoint'}
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSaveEndpoint}
              className="flex-1"
              disabled={!formData.url || !formData.name}
            >
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WebhookSettings;

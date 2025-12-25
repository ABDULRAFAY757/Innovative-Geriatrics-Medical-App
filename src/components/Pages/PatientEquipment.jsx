import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  Package,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  FileText
} from 'lucide-react';
import { Card, Table, Badge, Button, Input, Modal } from '../shared/UIComponents';
import PaymentModal from '../shared/PaymentModal';
import { clsx } from 'clsx';

const PatientEquipment = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { equipmentRequests, createEquipmentRequest, patients } = useApp();

  const patientId = user?.id || '1';
  const patient = patients.find(p => p.id === patientId);
  const myEquipment = equipmentRequests.filter(e => e.patient_id === patientId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, fulfilled, in-progress
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    equipment_name: '',
    category: 'Mobility',
    description: '',
    urgency: 'Medium',
    estimated_cost: 0,
    medical_justification: '',
  });

  const filteredRequests = myEquipment.filter(req => {
    const matchesSearch = req.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'pending' && req.status === 'Pending') ||
      (filterStatus === 'fulfilled' && req.status === 'Fulfilled') ||
      (filterStatus === 'in-progress' && req.status === 'In Progress');
    return matchesSearch && matchesFilter;
  });

  const pendingCount = myEquipment.filter(e => e.status === 'Pending').length;
  const fulfilledCount = myEquipment.filter(e => e.status === 'Fulfilled').length;
  const totalCost = myEquipment.reduce((acc, req) => acc + (req.estimated_cost || 0), 0);

  const handleCreateRequest = () => {
    if (!newRequest.equipment_name || !newRequest.description) {
      return;
    }

    const requestData = {
      ...newRequest,
      patient_id: patientId,
      patient_name: patient?.name || user?.name || 'Patient',
      equipment_name_ar: newRequest.equipment_name, // Add Arabic name if needed
    };

    createEquipmentRequest(requestData);
    setShowNewRequest(false);
    setNewRequest({
      equipment_name: '',
      category: 'Mobility',
      description: '',
      urgency: 'Medium',
      estimated_cost: 0,
      medical_justification: '',
    });
  };

  const handlePayment = (request) => {
    setSelectedRequest(request);
    setShowPayment(true);
  };

  const statusColors = {
    Pending: 'warning',
    'In Progress': 'info',
    Fulfilled: 'success',
    Completed: 'success',
  };

  const urgencyColors = {
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
  };

  const categoryIcons = {
    Mobility: '🦽',
    Monitoring: '📊',
    Safety: '🛡️',
    'Home Care': '🏠',
  };

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('equipment_requests')}</h1>
        <p className="text-gray-600 mt-1">Request and track medical equipment needs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{myEquipment.length}</p>
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
              <p className="text-sm text-gray-600">Fulfilled</p>
              <p className="text-2xl font-bold text-gray-900">{fulfilledCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{totalCost} SAR</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search equipment requests..."
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
              variant={filterStatus === 'fulfilled' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('fulfilled')}
            >
              Fulfilled
            </Button>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowNewRequest(true)}
          >
            New Request
          </Button>
        </div>
      </Card>

      {/* Equipment Requests List */}
      <Card title="Your Equipment Requests">
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {/* Equipment Icon and Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{categoryIcons[req.category] || '📦'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {language === 'ar' ? req.equipment_name_ar : req.equipment_name}
                      </h3>
                      <Badge variant={urgencyColors[req.urgency]} size="sm">
                        {req.urgency} Priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Category:</span> {req.category}
                    </p>
                    {req.medical_justification && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Medical Justification:</span> {req.medical_justification}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status and Cost */}
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={statusColors[req.status]}>
                    {req.status}
                  </Badge>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Estimated Cost</p>
                    <p className="text-lg font-bold text-gray-900">
                      {req.estimated_cost} {t('sar')}
                    </p>
                  </div>
                  {req.status === 'Pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePayment(req)}
                    >
                      Pay Now
                    </Button>
                  )}
                  {req.status === 'Fulfilled' && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No equipment requests found</p>
            <p className="text-sm">Create your first request to get started</p>
            <Button
              variant="primary"
              icon={Plus}
              className="mt-4"
              onClick={() => setShowNewRequest(true)}
            >
              Request Equipment
            </Button>
          </div>
        )}
      </Card>

      {/* Equipment Requests Table */}
      {filteredRequests.length > 0 && (
        <Card title="Request History" className="mt-6">
          <Table
            columns={[
              {
                header: 'Equipment',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryIcons[row.category] || '📦'}</span>
                    <div>
                      <p className="font-medium">
                        {language === 'ar' ? row.equipment_name_ar : row.equipment_name}
                      </p>
                      <p className="text-xs text-gray-500">{row.category}</p>
                    </div>
                  </div>
                )
              },
              {
                header: 'Description',
                render: (row) => (
                  <p className="max-w-xs truncate">{row.description}</p>
                )
              },
              {
                header: 'Urgency',
                render: (row) => (
                  <Badge variant={urgencyColors[row.urgency]}>
                    {row.urgency}
                  </Badge>
                )
              },
              {
                header: 'Cost',
                render: (row) => (
                  <span className="font-semibold">
                    {row.estimated_cost} {t('sar')}
                  </span>
                )
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
                header: 'Actions',
                render: (row) => (
                  <div className="flex gap-2">
                    {row.status === 'Pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePayment(row)}
                      >
                        Pay
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                )
              }
            ]}
            data={filteredRequests}
          />
        </Card>
      )}

      {/* Information Card */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">How Equipment Requests Work</p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Submit a request for medical equipment you need</li>
              <li>Your request will be visible to donors in the marketplace</li>
              <li>Donors can choose to fulfill your request anonymously</li>
              <li>Once fulfilled, you&apos;ll receive the equipment at no cost</li>
              <li>All requests require medical justification</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* New Request Modal */}
      <Modal
        isOpen={showNewRequest}
        onClose={() => setShowNewRequest(false)}
        title="Request Medical Equipment"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Equipment Name"
            placeholder="e.g., Wheelchair, Walker, Blood Pressure Monitor"
            value={newRequest.equipment_name}
            onChange={(e) => setNewRequest({ ...newRequest, equipment_name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newRequest.category}
                onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
              >
                <option value="Mobility">Mobility</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Safety">Safety</option>
                <option value="Home Care">Home Care</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newRequest.urgency}
                onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder="Describe the equipment and why you need it..."
              value={newRequest.description}
              onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
            />
          </div>

          <Input
            type="number"
            label="Estimated Cost (SAR)"
            placeholder="0"
            value={newRequest.estimated_cost}
            onChange={(e) => setNewRequest({ ...newRequest, estimated_cost: parseInt(e.target.value) || 0 })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Justification *
            </label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder="Explain the medical reason for this equipment request..."
              value={newRequest.medical_justification}
              onChange={(e) => setNewRequest({ ...newRequest, medical_justification: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Required: Explain how this equipment will help with your medical condition
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewRequest(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRequest}
              className="flex-1"
              disabled={!newRequest.equipment_name || !newRequest.description || !newRequest.medical_justification}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={selectedRequest?.estimated_cost || 0}
        description={`Payment for ${selectedRequest?.equipment_name}`}
        onSuccess={() => {
          setShowPayment(false);
        }}
      />
    </div>
  );
};

export default PatientEquipment;

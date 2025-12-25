import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  Pill,
  Clock,
  Check,
  AlertCircle,
  Plus,
  Search,
  TrendingUp
} from 'lucide-react';
import { Card, Table, Badge, Button, Input, ProgressBar, Modal, DoseIndicator } from '../shared/UIComponents';
import { clsx } from 'clsx';

const PatientMedications = ({ user }) => {
  const { t, isRTL } = useLanguage();
  const { medicationReminders, takeMedication, addMedication } = useApp();

  const patientId = user?.id || '1';
  const myMedications = medicationReminders.filter(m => m.patient_id === patientId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, taken
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [newMedication, setNewMedication] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    time: ''
  });

  const filteredMedications = myMedications.filter(med => {
    const matchesSearch = med.medication_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && med.adherence_rate < 100) ||
      (filterStatus === 'taken' && med.adherence_rate === 100);
    return matchesSearch && matchesFilter;
  });

  const handleTakeMedication = (medicationId) => {
    takeMedication(medicationId);
  };

  const handleAddMedication = () => {
    if (!newMedication.medication_name || !newMedication.dosage || !newMedication.frequency || !newMedication.time) {
      return;
    }

    addMedication(patientId, {
      medication_name: newMedication.medication_name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      time: newMedication.time,
      adherence_rate: 0,
      status: 'Active'
    });

    setShowAddMedication(false);
    setNewMedication({
      medication_name: '',
      dosage: '',
      frequency: '',
      time: ''
    });
  };

  const statusColors = {
    Active: 'success',
    Pending: 'warning',
    Taken: 'info',
  };

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('my_medications')}</h1>
        <p className="text-gray-600 mt-1">Manage your medication schedule and adherence</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Medications</p>
              <p className="text-2xl font-bold text-gray-900">{myMedications.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-gray-900">
                {myMedications.filter(m => m.adherence_rate >= 80).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Adherence</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(myMedications.reduce((acc, m) => acc + m.adherence_rate, 0) / myMedications.length || 0)}%
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Today</p>
              <p className="text-2xl font-bold text-gray-900">{myMedications.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search medications..."
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
              variant={filterStatus === 'active' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'taken' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('taken')}
            >
              Taken
            </Button>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddMedication(true)}
          >
            Add Medication
          </Button>
        </div>
      </Card>

      {/* Medications List */}
      <Card title="Medication Schedule">
        {filteredMedications.length > 0 ? (
          <div className="space-y-4">
            {filteredMedications.map((med) => (
              <div
                key={med.id}
                className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Medication Icon and Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{med.medication_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Dosage:</span> {med.dosage}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Frequency:</span> {med.frequency}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{med.time}</span>
                    </div>
                  </div>
                </div>

                {/* Daily Dose Indicators */}
                <div className="w-full md:w-48">
                  <p className="text-xs text-gray-500 mb-2">Today&apos;s Doses</p>
                  <DoseIndicator
                    frequency={med.frequency}
                    taken={med.taken_today || 0}
                    color={med.adherence_rate >= 80 ? 'green' : med.adherence_rate >= 50 ? 'yellow' : 'red'}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {med.taken_today || 0} taken today
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-center gap-2">
                  <Badge variant={statusColors[med.status] || 'info'}>
                    {med.status || 'Active'}
                  </Badge>
                </div>

                {/* Take Button */}
                <div>
                  <Button
                    variant="success"
                    size="sm"
                    icon={Check}
                    onClick={() => handleTakeMedication(med.id)}
                  >
                    Take Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Pill className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No medications found</p>
            <p className="text-sm">Add your first medication to get started</p>
            <Button
              variant="primary"
              icon={Plus}
              className="mt-4"
              onClick={() => setShowAddMedication(true)}
            >
              Add Medication
            </Button>
          </div>
        )}
      </Card>

      {/* Medication History Table */}
      {filteredMedications.length > 0 && (
        <Card title="Medication History" className="mt-6">
          <Table
            columns={[
              {
                header: 'Medication',
                accessor: 'medication_name'
              },
              {
                header: 'Dosage',
                accessor: 'dosage'
              },
              {
                header: 'Frequency',
                accessor: 'frequency'
              },
              {
                header: 'Time',
                accessor: 'time'
              },
              {
                header: 'Adherence',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <ProgressBar
                        value={row.adherence_rate}
                        color={row.adherence_rate >= 80 ? 'green' : 'yellow'}
                        size="sm"
                      />
                    </div>
                    <span className="text-sm font-medium">{row.adherence_rate}%</span>
                  </div>
                )
              },
              {
                header: 'Status',
                render: (row) => (
                  <Badge variant={statusColors[row.status] || 'info'}>
                    {row.status || 'Active'}
                  </Badge>
                )
              },
              {
                header: 'Actions',
                render: (row) => (
                  <Button
                    variant="success"
                    size="sm"
                    icon={Check}
                    onClick={() => handleTakeMedication(row.id)}
                  >
                    Take
                  </Button>
                )
              }
            ]}
            data={filteredMedications}
          />
        </Card>
      )}

      {/* Important Notice */}
      <Card className="mt-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900">Important Reminder</p>
            <p className="text-sm text-yellow-700 mt-1">
              Always take your medications as prescribed by your doctor. If you experience any side effects or have questions, contact your healthcare provider immediately.
            </p>
          </div>
        </div>
      </Card>

      {/* Add Medication Modal */}
      <Modal
        isOpen={showAddMedication}
        onClose={() => setShowAddMedication(false)}
        title="Add New Medication"
      >
        <div className="space-y-4">
          <Input
            label="Medication Name"
            placeholder="e.g., Metformin"
            value={newMedication.medication_name}
            onChange={(e) => setNewMedication({...newMedication, medication_name: e.target.value})}
          />
          <Input
            label="Dosage"
            placeholder="e.g., 500mg"
            value={newMedication.dosage}
            onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
          />
          <Input
            label="Frequency"
            placeholder="e.g., Twice daily"
            value={newMedication.frequency}
            onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
          />
          <Input
            type="time"
            label="Time"
            value={newMedication.time}
            onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddMedication(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAddMedication}
              className="flex-1"
              disabled={!newMedication.medication_name || !newMedication.dosage || !newMedication.frequency || !newMedication.time}
            >
              Add Medication
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientMedications;

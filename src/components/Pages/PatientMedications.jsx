import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { medications } from '../../data/mockData';
import {
  Pill,
  Clock,
  Check,
  AlertCircle,
  Plus,
  Search,
  TrendingUp,
  Calendar,
  History,
  Info
} from 'lucide-react';
import { Card, Badge, Button, Input, Modal, DoseIndicator, Pagination, usePagination, Select } from '../shared/UIComponents';
import { clsx } from 'clsx';

const PatientMedications = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
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

  // Pagination
  const {
    currentPage,
    rowsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedMedications,
    handlePageChange,
    handleRowsPerPageChange,
    resetPage
  } = usePagination(filteredMedications, 5);

  // Reset page when search/filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    resetPage();
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    resetPage();
  };

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
      {/* Page Header - Enhanced */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('my_medications')}
            </h1>
            <p className="text-gray-600 text-sm">Manage your medication schedule and adherence</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Enhanced with better gradients and hover effects */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-slideUp">
        <div className="group relative overflow-hidden p-5 bg-gradient-to-br from-blue-50 via-blue-50/50 to-white border-2 border-blue-200 rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Medications</p>
              <p className="text-3xl font-bold text-gray-900">{myMedications.length}</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden p-5 bg-gradient-to-br from-green-50 via-green-50/50 to-white border-2 border-green-200 rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/30 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">On Track</p>
              <p className="text-3xl font-bold text-gray-900">
                {myMedications.filter(m => m.adherence_rate >= 80).length}
              </p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden p-5 bg-gradient-to-br from-purple-50 via-purple-50/50 to-white border-2 border-purple-200 rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/30 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Avg. Adherence</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(myMedications.reduce((acc, m) => acc + m.adherence_rate, 0) / myMedications.length || 0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden p-5 bg-gradient-to-br from-orange-50 via-orange-50/50 to-white border-2 border-orange-200 rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/30 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Due Today</p>
              <p className="text-3xl font-bold text-gray-900">{myMedications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search - Enhanced with better spacing and visual hierarchy */}
      <div className="mb-6 p-6 bg-white/95 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl shadow-lg animate-fadeIn">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={language === 'ar' ? 'بحث عن الأدوية...' : 'Search medications...'}
              value={searchTerm}
              onChange={handleSearchChange}
              icon={Search}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange('all')}
              className={clsx(
                'px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border-2',
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
              )}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={clsx(
                'px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border-2',
                filterStatus === 'active'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-600 shadow-lg shadow-green-500/30'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50 hover:shadow-md'
              )}
            >
              {language === 'ar' ? 'نشط' : 'Active'}
            </button>
            <button
              onClick={() => handleFilterChange('taken')}
              className={clsx(
                'px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border-2',
                filterStatus === 'taken'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600 shadow-lg shadow-purple-500/30'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'
              )}
            >
              {language === 'ar' ? 'تم تناوله' : 'Taken'}
            </button>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddMedication(true)}
            className="hover:scale-105 active:scale-95 transition-transform"
          >
            Add Medication
          </Button>
        </div>
      </div>

      {/* Medications List */}
      <Card title={language === 'ar' ? 'جدول الأدوية' : 'Medication Schedule'}>
        {filteredMedications.length > 0 ? (
          <>
          <div className="space-y-4">
            {paginatedMedications.map((med) => {
              const freq = med.frequency.toLowerCase();
              const totalDoses = freq.includes('once') ? 1 : freq.includes('twice') ? 2 : freq.includes('three') ? 3 : 1;
              const allTaken = (med.taken_today || 0) >= totalDoses;

              return (
              <div
                key={med.id}
                className={clsx(
                  "group relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-4 p-5 rounded-2xl transition-all duration-500",
                  allTaken
                    ? "bg-gradient-to-r from-green-50 via-green-50/80 to-emerald-50 border-2 border-green-300 shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-white via-gray-50/30 to-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-[1.01]"
                )}
              >
                {/* Glow effect for completed medications */}
                {allTaken && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
                )}

                {/* Medication Icon and Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className={clsx(
                    "p-3 rounded-xl shadow-md transition-all group-hover:scale-110",
                    allTaken
                      ? "bg-gradient-to-br from-green-500 to-green-600"
                      : "bg-gradient-to-br from-blue-500 to-blue-600"
                  )}>
                    <Pill className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{med.medication_name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {med.dosage}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                        {med.frequency}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
                        <Clock className="w-3 h-3" />
                        {med.time}
                      </span>
                    </div>

                    {/* Additional Information - Not on Dashboard */}
                    <div className="mt-3 space-y-1.5">
                      {med.last_taken && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <History className="w-3.5 h-3.5 text-gray-500" />
                          <span className="font-medium">Last taken:</span>
                          <span className="text-gray-700">{new Date(med.last_taken).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      )}
                      {med.next_dose && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium">Next dose:</span>
                          <span className="text-blue-700 font-semibold">{new Date(med.next_dose).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <Info className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-medium text-gray-600">Adherence Rate:</span>
                        <span className={clsx(
                          "font-bold",
                          med.adherence_rate >= 80 ? "text-green-700" : med.adherence_rate >= 50 ? "text-yellow-700" : "text-red-700"
                        )}>
                          {med.adherence_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Dose Indicators with Before/After Visual */}
                <div className="w-full md:w-52 p-4 bg-white/50 rounded-xl border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Today&apos;s Doses</p>
                  <DoseIndicator
                    frequency={med.frequency}
                    taken={med.taken_today || 0}
                    color={med.adherence_rate >= 80 ? 'green' : med.adherence_rate >= 50 ? 'yellow' : 'red'}
                  />
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 rounded-lg">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></div>
                      <span className="text-xs font-bold text-green-800">{med.taken_today || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-gray-500"></div>
                      <span className="text-xs font-bold text-gray-700">
                        {(() => {
                          const freq = med.frequency.toLowerCase();
                          const total = freq.includes('once') ? 1 : freq.includes('twice') ? 2 : freq.includes('three') ? 3 : 1;
                          return Math.max(0, total - (med.taken_today || 0));
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Take Button - Enhanced */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => handleTakeMedication(med.id)}
                    disabled={allTaken}
                    className={clsx(
                      "group/btn relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-md",
                      allTaken
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-110 hover:shadow-xl active:scale-95"
                    )}
                  >
                    {allTaken ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Complete
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        Take Now
                      </span>
                    )}
                  </button>
                  <Badge variant={statusColors[med.status] || 'info'} className="text-xs">
                    {med.status || 'Active'}
                  </Badge>
                </div>
              </div>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            labels={language === 'ar' ? {
              show: 'عرض',
              perPage: 'لكل صفحة',
              of: 'من',
              first: 'الأولى',
              previous: 'السابقة',
              next: 'التالية',
              last: 'الأخيرة'
            } : {}}
          />
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Pill className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">{language === 'ar' ? 'لا توجد أدوية' : 'No medications found'}</p>
            <p className="text-sm">{language === 'ar' ? 'أضف دواءك الأول للبدء' : 'Add your first medication to get started'}</p>
            <Button
              variant="primary"
              icon={Plus}
              className="mt-4"
              onClick={() => setShowAddMedication(true)}
            >
              {language === 'ar' ? 'إضافة دواء' : 'Add Medication'}
            </Button>
          </div>
        )}
      </Card>


      {/* Medication Instructions & Tips - Extra Information */}
      {filteredMedications.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Instructions */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl shadow-md">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Info className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-blue-900 text-base">Taking Your Medications</h3>
            </div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Take medications at the same time each day</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Keep medications in their original containers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Store in a cool, dry place away from sunlight</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Never skip doses without consulting your doctor</span>
              </li>
            </ul>
          </div>

          {/* When to Contact Doctor */}
          <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-md">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-red-900 text-base">Contact Your Doctor If:</h3>
            </div>
            <ul className="space-y-2 text-sm text-red-800">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>You experience severe side effects</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>You miss multiple doses in a row</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Your symptoms worsen or don't improve</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>You want to stop or change medications</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Important Notice - Enhanced */}
      <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-lg animate-fadeIn">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-900 text-lg mb-2">Important Reminder</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Always take your medications as prescribed by your doctor. If you experience any side effects or have questions, contact your healthcare provider immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Add Medication Modal - Enhanced */}
      <Modal
        isOpen={showAddMedication}
        onClose={() => setShowAddMedication(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span>Add New Medication</span>
          </div>
        }
        size="lg"
      >
        <div className="space-y-5">
          {/* Medication Selection Dropdown */}
          <Select
            label={language === 'ar' ? 'اسم الدواء' : 'Medication Name'}
            value={newMedication.medication_name}
            onChange={(e) => {
              const selectedMed = medications.find(m => m.name === e.target.value);
              setNewMedication({
                ...newMedication,
                medication_name: e.target.value,
                dosage: selectedMed?.dosage?.split(' ')[0] || newMedication.dosage
              });
            }}
            options={medications.map(med => ({
              value: med.name,
              label: `${med.name} - ${med.category}`
            }))}
            placeholder={language === 'ar' ? 'اختر الدواء...' : 'Select medication...'}
          />

          {/* Selected Medication Info - Enhanced */}
          {newMedication.medication_name && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 shadow-sm animate-fadeIn">
              <p className="text-sm text-blue-900">
                <span className="font-bold text-base">{newMedication.medication_name}</span>
                <br />
                <span className="text-blue-700 mt-1 block">
                  {medications.find(m => m.name === newMedication.medication_name)?.description}
                </span>
              </p>
            </div>
          )}

          {/* Dosage Input */}
          <Input
            label={language === 'ar' ? 'الجرعة' : 'Dosage'}
            placeholder="e.g., 500mg"
            value={newMedication.dosage}
            onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
          />

          {/* Frequency - Quick Selection Enhanced */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">
              {language === 'ar' ? 'التكرار' : 'Frequency'}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'Once daily', label: 'Once daily' },
                { value: 'Twice daily', label: 'Twice daily' },
                { value: 'Three times daily', label: '3x daily' },
                { value: 'As needed', label: 'As needed' }
              ].map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setNewMedication({...newMedication, frequency: freq.value})}
                  className={clsx(
                    'py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all duration-300 shadow-sm',
                    newMedication.frequency === freq.value
                      ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-105'
                  )}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time - Quick Selection Enhanced */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">
              {language === 'ar' ? 'الوقت' : 'Time'}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: '08:00', label: '8:00 AM' },
                { value: '12:00', label: '12:00 PM' },
                { value: '18:00', label: '6:00 PM' },
                { value: '21:00', label: '9:00 PM' }
              ].map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => setNewMedication({...newMedication, time: time.value})}
                  className={clsx(
                    'py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all duration-300 shadow-sm',
                    newMedication.time === time.value
                      ? 'border-green-500 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50 hover:shadow-md hover:scale-105'
                  )}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary - Enhanced */}
          {newMedication.medication_name && newMedication.dosage && newMedication.frequency && newMedication.time && (
            <div className="p-5 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl border-2 border-green-300 shadow-md animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-green-900 mb-1">Summary</p>
                  <p className="text-sm text-green-800 font-medium">
                    {newMedication.medication_name} <span className="text-green-600">{newMedication.dosage}</span>, {newMedication.frequency} at <span className="text-green-600">{newMedication.time}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              onClick={() => setShowAddMedication(false)}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMedication}
              disabled={!newMedication.medication_name || !newMedication.dosage || !newMedication.frequency || !newMedication.time}
              className={clsx(
                "flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-md",
                !newMedication.medication_name || !newMedication.dosage || !newMedication.frequency || !newMedication.time
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 active:scale-95"
              )}
            >
              Add Medication
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientMedications;

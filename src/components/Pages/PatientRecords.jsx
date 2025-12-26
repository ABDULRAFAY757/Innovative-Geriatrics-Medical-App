import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FileText, Search, Eye, User, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Card, Badge, Button, Input, Modal, Table } from '../shared/UIComponents';
import { clsx } from 'clsx';
import { medicalRecords, patients } from '../../data/mockData';

const PatientRecords = ({ user }) => {
  const { isRTL, language } = useLanguage();

  const patientId = user?.id || '1';
  const patient = patients.find(p => p.id === patientId);
  const myRecords = medicalRecords
    .filter(r => r.patient_id === patientId)
    .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredRecords = myRecords.filter(record => {
    const recordPatient = patients.find(p => p.id === record.patient_id);
    const patientName = recordPatient?.name?.toLowerCase() || '';
    const patientNo = recordPatient?.p_no?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    return patientName.includes(search) ||
      patientNo.includes(search) ||
      record.doctor_name.toLowerCase().includes(search) ||
      record.diagnosis.toLowerCase().includes(search) ||
      record.hospital.toLowerCase().includes(search);
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRecords = useMemo(() =>
    filteredRecords.slice(startIndex, endIndex),
    [filteredRecords, startIndex, endIndex]
  );

  // Reset to first page when search changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTypeBadge = (type) => {
    const variants = {
      'Consultation': 'info',
      'Follow-up': 'success',
      'Emergency': 'danger',
      'Hospital Admission': 'warning',
      'Annual Checkup': 'default',
      'Specialist Consultation': 'info',
    };
    return variants[type] || 'default';
  };


  const columns = [
    {
      header: language === 'ar' ? 'التاريخ' : 'Date',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 text-sm">{formatDate(row.visit_date)}</p>
        </div>
      )
    },
    {
      header: language === 'ar' ? 'النوع' : 'Type',
      render: (row) => (
        <Badge variant={getTypeBadge(row.record_type)} className="text-xs font-semibold">
          {row.record_type}
        </Badge>
      )
    },
    {
      header: language === 'ar' ? 'التشخيص' : 'Diagnosis',
      render: (row) => (
        <p className="font-semibold text-gray-900 text-sm truncate max-w-[200px]" title={row.diagnosis}>
          {row.diagnosis}
        </p>
      )
    },
    {
      header: language === 'ar' ? 'المستشفى' : 'Hospital',
      render: (row) => (
        <div className="text-sm text-gray-700 truncate max-w-[180px]" title={row.hospital}>
          {row.hospital}
        </div>
      )
    },
    {
      header: language === 'ar' ? 'الطبيب' : 'Doctor',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 text-sm">{row.doctor_name}</p>
          <p className="text-xs text-gray-500">{row.specialization}</p>
        </div>
      )
    },
    {
      header: language === 'ar' ? 'الإجراء' : 'Action',
      render: (row) => (
        <button
          onClick={() => setSelectedRecord(row)}
          className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 hover:scale-110 transition-all"
          title={language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header - Enhanced */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {language === 'ar' ? 'السجلات الطبية' : 'Medical Records'}
            </h1>
            <p className="text-gray-600 text-sm">
              {language === 'ar' ? 'سجل الزيارات والاستشارات' : 'Visit and consultation history'}
            </p>
          </div>
        </div>
      </div>

      {/* Patient Info Card - Enhanced */}
      <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 via-purple-50/30 to-white border-2 border-blue-100 rounded-2xl shadow-lg animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{language === 'ar' ? 'سجلات المريض' : 'Patient Records For'}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{patient?.name || user?.name || 'Patient'}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              <span className="font-medium">{language === 'ar' ? 'رقم الملف:' : 'File No:'}</span> {patient?.p_no || 'N/A'}
            </p>
          </div>
          <div className="text-right px-6 py-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{language === 'ar' ? 'إجمالي السجلات' : 'Total Records'}</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1">{myRecords.length}</p>
          </div>
        </div>
      </div>

      {/* Search - Enhanced */}
      <div className="mb-6 p-6 bg-white/95 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl shadow-lg animate-fadeIn">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder={language === 'ar' ? 'بحث بالطبيب أو التشخيص أو المستشفى...' : 'Search by doctor, diagnosis, hospital...'}
              value={searchTerm}
              onChange={handleSearch}
              icon={Search}
            />
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
            <span className="text-sm font-semibold text-blue-700">
              {filteredRecords.length} {language === 'ar' ? 'سجل' : 'records'}
            </span>
          </div>
        </div>
      </div>

      {/* Records Table - Enhanced */}
      <div className="p-6 bg-white/95 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'ar' ? 'سجل الزيارات' : 'Visit History'}
          </h2>
        </div>
        {filteredRecords.length > 0 ? (
          <>
            <Table columns={columns} data={paginatedRecords} />

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200">
              {/* Rows per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {language === 'ar' ? 'عرض' : 'Show'}
                </span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-600">
                  {language === 'ar' ? 'سجلات' : 'per page'}
                </span>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                {language === 'ar'
                  ? `${startIndex + 1}-${Math.min(endIndex, filteredRecords.length)} من ${filteredRecords.length}`
                  : `${startIndex + 1}-${Math.min(endIndex, filteredRecords.length)} of ${filteredRecords.length}`
                }
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className={clsx(
                    "p-2 rounded-lg transition-colors",
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  title={language === 'ar' ? 'الأولى' : 'First'}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={clsx(
                    "p-2 rounded-lg transition-colors",
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  title={language === 'ar' ? 'السابقة' : 'Previous'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={clsx(
                          "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={clsx(
                    "p-2 rounded-lg transition-colors",
                    currentPage === totalPages || totalPages === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  title={language === 'ar' ? 'التالية' : 'Next'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={clsx(
                    "p-2 rounded-lg transition-colors",
                    currentPage === totalPages || totalPages === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  title={language === 'ar' ? 'الأخيرة' : 'Last'}
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500 font-semibold">
              {language === 'ar' ? 'لا توجد سجلات' : 'No records found'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {language === 'ar' ? 'لم يتم العثور على سجلات طبية' : 'No medical records available'}
            </p>
          </div>
        )}
      </div>

      {/* Record Detail Modal - Enhanced */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span>{language === 'ar' ? 'تفاصيل الزيارة' : 'Visit Details'}</span>
          </div>
        }
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-5">
            {/* Patient Info */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{patient?.name || 'Patient'}</p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">{language === 'ar' ? 'رقم الملف:' : 'File No:'}</span> {patient?.p_no || 'N/A'}
                </p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 pb-5 border-b border-gray-200">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{language === 'ar' ? 'التاريخ' : 'Date'}</p>
                <p className="font-bold text-gray-900">{formatDate(selectedRecord.visit_date)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{language === 'ar' ? 'النوع' : 'Type'}</p>
                <Badge variant={getTypeBadge(selectedRecord.record_type)} className="font-semibold">
                  {selectedRecord.record_type}
                </Badge>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{language === 'ar' ? 'التشخيص' : 'Diagnosis'}</p>
              <p className="font-bold text-gray-900 text-lg mb-1">{selectedRecord.diagnosis}</p>
              <p className="text-sm text-gray-600">{selectedRecord.chief_complaint}</p>
            </div>

            {/* Doctor & Hospital */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{language === 'ar' ? 'الطبيب' : 'Doctor'}</p>
                <p className="font-bold text-gray-900">{selectedRecord.doctor_name}</p>
                <p className="text-xs text-gray-600 mt-1">{selectedRecord.specialization}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{language === 'ar' ? 'المستشفى' : 'Hospital'}</p>
                <p className="font-bold text-gray-900">{selectedRecord.hospital}</p>
                {selectedRecord.ward && <p className="text-xs text-gray-600 mt-1">{selectedRecord.ward}</p>}
              </div>
            </div>

            {/* Vitals */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{language === 'ar' ? 'العلامات الحيوية' : 'Vitals'}</p>
              <div className="grid grid-cols-4 gap-3 text-center text-sm">
                <div className="p-3 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl">
                  <p className="text-gray-600 text-xs font-semibold mb-1">BP</p>
                  <p className="font-bold text-gray-900">{selectedRecord.vitals.blood_pressure}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl">
                  <p className="text-gray-600 text-xs font-semibold mb-1">HR</p>
                  <p className="font-bold text-gray-900">{selectedRecord.vitals.heart_rate}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
                  <p className="text-gray-600 text-xs font-semibold mb-1">Temp</p>
                  <p className="font-bold text-gray-900">{selectedRecord.vitals.temperature}°</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl">
                  <p className="text-gray-600 text-xs font-semibold mb-1">SpO2</p>
                  <p className="font-bold text-gray-900">{selectedRecord.vitals.oxygen_saturation}%</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{language === 'ar' ? 'ملاحظات' : 'Clinical Notes'}</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed">{selectedRecord.clinical_notes}</p>
            </div>

            {/* Medications */}
            {selectedRecord.prescriptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{language === 'ar' ? 'الأدوية' : 'Medications'}</p>
                <div className="space-y-2">
                  {selectedRecord.prescriptions.map((rx, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                      <span className="font-bold text-gray-900">{rx.medication}</span>
                      <span className="text-sm text-gray-600 font-medium">{rx.dosage} - {rx.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Tests */}
            {selectedRecord.lab_orders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{language === 'ar' ? 'الفحوصات' : 'Lab Tests'}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.lab_orders.map((lab, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-full text-xs font-semibold">
                      {lab}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {selectedRecord.follow_up_date && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl">
                <p className="text-amber-800 font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? 'موعد المتابعة: ' : 'Follow-up: '}
                    {formatDate(selectedRecord.follow_up_date)}
                  </span>
                </p>
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 active:scale-95"
              onClick={() => setSelectedRecord(null)}
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientRecords;

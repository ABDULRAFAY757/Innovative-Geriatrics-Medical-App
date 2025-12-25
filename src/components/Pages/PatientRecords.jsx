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
        <span className="text-sm">{formatDate(row.visit_date)}</span>
      )
    },
    {
      header: language === 'ar' ? 'النوع' : 'Type',
      render: (row) => (
        <Badge variant={getTypeBadge(row.record_type)} className="text-xs">
          {row.record_type}
        </Badge>
      )
    },
    {
      header: language === 'ar' ? 'التشخيص' : 'Diagnosis',
      render: (row) => (
        <p className="font-medium text-gray-900 text-sm truncate max-w-[180px]">{row.diagnosis}</p>
      )
    },
    {
      header: language === 'ar' ? 'المستشفى' : 'Hospital',
      render: (row) => <span className="text-sm truncate max-w-[150px]">{row.hospital}</span>
    },
    {
      header: language === 'ar' ? 'الطبيب' : 'Doctor',
      render: (row) => (
        <span className="text-sm">{row.doctor_name}</span>
      )
    },
    {
      header: language === 'ar' ? 'الإجراء' : 'Action',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => setSelectedRecord(row)}
        >
          {language === 'ar' ? 'عرض' : 'View'}
        </Button>
      )
    }
  ];

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ar' ? 'السجلات الطبية' : 'Medical Records'}
        </h1>
        <p className="text-gray-600 mt-1">
          {language === 'ar' ? 'سجل الزيارات والاستشارات' : 'Visit and consultation history'}
        </p>
      </div>

      {/* Patient Info Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">{language === 'ar' ? 'سجلات المريض' : 'Patient Records For'}</p>
            <p className="font-semibold text-gray-900">{patient?.name || user?.name || 'Patient'}</p>
            <p className="text-xs text-gray-500">{language === 'ar' ? 'رقم الملف:' : 'File No:'} {patient?.p_no || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{language === 'ar' ? 'إجمالي السجلات' : 'Total Records'}</p>
            <p className="text-2xl font-bold text-blue-600">{myRecords.length}</p>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={language === 'ar' ? 'بحث بالمريض أو الطبيب أو التشخيص...' : 'Search by patient, doctor, diagnosis...'}
              value={searchTerm}
              onChange={handleSearch}
              icon={Search}
            />
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            {filteredRecords.length} {language === 'ar' ? 'سجل' : 'records'}
          </div>
        </div>
      </Card>

      {/* Records Table */}
      <Card>
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
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">{language === 'ar' ? 'لا توجد سجلات' : 'No records found'}</p>
          </div>
        )}
      </Card>

      {/* Record Detail Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={language === 'ar' ? 'تفاصيل الزيارة' : 'Visit Details'}
      >
        {selectedRecord && (
          <div className="space-y-4">
            {/* Patient Info */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{patient?.name || 'Patient'}</p>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'رقم الملف:' : 'File No:'} {patient?.p_no || 'N/A'}</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'التاريخ' : 'Date'}</p>
                <p className="font-medium">{formatDate(selectedRecord.visit_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'النوع' : 'Type'}</p>
                <Badge variant={getTypeBadge(selectedRecord.record_type)}>
                  {selectedRecord.record_type}
                </Badge>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'التشخيص' : 'Diagnosis'}</p>
              <p className="font-semibold text-gray-900">{selectedRecord.diagnosis}</p>
              <p className="text-sm text-gray-600">{selectedRecord.chief_complaint}</p>
            </div>

            {/* Doctor & Hospital */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{language === 'ar' ? 'الطبيب' : 'Doctor'}</p>
                <p className="font-medium">{selectedRecord.doctor_name}</p>
                <p className="text-xs text-gray-500">{selectedRecord.specialization}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{language === 'ar' ? 'المستشفى' : 'Hospital'}</p>
                <p className="font-medium">{selectedRecord.hospital}</p>
                {selectedRecord.ward && <p className="text-xs text-gray-500">{selectedRecord.ward}</p>}
              </div>
            </div>

            {/* Vitals */}
            <div>
              <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'العلامات الحيوية' : 'Vitals'}</p>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500 text-xs">BP</p>
                  <p className="font-semibold">{selectedRecord.vitals.blood_pressure}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500 text-xs">HR</p>
                  <p className="font-semibold">{selectedRecord.vitals.heart_rate}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500 text-xs">Temp</p>
                  <p className="font-semibold">{selectedRecord.vitals.temperature}°</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500 text-xs">SpO2</p>
                  <p className="font-semibold">{selectedRecord.vitals.oxygen_saturation}%</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'ملاحظات' : 'Clinical Notes'}</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRecord.clinical_notes}</p>
            </div>

            {/* Medications */}
            {selectedRecord.prescriptions.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'الأدوية' : 'Medications'}</p>
                <div className="space-y-1">
                  {selectedRecord.prescriptions.map((rx, i) => (
                    <div key={i} className="flex justify-between p-2 bg-blue-50 rounded text-sm">
                      <span className="font-medium">{rx.medication}</span>
                      <span className="text-gray-600">{rx.dosage} - {rx.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Tests */}
            {selectedRecord.lab_orders.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'الفحوصات' : 'Lab Tests'}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedRecord.lab_orders.map((lab, i) => (
                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">{lab}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {selectedRecord.follow_up_date && (
              <div className="p-3 bg-yellow-50 rounded-lg text-sm">
                <span className="text-yellow-700">
                  {language === 'ar' ? 'موعد المتابعة: ' : 'Follow-up: '}
                  {formatDate(selectedRecord.follow_up_date)}
                </span>
              </div>
            )}

            <Button className="w-full" onClick={() => setSelectedRecord(null)}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientRecords;

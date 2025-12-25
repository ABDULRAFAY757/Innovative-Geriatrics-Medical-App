import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FileText,
  Search,
  Eye,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  Stethoscope,
  Calendar
} from 'lucide-react';
import { Card, Badge, Button, Input, Modal, Table, Select } from '../shared/UIComponents';
import { clsx } from 'clsx';
import { medicalRecords, patients, doctors } from '../../data/mockData';

const DoctorMedicalRecords = ({ user }) => {
  const { isRTL, language } = useLanguage();

  const doctorId = user?.id || '1';
  const doctor = doctors.find(d => d.id === doctorId);

  // Get all records for this doctor
  const myRecords = medicalRecords
    .filter(r => r.doctor_id === doctorId)
    .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterHospital, setFilterHospital] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Get unique hospitals from records
  const hospitals = useMemo(() => {
    const uniqueHospitals = [...new Set(myRecords.map(r => r.hospital))];
    return uniqueHospitals;
  }, [myRecords]);

  // Get unique record types
  const recordTypes = useMemo(() => {
    const uniqueTypes = [...new Set(myRecords.map(r => r.record_type))];
    return uniqueTypes;
  }, [myRecords]);

  // Filtered records based on search and filters
  const filteredRecords = useMemo(() => {
    return myRecords.filter(record => {
      const recordPatient = patients.find(p => p.id === record.patient_id);
      const patientName = recordPatient?.name?.toLowerCase() || '';
      const patientNo = recordPatient?.p_no?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();

      const matchesSearch = patientName.includes(search) ||
        patientNo.includes(search) ||
        record.diagnosis.toLowerCase().includes(search) ||
        record.hospital.toLowerCase().includes(search);

      const matchesType = filterType === 'all' || record.record_type === filterType;
      const matchesHospital = filterHospital === 'all' || record.hospital === filterHospital;

      return matchesSearch && matchesType && matchesHospital;
    });
  }, [myRecords, searchTerm, filterType, filterHospital]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRecords = useMemo(() =>
    filteredRecords.slice(startIndex, endIndex),
    [filteredRecords, startIndex, endIndex]
  );

  // Reset to first page when search/filter changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterHospitalChange = (e) => {
    setFilterHospital(e.target.value);
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getStatusBadge = (status) => {
    const variants = {
      'Completed': 'success',
      'Pending': 'warning',
      'Cancelled': 'danger',
    };
    return variants[status] || 'default';
  };

  // Helper to get patient info from record
  const getPatientInfo = (record) => {
    const recordPatient = patients.find(p => p.id === record.patient_id);
    return recordPatient || { name: 'Unknown', p_no: 'N/A' };
  };

  // Stats
  const stats = useMemo(() => {
    const totalRecords = myRecords.length;
    const uniquePatients = new Set(myRecords.map(r => r.patient_id)).size;
    const emergencyCases = myRecords.filter(r => r.record_type === 'Emergency').length;
    const admissions = myRecords.filter(r => r.admission_required).length;
    return { totalRecords, uniquePatients, emergencyCases, admissions };
  }, [myRecords]);

  const columns = [
    {
      header: language === 'ar' ? 'التاريخ والوقت' : 'Date & Time',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{formatDateTime(row.visit_date)}</span>
        </div>
      )
    },
    {
      header: language === 'ar' ? 'رقم الملف' : 'Patient ID',
      render: (row) => {
        const p = getPatientInfo(row);
        return (
          <span className="text-sm font-mono text-blue-600">{p.p_no}</span>
        );
      }
    },
    {
      header: language === 'ar' ? 'اسم المريض' : 'Patient Name',
      render: (row) => {
        const p = getPatientInfo(row);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">{p.name}</span>
          </div>
        );
      }
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
        <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]" title={row.diagnosis}>
          {row.diagnosis}
        </p>
      )
    },
    {
      header: language === 'ar' ? 'المستشفى' : 'Hospital',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm truncate max-w-[150px]" title={row.hospital}>{row.hospital}</span>
        </div>
      )
    },
    {
      header: language === 'ar' ? 'الحالة' : 'Status',
      render: (row) => (
        <Badge variant={getStatusBadge(row.status)} className="text-xs">
          {row.status}
        </Badge>
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
          {language === 'ar' ? 'سجل الاستشارات والزيارات' : 'Consultation and visit history'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{language === 'ar' ? 'إجمالي السجلات' : 'Total Records'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{language === 'ar' ? 'عدد المرضى' : 'Unique Patients'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniquePatients}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <Stethoscope className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{language === 'ar' ? 'حالات الطوارئ' : 'Emergency Cases'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.emergencyCases}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Building2 className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{language === 'ar' ? 'حالات الدخول' : 'Admissions'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admissions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Doctor Info Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">{language === 'ar' ? 'السجلات للطبيب' : 'Records For'}</p>
            <p className="font-semibold text-gray-900">{doctor?.name || user?.name || 'Doctor'}</p>
            <p className="text-xs text-gray-500">{doctor?.specialization || 'Geriatrics'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{language === 'ar' ? 'النتائج' : 'Results'}</p>
            <p className="text-2xl font-bold text-blue-600">{filteredRecords.length}</p>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={language === 'ar' ? 'بحث بالمريض أو التشخيص أو المستشفى...' : 'Search by patient, diagnosis, hospital...'}
              value={searchTerm}
              onChange={handleSearch}
              icon={Search}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="w-48">
              <Select
                value={filterType}
                onChange={handleFilterTypeChange}
                options={[
                  { value: 'all', label: language === 'ar' ? 'جميع الأنواع' : 'All Types' },
                  ...recordTypes.map(type => ({ value: type, label: type }))
                ]}
                placeholder=""
              />
            </div>
            <div className="w-56">
              <Select
                value={filterHospital}
                onChange={handleFilterHospitalChange}
                options={[
                  { value: 'all', label: language === 'ar' ? 'جميع المستشفيات' : 'All Hospitals' },
                  ...hospitals.map(h => ({ value: h, label: h }))
                ]}
                placeholder=""
              />
            </div>
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
            <p className="text-sm text-gray-400 mt-1">
              {language === 'ar' ? 'حاول تغيير معايير البحث' : 'Try adjusting your search criteria'}
            </p>
          </div>
        )}
      </Card>

      {/* Record Detail Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={language === 'ar' ? 'تفاصيل الزيارة' : 'Visit Details'}
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-4">
            {/* Patient Info */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{getPatientInfo(selectedRecord).name}</p>
                <p className="text-xs text-gray-500">
                  {language === 'ar' ? 'رقم الملف:' : 'File No:'} {getPatientInfo(selectedRecord).p_no}
                </p>
              </div>
              <Badge variant={getTypeBadge(selectedRecord.record_type)}>
                {selectedRecord.record_type}
              </Badge>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'التاريخ' : 'Date'}</p>
                <p className="font-medium">{formatDateTime(selectedRecord.visit_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{language === 'ar' ? 'الحالة' : 'Status'}</p>
                <Badge variant={getStatusBadge(selectedRecord.status)}>
                  {selectedRecord.status}
                </Badge>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'التشخيص' : 'Diagnosis'}</p>
              <p className="font-semibold text-gray-900">{selectedRecord.diagnosis}</p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="text-gray-400">ICD-10:</span> {selectedRecord.diagnosis_code}
              </p>
            </div>

            {/* Chief Complaint */}
            <div>
              <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'الشكوى الرئيسية' : 'Chief Complaint'}</p>
              <p className="text-sm text-gray-700">{selectedRecord.chief_complaint}</p>
            </div>

            {/* Hospital Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-gray-400" />
                <p className="font-medium">{selectedRecord.hospital}</p>
              </div>
              {selectedRecord.ward && (
                <p className="text-sm text-gray-500">{selectedRecord.ward}</p>
              )}
              {selectedRecord.hospital_days && (
                <p className="text-sm text-blue-600 mt-1">
                  {language === 'ar' ? `مدة الإقامة: ${selectedRecord.hospital_days} أيام` : `Stay: ${selectedRecord.hospital_days} days`}
                </p>
              )}
            </div>

            {/* Vitals */}
            <div>
              <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'العلامات الحيوية' : 'Vitals'}</p>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
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
                  <p className="text-gray-500 text-xs">Weight</p>
                  <p className="font-semibold">{selectedRecord.vitals.weight}kg</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500 text-xs">SpO2</p>
                  <p className="font-semibold">{selectedRecord.vitals.oxygen_saturation}%</p>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div>
              <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'ملاحظات سريرية' : 'Clinical Notes'}</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRecord.clinical_notes}</p>
            </div>

            {/* Medications */}
            {selectedRecord.prescriptions.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'الأدوية الموصوفة' : 'Prescribed Medications'}</p>
                <div className="space-y-2">
                  {selectedRecord.prescriptions.map((rx, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-blue-50 rounded text-sm">
                      <div>
                        <span className="font-medium">{rx.medication}</span>
                        <span className="text-gray-500 ml-2">{rx.dosage}</span>
                      </div>
                      <div className="text-gray-600 text-xs">
                        {rx.frequency} • {rx.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Tests */}
            {selectedRecord.lab_orders.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">{language === 'ar' ? 'الفحوصات المطلوبة' : 'Lab Orders'}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.lab_orders.map((lab, i) => (
                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                      {lab}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {selectedRecord.follow_up_date && (
              <div className="p-3 bg-yellow-50 rounded-lg text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-600" />
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

export default DoctorMedicalRecords;

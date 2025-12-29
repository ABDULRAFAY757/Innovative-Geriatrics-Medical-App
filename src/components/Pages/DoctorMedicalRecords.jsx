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
  Calendar,
  Activity,
  Heart,
  Pill,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Clipboard,
  TrendingUp,
  Thermometer,
  Weight,
  Droplets
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
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Get unique patients with their records
  const uniquePatients = useMemo(() => {
    const patientMap = new Map();

    myRecords.forEach(record => {
      const patientId = record.patient_id;
      if (!patientMap.has(patientId)) {
        const patientInfo = patients.find(p => p.id === patientId);
        patientMap.set(patientId, {
          ...patientInfo,
          patient_id: patientId,
          records: [],
          latestVisit: null,
          diagnoses: new Set()
        });
      }
      const patient = patientMap.get(patientId);
      patient.records.push(record);
      patient.diagnoses.add(record.diagnosis);

      // Track latest visit
      const visitDate = new Date(record.visit_date);
      if (!patient.latestVisit || visitDate > new Date(patient.latestVisit)) {
        patient.latestVisit = record.visit_date;
        patient.latestDiagnosis = record.diagnosis;
        patient.latestType = record.record_type;
        patient.latestHospital = record.hospital;
      }
    });

    // Convert to array and sort by latest visit
    return Array.from(patientMap.values()).sort((a, b) =>
      new Date(b.latestVisit) - new Date(a.latestVisit)
    );
  }, [myRecords]);

  // Filtered patients based on search and filters
  const filteredPatients = useMemo(() => {
    return uniquePatients.filter(patient => {
      const patientName = patient?.name?.toLowerCase() || '';
      const patientNo = patient?.p_no?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();

      // Check if any diagnosis matches search
      const diagnosisMatch = Array.from(patient.diagnoses).some(d =>
        (d || '').toLowerCase().includes(search)
      );

      // Check if any record matches hospital filter
      const hospitalMatch = filterHospital === 'all' ||
        patient.records.some(r => r.hospital === filterHospital);

      // Check if any record matches type filter
      const typeMatch = filterType === 'all' ||
        patient.records.some(r => r.record_type === filterType);

      const matchesSearch = !search || patientName.includes(search) ||
        patientNo.includes(search) || diagnosisMatch ||
        patient.records.some(r => (r.hospital || '').toLowerCase().includes(search));

      return matchesSearch && typeMatch && hospitalMatch;
    });
  }, [uniquePatients, searchTerm, filterType, filterHospital]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPatients = useMemo(() =>
    filteredPatients.slice(startIndex, endIndex),
    [filteredPatients, startIndex, endIndex]
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

  // Get all records for a specific patient with this doctor
  const getPatientRecordsWithDoctor = (patientId) => {
    return myRecords.filter(r => r.patient_id === patientId);
  };

  // Handle patient row click
  const handlePatientClick = (patient) => {
    // If patient already has records attached (from uniquePatients), use it directly
    if (patient.records && patient.records.length > 0) {
      setSelectedPatient(patient);
    } else {
      // Fallback for old record-based click
      const patientInfo = getPatientInfo(patient);
      const patientRecords = getPatientRecordsWithDoctor(patient.patient_id);
      setSelectedPatient({
        ...patientInfo,
        patient_id: patient.patient_id,
        records: patientRecords
      });
    }
    setActiveTab('overview');
  };

  const columns = [
    {
      header: language === 'ar' ? 'رقم الملف' : 'Patient ID',
      render: (row) => (
        <span className="text-sm font-mono text-blue-600">{row.p_no}</span>
      )
    },
    {
      header: language === 'ar' ? 'اسم المريض' : 'Patient Name',
      render: (row) => (
        <button
          onClick={() => handlePatientClick(row)}
          className="flex items-center gap-2 hover:bg-blue-50 rounded-lg p-1 -m-1 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{row.name}</span>
        </button>
      )
    },
    {
      header: language === 'ar' ? 'آخر زيارة' : 'Last Visit',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{formatDateTime(row.latestVisit)}</span>
        </div>
      )
    },
    {
      header: language === 'ar' ? 'عدد الزيارات' : 'Total Visits',
      render: (row) => (
        <Badge variant="info" className="text-xs">
          {row.records.length} {language === 'ar' ? 'زيارة' : 'visits'}
        </Badge>
      )
    },
    {
      header: language === 'ar' ? 'آخر تشخيص' : 'Latest Diagnosis',
      render: (row) => (
        <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]" title={row.latestDiagnosis}>
          {row.latestDiagnosis}
        </p>
      )
    },
    {
      header: language === 'ar' ? 'الحالة' : 'Status',
      render: (row) => (
        <Badge variant={row.status === 'At Risk' ? 'danger' : row.status === 'Active' ? 'success' : 'default'} className="text-xs">
          {row.status || 'Active'}
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
          onClick={() => handlePatientClick(row)}
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
            <p className="text-sm text-gray-500">{language === 'ar' ? 'المرضى' : 'Patients'}</p>
            <p className="text-2xl font-bold text-blue-600">{filteredPatients.length}</p>
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

      {/* Patients Table */}
      <Card>
        {filteredPatients.length > 0 ? (
          <>
            <Table columns={columns} data={paginatedPatients} />

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
                  ? `${startIndex + 1}-${Math.min(endIndex, filteredPatients.length)} من ${filteredPatients.length}`
                  : `${startIndex + 1}-${Math.min(endIndex, filteredPatients.length)} of ${filteredPatients.length}`
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

      {/* Patient Detail Panel */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title=""
        size="xl"
      >
        {selectedPatient && (
          <div className="space-y-5">
            {/* Patient Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                  <p className="text-blue-100 text-sm mt-0.5">{language === 'ar' ? 'رقم الملف:' : 'File No:'} {selectedPatient.p_no}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {selectedPatient.age && (
                      <span className="px-2 py-1 bg-white/20 rounded-lg text-xs">{selectedPatient.age} {language === 'ar' ? 'سنة' : 'years'}</span>
                    )}
                    {selectedPatient.gender && (
                      <span className="px-2 py-1 bg-white/20 rounded-lg text-xs">{selectedPatient.gender}</span>
                    )}
                    {selectedPatient.blood_type && (
                      <span className="px-2 py-1 bg-red-500/30 rounded-lg text-xs flex items-center gap-1">
                        <Droplets className="w-3 h-3" /> {selectedPatient.blood_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-xs">{language === 'ar' ? 'عدد الزيارات' : 'Total Visits'}</p>
                  <p className="text-3xl font-bold">{selectedPatient.records?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {[
                { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'Overview', icon: Activity },
                { id: 'history', label: language === 'ar' ? 'السجل' : 'History', icon: Clock },
                { id: 'medications', label: language === 'ar' ? 'الأدوية' : 'Medications', icon: Pill }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Contact Info */}
                  {(selectedPatient.phone || selectedPatient.email || selectedPatient.address) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedPatient.phone && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedPatient.phone}</span>
                        </div>
                      )}
                      {selectedPatient.email && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm truncate">{selectedPatient.email}</span>
                        </div>
                      )}
                      {selectedPatient.address && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm truncate">{selectedPatient.address}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-center">
                      <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-900">{selectedPatient.records?.length || 0}</p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'سجلات' : 'Records'}</p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-900">
                        {selectedPatient.records?.filter(r => r.record_type === 'Follow-up').length || 0}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'متابعات' : 'Follow-ups'}</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-900">
                        {selectedPatient.records?.filter(r => r.record_type === 'Emergency').length || 0}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'طوارئ' : 'Emergency'}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-center">
                      <Building2 className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-900">
                        {selectedPatient.records?.filter(r => r.admission_required).length || 0}
                      </p>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'دخول' : 'Admissions'}</p>
                    </div>
                  </div>

                  {/* Latest Vitals */}
                  {selectedPatient.records?.[0]?.vitals && (
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        {language === 'ar' ? 'آخر العلامات الحيوية' : 'Latest Vitals'}
                        <span className="text-xs text-gray-400 font-normal ml-auto">
                          {formatDate(selectedPatient.records[0].visit_date)}
                        </span>
                      </h4>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="p-2 bg-white rounded-lg text-center border">
                          <TrendingUp className="w-4 h-4 text-red-500 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">BP</p>
                          <p className="font-bold text-sm">{selectedPatient.records[0].vitals.blood_pressure}</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg text-center border">
                          <Heart className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">HR</p>
                          <p className="font-bold text-sm">{selectedPatient.records[0].vitals.heart_rate}</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg text-center border">
                          <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Temp</p>
                          <p className="font-bold text-sm">{selectedPatient.records[0].vitals.temperature}°</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg text-center border">
                          <Weight className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="font-bold text-sm">{selectedPatient.records[0].vitals.weight}kg</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg text-center border">
                          <Droplets className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">SpO2</p>
                          <p className="font-bold text-sm">{selectedPatient.records[0].vitals.oxygen_saturation}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Diagnoses */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Clipboard className="w-4 h-4 text-purple-500" />
                      {language === 'ar' ? 'التشخيصات الأخيرة' : 'Recent Diagnoses'}
                    </h4>
                    <div className="space-y-2">
                      {selectedPatient.records?.slice(0, 3).map((record, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={getTypeBadge(record.record_type)} className="text-xs">
                              {record.record_type}
                            </Badge>
                            <span className="font-medium text-gray-900 text-sm">{record.diagnosis}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(record.visit_date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-3">
                    {language === 'ar' ? 'جميع الاستشارات مع هذا المريض' : 'All consultations with this patient'}
                  </p>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {selectedPatient.records?.map((record, idx) => (
                      <div key={idx} className="p-4 bg-white border rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{formatDateTime(record.visit_date)}</p>
                              <p className="text-xs text-gray-500">{record.hospital}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getTypeBadge(record.record_type)} className="text-xs">
                              {record.record_type}
                            </Badge>
                            <Badge variant={getStatusBadge(record.status)} className="text-xs">
                              {record.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="pl-11 space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">{language === 'ar' ? 'التشخيص' : 'Diagnosis'}</p>
                            <p className="font-medium text-gray-900">{record.diagnosis}</p>
                            {record.diagnosis_code && (
                              <p className="text-xs text-gray-400">ICD-10: {record.diagnosis_code}</p>
                            )}
                          </div>

                          {record.chief_complaint && (
                            <div>
                              <p className="text-xs text-gray-500">{language === 'ar' ? 'الشكوى' : 'Chief Complaint'}</p>
                              <p className="text-sm text-gray-700">{record.chief_complaint}</p>
                            </div>
                          )}

                          {record.clinical_notes && (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">{language === 'ar' ? 'ملاحظات' : 'Notes'}</p>
                              <p className="text-sm text-gray-700">{record.clinical_notes}</p>
                            </div>
                          )}

                          {record.prescriptions?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {record.prescriptions.map((rx, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                  {rx.medication}
                                </span>
                              ))}
                            </div>
                          )}

                          {record.follow_up_date && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                              <Clock className="w-3 h-3" />
                              {language === 'ar' ? 'متابعة:' : 'Follow-up:'} {formatDate(record.follow_up_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications Tab */}
              {activeTab === 'medications' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-3">
                    {language === 'ar' ? 'جميع الأدوية الموصوفة لهذا المريض' : 'All medications prescribed to this patient'}
                  </p>
                  {(() => {
                    // Collect all unique medications from all records
                    const allMedications = [];
                    selectedPatient.records?.forEach(record => {
                      record.prescriptions?.forEach(rx => {
                        allMedications.push({
                          ...rx,
                          date: record.visit_date,
                          diagnosis: record.diagnosis
                        });
                      });
                    });

                    if (allMedications.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Pill className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">{language === 'ar' ? 'لا توجد أدوية موصوفة' : 'No medications prescribed'}</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {allMedications.map((med, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Pill className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{med.medication}</p>
                                <p className="text-xs text-gray-500">{med.dosage} • {med.frequency}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{formatDate(med.date)}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[150px]">{med.diagnosis}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-3 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedPatient(null)}
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'ar' ? 'رجوع' : 'Back'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorMedicalRecords;

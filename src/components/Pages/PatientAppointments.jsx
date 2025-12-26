import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { doctors } from '../../data/mockData';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Plus,
  Search,
  ChevronRight,
  Video,
  CheckCircle,
  Stethoscope,
  Star,
  Mail,
  Award,
  Building,
  X
} from 'lucide-react';
import { Card, Table, Badge, Button, Input, Modal, Avatar, Pagination, Select } from '../shared/UIComponents';
import { clsx } from 'clsx';

const PatientAppointments = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { appointments, bookAppointment, cancelAppointment } = useApp();

  const patientId = user?.id || '1';
  const myAppointments = appointments.filter(a => a.patient_id === patientId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, completed, cancelled
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctor_id: '',
    doctor_name: '',
    specialization: '',
    type: 'Consultation',
    date: '',
    time: '',
    location: '',
    locationType: '',
    notes: ''
  });

  // Doctor options for dropdown with consultation fees
  const doctorOptions = useMemo(() =>
    doctors.map(doc => ({
      value: doc.id,
      label: `${doc.nameEn} - ${doc.specialization} (${doc.consultationFee} SAR)`,
    })), []);

  // Get selected doctor details
  const selectedDoctor = useMemo(() =>
    doctors.find(d => d.id === selectedDoctorId), [selectedDoctorId]);

  // Update appointment when doctor is selected
  const handleDoctorSelect = (e) => {
    const doctorId = e.target.value;
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setNewAppointment(prev => ({
        ...prev,
        doctor_id: doctor.id,
        doctor_name: doctor.nameEn,
        specialization: doctor.specialization,
        location: doctor.hospital,
        locationType: 'in-person' // Default to in-person
      }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAppointments = myAppointments.filter(apt => {
    const matchesSearch = apt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'upcoming' && apt.status === 'Confirmed') ||
      (filterStatus === 'completed' && apt.status === 'Completed') ||
      (filterStatus === 'cancelled' && apt.status === 'Cancelled');
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };
  const resetPage = () => setCurrentPage(1);

  // Reset page when search/filter changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    resetPage();
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    resetPage();
  };

  const upcomingCount = myAppointments.filter(a => a.status === 'Confirmed').length;
  const completedCount = myAppointments.filter(a => a.status === 'Completed').length;

  const handleBookAppointment = () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // STEP 1: Client-side validation (NO alert/notifications, just silent checks)
    // The AppContext will handle showing error notifications
    if (!selectedDoctorId || !newAppointment.date || !newAppointment.time || !newAppointment.location) {
      // Don't show alert here - let AppContext validation handle it
      return;
    }

    // STEP 2: Set submitting state to prevent multiple clicks
    setIsSubmitting(true);

    try {
      // STEP 3: Create proper ISO datetime in local timezone
      const [year, month, day] = newAppointment.date.split('-');
      const [hours, minutes] = newAppointment.time.split(':');
      const appointmentDate = new Date(year, month - 1, day, hours, minutes);

      // STEP 4: Build appointment data object with ALL required fields
      const appointmentData = {
        patient_id: patientId,
        doctor_id: selectedDoctorId, // Use selectedDoctorId, not newAppointment.doctor_id
        doctor_name: selectedDoctor?.nameEn || newAppointment.doctor_name,
        specialization: selectedDoctor?.specialization || newAppointment.specialization,
        type: newAppointment.type,
        date: appointmentDate.toISOString(),
        time: newAppointment.time, // Include time field for validation
        location: newAppointment.location,
        notes: newAppointment.notes || '',
      };

      // STEP 5: Call AppContext bookAppointment (it handles validation and notifications)
      const result = bookAppointment(appointmentData);

      // STEP 6: Only close modal and reset form if booking was successful
      if (result) {
        setShowNewAppointment(false);
        setSelectedDoctorId('');
        setNewAppointment({
          doctor_id: '',
          doctor_name: '',
          specialization: '',
          type: 'Consultation',
          date: '',
          time: '',
          location: '',
          locationType: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      // STEP 7: Always reset submitting state
      setIsSubmitting(false);
    }
  };

  // Action handlers
  const handleVideoCall = (appointment) => {
    alert(`Starting video call with ${appointment.doctor_name}...\n\nThis would launch the video consultation interface.`);
  };

  const handlePhoneCall = (appointment) => {
    alert(`Calling ${appointment.doctor_name}...\n\nThis would initiate a phone call to the doctor's office.`);
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    if (appointmentToCancel) {
      cancelAppointment(appointmentToCancel.id);
      setShowCancelConfirm(false);
      setAppointmentToCancel(null);
    }
  };

  const statusColors = {
    Confirmed: 'success',
    Scheduled: 'info',
    Completed: 'default',
    Cancelled: 'danger',
    Pending: 'warning',
  };

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header - Enhanced */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t('my_appointments')}
              </h1>
              <p className="text-gray-600 text-sm">View and manage your medical appointments</p>
            </div>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowNewAppointment(true)}
            className="hover:scale-105 active:scale-95 transition-transform shadow-lg"
          >
            {language === 'ar' ? 'حجز موعد' : 'Book Appointment'}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-slideUp">
        <div className="group relative overflow-hidden p-5 bg-gradient-to-br from-blue-50 via-blue-50/50 to-white border-2 border-blue-200 rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{myAppointments.length}</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden p-5 bg-gradient-to-br from-green-50 via-green-50/50 to-white border-2 border-green-200 rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/30 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingCount}</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden p-5 bg-gradient-to-br from-purple-50 via-purple-50/50 to-white border-2 border-purple-200 rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/30 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Doctors - Compact View */}
      <div className="mb-6 p-6 bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'ar' ? 'الأطباء المتاحون' : 'Available Doctors'}
          </h2>
          <span className="text-sm text-gray-600">
            {doctors.length} {language === 'ar' ? 'طبيب' : 'doctors'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {/* Doctor Header */}
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={doctor.nameEn} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">
                    {doctor.nameEn}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium truncate">
                    {doctor.specialization}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={clsx(
                            'w-3 h-3',
                            star <= Math.floor(doctor.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({doctor.rating})</span>
                  </div>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{doctor.hospital}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Award className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>{doctor.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>{doctor.availability}</span>
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div>
                  <p className="text-lg font-bold text-green-600">{doctor.consultationFee} SAR</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedDoctorId(doctor.id);
                    handleDoctorSelect({ target: { value: doctor.id } });
                    setShowNewAppointment(true);
                  }}
                  className="hover:scale-110 transition-transform"
                >
                  {language === 'ar' ? 'حجز' : 'Book'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 p-6 bg-white/95 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl shadow-lg animate-fadeIn">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={language === 'ar' ? 'بحث عن طبيب أو تخصص...' : 'Search by doctor or specialization...'}
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
              onClick={() => handleFilterChange('upcoming')}
              className={clsx(
                'px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border-2',
                filterStatus === 'upcoming'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-600 shadow-lg shadow-green-500/30'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50 hover:shadow-md'
              )}
            >
              {language === 'ar' ? 'القادمة' : 'Upcoming'}
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={clsx(
                'px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border-2',
                filterStatus === 'completed'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600 shadow-lg shadow-purple-500/30'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'
              )}
            >
              {language === 'ar' ? 'مكتملة' : 'Completed'}
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="p-6 bg-white/95 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'ar' ? 'مواعيدك' : 'Your Appointments'}
          </h2>
          {filteredAppointments.length > 0 && (
            <span className="text-sm text-gray-600">
              {filteredAppointments.length} {language === 'ar' ? 'موعد' : 'appointments'}
            </span>
          )}
        </div>
        <Table
          columns={[
            {
              key: 'date',
              label: language === 'ar' ? 'التاريخ' : 'Date',
              render: (apt) => (
                <div>
                  <p className="font-semibold text-gray-900">{formatDate(apt.date)}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(apt.date)}
                  </p>
                </div>
              ),
            },
            {
              key: 'doctor',
              label: language === 'ar' ? 'الطبيب' : 'Doctor',
              render: (apt) => (
                <div className="flex items-center gap-3">
                  <Avatar name={apt.doctor_name} size="sm" />
                  <div>
                    <p className="font-semibold text-gray-900">{apt.doctor_name}</p>
                    <p className="text-sm text-blue-600">{apt.specialization}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'type',
              label: language === 'ar' ? 'النوع' : 'Type',
              render: (apt) => (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                  {apt.type}
                </span>
              ),
            },
            {
              key: 'location',
              label: language === 'ar' ? 'الموقع' : 'Location',
              render: (apt) => (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{apt.location}</span>
                </div>
              ),
            },
            {
              key: 'status',
              label: language === 'ar' ? 'الحالة' : 'Status',
              render: (apt) => <Badge variant={statusColors[apt.status]}>{apt.status}</Badge>,
            },
            {
              key: 'actions',
              label: language === 'ar' ? 'الإجراءات' : 'Actions',
              render: (apt) => (
                <div className="flex gap-1.5">
                  {apt.status === 'Confirmed' && (
                    <>
                      <button
                        onClick={() => handleVideoCall(apt)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110 transition-all"
                        title={language === 'ar' ? 'مكالمة فيديو' : 'Video Call'}
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePhoneCall(apt)}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 hover:scale-110 transition-all"
                        title={language === 'ar' ? 'اتصال هاتفي' : 'Phone Call'}
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => handleCancelClick(apt)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 transition-all"
                      title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(apt)}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110 transition-all"
                    title={language === 'ar' ? 'التفاصيل' : 'Details'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={paginatedAppointments}
          emptyMessage={
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500 font-semibold">
                {language === 'ar' ? 'لا توجد مواعيد' : 'No appointments found'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {language === 'ar' ? 'احجز موعدك الأول للبدء' : 'Book your first appointment to get started'}
              </p>
              <Button
                variant="primary"
                icon={Plus}
                className="mt-4 hover:scale-105 transition-transform"
                onClick={() => setShowNewAppointment(true)}
              >
                {language === 'ar' ? 'حجز موعد' : 'Book Appointment'}
              </Button>
            </div>
          }
        />
        {filteredAppointments.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAppointments.length}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              isRTL={isRTL}
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
          </div>
        )}
      </div>


      {/* Book Appointment Modal */}
      <Modal
        isOpen={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        title={language === 'ar' ? 'حجز موعد جديد' : 'Book New Appointment'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Doctor Selection Dropdown */}
          <Select
            label={language === 'ar' ? 'اختر الطبيب' : 'Select Doctor'}
            value={selectedDoctorId}
            onChange={handleDoctorSelect}
            options={doctorOptions}
            placeholder={language === 'ar' ? 'اختر طبيباً...' : 'Choose a doctor...'}
          />

          {/* Selected Doctor Info Card */}
          {selectedDoctor && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 animate-fadeIn transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedDoctor.nameEn}</h4>
                  <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedDoctor.hospital}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedDoctor.availability}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-500">
                    {'★'.repeat(Math.floor(selectedDoctor.rating || 4))}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedDoctor.consultationFee} SAR
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'اختر التاريخ' : 'Select Date'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(() => {
                const dates = [];
                for (let i = 0; i < 8; i++) {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();
                  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                  const isToday = i === 0;
                  const isTomorrow = i === 1;
                  dates.push(
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setNewAppointment(prev => ({ ...prev, date: dateStr }))}
                      className={clsx(
                        'p-3 rounded-xl border-2 text-center transition-all',
                        newAppointment.date === dateStr
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      )}
                    >
                      <p className="text-xs text-gray-500">
                        {isToday ? (language === 'ar' ? 'اليوم' : 'Today') : isTomorrow ? (language === 'ar' ? 'غداً' : 'Tomorrow') : dayName}
                      </p>
                      <p className="text-lg font-bold">{dayNum}</p>
                      <p className="text-xs text-gray-500">{monthName}</p>
                    </button>
                  );
                }
                return dates;
              })()}
            </div>
          </div>

          {/* Quick Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'اختر الوقت' : 'Select Time'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setNewAppointment(prev => ({ ...prev, time }))}
                  className={clsx(
                    'py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all',
                    newAppointment.time === time
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Appointment Type - Quick Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'نوع الموعد' : 'Appointment Type'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'Consultation', label: language === 'ar' ? 'استشارة' : 'Consultation' },
                { value: 'Follow-up', label: language === 'ar' ? 'متابعة' : 'Follow-up' },
                { value: 'Checkup', label: language === 'ar' ? 'فحص' : 'Checkup' },
                { value: 'Lab Review', label: language === 'ar' ? 'مراجعة' : 'Lab Review' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setNewAppointment(prev => ({ ...prev, type: type.value }))}
                  className={clsx(
                    'py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all',
                    newAppointment.type === type.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'نوع الموقع' : 'Location Type'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewAppointment(prev => ({
                  ...prev,
                  location: selectedDoctor?.hospital || 'In-Person Visit',
                  locationType: 'in-person'
                }))}
                className={clsx(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  newAppointment.locationType === 'in-person' || (!newAppointment.locationType && newAppointment.location === selectedDoctor?.hospital)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {language === 'ar' ? 'في العيادة' : 'In-Person'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedDoctor?.hospital || (language === 'ar' ? 'في المستشفى' : 'At Hospital')}
                    </p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setNewAppointment(prev => ({
                  ...prev,
                  location: language === 'ar' ? 'استشارة عبر الإنترنت' : 'Online Consultation',
                  locationType: 'online'
                }))}
                className={clsx(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  newAppointment.locationType === 'online' || newAppointment.location === 'Online Consultation' || newAppointment.location === 'استشارة عبر الإنترنت'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {language === 'ar' ? 'عبر الإنترنت' : 'Online/Remote'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {language === 'ar' ? 'مكالمة فيديو' : 'Video Consultation'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'ملاحظات / سبب الزيارة' : 'Notes / Reason for Visit'} <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="w-full h-20 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm resize-none"
              placeholder={language === 'ar' ? 'صف سبب موعدك...' : 'Describe the reason for your appointment...'}
              value={newAppointment.notes}
              onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
            />
          </div>

          {/* Appointment Summary */}
          {selectedDoctorId && newAppointment.date && newAppointment.time && newAppointment.location && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 animate-fadeIn">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">
                    {language === 'ar' ? 'ملخص الموعد' : 'Appointment Summary'}
                  </p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">{language === 'ar' ? 'الطبيب:' : 'Doctor:'}</span>{' '}
                      {selectedDoctor?.nameEn}
                    </p>
                    <p>
                      <span className="font-medium">{language === 'ar' ? 'التاريخ:' : 'Date:'}</span>{' '}
                      {new Date(newAppointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p>
                      <span className="font-medium">{language === 'ar' ? 'الوقت:' : 'Time:'}</span>{' '}
                      {newAppointment.time}
                    </p>
                    <p>
                      <span className="font-medium">{language === 'ar' ? 'النوع:' : 'Type:'}</span>{' '}
                      {newAppointment.type}
                    </p>
                    <p>
                      <span className="font-medium">{language === 'ar' ? 'الموقع:' : 'Location:'}</span>{' '}
                      {newAppointment.location}
                    </p>
                    {selectedDoctor?.consultationFee && (
                      <p className="pt-2 border-t border-blue-200 mt-2">
                        <span className="font-medium">{language === 'ar' ? 'رسوم الاستشارة:' : 'Consultation Fee:'}</span>{' '}
                        <span className="text-lg font-bold text-blue-700">{selectedDoctor.consultationFee} SAR</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowNewAppointment(false);
                setSelectedDoctorId('');
                setIsSubmitting(false);
                setNewAppointment({
                  doctor_id: '',
                  doctor_name: '',
                  specialization: '',
                  type: 'Consultation',
                  date: '',
                  time: '',
                  location: '',
                  locationType: '',
                  notes: ''
                });
              }}
              className="flex-1"
              disabled={isSubmitting}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleBookAppointment}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (language === 'ar' ? 'جاري الحجز...' : 'Booking...')
                : (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking')
              }
            </Button>
          </div>
        </div>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showAppointmentDetails}
        onClose={() => setShowAppointmentDetails(false)}
        title={language === 'ar' ? 'تفاصيل الموعد' : 'Appointment Details'}
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={selectedAppointment.doctor_name} size="lg" />
                <div>
                  <h3 className="font-semibold text-lg">{selectedAppointment.doctor_name}</h3>
                  <p className="text-gray-600">{selectedAppointment.specialization}</p>
                </div>
              </div>
              <Badge variant={statusColors[selectedAppointment.status]}>
                {selectedAppointment.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{language === 'ar' ? 'التاريخ' : 'Date'}</p>
                  <p className="font-medium">{formatDate(selectedAppointment.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{language === 'ar' ? 'الوقت' : 'Time'}</p>
                  <p className="font-medium">{formatTime(selectedAppointment.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{language === 'ar' ? 'الموقع' : 'Location'}</p>
                  <p className="font-medium">{selectedAppointment.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{language === 'ar' ? 'نوع الموعد' : 'Appointment Type'}</p>
                  <p className="font-medium">{selectedAppointment.type}</p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{language === 'ar' ? 'ملاحظات' : 'Notes'}</p>
                    <p className="font-medium">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              {selectedAppointment.status === 'Confirmed' && (
                <>
                  <Button variant="primary" onClick={() => handleVideoCall(selectedAppointment)} className="flex-1">
                    <Video className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'مكالمة فيديو' : 'Video Call'}
                  </Button>
                  <Button variant="secondary" onClick={() => handlePhoneCall(selectedAppointment)} className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'اتصال هاتفي' : 'Phone Call'}
                  </Button>
                </>
              )}
              {selectedAppointment.status === 'Scheduled' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowAppointmentDetails(false);
                    handleCancelClick(selectedAppointment);
                  }}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إلغاء الموعد' : 'Cancel Appointment'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setAppointmentToCancel(null);
        }}
        title={language === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancellation'}
      >
        {appointmentToCancel && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-700">
                {language === 'ar'
                  ? 'هل أنت متأكد أنك تريد إلغاء هذا الموعد؟'
                  : 'Are you sure you want to cancel this appointment?'}
              </p>
              <div className="mt-3 space-y-2">
                <p className="font-semibold">{appointmentToCancel.doctor_name}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(appointmentToCancel.date)} at {formatTime(appointmentToCancel.date)}
                </p>
                <p className="text-sm text-gray-600">{appointmentToCancel.location}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCancelConfirm(false);
                  setAppointmentToCancel(null);
                }}
                className="flex-1"
              >
                {language === 'ar' ? 'لا، احتفظ بالموعد' : 'No, Keep Appointment'}
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                className="flex-1"
              >
                {language === 'ar' ? 'نعم، إلغاء الموعد' : 'Yes, Cancel Appointment'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientAppointments;

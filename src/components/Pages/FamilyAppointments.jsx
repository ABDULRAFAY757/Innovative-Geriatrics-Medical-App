import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { doctors } from '../../data/mockData';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Search,
  Video,
  CheckCircle,
  Stethoscope,
  Star,
  Building,
  User,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import { Card, Badge, Button, Input, Modal, Pagination } from '../shared/UIComponents';
import { clsx } from 'clsx';

const FamilyAppointments = ({ user }) => {
  const { isRTL, language } = useLanguage();
  const { appointments, patients, familyMembers } = useApp();

  // Find which patient this family member is connected to
  const familyMember = familyMembers.find(f => f.id === user?.id);
  const patientId = familyMember?.patient_id || '1';
  const patient = patients.find(p => p.id === patientId);

  const myAppointments = appointments.filter(a => a.patient_id === patientId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

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

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isPast = date < now;

    if (isPast) {
      return { label: language === 'ar' ? 'منتهي' : 'Past', color: 'gray' };
    } else if (isToday) {
      return { label: language === 'ar' ? 'اليوم' : 'Today', color: 'green' };
    } else if (isTomorrow) {
      return { label: language === 'ar' ? 'غداً' : 'Tomorrow', color: 'blue' };
    } else {
      const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
      return {
        label: language === 'ar' ? `بعد ${diffDays} يوم` : `In ${diffDays} days`,
        color: diffDays <= 7 ? 'purple' : 'gray'
      };
    }
  };

  const filteredAppointments = useMemo(() => {
    return myAppointments.filter(apt => {
      const doctorName = (apt.doctor_name || '').toLowerCase();
      const specialization = (apt.specialization || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || doctorName.includes(search) || specialization.includes(search);

      const matchesFilter = filterStatus === 'all' ||
        (filterStatus === 'upcoming' && (apt.status === 'Confirmed' || apt.status === 'Scheduled')) ||
        (filterStatus === 'completed' && apt.status === 'Completed') ||
        (filterStatus === 'cancelled' && apt.status === 'Cancelled');

      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [myAppointments, searchTerm, filterStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  // Stats
  const upcomingCount = myAppointments.filter(a => a.status === 'Confirmed' || a.status === 'Scheduled').length;
  const completedCount = myAppointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = myAppointments.filter(a => a.status === 'Cancelled').length;

  const statusColors = {
    Confirmed: 'success',
    Scheduled: 'info',
    Completed: 'default',
    Cancelled: 'danger',
    Pending: 'warning',
  };

  const viewAppointmentDetails = (apt) => {
    setSelectedAppointment(apt);
    setShowAppointmentDetails(true);
  };

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
        <p className="text-gray-600">{language === 'ar' ? 'لم يتم العثور على المريض' : 'Patient not found'}</p>
      </div>
    );
  }

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              {language === 'ar' ? 'مواعيد المريض' : 'Patient Appointments'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'ar' ? 'مواعيد' : 'Appointments for'}{' '}
              <span className="font-semibold text-purple-600">{patient.nameEn || patient.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-100">{language === 'ar' ? 'الإجمالي' : 'Total'}</p>
              <p className="text-2xl font-bold">{myAppointments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-green-100">{language === 'ar' ? 'قادمة' : 'Upcoming'}</p>
              <p className="text-2xl font-bold">{upcomingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-100">{language === 'ar' ? 'مكتملة' : 'Completed'}</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-rose-500 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <X className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-red-100">{language === 'ar' ? 'ملغاة' : 'Cancelled'}</p>
              <p className="text-2xl font-bold">{cancelledCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={language === 'ar' ? 'البحث بالطبيب أو التخصص...' : 'Search by doctor or specialization...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              icon={Search}
            />
          </div>

          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {[
              { value: 'all', label: language === 'ar' ? 'الكل' : 'All' },
              { value: 'upcoming', label: language === 'ar' ? 'قادمة' : 'Upcoming' },
              { value: 'completed', label: language === 'ar' ? 'مكتملة' : 'Completed' },
              { value: 'cancelled', label: language === 'ar' ? 'ملغاة' : 'Cancelled' },
            ].map(status => (
              <button
                key={status.value}
                onClick={() => {
                  setFilterStatus(status.value);
                  setCurrentPage(1);
                }}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filterStatus === status.value
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {language === 'ar' ? 'قائمة المواعيد' : 'Appointments List'}
          </h2>
          <Badge variant="default">{filteredAppointments.length} {language === 'ar' ? 'موعد' : 'appointments'}</Badge>
        </div>

        {filteredAppointments.length > 0 ? (
          <>
            <div className="space-y-4">
              {paginatedAppointments.map((apt) => {
                const doctor = doctors.find(d => d.id === apt.doctor_id);
                const dateInfo = formatRelativeDate(apt.date);

                return (
                  <div
                    key={apt.id}
                    className={clsx(
                      'p-4 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer',
                      apt.status === 'Cancelled'
                        ? 'bg-red-50 border-red-200 opacity-70'
                        : apt.status === 'Completed'
                        ? 'bg-gray-50 border-gray-200'
                        : dateInfo.color === 'green'
                        ? 'bg-green-50 border-green-200'
                        : dateInfo.color === 'blue'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                    )}
                    onClick={() => viewAppointmentDetails(apt)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Date/Time Block */}
                      <div className={clsx(
                        'flex flex-col items-center justify-center w-20 h-20 rounded-xl',
                        dateInfo.color === 'green' ? 'bg-green-100' :
                        dateInfo.color === 'blue' ? 'bg-blue-100' :
                        dateInfo.color === 'purple' ? 'bg-purple-100' :
                        'bg-gray-100'
                      )}>
                        <span className={clsx(
                          'text-xs font-semibold uppercase',
                          `text-${dateInfo.color}-600`
                        )}>
                          {dateInfo.label}
                        </span>
                        <span className={clsx(
                          'text-lg font-bold',
                          `text-${dateInfo.color}-700`
                        )}>
                          {formatTime(apt.date)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(apt.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Stethoscope className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold text-gray-900 truncate">
                            {apt.doctor_name || doctor?.nameEn || 'Doctor'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{apt.specialization || doctor?.specialization}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {apt.type || 'Consultation'}
                          </span>
                          {(apt.location || doctor?.hospital) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {apt.location || doctor?.hospital}
                            </span>
                          )}
                          {apt.locationType === 'video' && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Video className="w-3 h-3" />
                              {language === 'ar' ? 'فيديو' : 'Video Call'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={statusColors[apt.status] || 'default'}>
                          {apt.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewAppointmentDetails(apt);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {language === 'ar' ? 'عرض' : 'View'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
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
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-medium">{language === 'ar' ? 'لا توجد مواعيد' : 'No appointments found'}</p>
            <p className="text-sm mt-1">{language === 'ar' ? 'ستظهر مواعيد المريض هنا' : "Patient's appointments will appear here"}</p>
          </div>
        )}
      </Card>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showAppointmentDetails}
        onClose={() => {
          setShowAppointmentDetails(false);
          setSelectedAppointment(null);
        }}
        title={language === 'ar' ? 'تفاصيل الموعد' : 'Appointment Details'}
        size="lg"
      >
        {selectedAppointment && (() => {
          const doctor = doctors.find(d => d.id === selectedAppointment.doctor_id);
          return (
            <div className="space-y-6">
              {/* Doctor Info Header */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {(selectedAppointment.doctor_name || doctor?.nameEn || 'D').charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedAppointment.doctor_name || doctor?.nameEn}
                  </h3>
                  <p className="text-purple-600 font-medium">
                    {selectedAppointment.specialization || doctor?.specialization}
                  </p>
                  {doctor?.hospital && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Building className="w-4 h-4" />
                      {doctor.hospital}
                    </p>
                  )}
                </div>
                <Badge variant={statusColors[selectedAppointment.status] || 'default'} size="lg">
                  {selectedAppointment.status}
                </Badge>
              </div>

              {/* Appointment Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-500">{language === 'ar' ? 'التاريخ' : 'Date'}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{formatDate(selectedAppointment.date)}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-500">{language === 'ar' ? 'الوقت' : 'Time'}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{formatTime(selectedAppointment.date)}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-500">{language === 'ar' ? 'نوع الموعد' : 'Type'}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{selectedAppointment.type || 'Consultation'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAppointment.locationType === 'video' ? (
                      <Video className="w-5 h-5 text-blue-500" />
                    ) : (
                      <MapPin className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm text-gray-500">{language === 'ar' ? 'الموقع' : 'Location'}</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedAppointment.locationType === 'video'
                      ? (language === 'ar' ? 'استشارة فيديو' : 'Video Consultation')
                      : selectedAppointment.location || doctor?.hospital || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Doctor Contact Info */}
              {doctor && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    {language === 'ar' ? 'معلومات الاتصال بالطبيب' : 'Doctor Contact Info'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {doctor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                    {doctor.rating && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{doctor.rating} / 5</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                  </h4>
                  <p className="text-gray-600">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAppointmentDetails(false);
                    setSelectedAppointment(null);
                  }}
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default FamilyAppointments;

import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Plus,
  Search,
  ChevronRight,
  Video,
  CheckCircle
} from 'lucide-react';
import { Card, Table, Badge, Button, Input, Modal, Avatar, Pagination } from '../shared/UIComponents';
import { clsx } from 'clsx';

const PatientAppointments = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { appointments, bookAppointment } = useApp();

  const patientId = user?.id || '1';
  const myAppointments = appointments.filter(a => a.patient_id === patientId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, completed, cancelled
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctor_name: '',
    specialization: 'General',
    type: 'Consultation',
    date: '',
    time: '',
    location: 'King Fahad Medical City',
    notes: ''
  });

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
    if (!newAppointment.doctor_name || !newAppointment.date || !newAppointment.time) {
      return;
    }

    const appointmentData = {
      patient_id: patientId,
      doctor_id: '1',
      doctor_name: newAppointment.doctor_name,
      specialization: newAppointment.specialization,
      type: newAppointment.type,
      date: `${newAppointment.date}T${newAppointment.time}:00Z`,
      location: newAppointment.location,
      notes: newAppointment.notes,
    };

    bookAppointment(appointmentData);
    setShowNewAppointment(false);
    setNewAppointment({
      doctor_name: '',
      specialization: 'General',
      type: 'Consultation',
      date: '',
      time: '',
      location: 'King Fahad Medical City',
      notes: ''
    });
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('my_appointments')}</h1>
        <p className="text-gray-600 mt-1">View and manage your medical appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{myAppointments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by doctor or specialization..."
              value={searchTerm}
              onChange={handleSearchChange}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'upcoming' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('completed')}
            >
              Completed
            </Button>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowNewAppointment(true)}
          >
            Book Appointment
          </Button>
        </div>
      </Card>

      {/* Appointments List */}
      <Card title="Your Appointments">
        {filteredAppointments.length > 0 ? (
          <>
          <div className="space-y-4">
            {paginatedAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {/* Date Section */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold uppercase">
                      {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {new Date(apt.date).getDate()}
                    </p>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Avatar name={apt.doctor_name} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{apt.doctor_name}</h3>
                      <p className="text-sm text-gray-600">{apt.specialization}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(apt.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{apt.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{apt.type}</span>
                        </div>
                      </div>
                      {apt.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">&ldquo;{apt.notes}&rdquo;</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col gap-2 items-end">
                  <Badge variant={statusColors[apt.status]}>
                    {apt.status}
                  </Badge>
                  {apt.status === 'Confirmed' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="primary" size="sm">
                        Join Video
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No appointments found</p>
            <p className="text-sm">Book your first appointment to get started</p>
            <Button
              variant="primary"
              icon={Plus}
              className="mt-4"
              onClick={() => setShowNewAppointment(true)}
            >
              Book Appointment
            </Button>
          </div>
        )}
      </Card>

      {/* Appointments Table */}
      {filteredAppointments.length > 0 && (
        <Card title="Appointment History" className="mt-6">
          <Table
            columns={[
              {
                header: 'Date',
                render: (row) => (
                  <div>
                    <p className="font-medium">{formatDate(row.date)}</p>
                    <p className="text-xs text-gray-500">{formatTime(row.date)}</p>
                  </div>
                )
              },
              {
                header: 'Doctor',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <Avatar name={row.doctor_name} size="sm" />
                    <div>
                      <p className="font-medium">{row.doctor_name}</p>
                      <p className="text-xs text-gray-500">{row.specialization}</p>
                    </div>
                  </div>
                )
              },
              {
                header: 'Type',
                accessor: 'type'
              },
              {
                header: 'Location',
                render: (row) => (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{row.location}</span>
                  </div>
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
                    {row.status === 'Confirmed' && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )
              }
            ]}
            data={paginatedAppointments}
          />
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
        </Card>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        title="Book New Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Doctor Name"
            placeholder="e.g., Dr. Ahmed Hassan"
            value={newAppointment.doctor_name}
            onChange={(e) => setNewAppointment({ ...newAppointment, doctor_name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newAppointment.specialization}
                onChange={(e) => setNewAppointment({ ...newAppointment, specialization: e.target.value })}
              >
                <option value="General">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Geriatrics">Geriatrics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Type
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newAppointment.type}
                onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Checkup">Checkup</option>
                <option value="Lab Review">Lab Review</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
            />
            <Input
              type="time"
              label="Time"
              value={newAppointment.time}
              onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
            />
          </div>

          <Input
            label="Location"
            placeholder="Hospital or Clinic"
            value={newAppointment.location}
            onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Reason for Visit
            </label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder="Describe the reason for your appointment..."
              value={newAppointment.notes}
              onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewAppointment(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookAppointment}
              className="flex-1"
              disabled={!newAppointment.doctor_name || !newAppointment.date || !newAppointment.time}
            >
              Book Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientAppointments;

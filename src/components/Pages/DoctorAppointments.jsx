import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import { appointments as allAppointments, patients } from '../../data/mockData';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Video,
  CheckCircle,
  AlertCircle,
  Plus,
  Search
} from 'lucide-react';
import { Card, Table, Badge, Button, Input, Avatar } from '../shared/UIComponents';
import { clsx } from 'clsx';

const DoctorAppointments = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { appointments } = useApp();

  const doctorId = user?.id || '1';
  const myAppointments = appointments.filter(a => a.doctor_id === doctorId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('today');

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

  const todaysAppointments = myAppointments.filter(a => {
    const aptDate = new Date(a.date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = myAppointments.filter(a => {
    const aptDate = new Date(a.date);
    const today = new Date();
    return aptDate > today;
  });

  const filteredAppointments = myAppointments.filter(apt => {
    const patient = patients.find(p => p.id === apt.patient_id);
    const matchesSearch = patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient?.nameEn.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'today') {
      const aptDate = new Date(apt.date);
      const today = new Date();
      return aptDate.toDateString() === today.toDateString() && matchesSearch;
    }
    return matchesSearch;
  });

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Appointments</h1>
        <p className="text-gray-600 mt-1">Manage your daily schedule</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today&apos;s Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{todaysAppointments.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{myAppointments.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'today' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('today')}
            >
              Today
            </Button>
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      <Card title="Appointment Schedule">
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => {
              const patient = patients.find(p => p.id === apt.patient_id);
              return (
                <div
                  key={apt.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
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

                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <Avatar name={patient?.nameEn} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {language === 'ar' ? patient?.name : patient?.nameEn}
                        </h3>
                        <p className="text-sm text-gray-600">{patient?.p_no}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(apt.date)}</span>
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

                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant={statusColors[apt.status]}>
                      {apt.status}
                    </Badge>
                    {apt.status === 'Confirmed' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="primary" size="sm">
                          <Video className="w-4 h-4" />
                          Start
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No appointments scheduled for today</p>
            <p className="text-sm">Check back later or view all appointments</p>
          </div>
        )}
      </Card>

      {/* Appointments Table */}
      {filteredAppointments.length > 0 && (
        <Card title="Detailed Schedule" className="mt-6">
          <Table
            columns={[
              {
                header: 'Time',
                render: (row) => (
                  <div>
                    <p className="font-medium">{formatTime(row.date)}</p>
                    <p className="text-xs text-gray-500">{formatDate(row.date)}</p>
                  </div>
                )
              },
              {
                header: 'Patient',
                render: (row) => {
                  const patient = patients.find(p => p.id === row.patient_id);
                  return (
                    <div className="flex items-center gap-2">
                      <Avatar name={patient?.nameEn} size="sm" />
                      <div>
                        <p className="font-medium">{language === 'ar' ? patient?.name : patient?.nameEn}</p>
                        <p className="text-xs text-gray-500">{patient?.p_no}</p>
                      </div>
                    </div>
                  );
                }
              },
              {
                header: 'Type',
                accessor: 'type'
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
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="primary" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )
              }
            ]}
            data={filteredAppointments}
          />
        </Card>
      )}
    </div>
  );
};

export default DoctorAppointments;

import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  Clipboard,
  Plus,
  Check,
  Trash2,
  Clock,
  CheckCircle,
  Search,
  Calendar,
  Bell,
  Repeat,
  Filter,
  TrendingUp,
  AlertTriangle,
  Pill,
  Heart,
  Utensils,
  Activity,
  Eye,
  Timer,
  Star,
  RefreshCw
} from 'lucide-react';
import { Card, Badge, Button, Input, Modal, Pagination, Select } from '../shared/UIComponents';
import { clsx } from 'clsx';

const FamilyCareTasks = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { careTasks, addCareTask, completeCareTask, deleteCareTask, showNotification } = useApp();

  const familyId = user?.id || 'f1';
  const myCareTasks = careTasks.filter(task => task.family_id === familyId);

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    due_date: '',
    due_time: '',
    category: 'Medication',
    recurrence: 'none',
    reminder_before: 30,
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Category configuration with icons
  const categoryConfig = {
    Medication: { icon: Pill, color: 'blue', bgColor: 'bg-blue-500', label: language === 'ar' ? 'الدواء' : 'Medication' },
    Appointment: { icon: Calendar, color: 'purple', bgColor: 'bg-purple-500', label: language === 'ar' ? 'موعد' : 'Appointment' },
    Monitoring: { icon: Activity, color: 'cyan', bgColor: 'bg-cyan-500', label: language === 'ar' ? 'مراقبة' : 'Monitoring' },
    Nutrition: { icon: Utensils, color: 'green', bgColor: 'bg-green-500', label: language === 'ar' ? 'تغذية' : 'Nutrition' },
    Exercise: { icon: TrendingUp, color: 'orange', bgColor: 'bg-orange-500', label: language === 'ar' ? 'تمرين' : 'Exercise' },
    'Personal Care': { icon: Heart, color: 'pink', bgColor: 'bg-pink-500', label: language === 'ar' ? 'العناية الشخصية' : 'Personal Care' },
    Other: { icon: Clipboard, color: 'gray', bgColor: 'bg-gray-500', label: language === 'ar' ? 'أخرى' : 'Other' }
  };

  // Priority configuration
  const priorityConfig = {
    High: { color: 'danger', bgColor: 'bg-red-500', textColor: 'text-red-600', label: language === 'ar' ? 'عالية' : 'High' },
    Medium: { color: 'warning', bgColor: 'bg-yellow-500', textColor: 'text-yellow-600', label: language === 'ar' ? 'متوسطة' : 'Medium' },
    Low: { color: 'success', bgColor: 'bg-green-500', textColor: 'text-green-600', label: language === 'ar' ? 'منخفضة' : 'Low' }
  };

  // Recurrence options
  const recurrenceOptions = [
    { value: 'none', label: language === 'ar' ? 'مرة واحدة' : 'One-time' },
    { value: 'daily', label: language === 'ar' ? 'يومياً' : 'Daily' },
    { value: 'weekly', label: language === 'ar' ? 'أسبوعياً' : 'Weekly' },
    { value: 'monthly', label: language === 'ar' ? 'شهرياً' : 'Monthly' }
  ];

  // Check if task is overdue
  const isOverdue = (task) => {
    if (task.status === 'Completed') return false;
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date();
  };

  // Check if task is due today
  const isDueToday = (task) => {
    if (!task.due_date) return false;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return today.toDateString() === dueDate.toDateString();
  };

  // Check if task is due soon (within reminder time)
  const isDueSoon = (task) => {
    if (task.status === 'Completed') return false;
    if (!task.due_date) return false;
    const reminderMinutes = task.reminder_before || 30;
    const now = new Date();
    const dueDate = new Date(task.due_date);
    const diff = dueDate - now;
    return diff > 0 && diff <= reminderMinutes * 60 * 1000;
  };

  // Calculate task stats with memoization
  const taskStats = useMemo(() => {
    const stats = {
      total: myCareTasks.length,
      pending: 0,
      completed: 0,
      overdue: 0,
      highPriority: 0,
      dueToday: 0,
      recurring: 0,
      byCategory: {}
    };

    myCareTasks.forEach(task => {
      if (task.status === 'Pending') stats.pending++;
      if (task.status === 'Completed') stats.completed++;
      if (isOverdue(task)) stats.overdue++;
      if (task.priority === 'High' && task.status === 'Pending') stats.highPriority++;
      if (isDueToday(task) && task.status === 'Pending') stats.dueToday++;
      if (task.recurrence && task.recurrence !== 'none') stats.recurring++;

      const cat = task.category || 'Other';
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
    });

    return stats;
  }, [myCareTasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return myCareTasks.filter(task => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        (task.title || '').toLowerCase().includes(searchLower) ||
        (task.description || '').toLowerCase().includes(searchLower) ||
        (task.notes || '').toLowerCase().includes(searchLower);

      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'pending' && task.status === 'Pending') ||
        (filterStatus === 'completed' && task.status === 'Completed') ||
        (filterStatus === 'overdue' && isOverdue(task)) ||
        (filterStatus === 'today' && isDueToday(task) && task.status === 'Pending');

      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    }).sort((a, b) => {
      // Sort by: overdue first, then by priority, then by due date
      if (isOverdue(a) && !isOverdue(b)) return -1;
      if (!isOverdue(a) && isOverdue(b)) return 1;

      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      return 0;
    });
  }, [myCareTasks, searchTerm, filterStatus, filterCategory, filterPriority]);

  // Today's tasks for timeline view
  const todaysTasks = useMemo(() => {
    return myCareTasks
      .filter(task => isDueToday(task) && task.status === 'Pending')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [myCareTasks]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleRowsPerPageChange = (rows) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterCategory('all');
    setFilterPriority('all');
    setCurrentPage(1);
  };

  // Validation
  const validateTask = () => {
    const newErrors = {};

    if (!newTask.title.trim()) {
      newErrors.title = language === 'ar' ? 'عنوان المهمة مطلوب' : 'Task title is required';
    } else if (newTask.title.trim().length < 3) {
      newErrors.title = language === 'ar' ? 'يجب أن يكون العنوان 3 أحرف على الأقل' : 'Title must be at least 3 characters';
    }

    if (!newTask.due_date) {
      newErrors.due_date = language === 'ar' ? 'تاريخ الاستحقاق مطلوب' : 'Due date is required';
    }

    if (newTask.recurrence !== 'none' && !newTask.due_date) {
      newErrors.recurrence = language === 'ar' ? 'التكرار يتطلب تاريخ استحقاق' : 'Recurrence requires a due date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTask = async () => {
    if (!validateTask()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const dueDateTime = newTask.due_time
        ? `${newTask.due_date}T${newTask.due_time}:00`
        : `${newTask.due_date}T09:00:00`;

      const taskData = {
        ...newTask,
        due_date: dueDateTime,
        family_id: familyId,
        patient_id: user?.patientId || '1',
        created_at: new Date().toISOString()
      };

      addCareTask(taskData);

      if (showNotification) {
        showNotification(
          language === 'ar' ? 'تم إضافة المهمة بنجاح' : 'Task added successfully',
          'success'
        );
      }

      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        due_date: '',
        due_time: '',
        category: 'Medication',
        recurrence: 'none',
        reminder_before: 30,
        notes: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding task:', error);
      if (showNotification) {
        showNotification(
          language === 'ar' ? 'فشل في إضافة المهمة' : 'Failed to add task',
          'error'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      completeCareTask(taskId);
      if (showNotification) {
        showNotification(
          language === 'ar' ? 'تم إكمال المهمة' : 'Task completed',
          'success'
        );
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Are you sure you want to delete this task?')) {
      return;
    }

    try {
      deleteCareTask(taskId);
      if (showNotification) {
        showNotification(
          language === 'ar' ? 'تم حذف المهمة' : 'Task deleted',
          'success'
        );
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const viewTaskDetails = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 0) {
      if (days < -1) return language === 'ar' ? `متأخر ${Math.abs(days)} يوم` : `${Math.abs(days)} days overdue`;
      if (hours < -1) return language === 'ar' ? `متأخر ${Math.abs(hours)} ساعة` : `${Math.abs(hours)} hours overdue`;
      return language === 'ar' ? 'متأخر' : 'Overdue';
    }

    if (days > 0) return language === 'ar' ? `بعد ${days} يوم` : `In ${days} days`;
    if (hours > 0) return language === 'ar' ? `بعد ${hours} ساعة` : `In ${hours} hours`;
    if (minutes > 0) return language === 'ar' ? `بعد ${minutes} دقيقة` : `In ${minutes} minutes`;
    return language === 'ar' ? 'الآن' : 'Now';
  };

  // Render task card
  const renderTaskCard = (task) => {
    const CategoryIcon = categoryConfig[task.category]?.icon || Clipboard;
    const taskOverdue = isOverdue(task);
    const taskDueSoon = isDueSoon(task);
    const taskDueToday = isDueToday(task);

    return (
      <div
        key={task.id}
        className={clsx(
          'group relative p-4 rounded-xl border-2 transition-all duration-300',
          task.status === 'Completed'
            ? 'bg-gray-50 border-gray-200 opacity-70'
            : taskOverdue
              ? 'bg-red-50 border-red-300 hover:border-red-400 hover:shadow-lg'
              : taskDueSoon
                ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-400 hover:shadow-lg animate-pulse'
                : taskDueToday
                  ? 'bg-blue-50 border-blue-300 hover:border-blue-400 hover:shadow-lg'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg'
        )}
      >
        {/* Overdue indicator */}
        {taskOverdue && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <AlertTriangle className="w-3 h-3" />
            <span>{language === 'ar' ? 'متأخر' : 'Overdue'}</span>
          </div>
        )}

        {/* Due soon indicator */}
        {taskDueSoon && !taskOverdue && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Timer className="w-3 h-3" />
            <span>{language === 'ar' ? 'قريباً' : 'Due Soon'}</span>
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => task.status === 'Pending' && handleCompleteTask(task.id)}
            disabled={task.status === 'Completed'}
            className={clsx(
              'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
              task.status === 'Completed'
                ? 'bg-green-500 border-green-500 cursor-default'
                : 'border-gray-300 hover:border-green-500 hover:bg-green-50 cursor-pointer'
            )}
          >
            {task.status === 'Completed' && <Check className="w-4 h-4 text-white" />}
          </button>

          {/* Category icon */}
          <div className={clsx(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
            categoryConfig[task.category]?.bgColor || 'bg-gray-500',
            'bg-opacity-10'
          )}>
            <CategoryIcon className={clsx(
              'w-6 h-6',
              `text-${categoryConfig[task.category]?.color || 'gray'}-500`
            )} />
          </div>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={clsx(
                  'font-semibold text-gray-900 leading-tight',
                  task.status === 'Completed' && 'line-through text-gray-500'
                )}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                )}
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => viewTaskDetails(task)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={language === 'ar' ? 'عرض التفاصيل' : 'View details'}
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title={language === 'ar' ? 'حذف' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant={priorityConfig[task.priority]?.color || 'default'} size="sm">
                {priorityConfig[task.priority]?.label || task.priority}
              </Badge>

              <Badge variant="default" size="sm" className="bg-gray-100">
                {categoryConfig[task.category]?.label || task.category}
              </Badge>

              {task.recurrence && task.recurrence !== 'none' && (
                <Badge variant="info" size="sm" className="flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  {recurrenceOptions.find(r => r.value === task.recurrence)?.label}
                </Badge>
              )}

              {task.due_date && (
                <div className={clsx(
                  'flex items-center gap-1 text-sm',
                  taskOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                )}>
                  <Clock className="w-4 h-4" />
                  <span>{formatRelativeTime(task.due_date)}</span>
                  <span className="text-gray-400">•</span>
                  <span>{formatTime(task.due_date)}</span>
                </div>
              )}

              {task.reminder_before && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Bell className="w-3 h-3" />
                  <span>{task.reminder_before}m</span>
                </div>
              )}
            </div>

            {/* Completed info */}
            {task.status === 'Completed' && task.completed_at && (
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <CheckCircle className="w-4 h-4" />
                <span>{language === 'ar' ? 'اكتمل في' : 'Completed'} {formatDate(task.completed_at)}</span>
              </div>
            )}
          </div>

          {/* Complete button for pending tasks */}
          {task.status === 'Pending' && (
            <Button
              variant={taskOverdue ? 'danger' : 'success'}
              size="sm"
              icon={Check}
              onClick={() => handleCompleteTask(task.id)}
              className="flex-shrink-0"
            >
              {language === 'ar' ? 'إكمال' : 'Complete'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render timeline view for today's tasks
  const renderTimelineView = () => (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          {language === 'ar' ? 'مهام اليوم' : "Today's Schedule"}
        </h2>
        <Badge variant="info">{todaysTasks.length} {language === 'ar' ? 'مهام' : 'tasks'}</Badge>
      </div>

      {todaysTasks.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-300 to-gray-200" />

          <div className="space-y-4">
            {todaysTasks.map((task) => {
              const CategoryIcon = categoryConfig[task.category]?.icon || Clipboard;
              const taskDueSoon = isDueSoon(task);

              return (
                <div key={task.id} className="relative flex items-start gap-4 pl-2">
                  {/* Timeline dot */}
                  <div className={clsx(
                    'relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg',
                    taskDueSoon ? 'bg-yellow-500 animate-pulse' : categoryConfig[task.category]?.bgColor || 'bg-gray-500'
                  )}>
                    <CategoryIcon className="w-4 h-4 text-white" />
                  </div>

                  {/* Task card */}
                  <div className={clsx(
                    'flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer',
                    taskDueSoon
                      ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-400'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  )}
                  onClick={() => viewTaskDetails(task)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{formatTime(task.due_date)}</p>
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={priorityConfig[task.priority]?.color || 'default'} size="sm">
                          {task.priority}
                        </Badge>
                        <Button
                          variant="success"
                          size="sm"
                          icon={Check}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteTask(task.id);
                          }}
                        >
                          {language === 'ar' ? 'إكمال' : 'Done'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
          <p className="font-medium">{language === 'ar' ? 'لا توجد مهام لليوم' : 'No tasks scheduled for today'}</p>
          <p className="text-sm">{language === 'ar' ? 'أضف مهمة جديدة للبدء' : 'Add a new task to get started'}</p>
        </div>
      )}
    </Card>
  );

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
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Clipboard className="w-6 h-6 text-white" />
              </div>
              {t('care_tasks') || (language === 'ar' ? 'مهام الرعاية' : 'Care Tasks')}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'ar' ? 'إدارة أنشطة ومهام الرعاية اليومية' : 'Manage daily care activities and tasks'}
            </p>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddTask(true)}
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            {language === 'ar' ? 'إضافة مهمة' : 'Add Task'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clipboard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-100">{language === 'ar' ? 'الإجمالي' : 'Total'}</p>
              <p className="text-2xl font-bold">{taskStats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-yellow-100">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
              <p className="text-2xl font-bold">{taskStats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-green-100">{language === 'ar' ? 'مكتمل' : 'Completed'}</p>
              <p className="text-2xl font-bold">{taskStats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-rose-500 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-red-100">{language === 'ar' ? 'متأخر' : 'Overdue'}</p>
              <p className="text-2xl font-bold">{taskStats.overdue}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-500 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-purple-100">{language === 'ar' ? 'أولوية عالية' : 'High Priority'}</p>
              <p className="text-2xl font-bold">{taskStats.highPriority}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-blue-500 border-0 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-cyan-100">{language === 'ar' ? 'اليوم' : 'Due Today'}</p>
              <p className="text-2xl font-bold">{taskStats.dueToday}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* View Toggle & Timeline */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={viewMode === 'list' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
        >
          {language === 'ar' ? 'القائمة' : 'List View'}
        </Button>
        <Button
          variant={viewMode === 'timeline' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setViewMode('timeline')}
        >
          {language === 'ar' ? 'الجدول الزمني' : 'Timeline'}
        </Button>
      </div>

      {viewMode === 'timeline' && renderTimelineView()}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={language === 'ar' ? 'البحث في المهام...' : 'Search tasks...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              icon={Search}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status filters */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {[
                { value: 'all', label: language === 'ar' ? 'الكل' : 'All' },
                { value: 'pending', label: language === 'ar' ? 'قيد الانتظار' : 'Pending' },
                { value: 'completed', label: language === 'ar' ? 'مكتمل' : 'Completed' },
                { value: 'overdue', label: language === 'ar' ? 'متأخر' : 'Overdue', danger: true },
                { value: 'today', label: language === 'ar' ? 'اليوم' : 'Today' }
              ].map(status => (
                <button
                  key={status.value}
                  onClick={() => {
                    setFilterStatus(status.value);
                    setCurrentPage(1);
                  }}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    filterStatus === status.value
                      ? status.danger
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="sm"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              {language === 'ar' ? 'تصفية' : 'Filters'}
            </Button>

            {(filterCategory !== 'all' || filterPriority !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={resetFilters}
              >
                {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </Button>
            )}
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <Select
              label={language === 'ar' ? 'الفئة' : 'Category'}
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: language === 'ar' ? 'جميع الفئات' : 'All Categories' },
                ...Object.entries(categoryConfig).map(([key, val]) => ({
                  value: key,
                  label: val.label
                }))
              ]}
            />

            <Select
              label={language === 'ar' ? 'الأولوية' : 'Priority'}
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: language === 'ar' ? 'جميع الأولويات' : 'All Priorities' },
                ...Object.entries(priorityConfig).map(([key, val]) => ({
                  value: key,
                  label: val.label
                }))
              ]}
            />
          </div>
        )}
      </Card>

      {/* Tasks List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {language === 'ar' ? 'قائمة المهام' : 'Task List'}
          </h2>
          <Badge variant="default">{filteredTasks.length} {language === 'ar' ? 'مهمة' : 'tasks'}</Badge>
        </div>

        {filteredTasks.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginatedTasks.map(renderTaskCard)}
            </div>

            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTasks.length}
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
              <Clipboard className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-medium">{language === 'ar' ? 'لا توجد مهام' : 'No tasks found'}</p>
            <p className="text-sm mt-1">{language === 'ar' ? 'أضف مهمتك الأولى للبدء' : 'Add your first task to get started'}</p>
            <Button
              variant="primary"
              icon={Plus}
              className="mt-4"
              onClick={() => setShowAddTask(true)}
            >
              {language === 'ar' ? 'إضافة مهمة' : 'Add Care Task'}
            </Button>
          </div>
        )}
      </Card>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddTask}
        onClose={() => {
          setShowAddTask(false);
          setErrors({});
        }}
        title={language === 'ar' ? 'إضافة مهمة رعاية' : 'Add Care Task'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label={language === 'ar' ? 'عنوان المهمة' : 'Task Title'}
            placeholder={language === 'ar' ? 'مثال: إعطاء الدواء الصباحي' : 'e.g., Give morning medication'}
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            error={errors.title}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'الوصف' : 'Description'}
            </label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder={language === 'ar' ? 'وصف المهمة...' : 'Describe the task...'}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={language === 'ar' ? 'الفئة' : 'Category'}
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              options={Object.entries(categoryConfig).map(([key, val]) => ({
                value: key,
                label: val.label
              }))}
            />

            <Select
              label={language === 'ar' ? 'الأولوية' : 'Priority'}
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              options={Object.entries(priorityConfig).map(([key, val]) => ({
                value: key,
                label: val.label
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label={language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              error={errors.due_date}
              required
            />

            <Input
              type="time"
              label={language === 'ar' ? 'وقت الاستحقاق' : 'Due Time'}
              value={newTask.due_time}
              onChange={(e) => setNewTask({ ...newTask, due_time: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={language === 'ar' ? 'التكرار' : 'Recurrence'}
              value={newTask.recurrence}
              onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value })}
              options={recurrenceOptions}
              error={errors.recurrence}
            />

            <Select
              label={language === 'ar' ? 'التذكير قبل' : 'Reminder Before'}
              value={newTask.reminder_before}
              onChange={(e) => setNewTask({ ...newTask, reminder_before: parseInt(e.target.value) })}
              options={[
                { value: 15, label: language === 'ar' ? '15 دقيقة' : '15 minutes' },
                { value: 30, label: language === 'ar' ? '30 دقيقة' : '30 minutes' },
                { value: 60, label: language === 'ar' ? '1 ساعة' : '1 hour' },
                { value: 120, label: language === 'ar' ? '2 ساعة' : '2 hours' },
                { value: 1440, label: language === 'ar' ? '1 يوم' : '1 day' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
            </label>
            <textarea
              className="w-full h-20 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder={language === 'ar' ? 'ملاحظات...' : 'Notes...'}
              value={newTask.notes}
              onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddTask(false);
                setErrors({});
              }}
              className="flex-1"
              disabled={isSubmitting}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleAddTask}
              className="flex-1"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting
                ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...')
                : (language === 'ar' ? 'إضافة المهمة' : 'Add Task')
              }
            </Button>
          </div>
        </div>
      </Modal>

      {/* Task Details Modal */}
      <Modal
        isOpen={showTaskDetails}
        onClose={() => {
          setShowTaskDetails(false);
          setSelectedTask(null);
        }}
        title={language === 'ar' ? 'تفاصيل المهمة' : 'Task Details'}
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className={clsx(
                'w-14 h-14 rounded-xl flex items-center justify-center',
                categoryConfig[selectedTask.category]?.bgColor || 'bg-gray-500',
                'bg-opacity-10'
              )}>
                {(() => {
                  const CategoryIcon = categoryConfig[selectedTask.category]?.icon || Clipboard;
                  return <CategoryIcon className={clsx(
                    'w-7 h-7',
                    `text-${categoryConfig[selectedTask.category]?.color || 'gray'}-500`
                  )} />;
                })()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{selectedTask.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={priorityConfig[selectedTask.priority]?.color || 'default'}>
                    {priorityConfig[selectedTask.priority]?.label || selectedTask.priority}
                  </Badge>
                  <Badge variant={selectedTask.status === 'Completed' ? 'success' : 'warning'}>
                    {selectedTask.status === 'Completed'
                      ? (language === 'ar' ? 'مكتمل' : 'Completed')
                      : (language === 'ar' ? 'قيد الانتظار' : 'Pending')
                    }
                  </Badge>
                  {isOverdue(selectedTask) && (
                    <Badge variant="danger">{language === 'ar' ? 'متأخر' : 'Overdue'}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedTask.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </h4>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{selectedTask.description}</p>
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">{language === 'ar' ? 'الفئة' : 'Category'}</p>
                <p className="font-semibold text-gray-900">
                  {categoryConfig[selectedTask.category]?.label || selectedTask.category}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">{language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</p>
                <p className="font-semibold text-gray-900">
                  {selectedTask.due_date ? formatDate(selectedTask.due_date) : '-'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">{language === 'ar' ? 'الوقت' : 'Time'}</p>
                <p className="font-semibold text-gray-900">
                  {selectedTask.due_date ? formatTime(selectedTask.due_date) : '-'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">{language === 'ar' ? 'التكرار' : 'Recurrence'}</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  {selectedTask.recurrence && selectedTask.recurrence !== 'none' && (
                    <Repeat className="w-4 h-4 text-blue-500" />
                  )}
                  {recurrenceOptions.find(r => r.value === selectedTask.recurrence)?.label || (language === 'ar' ? 'مرة واحدة' : 'One-time')}
                </p>
              </div>
            </div>

            {/* Notes */}
            {selectedTask.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  {language === 'ar' ? 'ملاحظات' : 'Notes'}
                </h4>
                <p className="text-gray-600 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  {selectedTask.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {selectedTask.status === 'Pending' && (
                <Button
                  variant="success"
                  icon={Check}
                  onClick={() => {
                    handleCompleteTask(selectedTask.id);
                    setShowTaskDetails(false);
                  }}
                  className="flex-1"
                >
                  {language === 'ar' ? 'إكمال المهمة' : 'Complete Task'}
                </Button>
              )}
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => {
                  handleDeleteTask(selectedTask.id);
                  setShowTaskDetails(false);
                }}
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowTaskDetails(false)}
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FamilyCareTasks;

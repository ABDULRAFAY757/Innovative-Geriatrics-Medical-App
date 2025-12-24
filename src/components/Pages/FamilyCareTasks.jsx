import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';
import {
  Clipboard,
  Plus,
  Check,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Search,
  Calendar
} from 'lucide-react';
import { Card, Badge, Button, Input, Modal } from '../shared/UIComponents';
import { clsx } from 'clsx';

const FamilyCareTasks = ({ user }) => {
  const { t, isRTL, language } = useLanguage();
  const { careTasks, addCareTask, completeCareTask, deleteCareTask } = useApp();

  const familyId = user?.id || 'f1';
  const myCareTasks = careTasks.filter(task => task.family_id === familyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    due_date: '',
    category: 'Medication'
  });

  const filteredTasks = myCareTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'pending' && task.status === 'Pending') ||
      (filterStatus === 'completed' && task.status === 'Completed');
    return matchesSearch && matchesFilter;
  });

  const pendingCount = myCareTasks.filter(t => t.status === 'Pending').length;
  const completedCount = myCareTasks.filter(t => t.status === 'Completed').length;
  const highPriorityCount = myCareTasks.filter(t => t.priority === 'High' && t.status === 'Pending').length;

  const handleAddTask = () => {
    if (!newTask.title) {
      return;
    }

    const taskData = {
      ...newTask,
      family_id: familyId,
      patient_id: user?.patientId || '1'
    };

    addCareTask(taskData);
    setShowAddTask(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'Medium',
      due_date: '',
      category: 'Medication'
    });
  };

  const handleCompleteTask = (taskId) => {
    completeCareTask(taskId);
  };

  const handleDeleteTask = (taskId) => {
    deleteCareTask(taskId);
  };

  const priorityColors = {
    High: 'danger',
    Medium: 'warning',
    Low: 'success',
  };

  const statusColors = {
    Pending: 'warning',
    Completed: 'success',
  };

  const categoryIcons = {
    Medication: '💊',
    Appointment: '📅',
    Exercise: '🏃',
    Nutrition: '🥗',
    'Personal Care': '🧴',
    Other: '📝'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={clsx('p-6 max-w-7xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('care_tasks')}</h1>
        <p className="text-gray-600 mt-1">Manage daily care activities and tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clipboard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{myCareTasks.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{highPriorityCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </Button>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddTask(true)}
          >
            Add Task
          </Button>
        </div>
      </Card>

      {/* Tasks List */}
      <Card title="Care Tasks">
        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={clsx(
                  'flex items-start gap-4 p-4 rounded-lg border-2 transition-all',
                  task.status === 'Completed'
                    ? 'bg-gray-50 border-gray-200 opacity-75'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => task.status === 'Pending' && handleCompleteTask(task.id)}
                  className={clsx(
                    'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    task.status === 'Completed'
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-500'
                  )}
                >
                  {task.status === 'Completed' && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Task Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-2xl">{categoryIcons[task.category] || '📝'}</span>
                    <div className="flex-1">
                      <h3 className={clsx(
                        'font-semibold text-gray-900',
                        task.status === 'Completed' && 'line-through text-gray-500'
                      )}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant={priorityColors[task.priority]} size="sm">
                      {task.priority}
                    </Badge>
                    <Badge variant="default" size="sm">
                      {task.category}
                    </Badge>
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                    )}
                    {task.status === 'Completed' && task.completed_at && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed {formatDate(task.completed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {task.status === 'Pending' && (
                    <Button
                      variant="success"
                      size="sm"
                      icon={Check}
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Clipboard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No care tasks found</p>
            <p className="text-sm">Add your first task to get started</p>
            <Button
              variant="primary"
              icon={Plus}
              className="mt-4"
              onClick={() => setShowAddTask(true)}
            >
              Add Care Task
            </Button>
          </div>
        )}
      </Card>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        title="Add Care Task"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g., Give morning medication"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
              placeholder="Describe the task..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white"
                style={{lineHeight: '2.75rem'}}
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              >
                <option value="Medication">💊 Medication</option>
                <option value="Appointment">📅 Appointment</option>
                <option value="Exercise">🏃 Exercise</option>
                <option value="Nutrition">🥗 Nutrition</option>
                <option value="Personal Care">🧴 Personal Care</option>
                <option value="Other">📝 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                className="w-full h-11 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base bg-white"
                style={{lineHeight: '2.75rem'}}
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🔴 High</option>
              </select>
            </div>
          </div>

          <Input
            type="date"
            label="Due Date"
            value={newTask.due_date}
            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddTask(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="flex-1" disabled={!newTask.title}>
              Add Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FamilyCareTasks;

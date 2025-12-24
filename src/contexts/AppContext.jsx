import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  patients as initialPatients,
  doctors as initialDoctors,
  appointments as initialAppointments,
  careTasks as initialCareTasks,
  healthMetrics as initialHealthMetrics,
  medicationReminders as initialMedicationReminders,
  equipmentRequests as initialEquipmentRequests,
  donations as initialDonations,
  fallAlerts as initialFallAlerts,
  transactions as initialTransactions,
  donors as initialDonors,
  familyMembers,
} from '../data/mockData';

const AppContext = createContext();

/**
 * Safe localStorage helper with error handling and quota management
 */
const safeLocalStorage = {
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Clearing old data...');
        // Clear oldest data or implement LRU cache
        try {
          localStorage.clear();
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          console.error('Failed to save even after clearing:', e);
          return false;
        }
      } else {
        console.error(`Error saving to localStorage key "${key}":`, error);
        return false;
      }
    }
  }
};

/**
 * Global state management provider for the entire application
 * Provides dynamic, interactive data management
 */
export const AppProvider = ({ children }) => {
  // Initialize state from localStorage or use default data with error handling
  const [patients, setPatients] = useState(() => {
    return safeLocalStorage.getItem('app_patients', initialPatients);
  });

  const [appointments, setAppointments] = useState(() => {
    return safeLocalStorage.getItem('app_appointments', initialAppointments);
  });

  const [careTasks, setCareTasks] = useState(() => {
    return safeLocalStorage.getItem('app_careTasks', initialCareTasks);
  });

  const [medicationReminders, setMedicationReminders] = useState(() => {
    return safeLocalStorage.getItem('app_medications', initialMedicationReminders);
  });

  const [equipmentRequests, setEquipmentRequests] = useState(() => {
    return safeLocalStorage.getItem('app_equipment', initialEquipmentRequests);
  });

  const [donations, setDonations] = useState(() => {
    return safeLocalStorage.getItem('app_donations', initialDonations);
  });

  const [fallAlerts, setFallAlerts] = useState(() => {
    return safeLocalStorage.getItem('app_fallAlerts', initialFallAlerts);
  });

  const [transactions, setTransactions] = useState(() => {
    return safeLocalStorage.getItem('app_transactions', initialTransactions);
  });

  const [healthMetrics, setHealthMetrics] = useState(() => {
    return safeLocalStorage.getItem('app_healthMetrics', initialHealthMetrics);
  });

  const [notifications, setNotifications] = useState([]);

  // Static data (doesn't change during runtime)
  const [doctors] = useState(initialDoctors);
  const [donors] = useState(initialDonors);

  // Persist data to localStorage whenever it changes with error handling
  useEffect(() => {
    safeLocalStorage.setItem('app_patients', patients);
  }, [patients]);

  useEffect(() => {
    safeLocalStorage.setItem('app_appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    safeLocalStorage.setItem('app_careTasks', careTasks);
  }, [careTasks]);

  useEffect(() => {
    safeLocalStorage.setItem('app_medications', medicationReminders);
  }, [medicationReminders]);

  useEffect(() => {
    safeLocalStorage.setItem('app_equipment', equipmentRequests);
  }, [equipmentRequests]);

  useEffect(() => {
    safeLocalStorage.setItem('app_donations', donations);
  }, [donations]);

  useEffect(() => {
    safeLocalStorage.setItem('app_fallAlerts', fallAlerts);
  }, [fallAlerts]);

  useEffect(() => {
    safeLocalStorage.setItem('app_transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    safeLocalStorage.setItem('app_healthMetrics', healthMetrics);
  }, [healthMetrics]);

  // ========== MEDICATION ACTIONS ==========

  const takeMedication = (medicationId) => {
    setMedicationReminders(prev =>
      prev.map(med =>
        med.id === medicationId
          ? {
              ...med,
              last_taken: new Date().toISOString(),
              adherence_rate: Math.min(100, med.adherence_rate + 2),
            }
          : med
      )
    );
    addNotification('success', 'Medication taken successfully!');
  };

  const addMedication = (patientId, medicationData) => {
    const newMed = {
      id: `med_${Date.now()}`,
      patient_id: patientId,
      ...medicationData,
      adherence_rate: 100,
      status: 'Active',
      last_taken: new Date().toISOString(),
    };
    setMedicationReminders(prev => [...prev, newMed]);
    addNotification('success', 'Medication added successfully!');
    return newMed;
  };

  // ========== APPOINTMENT ACTIONS ==========

  const bookAppointment = (appointmentData) => {
    const newAppointment = {
      id: `apt_${Date.now()}`,
      ...appointmentData,
      status: 'Scheduled',
      created_at: new Date().toISOString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    addNotification('success', 'Appointment booked successfully!');
    return newAppointment;
  };

  const cancelAppointment = (appointmentId) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, status: 'Cancelled' }
          : apt
      )
    );
    addNotification('info', 'Appointment cancelled');
  };

  const completeAppointment = (appointmentId) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, status: 'Completed' }
          : apt
      )
    );
    addNotification('success', 'Appointment completed!');
  };

  // ========== CARE TASK ACTIONS ==========

  const addCareTask = (taskData) => {
    const newTask = {
      id: `task_${Date.now()}`,
      ...taskData,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    setCareTasks(prev => [...prev, newTask]);
    addNotification('success', 'Care task added!');
    return newTask;
  };

  const completeCareTask = (taskId) => {
    setCareTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: 'Completed', completed_at: new Date().toISOString() }
          : task
      )
    );
    addNotification('success', 'Task completed!');
  };

  const deleteCareTask = (taskId) => {
    setCareTasks(prev => prev.filter(task => task.id !== taskId));
    addNotification('info', 'Task deleted');
  };

  // ========== EQUIPMENT REQUEST ACTIONS ==========

  const createEquipmentRequest = (requestData) => {
    const newRequest = {
      id: `req_${Date.now()}`,
      ...requestData,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    setEquipmentRequests(prev => [...prev, newRequest]);
    addNotification('success', 'Equipment request created!');
    return newRequest;
  };

  const updateEquipmentRequest = (requestId, updates) => {
    setEquipmentRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, ...updates } : req
      )
    );
    addNotification('info', 'Request updated');
  };

  // ========== DONATION ACTIONS ==========

  const makeDonation = (donationData) => {
    const newDonation = {
      id: `don_${Date.now()}`,
      ...donationData,
      status: 'Completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      receipt_number: `RCP${Date.now()}`,
    };

    setDonations(prev => [...prev, newDonation]);

    // Update equipment request status
    if (donationData.equipment_request_id) {
      setEquipmentRequests(prev =>
        prev.map(req =>
          req.id === donationData.equipment_request_id
            ? { ...req, status: 'Fulfilled' }
            : req
        )
      );
    }

    addNotification('success', 'Thank you for your donation!');
    return newDonation;
  };

  // ========== CLINICAL ACTIONS ==========

  const addClinicalNote = (noteData) => {
    const newTransaction = {
      id: `txn_${Date.now()}`,
      ...noteData,
      created_at: new Date().toISOString(),
      status: 'Completed',
    };
    setTransactions(prev => [...prev, newTransaction]);
    addNotification('success', 'Clinical note added!');
    return newTransaction;
  };

  const addPrescription = (prescriptionData) => {
    // Add to transactions
    const newTransaction = {
      id: `txn_${Date.now()}`,
      ...prescriptionData,
      transaction_type: 'Prescription',
      created_at: new Date().toISOString(),
      status: 'Active',
    };
    setTransactions(prev => [...prev, newTransaction]);

    // Also add to medication reminders if medications are specified
    if (prescriptionData.medications) {
      prescriptionData.medications.forEach(med => {
        addMedication(prescriptionData.patient_id, {
          medication_name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          time: '08:00',
        });
      });
    }

    addNotification('success', 'Prescription created!');
    return newTransaction;
  };

  // ========== HEALTH METRICS ACTIONS ==========

  const addHealthMetric = (metricData) => {
    const newMetric = {
      id: `hm_${Date.now()}`,
      ...metricData,
      recorded_at: new Date().toISOString(),
    };
    setHealthMetrics(prev => [...prev, newMetric]);
    addNotification('success', 'Health metric recorded!');
    return newMetric;
  };

  // ========== FALL ALERT ACTIONS ==========

  const createFallAlert = (alertData) => {
    const newAlert = {
      id: `alert_${Date.now()}`,
      ...alertData,
      detected_at: new Date().toISOString(),
      status: 'Active',
    };
    setFallAlerts(prev => [...prev, newAlert]);
    addNotification('error', `FALL ALERT: ${alertData.patient_name}`);
    return newAlert;
  };

  const resolveFallAlert = (alertId, actionTaken) => {
    setFallAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'Resolved',
              resolved_at: new Date().toISOString(),
              action_taken: actionTaken,
            }
          : alert
      )
    );
    addNotification('success', 'Fall alert resolved');
  };

  // ========== NOTIFICATION SYSTEM ==========

  const addNotification = (type, message, title = '') => {
    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notification, ...prev]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const markNotificationRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  // ========== RESET DATA ==========

  const resetAllData = () => {
    setPatients(initialPatients);
    setAppointments(initialAppointments);
    setCareTasks(initialCareTasks);
    setMedicationReminders(initialMedicationReminders);
    setEquipmentRequests(initialEquipmentRequests);
    setDonations(initialDonations);
    setFallAlerts(initialFallAlerts);
    setTransactions(initialTransactions);
    setHealthMetrics(initialHealthMetrics);
    setNotifications([]);

    // Clear localStorage
    localStorage.removeItem('app_patients');
    localStorage.removeItem('app_appointments');
    localStorage.removeItem('app_careTasks');
    localStorage.removeItem('app_medications');
    localStorage.removeItem('app_equipment');
    localStorage.removeItem('app_donations');
    localStorage.removeItem('app_fallAlerts');
    localStorage.removeItem('app_transactions');
    localStorage.removeItem('app_healthMetrics');

    addNotification('info', 'All data has been reset to defaults');
  };

  const value = {
    // State
    patients,
    doctors,
    donors,
    appointments,
    careTasks,
    medicationReminders,
    equipmentRequests,
    donations,
    fallAlerts,
    transactions,
    healthMetrics,
    notifications,
    familyMembers,

    // Medication actions
    takeMedication,
    addMedication,

    // Appointment actions
    bookAppointment,
    cancelAppointment,
    completeAppointment,

    // Care task actions
    addCareTask,
    completeCareTask,
    deleteCareTask,

    // Equipment actions
    createEquipmentRequest,
    updateEquipmentRequest,

    // Donation actions
    makeDonation,

    // Clinical actions
    addClinicalNote,
    addPrescription,

    // Health metrics actions
    addHealthMetric,

    // Fall alert actions
    createFallAlert,
    resolveFallAlert,

    // Notification actions
    addNotification,
    removeNotification,
    markNotificationRead,

    // Utility
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Custom hook to use the app context
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;

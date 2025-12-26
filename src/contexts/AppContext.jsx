import { createContext, useContext, useState, useEffect } from 'react';
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
import {
  webhookService,
  WEBHOOK_EVENTS,
  dispatchFallAlert,
  dispatchAppointmentEvent,
  dispatchMedicationEvent,
  dispatchHealthAlert,
  dispatchEquipmentEvent,
  dispatchDonationEvent,
  dispatchCareTaskEvent,
} from '../services/WebhookService';
import { sanitizeObject, rateLimiters } from '../utils/security';
import { validateForm, validationSchemas } from '../utils/validation';

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

  // Reset taken_today at midnight or when date changes
  useEffect(() => {
    const checkAndResetDaily = () => {
      const today = new Date().toDateString();
      const lastReset = safeLocalStorage.getItem('app_lastMedReset', '');

      if (lastReset !== today) {
        // Reset taken_today for all medications
        setMedicationReminders(prev =>
          prev.map(med => ({ ...med, taken_today: 0 }))
        );
        safeLocalStorage.setItem('app_lastMedReset', today);
      }
    };

    checkAndResetDaily();
    // Check every minute for date change
    const interval = setInterval(checkAndResetDaily, 60000);
    return () => clearInterval(interval);
  }, []);

  const takeMedication = (medicationId) => {
    let doseTaken = false;
    let medName = '';

    setMedicationReminders(prev =>
      prev.map(med => {
        if (med.id !== medicationId) return med;

        // Parse frequency to get max doses per day
        const frequency = med.frequency?.toLowerCase() || '';
        let dosesPerDay = 1;
        if (frequency.includes('twice') || frequency.includes('مرتين')) dosesPerDay = 2;
        else if (frequency.includes('three') || frequency.includes('ثلاث')) dosesPerDay = 3;
        else if (frequency.includes('four') || frequency.includes('أربع')) dosesPerDay = 4;

        const currentTaken = med.taken_today || 0;
        medName = med.medication_name;

        // Don't allow taking more than daily doses
        if (currentTaken >= dosesPerDay) {
          return med;
        }

        doseTaken = true;
        const newTaken = currentTaken + 1;

        return {
          ...med,
          last_taken: new Date().toISOString(),
          taken_today: newTaken,
          adherence_rate: Math.min(100, med.adherence_rate + 2),
        };
      })
    );

    if (doseTaken) {
      addNotification('success', `${medName} dose recorded!`);
      // Dispatch webhook for medication taken
      dispatchMedicationEvent(WEBHOOK_EVENTS.MEDICATION_TAKEN, {
        medication_id: medicationId,
        medication_name: medName,
        taken_at: new Date().toISOString(),
      });
    } else {
      addNotification('info', `All ${medName} doses completed for today`);
    }
  };

  const addMedication = (patientId, medicationData) => {
    // Rate limiting
    if (!rateLimiters.medication.canProceed(patientId)) {
      addNotification('error', 'Too many medication requests. Please wait a moment.');
      return null;
    }

    // Validate medication data
    const errors = validateForm(medicationData, validationSchemas.medication);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      addNotification('error', firstError);
      return null;
    }

    // Sanitize user input to prevent XSS
    const sanitizedData = sanitizeObject(medicationData);

    const newMed = {
      id: `med_${Date.now()}`,
      patient_id: patientId,
      ...sanitizedData,
      adherence_rate: 100,
      status: 'Active',
      last_taken: new Date().toISOString(),
    };
    setMedicationReminders(prev => [...prev, newMed]);
    addNotification('success', 'Medication added successfully!');
    // Dispatch webhook for medication added
    dispatchMedicationEvent(WEBHOOK_EVENTS.MEDICATION_ADDED, newMed);
    return newMed;
  };

  // ========== APPOINTMENT ACTIONS ==========

  const bookAppointment = (appointmentData) => {
    // Rate limiting
    if (!rateLimiters.appointment.canProceed(appointmentData.patient_id)) {
      addNotification('error', 'Too many appointment requests. Please wait a moment.');
      return null;
    }

    // Validate appointment data
    const errors = validateForm(appointmentData, validationSchemas.appointment);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      addNotification('error', firstError);
      return null;
    }

    // Sanitize user input to prevent XSS
    const sanitizedData = sanitizeObject(appointmentData);

    const newAppointment = {
      id: `apt_${Date.now()}`,
      ...sanitizedData,
      status: 'Scheduled',
      created_at: new Date().toISOString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    addNotification('success', 'Appointment booked successfully!');
    // Dispatch webhook for appointment booked
    dispatchAppointmentEvent(WEBHOOK_EVENTS.APPOINTMENT_BOOKED, newAppointment);
    return newAppointment;
  };

  const cancelAppointment = (appointmentId) => {
    let cancelledAppointment = null;
    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === appointmentId) {
          cancelledAppointment = { ...apt, status: 'Cancelled' };
          return cancelledAppointment;
        }
        return apt;
      })
    );
    addNotification('info', 'Appointment cancelled');
    // Dispatch webhook for appointment cancelled
    if (cancelledAppointment) {
      dispatchAppointmentEvent(WEBHOOK_EVENTS.APPOINTMENT_CANCELLED, cancelledAppointment);
    }
  };

  const completeAppointment = (appointmentId) => {
    let completedAppointment = null;
    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id === appointmentId) {
          completedAppointment = { ...apt, status: 'Completed' };
          return completedAppointment;
        }
        return apt;
      })
    );
    addNotification('success', 'Appointment completed!');
    // Dispatch webhook for appointment completed
    if (completedAppointment) {
      dispatchAppointmentEvent(WEBHOOK_EVENTS.APPOINTMENT_COMPLETED, completedAppointment);
    }
  };

  // ========== CARE TASK ACTIONS ==========

  const addCareTask = (taskData) => {
    // Rate limiting
    if (!rateLimiters.careTask.canProceed(taskData.patient_id)) {
      addNotification('error', 'Too many task requests. Please wait a moment.');
      return null;
    }

    // Validate care task data
    const errors = validateForm(taskData, validationSchemas.careTask);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      addNotification('error', firstError);
      return null;
    }

    // Sanitize user input to prevent XSS
    const sanitizedData = sanitizeObject(taskData);

    const newTask = {
      id: `task_${Date.now()}`,
      ...sanitizedData,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    setCareTasks(prev => [...prev, newTask]);
    addNotification('success', 'Care task added!');
    // Dispatch webhook for care task created
    dispatchCareTaskEvent(WEBHOOK_EVENTS.CARE_TASK_CREATED, newTask);
    return newTask;
  };

  const completeCareTask = (taskId) => {
    let completedTask = null;
    setCareTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          completedTask = { ...task, status: 'Completed', completed_at: new Date().toISOString() };
          return completedTask;
        }
        return task;
      })
    );
    addNotification('success', 'Task completed!');
    // Dispatch webhook for care task completed
    if (completedTask) {
      dispatchCareTaskEvent(WEBHOOK_EVENTS.CARE_TASK_COMPLETED, completedTask);
    }
  };

  const deleteCareTask = (taskId) => {
    setCareTasks(prev => prev.filter(task => task.id !== taskId));
    addNotification('info', 'Task deleted');
  };

  // ========== EQUIPMENT REQUEST ACTIONS ==========

  const createEquipmentRequest = (requestData) => {
    // Rate limiting
    if (!rateLimiters.equipmentRequest.canProceed(requestData.patient_id)) {
      addNotification('error', 'Too many equipment requests. Please wait a moment.');
      return null;
    }

    // Validate equipment request data
    const errors = validateForm(requestData, validationSchemas.equipmentRequest);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      addNotification('error', firstError);
      return null;
    }

    // Sanitize user input to prevent XSS
    const sanitizedData = sanitizeObject(requestData);

    const newRequest = {
      id: `req_${Date.now()}`,
      ...sanitizedData,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    setEquipmentRequests(prev => [...prev, newRequest]);
    addNotification('success', 'Equipment request created!');
    // Dispatch webhook for equipment requested
    dispatchEquipmentEvent(WEBHOOK_EVENTS.EQUIPMENT_REQUESTED, newRequest);
    return newRequest;
  };

  const updateEquipmentRequest = (requestId, updates) => {
    let updatedRequest = null;
    setEquipmentRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          updatedRequest = { ...req, ...updates };
          return updatedRequest;
        }
        return req;
      })
    );
    addNotification('info', 'Request updated');
    // Dispatch webhook based on status update
    if (updatedRequest) {
      if (updates.status === 'Approved') {
        dispatchEquipmentEvent(WEBHOOK_EVENTS.EQUIPMENT_APPROVED, updatedRequest);
      } else if (updates.status === 'Fulfilled') {
        dispatchEquipmentEvent(WEBHOOK_EVENTS.EQUIPMENT_FULFILLED, updatedRequest);
      }
    }
  };

  // ========== DONATION ACTIONS ==========

  const makeDonation = (donationData) => {
    // Validate donation doesn't exceed remaining amount
    if (donationData.equipment_request_id) {
      const request = equipmentRequests.find(r => r.id === donationData.equipment_request_id);
      if (!request) {
        addNotification('error', 'Equipment request not found!');
        return null;
      }

      const existingDonations = donations.filter(d => d.equipment_request_id === donationData.equipment_request_id);
      const totalDonated = existingDonations.reduce((sum, d) => sum + d.amount, 0);
      const remainingAmount = (request.estimated_cost || 0) - totalDonated;

      if (donationData.amount > remainingAmount) {
        addNotification('error', `Donation amount (${donationData.amount} SAR) exceeds remaining amount (${remainingAmount} SAR)!`);
        return null;
      }
    }

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
      const existingDonations = donations.filter(d => d.equipment_request_id === donationData.equipment_request_id);
      const totalDonated = existingDonations.reduce((sum, d) => sum + d.amount, 0) + donationData.amount;
      const request = equipmentRequests.find(r => r.id === donationData.equipment_request_id);

      setEquipmentRequests(prev =>
        prev.map(req =>
          req.id === donationData.equipment_request_id
            ? { ...req, status: totalDonated >= (req.estimated_cost || 0) ? 'Fulfilled' : 'In Progress' }
            : req
        )
      );
    }

    addNotification('success', 'Thank you for your donation!');
    // Dispatch webhook for donation received
    dispatchDonationEvent(newDonation);
    return newDonation;
  };

  const makePartialDonation = (donationData) => {
    // Validate donation doesn't exceed remaining amount
    if (donationData.equipment_request_id) {
      const request = equipmentRequests.find(r => r.id === donationData.equipment_request_id);
      if (!request) {
        addNotification('error', 'Equipment request not found!');
        return null;
      }

      const existingDonations = donations.filter(d => d.equipment_request_id === donationData.equipment_request_id);
      const totalDonated = existingDonations.reduce((sum, d) => sum + d.amount, 0);
      const remainingAmount = (request.estimated_cost || 0) - totalDonated;

      if (donationData.amount > remainingAmount) {
        addNotification('error', `Donation amount (${donationData.amount} SAR) exceeds remaining amount (${remainingAmount} SAR)!`);
        return null;
      }
    }

    const newDonation = {
      id: `don_${Date.now()}`,
      ...donationData,
      status: 'Completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      receipt_number: `RCP${Date.now()}`,
      is_partial: true,
    };

    setDonations(prev => [...prev, newDonation]);

    // Check if equipment request is now fully funded
    if (donationData.equipment_request_id) {
      const requestDonations = donations.filter(d => d.equipment_request_id === donationData.equipment_request_id);
      const totalDonated = requestDonations.reduce((sum, d) => sum + d.amount, 0) + donationData.amount;

      setEquipmentRequests(prev =>
        prev.map(req =>
          req.id === donationData.equipment_request_id
            ? {
                ...req,
                status: totalDonated >= (req.estimated_cost || 0) ? 'Fulfilled' : 'In Progress'
              }
            : req
        )
      );
    }

    addNotification('success', `Thank you for your partial donation of ${donationData.amount} SAR!`);
    // Dispatch webhook for donation received
    dispatchDonationEvent(newDonation);
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

  const addHealthMetric = (metricData, silent = false) => {
    const newMetric = {
      id: `hm_${Date.now()}`,
      ...metricData,
      recorded_at: new Date().toISOString(),
    };
    setHealthMetrics(prev => [...prev, newMetric]);
    if (!silent) {
      addNotification('success', 'Health metric recorded!');
    }
    // Dispatch webhook for health metric - check for abnormal values
    webhookService.dispatch(WEBHOOK_EVENTS.HEALTH_METRIC_RECORDED, newMetric);
    if (metricData.status === 'Elevated' || metricData.status === 'Low' || metricData.status === 'Critical') {
      dispatchHealthAlert(newMetric);
    }
    return newMetric;
  };

  const updateHealthMetric = (metricData, silent = false) => {
    let updatedMetric = null;
    setHealthMetrics(prev => {
      // Find if metric of this type already exists for this patient
      const existingIndex = prev.findIndex(
        m => m.type === metricData.type && m.patient_id === metricData.patient_id
      );

      if (existingIndex >= 0) {
        // Update existing metric - completely replace it
        const updated = [...prev];
        updated[existingIndex] = {
          id: updated[existingIndex].id, // Keep original ID
          ...metricData,
          recorded_at: new Date().toISOString(),
        };
        updatedMetric = updated[existingIndex];
        return updated;
      } else {
        // Add new metric if it doesn't exist
        const newMetric = {
          id: metricData.id || `hm_${Date.now()}`,
          ...metricData,
          recorded_at: new Date().toISOString(),
        };
        updatedMetric = newMetric;
        return [...prev, newMetric];
      }
    });

    if (!silent) {
      addNotification('success', 'Health metric updated!');
    }
    // Dispatch webhook for abnormal health metrics
    if (updatedMetric && (metricData.status === 'Elevated' || metricData.status === 'Low' || metricData.status === 'Critical')) {
      dispatchHealthAlert(updatedMetric);
    }
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
    // CRITICAL: Dispatch webhook for fall detection immediately
    dispatchFallAlert(newAlert);
    return newAlert;
  };

  const resolveFallAlert = (alertId, actionTaken) => {
    let resolvedAlert = null;
    setFallAlerts(prev =>
      prev.map(alert => {
        if (alert.id === alertId) {
          resolvedAlert = {
            ...alert,
            status: 'Resolved',
            resolved_at: new Date().toISOString(),
            action_taken: actionTaken,
          };
          return resolvedAlert;
        }
        return alert;
      })
    );
    addNotification('success', 'Fall alert resolved');
    // Dispatch webhook for fall resolved
    if (resolvedAlert) {
      webhookService.dispatch(WEBHOOK_EVENTS.FALL_RESOLVED, resolvedAlert);
    }
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
    makePartialDonation,

    // Clinical actions
    addClinicalNote,
    addPrescription,

    // Health metrics actions
    addHealthMetric,
    updateHealthMetric,

    // Fall alert actions
    createFallAlert,
    resolveFallAlert,

    // Notification actions
    addNotification,
    removeNotification,
    markNotificationRead,

    // Webhook service
    webhookService,
    WEBHOOK_EVENTS,

    // Utility
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Custom hook to use the app context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;

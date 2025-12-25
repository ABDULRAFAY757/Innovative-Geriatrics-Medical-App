/**
 * Webhook Service for Innovative Geriatrics Medical App
 * Handles outgoing webhook notifications for critical events
 */

// Webhook event types
export const WEBHOOK_EVENTS = {
  // Fall Detection Events
  FALL_DETECTED: 'fall.detected',
  FALL_RESOLVED: 'fall.resolved',

  // Appointment Events
  APPOINTMENT_BOOKED: 'appointment.booked',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_COMPLETED: 'appointment.completed',
  APPOINTMENT_REMINDER: 'appointment.reminder',

  // Medication Events
  MEDICATION_TAKEN: 'medication.taken',
  MEDICATION_MISSED: 'medication.missed',
  MEDICATION_ADDED: 'medication.added',
  MEDICATION_LOW_ADHERENCE: 'medication.low_adherence',

  // Health Metrics Events
  HEALTH_METRIC_RECORDED: 'health.metric_recorded',
  HEALTH_METRIC_ABNORMAL: 'health.metric_abnormal',
  VITAL_SIGNS_CRITICAL: 'health.vital_signs_critical',

  // Equipment Events
  EQUIPMENT_REQUESTED: 'equipment.requested',
  EQUIPMENT_APPROVED: 'equipment.approved',
  EQUIPMENT_FULFILLED: 'equipment.fulfilled',

  // Donation Events
  DONATION_RECEIVED: 'donation.received',
  DONATION_COMPLETED: 'donation.completed',

  // Care Task Events
  CARE_TASK_CREATED: 'care_task.created',
  CARE_TASK_COMPLETED: 'care_task.completed',
  CARE_TASK_OVERDUE: 'care_task.overdue',

  // System Events
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  EMERGENCY_ALERT: 'system.emergency_alert',
};

// Webhook priority levels
export const WEBHOOK_PRIORITY = {
  CRITICAL: 'critical',   // Immediate delivery, retry on failure
  HIGH: 'high',           // Fast delivery
  NORMAL: 'normal',       // Standard delivery
  LOW: 'low',             // Batch if possible
};

// Default webhook configuration
const DEFAULT_CONFIG = {
  enabled: true,
  retryAttempts: 3,
  retryDelayMs: 1000,
  timeoutMs: 10000,
  batchSize: 10,
  batchDelayMs: 5000,
};

/**
 * Webhook Service Class
 * Manages webhook subscriptions and event dispatching
 */
class WebhookService {
  constructor() {
    this.subscribers = new Map();
    this.eventQueue = [];
    this.config = { ...DEFAULT_CONFIG };
    this.webhookEndpoints = [];
    this.eventHistory = [];
    this.maxHistorySize = 100;

    // Load saved configuration
    this.loadConfig();
  }

  /**
   * Load webhook configuration from localStorage
   */
  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('webhook_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      }

      const savedEndpoints = localStorage.getItem('webhook_endpoints');
      if (savedEndpoints) {
        this.webhookEndpoints = JSON.parse(savedEndpoints);
      }
    } catch (error) {
      console.error('Error loading webhook config:', error);
    }
  }

  /**
   * Save webhook configuration to localStorage
   */
  saveConfig() {
    try {
      localStorage.setItem('webhook_config', JSON.stringify(this.config));
      localStorage.setItem('webhook_endpoints', JSON.stringify(this.webhookEndpoints));
    } catch (error) {
      console.error('Error saving webhook config:', error);
    }
  }

  /**
   * Register a webhook endpoint
   * @param {Object} endpoint - Webhook endpoint configuration
   */
  registerEndpoint(endpoint) {
    const newEndpoint = {
      id: `webhook_${Date.now()}`,
      url: endpoint.url,
      name: endpoint.name || 'Unnamed Webhook',
      events: endpoint.events || Object.values(WEBHOOK_EVENTS),
      headers: endpoint.headers || {},
      enabled: endpoint.enabled !== false,
      secret: endpoint.secret || null,
      createdAt: new Date().toISOString(),
    };

    this.webhookEndpoints.push(newEndpoint);
    this.saveConfig();

    return newEndpoint;
  }

  /**
   * Remove a webhook endpoint
   * @param {string} endpointId - Endpoint ID to remove
   */
  removeEndpoint(endpointId) {
    this.webhookEndpoints = this.webhookEndpoints.filter(e => e.id !== endpointId);
    this.saveConfig();
  }

  /**
   * Update a webhook endpoint
   * @param {string} endpointId - Endpoint ID to update
   * @param {Object} updates - Updates to apply
   */
  updateEndpoint(endpointId, updates) {
    this.webhookEndpoints = this.webhookEndpoints.map(e =>
      e.id === endpointId ? { ...e, ...updates } : e
    );
    this.saveConfig();
  }

  /**
   * Get all registered endpoints
   */
  getEndpoints() {
    return [...this.webhookEndpoints];
  }

  /**
   * Subscribe to webhook events locally (in-app)
   * @param {string} event - Event type
   * @param {Function} callback - Callback function
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Generate HMAC signature for webhook payload
   * @param {string} payload - JSON payload
   * @param {string} secret - Webhook secret
   */
  async generateSignature(payload, secret) {
    if (!secret) return null;

    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
      );

      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.error('Error generating signature:', error);
      return null;
    }
  }

  /**
   * Dispatch a webhook event
   * @param {string} eventType - Event type from WEBHOOK_EVENTS
   * @param {Object} payload - Event payload data
   * @param {string} priority - Event priority
   */
  async dispatch(eventType, payload, priority = WEBHOOK_PRIORITY.NORMAL) {
    if (!this.config.enabled) {
      console.log('Webhooks disabled, skipping dispatch');
      return;
    }

    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      priority,
      payload,
      timestamp: new Date().toISOString(),
      delivered: false,
      attempts: 0,
    };

    // Add to history
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.pop();
    }

    // Notify local subscribers
    this.notifyLocalSubscribers(eventType, payload);

    // Send to external endpoints
    const relevantEndpoints = this.webhookEndpoints.filter(
      e => e.enabled && e.events.includes(eventType)
    );

    for (const endpoint of relevantEndpoints) {
      await this.sendToEndpoint(endpoint, event);
    }

    return event;
  }

  /**
   * Notify local in-app subscribers
   */
  notifyLocalSubscribers(eventType, payload) {
    const callbacks = this.subscribers.get(eventType) || [];
    callbacks.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error('Error in webhook subscriber:', error);
      }
    });
  }

  /**
   * Send event to a specific endpoint
   */
  async sendToEndpoint(endpoint, event, attempt = 1) {
    const payload = JSON.stringify({
      event: event.type,
      data: event.payload,
      timestamp: event.timestamp,
      eventId: event.id,
    });

    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': event.type,
      'X-Webhook-Timestamp': event.timestamp,
      'X-Webhook-ID': event.id,
      ...endpoint.headers,
    };

    // Add signature if secret is configured
    if (endpoint.secret) {
      const signature = await this.generateSignature(payload, endpoint.secret);
      if (signature) {
        headers['X-Webhook-Signature'] = `sha256=${signature}`;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      event.delivered = true;
      console.log(`Webhook delivered to ${endpoint.name}:`, event.type);

      return true;
    } catch (error) {
      console.error(`Webhook delivery failed to ${endpoint.name}:`, error.message);

      // Retry if attempts remaining
      if (attempt < this.config.retryAttempts) {
        await new Promise(resolve =>
          setTimeout(resolve, this.config.retryDelayMs * attempt)
        );
        return this.sendToEndpoint(endpoint, event, attempt + 1);
      }

      event.error = error.message;
      return false;
    }
  }

  /**
   * Get event history
   */
  getEventHistory() {
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearEventHistory() {
    this.eventHistory = [];
  }

  /**
   * Update service configuration
   */
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Test a webhook endpoint
   */
  async testEndpoint(endpointId) {
    const endpoint = this.webhookEndpoints.find(e => e.id === endpointId);
    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    const testEvent = {
      id: `test_${Date.now()}`,
      type: 'webhook.test',
      priority: WEBHOOK_PRIORITY.NORMAL,
      payload: {
        message: 'This is a test webhook from Innovative Geriatrics Medical App',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendToEndpoint(endpoint, testEvent);
  }
}

// Export singleton instance
export const webhookService = new WebhookService();

// Convenience dispatch functions for common events
export const dispatchFallAlert = (patientData) => {
  return webhookService.dispatch(
    WEBHOOK_EVENTS.FALL_DETECTED,
    {
      patient_id: patientData.patient_id,
      patient_name: patientData.patient_name,
      location: patientData.location,
      severity: patientData.severity,
      detected_at: patientData.detected_at || new Date().toISOString(),
    },
    WEBHOOK_PRIORITY.CRITICAL
  );
};

export const dispatchAppointmentEvent = (eventType, appointmentData) => {
  return webhookService.dispatch(eventType, appointmentData, WEBHOOK_PRIORITY.HIGH);
};

export const dispatchMedicationEvent = (eventType, medicationData) => {
  return webhookService.dispatch(eventType, medicationData, WEBHOOK_PRIORITY.NORMAL);
};

export const dispatchHealthAlert = (metricData) => {
  const priority = metricData.status === 'Critical'
    ? WEBHOOK_PRIORITY.CRITICAL
    : WEBHOOK_PRIORITY.HIGH;

  return webhookService.dispatch(
    WEBHOOK_EVENTS.HEALTH_METRIC_ABNORMAL,
    metricData,
    priority
  );
};

export const dispatchEquipmentEvent = (eventType, requestData) => {
  return webhookService.dispatch(eventType, requestData, WEBHOOK_PRIORITY.NORMAL);
};

export const dispatchDonationEvent = (donationData) => {
  return webhookService.dispatch(
    WEBHOOK_EVENTS.DONATION_RECEIVED,
    donationData,
    WEBHOOK_PRIORITY.NORMAL
  );
};

export const dispatchCareTaskEvent = (eventType, taskData) => {
  return webhookService.dispatch(eventType, taskData, WEBHOOK_PRIORITY.NORMAL);
};

export const dispatchEmergencyAlert = (alertData) => {
  return webhookService.dispatch(
    WEBHOOK_EVENTS.EMERGENCY_ALERT,
    alertData,
    WEBHOOK_PRIORITY.CRITICAL
  );
};

export default webhookService;

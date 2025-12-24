
// Mock data for Innovative Geriatrics Medical App

export const patients = [
  {
    id: "1",
    name: "أحمد محمد", // Ahmed Mohamed
    iqaama: "1234567890",
    p_no: "P001",
    phone: "+966501234567",
    email: "ahmed.mohamed@email.com",
    plan: "Free Plan",
    dateOfBirth: "1945-03-15",
    gender: "Male",
    bloodType: "O+",
    emergencyContact: {
      name: "فاطمة أحمد", // Fatima Ahmed
      phone: "+966507654321",
      relationship: "Daughter"
    },
    medicalConditions: ["Hypertension", "Diabetes Type 2", "Arthritis"],
    allergies: ["Penicillin", "Sulfa drugs"],
    fallRisk: "Medium",
    lastCheckup: "2024-12-01"
  },
  {
    id: "2", 
    name: "فاطمة عبدالله", // Fatima Abdullah
    iqaama: "2345678901",
    p_no: "P002",
    phone: "+966502345678",
    email: "fatima.abdullah@email.com",
    plan: "Professional Plan",
    dateOfBirth: "1948-07-22",
    gender: "Female",
    bloodType: "A+",
    emergencyContact: {
      name: "محمد فاطمة", // Mohamed Fatima
      phone: "+966508765432",
      relationship: "Son"
    },
    medicalConditions: ["Osteoporosis", "Heart Disease", "Cataracts"],
    allergies: ["None"],
    fallRisk: "High",
    lastCheckup: "2024-11-28"
  },
  {
    id: "3",
    name: "عبدالرحمن سعود", // Abdulrahman Saud
    iqaama: "3456789012", 
    p_no: "P003",
    phone: "+966503456789",
    email: "abdulrahman.saud@email.com",
    plan: "Free Plan",
    dateOfBirth: "1942-11-08",
    gender: "Male",
    bloodType: "B+",
    emergencyContact: {
      name: "سارة عبدالرحمن", // Sara Abdulrahman
      phone: "+966509876543",
      relationship: "Wife"
    },
    medicalConditions: ["Stroke Recovery", "Hypertension", "Depression"],
    allergies: ["Aspirin"],
    fallRisk: "High",
    lastCheckup: "2024-12-05"
  }
];

export const doctors = [
  {
    id: "1",
    name: "د. Lama Algaraini", // Dr. Lama Algaraini
    phone: "+966511234567",
    email: "lama.algaraini@hospital.com",
    specialization: "Geriatrics",
    availability: "Mon-Wed-Fri 9AM-5PM",
    plan: "Professional Plan",
    license: "MD-12345",
    experience: "8 years",
    hospital: "King Saud Medical City"
  },
  {
    id: "2",
    name: "د. Mohamed Hassan", // Dr. Mohamed Hassan
    phone: "+966512345678", 
    email: "mohamed.hassan@hospital.com",
    specialization: "Internal Medicine",
    availability: "Tue-Thu-Sat 8AM-4PM",
    plan: "Professional Plan",
    license: "MD-67890",
    experience: "12 years",
    hospital: "Riyadh Medical Complex"
  },
  {
    id: "3",
    name: "د. Aisha Al-Saud", // Dr. Aisha Al-Saud
    phone: "+966513456789",
    email: "aisha.alsaud@hospital.com", 
    specialization: "Cardiology",
    availability: "Mon-Tue-Thu 10AM-6PM",
    plan: "Free Plan",
    license: "MD-54321",
    experience: "6 years",
    hospital: "King Faisal Specialist Hospital"
  }
];

export const medications = [
  {
    id: "1",
    name: "Metformin",
    description: "For diabetes management",
    category: "Diabetes Medication",
    dosage: "500mg twice daily"
  },
  {
    id: "2", 
    name: "Lisinopril",
    description: "For hypertension",
    category: "Blood Pressure Medication",
    dosage: "10mg once daily"
  },
  {
    id: "3",
    name: "Aspirin",
    description: "Blood thinner, pain relief",
    category: "Pain Relief / Cardiovascular",
    dosage: "81mg once daily"
  },
  {
    id: "4",
    name: "Atorvastatin",
    description: "Cholesterol management",
    category: "Cholesterol Medication",
    dosage: "20mg once daily"
  },
  {
    id: "5",
    name: "Vitamin D3",
    description: "Bone health supplement",
    category: "Supplement",
    dosage: "1000 IU once daily"
  }
];

export const symptoms = [
  {
    id: "1",
    symptom: "Chest Pain",
    severity: "High",
    category: "Cardiovascular"
  },
  {
    id: "2",
    symptom: "Dizziness",
    severity: "Medium", 
    category: "Neurological"
  },
  {
    id: "3",
    symptom: "Shortness of Breath",
    severity: "High",
    category: "Respiratory"
  },
  {
    id: "4",
    symptom: "Joint Pain",
    severity: "Medium",
    category: "Musculoskeletal"
  },
  {
    id: "5",
    symptom: "Fatigue",
    severity: "Low",
    category: "General"
  }
];

export const transactions = [
  {
    id: "1",
    patient_id: "1",
    doctor_id: "1",
    transaction_type: "Consultation",
    chief_complaint: "High blood pressure and dizziness",
    clinical_notes: "Patient reports increased dizziness over the past week. Blood pressure elevated at 160/95. Adjusted medication dosage.",
    admission_required: false,
    hospital_days: null,
    created_at: "2024-12-10T10:30:00Z",
    status: "Completed",
    amount: 300
  },
  {
    id: "2",
    patient_id: "2",
    doctor_id: "2",
    transaction_type: "Follow-up",
    chief_complaint: "Joint pain and mobility issues",
    clinical_notes: "Osteoporosis management review. Patient experiencing increased joint pain. Recommended physical therapy and calcium supplements.",
    admission_required: false,
    hospital_days: null,
    created_at: "2024-12-08T14:15:00Z",
    status: "Completed",
    amount: 200
  },
  {
    id: "3",
    patient_id: "3",
    doctor_id: "1",
    transaction_type: "Emergency",
    chief_complaint: "Fall at home, head injury",
    clinical_notes: "Patient fell at home, hit head. No loss of consciousness. Mild concussion suspected. Recommended observation and fall prevention measures.",
    admission_required: true,
    hospital_days: 2,
    created_at: "2024-12-05T08:45:00Z",
    status: "Completed",
    amount: 1500
  },
  {
    id: "4",
    patient_id: "1",
    doctor_id: "3",
    transaction_type: "Cardiology Consultation",
    chief_complaint: "Chest pain and shortness of breath",
    clinical_notes: "Cardiac evaluation completed. ECG normal. Symptoms likely related to anxiety. Recommended stress management and follow-up in 3 months.",
    admission_required: false,
    hospital_days: null,
    created_at: "2024-12-01T11:20:00Z",
    status: "Scheduled",
    amount: 500
  }
];

export const patientMedicationHistory = [
  {
    id: "1",
    patient_id: "1",
    doctor_id: "1",
    medications: [
      {
        medication_id: "1",
        name: "Metformin",
        dose: "500mg",
        start_date: "2024-01-15T00:00:00Z",
        end_date: null,
        instructions: "Take with breakfast and dinner"
      },
      {
        medication_id: "2", 
        name: "Lisinopril",
        dose: "10mg",
        start_date: "2024-01-15T00:00:00Z",
        end_date: null,
        instructions: "Take once daily in the morning"
      }
    ],
    notes: "Patient responding well to current medication regimen. Monitor for side effects.",
    transaction_id: "1",
    created_at: "2024-12-10T10:30:00Z"
  },
  {
    id: "2",
    patient_id: "2",
    doctor_id: "2",
    medications: [
      {
        medication_id: "4",
        name: "Atorvastatin", 
        dose: "20mg",
        start_date: "2024-02-01T00:00:00Z",
        end_date: null,
        instructions: "Take once daily at bedtime"
      },
      {
        medication_id: "5",
        name: "Vitamin D3",
        dose: "1000 IU", 
        start_date: "2024-02-01T00:00:00Z",
        end_date: null,
        instructions: "Take once daily with breakfast"
      }
    ],
    notes: "Osteoporosis treatment plan. Continue calcium and vitamin D supplementation.",
    transaction_id: "2", 
    created_at: "2024-12-08T14:15:00Z"
  },
  {
    id: "3",
    patient_id: "3",
    doctor_id: "1",
    medications: [
      {
        medication_id: "3",
        name: "Aspirin",
        dose: "81mg",
        start_date: "2024-01-20T00:00:00Z",
        end_date: "2024-11-15T00:00:00Z",
        instructions: "Take once daily. Discontinued due to bruising."
      }
    ],
    notes: "Stroke recovery medication. Aspirin discontinued due to side effects. Alternative antiplatelet therapy needed.",
    transaction_id: "3",
    created_at: "2024-12-05T08:45:00Z"
  }
];

export const equipmentRequests = [
  {
    id: "1",
    patient_id: "1",
    patient_name: "أحمد محمد",
    equipment_name: "Wheelchair",
    description: "Lightweight wheelchair for mobility assistance",
    urgency: "High",
    category: "Mobility",
    estimated_cost: 2500,
    status: "Pending",
    created_at: "2024-12-12T09:00:00Z",
    medical_justification: "Patient has severe arthritis and difficulty walking long distances. Wheelchair needed for medical appointments and daily activities."
  },
  {
    id: "2",
    patient_id: "2", 
    patient_name: "فاطمة عبدالله",
    equipment_name: "Blood Pressure Monitor",
    description: "Automatic blood pressure monitor for home use",
    urgency: "Medium",
    category: "Monitoring",
    estimated_cost: 300,
    status: "Fulfilled",
    created_at: "2024-12-05T14:30:00Z",
    medical_justification: "Patient has hypertension and needs regular blood pressure monitoring at home. Doctor recommended daily monitoring."
  },
  {
    id: "3",
    patient_id: "3",
    patient_name: "عبدالرحمن سعود", 
    equipment_name: "Fall Detection Sensor",
    description: "Wearable fall detection sensor with emergency alert",
    urgency: "High",
    category: "Safety",
    estimated_cost: 800,
    status: "In Progress",
    created_at: "2024-12-06T11:15:00Z",
    medical_justification: "Patient has high fall risk and lives alone. Fall detection sensor needed for emergency response and family peace of mind."
  },
  {
    id: "4",
    patient_id: "1",
    patient_name: "أحمد محمد",
    equipment_name: "Walking Frame",
    description: "Adjustable walking frame with brakes",
    urgency: "Medium",
    category: "Mobility", 
    estimated_cost: 450,
    status: "Pending",
    created_at: "2024-12-11T16:45:00Z",
    medical_justification: "Patient needs additional support for walking due to arthritis and balance issues. Walking frame will improve mobility and safety."
  }
];

export const donors = [
  {
    id: "1",
    name: "Riyadh Charity Foundation",
    email: "info@riyadhcharity.org",
    phone: "+966114567890",
    type: "Organization",
    total_donations: 15000,
    donation_count: 8,
    joined_at: "2024-01-15T00:00:00Z"
  },
  {
    id: "2",
    name: "Sultan Al-Saud",
    email: "sultan.alsaud@email.com", 
    phone: "+966501112233",
    type: "Individual",
    total_donations: 3500,
    donation_count: 3,
    joined_at: "2024-03-20T00:00:00Z"
  },
  {
    id: "3",
    name: "King Abdullah Medical Foundation",
    email: "contact@kamf.org.sa",
    phone: "+966118877665",
    type: "Organization", 
    total_donations: 25000,
    donation_count: 12,
    joined_at: "2024-02-10T00:00:00Z"
  }
];

export const donations = [
  {
    id: "1",
    donor_id: "1",
    equipment_request_id: "2",
    amount: 300,
    type: "Equipment",
    status: "Completed",
    created_at: "2024-12-05T15:00:00Z",
    completed_at: "2024-12-08T10:30:00Z"
  },
  {
    id: "2",
    donor_id: "2",
    equipment_request_id: "3", 
    amount: 800,
    type: "Equipment",
    status: "In Progress",
    created_at: "2024-12-06T12:00:00Z",
    completed_at: null
  },
  {
    id: "3",
    donor_id: "3",
    equipment_request_id: "1",
    amount: 2500,
    type: "Equipment",
    status: "Pending",
    created_at: "2024-12-12T10:00:00Z",
    completed_at: null
  },
  {
    id: "4",
    donor_id: "1",
    equipment_request_id: "4",
    amount: 450,
    type: "Equipment", 
    status: "Pending",
    created_at: "2024-12-11T17:00:00Z",
    completed_at: null
  }
];

export const fallAlerts = [
  {
    id: "1",
    patient_id: "3",
    patient_name: "عبدالرحمن سعود",
    type: "Fall Detected",
    severity: "High",
    location: "Home - Living Room",
    detected_at: "2024-12-05T08:30:00Z",
    resolved_at: "2024-12-05T09:15:00Z",
    status: "Resolved",
    response_time: "45 minutes",
    injuries: "Mild head injury, bruising",
    action_taken: "Family notified, patient taken to hospital for evaluation"
  },
  {
    id: "2",
    patient_id: "2",
    patient_name: "فاطمة عبدالله", 
    type: "Near Fall",
    severity: "Medium",
    location: "Home - Kitchen",
    detected_at: "2024-12-08T14:20:00Z",
    resolved_at: "2024-12-08T14:25:00Z",
    status: "Resolved",
    response_time: "5 minutes",
    injuries: "None",
    action_taken: "Family assisted patient, no medical attention needed"
  }
];

export const medicationReminders = [
  {
    id: "1",
    patient_id: "1",
    patient_name: "أحمد محمد",
    medication_name: "Metformin",
    dosage: "500mg",
    time: "08:00",
    frequency: "Twice daily",
    status: "Active",
    adherence_rate: 85,
    last_taken: "2024-12-10T08:05:00Z",
    next_dose: "2024-12-10T20:00:00Z"
  },
  {
    id: "2",
    patient_id: "1",
    patient_name: "أحمد محمد", 
    medication_name: "Lisinopril",
    dosage: "10mg",
    time: "09:00",
    frequency: "Once daily",
    status: "Active",
    adherence_rate: 92,
    last_taken: "2024-12-10T09:02:00Z",
    next_dose: "2024-12-11T09:00:00Z"
  },
  {
    id: "3",
    patient_id: "2",
    patient_name: "فاطمة عبدالله",
    medication_name: "Atorvastatin",
    dosage: "20mg", 
    time: "21:00",
    frequency: "Once daily",
    status: "Active",
    adherence_rate: 78,
    last_taken: "2024-12-09T21:10:00Z",
    next_dose: "2024-12-10T21:00:00Z"
  }
];

// Utility functions
export const getPatientById = (id) => patients.find(p => p.id === id);
export const getDoctorById = (id) => doctors.find(d => d.id === id);
export const getMedicationById = (id) => medications.find(m => m.id === id);
export const getTransactionById = (id) => transactions.find(t => t.id === id);
export const getEquipmentRequestById = (id) => equipmentRequests.find(eq => eq.id === id);
export const getDonorById = (id) => donors.find(d => d.id === id);

export const getPatientTransactions = (patientId) => 
  transactions.filter(t => t.patient_id === patientId);

export const getDoctorTransactions = (doctorId) => 
  transactions.filter(t => t.doctor_id === doctorId);

export const getPatientMedicationHistory = (patientId) => 
  patientMedicationHistory.filter(h => h.patient_id === patientId);

export const getPatientEquipmentRequests = (patientId) => 
  equipmentRequests.filter(eq => eq.patient_id === patientId);

export const getPatientFallAlerts = (patientId) => 
  fallAlerts.filter(alert => alert.patient_id === patientId);

export const getPatientMedicationReminders = (patientId) => 
  medicationReminders.filter(reminder => reminder.patient_id === patientId);

export const getDonationsByDonor = (donorId) => 
  donations.filter(d => d.donor_id === donorId);

export const getDonationsByRequest = (requestId) =>
  donations.filter(d => d.equipment_request_id === requestId);

// Additional data for comprehensive dashboards

export const appointments = [
  {
    id: "apt1",
    patient_id: "1",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    date: "2024-12-25T09:00:00Z",
    type: "Consultation",
    status: "Confirmed",
    notes: "Regular checkup and medication review"
  },
  {
    id: "apt2",
    patient_id: "2",
    doctor_id: "2",
    doctor_name: "Dr. Mohamed Hassan",
    specialization: "Internal Medicine",
    date: "2024-12-26T10:30:00Z",
    type: "Follow-up",
    status: "Confirmed",
    notes: "Post-treatment follow-up"
  },
  {
    id: "apt3",
    patient_id: "3",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    date: "2024-12-24T14:00:00Z",
    type: "Consultation",
    status: "Confirmed",
    notes: "Stroke recovery assessment"
  },
  {
    id: "apt4",
    patient_id: "1",
    doctor_id: "3",
    doctor_name: "Dr. Aisha Al-Saud",
    specialization: "Cardiology",
    date: "2024-12-27T11:00:00Z",
    type: "Specialist Consultation",
    status: "Scheduled",
    notes: "Heart health evaluation"
  }
];

export const careTasks = [
  {
    id: "task1",
    patient_id: "1",
    task: "Administer morning medication",
    notes: "Metformin 500mg and Lisinopril 10mg",
    priority: "High",
    status: "Pending",
    family_member: "Fatima Ahmed",
    due_date: "2024-12-24T08:00:00Z"
  },
  {
    id: "task2",
    patient_id: "1",
    task: "Accompany to doctor appointment",
    notes: "Dr. Lama Algaraini at 9 AM",
    priority: "High",
    status: "Pending",
    family_member: "Fatima Ahmed",
    due_date: "2024-12-25T09:00:00Z"
  },
  {
    id: "task3",
    patient_id: "2",
    task: "Check blood pressure",
    notes: "Morning and evening readings",
    priority: "Medium",
    status: "Completed",
    family_member: "Mohamed Fatima",
    due_date: "2024-12-23T08:00:00Z"
  },
  {
    id: "task4",
    patient_id: "3",
    task: "Physical therapy session",
    notes: "Stroke recovery exercises",
    priority: "High",
    status: "Pending",
    family_member: "Sara Abdulrahman",
    due_date: "2024-12-24T15:00:00Z"
  },
  {
    id: "task5",
    patient_id: "3",
    task: "Prepare healthy meals",
    notes: "Low sodium diet for blood pressure",
    priority: "Medium",
    status: "Pending",
    family_member: "Sara Abdulrahman",
    due_date: "2024-12-24T12:00:00Z"
  }
];

export const healthMetrics = [
  {
    id: "hm1",
    patient_id: "1",
    type: "Blood Pressure",
    value: "140/90",
    unit: "mmHg",
    status: "Elevated",
    recorded_at: "2024-12-23T08:00:00Z"
  },
  {
    id: "hm2",
    patient_id: "1",
    type: "Blood Sugar",
    value: "125",
    unit: "mg/dL",
    status: "Normal",
    recorded_at: "2024-12-23T08:00:00Z"
  },
  {
    id: "hm3",
    patient_id: "1",
    type: "Heart Rate",
    value: "72",
    unit: "bpm",
    status: "Normal",
    recorded_at: "2024-12-23T08:00:00Z"
  },
  {
    id: "hm4",
    patient_id: "1",
    type: "Weight",
    value: "78",
    unit: "kg",
    status: "Normal",
    recorded_at: "2024-12-23T08:00:00Z"
  },
  {
    id: "hm5",
    patient_id: "2",
    type: "Blood Pressure",
    value: "130/85",
    unit: "mmHg",
    status: "Normal",
    recorded_at: "2024-12-23T09:00:00Z"
  },
  {
    id: "hm6",
    patient_id: "2",
    type: "Heart Rate",
    value: "68",
    unit: "bpm",
    status: "Normal",
    recorded_at: "2024-12-23T09:00:00Z"
  },
  {
    id: "hm7",
    patient_id: "3",
    type: "Blood Pressure",
    value: "150/95",
    unit: "mmHg",
    status: "Elevated",
    recorded_at: "2024-12-23T07:30:00Z"
  },
  {
    id: "hm8",
    patient_id: "3",
    type: "Oxygen Level",
    value: "96",
    unit: "%",
    status: "Normal",
    recorded_at: "2024-12-23T07:30:00Z"
  }
];

export const familyMembers = [
  {
    id: 'f1',
    name: 'فاطمة أحمد',
    nameEn: 'Fatima Ahmed',
    email: 'fatima.ahmed@email.com',
    role: 'family',
    patient_id: '1',
    relationship: 'Daughter'
  },
  {
    id: 'f2',
    name: 'محمد فاطمة',
    nameEn: 'Mohamed Fatima',
    email: 'mohamed.fatima@email.com',
    role: 'family',
    patient_id: '2',
    relationship: 'Son'
  },
  {
    id: 'f3',
    name: 'سارة عبدالرحمن',
    nameEn: 'Sara Abdulrahman',
    email: 'sara.abdulrahman@email.com',
    role: 'family',
    patient_id: '3',
    relationship: 'Wife'
  }
];

// Enhanced patient data with additional properties
patients.forEach(patient => {
  patient.nameEn = patient.name.split(' ').map(word => {
    const arabicToEnglish = {
      'أحمد': 'Ahmed',
      'محمد': 'Mohamed',
      'فاطمة': 'Fatima',
      'عبدالله': 'Abdullah',
      'عبدالرحمن': 'Abdulrahman',
      'سعود': 'Saud',
    };
    return arabicToEnglish[word] || word;
  }).join(' ');
  patient.address = 'Riyadh, Saudi Arabia';
  patient.insuranceProvider = 'Saudi Health Insurance';
  patient.insuranceNumber = `INS${patient.id}${Math.random().toString(36).substring(7).toUpperCase()}`;
});

// Enhanced doctor data with additional properties
doctors.forEach(doctor => {
  doctor.nameEn = doctor.name;
  doctor.specializationAr = {
    'Geriatrics': 'طب الشيخوخة',
    'Internal Medicine': 'الطب الباطني',
    'Cardiology': 'أمراض القلب'
  }[doctor.specialization] || doctor.specialization;
  doctor.rating = (4 + Math.random()).toFixed(1);
  doctor.consultationFee = [300, 400, 500, 600][Math.floor(Math.random() * 4)];
  doctor.totalPatients = Math.floor(Math.random() * 100) + 50;
  doctor.totalConsultations = Math.floor(Math.random() * 500) + 200;
});

// Enhanced donors with additional properties
donors.forEach(donor => {
  donor.nameAr = {
    'Riyadh Charity Foundation': 'مؤسسة الرياض الخيرية',
    'Sultan Al-Saud': 'سلطان آل سعود',
    'King Abdullah Medical Foundation': 'مؤسسة الملك عبدالله الطبية'
  }[donor.name] || donor.name;
  donor.verified = Math.random() > 0.3;
});

// Enhanced equipment requests with Arabic names
equipmentRequests.forEach(request => {
  request.equipment_name_ar = {
    'Wheelchair': 'كرسي متحرك',
    'Blood Pressure Monitor': 'جهاز قياس ضغط الدم',
    'Fall Detection Sensor': 'جهاز كشف السقوط',
    'Walking Frame': 'إطار المشي'
  }[request.equipment_name] || request.equipment_name;
});

// Enhanced donations with payment details
donations.forEach(donation => {
  donation.payment_method = ['Credit Card', 'Mada Card', 'Apple Pay', 'Bank Transfer'][Math.floor(Math.random() * 4)];
  donation.receipt_number = `RCP${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;
});

// Helper functions for fetching data
export const getUpcomingAppointments = (patientId) =>
  appointments.filter(a => a.patient_id === patientId && new Date(a.date) >= new Date());

export const getCareTasks = (patientId) =>
  careTasks.filter(t => t.patient_id === patientId);

export const getHealthMetrics = (patientId) =>
  healthMetrics.filter(m => m.patient_id === patientId);

export const getPatientPayments = (patientId) => {
  // Generate mock payment history
  return [
    {
      id: "pay1",
      patient_id: patientId,
      amount: 300,
      description: "Doctor Consultation",
      date: "2024-12-15T10:00:00Z",
      status: "Completed",
      payment_method: "Credit Card"
    },
    {
      id: "pay2",
      patient_id: patientId,
      amount: 150,
      description: "Medication",
      date: "2024-12-10T14:30:00Z",
      status: "Completed",
      payment_method: "Mada Card"
    }
  ];
};

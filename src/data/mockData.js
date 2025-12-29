
// Mock data for Innovative Geriatrics Medical App

export const patients = [
  {
    id: "1",
    name: "أحمد محمد",
    nameEn: "Ahmed Mohammed",
    iqaama: "1234567890",
    p_no: "P001",
    phone: "+966501234567",
    email: "ahmed.mohamed@email.com",
    plan: "Free Plan",
    dateOfBirth: "1945-03-15",
    gender: "Male",
    bloodType: "O+",
    status: "Active",
    emergencyContact: {
      name: "Fatima Ahmed",
      phone: "+966507654321",
      relationship: "Daughter"
    },
    medicalConditions: ["Hypertension", "Diabetes Type 2", "Arthritis"],
    allergies: ["Penicillin", "Sulfa drugs"],
    fallRisk: "Medium",
    lastCheckup: "2024-12-01",
    insurance: { provider: "Bupa Arabia", policyNumber: "BA-2024-001234", coverage: "80%" }
  },
  {
    id: "2",
    name: "فاطمة عبدالله",
    nameEn: "Fatima Abdullah",
    iqaama: "2345678901",
    p_no: "P002",
    phone: "+966502345678",
    email: "fatima.abdullah@email.com",
    plan: "Professional Plan",
    dateOfBirth: "1948-07-22",
    gender: "Female",
    bloodType: "A+",
    status: "At Risk",
    emergencyContact: {
      name: "Mohamed Fatima",
      phone: "+966508765432",
      relationship: "Son"
    },
    medicalConditions: ["Osteoporosis", "Heart Disease", "Cataracts"],
    allergies: ["None"],
    fallRisk: "High",
    lastCheckup: "2024-11-28",
    insurance: { provider: "Tawuniya", policyNumber: "TW-2024-005678", coverage: "90%" }
  },
  {
    id: "3",
    name: "عبدالرحمن سعود",
    nameEn: "Abdulrahman Saud",
    iqaama: "3456789012",
    p_no: "P003",
    phone: "+966503456789",
    email: "abdulrahman.saud@email.com",
    plan: "Free Plan",
    dateOfBirth: "1942-11-08",
    gender: "Male",
    bloodType: "B+",
    status: "At Risk",
    emergencyContact: {
      name: "Sara Abdulrahman",
      phone: "+966509876543",
      relationship: "Wife"
    },
    medicalConditions: ["Stroke Recovery", "Hypertension", "Depression"],
    allergies: ["Aspirin"],
    fallRisk: "High",
    lastCheckup: "2024-12-05",
    insurance: { provider: "MedGulf", policyNumber: "MG-2024-009012", coverage: "75%" }
  },
  {
    id: "4",
    name: "نورة الحربي",
    nameEn: "Noura Al-Harbi",
    iqaama: "4567890123",
    p_no: "P004",
    phone: "+966504567890",
    email: "noura.alharbi@email.com",
    plan: "Professional Plan",
    dateOfBirth: "1950-05-20",
    gender: "Female",
    bloodType: "AB+",
    status: "Active",
    emergencyContact: {
      name: "Khalid Al-Harbi",
      phone: "+966505678901",
      relationship: "Husband"
    },
    medicalConditions: ["Chronic Kidney Disease", "Anemia"],
    allergies: ["Ibuprofen"],
    fallRisk: "Medium",
    lastCheckup: "2024-12-10",
    insurance: { provider: "AXA Cooperative", policyNumber: "AXA-2024-003456", coverage: "85%" }
  },
  {
    id: "5",
    name: "سلمان العتيبي",
    nameEn: "Salman Al-Otaibi",
    iqaama: "5678901234",
    p_no: "P005",
    phone: "+966505678901",
    email: "salman.alotaibi@email.com",
    plan: "Free Plan",
    dateOfBirth: "1938-09-12",
    gender: "Male",
    bloodType: "O-",
    status: "Active",
    emergencyContact: {
      name: "Maryam Salman",
      phone: "+966506789012",
      relationship: "Daughter"
    },
    medicalConditions: ["COPD", "Parkinson's Disease"],
    allergies: ["Codeine", "Morphine"],
    fallRisk: "High",
    lastCheckup: "2024-12-08",
    insurance: { provider: "Bupa Arabia", policyNumber: "BA-2024-007890", coverage: "70%" }
  },
  {
    id: "6",
    name: "هدى القحطاني",
    nameEn: "Huda Al-Qahtani",
    iqaama: "6789012345",
    p_no: "P006",
    phone: "+966506789012",
    email: "huda.alqahtani@email.com",
    plan: "Professional Plan",
    dateOfBirth: "1952-01-30",
    gender: "Female",
    bloodType: "B-",
    status: "Active",
    emergencyContact: {
      name: "Omar Al-Qahtani",
      phone: "+966507890123",
      relationship: "Son"
    },
    medicalConditions: ["Rheumatoid Arthritis", "Glaucoma"],
    allergies: ["None"],
    fallRisk: "Low",
    lastCheckup: "2024-12-15",
    insurance: { provider: "Tawuniya", policyNumber: "TW-2024-002345", coverage: "95%" }
  }
];

export const doctors = [
  {
    id: "1",
    name: "د. لمى الغريني",
    nameEn: "Dr. Lama Algaraini",
    phone: "+966511234567",
    email: "lama.algaraini@hospital.com",
    specialization: "Geriatrics",
    specializationAr: "طب الشيخوخة",
    availability: "Mon-Wed-Fri 9AM-5PM",
    plan: "Professional Plan",
    license: "MD-12345",
    experience: "8 years",
    hospital: "King Saud Medical City",
    rating: 4.8,
    consultationFee: 350
  },
  {
    id: "2",
    name: "د. محمد حسن",
    nameEn: "Dr. Mohamed Hassan",
    phone: "+966512345678",
    email: "mohamed.hassan@hospital.com",
    specialization: "Internal Medicine",
    specializationAr: "الطب الباطني",
    availability: "Tue-Thu-Sat 8AM-4PM",
    plan: "Professional Plan",
    license: "MD-67890",
    experience: "12 years",
    hospital: "Riyadh Medical Complex",
    rating: 4.9,
    consultationFee: 400
  },
  {
    id: "3",
    name: "د. عائشة آل سعود",
    nameEn: "Dr. Aisha Al-Saud",
    phone: "+966513456789",
    email: "aisha.alsaud@hospital.com",
    specialization: "Cardiology",
    specializationAr: "أمراض القلب",
    availability: "Mon-Tue-Thu 10AM-6PM",
    plan: "Free Plan",
    license: "MD-54321",
    experience: "6 years",
    hospital: "King Faisal Specialist Hospital",
    rating: 4.7,
    consultationFee: 450
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

// Helper to create relative dates for fall alerts
const getFallAlertDate = (daysAgo, hours = 9, minutes = 4) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const fallAlerts = [
  // Alerts for patient_id "1" (أحمد محمد - main patient for family member)
  {
    id: "fa1",
    patient_id: "1",
    patient_name: "أحمد محمد",
    type: "Fall Detected",
    severity: "Critical",
    location: "Home - Living Room",
    detected_at: getFallAlertDate(0),
    resolved_at: null,
    status: "Pending",
    response_time: null,
    injuries: null,
    response_action: null
  },
  {
    id: "fa2",
    patient_id: "1",
    patient_name: "أحمد محمد",
    type: "Near Fall",
    severity: "High",
    location: "Home - Bedroom",
    detected_at: getFallAlertDate(1),
    resolved_at: getFallAlertDate(1, 9, 30),
    status: "Resolved",
    response_time: "26 minutes",
    injuries: "None",
    response_action: "Family checked on patient, no injuries found"
  },
  {
    id: "fa3",
    patient_id: "1",
    patient_name: "أحمد محمد",
    type: "Balance Issue",
    severity: "Medium",
    location: "Home - Bathroom",
    detected_at: getFallAlertDate(2),
    resolved_at: getFallAlertDate(2, 9, 15),
    status: "Resolved",
    response_time: "11 minutes",
    injuries: "None",
    response_action: "Family checked on patient, no injuries found"
  },
  {
    id: "fa4",
    patient_id: "1",
    patient_name: "أحمد محمد",
    type: "Sudden Movement",
    severity: "Low",
    location: "Home - Kitchen",
    detected_at: getFallAlertDate(3),
    resolved_at: getFallAlertDate(3, 9, 20),
    status: "Resolved",
    response_time: "16 minutes",
    injuries: "None",
    response_action: "Family checked on patient, no injuries found"
  },
  {
    id: "fa5",
    patient_id: "1",
    patient_name: "أحمد محمد",
    type: "Fall Detected",
    severity: "Critical",
    location: "Home - Garden",
    detected_at: getFallAlertDate(4),
    resolved_at: getFallAlertDate(4, 10, 0),
    status: "Resolved",
    response_time: "56 minutes",
    injuries: "Minor bruising",
    response_action: "Family checked on patient, no injuries found"
  },
  // Existing alerts for other patients
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

// Helper to create dates relative to today
const getRelativeDate = (daysOffset, hours = 9, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const appointments = [
  {
    id: "apt1",
    patient_id: "1",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    location: "King Saud Medical City",
    date: getRelativeDate(0, 9, 0), // Today 9:00 AM
    type: "Consultation",
    status: "Confirmed",
    notes: "Regular checkup and medication review"
  },
  {
    id: "apt2",
    patient_id: "2",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    location: "King Saud Medical City",
    date: getRelativeDate(0, 11, 30), // Today 11:30 AM
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
    location: "King Saud Medical City",
    date: getRelativeDate(1, 10, 0), // Tomorrow 10:00 AM
    type: "Consultation",
    status: "Scheduled",
    notes: "Stroke recovery assessment"
  },
  {
    id: "apt4",
    patient_id: "1",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    location: "King Saud Medical City",
    date: getRelativeDate(1, 14, 30), // Tomorrow 2:30 PM
    type: "Checkup",
    status: "Scheduled",
    notes: "Blood pressure monitoring"
  },
  {
    id: "apt5",
    patient_id: "2",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    location: "King Saud Medical City",
    date: getRelativeDate(3, 9, 0), // 3 days later
    type: "Lab Review",
    status: "Scheduled",
    notes: "Review blood test results"
  },
  {
    id: "apt6",
    patient_id: "3",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    location: "King Saud Medical City",
    date: getRelativeDate(5, 11, 0), // 5 days later
    type: "Follow-up",
    status: "Scheduled",
    notes: "Physical therapy progress check"
  },
  {
    id: "apt7",
    patient_id: "1",
    doctor_id: "3",
    doctor_name: "Dr. Aisha Al-Saud",
    specialization: "Cardiology",
    location: "King Faisal Specialist Hospital",
    date: getRelativeDate(7, 10, 0), // 7 days later
    type: "Specialist Consultation",
    status: "Scheduled",
    notes: "Heart health evaluation"
  },
  {
    id: "apt8",
    patient_id: "2",
    doctor_id: "2",
    doctor_name: "Dr. Mohamed Hassan",
    specialization: "Internal Medicine",
    location: "Riyadh Medical Complex",
    date: getRelativeDate(2, 14, 0), // 2 days later
    type: "Consultation",
    status: "Scheduled",
    notes: "General health assessment"
  }
];

export const careTasks = [
  // Patient 1 tasks - Abdullah's care
  {
    id: "task1",
    patient_id: "1",
    task: "Administer morning medication",
    title: "Morning Medication",
    notes: "Metformin 500mg and Lisinopril 10mg - Take with breakfast",
    description: "Give Metformin 500mg and Lisinopril 10mg with breakfast. Ensure patient drinks full glass of water.",
    priority: "High",
    status: "Pending",
    category: "Medication",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(0, 8, 0), // Today at 8 AM
    recurrence: "daily",
    reminder_before: 30, // 30 minutes before
    created_at: getRelativeDate(-7, 10, 0)
  },
  {
    id: "task2",
    patient_id: "1",
    task: "Accompany to doctor appointment",
    title: "Doctor Appointment",
    notes: "Dr. Lama Algaraini - Cardiology checkup",
    description: "Accompany to appointment with Dr. Lama at KFMC. Bring previous test results and medication list.",
    priority: "High",
    status: "Pending",
    category: "Appointment",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(1, 9, 0), // Tomorrow at 9 AM
    recurrence: "none",
    reminder_before: 60,
    created_at: getRelativeDate(-3, 14, 0)
  },
  {
    id: "task3",
    patient_id: "1",
    task: "Evening blood pressure check",
    title: "Blood Pressure Check",
    notes: "Record in health log",
    description: "Measure blood pressure using digital monitor. Record systolic/diastolic in the app.",
    priority: "Medium",
    status: "Completed",
    category: "Monitoring",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(-1, 18, 0), // Yesterday at 6 PM
    completed_at: getRelativeDate(-1, 18, 30),
    recurrence: "daily",
    created_at: getRelativeDate(-14, 10, 0)
  },
  {
    id: "task4",
    patient_id: "1",
    task: "Prepare diabetic-friendly dinner",
    title: "Diabetic Dinner",
    notes: "Low carb, high protein meal",
    description: "Prepare dinner following diabetic diet guidelines. Include vegetables, lean protein, avoid simple carbs.",
    priority: "Medium",
    status: "Pending",
    category: "Nutrition",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(0, 18, 0), // Today at 6 PM
    recurrence: "daily",
    reminder_before: 60,
    created_at: getRelativeDate(-7, 10, 0)
  },
  {
    id: "task5",
    patient_id: "1",
    task: "Assist with evening walk",
    title: "Evening Walk",
    notes: "15-20 minutes light walking",
    description: "Help with light walking exercise around the neighborhood. Monitor for fatigue or shortness of breath.",
    priority: "Low",
    status: "Pending",
    category: "Exercise",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(0, 17, 0), // Today at 5 PM
    recurrence: "daily",
    reminder_before: 30,
    created_at: getRelativeDate(-10, 10, 0)
  },
  {
    id: "task6",
    patient_id: "1",
    task: "Administer evening medication",
    title: "Evening Medication",
    notes: "Insulin injection and blood thinner",
    description: "Give insulin injection (as prescribed) and Aspirin 81mg. Monitor injection site.",
    priority: "High",
    status: "Pending",
    category: "Medication",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(0, 20, 0), // Today at 8 PM
    recurrence: "daily",
    reminder_before: 30,
    created_at: getRelativeDate(-7, 10, 0)
  },
  {
    id: "task7",
    patient_id: "1",
    task: "Check glucose level",
    title: "Glucose Check",
    notes: "Before breakfast reading",
    description: "Use glucometer to check fasting blood sugar. Record reading in health log. Alert if above 180 or below 70.",
    priority: "High",
    status: "Completed",
    category: "Monitoring",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(0, 7, 0), // Today at 7 AM
    completed_at: getRelativeDate(0, 7, 15),
    recurrence: "daily",
    created_at: getRelativeDate(-14, 10, 0)
  },
  {
    id: "task8",
    patient_id: "1",
    task: "Weekly bath assistance",
    title: "Bath Assistance",
    notes: "Help with full body bath",
    description: "Assist with weekly full bath. Ensure bathroom is warm, have non-slip mats ready, check water temperature.",
    priority: "Medium",
    status: "Pending",
    category: "Personal Care",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(2, 10, 0), // 2 days from now
    recurrence: "weekly",
    reminder_before: 60,
    created_at: getRelativeDate(-21, 10, 0)
  },
  {
    id: "task9",
    patient_id: "1",
    task: "Refill medication at pharmacy",
    title: "Pharmacy Pickup",
    notes: "Metformin and Lisinopril refill",
    description: "Pick up monthly medication refill from KFMC pharmacy. Bring insurance card and patient ID.",
    priority: "High",
    status: "Pending",
    category: "Medication",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(3, 10, 0), // 3 days from now
    recurrence: "monthly",
    reminder_before: 1440, // 1 day before
    created_at: getRelativeDate(-2, 10, 0)
  },
  {
    id: "task10",
    patient_id: "1",
    task: "Physical therapy at home",
    title: "Home Therapy",
    notes: "Leg strengthening exercises",
    description: "Guide through prescribed leg strengthening exercises. 3 sets of 10 reps each. Rest between sets.",
    priority: "Medium",
    status: "Completed",
    category: "Exercise",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(-2, 15, 0), // 2 days ago
    completed_at: getRelativeDate(-2, 15, 45),
    recurrence: "every_other_day",
    created_at: getRelativeDate(-30, 10, 0)
  },
  // Patient 2 tasks
  {
    id: "task11",
    patient_id: "2",
    task: "Check blood pressure",
    title: "Blood Pressure Check",
    notes: "Morning and evening readings",
    description: "Take blood pressure readings twice daily. Record both values. Call doctor if above 160/100.",
    priority: "Medium",
    status: "Completed",
    category: "Monitoring",
    family_member: "Mohamed Fatima",
    family_id: "f2",
    due_date: getRelativeDate(-1, 8, 0),
    completed_at: getRelativeDate(-1, 8, 10),
    recurrence: "daily",
    created_at: getRelativeDate(-14, 10, 0)
  },
  {
    id: "task12",
    patient_id: "2",
    task: "Prepare heart-healthy breakfast",
    title: "Healthy Breakfast",
    notes: "Low sodium, low fat",
    description: "Prepare breakfast following heart-healthy diet. Include whole grains, fruits, avoid salt and fried foods.",
    priority: "Medium",
    status: "Pending",
    category: "Nutrition",
    family_member: "Mohamed Fatima",
    family_id: "f2",
    due_date: getRelativeDate(0, 7, 30),
    recurrence: "daily",
    reminder_before: 30,
    created_at: getRelativeDate(-7, 10, 0)
  },
  // Patient 3 tasks
  {
    id: "task13",
    patient_id: "3",
    task: "Physical therapy session",
    title: "Stroke Recovery PT",
    notes: "Stroke recovery exercises",
    description: "Assist with stroke recovery physical therapy exercises. Focus on right side mobility. 30 minutes session.",
    priority: "High",
    status: "Pending",
    category: "Exercise",
    family_member: "Sara Abdulrahman",
    family_id: "f3",
    due_date: getRelativeDate(0, 15, 0),
    recurrence: "daily",
    reminder_before: 30,
    created_at: getRelativeDate(-60, 10, 0)
  },
  {
    id: "task14",
    patient_id: "3",
    task: "Prepare healthy meals",
    title: "Low Sodium Lunch",
    notes: "Low sodium diet for blood pressure",
    description: "Prepare lunch following stroke recovery diet. Low sodium, high potassium. Include leafy greens.",
    priority: "Medium",
    status: "Pending",
    category: "Nutrition",
    family_member: "Sara Abdulrahman",
    family_id: "f3",
    due_date: getRelativeDate(0, 12, 0),
    recurrence: "daily",
    reminder_before: 60,
    created_at: getRelativeDate(-45, 10, 0)
  },
  {
    id: "task15",
    patient_id: "3",
    task: "Speech therapy practice",
    title: "Speech Practice",
    notes: "Practice speech exercises",
    description: "Help with speech therapy exercises for 20 minutes. Practice word pronunciation and sentences from therapy guide.",
    priority: "High",
    status: "Pending",
    category: "Exercise",
    family_member: "Sara Abdulrahman",
    family_id: "f3",
    due_date: getRelativeDate(0, 16, 0),
    recurrence: "daily",
    reminder_before: 30,
    created_at: getRelativeDate(-45, 10, 0)
  },
  // Overdue tasks for testing
  {
    id: "task16",
    patient_id: "1",
    task: "Schedule eye exam",
    title: "Eye Exam Scheduling",
    notes: "Annual diabetic eye exam",
    description: "Call ophthalmologist to schedule annual diabetic retinopathy screening. KFMC Eye Center preferred.",
    priority: "Medium",
    status: "Pending",
    category: "Appointment",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(-3, 10, 0), // Overdue by 3 days
    recurrence: "yearly",
    reminder_before: 10080, // 1 week before
    created_at: getRelativeDate(-10, 10, 0)
  },
  {
    id: "task17",
    patient_id: "1",
    task: "Order medical supplies",
    title: "Medical Supplies",
    notes: "Glucose strips and lancets",
    description: "Order glucose test strips (100 count) and lancets from medical supply store. Check insurance coverage.",
    priority: "Low",
    status: "Pending",
    category: "Other",
    family_member: "Fatima Ahmed",
    family_id: "f1",
    due_date: getRelativeDate(-1, 10, 0), // Overdue by 1 day
    recurrence: "monthly",
    reminder_before: 4320, // 3 days before
    created_at: getRelativeDate(-5, 10, 0)
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
  // Note: patient.nameEn is already defined in the patients array above
  patient.address = 'Riyadh, Saudi Arabia';
  patient.insuranceProvider = 'Saudi Health Insurance';
  patient.insuranceNumber = `INS${patient.id}${Math.random().toString(36).substring(7).toUpperCase()}`;
});

// Enhanced doctor data with additional properties
doctors.forEach(doctor => {
  // Note: doctor.nameEn is already defined in the doctors array above
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

// Equipment Pricing Configuration - Platform determines cost automatically
export const equipmentPricing = {
  // Mobility Aids
  'Wheelchair': { price: 2500, category: 'Mobility', nameAr: 'كرسي متحرك' },
  'Electric Wheelchair': { price: 8500, category: 'Mobility', nameAr: 'كرسي متحرك كهربائي' },
  'Walking Frame': { price: 450, category: 'Mobility', nameAr: 'إطار المشي' },
  'Rollator Walker': { price: 650, category: 'Mobility', nameAr: 'مشاية بعجلات' },
  'Crutches': { price: 150, category: 'Mobility', nameAr: 'عكازات' },
  'Walking Cane': { price: 80, category: 'Mobility', nameAr: 'عصا المشي' },
  'Hospital Bed': { price: 4500, category: 'Mobility', nameAr: 'سرير طبي' },
  'Patient Lift': { price: 6000, category: 'Mobility', nameAr: 'رافعة المريض' },

  // Monitoring Devices
  'Blood Pressure Monitor': { price: 350, category: 'Monitoring', nameAr: 'جهاز قياس ضغط الدم' },
  'Glucose Monitor': { price: 450, category: 'Monitoring', nameAr: 'جهاز قياس السكر' },
  'Pulse Oximeter': { price: 180, category: 'Monitoring', nameAr: 'جهاز قياس الأكسجين' },
  'Heart Rate Monitor': { price: 280, category: 'Monitoring', nameAr: 'جهاز قياس نبضات القلب' },
  'Thermometer': { price: 120, category: 'Monitoring', nameAr: 'ميزان حرارة' },
  'Weight Scale': { price: 200, category: 'Monitoring', nameAr: 'ميزان الوزن' },

  // Respiratory Equipment
  'Oxygen Concentrator': { price: 5500, category: 'Respiratory', nameAr: 'مكثف الأكسجين' },
  'Nebulizer': { price: 350, category: 'Respiratory', nameAr: 'جهاز البخار' },
  'CPAP Machine': { price: 4500, category: 'Respiratory', nameAr: 'جهاز ضغط الهواء الإيجابي' },
  'Suction Machine': { price: 1800, category: 'Respiratory', nameAr: 'جهاز الشفط' },

  // Safety Equipment
  'Bed Rails': { price: 400, category: 'Safety', nameAr: 'حواجز السرير' },
  'Shower Chair': { price: 350, category: 'Safety', nameAr: 'كرسي الاستحمام' },
  'Toilet Safety Frame': { price: 280, category: 'Safety', nameAr: 'إطار أمان المرحاض' },
  'Grab Bars': { price: 150, category: 'Safety', nameAr: 'مقابض الأمان' },
  'Non-Slip Mat': { price: 80, category: 'Safety', nameAr: 'سجادة مانعة للانزلاق' },
  'Fall Detection Sensor': { price: 1200, category: 'Safety', nameAr: 'جهاز كشف السقوط' },

  // Home Care
  'Commode Chair': { price: 450, category: 'Home Care', nameAr: 'كرسي المرحاض' },
  'Overbed Table': { price: 380, category: 'Home Care', nameAr: 'طاولة السرير' },
  'Pressure Relief Mattress': { price: 2200, category: 'Home Care', nameAr: 'مرتبة تخفيف الضغط' },
  'IV Stand': { price: 250, category: 'Home Care', nameAr: 'حامل المحاليل' },
  'Medical Recliner': { price: 3500, category: 'Home Care', nameAr: 'كرسي طبي قابل للإمالة' },
};

// Helper function to get equipment price
export const getEquipmentPrice = (equipmentName) => {
  return equipmentPricing[equipmentName]?.price || 0;
};

// Helper function to get equipment details
export const getEquipmentDetails = (equipmentName) => {
  return equipmentPricing[equipmentName] || null;
};

// Enhanced equipment requests with Arabic names
equipmentRequests.forEach(request => {
  const details = equipmentPricing[request.equipment_name];
  request.equipment_name_ar = details?.nameAr || request.equipment_name;
  // Auto-set estimated cost from pricing if not set
  if (!request.estimated_cost && details) {
    request.estimated_cost = details.price;
  }
});

// Enhanced donations with payment details
donations.forEach(donation => {
  donation.payment_method = ['Credit Card', 'Mada Card', 'Apple Pay', 'Bank Transfer'][Math.floor(Math.random() * 4)];
  donation.receipt_number = `RCP${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;
});

// Medical Records - Comprehensive consultation and hospital history
export const medicalRecords = [
  {
    id: "rec1",
    patient_id: "1",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    hospital: "King Saud Medical City",
    record_type: "Consultation",
    visit_date: "2024-12-10T10:30:00Z",
    chief_complaint: "High blood pressure and dizziness",
    diagnosis: "Hypertension - Stage 2",
    diagnosis_code: "I10",
    clinical_notes: "Patient reports increased dizziness over the past week. Blood pressure elevated at 160/95. Adjusted medication dosage. Recommended lifestyle modifications including reduced sodium intake.",
    vitals: {
      blood_pressure: "160/95",
      heart_rate: "78",
      temperature: "36.8",
      weight: "78",
      oxygen_saturation: "97"
    },
    prescriptions: [
      { medication: "Lisinopril", dosage: "20mg", frequency: "Once daily", duration: "30 days" },
      { medication: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days" }
    ],
    lab_orders: ["Complete Blood Count", "Kidney Function Test"],
    follow_up_date: "2024-12-25T09:00:00Z",
    admission_required: false,
    status: "Completed"
  },
  {
    id: "rec2",
    patient_id: "1",
    doctor_id: "3",
    doctor_name: "Dr. Aisha Al-Saud",
    specialization: "Cardiology",
    hospital: "King Faisal Specialist Hospital",
    record_type: "Specialist Consultation",
    visit_date: "2024-12-01T11:20:00Z",
    chief_complaint: "Chest pain and shortness of breath",
    diagnosis: "Anxiety-related chest discomfort",
    diagnosis_code: "R07.9",
    clinical_notes: "Cardiac evaluation completed. ECG normal. Echo shows normal ejection fraction (60%). Symptoms likely related to anxiety. Recommended stress management and follow-up in 3 months.",
    vitals: {
      blood_pressure: "145/88",
      heart_rate: "82",
      temperature: "36.9",
      weight: "78",
      oxygen_saturation: "98"
    },
    prescriptions: [],
    lab_orders: ["Lipid Panel", "Cardiac Enzymes"],
    follow_up_date: "2025-03-01T11:00:00Z",
    admission_required: false,
    status: "Completed"
  },
  {
    id: "rec3",
    patient_id: "1",
    doctor_id: "2",
    doctor_name: "Dr. Mohamed Hassan",
    specialization: "Internal Medicine",
    hospital: "Riyadh Medical Complex",
    record_type: "Annual Checkup",
    visit_date: "2024-10-15T09:00:00Z",
    chief_complaint: "Annual health checkup",
    diagnosis: "Diabetes Type 2 - Well controlled",
    diagnosis_code: "E11.9",
    clinical_notes: "Annual comprehensive health assessment. Diabetes well controlled with current medication. HbA1c at 6.8%. Continue current treatment plan. Recommended annual ophthalmology exam.",
    vitals: {
      blood_pressure: "138/85",
      heart_rate: "72",
      temperature: "36.7",
      weight: "79",
      oxygen_saturation: "98"
    },
    prescriptions: [
      { medication: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "90 days" }
    ],
    lab_orders: ["HbA1c", "Fasting Glucose", "Complete Metabolic Panel"],
    follow_up_date: "2025-01-15T09:00:00Z",
    admission_required: false,
    status: "Completed"
  },
  {
    id: "rec4",
    patient_id: "1",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    hospital: "King Saud Medical City",
    record_type: "Emergency",
    visit_date: "2024-08-20T14:30:00Z",
    chief_complaint: "Severe dizziness and near syncope",
    diagnosis: "Orthostatic hypotension",
    diagnosis_code: "I95.1",
    clinical_notes: "Patient experienced near fainting episode. Blood pressure drops significantly on standing. Dehydration suspected. IV fluids administered. Medication review performed.",
    vitals: {
      blood_pressure: "100/60",
      heart_rate: "92",
      temperature: "36.6",
      weight: "77",
      oxygen_saturation: "96"
    },
    prescriptions: [
      { medication: "Oral Rehydration Salts", dosage: "1 sachet", frequency: "Twice daily", duration: "7 days" }
    ],
    lab_orders: ["Electrolyte Panel", "Complete Blood Count"],
    follow_up_date: "2024-08-27T10:00:00Z",
    admission_required: false,
    status: "Completed"
  },
  {
    id: "rec5",
    patient_id: "1",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    hospital: "King Saud Medical City",
    record_type: "Hospital Admission",
    visit_date: "2024-06-05T08:00:00Z",
    discharge_date: "2024-06-08T14:00:00Z",
    chief_complaint: "Severe pneumonia with respiratory distress",
    diagnosis: "Community-acquired pneumonia",
    diagnosis_code: "J18.9",
    clinical_notes: "Patient admitted with high fever, productive cough, and low oxygen saturation. Chest X-ray confirmed bilateral pneumonia. Started on IV antibiotics. Significant improvement by day 3. Discharged with oral antibiotics.",
    vitals: {
      blood_pressure: "130/80",
      heart_rate: "98",
      temperature: "39.2",
      weight: "76",
      oxygen_saturation: "89"
    },
    prescriptions: [
      { medication: "Azithromycin", dosage: "500mg", frequency: "Once daily", duration: "5 days" },
      { medication: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours", duration: "As needed" }
    ],
    lab_orders: ["Chest X-Ray", "Sputum Culture", "Complete Blood Count"],
    follow_up_date: "2024-06-15T09:00:00Z",
    admission_required: true,
    hospital_days: 3,
    ward: "Internal Medicine Ward - Room 302",
    status: "Completed"
  },
  {
    id: "rec6",
    patient_id: "2",
    doctor_id: "2",
    doctor_name: "Dr. Mohamed Hassan",
    specialization: "Internal Medicine",
    hospital: "Riyadh Medical Complex",
    record_type: "Follow-up",
    visit_date: "2024-12-08T14:15:00Z",
    chief_complaint: "Joint pain and mobility issues",
    diagnosis: "Osteoporosis with pathological fracture risk",
    diagnosis_code: "M81.0",
    clinical_notes: "Osteoporosis management review. DEXA scan shows T-score of -2.8. Patient experiencing increased joint pain. Recommended physical therapy and supplementation. Discussed fall prevention strategies.",
    vitals: {
      blood_pressure: "135/82",
      heart_rate: "70",
      temperature: "36.7",
      weight: "62",
      oxygen_saturation: "98"
    },
    prescriptions: [
      { medication: "Calcium + Vitamin D", dosage: "600mg/400IU", frequency: "Twice daily", duration: "90 days" },
      { medication: "Alendronate", dosage: "70mg", frequency: "Once weekly", duration: "12 weeks" }
    ],
    lab_orders: ["DEXA Scan", "Vitamin D Level"],
    follow_up_date: "2025-01-08T14:00:00Z",
    admission_required: false,
    status: "Completed"
  },
  {
    id: "rec7",
    patient_id: "3",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    hospital: "King Saud Medical City",
    record_type: "Emergency",
    visit_date: "2024-12-05T08:45:00Z",
    discharge_date: "2024-12-07T11:00:00Z",
    chief_complaint: "Fall at home, head injury",
    diagnosis: "Mild concussion with scalp laceration",
    diagnosis_code: "S06.0",
    clinical_notes: "Patient fell at home, hit head on table edge. No loss of consciousness. CT scan shows no intracranial bleeding. 3cm scalp laceration sutured. Mild concussion suspected. Recommended 48-hour observation.",
    vitals: {
      blood_pressure: "155/92",
      heart_rate: "88",
      temperature: "36.8",
      weight: "72",
      oxygen_saturation: "97"
    },
    prescriptions: [
      { medication: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours", duration: "As needed" }
    ],
    lab_orders: ["CT Head", "Complete Blood Count", "Coagulation Profile"],
    follow_up_date: "2024-12-12T10:00:00Z",
    admission_required: true,
    hospital_days: 2,
    ward: "Observation Unit - Room 105",
    status: "Completed"
  },
  {
    id: "rec8",
    patient_id: "3",
    doctor_id: "1",
    doctor_name: "Dr. Lama Algaraini",
    specialization: "Geriatrics",
    hospital: "King Saud Medical City",
    record_type: "Follow-up",
    visit_date: "2024-11-20T10:00:00Z",
    chief_complaint: "Stroke recovery assessment",
    diagnosis: "Post-stroke rehabilitation - Improving",
    diagnosis_code: "I69.3",
    clinical_notes: "3-month post-stroke follow-up. Patient showing good recovery. Mild residual left-sided weakness improving with physical therapy. Speech therapy no longer needed. Continue current rehabilitation plan.",
    vitals: {
      blood_pressure: "142/88",
      heart_rate: "74",
      temperature: "36.7",
      weight: "73",
      oxygen_saturation: "98"
    },
    prescriptions: [
      { medication: "Clopidogrel", dosage: "75mg", frequency: "Once daily", duration: "Ongoing" },
      { medication: "Atorvastatin", dosage: "40mg", frequency: "Once daily", duration: "Ongoing" }
    ],
    lab_orders: ["Lipid Panel", "Liver Function Test"],
    follow_up_date: "2025-02-20T10:00:00Z",
    admission_required: false,
    status: "Completed"
  }
];

// Helper function to get patient medical records
export const getPatientMedicalRecords = (patientId) =>
  medicalRecords.filter(r => r.patient_id === patientId);

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

import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // App General
    app_name: "Innovative Geriatrics",
    app_subtitle: "Elderly Care Platform",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    view: "View",
    search: "Search",
    filter: "Filter",
    actions: "Actions",
    status: "Status",
    date: "Date",
    time: "Time",
    notes: "Notes",
    description: "Description",
    details: "Details",
    back: "Back",
    next: "Next",
    submit: "Submit",
    close: "Close",
    yes: "Yes",
    no: "No",
    
    // Auth
    login: "Login",
    logout: "Logout",
    welcome: "Welcome",
    welcome_back: "Welcome Back",
    select_role: "Select Your Role",
    select_user: "Select User",
    continue_as: "Continue as",
    patient: "Patient",
    family: "Family Member",
    doctor: "Doctor",
    donor: "Donor",
    
    // Navigation
    dashboard: "Dashboard",
    home: "Home",
    profile: "Profile",
    settings: "Settings",
    help: "Help",
    notifications: "Notifications",
    messages: "Messages",
    
    // Patient Dashboard
    patient_dashboard: "Patient Dashboard",
    patient_dashboard_subtitle: "Manage your health and care",
    my_medications: "My Medications",
    my_appointments: "My Appointments",
    my_health_records: "My Health Records",
    equipment_requests: "Equipment Requests",
    fall_alerts: "Fall Alerts",
    health_metrics: "Health Metrics",
    medication_reminders: "Medication Reminders",
    emergency_contacts: "Emergency Contacts",
    request_equipment: "Request Equipment",
    view_all: "View All",
    no_medications: "No medications found",
    no_appointments: "No upcoming appointments",
    no_alerts: "No alerts",
    
    // Family Dashboard
    family_dashboard: "Family Dashboard",
    family_dashboard_subtitle: "Monitor and support your loved ones",
    patient_overview: "Patient Overview",
    care_tasks: "Care Tasks",
    recent_alerts: "Recent Alerts",
    health_summary: "Health Summary",
    assigned_to: "Assigned To",
    due_date: "Due Date",
    priority: "Priority",
    task: "Task",
    complete_task: "Complete Task",
    add_task: "Add Task",
    
    // Doctor Dashboard
    doctor_dashboard: "Doctor Dashboard",
    doctor_dashboard_subtitle: "Manage patients and clinical workflows",
    my_patients: "My Patients",
    todays_appointments: "Today's Appointments",
    clinical_notes: "Clinical Notes",
    prescriptions: "Prescriptions",
    patient_list: "Patient List",
    add_prescription: "Add Prescription",
    add_clinical_note: "Add Clinical Note",
    chief_complaint: "Chief Complaint",
    last_visit: "Last Visit",
    
    // Donor Dashboard
    donor_dashboard: "Donor Dashboard",
    donor_dashboard_subtitle: "Support elderly care through donations",
    equipment_marketplace: "Equipment Marketplace",
    my_donations: "My Donations",
    donation_history: "Donation History",
    impact_statistics: "Impact Statistics",
    donate_now: "Donate Now",
    total_donated: "Total Donated",
    patients_helped: "Patients Helped",
    pending_requests: "Pending Requests",
    
    // Table Headers
    name: "Name",
    age: "Age",
    gender: "Gender",
    type: "Type",
    severity: "Severity",
    location: "Location",
    specialization: "Specialization",
    equipment: "Equipment",
    urgency: "Urgency",
    medication: "Medication",
    dosage: "Dosage",
    frequency: "Frequency",
    amount: "Amount",
    
    // Status
    pending: "Pending",
    completed: "Completed",
    in_progress: "In Progress",
    cancelled: "Cancelled",
    confirmed: "Confirmed",
    scheduled: "Scheduled",
    fulfilled: "Fulfilled",
    active: "Active",
    inactive: "Inactive",
    resolved: "Resolved",
    
    // Priority
    high: "High",
    medium: "Medium",
    low: "Low",
    
    // Payment
    payment: "Payment",
    payment_method: "Payment Method",
    payment_history: "Payment History",
    make_payment: "Make Payment",
    credit_card: "Credit Card",
    mada_card: "Mada Card",
    apple_pay: "Apple Pay",
    bank_transfer: "Bank Transfer",
    card_number: "Card Number",
    expiry_date: "Expiry Date",
    cvv: "CVV",
    cardholder_name: "Cardholder Name",
    total_amount: "Total Amount",
    processing: "Processing...",
    payment_successful: "Payment Successful",
    payment_failed: "Payment Failed",
    sar: "SAR",
    
    // Health
    blood_pressure: "Blood Pressure",
    blood_sugar: "Blood Sugar",
    heart_rate: "Heart Rate",
    weight: "Weight",
    temperature: "Temperature",
    oxygen_level: "Oxygen Level",
    
    // Alerts
    fall_detected: "Fall Detected",
    near_fall: "Near Fall",
    emergency: "Emergency",
    warning: "Warning",
    info: "Information",
    
    // Equipment Categories
    mobility: "Mobility",
    monitoring: "Monitoring",
    safety: "Safety",
    home_care: "Home Care",
    
    // Misc
    phone: "Phone",
    email: "Email",
    address: "Address",
    relationship: "Relationship",
    hospital: "Hospital",
    insurance: "Insurance",
    allergies: "Allergies",
    conditions: "Conditions",
    fall_risk: "Fall Risk",
    adherence_rate: "Adherence Rate",
    next_dose: "Next Dose",
    last_taken: "Last Taken",
  },
  ar: {
    // App General
    app_name: "طب الشيخوخة المبتكر",
    app_subtitle: "منصة رعاية كبار السن",
    loading: "جاري التحميل...",
    save: "حفظ",
    cancel: "إلغاء",
    confirm: "تأكيد",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    view: "عرض",
    search: "بحث",
    filter: "تصفية",
    actions: "إجراءات",
    status: "الحالة",
    date: "التاريخ",
    time: "الوقت",
    notes: "ملاحظات",
    description: "الوصف",
    details: "التفاصيل",
    back: "رجوع",
    next: "التالي",
    submit: "إرسال",
    close: "إغلاق",
    yes: "نعم",
    no: "لا",
    
    // Auth
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    welcome: "مرحباً",
    welcome_back: "مرحباً بعودتك",
    select_role: "اختر دورك",
    select_user: "اختر المستخدم",
    continue_as: "متابعة كـ",
    patient: "مريض",
    family: "فرد من العائلة",
    doctor: "طبيب",
    donor: "متبرع",
    
    // Navigation
    dashboard: "لوحة التحكم",
    home: "الرئيسية",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    help: "المساعدة",
    notifications: "الإشعارات",
    messages: "الرسائل",
    
    // Patient Dashboard
    patient_dashboard: "لوحة تحكم المريض",
    patient_dashboard_subtitle: "إدارة صحتك ورعايتك",
    my_medications: "أدويتي",
    my_appointments: "مواعيدي",
    my_health_records: "سجلاتي الصحية",
    equipment_requests: "طلبات المعدات",
    fall_alerts: "تنبيهات السقوط",
    health_metrics: "المؤشرات الصحية",
    medication_reminders: "تذكيرات الأدوية",
    emergency_contacts: "جهات الاتصال الطارئة",
    request_equipment: "طلب معدات",
    view_all: "عرض الكل",
    no_medications: "لا توجد أدوية",
    no_appointments: "لا توجد مواعيد قادمة",
    no_alerts: "لا توجد تنبيهات",
    
    // Family Dashboard
    family_dashboard: "لوحة تحكم العائلة",
    family_dashboard_subtitle: "مراقبة ودعم أحبائك",
    patient_overview: "نظرة عامة على المريض",
    care_tasks: "مهام الرعاية",
    recent_alerts: "التنبيهات الأخيرة",
    health_summary: "ملخص الصحة",
    assigned_to: "مسند إلى",
    due_date: "تاريخ الاستحقاق",
    priority: "الأولوية",
    task: "المهمة",
    complete_task: "إكمال المهمة",
    add_task: "إضافة مهمة",
    
    // Doctor Dashboard
    doctor_dashboard: "لوحة تحكم الطبيب",
    doctor_dashboard_subtitle: "إدارة المرضى وسير العمل السريري",
    my_patients: "مرضاي",
    todays_appointments: "مواعيد اليوم",
    clinical_notes: "الملاحظات السريرية",
    prescriptions: "الوصفات الطبية",
    patient_list: "قائمة المرضى",
    add_prescription: "إضافة وصفة طبية",
    add_clinical_note: "إضافة ملاحظة سريرية",
    chief_complaint: "الشكوى الرئيسية",
    last_visit: "آخر زيارة",
    
    // Donor Dashboard
    donor_dashboard: "لوحة تحكم المتبرع",
    donor_dashboard_subtitle: "دعم رعاية كبار السن من خلال التبرعات",
    equipment_marketplace: "سوق المعدات",
    my_donations: "تبرعاتي",
    donation_history: "سجل التبرعات",
    impact_statistics: "إحصائيات التأثير",
    donate_now: "تبرع الآن",
    total_donated: "إجمالي التبرعات",
    patients_helped: "المرضى المستفيدون",
    pending_requests: "الطلبات المعلقة",
    
    // Table Headers
    name: "الاسم",
    age: "العمر",
    gender: "الجنس",
    type: "النوع",
    severity: "الشدة",
    location: "الموقع",
    specialization: "التخصص",
    equipment: "المعدات",
    urgency: "الأولوية",
    medication: "الدواء",
    dosage: "الجرعة",
    frequency: "التكرار",
    amount: "المبلغ",
    
    // Status
    pending: "قيد الانتظار",
    completed: "مكتمل",
    in_progress: "قيد التنفيذ",
    cancelled: "ملغي",
    confirmed: "مؤكد",
    scheduled: "مجدول",
    fulfilled: "تم التنفيذ",
    active: "نشط",
    inactive: "غير نشط",
    resolved: "تم الحل",
    
    // Priority
    high: "عالي",
    medium: "متوسط",
    low: "منخفض",
    
    // Payment
    payment: "الدفع",
    payment_method: "طريقة الدفع",
    payment_history: "سجل المدفوعات",
    make_payment: "إجراء الدفع",
    credit_card: "بطاقة ائتمان",
    mada_card: "بطاقة مدى",
    apple_pay: "Apple Pay",
    bank_transfer: "تحويل بنكي",
    card_number: "رقم البطاقة",
    expiry_date: "تاريخ الانتهاء",
    cvv: "رمز الأمان",
    cardholder_name: "اسم حامل البطاقة",
    total_amount: "المبلغ الإجمالي",
    processing: "جاري المعالجة...",
    payment_successful: "تم الدفع بنجاح",
    payment_failed: "فشل الدفع",
    sar: "ريال",
    
    // Health
    blood_pressure: "ضغط الدم",
    blood_sugar: "سكر الدم",
    heart_rate: "معدل ضربات القلب",
    weight: "الوزن",
    temperature: "درجة الحرارة",
    oxygen_level: "مستوى الأكسجين",
    
    // Alerts
    fall_detected: "تم اكتشاف سقوط",
    near_fall: "سقوط وشيك",
    emergency: "طوارئ",
    warning: "تحذير",
    info: "معلومات",
    
    // Equipment Categories
    mobility: "التنقل",
    monitoring: "المراقبة",
    safety: "السلامة",
    home_care: "الرعاية المنزلية",
    
    // Misc
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    address: "العنوان",
    relationship: "صلة القرابة",
    hospital: "المستشفى",
    insurance: "التأمين",
    allergies: "الحساسية",
    conditions: "الحالات الصحية",
    fall_risk: "خطر السقوط",
    adherence_rate: "معدل الالتزام",
    next_dose: "الجرعة التالية",
    last_taken: "آخر جرعة",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const isRTL = language === 'ar';

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
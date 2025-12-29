import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  HelpCircle,
  Search,
  Book,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Video,
  Users,
  AlertTriangle,
  Heart,
  Pill,
  Calendar,
  Activity,
  Shield,
  Smartphone,
  CheckCircle
} from 'lucide-react';
import { Card, Button } from '../shared/UIComponents';
import { TablerAlert, TablerInput, TablerBadge } from '../shared/TablerUIComponents';
import { clsx } from 'clsx';

const Help = ({ user }) => {
  const { isRTL, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const faqs = {
    patient: [
      {
        id: 1,
        category: 'medications',
        icon: Pill,
        question: language === 'ar' ? 'كيف أتناول دوائي؟' : 'How do I take my medication?',
        answer: language === 'ar'
          ? 'انتقل إلى صفحة "أدويتي" وانقر على زر "تناول" بجوار الدواء. سيؤدي هذا إلى تحديث تتبع الالتزام وتسجيل وقت تناولك له.'
          : 'Navigate to the "My Medications" page and click the "Take" button next to your medication. This will update your adherence tracking and record the time you took it.'
      },
      {
        id: 2,
        category: 'appointments',
        icon: Calendar,
        question: language === 'ar' ? 'كيف يمكنني حجز موعد؟' : 'How can I book an appointment?',
        answer: language === 'ar'
          ? 'اذهب إلى لوحة التحكم وانقر على "حجز موعد". أدخل التاريخ والوقت وسبب الزيارة، ثم أرسل. ستتلقى إشعارًا بالتأكيد.'
          : 'Go to your dashboard and click "Book Appointment". Fill in the date, time, and reason for visit, then submit. You will receive a confirmation notification.'
      },
      {
        id: 3,
        category: 'health',
        icon: Activity,
        question: language === 'ar' ? 'كيف أضيف قياسات صحية؟' : 'How do I add health metrics?',
        answer: language === 'ar'
          ? 'انقر على "إضافة قياس صحي" في لوحة التحكم. أدخل ضغط الدم ومستويات الجلوكوز أو العلامات الحيوية الأخرى. سيتتبع التطبيق الاتجاهات بمرور الوقت.'
          : 'Click on "Add Health Metric" on your dashboard. Enter your blood pressure, glucose levels, or other vitals. The app will track trends over time.'
      },
      {
        id: 4,
        category: 'equipment',
        icon: Heart,
        question: language === 'ar' ? 'كيف أطلب معدات طبية؟' : 'How do I request medical equipment?',
        answer: language === 'ar'
          ? 'من لوحة التحكم، انقر على "طلب معدات". أدخل تفاصيل المعدات والمبرر الطبي. سيكون طلبك مرئيًا للمتبرعين في السوق.'
          : 'From your dashboard, click "Request Equipment". Fill in the equipment details and medical justification. Your request will be visible to donors in the marketplace.'
      },
      {
        id: 5,
        category: 'medications',
        icon: Pill,
        question: language === 'ar' ? 'ماذا أفعل إذا نسيت تناول دوائي؟' : 'What if I forget to take my medication?',
        answer: language === 'ar'
          ? 'يمكنك تسجيل الجرعة الفائتة في التطبيق. انتقل إلى صفحة الأدوية وانقر على "تسجيل جرعة فائتة". سيتم تحديث معدل الالتزام وفقًا لذلك.'
          : 'You can log the missed dose in the app. Go to the Medications page and click "Log Missed Dose". Your adherence rate will be updated accordingly.'
      },
      {
        id: 6,
        category: 'emergency',
        icon: AlertTriangle,
        question: language === 'ar' ? 'كيف أتصل بجهة الطوارئ؟' : 'How do I contact emergency services?',
        answer: language === 'ar'
          ? 'في حالة الطوارئ، اتصل بالرقم 997 (المملكة العربية السعودية). يمكنك أيضًا استخدام زر "اتصال طوارئ" في ملفك الشخصي للاتصال بجهة الاتصال الطارئة المسجلة.'
          : 'In an emergency, call 997 (Saudi Arabia). You can also use the "Emergency Call" button in your profile to contact your registered emergency contact.'
      },
      {
        id: 7,
        category: 'appointments',
        icon: Calendar,
        question: language === 'ar' ? 'كيف ألغي موعدًا؟' : 'How do I cancel an appointment?',
        answer: language === 'ar'
          ? 'انتقل إلى صفحة المواعيد، ابحث عن الموعد الذي تريد إلغاءه، وانقر على زر "إلغاء". ستتلقى تأكيدًا بالإلغاء.'
          : 'Go to the Appointments page, find the appointment you want to cancel, and click the "Cancel" button. You will receive a cancellation confirmation.'
      },
      {
        id: 8,
        category: 'health',
        icon: FileText,
        question: language === 'ar' ? 'كيف أعرض سجلاتي الطبية؟' : 'How do I view my medical records?',
        answer: language === 'ar'
          ? 'انتقل إلى صفحة "السجلات الطبية" من القائمة. يمكنك البحث وتصفية السجلات حسب التاريخ أو الطبيب أو نوع الزيارة.'
          : 'Navigate to "Medical Records" from the menu. You can search and filter records by date, doctor, or visit type.'
      }
    ],
    family: [
      {
        id: 1,
        category: 'tasks',
        icon: CheckCircle,
        question: language === 'ar' ? 'كيف أضيف مهمة رعاية؟' : 'How do I add a care task?',
        answer: language === 'ar'
          ? 'في لوحة التحكم، انقر على "إضافة مهمة رعاية". أدخل تفاصيل المهمة ومستوى الأولوية وتاريخ الاستحقاق. يمكنك تعيين المهام وتتبع حالة الإكمال.'
          : 'On your dashboard, click "Add Care Task". Enter the task details, priority level, and due date. You can assign tasks and track completion status.'
      },
      {
        id: 2,
        category: 'emergency',
        icon: AlertTriangle,
        question: language === 'ar' ? 'كيف أستجيب لتنبيهات السقوط؟' : 'How do I respond to fall alerts?',
        answer: language === 'ar'
          ? 'عند ظهور تنبيه السقوط، انقر عليه لعرض التفاصيل. اختر إجراءً (الاتصال بالمريض، الاتصال بالطوارئ، تعليم كإنذار كاذب) وأرسل. هذا يسجل استجابتك.'
          : 'When a fall alert appears, click on it to view details. Choose an action (Call Patient, Call Emergency, Mark False Alarm) and submit. This records your response.'
      },
      {
        id: 3,
        category: 'health',
        icon: Activity,
        question: language === 'ar' ? 'كيف يمكنني عرض بيانات صحة المريض؟' : 'How can I view patient health data?',
        answer: language === 'ar'
          ? 'جميع مقاييس صحة المريض والأدوية والمواعيد مرئية في لوحة التحكم. انقر على أقسام محددة للحصول على عروض مفصلة والاتجاهات.'
          : 'All patient health metrics, medications, and appointments are visible on your dashboard. Click on specific sections for detailed views and trends.'
      },
      {
        id: 4,
        category: 'tasks',
        icon: CheckCircle,
        question: language === 'ar' ? 'كيف أحذف مهمة مكتملة؟' : 'How do I delete a completed task?',
        answer: language === 'ar'
          ? 'انقر على أيقونة سلة المهملات بجوار أي مهمة لحذفها. يمكن أيضًا تصفية المهام المكتملة أو أرشفتها للرجوع إليها في المستقبل.'
          : 'Click the trash icon next to any task to delete it. Completed tasks can also be filtered or archived for future reference.'
      }
    ],
    doctor: [
      {
        id: 1,
        category: 'clinical',
        icon: FileText,
        question: language === 'ar' ? 'كيف أضيف ملاحظات سريرية؟' : 'How do I add clinical notes?',
        answer: language === 'ar'
          ? 'من قائمة المرضى، انقر على أيقونة الملاحظة بجوار المريض. أدخل الشكوى الرئيسية والملاحظات السريرية والتشخيص وخطة العلاج، ثم احفظ.'
          : 'From the patient list, click the note icon next to a patient. Fill in the chief complaint, clinical notes, diagnosis, and treatment plan, then save.'
      },
      {
        id: 2,
        category: 'medications',
        icon: Pill,
        question: language === 'ar' ? 'كيف أنشئ وصفة طبية؟' : 'How do I create a prescription?',
        answer: language === 'ar'
          ? 'انقر على أيقونة الوصفة للمريض. أدخل اسم الدواء والجرعة والتكرار والمدة والتعليمات الخاصة. ستُضاف الوصفة تلقائيًا إلى تذكيرات دواء المريض.'
          : 'Click the prescription icon for a patient. Enter medication name, dosage, frequency, duration, and special instructions. The prescription will automatically add to the patient\'s medication reminders.'
      },
      {
        id: 3,
        category: 'appointments',
        icon: Calendar,
        question: language === 'ar' ? 'كيف أجدول المواعيد؟' : 'How do I schedule appointments?',
        answer: language === 'ar'
          ? 'انقر على أيقونة التقويم بجوار المريض أو استخدم الإجراءات السريعة. حدد التاريخ والوقت ونوع الموعد وأضف ملاحظات. سيظهر الموعد في تقويمك وتقويم المريض.'
          : 'Click the calendar icon next to a patient or use Quick Actions. Select date, time, appointment type, and add notes. The appointment will appear in both your and the patient\'s calendars.'
      },
      {
        id: 4,
        category: 'patients',
        icon: Users,
        question: language === 'ar' ? 'كيف أبحث عن المرضى؟' : 'How do I search for patients?',
        answer: language === 'ar'
          ? 'استخدم شريط البحث أعلى قائمة المرضى. يمكنك البحث بالاسم أو رقم المريض أو الحالة الطبية. تتم تصفية النتائج في الوقت الفعلي.'
          : 'Use the search bar above the patient list. You can search by name, patient number, or medical condition. Results filter in real-time.'
      }
    ],
    donor: [
      {
        id: 1,
        category: 'donations',
        icon: Heart,
        question: language === 'ar' ? 'كيف أتبرع؟' : 'How do I make a donation?',
        answer: language === 'ar'
          ? 'تصفح سوق المعدات، حدد طلبًا، وانقر على "تبرع الآن". أكمل عملية الدفع. سيتم تعليم طلب المعدات على أنه مستوفى، وستتلقى إيصالًا.'
          : 'Browse the Equipment Marketplace, select a request, and click "Donate Now". Complete the payment process. The equipment request will be marked as fulfilled, and you\'ll receive a receipt.'
      },
      {
        id: 2,
        category: 'equipment',
        icon: Shield,
        question: language === 'ar' ? 'كيف أصفي طلبات المعدات؟' : 'How do I filter equipment requests?',
        answer: language === 'ar'
          ? 'استخدم القائمة المنسدلة للفئة للتصفية حسب التنقل أو المراقبة أو السلامة أو الرعاية المنزلية. استخدم مرشح الإلحاح لرؤية طلبات الأولوية العالية أو المتوسطة أو المنخفضة.'
          : 'Use the category dropdown to filter by Mobility, Monitoring, Safety, or Home Care. Use the urgency filter to see High, Medium, or Low priority requests.'
      },
      {
        id: 3,
        category: 'donations',
        icon: FileText,
        question: language === 'ar' ? 'كيف يمكنني تتبع تبرعاتي؟' : 'How can I track my donations?',
        answer: language === 'ar'
          ? 'اذهب إلى علامة تبويب "تبرعاتي" لرؤية سجل تبرعاتك الكامل، بما في ذلك التواريخ والمبالغ والمستفيدين وأرقام الإيصالات.'
          : 'Go to "My Donations" tab to see your complete donation history, including dates, amounts, recipients, and receipt numbers.'
      },
      {
        id: 4,
        category: 'impact',
        icon: Activity,
        question: language === 'ar' ? 'كيف أعرض تأثيري؟' : 'How do I view my impact?',
        answer: language === 'ar'
          ? 'انتقل إلى علامة تبويب "إحصائيات التأثير" لرؤية إجمالي تبرعاتك وعدد المرضى الذين تمت مساعدتهم والمعدات المقدمة ومقاييس التأثير على المجتمع.'
          : 'Navigate to the "Impact Statistics" tab to see your total donations, number of patients helped, equipment provided, and community-wide impact metrics.'
      }
    ]
  };

  const categories = [
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All', icon: HelpCircle },
    { id: 'medications', label: language === 'ar' ? 'الأدوية' : 'Medications', icon: Pill },
    { id: 'appointments', label: language === 'ar' ? 'المواعيد' : 'Appointments', icon: Calendar },
    { id: 'health', label: language === 'ar' ? 'الصحة' : 'Health', icon: Activity },
    { id: 'emergency', label: language === 'ar' ? 'الطوارئ' : 'Emergency', icon: AlertTriangle },
    { id: 'equipment', label: language === 'ar' ? 'المعدات' : 'Equipment', icon: Heart },
  ];

  const currentFaqs = faqs[user?.role] || faqs.patient;

  const filteredFaqs = currentFaqs.filter(faq => {
    const matchesSearch = searchTerm === '' ||
      (faq.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.answer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const quickLinks = [
    { icon: Book, title: language === 'ar' ? 'دليل المستخدم' : 'User Guide', description: language === 'ar' ? 'دليل كامل لاستخدام التطبيق' : 'Complete guide to using the app', color: 'blue' },
    { icon: Video, title: language === 'ar' ? 'دروس فيديو' : 'Video Tutorials', description: language === 'ar' ? 'شاهد دروس تعليمية خطوة بخطوة' : 'Watch step-by-step tutorials', color: 'purple' },
    { icon: FileText, title: language === 'ar' ? 'التوثيق' : 'Documentation', description: language === 'ar' ? 'التوثيق التقني' : 'Technical documentation', color: 'green' },
    { icon: Users, title: language === 'ar' ? 'منتدى المجتمع' : 'Community Forum', description: language === 'ar' ? 'انضم إلى مجتمع المستخدمين' : 'Join our user community', color: 'orange' }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  return (
    <div
      className={clsx('p-6 max-w-4xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {language === 'ar' ? 'مركز المساعدة' : 'Help Center'}
            </h1>
            <p className="text-gray-600 text-sm">
              {language === 'ar' ? 'ابحث عن إجابات واحصل على الدعم' : 'Find answers and get support'}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Notice - Prominent for Patients */}
      {user?.role === 'patient' && (
        <TablerAlert
          type="danger"
          important
          icon={Phone}
          title={language === 'ar' ? 'حالة طوارئ؟' : 'Emergency?'}
          className="mb-6 animate-fadeIn"
        >
          <p className="text-sm mb-3">
            {language === 'ar'
              ? 'في حالات الطوارئ الطبية، يرجى الاتصال بالرقم 997 (المملكة العربية السعودية) أو رقم الطوارئ المحلي فورًا.'
              : 'For medical emergencies, please call 997 (Saudi Arabia) or your local emergency number immediately.'}
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => window.location.href = 'tel:997'}
              className="hover:scale-105 transition-transform"
            >
              <Phone className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'اتصل 997' : 'Call 997'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}
            </Button>
          </div>
        </TablerAlert>
      )}

      {/* Search - Enhanced */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-lg">
        <div className="text-center mb-4">
          <h2 className="text-white text-xl font-bold mb-1">
            {language === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
          </h2>
          <p className="text-blue-100 text-sm">
            {language === 'ar' ? 'اكتب سؤالك أدناه للعثور على إجابة سريعة' : 'Type your question below to find a quick answer'}
          </p>
        </div>
        <div className="relative max-w-xl mx-auto">
          <TablerInput
            icon={Search}
            placeholder={language === 'ar' ? 'ابحث عن المساعدة...' : 'Search for help...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow-lg"
            size="lg"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-center text-blue-100 text-sm mt-3">
            {filteredFaqs.length} {language === 'ar' ? 'نتيجة' : 'results'} {language === 'ar' ? 'لـ' : 'for'} &quot;{searchTerm}&quot;
          </p>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {quickLinks.map((link, idx) => (
          <Card
            key={idx}
            className={clsx(
              'hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] border-2',
              colorClasses[link.color]
            )}
          >
            <div className="flex items-start gap-4">
              <div className={clsx('p-3 rounded-xl', `bg-${link.color}-100`)}>
                <link.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          </Card>
        ))}
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQs */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <span>{language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</span>
          </div>
        }
        className="mb-6"
      >
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const FaqIcon = faq.icon || HelpCircle;
            return (
              <div
                key={faq.id}
                className={clsx(
                  'border rounded-xl overflow-hidden transition-all',
                  expandedFaq === faq.id ? 'border-blue-300 shadow-md' : 'border-gray-200'
                )}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 p-4 text-left transition-colors',
                    expandedFaq === faq.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  )}
                >
                  <div className={clsx(
                    'p-2 rounded-lg',
                    expandedFaq === faq.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  )}>
                    <FaqIcon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="p-4 pt-0 bg-gradient-to-b from-blue-50 to-white border-t border-blue-100">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium">
                {language === 'ar' ? 'لم يتم العثور على أسئلة مطابقة' : 'No matching questions found'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'ar' ? 'جرب مصطلحات بحث مختلفة' : 'Try different search terms'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Contact Support */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            <span>{language === 'ar' ? 'الاتصال بالدعم' : 'Contact Support'}</span>
          </div>
        }
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-500 rounded-xl w-fit mb-3">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900">{language === 'ar' ? 'الدعم الهاتفي' : 'Phone Support'}</p>
            <p className="text-xs text-gray-600 mb-3">{language === 'ar' ? 'متاح على مدار الساعة للطوارئ' : 'Available 24/7 for emergencies'}</p>
            <a
              href="tel:+966555399360"
              className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
            >
              +966 555 399 360
            </a>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
            <div className="p-3 bg-green-500 rounded-xl w-fit mb-3">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900">{language === 'ar' ? 'دعم البريد الإلكتروني' : 'Email Support'}</p>
            <p className="text-xs text-gray-600 mb-3">{language === 'ar' ? 'سنرد خلال 24 ساعة' : 'We will respond within 24 hours'}</p>
            <a
              href="mailto:algarainilama@gmail.com"
              className="text-green-600 hover:text-green-800 font-medium text-sm hover:underline"
            >
              algarainilama@gmail.com
            </a>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
            <div className="p-3 bg-purple-500 rounded-xl w-fit mb-3">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900">{language === 'ar' ? 'الدردشة المباشرة' : 'Live Chat'}</p>
            <p className="text-xs text-gray-600 mb-3">{language === 'ar' ? 'تحدث مع فريق الدعم' : 'Chat with our support team'}</p>
            <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
              {language === 'ar' ? 'بدء الدردشة' : 'Start Chat'}
            </Button>
          </div>
        </div>
      </Card>

      {/* App Information */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>{language === 'ar' ? 'حول هذا التطبيق' : 'About This App'}</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Innovative Geriatrics Medical App</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {language === 'ar'
                ? 'تطبيق طبي مخصص لتلبية الاحتياجات الفريدة لمجتمع كبار السن، يركز على معالجة مشاكلهم وإيجاد حلول مصممة خصيصًا للسياق السعودي.'
                : 'A dedicated medical app tailored to the unique needs of the elderly community, focused on addressing their issues and finding solutions that are specifically designed for the Saudi context.'}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dr. Lama Algaraini</p>
                <p className="text-sm text-gray-600">Medical Intern | MNGHA</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">{language === 'ar' ? 'الإصدار:' : 'Version:'}</span> 1.0.0
              </div>
              <div>
                <span className="font-medium">{language === 'ar' ? 'آخر تحديث:' : 'Last Updated:'}</span> December 2024
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">{language === 'ar' ? 'الميزات الرئيسية' : 'Key Features'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                language === 'ar' ? 'السجلات الطبية المركزية' : 'Centralized Medical Records',
                language === 'ar' ? 'تذكيرات الأدوية مع التعرف بالذكاء الاصطناعي' : 'Medication Reminders with AI Recognition',
                language === 'ar' ? 'لوحة تحكم العائلة لتنسيق الرعاية' : 'Family Dashboard for Care Coordination',
                language === 'ar' ? 'اكتشاف السقوط وتنبيهات الطوارئ' : 'Fall Detection and Emergency Alerts',
                language === 'ar' ? 'سوق التبرع بالمعدات المجهول' : 'Anonymous Equipment Donation Marketplace',
                language === 'ar' ? 'تتبع الصحة الإدراكية' : 'Cognitive Health Tracking',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <TablerBadge variant="success" size="sm">
                    <CheckCircle className="w-3 h-3" />
                  </TablerBadge>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Help;

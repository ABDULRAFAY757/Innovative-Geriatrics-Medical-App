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
  Users
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../shared/UIComponents';
import { clsx } from 'clsx';

const Help = ({ user }) => {
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = {
    patient: [
      {
        id: 1,
        question: 'How do I take my medication?',
        answer: 'Navigate to the "My Medications" page and click the "Take" button next to your medication. This will update your adherence tracking and record the time you took it.'
      },
      {
        id: 2,
        question: 'How can I book an appointment?',
        answer: 'Go to your dashboard and click "Book Appointment". Fill in the date, time, and reason for visit, then submit. You\'ll receive a confirmation notification.'
      },
      {
        id: 3,
        question: 'How do I add health metrics?',
        answer: 'Click on "Add Health Metric" on your dashboard. Enter your blood pressure, glucose levels, or other vitals. The app will track trends over time.'
      },
      {
        id: 4,
        question: 'How do I request medical equipment?',
        answer: 'From your dashboard, click "Request Equipment". Fill in the equipment details and medical justification. Your request will be visible to donors in the marketplace.'
      }
    ],
    family: [
      {
        id: 1,
        question: 'How do I add a care task?',
        answer: 'On your dashboard, click "Add Care Task". Enter the task details, priority level, and due date. You can assign tasks and track completion status.'
      },
      {
        id: 2,
        question: 'How do I respond to fall alerts?',
        answer: 'When a fall alert appears, click on it to view details. Choose an action (Call Patient, Call Emergency, Mark False Alarm) and submit. This records your response.'
      },
      {
        id: 3,
        question: 'How can I view patient health data?',
        answer: 'All patient health metrics, medications, and appointments are visible on your dashboard. Click on specific sections for detailed views and trends.'
      },
      {
        id: 4,
        question: 'How do I delete a completed task?',
        answer: 'Click the trash icon next to any task to delete it. Completed tasks can also be filtered or archived for future reference.'
      }
    ],
    doctor: [
      {
        id: 1,
        question: 'How do I add clinical notes?',
        answer: 'From the patient list, click the note icon next to a patient. Fill in the chief complaint, clinical notes, diagnosis, and treatment plan, then save.'
      },
      {
        id: 2,
        question: 'How do I create a prescription?',
        answer: 'Click the prescription icon for a patient. Enter medication name, dosage, frequency, duration, and special instructions. The prescription will automatically add to the patient\'s medication reminders.'
      },
      {
        id: 3,
        question: 'How do I schedule appointments?',
        answer: 'Click the calendar icon next to a patient or use Quick Actions. Select date, time, appointment type, and add notes. The appointment will appear in both your and the patient\'s calendars.'
      },
      {
        id: 4,
        question: 'How do I search for patients?',
        answer: 'Use the search bar above the patient list. You can search by name, patient number, or medical condition. Results filter in real-time.'
      }
    ],
    donor: [
      {
        id: 1,
        question: 'How do I make a donation?',
        answer: 'Browse the Equipment Marketplace, select a request, and click "Donate Now". Complete the payment process. The equipment request will be marked as fulfilled, and you\'ll receive a receipt.'
      },
      {
        id: 2,
        question: 'How do I filter equipment requests?',
        answer: 'Use the category dropdown to filter by Mobility, Monitoring, Safety, or Home Care. Use the urgency filter to see High, Medium, or Low priority requests.'
      },
      {
        id: 3,
        question: 'How can I track my donations?',
        answer: 'Go to "My Donations" tab to see your complete donation history, including dates, amounts, recipients, and receipt numbers.'
      },
      {
        id: 4,
        question: 'How do I view my impact?',
        answer: 'Navigate to the "Impact Statistics" tab to see your total donations, number of patients helped, equipment provided, and community-wide impact metrics.'
      }
    ]
  };

  const currentFaqs = faqs[user?.role] || faqs.patient;
  const filteredFaqs = searchTerm
    ? currentFaqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentFaqs;

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const quickLinks = [
    { icon: Book, title: 'User Guide', description: 'Complete guide to using the app', link: '#' },
    { icon: Video, title: 'Video Tutorials', description: 'Watch step-by-step tutorials', link: '#' },
    { icon: FileText, title: 'Documentation', description: 'Technical documentation', link: '#' },
    { icon: Users, title: 'Community Forum', description: 'Join our user community', link: '#' }
  ];

  return (
    <div
      className={clsx('p-6 max-w-4xl mx-auto', isRTL && 'font-arabic')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-600 mt-1">Find answers and get support</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="relative">
          <Input
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
            className="w-full"
          />
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {quickLinks.map((link, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <link.icon className="w-6 h-6 text-blue-600" />
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

      {/* FAQs */}
      <Card title="Frequently Asked Questions" icon={HelpCircle} className="mb-6">
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <div className="p-4 pt-0 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No matching questions found</p>
              <p className="text-sm">Try different search terms</p>
            </div>
          )}
        </div>
      </Card>

      {/* Contact Support */}
      <Card title="Contact Support" className="mb-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Phone Support</p>
              <p className="text-sm text-gray-600 mb-2">Available 24/7 for emergencies</p>
              <a href="tel:+966555399360" className="text-blue-600 hover:underline">
                +966 555 399 360
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email Support</p>
              <p className="text-sm text-gray-600 mb-2">We&apos;ll respond within 24 hours</p>
              <a href="mailto:algarainilama@gmail.com" className="text-green-600 hover:underline">
                algarainilama@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Live Chat</p>
              <p className="text-sm text-gray-600 mb-2">Chat with our support team</p>
              <Button variant="outline" size="sm" className="mt-2">
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* App Information */}
      <Card title="About This App">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Innovative Geriatrics Medical App</h3>
            <p className="text-gray-600 text-sm">
              A dedicated medical app tailored to the unique needs of the elderly community,
              focused on addressing their issues and finding solutions that are specifically
              designed for the Saudi context.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Developed by:</strong> Dr. Lama Algaraini
            </p>
            <p className="text-sm text-gray-600">Medical Intern | MNGHA</p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Version:</strong> 1.0.0
            </p>
            <p className="text-sm text-gray-600">
              <strong>Last Updated:</strong> December 2024
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Badge variant="success" size="sm">✓</Badge>
                Centralized Medical Records
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="success" size="sm">✓</Badge>
                Medication Reminders with AI Recognition
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="success" size="sm">✓</Badge>
                Family Dashboard for Care Coordination
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="success" size="sm">✓</Badge>
                Fall Detection and Emergency Alerts
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="success" size="sm">✓</Badge>
                Anonymous Equipment Donation Marketplace
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="success" size="sm">✓</Badge>
                Cognitive Health Tracking
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Emergency Notice */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Phone className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-900">Emergency?</p>
            <p className="text-sm text-red-700 mb-2">
              For medical emergencies, please call 997 (Saudi Arabia) or your local emergency number immediately.
            </p>
            <Button variant="danger" size="sm">
              Call Emergency Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

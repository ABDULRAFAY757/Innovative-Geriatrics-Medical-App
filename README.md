# Innovative Geriatrics - Elderly Care Platform

Professional elderly care management platform for Saudi Arabia with bilingual support (English/Arabic).

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Demo Access

Visit the login page and **click any role card** to auto-fill credentials:

| Role | Email | Password |
|------|-------|----------|
| **Patient** | patient1@elderly.sa | patient123 |
| **Doctor** | doctor1@kfmc.sa | doctor123 |
| **Family** | family1@gmail.com | family123 |
| **Donor** | donor1@charity.sa | donor123 |

## Features

### Patient Portal
- 💊 Medication management and adherence tracking
- 📅 Appointment booking and management
- 🏥 Equipment requests with payment processing
- 📊 Health metrics dashboard

### Doctor Portal
- 👥 Patient management with clinical records
- 📝 Clinical notes and SOAP documentation
- 💊 Prescription management (auto-adds to patient meds)
- 📅 Appointment scheduling with video call support

### Family Portal
- ✅ Care task management (add, complete, delete)
- 🚨 Fall alert response system (4 action types)
- 👴 Patient monitoring for assigned family members
- 📊 Health summary and medication adherence

### Donor Portal
- 🎁 Equipment marketplace with filtering
- 💳 Secure donation processing
- 📈 Donation history and impact tracking
- 🏆 Tax receipts and acknowledgments

## Technology Stack

- **React 18.2** - UI Framework
- **React Router v6** - Routing with protection
- **Tailwind CSS 3.3** - Styling
- **Vite 5.x** - Build tool
- **Context API** - State management
- **Lucide React** - Icons

## Security

✅ **Role-Based Access Control (RBAC)** - 4 distinct roles with specific permissions
✅ **Attribute-Based Access Control (ABAC)** - Context-aware access decisions
✅ **Protected Routes** - All sensitive routes authenticated
✅ **Session Management** - 30-minute timeout with auto-logout
✅ **Error Boundaries** - Global error handling

## Project Structure

```
Medical/
├── src/
│   ├── components/
│   │   ├── Auth/              # ModernLogin, ProtectedRoute
│   │   ├── Dashboards/        # 4 role-specific dashboards
│   │   ├── Pages/             # 12 feature pages
│   │   ├── shared/            # Reusable UI components
│   │   └── Layout/            # Header navigation
│   ├── contexts/
│   │   ├── AuthContext.jsx    # RBAC + ABAC auth system
│   │   ├── AppContext.jsx     # Global state management
│   │   └── LanguageContext.jsx # i18n support
│   ├── data/
│   │   └── mockData.js        # Rich mock dataset
│   ├── App.jsx                # Route configuration
│   ├── main.jsx               # Entry point with ErrorBoundary
│   └── index.css              # Desktop-optimized CSS
├── index.html                 # SEO-optimized HTML
└── package.json
```

## Accessibility

✅ WCAG 2.1 compliant
✅ Keyboard navigation support
✅ ARIA labels and semantic HTML
✅ Focus indicators and trapping
✅ High contrast support
✅ Large fonts for elderly users

## Localization

🌐 Bilingual support (English/Arabic)
📱 Full RTL layout for Arabic
🔄 Dynamic language switching

## Author

**Mr. Khaled Bin Salman**
AI Engineer

---

© 2024 Innovative Geriatrics. All rights reserved.

**Note**: Demo application with mock data. Not for production healthcare use.

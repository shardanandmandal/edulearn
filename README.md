# EduLearn • Protected Video & Document Classroom Portal

A production-ready, modern learning platform built with **Node.js, Express, React 19, Tailwind CSS, and Lucide Icons**. Inspired by Udemy, Coursera, and modern LMS platforms, it allows instructors to upload class videos and study documents, protect them from unauthorized downloading, and monetize them using **dynamic UPI QR Code payments**.

---

## 🚀 Key Features

### 1. 🛡️ Strict Anti-Download & DRM Content Protection
- **Video Protection:** Custom HTML5 video player with custom UI controls. Direct downloads, right-click context menu, developer inspect shortcuts, and save page shortcuts (`Ctrl+S`, `Ctrl+P`, `F12`) are strictly disabled.
- **Dynamic Floating Watermark:** Learner's email, User ID, and live timestamp drift continuously across video playback and document pages. If anyone attempts a screen capture, their identity is permanently stamped on the recording.
- **HTTP 206 Partial Content Streaming:** Videos are served via authenticated, byte-range chunked streaming (`/api/content/stream/video/...`) with headers `Content-Disposition: inline`, `X-Content-Type-Options: nosniff`, and `Cache-Control: no-store`.
- **In-Browser Document Reader:** Class notes and handouts are rendered in an interactive, distraction-free reader with zoom controls and code syntax styling. Text selection is disabled (`user-select: none`) and `@media print` rules prevent printing.

### 2. 📱 Dynamic UPI QR Code Payment Gateway
- Generates a **real-time high-resolution UPI QR Code** (compatible with Google Pay, PhonePe, Paytm, BHIM, Cred, and all UPI apps).
- Automatically encodes the exact discounted price, merchant UPI ID, payee business name, and transaction reference.
- **1-Click Copy UPI ID** and mobile UPI app intent links.
- **Instant Access Mode:** Student submits the 12-digit UPI Reference Number / UTR, and the system automatically verifies and unlocks the classroom with celebratory confetti!
- **Manual Audit Queue:** Instructor can also switch to manual approval mode in settings and approve/reject transactions with 1 click.

### 3. 👨‍🏫 Instructor / Admin Studio
- **Course Publishing:** Create courses with title, subtitle, markdown description, pricing (original & discount), category, hashtags (e.g. `#FullStack`, `#Python`, `#ReactJS`), and custom thumbnail upload.
- **Curriculum & Materials Builder:** Upload video lectures (`.mp4`, `.webm`) and study documents (`.pdf`, `.txt`, `.md`, or rich notes). Configure duration, section titles, and "Free Preview" toggle.
- **Payment Approvals Queue:** Live audit list of all incoming student transactions, UTR numbers, amounts, and one-click course unlock.
- **Gateway Settings:** Customize Merchant UPI ID (VPA), payee business name, instant approval toggle, and support details.

### 4. 🎓 Student Experience & Profiles
- **Catalog Explorer:** Filter by category, live search by topic, and 1-click filter by trending hashtags.
- **Course Curriculum Previews:** Preview free sample lectures and review the complete syllabus.
- **Student Profile Management:** Edit student full name, bio, phone number, and password.
- **My Learning Dashboard:** Track progress percentage across enrolled courses with a 1-click "Resume Learning" button.
- **Q&A Doubt Discussion:** Students can submit lecture-specific questions to the instructor.

---

## 🔐 Environment Variables & Security Configuration

Create a `.env` file in the root or `backend/` directory with the following variables:

```env
# Required: Secure secret key for signing authentication tokens
JWT_SECRET=your_super_strong_random_jwt_secret_here

# Optional: Comma-separated list of allowed CORS origins (default: same origin only)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Optional: Initial Administrator credentials (used on first start if no admin exists)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password_min_8_chars

# Port configuration (default: 5000)
PORT=5000

# Environment mode (production disables any mock user seeds)
NODE_ENV=production
```

---

## 💻 How to Run the Platform

### Backend Server (Port 5000)
```bash
cd backend
npm install
node server.js
```
- API Base: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### Frontend Application (Port 3000)
```bash
cd frontend
npm install
npm run dev -- --port 3000 --host
```
- Web Portal: `http://localhost:3000`

---

## 📂 Project Structure

```
coursehub-platform/
├── backend/
│   ├── data/
│   │   └── store.json          # Persistent database store
│   ├── middleware/
│   │   └── auth.js             # JWT & query-token stream auth
│   ├── routes/
│   │   ├── admin.js            # Course CRUD, file upload, QR settings
│   │   ├── auth.js             # Login, register, profile
│   │   ├── content.js          # Anti-download video streaming & docs
│   │   ├── courses.js          # Catalog, syllabus, classroom progress
│   │   └── payments.js         # Dynamic QR code & UTR submission
│   ├── uploads/
│   │   ├── documents/          # Uploaded class notes & PDFs
│   │   ├── thumbnails/         # Course thumbnail images
│   │   └── videos/             # Uploaded lecture video files
│   ├── database.js             # File-backed database engine
│   ├── package.json
│   └── server.js               # Express application
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminDashboard.jsx     # Instructor control center
    │   │   ├── AuthModal.jsx          # Login & registration modal
    │   │   ├── Classroom.jsx          # Protected player & document reader
    │   │   ├── CourseCard.jsx         # Modern card with hashtags & ratings
    │   │   ├── CourseDetailModal.jsx  # Syllabus & enrollment modal
    │   │   ├── Hero.jsx               # Hero banner with hashtag pills
    │   │   ├── Navbar.jsx             # Top bar with search & switcher
    │   │   ├── PaymentQRModal.jsx     # Dynamic UPI QR code modal
    │   │   ├── StudentDashboard.jsx   # My Courses & Profile editor
    │   │   └── WatermarkOverlay.jsx   # Anti-screencast moving watermark
    │   ├── context/
    │   │   └── AuthContext.jsx        # User session & state management
    │   ├── services/
    │   │   └── api.js                 # Unified API client
    │   ├── App.jsx                    # Root application component
    │   ├── index.css                  # Tailwind styles & security rules
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

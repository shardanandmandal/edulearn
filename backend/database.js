const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, 'data', 'store.json');

// Default initial database state
const getDefaultData = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  let users = [];
  let enrollments = [];
  let payments = [];

  if (isProduction) {
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      users.push({
        id: 'usr-admin-' + Date.now(),
        name: 'Administrator',
        email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
        password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
        bio: 'Platform Administrator',
        phone: '',
        createdAt: new Date().toISOString()
      });
    }
  } else {
    const adminHashedPassword = bcrypt.hashSync('admin123', 10);
    const studentHashedPassword = bcrypt.hashSync('student123', 10);
    users = [
      {
        id: 'usr-admin-1',
        name: 'Prof. Aryan Sharma',
        email: 'admin@edulearn.com',
        password: adminHashedPassword,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
        bio: 'Senior Technical Educator, Ex-Google Lead Architect with 12+ years of teaching excellence.',
        phone: '+91 98765 43210',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-student-1',
        name: 'Rahul Verma',
        email: 'student@edulearn.com',
        password: studentHashedPassword,
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
        bio: 'Computer Science student passionate about Full-Stack Engineering and Systems.',
        phone: '+91 99887 76655',
        createdAt: new Date().toISOString()
      }
    ];
    enrollments = [
      {
        id: 'enr-1',
        studentId: 'usr-student-1',
        courseId: 'crs-1',
        enrolledAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        completedLessons: ['lsn-101', 'lsn-102'],
        lastAccessedLessonId: 'lsn-103'
      }
    ];
    payments = [
      {
        id: 'pay-1',
        studentId: 'usr-student-1',
        studentName: 'Rahul Verma',
        studentEmail: 'student@edulearn.com',
        courseId: 'crs-1',
        courseTitle: 'Full-Stack Web Development Mastery (2026)',
        amount: 499,
        currency: 'INR',
        status: 'approved',
        utrNumber: 'UPI429012398451',
        paymentMethod: 'UPI_QR',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        approvedAt: new Date(Date.now() - 86400000 * 2 + 10000).toISOString()
      }
    ];
  }

  return {
    settings: {
      upiId: 'teacher@okaxis',
      payeeName: 'Prof. Aryan Sharma Classes',
      currency: 'INR',
      currencySymbol: '₹',
      instantAccessMode: true, // Auto-unlock upon UTR entry, with audit log
      supportEmail: 'support@edulearnportal.com',
      supportPhone: '+91 98765 43210',
      welcomeNotice: 'Special 50% discount on all video lectures & class notes!'
    },
    users,
    courses: [
      {
        id: 'crs-1',
        title: 'Full-Stack Web Development Mastery (2026)',
        slug: 'full-stack-web-development-mastery',
        subtitle: 'Build production-ready React, Node.js, Next.js, and Cloud native applications from scratch.',
        description: `Master modern full-stack web engineering with industry-grade architectures. This comprehensive course covers modern front-end styling, interactive state management, robust REST & GraphQL APIs, secure JWT/OAuth authentications, microservices, and database tuning.

### What you will learn:
- End-to-end full stack workflows with React 19 and Node.js
- State architecture, Hooks, Context, and Optimistic UI updates
- High-throughput Express REST services and SQLite/PostgreSQL caching
- Anti-theft content protection patterns, video streaming with byte ranges
- Production deployment on AWS/Vercel with CI/CD automation

All video lectures and lecture notes are protected for in-browser high-definition reading and viewing.`,
        price: 999,
        discountPrice: 499,
        currency: 'INR',
        category: 'Web Development',
        hashtags: ['#FullStack', '#ReactJS', '#NodeJS', '#WebDev', '#JavaScript', '#Frontend'],
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
        previewVideoUrl: '/uploads/videos/sample_lecture.mp4',
        level: 'Intermediate',
        language: 'Hinglish / English',
        features: [
          '32+ HD Streamable Video Lectures',
          '45+ Download-Protected Class Handouts & PDFs',
          'Live UPI QR Code Instant Checkout',
          'Certificate of Completion',
          'Access on Desktop & Mobile browser'
        ],
        isPublished: true,
        instructorName: 'Prof. Aryan Sharma',
        rating: 4.9,
        reviewsCount: 342,
        enrolledCount: 1280,
        createdAt: new Date().toISOString()
      },
      {
        id: 'crs-2',
        title: 'Data Structures & Algorithms: Zero to FAANG Hero',
        slug: 'data-structures-and-algorithms-zero-to-hero',
        subtitle: 'Master complex algorithmic problems, dynamic programming, graphs, and system design interviews.',
        description: `Crack top-tier product company interviews with structured visual breakdowns of DSA concepts. Covers Trees, DP, Graphs, Trie, Sliding Window, and Backtracking with hand-drawn visual notes and annotated walkthroughs.

### Course Highlights:
- 150+ Handpicked LeetCode Medium & Hard problem breakdowns
- Step-by-step space & time complexity visualizations
- In-browser reading materials with line-by-line algorithm code
- Dedicated Q&A support for doubt resolution`,
        price: 1499,
        discountPrice: 799,
        currency: 'INR',
        category: 'Computer Science',
        hashtags: ['#DSA', '#Python', '#Algorithms', '#LeetCode', '#CodingInterview', '#FAANG'],
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=450&fit=crop',
        previewVideoUrl: '/uploads/videos/sample_lecture.mp4',
        level: 'All Levels',
        language: 'English',
        features: [
          '40+ Interactive Problem Walkthroughs',
          'Visual Mindmaps & Formula Cheat Sheets',
          'Protected Classroom Document Reader',
          'Mock Interview Readiness Checklist'
        ],
        isPublished: true,
        instructorName: 'Prof. Aryan Sharma',
        rating: 4.85,
        reviewsCount: 512,
        enrolledCount: 2450,
        createdAt: new Date().toISOString()
      },
      {
        id: 'crs-3',
        title: 'Generative AI & LLM App Development Masterclass',
        slug: 'generative-ai-llm-masterclass',
        subtitle: 'Build autonomous AI agents, RAG pipelines, fine-tuned models, and vector search systems.',
        description: `Learn how to architect, evaluate, and ship production-ready Generative AI systems. We dive deep into LangChain, LlamaIndex, vector databases (Chroma, Pinecone), embeddings, function calling, and structured outputs.

### Key Highlights:
- Production Retrieval Augmented Generation (RAG)
- Multi-agent orchestration and tool calling
- Evaluation matrices and guardrails
- Full class slides, architecture blueprints, and code notebooks viewable in reader`,
        price: 1999,
        discountPrice: 999,
        currency: 'INR',
        category: 'Artificial Intelligence',
        hashtags: ['#GenAI', '#LLM', '#MachineLearning', '#Python', '#AI', '#DeepLearning'],
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop',
        previewVideoUrl: '/uploads/videos/sample_lecture.mp4',
        level: 'Advanced',
        language: 'English',
        features: [
          '28+ Deep-dive Video Modules',
          'RAG Architecture Design Blueprints',
          'Vector Indexing Formula Notes',
          'Lifetime In-Portal Stream Access'
        ],
        isPublished: true,
        instructorName: 'Prof. Aryan Sharma',
        rating: 4.95,
        reviewsCount: 189,
        enrolledCount: 890,
        createdAt: new Date().toISOString()
      }
    ],
    lessons: [
      // Lessons for crs-1
      {
        id: 'lsn-101',
        courseId: 'crs-1',
        sectionTitle: 'Module 1: Architecture & Foundation',
        title: '01. Welcome & Full-Stack System Design Overview',
        order: 1,
        duration: '18 min',
        type: 'video',
        videoUrl: '/uploads/videos/sample_lecture.mp4',
        documentUrl: '',
        documentContent: '',
        isFreePreview: true,
        summary: 'Overview of the course roadmap, architectural layers (Client, Gateway, Business Logic, Cache, DB), and how modern distributed apps work.'
      },
      {
        id: 'lsn-102',
        courseId: 'crs-1',
        sectionTitle: 'Module 1: Architecture & Foundation',
        title: '02. Complete Course Blueprint & Study Notes (Document)',
        order: 2,
        duration: '25 min read',
        type: 'document',
        videoUrl: '',
        documentUrl: '',
        documentContent: `# Full-Stack System Design Architecture Blueprint

## 1. High-Level System Architecture
Modern web applications separate concerns across clean, isolated layers:
- **Presentation Layer (Client):** Single Page Applications (React, Vite, Next.js) executing inside the user's browser runtime.
- **API Gateway & Routing Layer:** Reverse proxies, token verification, rate limiters, and CORS controllers.
- **Application Services Layer:** Express / Node.js handlers implementing domain business logic and validation.
- **Persistence & Cache Layer:** ACID-compliant databases paired with in-memory caching stores for ultra-low latency response cycles.

## 2. Media Streaming Protocol (Byte-Range Requests)
To ensure smooth video playback without downloading complete media files upfront:
1. The browser initiates a \`GET\` request with an \`Accept-Ranges: bytes\` header.
2. The server acknowledges with \`HTTP 206 Partial Content\` and responds with a slice specified by \`Content-Range: bytes START-END/TOTAL\`.
3. The browser media pipeline buffers chunks just-in-time into an internal MediaSource buffer.
4. Direct raw URLs are shielded behind session-aware tokens to prevent unauthorized automated crawlers.

## 3. Copyright Protection and DRM Strategies
- **Dynamic Session Watermarks:** Floating learner identifiers (email, IP hash, timestamp) deter unauthorized screencasting.
- **Context-Menu Shielding:** Native context menus and developer inspection keys are intercepted.
- **Print Screen Deterrence:** Stylesheet print rules invalidate document captures.
- **Read-Only In-Browser Rendering:** Documents are delivered via secured canvas/text renderer instead of binary downloadable links.

> *Instructor Note: Review these foundational principles thoroughly before proceeding to Section 2.*`,
        isFreePreview: true,
        summary: 'Detailed architecture blueprint and reference study notes explaining high-level system layers and streaming mechanisms.'
      },
      {
        id: 'lsn-103',
        courseId: 'crs-1',
        sectionTitle: 'Module 2: React 19 & Component Architecture',
        title: '03. Advanced Hooks, State Machines & Performance',
        order: 3,
        duration: '24 min',
        type: 'video_document',
        videoUrl: '/uploads/videos/sample_lecture.mp4',
        documentUrl: '',
        documentContent: `# Lecture 03: React 19 State Patterns & Performance Optimization

### Key Concepts Covered:
- **useActionState** and **useOptimistic** hooks for frictionless form workflows.
- Eliminating unnecessary re-renders using immutable memory state references.
- Debounced search queries and live filtering algorithms.

\`\`\`javascript
// Example: Safe Event Propagation & State Isolation
const handleUpdate = async (formData) => {
  setOptimisticState(prev => ({ ...prev, loading: true }));
  const res = await api.submit(formData);
  // sync state with backend payload
};
\`\`\`

### Student Checkpoint:
- Make sure to review the state diagram in the accompanying video lesson!`,
        isFreePreview: false,
        summary: 'Deep dive into React 19 concurrency, optimistic UI updates, and memory-efficient rendering.'
      },
      {
        id: 'lsn-104',
        courseId: 'crs-1',
        sectionTitle: 'Module 2: React 19 & Component Architecture',
        title: '04. Building Secure Media & Document Viewers',
        order: 4,
        duration: '31 min',
        type: 'video',
        videoUrl: '/uploads/videos/sample_lecture.mp4',
        documentUrl: '',
        documentContent: '',
        isFreePreview: false,
        summary: 'Implementation walkthrough of the custom video player, progress tracking, and secure document display.'
      },
      {
        id: 'lsn-105',
        courseId: 'crs-1',
        sectionTitle: 'Module 3: Backend APIs & Security',
        title: '05. JWT Authentication, RBAC & Protection Protocols (Notes)',
        order: 5,
        duration: '30 min read',
        type: 'document',
        videoUrl: '',
        documentUrl: '',
        documentContent: `# Module 3: Authentication and Security Architecture

## Token-Based Authentication Architecture
JsonWebTokens (JWT) provide stateless authentication across distributed web clusters:
- **Header:** Specifies hashing algorithm (e.g. HS256).
- **Payload:** Encodes user claims (\`userId\`, \`role\`, \`exp\`).
- **Signature:** Cryptographic verification key ensuring payload integrity.

### Role-Based Access Control (RBAC) Matrix:
| Role | View Course Catalog | Watch Free Previews | Access Enrolled Lessons | Upload Media | Approve Payments |
|---|---|---|---|---|---|
| Guest | Yes | Yes | No | No | No |
| Enrolled Student | Yes | Yes | Yes | No | No |
| Instructor / Admin | Yes | Yes | Yes | Yes | Yes |

### Anti-Leech Video Stream Verification
Every media request to \`/api/stream/video/:courseId/:lessonId\` undergoes strict multi-tier verification:
1. Extraction of the bearer token or query token.
2. Verification against the enrollment database table.
3. Range-header parsing and dynamic byte pipe delivery.

*Remember: Never store sensitive credentials in client-side localStorage without expiration boundaries.*`,
        isFreePreview: false,
        summary: 'Comprehensive notes on JWT, authorization middleware, role-based permissions, and anti-leech stream verification.'
      },
      // Lessons for crs-2
      {
        id: 'lsn-201',
        courseId: 'crs-2',
        sectionTitle: 'Module 1: Algorithmic Foundations',
        title: '01. Asymptotic Complexity & Master Theorem Breakdown',
        order: 1,
        duration: '22 min',
        type: 'video',
        videoUrl: '/uploads/videos/sample_lecture.mp4',
        documentUrl: '',
        documentContent: '',
        isFreePreview: true,
        summary: 'Understand Big-O, Big-Theta, Big-Omega, recurrence relations, and amortized complexity.'
      },
      {
        id: 'lsn-202',
        courseId: 'crs-2',
        sectionTitle: 'Module 1: Algorithmic Foundations',
        title: '02. Master Cheat Sheet: 50 Core Algorithms & Patterns (Notes)',
        order: 2,
        duration: '40 min read',
        type: 'document',
        videoUrl: '',
        documentUrl: '',
        documentContent: `# Data Structures & Algorithms Core Patterns Cheat Sheet

## 1. Sliding Window Pattern
**When to use:** Contiguous subarray or substring problems looking for maximum, minimum, or target sums.
- *Time Complexity:* O(N)
- *Space Complexity:* O(1) or O(K) for hash map frequency counters.

## 2. Two Pointers Pattern
**When to use:** Sorted arrays where you need to find pairs, partitions, or palindrome checks.
- Left pointer at 0, Right pointer at N-1.
- Move inwards based on comparison logic.

## 3. Fast and Slow Pointers (Floyd's Tortoise and Hare)
**When to use:** Cycle detection in linked lists or directed state sequences.
- Slow pointer advances 1 step.
- Fast pointer advances 2 steps.
- Collision signifies cycle existence.

## 4. Top K Elements (Heaps)
- Max-Heap for finding K smallest items.
- Min-Heap for finding K largest items.
- Complexity: O(N log K).`,
        isFreePreview: true,
        summary: 'Essential pattern cheat sheet for quick revision before coding interviews.'
      },
      // Lessons for crs-3
      {
        id: 'lsn-301',
        courseId: 'crs-3',
        sectionTitle: 'Module 1: Introduction to Modern LLMs',
        title: '01. Transformer Architecture, Attention & Vector Embeddings',
        order: 1,
        duration: '28 min',
        type: 'video',
        videoUrl: '/uploads/videos/sample_lecture.mp4',
        documentUrl: '',
        documentContent: '',
        isFreePreview: true,
        summary: 'Understanding self-attention mechanisms, tokenization pipelines, high-dimensional vector spaces, and cosine similarity.'
      },
      {
        id: 'lsn-302',
        courseId: 'crs-3',
        sectionTitle: 'Module 1: Introduction to Modern LLMs',
        title: '02. Enterprise RAG Pipeline Handbook (Document)',
        order: 2,
        duration: '35 min read',
        type: 'document',
        videoUrl: '',
        documentUrl: '',
        documentContent: `# Enterprise RAG (Retrieval-Augmented Generation) Architecture

## 1. The Ingestion Pipeline
1. **Document Loading:** Ingesting PDFs, DOCX, Markdown, and transcripts.
2. **Chunking Strategies:** Recursive character splitting with token-aware overlaps (e.g., 512 tokens with 64 overlap).
3. **Embedding Computation:** Generating dense vectors using state-of-the-art embedding models.
4. **Vector Database Storage:** Indexing with HNSW (Hierarchical Navigable Small World) for sub-10ms nearest-neighbor lookups.

## 2. The Retrieval & Re-ranking Phase
- Hybrid search (BM25 lexical search + dense vector semantic search).
- Cross-encoder re-ranking to filter out hallucination hazards.
- Prompt injection defenses and PII masking.`,
        isFreePreview: true,
        summary: 'Full production architectural blueprint for high-accuracy RAG systems.'
      }
    ],
    enrollments,
    payments
  };
};

class Database {
  constructor() {
    this.ensureDataFile();
    this.initAdminUser();
  }

  ensureDataFile() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getDefaultData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  }

  initAdminUser() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(DATA_FILE)) return;
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const db = JSON.parse(content);
      const hasAdmin = (db.users || []).some(u => u.role === 'admin');
      if (!hasAdmin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        db.users = db.users || [];
        db.users.push({
          id: 'usr-admin-' + Date.now(),
          name: 'Administrator',
          email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
          password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
          bio: 'Platform Administrator',
          phone: '',
          createdAt: new Date().toISOString()
        });
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('Error in initAdminUser:', e);
    }
  }

  read() {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading database file:', err);
      return getDefaultData();
    }
  }

  write(data) {
    try {
      this.ensureDataFile();
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error writing database file:', err);
      return false;
    }
  }

  // Users
  getUsers() {
    return this.read().users || [];
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const db = this.read();
    const newUser = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      ...userData,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    this.write(db);
    return newUser;
  }

  updateUser(id, updates) {
    const db = this.read();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    db.users[index] = { ...db.users[index], ...updates, updatedAt: new Date().toISOString() };
    this.write(db);
    return db.users[index];
  }

  // Courses
  getCourses() {
    return this.read().courses || [];
  }

  getCourseById(id) {
    return this.getCourses().find(c => c.id === id || c.slug === id);
  }

  createCourse(courseData) {
    const db = this.read();
    const id = 'crs-' + Date.now();
    const slug = (courseData.title || 'course')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const newCourse = {
      id,
      slug,
      rating: 5.0,
      reviewsCount: 1,
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
      ...courseData
    };
    db.courses.push(newCourse);
    this.write(db);
    return newCourse;
  }

  updateCourse(id, updates) {
    const db = this.read();
    const index = db.courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    db.courses[index] = { ...db.courses[index], ...updates, updatedAt: new Date().toISOString() };
    this.write(db);
    return db.courses[index];
  }

  deleteCourse(id) {
    const db = this.read();
    const index = db.courses.findIndex(c => c.id === id);
    if (index === -1) return false;
    db.courses.splice(index, 1);
    // remove associated lessons
    db.lessons = db.lessons.filter(l => l.courseId !== id);
    this.write(db);
    return true;
  }

  // Lessons
  getLessonsByCourseId(courseId) {
    const lessons = (this.read().lessons || []).filter(l => l.courseId === courseId);
    return lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getLessonById(id) {
    return (this.read().lessons || []).find(l => l.id === id);
  }

  createLesson(lessonData) {
    const db = this.read();
    const newLesson = {
      id: 'lsn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      order: (db.lessons.filter(l => l.courseId === lessonData.courseId).length + 1),
      ...lessonData,
      createdAt: new Date().toISOString()
    };
    db.lessons.push(newLesson);
    this.write(db);
    return newLesson;
  }

  updateLesson(id, updates) {
    const db = this.read();
    const index = db.lessons.findIndex(l => l.id === id);
    if (index === -1) return null;
    db.lessons[index] = { ...db.lessons[index], ...updates, updatedAt: new Date().toISOString() };
    this.write(db);
    return db.lessons[index];
  }

  deleteLesson(id) {
    const db = this.read();
    const index = db.lessons.findIndex(l => l.id === id);
    if (index === -1) return false;
    db.lessons.splice(index, 1);
    this.write(db);
    return true;
  }

  // Enrollments
  getEnrollments() {
    return this.read().enrollments || [];
  }

  getEnrollmentsByUserId(studentId) {
    return this.getEnrollments().filter(e => e.studentId === studentId);
  }

  isEnrolled(studentId, courseId) {
    if (!studentId || !courseId) return false;
    return this.getEnrollments().some(e => e.studentId === studentId && e.courseId === courseId);
  }

  createEnrollment(studentId, courseId) {
    const db = this.read();
    const existing = db.enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (existing) return existing;

    const newEnrollment = {
      id: 'enr-' + Date.now(),
      studentId,
      courseId,
      enrolledAt: new Date().toISOString(),
      completedLessons: [],
      lastAccessedLessonId: null
    };
    db.enrollments.push(newEnrollment);

    // Increment enrolledCount on course
    const course = db.courses.find(c => c.id === courseId);
    if (course) {
      course.enrolledCount = (course.enrolledCount || 0) + 1;
    }

    this.write(db);
    return newEnrollment;
  }

  toggleLessonComplete(studentId, courseId, lessonId) {
    const db = this.read();
    let enrollment = db.enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (!enrollment) {
      enrollment = {
        id: 'enr-' + Date.now(),
        studentId,
        courseId,
        enrolledAt: new Date().toISOString(),
        completedLessons: [],
        lastAccessedLessonId: lessonId
      };
      db.enrollments.push(enrollment);
    }

    enrollment.completedLessons = enrollment.completedLessons || [];
    const index = enrollment.completedLessons.indexOf(lessonId);
    if (index > -1) {
      enrollment.completedLessons.splice(index, 1);
    } else {
      enrollment.completedLessons.push(lessonId);
    }
    enrollment.lastAccessedLessonId = lessonId;
    this.write(db);
    return enrollment;
  }

  // Payments
  getPayments() {
    return (this.read().payments || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createPayment(paymentData) {
    const db = this.read();
    const newPayment = {
      id: 'pay-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...paymentData
    };
    db.payments.push(newPayment);
    this.write(db);
    return newPayment;
  }

  updatePaymentStatus(id, status) {
    const db = this.read();
    const payment = db.payments.find(p => p.id === id);
    if (!payment) return null;
    payment.status = status;
    payment.approvedAt = status === 'approved' ? new Date().toISOString() : null;

    if (status === 'approved') {
      // Auto enroll student
      const exists = db.enrollments.find(e => e.studentId === payment.studentId && e.courseId === payment.courseId);
      if (!exists) {
        db.enrollments.push({
          id: 'enr-' + Date.now(),
          studentId: payment.studentId,
          courseId: payment.courseId,
          enrolledAt: new Date().toISOString(),
          completedLessons: [],
          lastAccessedLessonId: null
        });
        const course = db.courses.find(c => c.id === payment.courseId);
        if (course) {
          course.enrolledCount = (course.enrolledCount || 0) + 1;
        }
      }
    }
    this.write(db);
    return payment;
  }

  // Settings
  getSettings() {
    return this.read().settings || {};
  }

  updateSettings(updates) {
    const db = this.read();
    db.settings = { ...db.settings, ...updates, updatedAt: new Date().toISOString() };
    this.write(db);
    return db.settings;
  }
}

module.exports = new Database();

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { requireAdmin } = require('../middleware/auth');

// Setup Multer Storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = path.join(__dirname, '..', 'uploads');
    if (file.fieldname === 'video') {
      dest = path.join(dest, 'videos');
    } else if (file.fieldname === 'document') {
      dest = path.join(dest, 'documents');
    } else if (file.fieldname === 'thumbnail') {
      dest = path.join(dest, 'thumbnails');
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit for local video uploads
});

// Protect all admin routes
router.use(requireAdmin);

// 1. Dashboard Overview Stats
router.get('/stats', (req, res) => {
  try {
    const courses = db.getCourses();
    const users = db.getUsers();
    const students = users.filter(u => u.role === 'student');
    const payments = db.getPayments();
    const enrollments = db.getEnrollments();

    const approvedPayments = payments.filter(p => p.status === 'approved');
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;

    res.json({
      success: true,
      stats: {
        totalCourses: courses.length,
        totalStudents: students.length,
        totalRevenue,
        pendingPaymentsCount,
        totalEnrollments: enrollments.length
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
});

// 2. Course Management (Create Course)
router.post('/courses', upload.single('thumbnail'), (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      price,
      discountPrice,
      category,
      hashtags,
      level,
      language,
      features,
      isPublished
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, message: 'Title and price are required.' });
    }

    // Process hashtags: support JSON array or comma-separated string
    let parsedHashtags = [];
    if (typeof hashtags === 'string') {
      parsedHashtags = hashtags
        .split(',')
        .map(h => h.trim())
        .filter(Boolean)
        .map(h => (h.startsWith('#') ? h : `#${h}`));
    } else if (Array.isArray(hashtags)) {
      parsedHashtags = hashtags.map(h => (h.startsWith('#') ? h : `#${h}`));
    }

    // Process features
    let parsedFeatures = [];
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (e) {
        parsedFeatures = features.split('\n').map(f => f.trim()).filter(Boolean);
      }
    } else if (Array.isArray(features)) {
      parsedFeatures = features;
    }

    let thumbnailUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop';
    if (req.file) {
      thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
    } else if (req.body.thumbnailUrl) {
      thumbnailUrl = req.body.thumbnailUrl;
    }

    const newCourse = db.createCourse({
      title: title.trim(),
      subtitle: subtitle || '',
      description: description || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : Number(price),
      currency: 'INR',
      category: category || 'General',
      hashtags: parsedHashtags.length > 0 ? parsedHashtags : ['#OnlineLearning', '#Courses'],
      thumbnail: thumbnailUrl,
      previewVideoUrl: '/uploads/videos/sample_lecture.mp4',
      level: level || 'All Levels',
      language: language || 'English',
      features: parsedFeatures.length > 0 ? parsedFeatures : [
        'Protected In-Browser Video Stream',
        'Download-Restricted Class Documents',
        'Lifetime Access & Discussion Support'
      ],
      isPublished: isPublished === 'true' || isPublished === true,
      instructorName: req.user.name
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully!',
      course: newCourse
    });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ success: false, message: 'Failed to create course.' });
  }
});

// Update Course
router.put('/courses/:id', upload.single('thumbnail'), (req, res) => {
  try {
    const courseId = req.params.id;
    const existing = db.getCourseById(courseId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const updates = { ...req.body };

    if (updates.price) updates.price = Number(updates.price);
    if (updates.discountPrice) updates.discountPrice = Number(updates.discountPrice);

    if (updates.hashtags && typeof updates.hashtags === 'string') {
      updates.hashtags = updates.hashtags
        .split(',')
        .map(h => h.trim())
        .filter(Boolean)
        .map(h => (h.startsWith('#') ? h : `#${h}`));
    }

    if (updates.features && typeof updates.features === 'string') {
      try {
        updates.features = JSON.parse(updates.features);
      } catch (e) {
        updates.features = updates.features.split('\n').map(f => f.trim()).filter(Boolean);
      }
    }

    if (req.file) {
      updates.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    if (updates.isPublished !== undefined) {
      updates.isPublished = updates.isPublished === 'true' || updates.isPublished === true;
    }

    const updated = db.updateCourse(courseId, updates);
    res.json({ success: true, message: 'Course updated successfully!', course: updated });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ success: false, message: 'Failed to update course.' });
  }
});

// Delete Course
router.delete('/courses/:id', (req, res) => {
  try {
    const success = db.deleteCourse(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    res.json({ success: true, message: 'Course deleted successfully.' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete course.' });
  }
});

// 3. Lesson / Material Upload & Management
router.post(
  '/courses/:id/lessons',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const courseId = req.params.id;
      const course = db.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found.' });
      }

      const {
        title,
        sectionTitle,
        type,
        duration,
        isFreePreview,
        documentContent,
        summary
      } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, message: 'Lesson title is required.' });
      }

      let videoUrl = '';
      if (req.files && req.files.video && req.files.video[0]) {
        videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
      } else if (req.body.videoUrl) {
        videoUrl = req.body.videoUrl;
      } else if (type === 'video' || type === 'video_document') {
        // Fallback to sample video so instructor can immediately test streaming
        videoUrl = '/uploads/videos/sample_lecture.mp4';
      }

      let documentUrl = '';
      let finalDocContent = documentContent || '';

      if (req.files && req.files.document && req.files.document[0]) {
        const docFile = req.files.document[0];
        documentUrl = `/uploads/documents/${docFile.filename}`;
        // If it's a text/markdown file, read its content for in-browser viewer
        if (docFile.mimetype.includes('text') || docFile.originalname.endsWith('.md') || docFile.originalname.endsWith('.txt')) {
          try {
            finalDocContent = fs.readFileSync(docFile.path, 'utf-8');
          } catch (e) {
            console.error('Error reading uploaded document:', e);
          }
        } else {
          finalDocContent = `## Uploaded Document: ${docFile.originalname}\n\nThis material is protected for reading on the portal. Instructor has attached this class file.`;
        }
      }

      const newLesson = db.createLesson({
        courseId,
        sectionTitle: sectionTitle || 'General Lectures',
        title: title.trim(),
        duration: duration || (type === 'document' ? '15 min read' : '20 min'),
        type: type || 'video',
        videoUrl,
        documentUrl,
        documentContent: finalDocContent,
        isFreePreview: isFreePreview === 'true' || isFreePreview === true,
        summary: summary || ''
      });

      res.status(201).json({
        success: true,
        message: 'Lesson and materials uploaded successfully!',
        lesson: newLesson
      });
    } catch (err) {
      console.error('Lesson upload error:', err);
      res.status(500).json({ success: false, message: 'Failed to upload lesson.' });
    }
  }
);

// Delete Lesson
router.delete('/lessons/:id', (req, res) => {
  try {
    const success = db.deleteLesson(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }
    res.json({ success: true, message: 'Lesson deleted successfully.' });
  } catch (err) {
    console.error('Delete lesson error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete lesson.' });
  }
});

// 4. Payments Queue Management
router.get('/payments', (req, res) => {
  try {
    const payments = db.getPayments();
    res.json({ success: true, payments });
  } catch (err) {
    console.error('Admin payments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

// Approve / Reject Payment
router.put('/payments/:id/status', (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const updated = db.updatePaymentStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    res.json({
      success: true,
      message: `Payment has been ${status}! Course access ${status === 'approved' ? 'unlocked for student' : 'withheld'}.`,
      payment: updated
    });
  } catch (err) {
    console.error('Payment status update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update payment status.' });
  }
});

// 5. System & QR Settings
router.get('/settings', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
  }
});

router.put('/settings', (req, res) => {
  try {
    const { upiId, payeeName, currencySymbol, instantAccessMode, supportEmail, supportPhone } = req.body;
    const updates = {};
    if (upiId) updates.upiId = upiId.trim();
    if (payeeName) updates.payeeName = payeeName.trim();
    if (currencySymbol) updates.currencySymbol = currencySymbol.trim();
    if (instantAccessMode !== undefined) updates.instantAccessMode = Boolean(instantAccessMode);
    if (supportEmail) updates.supportEmail = supportEmail.trim();
    if (supportPhone) updates.supportPhone = supportPhone.trim();

    const updated = db.updateSettings(updates);
    res.json({ success: true, message: 'Payment gateway settings updated successfully!', settings: updated });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

module.exports = router;

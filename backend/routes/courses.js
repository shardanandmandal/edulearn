const express = require('express');
const router = express.Router();
const db = require('../database');
const { optionalAuth, requireAuth } = require('../middleware/auth');

// Get all courses (public catalog)
router.get('/', optionalAuth, (req, res) => {
  try {
    const { search, tag, category } = req.query;
    let courses = db.getCourses().filter(c => c.isPublished);

    if (search) {
      const q = search.toLowerCase();
      courses = courses.filter(c => 
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.hashtags && c.hashtags.some(h => h.toLowerCase().includes(q)))
      );
    }

    if (tag) {
      const targetTag = tag.startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
      courses = courses.filter(c => 
        c.hashtags && c.hashtags.some(h => h.toLowerCase() === targetTag)
      );
    }

    if (category && category !== 'All') {
      courses = courses.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }

    // Attach lesson count, duration, and enrollment state
    const userId = req.user ? req.user.id : null;
    const enriched = courses.map(course => {
      const lessons = db.getLessonsByCourseId(course.id);
      const isEnrolled = userId ? (req.user.role === 'admin' || db.isEnrolled(userId, course.id)) : false;
      return {
        ...course,
        totalLessons: lessons.length,
        videoCount: lessons.filter(l => l.type === 'video' || l.type === 'video_document').length,
        documentCount: lessons.filter(l => l.type === 'document' || l.type === 'video_document').length,
        isEnrolled
      };
    });

    res.json({ success: true, courses: enriched });
  } catch (err) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
  }
});

// Get single course details & syllabus
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const course = db.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const userId = req.user ? req.user.id : null;
    const isEnrolled = userId ? (req.user.role === 'admin' || db.isEnrolled(userId, course.id)) : false;
    const allLessons = db.getLessonsByCourseId(course.id);

    // If student is not enrolled, hide full document contents and non-preview video streaming paths
    const sanitizedLessons = allLessons.map(l => {
      if (isEnrolled || l.isFreePreview) {
        return l;
      }
      return {
        id: l.id,
        courseId: l.courseId,
        sectionTitle: l.sectionTitle,
        title: l.title,
        order: l.order,
        duration: l.duration,
        type: l.type,
        isFreePreview: false,
        summary: l.summary,
        locked: true
      };
    });

    res.json({
      success: true,
      course,
      lessons: sanitizedLessons,
      isEnrolled,
      totalLessons: allLessons.length
    });
  } catch (err) {
    console.error('Fetch course detail error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch course details.' });
  }
});

// Get enrolled classroom content (Protected Classroom View)
router.get('/:id/learn', requireAuth, (req, res) => {
  try {
    const course = db.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const isEnrolled = req.user.role === 'admin' || db.isEnrolled(req.user.id, course.id);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You have not enrolled in this course yet. Please complete purchase to access the classroom.'
      });
    }

    const lessons = db.getLessonsByCourseId(course.id);
    const enrollment = db.getEnrollmentsByUserId(req.user.id).find(e => e.courseId === course.id);

    res.json({
      success: true,
      course,
      lessons,
      enrollment: enrollment || { completedLessons: [] }
    });
  } catch (err) {
    console.error('Classroom access error:', err);
    res.status(500).json({ success: false, message: 'Failed to load classroom.' });
  }
});

// Toggle lesson completion progress
router.post('/:id/progress', requireAuth, (req, res) => {
  try {
    const { lessonId } = req.body;
    const courseId = req.params.id;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'lessonId is required.' });
    }

    const enrollment = db.toggleLessonComplete(req.user.id, courseId, lessonId);
    res.json({
      success: true,
      enrollment
    });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update progress.' });
  }
});

// Get all enrolled courses for logged in student
router.get('/student/my-learning', requireAuth, (req, res) => {
  try {
    const enrollments = db.getEnrollmentsByUserId(req.user.id);
    const myCourses = enrollments.map(enr => {
      const course = db.getCourseById(enr.courseId);
      if (!course) return null;
      const lessons = db.getLessonsByCourseId(course.id);
      const completedCount = (enr.completedLessons || []).length;
      const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

      return {
        ...course,
        enrolledAt: enr.enrolledAt,
        completedLessons: enr.completedLessons || [],
        totalLessons: lessons.length,
        progressPercent,
        lastAccessedLessonId: enr.lastAccessedLessonId || (lessons[0] ? lessons[0].id : null)
      };
    }).filter(Boolean);

    res.json({ success: true, myCourses });
  } catch (err) {
    console.error('My learning error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses.' });
  }
});

module.exports = router;

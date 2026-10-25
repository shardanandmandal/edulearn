const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

// Helper to authenticate request from Authorization header OR query parameter (?token=...)
const authenticateRequest = (req) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return db.getUserById(decoded.id);
  } catch (err) {
    return null;
  }
};

// Anti-download Protected Video Stream Endpoint
// Supports full HTTP 206 Byte-Range streaming
router.get('/stream/video/:courseId/:lessonId', (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const lesson = db.getLessonById(lessonId);

    if (!lesson || lesson.courseId !== courseId) {
      return res.status(404).send('Lesson not found.');
    }

    const user = authenticateRequest(req);

    // Permission check: Must be free preview OR student must be enrolled OR user is admin
    const isEnrolled = user && (user.role === 'admin' || db.isEnrolled(user.id, courseId));
    if (!lesson.isFreePreview && !isEnrolled) {
      return res.status(403).send('Access denied. Please purchase the course to stream this video.');
    }

    // Resolve video file path
    let videoFilePath = null;
    if (lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/videos/')) {
      const fileName = path.basename(lesson.videoUrl);
      const candidate = path.join(__dirname, '..', 'uploads', 'videos', fileName);
      if (fs.existsSync(candidate)) {
        videoFilePath = candidate;
      }
    }

    // Fallback to sample lecture if file doesn't exist
    if (!videoFilePath) {
      const fallback = path.join(__dirname, '..', 'uploads', 'videos', 'sample_lecture.mp4');
      if (fs.existsSync(fallback)) {
        videoFilePath = fallback;
      }
    }

    if (!videoFilePath || !fs.existsSync(videoFilePath)) {
      return res.status(404).send('Video stream resource unavailable.');
    }

    const stat = fs.statSync(videoFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Strict Anti-Download Headers
    res.setHeader('Content-Disposition', 'inline; filename="lecture_stream.mp4"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        return;
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoFilePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes'
      };
      res.writeHead(200, head);
      fs.createReadStream(videoFilePath).pipe(res);
    }
  } catch (err) {
    console.error('Video streaming error:', err);
    res.status(500).send('Streaming error.');
  }
});

// Protected Document Content Endpoint
router.get('/document/:courseId/:lessonId', (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const lesson = db.getLessonById(lessonId);

    if (!lesson || lesson.courseId !== courseId) {
      return res.status(404).json({ success: false, message: 'Document lesson not found.' });
    }

    const user = authenticateRequest(req);
    const isEnrolled = user && (user.role === 'admin' || db.isEnrolled(user.id, courseId));

    if (!lesson.isFreePreview && !isEnrolled) {
      return res.status(403).json({ success: false, message: 'Access denied. Please purchase the course to read this document.' });
    }

    // Set anti-download and cache prevention headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Return structured document content for in-browser viewer
    res.json({
      success: true,
      lessonId: lesson.id,
      title: lesson.title,
      sectionTitle: lesson.sectionTitle,
      content: lesson.documentContent || 'Document content is being prepared by the instructor.',
      watermark: {
        viewerEmail: user ? user.email : 'Preview Learner',
        viewerName: user ? user.name : 'Guest User',
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        copyrightNotice: '© EduLearn Portal. Strictly Licensed. Copying, recording or redistribution is illegal.'
      }
    });
  } catch (err) {
    console.error('Document content error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve document.' });
  }
});

// Dynamic Watermark Metadata Endpoint
router.get('/watermark-info', (req, res) => {
  const user = authenticateRequest(req);
  res.json({
    email: user ? user.email : 'Preview Session',
    userId: user ? user.id : 'guest',
    name: user ? user.name : 'Guest Viewer',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

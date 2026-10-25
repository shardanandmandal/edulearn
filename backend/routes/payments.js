const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

// Generate Dynamic UPI QR Code for a Course
router.get('/generate-qr/:courseId', requireAuth, async (req, res) => {
  try {
    const course = db.getCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const settings = db.getSettings();
    const upiId = settings.upiId || 'teacher@okaxis';
    const payeeName = settings.payeeName || 'Prof. Aryan Sharma';
    const amount = course.discountPrice || course.price;
    const note = `Course: ${course.title.substring(0, 25)}`;

    // Standard UPI Intent URL
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    // Generate high resolution QR code PNG Data URL
    const qrDataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      qrDataUrl,
      upiUri,
      upiId,
      payeeName,
      amount,
      currency: settings.currency || 'INR',
      currencySymbol: settings.currencySymbol || '₹',
      courseTitle: course.title,
      courseId: course.id,
      instantAccessMode: settings.instantAccessMode !== false
    });
  } catch (err) {
    console.error('QR code generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate payment QR code.' });
  }
});

// Submit UPI Transaction ID / UTR
router.post('/submit-utr', requireAuth, (req, res) => {
  try {
    const { courseId, utrNumber, note } = req.body;

    if (!courseId || !utrNumber) {
      return res.status(400).json({ success: false, message: 'Course ID and UPI Transaction/UTR number are required.' });
    }

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length < 6) {
      return res.status(400).json({ success: false, message: 'Please enter a valid UPI Reference / UTR Number (minimum 6 digits/characters).' });
    }

    const course = db.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Check if already enrolled
    if (db.isEnrolled(req.user.id, courseId)) {
      return res.json({
        success: true,
        alreadyEnrolled: true,
        message: 'You already have access to this course! Taking you to the classroom.'
      });
    }

    const settings = db.getSettings();
    const isInstant = settings.instantAccessMode !== false;
    const amount = course.discountPrice || course.price;

    const payment = db.createPayment({
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      courseId: course.id,
      courseTitle: course.title,
      amount,
      currency: settings.currency || 'INR',
      utrNumber: cleanUtr,
      note: note || '',
      paymentMethod: 'UPI_QR',
      status: isInstant ? 'approved' : 'pending',
      approvedAt: isInstant ? new Date().toISOString() : null
    });

    if (isInstant) {
      db.createEnrollment(req.user.id, course.id);
    }

    res.json({
      success: true,
      instantUnlocked: isInstant,
      payment,
      message: isInstant
        ? 'Payment verified successfully! You now have full access to the course.'
        : 'Payment reference submitted! Your course access will be unlocked shortly upon instructor verification.'
    });
  } catch (err) {
    console.error('Submit UTR error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit payment transaction.' });
  }
});

// Get student's transaction history
router.get('/my-history', requireAuth, (req, res) => {
  try {
    const payments = db.getPayments().filter(p => p.studentId === req.user.id);
    res.json({ success: true, payments });
  } catch (err) {
    console.error('Fetch student payments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history.' });
  }
});

module.exports = router;

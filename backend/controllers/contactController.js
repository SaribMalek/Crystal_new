const pool = require('../config/db');
const { sendContactNotificationEmail } = require('../services/emailService');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, status)
       VALUES (?, ?, ?, ?, ?, 'new')`,
      [name, email, phone || null, subject || 'General enquiry', message]
    );

    await sendContactNotificationEmail({ name, email, phone, subject, message });

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Your message has been sent successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

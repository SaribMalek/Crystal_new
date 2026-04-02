let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  nodemailer = null;
}

const hasSmtpConfig = () =>
  Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

const getTransporter = () => {
  if (!nodemailer || !hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[email skipped] ${subject} -> ${to}`);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

exports.sendOrderPlacedEmail = async ({ email, name, orderNumber, total }) => {
  if (!email) return;
  await sendMail({
    to: email,
    subject: `Order confirmed: ${orderNumber}`,
    html: `
      <h2>Thank you for your purchase, ${name || 'Customer'}.</h2>
      <p>Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
      <p>Total amount: <strong>Rs. ${Number(total || 0).toLocaleString('en-IN')}</strong></p>
      <p>We will send you another update when the order is dispatched and delivered.</p>
    `,
  });
};

exports.sendOrderStatusEmail = async ({ email, name, orderNumber, status, trackingNumber }) => {
  if (!email) return;

  const statusLabels = {
    confirmed: 'confirmed',
    processing: 'now being prepared',
    shipped: 'dispatched',
    delivered: 'delivered',
    cancelled: 'cancelled',
  };

  const trackingHtml = trackingNumber
    ? `<p>Tracking number: <strong>${trackingNumber}</strong></p>`
    : '';

  await sendMail({
    to: email,
    subject: `Order ${orderNumber} update: ${status}`,
    html: `
      <h2>Hello ${name || 'Customer'},</h2>
      <p>Your order <strong>${orderNumber}</strong> is ${statusLabels[status] || status}.</p>
      ${trackingHtml}
      <p>Thank you for shopping with AS Crystal.</p>
    `,
  });
};

exports.sendContactNotificationEmail = async ({ name, email, phone, subject, message }) => {
  const adminEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!adminEmail) return;

  await sendMail({
    to: adminEmail,
    subject: `New contact enquiry: ${subject || 'General enquiry'}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || '-'}</p>
      <p><strong>Subject:</strong> ${subject || 'General enquiry'}</p>
      <p><strong>Message:</strong></p>
      <p>${String(message || '').replace(/\n/g, '<br/>')}</p>
    `,
  });
};

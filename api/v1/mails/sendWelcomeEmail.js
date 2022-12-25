const { nodeEnv, mailFallback, mailSupport } = require('../configs/env');
const sendEmail = require('../configs/nodemailer');

const sendWelcomeEmail = (email, name) => {
  const subject = 'Welcome to My App!';
  const html = `
      <p>Hello ${name},</p>
      <p>Thank you for joining My App! We're excited to have you on board.</p>
      <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team at ${mailSupport}.</p>
      <p>We hope you enjoy using My App!</p>
      <p>Best regards,</p>
      <p>The My App Team</p>
    `;

  if (nodeEnv === 'production') sendEmail(email, subject, html);
  else sendEmail(mailFallback, subject, html);
};

module.exports = sendWelcomeEmail;

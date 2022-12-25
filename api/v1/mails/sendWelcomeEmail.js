const { mailSupport, appName } = require('../configs/env');
const sendEmail = require('../configs/nodemailer');

module.exports = (email, name) => {
  const subject = `Welcome to ${appName}!`;
  const html = `
    <p>Hello ${name},</p>
    <p>Thank you for joining ${appName}! We're excited to have you on board.</p>
    <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team at ${mailSupport}.</p>
    <p>We hope you enjoy using ${appName}!</p>
    <p>Best regards,</p>
    <p>The ${appName} Team</p>
  `;

  sendEmail(email, subject, html);
};

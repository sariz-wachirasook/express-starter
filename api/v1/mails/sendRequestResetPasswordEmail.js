const { resetPasswordURL, resetPasswordExpires, appName } = require('../configs/env')
const sendEmail = require('../configs/nodemailer')

module.exports = (email, name, token) => {
  const subject = 'Reset Your Password'
  const expires = parseInt(resetPasswordExpires, 10)
  const html = `
    <p>Hello ${name},</p>
    <p>You recently requested to reset your password for your ${appName} account. Click the button below to reset it.</p>
    <p><a href="${resetPasswordURL}/${token}">Reset Password</a></p>
    <p>If you didn't request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next ${expires} hours.</p>
    <p>Best regards,</p>
    <p>${appName} Team</p>
  `

  sendEmail(email, subject, html)
}

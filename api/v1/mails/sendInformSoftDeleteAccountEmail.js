const { appName } = require('../configs/env')
const sendEmail = require('../configs/nodemailer')
const { monthDayYearFormat } = require('../utils/utils')

module.exports = (email, name, next30Day) => {
  const subject = 'Account Delete Request'

  const html = `
    <p>Hello ${name},</p>
    <p>We have received your request to delete your account.</p>
    <p>Your account will be deleted in ${monthDayYearFormat(next30Day)}.</p>
    <p>If you did not request to delete your account, please contact us immediately.</p>
    <p>Thank you for using ${appName}.</p>
    <p>Best regards,</p>
    <p>${appName} Team</p>
  `

  sendEmail(email, subject, html)
}

const nodemailer = require('nodemailer');
const {
  mailFrom,
  mailUser,
  mailPass,
  mailPort,
  mailHost,
  appName,
  nodeEnv,
  mailFallback,
} = require('./env');

module.exports = (to, subject, body) => {
  if (!to || !subject || !body) return console.log('Missing email parameters!');
  if (!mailFrom || !mailUser || !mailPass || !mailPort || !mailHost) {
    return console.log('Missing mail config!');
  }

  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  });

  const mailOptions = {
    from: `${appName} <${mailFrom}>`,
    to: nodeEnv === 'production' ? to : mailFallback,
    subject,
    html: body,
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

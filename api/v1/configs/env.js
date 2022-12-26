const { env } = process;

module.exports = {
  appName: env.APP_NAME,
  appPort: env.APP_PORT || 3000,
  appEnv: env.APP_ENV || 'development',

  JWTSecret: env.JWT_SECRET,
  JWTExpires: env.JWT_EXPIRES || '1h',
  JWTRefreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET,
  JWTRefreshTokenExpires: env.JWT_REFRESH_TOKEN_EXPIRES || '30d',

  mailHost: env.MAIL_HOST,
  mailPort: env.MAIL_PORT,
  mailUser: env.MAIL_USER,
  mailPass: env.MAIL_PASS,
  mailFrom: env.MAIL_FROM,
  mailFallback: env.MAIL_FALLBACK,
  mailSupport: env.MAIL_SUPPORT,

  resetPasswordExpires: env.RESET_PASSWORD_EXPIRES || '1h',
  resetPasswordTokenLength: env.RESET_PASSWORD_TOKEN_LENGTH || 32,
  resetPasswordURL: env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password',
};

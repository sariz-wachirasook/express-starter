const { env } = process;

module.exports = {
  JWTSecret: env.JWT_SECRET,
  JWTExpires: env.JWT_EXPIRES || '1h',
  JWTRefreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET,
  JWTRefreshTokenExpires: env.JWT_REFRESH_TOKEN_EXPIRES || '30d',
};

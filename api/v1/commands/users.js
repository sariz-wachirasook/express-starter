const prisma = require('../configs/prisma')

// do not use function outside cronjob
module.exports = {
  deleteUser: async () => {
    await prisma.user.deleteMany({
      where: {
        OR: [
          {
            deletedAt: {
              lte: new Date()
            }
          }
        ],
        NOT: {
          deletedAt: null
        }
      }
    })
  },

  deleteRefreshToken: async () => {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lte: new Date()
        }
      }
    })
  },

  deleteResetPasswordToken: async () => {
    await prisma.resetPasswordToken.deleteMany({
      where: {
        expiresAt: {
          lte: new Date()
        }
      }
    })
  }
}

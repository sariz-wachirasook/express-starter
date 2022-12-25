const prisma = require('../configs/prisma');

// do not use function outside cronjob
module.exports = {
  deleteUser: async () => {
    await prisma.user.deleteMany({
      where: {
        OR: [
          {
            deletedAt: {
              lte: new Date(),
            },
          },
        ],
        NOT: {
          deletedAt: null,
        },
      },
    });
  },
};

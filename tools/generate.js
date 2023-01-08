const bcrypt = require('bcrypt');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { env } = process;

const init = async () => {
  // create default locale
  const defaultLocale = await prisma.locale.findUnique({
    where: {
      code: 'en_US',
    },
  });

  if (!defaultLocale) {
    await prisma.locale.create({
      data: {
        code: 'en_US',
        name: 'English',
      },
    });
  }

  // create default user
  const defaultUser = await prisma.user.findUnique({
    where: {
      email: env.ADMIN_EMAIL,
    },
  });

  if (!defaultUser) {
    if (!env.ADMIN_NAME || !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
      console.error(
        'Admin user not created. Please provide ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env file'
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

    await prisma.user.create({
      data: {
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'ADMINISTRATOR',
      },
    });
  }
};

init();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../configs/prisma');
const {
  JWTSecret,
  JWTRefreshTokenSecret,
  JWTExpires,
  JWTRefreshTokenExpires,
} = require('../configs/env');
const sendWelcomeEmail = require('../mails/sendWelcomeEmail');

module.exports = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          password: true,
          role: true,
        },
      });

      if (!user) res.status(401).send({ message: 'Invalid email or password' });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) res.status(401).send({ message: 'Invalid email or password' });

      const date = new Date();
      const token = jwt.sign(
        {
          email: user.email,
          role: user.role,
        },
        JWTSecret,
        { expiresIn: JWTExpires },
      );

      const refreshToken = jwt.sign({ email: user.email }, JWTRefreshTokenSecret, {
        expiresIn: JWTRefreshTokenExpires,
      });

      await prisma.refreshToken.upsert({
        where: {
          token: refreshToken,
        },
        create: {
          token: refreshToken,
          expiresAt: new Date(date.setDate(date.getDate() + parseInt(JWTRefreshTokenExpires, 10))),
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        update: {
          token: refreshToken,
          expiresAt: new Date(date.setDate(date.getDate() + parseInt(JWTRefreshTokenExpires, 10))),
        },
      });

      res.send({ token, refreshToken });
    } catch (err) {
      next(err);
    }
  },

  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) return res.status(400).send({ message: 'Email is already in use' });

      const hashedPassword = await bcrypt.hash(password, 10);

      const data = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          role: true,
        },
      });

      sendWelcomeEmail(data.email, data.name);

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      const token = await prisma.refreshToken.findUnique({
        where: {
          token: refreshToken,
        },
        select: {
          id: true,
          token: true,
          expiresAt: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      if (!token) return res.status(401).send({ message: 'Invalid refresh token' });

      const date = new Date();
      if (date > token.expiresAt) return res.status(401).send({ message: 'Refresh token expired' });

      const newToken = jwt.sign({ email: token.user.email, role: token.user.role }, JWTSecret, {
        expiresIn: JWTExpires,
      });
      const newRefreshToken = await prisma.refreshToken.update({
        where: {
          id: token.id,
        },
        data: {
          token: jwt.sign({ email: token.user.email }, JWTRefreshTokenSecret, {
            expiresIn: JWTRefreshTokenExpires,
          }),
          expiresAt: new Date(date.setDate(date.getDate() + parseInt(JWTRefreshTokenExpires, 10))),
        },
      });

      return res.send({ token: newToken, refreshToken: newRefreshToken.token });
    } catch (err) {
      return next(err);
    }
  },
};

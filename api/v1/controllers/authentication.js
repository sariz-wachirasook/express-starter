const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../configs/prisma');
const { JWTSecret, JWTRefreshTokenSecret, JWTExpires, JWTRefreshTokenExpires } = require('../configs/env');

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
        },
      });

      if (!user) res.status(401).send({ message: 'Invalid email or password' });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) res.status(401).send({ message: 'Invalid email or password' });

      const date = new Date();
      const token = jwt.sign({ email: user.email }, JWTSecret, { expiresIn: JWTExpires });
      const refreshToken = await prisma.refreshToken.create({
        data: {
          refreshToken: jwt.sign({ email: user.email }, JWTRefreshTokenSecret, {
            expiresIn: JWTRefreshTokenExpires,
          }),
          expiresAt: new Date(date.setDate(date.getDate() + parseInt(JWTRefreshTokenExpires, 10))),
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      res.send({ token, refreshToken: refreshToken.refreshToken });
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
      });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },
};

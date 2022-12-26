const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../configs/prisma');
const {
  JWTSecret,
  JWTRefreshTokenSecret,
  JWTExpires,
  JWTRefreshTokenExpires,
  resetPasswordExpires,
} = require('../configs/env');
const sendRequestResetPasswordEmail = require('../mails/sendRequestResetPasswordEmail');

module.exports = {
  requestResetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) return res.status(400).send({ message: 'Email is required' });

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      if (!user) return res.status(200).send({ message: 'A request has been sent' });

      await prisma.resetPasswordToken.deleteMany({
        where: {
          userId: user.id,
        },
      });

      const token = jwt.sign({ email: user.email }, JWTSecret, { expiresIn: resetPasswordExpires });

      await prisma.resetPasswordToken.create({
        data: {
          token,
          expiresAt: new Date(new Date().getTime() + parseInt(resetPasswordExpires, 10)),
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      sendRequestResetPasswordEmail(user.email, user.name, token);

      return res.status(200).send({ message: 'A request has been sent' });
    } catch (err) {
      return next(err);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      if (!token) return res.status(400).send({ message: 'Token is required' });
      if (!password) return res.status(400).send({ message: 'Password is required' });
      if (!confirmPassword) {
        return res.status(400).send({ message: 'Confirm password is required' });
      }
      if (password !== confirmPassword) {
        return res.status(400).send({ message: 'Passwords do not match' });
      }

      // check if token is valid
      const verified = jwt.verify(token, JWTSecret);
      if (!verified) return res.status(401).send({ message: 'Invalid token' });

      const resetPasswordToken = await prisma.resetPasswordToken.findUnique({
        where: {
          token,
        },
        select: {
          id: true,
          token: true,
          expiresAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      if (!resetPasswordToken) return res.status(401).send({ message: 'Invalid token' });

      const date = new Date();

      const newToken = jwt.sign(
        {
          email: resetPasswordToken.user.email,
          role: resetPasswordToken.user.role,
        },
        JWTSecret,
        { expiresIn: JWTExpires },
      );

      await prisma.refreshToken.deleteMany({
        where: {
          userId: resetPasswordToken.user.id,
        },
      });

      const refreshToken = await prisma.refreshToken.create({
        data: {
          token: jwt.sign({ email: resetPasswordToken.user.email }, JWTRefreshTokenSecret, {
            expiresIn: JWTRefreshTokenExpires,
          }),
          expiresAt: new Date(date.setDate(date.getDate() + parseInt(JWTRefreshTokenExpires, 10))),
          user: {
            connect: {
              id: resetPasswordToken.user.id,
            },
          },
        },
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: {
          id: resetPasswordToken.user.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      await prisma.resetPasswordToken.delete({
        where: {
          id: resetPasswordToken.id,
        },
      });

      return res.send({ token: newToken, refreshToken: refreshToken.token });
    } catch (err) {
      return next(err);
    }
  },
};

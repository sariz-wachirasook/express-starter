const bcrypt = require('bcrypt');
const { getPagination, monthDayYearFormat, getCSV, getXLSX } = require('../utils/utils');
const prisma = require('../configs/prisma');
const jwt = require('jsonwebtoken');
const { JWTSecret } = require('../configs/env');

module.exports = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          email: true,
          password: true,
        },
      });

      if (!user) res.status(401).send({ message: 'Invalid email or password' });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) res.status(401).send({ message: 'Invalid email or password' });

      const token = jwt.sign({ email: user.email }, JWTSecret);
      res.send({ token });
    } catch (err) {
      next(err);
    }
  },
};

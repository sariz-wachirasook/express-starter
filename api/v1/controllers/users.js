const bcrypt = require('bcrypt');
const { getPagination, monthDayYearFormat, getCSV, getXLSX } = require('../utils/utils');
const prisma = require('../configs/prisma');

const selectList = {
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
  },
};

const selectDetail = {
  select: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    role: true,
    profile: {
      select: {
        firstName: true,
        lastName: true,
        gender: true,
        birthDate: true,
        phoneNumber: true,
        isNewsletterSubscribed: true,
      },
    },
  },
};

module.exports = {
  create: async (req, res, next) => {
    try {
      let { email } = req.body;
      const { name, password } = req.body;

      email = email.toLowerCase();

      if (!name || !email || !password) {
        return res.status(400).send({ message: 'All fields are required' });
      }

      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        return res.status(400).send({ message: 'Email is already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const data = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        ...selectList,
      });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  findMany: async (req, res, next) => {
    try {
      const pagination = getPagination(req.query);

      const total = await prisma.user.count();
      const data = await prisma.user.findMany({
        ...pagination,
        orderBy: {
          createdAt: 'desc',
        },
        ...selectList,
      });

      res.send({ total, data });
    } catch (err) {
      next(err);
    }
  },

  findUnique: async (req, res, next) => {
    try {
      const { id } = req.params;

      const data = await prisma.user.findUnique({
        where: {
          id: parseInt(id, 10),
        },
        ...selectDetail,
      });

      res.send(data);
    } catch (err) {
      next(err);
    }
  },

  dataExport: async (req, res, next) => {
    try {
      const pagination = getPagination(req.query);
      const where = {};
      const { format } = req.query;

      const data = await prisma.user.findMany({
        ...pagination,
        where,
        orderBy: {
          createdAt: 'desc',
        },
        ...selectList,
      });

      const flattenedData = data.map((item) => ({
        name: item.name,
        email: item.email,
        createdAt: monthDayYearFormat(item.createdAt),
      }));

      switch (format) {
        case 'xlsx': {
          const workbook = getXLSX(flattenedData, ['Email', 'Name', 'Created At']);
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          );
          res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
          res.send(workbook);
          break;
        }
        case 'csv':
        default: {
          const csv = getCSV(flattenedData, [
            { id: 'email', title: 'Email' },
            { id: 'name', title: 'Name' },
            { id: 'createdAt', title: 'Created At' },
          ]);
          res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
          res.setHeader('Content-Type', 'text/csv');
          res.send(csv);
          break;
        }
      }
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;

      const { firstName, lastName, gender, phoneNumber, birthDate } = req.body;
      const { isNewsletterSubscribed } = req.body;

      const data = await prisma.user.update({
        where: {
          id: parseInt(id, 10),
        },
        data: {
          profile: {
            upsert: {
              create: {
                firstName,
                lastName,
                gender: gender || 'u',
                phoneNumber,
                birthDate,
                isNewsletterSubscribed,
              },
              update: {
                firstName,
                lastName,
                gender: gender || 'u',
                phoneNumber,
                birthDate,
                isNewsletterSubscribed,
              },
            },
          },
        },
        ...selectDetail,
      });

      res.send(data);
    } catch (err) {
      next(err);
    }
  },
};

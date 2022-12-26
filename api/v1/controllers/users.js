const bcrypt = require('bcrypt');
const { getPagination, monthDayYearFormat, getCSV, getXLSX } = require('../utils/utils');
const prisma = require('../configs/prisma');
const { notFoundMessage } = require('../messages/systemMessages');
const sendInformSoftDeleteAccountEmail = require('../mails/sendInformSoftDeleteAccountEmail');

const selectList = {
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    profile: {
      select: {
        isSubscribed: true,
      },
    },
  },
};

const selectDetail = {
  select: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    deletedAt: true,
    role: true,
    profile: {
      select: {
        firstName: true,
        lastName: true,
        gender: true,
        birthDate: true,
        phoneNumber: true,
        isSubscribed: true,
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

      if (!data) return res.status(404).send({ message: notFoundMessage });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  dataExport: async (req, res, next) => {
    try {
      const { format } = req.query;

      const data = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        ...selectList,
      });

      const flattenedData = data.map((item) => ({
        name: item.name,
        email: item.email,
        createdAt: monthDayYearFormat(item.createdAt),
        isSubscribed: item.profile?.isSubscribed ? 'Yes' : 'No',
      }));

      switch (format) {
        case 'xlsx': {
          const workbook = getXLSX(flattenedData, [
            'Email',
            'Name',
            'Created At',
            'Subscribed to Newsletter',
          ]);
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
            { id: 'isSubscribed', title: 'Subscribed to Newsletter' },
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
      const { isSubscribed } = req.body;

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
                isSubscribed,
              },
              update: {
                firstName,
                lastName,
                gender: gender || 'u',
                phoneNumber,
                birthDate,
                isSubscribed,
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

  requestSoftDelete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const today = new Date();

      // next 30 days start from 12:00 AM
      const next30Day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

      const data = await prisma.user.update({
        where: {
          id: parseInt(id, 10),
        },
        data: {
          deletedAt: next30Day,
        },
        ...selectDetail,
      });

      sendInformSoftDeleteAccountEmail(data.email, data.name, next30Day);

      res.send({ message: 'Request soft delete successfully' });
    } catch (err) {
      next(err);
    }
  },
};

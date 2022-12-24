const bcrypt = require('bcrypt');
const { getPagination, monthDayYearFormat, getCSV, getXLSX } = require('../utils/utils');
const prisma = require('../configs/prisma');

module.exports = {
  create: async (req, res, next) => {
    try {
      let { name, email, password } = req.body;

      email = email.toLowerCase();

      if (!name || !email || !password) {
        return res.status(400).send({ message: 'All fields are required' });
      }

      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        return res.status(400).send({ message: 'Email is already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const data = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
        },
      });

      res.send(data);
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const pagination = getPagination(req.query);

      const total = await prisma.user.count();
      const data = await prisma.user.findMany({
        ...pagination,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
          profile: {
            select: {
              id: true,
            },
          },
        },
      });

      res.send({ total, data });
    } catch (err) {
      next(err);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const { id } = req.params;

      const data = await prisma.user.findUnique({
        where: {
          id: parseInt(id),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
          profile: {
            select: {
              id: true,
            },
          },
        },
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
        select: {
          name: true,
          email: true,
          createdAt: true,
        },
      });

      const flattenedData = data.map((item) => ({
        name: item.name,
        email: item.email,
        createdAt: monthDayYearFormat(item.createdAt),
      }));

      switch (format) {
        case 'xlsx':
          const workbook = getXLSX(flattenedData, ['Name', 'Email', 'Created At']);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
          res.send(workbook);
          break;

        case 'csv':
        default:
          const csv = getCSV(flattenedData, [
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' },
            { id: 'createdAt', title: 'Created At' },
          ]);
          res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
          res.setHeader('Content-Type', 'text/csv');
          res.send(csv);
          break;
      }
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
    } catch (err) {
      next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
    } catch (err) {
      next(err);
    }
  },
};

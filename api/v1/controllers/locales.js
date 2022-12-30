const { getPagination, getId } = require('../utils/utils');
const prisma = require('../configs/prisma');
const {
  notFoundMessage,
  allFieldsRequired,
  deleteSuccess,
  codeAlreadyExists,
} = require('../messages/systemMessages');

const selectList = {
  select: {
    id: true,
    code: true,
    name: true,
  },
};

const selectDetail = {
  select: {
    id: true,
    code: true,
    name: true,
    createdAt: true,
    updatedAt: true,
  },
};

module.exports = {
  create: async (req, res, next) => {
    try {
      const { code, name } = req.body;

      if (!code || !name) return res.status(400).send({ message: allFieldsRequired });

      const existingData = await prisma.locale.findUnique({
        where: {
          code,
        },
      });

      if (existingData) return res.status(400).send({ message: codeAlreadyExists });

      const data = await prisma.locale.create({
        data: {
          code,
          name,
        },
      });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  findMany: async (req, res, next) => {
    try {
      const pagination = getPagination(req.query);

      const total = await prisma.locale.count();
      const data = await prisma.locale.findMany({
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
      const id = getId(req.params);

      const data = await prisma.locale.findUnique({
        where: {
          id,
        },
        ...selectDetail,
      });

      if (!data) return res.status(404).send({ message: notFoundMessage });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = getId(req.params);
      const { code, name } = req.body;

      if (!code || !name) return res.status(400).send({ message: allFieldsRequired });

      const existingData = await prisma.locale.findUnique({
        where: {
          id,
        },
        ...selectDetail,
      });

      const existingCode = await prisma.locale.findUnique({
        where: {
          code,
        },
      });

      if (!existingData) return res.status(404).send({ message: notFoundMessage });
      if (existingCode && existingCode.id !== id) {
        return res.status(400).send({ message: codeAlreadyExists });
      }

      const data = await prisma.locale.update({
        where: {
          id,
        },
        data: {
          code,
          name,
        },
        ...selectDetail,
      });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = getId(req.params);

      const existingSlug = await prisma.locale.findUnique({
        where: {
          id,
        },
      });

      if (!existingSlug) return res.status(404).send({ message: notFoundMessage });

      await prisma.locale.delete({
        where: {
          id,
        },
      });

      return res.send({ message: deleteSuccess });
    } catch (err) {
      return next(err);
    }
  },
};

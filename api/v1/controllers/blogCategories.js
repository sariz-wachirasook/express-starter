const { getPagination, getId } = require('../utils/utils');
const prisma = require('../configs/prisma');
const slugify = require('../configs/slugify');
const {
  notFoundMessage,
  slugAlreadyExists,
  allFieldsRequired,
  deleteSuccess,
} = require('../messages/systemMessages');

const selectList = {
  select: {
    id: true,
    slug: true,
    name: true,
  },
};

const selectDetail = {
  select: {
    id: true,
    slug: true,
    name: true,
    createdAt: true,
    updatedAt: true,
  },
};

module.exports = {
  create: async (req, res, next) => {
    try {
      const { name } = req.body;

      if (!name) return res.status(400).send({ message: allFieldsRequired });

      const newSlug = slugify(name);
      const existingSlug = await prisma.blogCategory.findUnique({
        where: {
          slug: newSlug,
        },
      });

      if (existingSlug) return res.status(400).send({ message: slugAlreadyExists });

      const data = await prisma.blogCategory.create({
        data: {
          slug: newSlug,
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

      const total = await prisma.blogCategory.count();
      const data = await prisma.blogCategory.findMany({
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

      const data = await prisma.blogCategory.findUnique({
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
      const { name } = req.body;

      if (!name) return res.status(400).send({ message: allFieldsRequired });

      const newSlug = slugify(name);

      const existingSlug = await prisma.blogCategory.findUnique({
        where: {
          id,
        },
        ...selectDetail,
      });

      if (!existingSlug) return res.status(404).send({ message: notFoundMessage });
      if (existingSlug.slug === newSlug) {
        return res.status(400).send(existingSlug);
      }

      const existingNewSlug = await prisma.blogCategory.findUnique({
        where: {
          slug: newSlug,
        },
      });

      if (existingNewSlug) return res.status(400).send({ message: slugAlreadyExists });

      const data = await prisma.blogCategory.update({
        where: {
          id,
        },
        data: {
          name,
          slug: newSlug,
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

      const existingSlug = await prisma.blogCategory.findUnique({
        where: {
          id,
        },
      });

      if (!existingSlug) return res.status(404).send({ message: notFoundMessage });

      await prisma.blogCategory.delete({
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

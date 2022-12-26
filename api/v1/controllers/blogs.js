const {
  getPagination,
  monthDayYearFormat,
  getXLSX,
  getCSV,
  getAverageReadingSpeed,
} = require('../utils/utils');
const prisma = require('../configs/prisma');
const slugify = require('../configs/slugify');
const { notFoundMessage } = require('../messages/systemMessages');

const selectList = {
  select: {
    slug: true,
    title: true,
    readTime: true,
    createdAt: true,
    createdBy: true,
    blogCategories: {
      select: {
        name: true,
        slug: true,
      },
    },
  },
};

const selectDetail = {
  select: {
    slug: true,
    title: true,
    content: true,
    readTime: true,
    metaTitle: true,
    metaDescription: true,
    metaKeywords: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,
    blogCategories: {
      select: {
        name: true,
        slug: true,
      },
    },
  },
};

module.exports = {
  create: async (req, res, next) => {
    try {
      const { title, content, slug, metaTitle, metaDescription, metaKeywords } = req.body;
      const { blogCategories } = req.body;
      const { email } = req.user;

      if (!title || !content) return res.status(400).send({ message: 'All fields are required' });

      let newSlug = slugify(slug || title);

      const existingSlug = await prisma.blog.findUnique({
        where: {
          slug: newSlug,
        },
      });

      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now()}`;
      }

      const readTime = getAverageReadingSpeed(content);

      const data = await prisma.blog.create({
        data: {
          slug: newSlug,
          title,
          content,
          createdBy: email,
          updatedBy: email,
          readTime,
          metaTitle,
          metaDescription,
          metaKeywords,
          blogCategories: {
            connect: blogCategories.map((item) => ({ slug: item })),
          },
        },
        ...selectDetail,
      });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  findMany: async (req, res, next) => {
    try {
      const pagination = getPagination(req.query);

      const total = await prisma.blog.count();
      const data = await prisma.blog.findMany({
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
      const { slug } = req.params;

      const data = await prisma.blog.findUnique({
        where: {
          slug,
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

      const data = await prisma.blog.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        ...selectDetail,
      });

      const flattenedData = data.map((item) => ({
        slug: item.slug,
        title: item.title,
        content: item.content,
        readTime: item.readTime,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        metaKeywords: item.metaKeywords,
        createdAt: monthDayYearFormat(item.createdAt),
        createdBy: item.createdBy,
        updatedAt: monthDayYearFormat(item.updatedAt),
        updatedBy: item.updatedBy,
      }));

      switch (format) {
        case 'xlsx': {
          const workbook = getXLSX(flattenedData, [
            'Slug',
            'Title',
            'Content',
            'Read Time',
            'Meta Title',
            'Meta Description',
            'Meta Keywords',
            'Created At',
            'Created By',
            'Updated At',
            'Updated By',
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
            { id: 'slug', title: 'Slug' },
            { id: 'title', title: 'Title' },
            { id: 'content', title: 'Content' },
            { id: 'readTime', title: 'Read Time' },
            { id: 'metaTitle', title: 'Meta Title' },
            { id: 'metaDescription', title: 'Meta Description' },
            { id: 'metaKeywords', title: 'Meta Keywords' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'createdBy', title: 'Created By' },
            { id: 'updatedAt', title: 'Updated At' },
            { id: 'updatedBy', title: 'Updated By' },
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
      const { slug } = req.params;
      const { title, content, metaTitle, metaDescription, metaKeywords, blogCategories } = req.body;
      const { email } = req.user;

      if (!title || !content) return res.status(400).send({ message: 'All fields are required' });

      const existingPage = await prisma.blog.findUnique({
        where: {
          slug,
        },
      });

      if (!existingPage) return res.status(404).send({ message: notFoundMessage });

      const readTime = getAverageReadingSpeed(content);

      const data = await prisma.blog.update({
        where: {
          slug,
        },
        data: {
          title,
          content,
          readTime,
          metaTitle,
          metaDescription,
          metaKeywords,
          updatedBy: email,
          blogCategories: {
            set: blogCategories.map((item) => ({ slug: item })),
          },
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
      const { slug } = req.params;

      const existingPage = await prisma.blog.findUnique({
        where: {
          slug,
        },
      });

      if (!existingPage) return res.status(404).send({ message: notFoundMessage });

      await prisma.blog.delete({
        where: {
          slug,
        },
      });

      return res.send({ message: 'Page deleted' });
    } catch (err) {
      return next(err);
    }
  },
};

const path = require('path');
const fs = require('fs');
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
    thumbnail: true,
    createdAt: true,
    createdBy: true,
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
    banner: true,
    thumbnail: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,
  },
};

module.exports = {
  create: async (req, res, next) => {
    try {
      const { title, content, slug, metaTitle, metaDescription, metaKeywords } = req.body;
      const { email } = req.user;

      if (!title || !content) return res.status(400).send({ message: 'All fields are required' });

      let newSlug = slugify(slug || title);

      const existingSlug = await prisma.page.findUnique({
        where: {
          slug: newSlug,
        },
      });

      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now()}`;
      }

      const readTime = getAverageReadingSpeed(content);

      const data = await prisma.page.create({
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

      const total = await prisma.page.count();
      const data = await prisma.page.findMany({
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

      const data = await prisma.page.findUnique({
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

      const data = await prisma.page.findMany({
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
          res.setHeader('Content-Disposition', 'attachment; filename=pages.xlsx');
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
          res.setHeader('Content-Disposition', 'attachment; filename=pages.csv');
          res.setHeader('Content-Type', 'text/csv');
          res.send(csv);
          break;
        }
      }
    } catch (err) {
      next(err);
    }
  },

  uploadBanner: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const { file } = req;

      if (!file) return res.status(400).send({ message: 'File is required' });

      const existingPage = await prisma.page.findUnique({
        where: {
          slug,
        },
        select: {
          banner: true,
        },
      });

      if (!existingPage) return res.status(404).send({ message: notFoundMessage });

      if (existingPage.banner) {
        const filePath = path.join('public', existingPage.banner);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      const data = await prisma.page.update({
        where: {
          slug,
        },
        data: {
          banner: file.path,
        },
        select: {
          banner: true,
        },
      });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  uploadThumbnail: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const { file } = req;

      console.log(file);

      if (!file) return res.status(400).send({ message: 'File is required' });

      const existingPage = await prisma.page.findUnique({
        where: {
          slug,
        },
        select: {
          thumbnail: true,
        },
      });

      if (!existingPage) return res.status(404).send({ message: notFoundMessage });

      if (existingPage.thumbnail) {
        const filePath = path.join('public', existingPage.thumbnail);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      const data = await prisma.page.update({
        where: {
          slug,
        },
        data: {
          thumbnail: file.path,
        },
        select: {
          thumbnail: true,
        },
      });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const { title, content, metaTitle, metaDescription } = req.body;
      const { email } = req.user;

      if (!title || !content) return res.status(400).send({ message: 'All fields are required' });

      const existingPage = await prisma.page.findUnique({
        where: {
          slug,
        },
      });

      if (!existingPage) return res.status(404).send({ message: notFoundMessage });

      const readTime = getAverageReadingSpeed(content);

      const data = await prisma.page.update({
        where: {
          slug,
        },
        data: {
          title,
          content,
          readTime,
          metaTitle,
          metaDescription,
          updatedBy: email,
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

      const existingPage = await prisma.page.findUnique({
        where: {
          slug,
        },
      });

      if (!existingPage) return res.status(404).send({ message: notFoundMessage });

      await prisma.page.delete({
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

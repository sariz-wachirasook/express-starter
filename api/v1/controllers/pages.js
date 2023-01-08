const path = require('path');
const fs = require('fs');
const _ = require('lodash');
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
    id: true,
    thumbnail: true,
    createdAt: true,
    createdBy: true,

    pageTranslations: {
      select: {
        locale: true,
        slug: true,
        title: true,
        readTime: true,
      },
    },
  },
};

const selectDetail = {
  select: {
    id: true,
    banner: true,
    thumbnail: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    updatedBy: true,

    pageTranslations: {
      select: {
        id: true,
        locale: true,
        slug: true,
        title: true,
        content: true,
        readTime: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
      },
    },
  },
};

module.exports = {
  create: async (req, res, next) => {
    try {
      const { pageTranslations } = req.body;
      const { email } = req.user;

      const translations = await Promise.all(
        pageTranslations.map(async (pageTranslation) => {
          const { title, content } = pageTranslation;
          let slug = slugify(title);

          const existingSlug = await prisma.pageTranslation.findUnique({
            where: {
              slug,
            },
          });

          if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
          }

          const readTime = getAverageReadingSpeed(content);

          return {
            ...pageTranslation,
            slug,
            readTime,
          };
        })
      );

      const data = await prisma.page.create({
        data: {
          createdBy: email,
          updatedBy: email,

          pageTranslations: {
            createMany: {
              skipDuplicates: true,
              data: translations,
            },
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
      const acceptLanguage = req.headers['accept-language'];

      const pagination = getPagination(req.query);

      const total = await prisma.page.count();

      const data = await prisma.page.findMany({
        ...pagination,
        orderBy: {
          createdAt: 'desc',
        },

        ..._.merge(selectList, {
          select: {
            pageTranslations: {
              where: {
                locale: acceptLanguage || undefined,
              },
            },
          },
        }),
      });

      res.send({ total, data });
    } catch (err) {
      next(err);
    }
  },

  findUnique: async (req, res, next) => {
    try {
      const acceptLanguage = req.headers['accept-language'];

      const { id } = req.params;

      const data = await prisma.page.findFirst({
        where: {
          id: parseInt(id, 10),
        },
        ..._.merge(selectDetail, {
          select: {
            pageTranslations: {
              where: {
                locale: acceptLanguage || undefined,
              },
            },
          },
        }),
      });

      if (!data) return res.status(404).send({ message: notFoundMessage });

      return res.send(data);
    } catch (err) {
      return next(err);
    }
  },

  hasResource: async (req, res, next) => {
    try {
      const { slug } = req.params;

      const data = await prisma.page.findUnique({
        where: {
          slug,
        },
        select: {
          slug: true,
        },
      });

      if (!data) return res.status(404).send({ message: notFoundMessage });

      return next();
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
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          res.setHeader(
            'Content-Disposition',
            'attachment; filename=pages.xlsx'
          );
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
          res.setHeader(
            'Content-Disposition',
            'attachment; filename=pages.csv'
          );
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
      const { id } = req.params;
      const { file } = req;

      if (!file) return res.status(400).send({ message: 'File is required' });

      const existingPage = await prisma.page.findUnique({
        where: {
          id: parseInt(id, 10),
        },
        select: {
          banner: true,
        },
      });

      if (!existingPage)
        return res.status(404).send({ message: notFoundMessage });

      if (existingPage.banner) {
        const filePath = path.join('public', existingPage.banner);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      const data = await prisma.page.update({
        where: {
          id,
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
      const { id } = req.params;
      const { file } = req;

      if (!file) return res.status(400).send({ message: 'File is required' });

      const existingPage = await prisma.page.findUnique({
        where: {
          id: parseInt(id, 10),
        },
        select: {
          thumbnail: true,
        },
      });

      if (!existingPage)
        return res.status(404).send({ message: notFoundMessage });

      if (existingPage.thumbnail) {
        const filePath = path.join('public', existingPage.thumbnail);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      const data = await prisma.page.update({
        where: {
          id: parseInt(id, 10),
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
      const { id } = req.params;
      const { pageTranslations } = req.body;
      const { email } = req.user;

      const existingPage = await prisma.page.findUnique({
        where: {
          id: parseInt(id, 10),
        },
      });

      if (!existingPage)
        return res.status(404).send({ message: notFoundMessage });

      const translations = await Promise.all(
        pageTranslations.map(async (pageTranslation) => {
          // ---------------------------
          let newId;
          if (pageTranslation.id) {
            const existingTranslation = await prisma.pageTranslation.findFirst({
              where: {
                id: pageTranslation.id,
                pageId: parseInt(id, 10),
              },
            });

            if (!existingTranslation) {
              return res.status(404).send({
                message: notFoundMessage,
                translationId: pageTranslation.id,
              });
            }
          } else {
            const existingTranslation = await prisma.pageTranslation.findFirst({
              where: {
                locale: pageTranslation.locale,
                pageId: parseInt(id, 10),
              },
            });

            if (existingTranslation) {
              newId = existingTranslation.id;
            }
          }
          // ---------------------------
          const { title, content } = pageTranslation;

          if (!title || !content) {
            return res.status(400).send({ message: 'All fields are required' });
          }

          let slug = slugify(title);

          const existingSlug = await prisma.pageTranslation.findUnique({
            where: {
              slug,
            },
          });

          if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
          }

          const readTime = getAverageReadingSpeed(content);

          return {
            ...pageTranslation,
            slug,
            readTime,
            id: newId,
          };
        })
      );

      await Promise.all(
        translations.map(async (translation) => {
          const newTranslation = JSON.parse(JSON.stringify(translation));
          if (newTranslation.id) delete newTranslation.id;

          await prisma.pageTranslation.upsert({
            where: {
              id: parseInt(translation.id, 10) || -1,
            },
            create: {
              ...newTranslation,
              page: {
                connect: {
                  id: parseInt(id, 10),
                },
              },
            },
            update: translation,
          });
        })
      );

      const data = await prisma.page.update({
        where: {
          id: parseInt(id, 10),
        },
        data: {
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
      const { id } = req.params;

      const existingPage = await prisma.page.findUnique({
        where: {
          id: parseInt(id, 10),
        },
      });

      if (!existingPage)
        return res.status(404).send({ message: notFoundMessage });

      await prisma.page.delete({
        where: {
          id: parseInt(id, 10),
        },
      });

      return res.send({ message: 'Page deleted' });
    } catch (err) {
      return next(err);
    }
  },
};

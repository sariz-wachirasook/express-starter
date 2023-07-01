const prisma = require('../configs/prisma')

export const findOneBySlug = async (slug: string) => {
  const res = await prisma.blogCategories.findUnique({
    where: {
      slug
    }
  })

  return res
}

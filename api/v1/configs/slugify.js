const slugify = require('slugify')

module.exports = (slug) => {
  const newSlug = slugify(slug, {
    replacement: '-',
    remove: /[*+~.()'"!:@\\/]/g,
    lower: true
  })

  return newSlug
}

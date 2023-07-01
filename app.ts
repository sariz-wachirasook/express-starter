const express = require('express')
const cors = require('cors')

const app = express()

const authentication = require('./api/v1/routes/authentication')
const blogs = require('./api/v1/routes/blogs')
const blogCategories = require('./api/v1/routes/blogCategories')
const locales = require('./api/v1/routes/locales')
const pages = require('./api/v1/routes/pages')
const users = require('./api/v1/routes/users')
const resetPassword = require('./api/v1/routes/resetPassword')

const { appPort } = require('./api/v1/configs/env')

const port = appPort

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'))

app.use('/api/v1/auth', authentication)
app.use('/api/v1/blogs', blogs)
app.use('/api/v1/blog-categories', blogCategories)
app.use('/api/v1/locales', locales)
app.use('/api/v1/pages', pages)
app.use('/api/v1/reset-password', resetPassword)
app.use('/api/v1/users', users)

app.get('/', (req, res) => {
  res.send({
    // auth
    '/api/v1/auth/login': 'POST',
    '/api/v1/auth/register': 'POST',
    '/api/v1/auth/refresh-token': 'POST',

    // blogs cms
    '/api/v1/blogs': 'GET, POST',
    '/api/v1/blogs/export': 'GET',
    '/api/v1/blogs/:slug': 'GET, PATCH, DELETE',
    '/api/v1/blogs/:slug/upload-banner': 'POST',
    '/api/v1/blogs/:slug/upload-thumbnail': 'POST',

    // locales
    '/api/v1/locales': 'GET, POST',
    '/api/v1/locales/:id': 'GET, PATCH, DELETE',

    // pages cms
    '/api/v1/pages': 'GET, POST',
    '/api/v1/pages/export': 'GET',
    '/api/v1/pages/:slug': 'GET, PATCH, DELETE',
    '/api/v1/pages/:slug/upload-banner': 'POST',
    '/api/v1/pages/:slug/upload-thumbnail': 'POST',

    // users
    '/api/v1/users': 'GET, POST',
    '/api/v1/users/export': 'GET',
    '/api/v1/users/:id': 'GET, PATCH',
    '/api/v1/users/:id/delete': 'DELETE',
    '/api/v1/users/:id/upload-avatar': 'POST',

    // reset password
    '/api/v1/users/reset-password': 'POST',
    '/api/v1/users/reset-password/:token': 'POST'
  })
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

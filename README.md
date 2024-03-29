# All About The Starter Kit

## Node.js + Express + Prisma + PostgreSQL|MySQL|SQLite

---

```shell
# (can also use yarn or npm)
pnpm install
pnpm schema:update
node tools/generate.js --user.name="" --user.email="" --user.password=""
pnpm dev
```

## Key Features

---

### 1. User Management System

- crud users
- user login
- user register
- user refresh token
- user reset password
- user soft delete (GDPR)
- user roles and permissions (RBAC)

### 2. CMS System

- crud cms pages
- crud cms blog categories
- crud cms blogs
- slugify
- average reading time
- seo

### 3. Export System

- export users
  - csv
  - excel
- export pages
  - csv
  - excel
- export blogs
  - csv
  - excel

### 4. Email Templates

- welcome email
- reset password email

## 5. Image Upload System

- webp images
- auto resize images
- auto compress images

### 6. Cronjobs System

- every 1 minute
- every 30 minutes
- every 1 hour
- every 1 day
- every 1st day of week
- every 1st day of month

### 7. Localization System

## Infrastructure

---

## Where can be deployed?

- [x] Any VPS (Linux) with

  - Node.js
  - PM2
  - Nginx
  - MySQL

- [x] Other SAAS
  - [x] AWS
  - [x] Azure
  - [x] Heroku
  - [x] Digital Ocean
  - [x] Google Cloud
  - [x] Linode
  - [x] Netlify

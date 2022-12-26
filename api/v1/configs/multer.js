const multer = require('multer');

// const storage = multer.diskStorage({
//   destination: async (req, file, cb) => {
//     const randomName = crypto.randomBytes(8).toString('hex');

//     const folder = `public/media/${randomName.split('').slice(0, 2).join('')}/${randomName
//       .split('')
//       .slice(2, 4)
//       .join('')}`;

//     if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

//     cb(null, folder);
//   },

//   filename: (req, file, cb) => {
//     const randomName = crypto.randomBytes(8).toString('hex');

//     cb(null, `${randomName}.${file.originalname.split('.').pop()}`);
//   },
// });

// const upload = multer({ storage });

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;

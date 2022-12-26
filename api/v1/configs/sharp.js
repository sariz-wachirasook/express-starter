const sharp = require('sharp');
const fs = require('fs');
const crypto = require('crypto');

module.exports = async (req, res, next) => {
  try {
    const { file } = req;

    if (file) {
      const randomName = crypto.randomBytes(8).toString('hex');

      const folder = `public/media/${randomName.split('').slice(0, 2).join('')}/${randomName
        .split('')
        .slice(2, 4)
        .join('')}`;

      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

      const webpImage = await sharp(file.buffer)
        .resize({
          width: 1920,
          height: 1920,
          fit: 'inside',
        })
        .toFormat('webp')
        .toBuffer();

      fs.writeFileSync(`${folder}/${randomName}.webp`, webpImage);

      res.send('Image uploaded and converted to WEBP successfully');
    }
  } catch (error) {
    next(error);
  }
};

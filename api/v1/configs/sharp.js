const sharp = require('sharp');
const fs = require('fs');
const crypto = require('crypto');

module.exports = async (req, res, next) => {
  try {
    const { file } = req;

    const randomName = crypto.randomBytes(8).toString('hex');

    const hashFolder = `media/${randomName.split('').slice(0, 2).join('')}/${randomName
      .split('')
      .slice(2, 4)
      .join('')}`;

    if (!fs.existsSync(`public/${hashFolder}`)) fs.mkdirSync(`public/${hashFolder}`, { recursive: true });

    const webpImage = await sharp(file.buffer)
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
      })
      .toFormat('webp')
      .toBuffer();

    fs.writeFileSync(`public/${hashFolder}/${randomName}.webp`, webpImage);

    req.file = {
      path: `/${hashFolder}/${randomName}.webp`,
      filename: `${randomName}.webp`,
      mimetype: 'image/webp',
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

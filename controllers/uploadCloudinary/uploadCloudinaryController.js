const fileUploader = require('../../configs/connectCloudinary');

const uploadCloud = (req, res, next) => {
  fileUploader.single('file')(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return next(new Error('No file uploaded!'));
    }

    res.json({ secure_url: req.file.path || req.file.url });
  });
};

module.exports = uploadCloud;

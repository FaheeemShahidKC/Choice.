const  multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../Public/products/images"));
      },
      filename: function (req, file, cb) {
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
});
    
const upload = multer({ storage: storage });

const productImagesUpload = upload.fields([
      { name: "image1", maxCount: 1 },
      { name: "image2", maxCount: 1 },
      { name: "image3", maxCount: 1 },
      { name: "image4", maxCount: 1 },
]);

const Bannerstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../Public/banner"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const bannerUpload = multer({storage:Bannerstorage})

module.exports = { productImagesUpload, bannerUpload}
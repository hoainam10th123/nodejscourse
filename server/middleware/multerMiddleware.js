import multer from 'multer';
//import DataParser from 'datauri/parser.js';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'wwwroot/uploads')
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.')[1]
    const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + `.${ext}`
    cb(null, fileName)
  }
});

const uploadMulter = multer({ storage });

// const parser = new DataParser();

// export const formatImage = (file) => {
//   const fileExtension = path.extname(file.originalname).toString();
//   return parser.format(fileExtension, file.buffer).content;
// };

export default uploadMulter;

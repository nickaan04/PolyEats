import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Configure Multer for storing images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "../uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); //ensure directory exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

//filter allowed file types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|heic/;
  const mimetype = filetypes.test(file.mimetype.toLowerCase());
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, .png, or .heic files are allowed!"));
  }
};

const upload = multer({ storage, fileFilter });

//middleware for handling HEIC conversion
const convertHeicToJpeg = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".heic") {
    const jpegPath = filePath.replace(".heic", ".jpeg");
    try {
      await sharp(filePath).toFormat("jpeg").toFile(jpegPath);
      fs.unlinkSync(filePath); //remove original HEIC file
      req.file.path = jpegPath; //update path to point to the converted file
      req.file.filename = path.basename(jpegPath);
    } catch (err) {
      return res.status(500).send({ error: "Error converting HEIC to JPEG" });
    }
  }

  next();
};

export { upload, convertHeicToJpeg };

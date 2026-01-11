import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = [
  'uploads/cloning/voices',
  'uploads/cloning/photos',
  'uploads/cloning/documents'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/cloning/';
    if (file.fieldname === 'voiceSamples') folder += 'voices';
    else if (file.fieldname === 'photos') folder += 'photos';
    else folder += 'documents';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = {
    voiceSamples: /mp3|wav|ogg|webm/,
    photos: /jpg|jpeg|png|gif|webp/,
    documents: /pdf|doc|docx|txt/
  };
  
  const fieldType = file.fieldname as keyof typeof allowedTypes;
  const extname = allowedTypes[fieldType]?.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes[fieldType]?.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800')
  }
});

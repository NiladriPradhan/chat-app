import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

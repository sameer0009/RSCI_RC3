import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Untrusted originals must never be served from /uploads, even on decode failure.
const temporaryDir = path.join(os.tmpdir(), 'rsci-uploads');
fs.mkdirSync(temporaryDir, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, temporaryDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()}.upload`);
  },
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadsPath = uploadsDir;

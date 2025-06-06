import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import AppError from './AppError';

// Define types for multer middleware
const multerStorage = multer.memoryStorage();

const multerFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    // List of allowed MIME types
    const allowedImageTypes = ['image/png', 'image/jpeg'];
    const allowedVideoTypes = ['video/mp4'];

    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Only PNG, JPG images, and MP4 videos are allowed!', 400));
    }
    cb(null, true);
};





export const imageMulter = multer({
    storage: multerStorage,
    fileFilter: multerFilter,

});

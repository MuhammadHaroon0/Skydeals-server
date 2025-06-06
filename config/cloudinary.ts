import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility function for uploads
export const uploadToCloudinary = (fileBuffer: Buffer, options: {
    folder: string;
    resource_type: 'image' | 'video';
}): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );

        uploadStream.end(fileBuffer);
    });
};
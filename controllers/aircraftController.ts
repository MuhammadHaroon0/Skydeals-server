import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import UserModel from "../models/userModel";
import ServerResponse from '../utils/serverResponse';
import AircraftModel from "../models/aircraftModel";
import { imageMulter } from "../utils/multerConfig";
import sharp from 'sharp'
import { uploadToCloudinary } from "../config/cloudinary";
import { AuthenticatedRequest } from "../types/IAuthenticatedRequest";
import APIFeatures from "../utils/apiFeatures";
import Email from "../utils/email";


export const upload =
    imageMulter.fields([
        { name: 'images', maxCount: 10 },
        { name: 'video', maxCount: 1 }
    ]);

export const createAircraft = catchAsync(async (req: AuthenticatedRequest & { files?: { images?: Express.Multer.File[], video?: Express.Multer.File } }, res: Response, next: NextFunction) => {
    const images: string[] = [];
    let videoUrl: string | undefined;
    const maxImageSize = 5 * 1024 * 1024; // 5MB for images
    const maxVideoSize = 50 * 1024 * 1024; // 50MB for videos
    try {

        // Process and upload images
        if (req.files?.images) {
            await Promise.all(req.files.images.map(async (image) => {
                if (image.size > maxImageSize)
                    return next(new AppError("Image size can't exceed 5mb", 400))

                // Process image with Sharp
                const processedBuffer = await sharp(image.buffer)
                    .resize(500, 500)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toBuffer();

                // Upload to Cloudinary
                const uploadResult = await uploadToCloudinary(processedBuffer, {
                    folder: 'skydeals/images',
                    resource_type: 'image'
                });
                images.push(uploadResult.secure_url);
            }));
        }

        // Upload video
        if (req.files?.video?.[0]) {
            if (req.files.video[0].size > maxVideoSize)
                return next(new AppError("Video size can't exceed 50mb", 400))
            const video = req.files.video[0];
            const uploadResult = await uploadToCloudinary(video.buffer, {
                folder: 'skydeals/videos',
                resource_type: 'video'
            });
            videoUrl = uploadResult.secure_url;
        }


    } catch (error) {
        return next(new AppError("An error occurred in uploading images and videos. Please check file size and required filetypes.", 500));
    }
    // Create aircraft document with media URLs
    const doc = await AircraftModel.create({
        ...req.body,
        user: req.user!.id,
        images,
        video: videoUrl
    });

    // Update user's aircraft list
    await UserModel.findByIdAndUpdate(req.user!.id, {
        $push: { aircrafts: doc._id }
    });
    try {
        await new Email(req.user).sendNewListing()
    } catch (error) {
        console.log(error);

    }

    return res.status(201).json(new ServerResponse("success", doc));
});


export const deleteAircraft = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    const doc = await AircraftModel.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError("Document not found matching this id!", 404));
    }

    await UserModel.findByIdAndUpdate(req.user!.id, {
        $pull: {
            aircrafts: doc._id
        }
    });

    return res.status(204).json(new ServerResponse("success", doc));
});

export const getAircraft = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // const doc = await AircraftModel.findOne({ _id: req.params.id, isApproved: true })
    const doc = await AircraftModel.findOne({ _id: req.params.id })
        .populate("user", "name email phone");

    if (!doc) {
        return next(new AppError("Doc not found matching this id!", 404));
    }
    return res.status(200).json(new ServerResponse("success", doc));
});

export const approveListing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const doc = await AircraftModel.findByIdAndUpdate(req.params.id, { isApproved: true });

    if (!doc) {
        return next(new AppError("Aircraft not found matching this id!", 404));
    }

    try {
        const user = await UserModel.findById(doc.user)
        await new Email(user).sendListingStatus(true)
    } catch (error) {
        console.log(error);
    }
    return res.status(200).json(new ServerResponse("Listing Approved", doc));
});

export const rejectListing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const doc = await AircraftModel.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError("Document not found matching this id!", 404));
    }

    await UserModel.findByIdAndUpdate(doc.user, {
        $pull: {
            aircrafts: doc._id
        }
    });

    try {
        const user = await UserModel.findById(doc.user)
        await new Email(user).sendListingStatus(false)
    } catch (error) {
        console.log(error);
    }



    return res.status(204).json(new ServerResponse("Listing Deleted", doc));
});

export const getAircraftByCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Base query with category filter
    const filter: Record<string, any> = {};
    const query = { ...req.query };
    if (query.aircraftName) filter.aircraftName = { $regex: query.aircraftName, $options: "i" };
    if (query.category && query.category !== "all") filter.category = { $regex: query.category, $options: "i" };
    filter.isApproved = true

    const baseQuery = AircraftModel.find(filter).collation({ locale: 'en', strength: 2 })
        .populate("user", "name email phone"); //case insensitive

    req.query.aircraftName = undefined
    req.query.category = undefined

    const features = new APIFeatures(baseQuery, req.query)
        .filter(); // Apply filter first

    // Clone the query after applying filters (before sorting, pagination, etc.)
    const countQuery = features.query.clone();

    // Apply remaining features to the original query
    features.sort()
        .paginate()
        .limitFields();

    // Always use the filtered count query (includes category if applicable)
    const totalResults = await countQuery.countDocuments();

    const doc = await features.query;

    return res.status(200).json(new ServerResponse("success", {
        totalResults,
        data: doc
    }));


});


export const getUnapprovedAds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const unapprovedAds = await AircraftModel.find({ isApproved: false })
        .sort({ createdAt: -1 })
        .populate("user", "name email phone");

    res.status(200).json(new ServerResponse("success", unapprovedAds));
});
export const getRecentAds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { limit = 10 } = req.query; // Default to 10 recent ads

    const recentAds = await AircraftModel.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate("user", "name email phone");

    res.status(200).json(new ServerResponse("success", recentAds));
});

export const getRelatedAds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Fetch the current aircraft
    const currentAircraft = await AircraftModel.findById(id);
    if (!currentAircraft) {
        return res.status(404).json(new AppError("Aircraft not found", 404));
    }

    // Find related aircraft based on category, manufacturer, and aircraft model
    const relatedAds = await AircraftModel.find({
        _id: { $ne: id },
        category: currentAircraft.category,
        manufacturer: currentAircraft.manufacturer,
        aircraftModel: currentAircraft.aircraftModel,
        isApproved: true, // Only fetch approved listings
    }).limit(10);


    res.status(200).json(new ServerResponse("success", relatedAds));
});

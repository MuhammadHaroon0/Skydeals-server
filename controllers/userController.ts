import { NextFunction, Response } from "express";
import UserModel from "../models/userModel";
import { AuthenticatedRequest } from "../types/IAuthenticatedRequest";
import catchAsync from "../utils/catchAsync";
import AircraftModel from "../models/aircraftModel";

export const updateMe = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.file) req.body.image = req.file.filename;
    const doc = await UserModel.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
        runValidators: true,
    });
    return res.status(200).json({
        status: "success",
        data: {
            doc,
        },
    });
});

export const getMyAds = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const doc = await AircraftModel.find({ user: req.user.id, isApproved: true });
    return res.status(200).json({ data: doc });

});
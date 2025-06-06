import { Request, Response, NextFunction } from 'express';
import UserModel from "../models/userModel";
import jwt from "jsonwebtoken";
import catchAsync from "./../utils/catchAsync";
import AppError from "../utils/AppError";
import Email from "./../utils/email";
import crypto from "crypto";
import { signToken } from "../config/jwt";
import { IUser } from '../models/userModel';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../types/IAuthenticatedRequest';

// Extending Express Request interface to include user property
// declare global {
//     namespace Express {
//         interface Request {
//             user?: IUser;
//         }
//     }
// }

export const signUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.password) {
        return next(new AppError("Please provide password!", 400));
    }

    if (req.body.role === "admin") {
        req.body.role = 'seller';
    }

    const verToken = crypto.randomBytes(20).toString('hex');

    const newUser = new UserModel({
        ...req.body,
        verificationToken: verToken,
    });

    try {
        // Attempt to send email first
        await newUser.save();
        // await new Email(newUser).sendWelcome(verToken);


        res.status(200).json({
            status: "success",
            data: {
                name: newUser.name,
                id: newUser._id,
                role: newUser.role,
                authMethod: "self"
            },
        });

    } catch (error) {
        console.error("Signup email error:", error);
        return next(new AppError("Something went wrong. Try again later", 500));
    }
});


export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email || !req.body.password) {
        return next(new AppError("Please provide both email and password!", 400));
    }

    const found = await UserModel.findOne({ email: req.body.email }).select("+password");

    if (!found) return next(new AppError("Please provide valid email!", 400));
    if (found.authMethod !== 'self') {
        return next(new AppError("You can only login with google", 403));
    }
    if (!(await found.correctPassword(req.body.password))) {
        return next(new AppError("Please provide valid password!", 400));
    }
    if (!found.approve) {
        return next(
            new AppError(
                "Your email is not verified! Verify to activate your account",
                403
            )
        );
    }
    found.active = true;
    await found.save({ validateBeforeSave: false });
    const token = signToken(found._id.toString(), res);

    res.status(200).json({
        status: "success",
        data: {
            id: found._id,
            name: found.name,
            role: found.role,
            authMethod: found.authMethod
        },
    });
});

export const getMe = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    res.status(200).json({
        status: "success",
        data: {
            id: req.user!._id,
            name: req.user!.name,
            role: req.user!.role,
            authMethod: req.user!.authMethod,
        },
    });
});

export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


    const cookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const, // <-- Dynamic sameSite
        secure: process.env.NODE_ENV === "production",
        path: '/', // Explicitly set path

    };

    res.clearCookie("jwt", cookieOptions);
    return res.status(200).json({ status: "success", message: "Logout successful" })
})


export const verify = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const user = await UserModel.findOne({ verificationToken: req.query.token });

    if (!user) {
        return res.status(404).send('Invalid verification token.');
    }

    user.approve = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).send('Email verified successfully.');
});

export const protect = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    const token = req.cookies.jwt;

    if (!token) return next(new AppError("Please provide auth token!", 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; iat: number };

    const found = await UserModel.findById(decoded.id);

    if (!found) return next(new AppError("User does not exist!", 401));
    if (found.checkPasswordchanged(decoded.iat)) {
        return next(new AppError("User changed the password!", 401));
    }

    if (!found.active) {
        return next(
            new AppError(
                "User no longer exists! Login to activate your account again",
                403
            )
        );
    }
    if (!found.approve) {
        return next(
            new AppError(
                "User's email not verified! Verify to activate your account",
                403
            )
        );
    }

    req.user = found;
    next();
});

export const restriction = (...roles: IUser['role'][]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError("Access denied!", 403));
        }
        next();
    };
};

export const isOwner = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    let isOwner = false;

    if (req.baseUrl.includes("aircrafts")) {
        if (req.user!.aircrafts?.includes(new Types.ObjectId(id))) {
            isOwner = true;
        }

        // } else if (req.baseUrl.includes("messages")) {
        //     const chat = await ChatModel.findOne({
        //         $or: [{ senderId: req.user!._id }, { receiverId: req.user!._id }]
        //     });
        //     if (chat) {
        //         isOwner = true;
        //     }
        // } else if (req.baseUrl.includes("bookings")) {
        //     const booking = await BookingModel.findOne({
        //         $or: [{ userId: req.user!._id }, { receiverId: req.user!._id }]
        //     });
        //     if (booking) {
        //         isOwner = true;
        //     }
        // } else if (req.baseUrl.includes("notifications")) {
        //     const notification = await NotificationModel.findOne({
        //         userId: req.user!._id,
        //         _id: id
        //     });
        //     if (notification) {
        //         isOwner = true;
        //     }
    }

    if (!isOwner) {
        return next(new AppError("Forbidden: You don't have access to this resource", 403));
    }
    next();
});


export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.email) {
        return next(new AppError("Please provide an email!", 404));
    }

    const found = await UserModel.findOne({ email: req.body.email });
    if (!found) return next(new AppError("Please provide a valid email!", 404));

    const resetToken = found.getPasswordResetToken();

    try {
        await new Email(found).sendResetPassword(`${process.env.FRONTEND_URL}/reset-password?resetToken=${resetToken}`);
        await found.save({ validateBeforeSave: false });
        return res.status(200).json({
            status: "success",
            message: "Password reset email sent",
        });
    } catch (error) {
        found.passwordResetToken = undefined;
        found.passwordResetTokenExpires = undefined;
        await found.save({ validateBeforeSave: false });
        next(
            new AppError("Email not sent for password reset! Try again later", 500)
        );
    }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');
    const found = await UserModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpires: { $gt: new Date(Date.now()) },
    });

    if (!found) return next(new AppError("Token is invalid or expired!", 400));

    found.password = req.body.password;
    found.passwordResetToken = undefined;
    found.passwordResetTokenExpires = undefined;

    await found.save();

    res.status(200).json({
        status: "success",
    });
});

export const updatePassword = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.body.oldPassword) {
        return next(new AppError("Please provide your old password!", 400));
    }

    const found = await UserModel.findById(req.user!._id).select("+password");
    if (!(await found!.correctPassword(req.body.oldPassword))) {
        return next(new AppError("Old password is incorrect!", 400));
    }

    found.password = req.body.password;
    await found.save();

    const token = signToken(found!._id.toString(), res);
    res.status(200).json({
        status: "success",
        token: token,
    });
});
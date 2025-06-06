import jwt from "jsonwebtoken";
import { Response } from "express";

export const signToken = (id: string, res: Response): string => {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRY || !process.env.JWT_COOKIE_EXPIRY) {
        throw new Error("JWT environment variables are not set properly.");
    }

    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    });


    const cookieOptions = {
        expires: new Date(
            Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRY) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const, // <-- Dynamic sameSite
        secure: process.env.NODE_ENV === "production",
        path: '/', // Explicitly set path

    };

    res.cookie("jwt", token, cookieOptions);
    return token;
};

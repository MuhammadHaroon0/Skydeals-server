import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { signToken } from "./jwt";
import userModel from "./../models/userModel";
import AppError from "../utils/AppError";

const router = express.Router();

// Route for authentication
router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
);

interface AuthenticatedRequest extends Request {
    user: Express.User & {
        email: string;
        displayName: string;
    };
}

// Callback route after authentication
router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login`, session: false }),
    async (req: Request, res: Response, next: NextFunction) => {

        const authReq = req as AuthenticatedRequest; // Cast req to our extended type

        try {
            if (!authReq.user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login`)
            }

            const googleUser = authReq.user;

            let found = await userModel.findOne({ email: googleUser.email });

            if (!found) {
                found = await userModel.create({
                    email: googleUser.email,
                    authMethod: "google",
                    name: googleUser.displayName,
                    active: true,
                    role: "seller",
                    approve: true,
                });
            }

            found.active = true;
            await found.save();
            signToken(found._id.toString(), res)
            return res.redirect(`${process.env.FRONTEND_URL}`)
        } catch (error) {
            // console.log(error);

            return next(new AppError("An error occurred verifying with google", 500));
        }
    }
);

export default router;

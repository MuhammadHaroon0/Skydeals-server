import passport from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth2";
import { Request } from "express";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
            // passReqToCallback: true,
        },
        async (req: Request, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
            done(null, profile);
        }
    )
);

passport.serializeUser((user: Express.User, done) => {
    done(null, user);
});

passport.deserializeUser((obj: Express.User, done) => {
    done(null, obj);
});

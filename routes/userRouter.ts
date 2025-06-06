import express from "express";
const router = express.Router();
import { forgotPassword, login, protect, resetPassword, signUp, updatePassword, verify, logout, getMe } from "../controllers/authController";

import { uploadToCloudinary } from "../config/cloudinary";
import { upload } from "../controllers/aircraftController";
import { getMyAds, updateMe } from "../controllers/userController";
import UserModel from "../models/userModel";
import { getOne } from "../controllers/handlerFactory";


router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/get-me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:resetToken", resetPassword);
router.patch("/update-password", protect, updatePassword);
router.route("/verify").get(verify)




router
    .route("/")
    .patch(protect, upload, updateMe);

router
    .get("/get-my-ads", protect, getMyAds)

router
    .route("/:id")
    .get(protect, getOne(UserModel))

export default router;

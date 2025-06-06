import express from "express";
import { approveListing, createAircraft, deleteAircraft, getAircraft, getAircraftByCategory, getRecentAds, getRelatedAds, getUnapprovedAds, rejectListing, upload } from "../controllers/aircraftController";
import { getAll } from "../controllers/handlerFactory";
import { isOwner, protect, restriction } from "../controllers/authController";
import AircraftModel from "../models/aircraftModel";

const router = express.Router();

router.route('/')
    .get(getAircraftByCategory)
    .post(protect, restriction("seller"), upload, createAircraft)

router.patch('/approve-listing/:id', protect, restriction("admin"), approveListing)
router.patch('/reject-listing/:id', protect, restriction("admin"), rejectListing)
router.get('/recent-ads', getRecentAds)
router.get('/unapproved-ads', protect, restriction("admin"), getUnapprovedAds)
router.get('/related-ads/:id', getRelatedAds)

router.route('/:id')
    .get(getAircraft)
    .delete(protect, isOwner, deleteAircraft)

export default router;

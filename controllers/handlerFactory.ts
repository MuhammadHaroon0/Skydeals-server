import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import APIFeatures from '../utils/apiFeatures';
import catchAsync from '../utils/catchAsync';
import ServerResponse from '../utils/serverResponse';
import { Document, Model } from 'mongoose';


export const getAll = <T extends Document>(Model: Model<T>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const query = new APIFeatures(Model.find(), req.query)
            .filter()
            .sort()
            .paginate()
            .limitFields();
        const doc = await query.query;
        return res.status(200).json(new ServerResponse("success", doc));
    });

export const getOne = <T extends Document>(Model: Model<T>, ...options: string[]) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let doc: T | null;
        if (options.length === 1) {
            doc = await Model.findById(req.params.id).populate(options[0]);
        } else if (options.length === 2) {
            doc = await Model.findById(req.params.id).populate(options[0]).populate(options[1]);
        } else {
            doc = await Model.findById(req.params.id);
        }

        if (!doc) {
            return next(new AppError("Doc not found matching this id!", 404));
        }
        return res.status(200).json(new ServerResponse("success", doc));
    });

export const createOne = <T extends Document>(Model: Model<T>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = await Model.create(req.body);
        return res.status(201).json(new ServerResponse("success", doc));
    });

export const updateOne = <T extends Document>(Model: Model<T>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const found = await Model.findByIdAndUpdate(req.params.id, req.body, {
            runValidators: true,
            new: true,
        });
        if (!found) {
            return next(new AppError("Document not found matching this id!", 404));
        }
        return res.status(200).json(new ServerResponse("success", found));
    });

export const deleteOne = <T extends Document>(Model: Model<T>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const doc = await Model.deleteOne({ _id: req.params.id });
        if (doc.deletedCount < 1) {
            return next(new AppError("Document not found matching this id!", 404));
        }
        return res.status(204).json(new ServerResponse("success", doc));
    });
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const handleJWTExpiryError = (): AppError => {
    return new AppError('Token is expired!', 401);
}

const handleJWTVerificationError = (): AppError => {
    return new AppError('Invalid token passed!', 401);
}

const handleValidationError = (error: any): AppError => {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    const message = errors.join('. ');
    return new AppError(message, 400);
}

const handleCastError = (error: any): AppError => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsError = (error: any): AppError => {
    const match = error.errmsg.match(/(["'])(\\?.)*?\1/);
    const value = match ? match[0] : 'Unknown value';
    const message = `Duplicate field value: ${value}, please try another value`;
    return new AppError(message, 400);
}

const handleDevelopmentError = (err: AppError, res: Response): void => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
}

const handleProductionError = (err: AppError, res: Response): void => {
    if (err.isOperational === true) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
        });
    }
}

export default function (err: any, req: Request, res: Response, next: NextFunction): void {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        console.log(err);

        handleDevelopmentError(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = JSON.parse(JSON.stringify(err));
        let finalError: AppError | undefined;

        if (error.name === 'CastError') finalError = handleCastError(error);
        if (error.code === 11000) finalError = handleDuplicateFieldsError(error);
        if (error.name === 'ValidationError') finalError = handleValidationError(error);
        if (error.name === 'JsonWebTokenError') finalError = handleJWTVerificationError();
        if (error.name === 'TokenExpiredError') finalError = handleJWTExpiryError();

        handleProductionError(finalError ? finalError : err, res);
    }
}

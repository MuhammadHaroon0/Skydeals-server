import { Request, Response, NextFunction } from "express";

const catchAsync = (asyncFunction: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    asyncFunction(req, res, next).catch(next);
  };
};

export default catchAsync;

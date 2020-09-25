import { Response, Request, NextFunction } from 'express';

export const wrapAsync = (func: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        func(req, res).catch(next);
    };
}

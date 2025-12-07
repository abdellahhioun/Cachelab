import { Request, Response, NextFunction } from 'express';
import { RequestLoggerClass } from './RequestLoggerClass';

// Create instance of the class
const requestLoggerInstance = new RequestLoggerClass();

// Export function that uses the class
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  requestLoggerInstance.log(req, res, next);
};


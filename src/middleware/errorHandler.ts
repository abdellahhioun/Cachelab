import { Request, Response, NextFunction } from 'express';
import { ErrorHandlerClass } from './ErrorHandlerClass';

// Create instance of the class
const errorHandlerInstance = new ErrorHandlerClass();

// Export function that uses the class
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  errorHandlerInstance.handle(err, req, res, next);
};


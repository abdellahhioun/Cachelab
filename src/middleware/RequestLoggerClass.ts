import { Request, Response, NextFunction } from 'express';

/**
 * RequestLoggerClass
 * Handles logging of HTTP requests
 */
export class RequestLoggerClass {
  /**
   * Log the incoming request
   */
  log(req: Request, res: Response, next: NextFunction): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  }
}


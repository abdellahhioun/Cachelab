import { Request, Response, NextFunction } from 'express';

/**
 * ErrorHandlerClass
 * Handles errors in the application
 */
export class ErrorHandlerClass {
  /**
   * Handle errors
   */
  handle(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
}


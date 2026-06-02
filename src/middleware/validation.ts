import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

/**
 * Validate JWT token from Authorization header
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Authorization header is missing',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token is missing',
      });
      return;
    }

    const decoded = jwt.decode(token, JWT_SECRET);
    (req as any).user = decoded;

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: (error as any).message,
    });
  }
};

/**
 * Optional: Generate JWT token for testing
 */
export const generateToken = (payload: any): string => {
  return jwt.encode(payload, JWT_SECRET);
};

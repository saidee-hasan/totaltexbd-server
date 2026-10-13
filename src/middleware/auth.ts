import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { JWTPayload } from '../types/staff.types.js';
import { Staff } from '../models/Staff.js';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token required. Please login.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
    const staff = await Staff.findById(decoded.userId);

    if (!staff) {
      res.status(401).json({
        success: false,
        message: 'Account no longer exists. Please login again.',
      });
      return;
    }

    if (staff.status !== 'active') {
      res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact a Super Admin.',
      });
      return;
    }

    req.user = staff.toJSON() as any;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
};

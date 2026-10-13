import { IStaffSafe } from './staff.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: IStaffSafe;
    }
  }
}

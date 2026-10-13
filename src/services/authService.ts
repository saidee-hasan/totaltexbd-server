import jwt from 'jsonwebtoken';
import { Staff } from '../models/Staff.js';
import { ENV } from '../config/env.js';
import { IStaffSafe, JWTPayload, formatStaff } from '../types/staff.types.js';

export class AuthService {
  static async login(email: string, candidatePassword: string): Promise<{ token: string; staff: IStaffSafe }> {
    const staff = await Staff.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!staff) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const isMatch = await staff.comparePassword(candidatePassword);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    if (staff.status !== 'active') {
      throw { status: 403, message: 'Your account is inactive. Please contact a Super Admin.' };
    }

    // Update lastLogin timestamp
    staff.lastLogin = new Date();
    await staff.save();

    const payload: JWTPayload = {
      userId: staff._id.toString(),
      email: staff.email,
      role: staff.role,
      name: staff.name,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as any,
    });

    return {
      token,
      staff: formatStaff(staff),
    };
  }

  static async getProfile(userId: string): Promise<IStaffSafe> {
    const staff = await Staff.findById(userId);
    if (!staff) {
      throw { status: 404, message: 'Staff profile not found.' };
    }
    return formatStaff(staff);
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; currentPassword?: string; password?: string; avatar?: string }
  ): Promise<IStaffSafe> {
    const staff = await Staff.findById(userId).select('+password');
    if (!staff) {
      throw { status: 404, message: 'Staff profile not found.' };
    }

    if (data.name && data.name.trim()) {
      staff.name = data.name.trim();
    }

    if (data.avatar !== undefined) {
      staff.avatar = data.avatar.trim();
    }

    if (data.password && data.password.trim()) {
      if (!data.currentPassword) {
        throw { status: 400, message: 'Current password is required to change password.' };
      }
      
      const isMatch = await staff.comparePassword(data.currentPassword);
      if (!isMatch) {
        throw { status: 400, message: 'Incorrect current password.' };
      }

      if (data.password.length < 8) {
        throw { status: 400, message: 'For high security, password must be at least 8 characters long.' };
      }
      staff.password = data.password;
    }

    await staff.save();
    return formatStaff(staff);
  }
}

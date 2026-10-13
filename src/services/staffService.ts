import { Staff } from '../models/Staff.js';
import { IStaffSafe, StaffFilterQuery, StaffRole, StaffStatus, formatStaff } from '../types/staff.types.js';
import { escapeRegex } from '../utils/escapeRegex.js';

export class StaffService {
  static async getStaffList(query: StaffFilterQuery) {
    const {
      search = '',
      role = 'all',
      status = 'all',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: Record<string, any> = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(1000, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Whitelist sortable fields to avoid arbitrary/unindexed sort keys.
    const sortableFields = ['createdAt', 'updatedAt', 'name', 'email', 'role', 'status', 'lastLogin'];
    const sortField = sortableFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';
    const sortOption: Record<string, 1 | -1> = {
      [sortField]: sortOrder === 'asc' ? 1 : -1,
    };

    const [staffList, total, totalSuperAdmin, totalAdmin, totalModerator, totalActive, totalInactive] =
      await Promise.all([
        Staff.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limitNum),
        Staff.countDocuments(filter),
        Staff.countDocuments({ role: 'superadmin' }),
        Staff.countDocuments({ role: 'admin' }),
        Staff.countDocuments({ role: 'moderator' }),
        Staff.countDocuments({ status: 'active' }),
        Staff.countDocuments({ status: 'inactive' }),
      ]);

    return {
      staff: staffList.map((s) => formatStaff(s)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      stats: {
        totalStaff: totalSuperAdmin + totalAdmin + totalModerator,
        totalSuperAdmin,
        totalAdmin,
        totalModerator,
        totalActive,
        totalInactive,
      },
    };
  }

  static async getStaffById(id: string): Promise<IStaffSafe> {
    const staff = await Staff.findById(id);
    if (!staff) {
      throw { status: 404, message: 'Staff member not found.' };
    }
    return formatStaff(staff);
  }

  static async createStaff(data: {
    name: string;
    email: string;
    password: string;
    role?: StaffRole;
    status?: StaffStatus;
    avatar?: string;
  }, actorRole: StaffRole = 'superadmin'): Promise<IStaffSafe> {
    if (actorRole !== 'superadmin' && data.role === 'superadmin') {
      throw { status: 403, message: 'Only a Super Admin can create another Super Admin.' };
    }

    const emailNormalized = data.email.toLowerCase().trim();
    const existing = await Staff.findOne({ email: emailNormalized });
    if (existing) {
      throw { status: 409, message: 'A staff member with this email already exists.' };
    }

    if (!data.password || data.password.length < 8) {
      throw { status: 400, message: 'For high security, password must be at least 8 characters long.' };
    }

    const newStaff = new Staff({
      name: data.name.trim(),
      email: emailNormalized,
      password: data.password,
      role: data.role || 'moderator',
      status: data.status || 'active',
      avatar: data.avatar?.trim() || '',
    });

    await newStaff.save();
    return formatStaff(newStaff);
  }

  static async updateStaff(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: StaffRole;
      status?: StaffStatus;
      password?: string;
      avatar?: string;
    },
    actorRole: StaffRole = 'superadmin'
  ): Promise<IStaffSafe> {
    const staff = await Staff.findById(id).select('+password');
    if (!staff) {
      throw { status: 404, message: 'Staff member not found.' };
    }

    if (actorRole !== 'superadmin') {
      if (staff.role === 'superadmin') {
        throw { status: 403, message: 'Only a Super Admin can modify a Super Admin account.' };
      }
      if (data.role === 'superadmin') {
        throw { status: 403, message: 'Only a Super Admin can grant the Super Admin role.' };
      }
    }

    if (data.email && data.email.toLowerCase().trim() !== staff.email) {
      const emailNormalized = data.email.toLowerCase().trim();
      const existing = await Staff.findOne({ email: emailNormalized, _id: { $ne: id } });
      if (existing) {
        throw { status: 409, message: 'Another staff member already uses this email address.' };
      }
      staff.email = emailNormalized;
    }

    if (data.name && data.name.trim()) {
      staff.name = data.name.trim();
    }

    if (data.role) {
      staff.role = data.role;
    }

    if (data.status) {
      staff.status = data.status;
    }

    if (data.avatar !== undefined) {
      staff.avatar = data.avatar.trim();
    }

    if (data.password && data.password.trim()) {
      if (data.password.length < 8) {
        throw { status: 400, message: 'For high security, password must be at least 8 characters long.' };
      }
      staff.password = data.password;
    }

    await staff.save();
    return formatStaff(staff);
  }

  static async toggleStatus(
    id: string,
    currentUserId: string,
    actorRole: StaffRole = 'superadmin'
  ): Promise<IStaffSafe> {
    const staff = await Staff.findById(id);
    if (!staff) {
      throw { status: 404, message: 'Staff member not found.' };
    }

    if (actorRole !== 'superadmin' && staff.role === 'superadmin') {
      throw { status: 403, message: 'Only a Super Admin can change a Super Admin account status.' };
    }

    if (String(staff._id) === String(currentUserId) && staff.status === 'active') {
      throw { status: 400, message: 'You cannot deactivate your own account.' };
    }

    staff.status = staff.status === 'active' ? 'inactive' : 'active';
    await staff.save();
    return formatStaff(staff);
  }

  static async deleteStaff(
    id: string,
    currentUserId: string,
    actorRole: StaffRole = 'superadmin'
  ): Promise<void> {
    if (String(id) === String(currentUserId)) {
      throw { status: 400, message: 'You cannot delete your own account.' };
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      throw { status: 404, message: 'Staff member not found.' };
    }

    if (actorRole !== 'superadmin' && staff.role === 'superadmin') {
      throw { status: 403, message: 'Only a Super Admin can delete a Super Admin account.' };
    }

    // Safety check: ensure at least one superadmin remains
    if (staff.role === 'superadmin') {
      const superAdminCount = await Staff.countDocuments({ role: 'superadmin' });
      if (superAdminCount <= 1) {
        throw { status: 400, message: 'Cannot delete the only Super Admin account in the system.' };
      }
    }

    await Staff.findByIdAndDelete(id);
  }
}

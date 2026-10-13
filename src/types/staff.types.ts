export type StaffRole = 'superadmin' | 'admin' | 'moderator';
export type StaffStatus = 'active' | 'inactive';

export interface IStaff {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: StaffRole;
  status: StaffStatus;
  avatar?: string;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaffSafe {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  avatar?: string;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const formatStaff = (doc: any): IStaffSafe => {
  const json = typeof doc.toJSON === 'function' ? doc.toJSON() : doc;
  return {
    _id: String(json._id),
    name: json.name,
    email: json.email,
    role: json.role,
    status: json.status,
    avatar: json.avatar || '',
    lastLogin: json.lastLogin || null,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
};

export interface StaffFilterQuery {
  search?: string;
  role?: StaffRole | 'all';
  status?: StaffStatus | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: StaffRole;
  name: string;
}

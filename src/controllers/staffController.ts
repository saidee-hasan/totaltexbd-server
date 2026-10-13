import { Request, Response, NextFunction } from 'express';
import { StaffService } from '../services/staffService.js';

export class StaffController {
  static async getStaffList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, role, status, page, limit, sortBy, sortOrder } = req.query;
      const result = await StaffService.getStaffList({
        search: search as string,
        role: role as any,
        status: status as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        sortBy: sortBy as string,
        sortOrder: sortOrder as any,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStaffById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const staff = await StaffService.getStaffById(id);
      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role, status, avatar } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Name, email, and password are required.',
        });
        return;
      }

      const newStaff = await StaffService.createStaff(
        { name, email, password, role, status, avatar },
        req.user!.role
      );

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully.',
        data: newStaff,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { name, email, role, status, password, avatar } = req.body;
      const updated = await StaffService.updateStaff(
        id,
        { name, email, role, status, password, avatar },
        req.user!.role
      );

      res.status(200).json({
        success: true,
        message: 'Staff updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await StaffService.toggleStatus(id, req.user!._id, req.user!.role);
      res.status(200).json({
        success: true,
        message: `Staff account status changed to ${updated.status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await StaffService.deleteStaff(id, req.user!._id, req.user!.role);
      res.status(200).json({
        success: true,
        message: 'Staff member deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

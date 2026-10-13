import { Request, Response, NextFunction } from 'express';
import { SectionService } from '../services/sectionService.js';

export class SectionController {
  static async getSections(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sections = await SectionService.getAllSections();
      res.status(200).json({ success: true, data: sections });
    } catch (error) {
      next(error);
    }
  }

  static async getSectionByKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
      const section = await SectionService.getSectionByKey(key);
      res.status(200).json({ success: true, data: section });
    } catch (error) {
      next(error);
    }
  }

  static async updateSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
      const updated = await SectionService.upsertSection(key, req.body);
      res.status(200).json({
        success: true,
        message: `Section '${updated.sectionName}' updated successfully.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

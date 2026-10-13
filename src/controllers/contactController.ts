import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contactService.js';

export class ContactController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await ContactService.create(req.body ?? {});
      res.status(201).json({
        success: true,
        message: 'Thank you for reaching out. We will contact you shortly.',
        data: { id: message._id },
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ContactService.list({
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
      });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await ContactService.markRead(id);
      res.status(200).json({ success: true, message: 'Message marked as read.', data });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await ContactService.remove(id);
      res.status(200).json({ success: true, message: 'Message deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

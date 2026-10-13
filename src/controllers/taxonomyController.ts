import { Request, Response, NextFunction } from 'express';
import { TaxonomyService } from '../services/taxonomyService.js';

export const createTaxonomyController = (service: TaxonomyService) => ({
  getList: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await service.list(req.query as Record<string, unknown>);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await service.getById(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await service.create(req.body as Record<string, any>);
      res.status(201).json({ success: true, message: 'Created successfully.', data });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await service.update(id, req.body as Record<string, any>);
      res.status(200).json({ success: true, message: 'Updated successfully.', data });
    } catch (error) {
      next(error);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await service.remove(id);
      res.status(200).json({ success: true, message: 'Deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },
});

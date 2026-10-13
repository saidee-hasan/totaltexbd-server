import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/uploadService.js';
import { ENV } from '../config/env.js';

export class UploadController {
  static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { image } = req.body;
      if (!image) {
        res.status(400).json({
          success: false,
          message: 'Image data (base64 string or URL) is required.',
        });
        return;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const result = await UploadService.uploadImage(image, baseUrl);
      res.status(200).json({
        success: true,
        message: `Image uploaded to ${result.provider} successfully.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { video } = req.body;
      if (!video) {
        res.status(400).json({
          success: false,
          message: 'Video data (base64 data URL) is required.',
        });
        return;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const result = await UploadService.uploadVideo(video, baseUrl);
      res.status(200).json({
        success: true,
        message: `Video uploaded via ${result.provider} successfully.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicId = req.body?.publicId || req.params?.publicId;
      if (!publicId) {
        res.status(400).json({ success: false, message: 'Image public id is required.' });
        return;
      }

      const result = await UploadService.deleteFromCloudinary(publicId);
      res.status(200).json({
        success: true,
        message: 'Image deleted from Cloudinary successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getConfig(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        provider: UploadService.getProvider(),
        folder: ENV.CLOUDINARY_FOLDER,
        deleteSupported: UploadService.getProvider() === 'cloudinary',
      },
    });
  }
}

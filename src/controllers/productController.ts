import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService.js';
import { IProductColor, IProductSize } from '../models/Product.js';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, category, inStock } = req.query;
      const data = await ProductService.getProducts({
        search: search as string,
        category: category as string,
        inStock: inStock as any,
      });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const product = await ProductService.getProductById(id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { colors, sizes, ...rest } = req.body;
      const productData: any = { ...rest };
      if (colors) {
        productData.colors = colors.map((c: any) => ({
          name: c.name,
          hex: c.hex || '#000000',
        })) as IProductColor[];
      }
      if (sizes) {
        productData.sizes = sizes.map((s: any) => ({
          name: s.name,
          inStock: s.inStock !== false,
        })) as IProductSize[];
      }
      const product = await ProductService.createProduct(productData);
      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { colors, sizes, ...rest } = req.body;
      const updateData: any = { ...rest };
      if (colors !== undefined) {
        updateData.colors = colors.map((c: any) => ({
          name: c.name,
          hex: c.hex || '#000000',
        })) as IProductColor[];
      }
      if (sizes !== undefined) {
        updateData.sizes = sizes.map((s: any) => ({
          name: s.name,
          inStock: s.inStock !== false,
        })) as IProductSize[];
      }
      const product = await ProductService.updateProduct(id, updateData);
      res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await ProductService.deleteProduct(id);
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

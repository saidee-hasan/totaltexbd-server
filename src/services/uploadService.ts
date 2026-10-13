import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { ENV } from '../config/env.js';

export type UploadProvider = 'cloudinary' | 'imgbb' | 'local';

export interface UploadResult {
  url: string;
  displayUrl: string;
  id: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  provider: UploadProvider;
}

let isCloudinaryReady = false;

export const isCloudinaryConfigured = (): boolean =>
  ENV.UPLOAD_PROVIDER !== 'imgbb' &&
  Boolean(ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_API_SECRET);

const getUploadProvider = (): UploadProvider => {
  if (ENV.UPLOAD_PROVIDER === 'imgbb' && ENV.IMGBB_API_KEY) return 'imgbb';
  if (isCloudinaryConfigured()) return 'cloudinary';
  if (ENV.IMGBB_API_KEY) return 'imgbb';
  return 'local';
};

const configureCloudinary = (): void => {
  if (isCloudinaryReady) return;
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
    secure: true,
  });
  isCloudinaryReady = true;
};

const toCloudinarySource = (input: string): string => {
  if (/^https?:\/\//i.test(input) || input.startsWith('data:')) return input;
  return `data:image/png;base64,${input}`;
};

export class UploadService {
  static getProvider(): UploadProvider {
    return getUploadProvider();
  }

  static isConfigured(): boolean {
    return true; // local storage is always available as a fallback
  }

  static async uploadImage(image: string, baseUrl = ''): Promise<UploadResult> {
    if (!image || typeof image !== 'string') {
      throw { status: 400, message: 'Image data is required.' };
    }
    const provider = getUploadProvider();
    if (provider === 'cloudinary') {
      return UploadService.uploadToCloudinary(image);
    }
    if (provider === 'imgbb') {
      try {
        return await UploadService.uploadToImgBB(image);
      } catch {
        // ImgBB can be rate-limited — fall back to local storage.
        return UploadService.uploadImageLocal(image, baseUrl);
      }
    }
    return UploadService.uploadImageLocal(image, baseUrl);
  }

  static async uploadImageLocal(input: string, baseUrl: string): Promise<UploadResult> {
    // Already a hosted URL — nothing to store on disk.
    if (/^https?:\/\//i.test(input)) {
      return { url: input, displayUrl: input, id: input, provider: 'local' };
    }

    const match = input.match(/^data:(image\/[\w.+-]+);base64,(.+)$/s);
    const mime = (match?.[1] || 'image/png').toLowerCase();
    const raw = match ? match[2] : input.replace(/^data:.*?base64,/, '');

    const ext = mime.includes('webp')
      ? 'webp'
      : mime.includes('jpeg') || mime.includes('jpg')
        ? 'jpg'
        : mime.includes('gif')
          ? 'gif'
          : mime.includes('svg')
            ? 'svg'
            : 'png';

    const dir = path.resolve(process.cwd(), 'uploads', 'images');
    fs.mkdirSync(dir, { recursive: true });

    const filename = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
    const buffer = Buffer.from(raw, 'base64');
    fs.writeFileSync(path.join(dir, filename), buffer);

    const url = `${baseUrl}/uploads/images/${filename}`;
    return { url, displayUrl: url, id: filename, provider: 'local', bytes: buffer.length, format: ext };
  }

  static async uploadToCloudinary(input: string): Promise<UploadResult> {
    configureCloudinary();
    try {
      const result = await cloudinary.uploader.upload(toCloudinarySource(input), {
        folder: ENV.CLOUDINARY_FOLDER,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        // Normalise any upload so huge photos are capped (never upscaled) and
        // served in a modern, optimized format. `crop: 'limit'` keeps small
        // images untouched while containing large ones within the design size.
        transformation: [
          { width: 1920, height: 1920, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
      });

      return {
        url: result.secure_url,
        displayUrl: result.secure_url,
        id: result.public_id,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        provider: 'cloudinary',
      };
    } catch (error) {
      const message =
        (error as { message?: string })?.message || 'Failed to upload image to Cloudinary.';
      throw { status: 502, message };
    }
  }

  static async uploadVideo(input: string, baseUrl: string): Promise<UploadResult> {
    if (!input || typeof input !== 'string') {
      throw { status: 400, message: 'Video data is required.' };
    }

    if (getUploadProvider() === 'cloudinary') {
      configureCloudinary();
      try {
        const result = await cloudinary.uploader.upload(input, {
          folder: ENV.CLOUDINARY_FOLDER,
          resource_type: 'video',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        });
        return {
          url: result.secure_url,
          displayUrl: result.secure_url,
          id: result.public_id,
          publicId: result.public_id,
          provider: 'cloudinary',
        };
      } catch (error) {
        const message =
          (error as { message?: string })?.message || 'Failed to upload video to Cloudinary.';
        throw { status: 502, message };
      }
    }

    // Local fallback: persist the base64 video into a served uploads folder.
    const match = input.match(/^data:(video\/[\w.+-]+);base64,(.+)$/);
    if (!match) {
      throw { status: 400, message: 'Invalid video data. Expected a base64 data URL.' };
    }

    const mime = match[1].toLowerCase();
    const ext = mime.includes('quicktime') ? 'mov' : mime.includes('webm') ? 'webm' : mime.includes('ogg') ? 'ogv' : 'mp4';
    const dir = path.resolve(process.cwd(), 'uploads', 'videos');
    fs.mkdirSync(dir, { recursive: true });

    const filename = `${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(dir, filename), Buffer.from(match[2], 'base64'));

    const url = `${baseUrl}/uploads/videos/${filename}`;
    return { url, displayUrl: url, id: filename, provider: 'local' };
  }

  static async deleteFromCloudinary(publicId: string): Promise<{ result: string }> {
    if (!publicId) {
      throw { status: 400, message: 'Image public id is required.' };
    }
    if (getUploadProvider() !== 'cloudinary') {
      throw { status: 400, message: 'Cloudinary is not configured.' };
    }
    configureCloudinary();
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      });
      return { result: result.result };
    } catch (error) {
      const message =
        (error as { message?: string })?.message || 'Failed to delete image from Cloudinary.';
      throw { status: 502, message };
    }
  }

  static async uploadToImgBB(imageBase64OrUrl: string): Promise<UploadResult> {
    if (!imageBase64OrUrl) {
      throw { status: 400, message: 'Image data is required.' };
    }

    let cleanImage = imageBase64OrUrl;
    if (cleanImage.includes('base64,')) {
      cleanImage = cleanImage.split('base64,')[1];
    }

    const formData = new FormData();
    formData.append('image', cleanImage);

    const endpoint = `https://api.imgbb.com/1/upload?key=${ENV.IMGBB_API_KEY}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const result = (await response.json()) as {
      success: boolean;
      error?: { message?: string };
      data: { url: string; display_url?: string; id: string; width?: number; height?: number };
    };

    if (!response.ok || !result.success) {
      const errorMsg = result?.error?.message || 'Failed to upload image to ImgBB.';
      throw { status: response.status || 500, message: errorMsg };
    }

    return {
      url: result.data.url,
      displayUrl: result.data.display_url || result.data.url,
      id: result.data.id,
      width: result.data.width,
      height: result.data.height,
      provider: 'imgbb',
    };
  }
}

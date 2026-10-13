import dotenv from 'dotenv';
dotenv.config();

const parseList = (value: string | undefined): string[] =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/totalapparel',
  // Never ship a hardcoded fallback secret in production. In production the
  // server refuses to start unless JWT_SECRET is explicitly configured.
  JWT_SECRET: process.env.JWT_SECRET || 'totalapparel_default_jwt_secret_change_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Super Admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@gmail.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '123456',
  // Comma-separated list of allowed origins. '*' allows any origin (dev default).
  CORS_ORIGINS: parseList(process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || '*'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  // Secrets must be supplied via environment variables — never hardcode them here.
  IMGBB_API_KEY: process.env.IMGBB_API_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || 'totalapparel',
  UPLOAD_PROVIDER: (process.env.UPLOAD_PROVIDER || 'auto').toLowerCase(),
};

export const isProduction = ENV.NODE_ENV === 'production';

/**
 * Fails fast in production when security-critical configuration is missing so a
 * misconfigured deployment can never go live with a default/predictable secret.
 */
export const assertProductionConfig = (): void => {
  if (!isProduction) return;

  const problems: string[] = [];
  if (!process.env.JWT_SECRET || ENV.JWT_SECRET.includes('change_in_prod')) {
    problems.push('JWT_SECRET must be set to a strong, unique value in production.');
  }
  if (!process.env.ADMIN_PASSWORD && ENV.ADMIN_PASSWORD === '123456') {
    problems.push('ADMIN_PASSWORD must be set to a strong value in production.');
  }
  if (problems.length) {
    throw new Error(`[Config] Invalid production configuration:\n- ${problems.join('\n- ')}`);
  }
};

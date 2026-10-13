import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/security.js';
import { renderHomePage, homePageInfo } from './views/homePage.js';

const app: Express = express();

// Security headers on every response.
app.use(securityHeaders);

// CORS: support a comma-separated allow-list. `*` (the dev default) reflects
// the requesting origin. Credentials are disabled because authentication uses
// Bearer tokens in the Authorization header rather than cookies — this avoids
// the unsafe "reflect any origin + allow credentials" combination.
const allowAllOrigins =
  ENV.CORS_ORIGINS.includes('*') || ENV.CORS_ORIGINS.length === 0;
app.use(cors({
  origin: allowAllOrigins ? true : ENV.CORS_ORIGINS,
  credentials: false,
}));
app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ extended: true, limit: '80mb' }));

// Serve locally stored uploads (video fallback when Cloudinary is not configured)
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Public API responses may be cached but must always revalidate, so unchanged
// content is served as a fast 304 and edits appear immediately (never stale).
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  next();
});

// API landing / status page (no database required)
app.get('/', (_req, res) => {
  res.status(200).type('html').send(renderHomePage());
});

// API index (JSON)
app.get('/api', (_req, res) => {
  res.status(200).json({ success: true, data: homePageInfo() });
});

// Health check endpoint (no database required)
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Ensure the database is connected before handling API requests.
// This is essential on serverless hosts (Vercel), where the long-running
// server.ts entrypoint (and its connectDB call) does not run.
app.use('/api', async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use('/api', apiRoutes);

/**
 * Resolve a directory that contains a built front-end (index.html).
 * Checks PUBLIC_DIR first, then ./public, then ../admin/dist so the server
 * can serve the admin panel out of the box during local development.
 */
const resolvePublicDir = (): string | null => {
  const candidates = [
    process.env.PUBLIC_DIR,
    path.resolve(process.cwd(), 'public'),
    path.resolve(process.cwd(), '../admin/dist'),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
    } catch {
      // ignore
    }
  }
  return null;
};

const publicDir = resolvePublicDir();

if (publicDir) {
  console.log(`[Server] Serving front-end from: ${publicDir}`);
  app.use(express.static(publicDir));

  // SPA fallback: any non-API GET serves index.html so client-side routes work
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV, assertProductionConfig } from './config/env.js';
import { UploadService } from './services/uploadService.js';
import { seedInitialAdmin, seedInitialProducts, seedInitialSections, seedInitialTaxonomies, seedInitialNews } from './scripts/seed.js';

const startServer = async () => {
  try {
    assertProductionConfig();
    await connectDB();

    app.listen(ENV.PORT, () => {
      console.log(`[Server] TotalApparel API Server running on port ${ENV.PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Upload] Active image provider: ${UploadService.getProvider()}`);
    });

    // Seed in the background so the server starts responding immediately.
    (async () => {
      try {
        await seedInitialAdmin();
        await seedInitialProducts();
        await seedInitialSections();
        await seedInitialTaxonomies();
        await seedInitialNews();
      } catch (seedErr) {
        console.error('[Server] Seeding error:', seedErr);
      }
    })();
  } catch (err) {
    console.error('[Server] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { Product } from '../models/Product.js';
import { PRODUCT_CATALOG } from './productCatalog.js';

/**
 * One-off maintenance script: clears the entire product collection and
 * re-inserts the curated 20-product catalog. Run with:
 *   npx tsx src/scripts/replaceProducts.ts
 */
const run = async (): Promise<void> => {
  await mongoose.connect(ENV.MONGODB_URI);
  console.log('[Replace] Connected to database');

  const removed = await Product.deleteMany({});
  console.log(`[Replace] Removed ${removed.deletedCount} existing product(s).`);

  const inserted = await Product.insertMany(PRODUCT_CATALOG);
  console.log(`[Replace] Inserted ${inserted.length} product(s).`);

  await mongoose.disconnect();
  console.log('[Replace] Done');
  process.exit(0);
};

run().catch((err) => {
  console.error('[Replace] Failed:', err);
  process.exit(1);
});

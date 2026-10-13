import mongoose from 'mongoose';
import { ENV } from '../config/env.js';

const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

const dbStatus = () => {
  switch (mongoose.connection.readyState) {
    case 1:
      return { label: 'Connected', tone: 'ok', host: mongoose.connection.host || '—' };
    case 2:
      return { label: 'Connecting', tone: 'warn', host: '—' };
    case 3:
      return { label: 'Disconnecting', tone: 'warn', host: '—' };
    default:
      return { label: 'Disconnected', tone: 'bad', host: '—' };
  }
};

const ENDPOINTS: { method: string; path: string; desc: string }[] = [
  { method: 'GET', path: '/api/health', desc: 'Health check' },
  { method: 'POST', path: '/api/auth/login', desc: 'Staff login' },
  { method: 'GET', path: '/api/auth/me', desc: 'Current session' },
  { method: 'GET|POST', path: '/api/products', desc: 'List / create products' },
  { method: 'GET|PUT|DELETE', path: '/api/products/:id', desc: 'Read / update / delete product' },
  { method: 'GET|POST', path: '/api/categories', desc: 'List / create categories' },
  { method: 'GET|POST', path: '/api/subcategories', desc: 'List / create subcategories' },
  { method: 'GET|POST', path: '/api/brands', desc: 'List / create brands' },
  { method: 'GET|POST', path: '/api/colors', desc: 'List / create colors' },
  { method: 'GET|POST', path: '/api/sizes', desc: 'List / create sizes' },
  { method: 'GET|POST', path: '/api/news', desc: 'List / create news articles' },
  { method: 'GET|PUT', path: '/api/sections/:key', desc: 'Read / update website sections' },
  { method: 'POST', path: '/api/upload', desc: 'Upload image (base64)' },
];

export const renderHomePage = (): string => {
  const db = dbStatus();
  const env = process.env.NODE_ENV || 'development';
  const uptime = formatUptime(process.uptime());
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const year = new Date().getFullYear();

  const toneColor: Record<string, string> = {
    ok: '#10b981',
    warn: '#f59e0b',
    bad: '#ef4444',
  };

  const cards = [
    { label: 'Status', value: 'Healthy', dot: '#10b981' },
    { label: 'Environment', value: env },
    { label: 'Uptime', value: uptime },
    { label: 'Database', value: db.label, dot: toneColor[db.tone] },
    { label: 'DB Host', value: db.host },
    { label: 'Server Time', value: now },
  ];

  const cardHtml = cards
    .map(
      (c) => `
        <div class="card">
          <div class="card-label">${c.label}</div>
          <div class="card-value">
            ${c.dot ? `<span class="dot" style="background:${c.dot}"></span>` : ''}
            ${c.value}
          </div>
        </div>`
    )
    .join('');

  const endpointHtml = ENDPOINTS.map(
    (e) => `
      <li class="ep">
        <span class="method">${e.method}</span>
        <code>${e.path}</code>
        <span class="ep-desc">${e.desc}</span>
      </li>`
  ).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Total Apparel API</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    background: #fafafa;
    color: #111;
    min-height: 100vh;
    padding: 40px 20px;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 960px; margin: 0 auto; }
  header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; font-size: 14px; }
  .brand .mark { width: 30px; height: 30px; border-radius: 9px; background: linear-gradient(135deg,#FB923C,#EA580C); display: inline-flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 13px; }
  .brand .muted { color: #FB923C; }
  .status { display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .status .pulse { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,.18); }
  .hero { background: linear-gradient(135deg,#FB923C,#EA580C); border-radius: 22px; padding: 40px; color: #fff; position: relative; overflow: hidden; margin-bottom: 26px; }
  .hero:before { content:''; position:absolute; right:-60px; top:-70px; width: 240px; height: 240px; border-radius: 50%; background: rgba(255,255,255,.12); }
  .hero:after { content:''; position:absolute; right:70px; bottom:-90px; width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,.10); }
  .hero h1 { font-size: 30px; font-weight: 800; letter-spacing: -.02em; position: relative; }
  .hero p { margin-top: 10px; font-size: 14px; opacity: .95; max-width: 520px; line-height: 1.6; position: relative; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 26px; }
  @media (max-width: 720px) { .grid { grid-template-columns: repeat(2, 1fr); } .hero { padding: 28px; } .hero h1 { font-size: 24px; } }
  @media (max-width: 440px) { .grid { grid-template-columns: 1fr; } }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px 18px; }
  .card-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; }
  .card-value { margin-top: 8px; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; word-break: break-word; }
  .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  .panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 18px; padding: 22px 24px; margin-bottom: 26px; }
  .panel h2 { font-size: 14px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .panel h2 .bar { width: 4px; height: 16px; border-radius: 4px; background: #FB923C; }
  ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 22px; }
  @media (max-width: 720px) { ul { grid-template-columns: 1fr; } }
  .ep { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; border: 1px solid #f3f4f6; background: #fafafa; font-size: 12px; }
  .method { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; font-weight: 700; color: #EA580C; background: #fff7ed; border: 1px solid #fed7aa; padding: 2px 7px; border-radius: 6px; white-space: nowrap; }
  .ep code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #111; }
  .ep-desc { margin-left: auto; color: #9ca3af; font-size: 11px; text-align: right; }
  footer { text-align: center; color: #9ca3af; font-size: 11px; padding: 8px 0 20px; }
  footer a { color: #FB923C; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">
        <span class="mark">TA</span>
        Total Apparel <span class="muted">API</span>
      </div>
      <span class="status"><span class="pulse"></span> API Online</span>
    </header>

    <section class="hero">
      <h1>Total Apparel API is running</h1>
      <p>REST API powering the Total Apparel admin panel and storefront. All endpoints are served under <strong>/api</strong>.</p>
    </section>

    <section class="grid">
      ${cardHtml}
    </section>

    <section class="panel">
      <h2><span class="bar"></span> Available Endpoints</h2>
      <ul>${endpointHtml}</ul>
    </section>

    <footer>
      © ${year} Total Apparel · API v1.0 · <a href="/api/health">/api/health</a>
    </footer>
  </div>
</body>
</html>`;
};

export const homePageInfo = () => ({
  name: 'Total Apparel API',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  database: dbStatus().label,
  endpoints: ENDPOINTS.map((e) => `${e.method} ${e.path}`),
  corsOrigin: ENV.CORS_ORIGIN,
  timestamp: new Date().toISOString(),
});

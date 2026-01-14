import { createServer } from 'vite';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  if (isProduction) {
    // Production mode - serve built files
    const distPath = resolve(__dirname, 'dist');
    
    if (!fs.existsSync(distPath)) {
      console.error('❌ dist folder not found. Run "npm run build" first.');
      process.exit(1);
    }

    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(resolve(distPath, 'index.html'));
    });

    console.log(`🚀 Production server running on port ${PORT}`);
  } else {
    // Development mode - use Vite dev server
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);
    console.log(`🔧 Development server running on port ${PORT}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server listening on http://0.0.0.0:${PORT}`);
    console.log(`🌍 Environment: ${isProduction ? 'production' : 'development'}`);
  });
}

startServer().catch(err => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

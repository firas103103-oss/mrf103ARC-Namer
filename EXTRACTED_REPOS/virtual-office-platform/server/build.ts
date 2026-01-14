import { build } from 'esbuild';

async function buildServer() {
  console.log('🏗️  Building server...');

  try {
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/server/index.js',
      external: [
        'express',
        'pg',
        'bcrypt',
        'multer',
        'dotenv',
        'helmet',
        'cors',
        'express-session',
        'connect-pg-simple',
        'express-rate-limit',
        'drizzle-orm',
        'zod'
      ],
      sourcemap: false,
      minify: true
    });

    console.log('✅ Server build complete!');
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();

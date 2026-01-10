/**
 * Environment Variables Validator
 * Validates all required environment variables at startup
 */

import logger from './logger';

interface EnvConfig {
  required: string[];
  optional: string[];
}

const ENV_CONFIG: EnvConfig = {
  required: [
    'DATABASE_URL',
  ],
  optional: [
    'PORT',
    'NODE_ENV',
    'SESSION_SECRET',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'OPENAI_API_KEY',
    'OPENAI_MODEL',
    'ANTHROPIC_API_KEY',
    'GEMINI_API_KEY',
    'ELEVENLABS_API_KEY',
    'ARC_OPERATOR_PASSWORD',
    'ARC_BACKEND_SECRET',
    'X_ARC_SECRET',
    'TOKEN_TTL',
    'REFRESH_TTL',
  ],
};

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validates all required environment variables
 * Throws EnvValidationError if any required variable is missing
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of ENV_CONFIG.required) {
    if (!process.env[key] || process.env[key]?.trim() === '') {
      missing.push(key);
    }
  }

  // Check optional but recommended variables
  for (const key of ENV_CONFIG.optional) {
    if (!process.env[key] || process.env[key]?.trim() === '') {
      warnings.push(key);
    }
  }

  // Throw error if any required variable is missing
  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\n` +
      `Please set these variables in your .env file or environment.`
    );
  }

  // Log warnings for optional variables
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    logger.warn('⚠️  Optional environment variables not set:');
    warnings.forEach(key => logger.warn(`   - ${key}`));
    logger.warn('   Some features may be limited.\n');
  }

  // Validate specific formats
  validateDatabaseUrl();
  validateSupabaseConfig();

  console.log('✅ Environment variables validated successfully');
}

function validateDatabaseUrl(): void {
  const dbUrl = process.env.DATABASE_URL;
  
  // Allow more flexible DATABASE_URL in development
  if (process.env.NODE_ENV === 'development') {
    if (!dbUrl) {
      logger.warn('DATABASE_URL not set in development, using mock database');
      return;
    }
    // Allow file:// URLs and mock URLs in development
    if (dbUrl.startsWith('postgresql://') || 
        dbUrl.startsWith('file:') || 
        dbUrl.includes('dev:dev@localhost')) {
      return;
    }
  }
  
  // Production validation
  if (!dbUrl || !dbUrl.startsWith('postgresql://')) {
    throw new EnvValidationError(
      'DATABASE_URL must be a valid PostgreSQL connection string (starting with postgresql://)'
    );
  }
}

function validateSupabaseConfig(): void {
  // Skip Supabase validation in development
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.SUPABASE_URL) {
      logger.warn('Supabase not configured: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return;
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    throw new EnvValidationError(
      'SUPABASE_URL must be a valid HTTPS URL'
    );
  }

  const supabaseKey = process.env.SUPABASE_KEY;
  if (supabaseKey && supabaseKey.length < 20) {
    throw new EnvValidationError(
      'SUPABASE_KEY appears to be invalid (too short)'
    );
  }
}

/**
 * Gets environment variable with type safety
 */
export function getEnv(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || '';
}

/**
 * Gets required environment variable (throws if missing)
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new EnvValidationError(`Required environment variable ${key} is not set`);
  }
  return value;
}

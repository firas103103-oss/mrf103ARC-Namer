/**
 * 📦 API Versioning System
 * Support multiple API versions for backward compatibility
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error-handler';

export interface APIVersion {
  version: string;
  deprecated?: boolean;
  sunsetDate?: Date;
  router: Router;
}

export class APIVersionManager {
  private versions: Map<string, APIVersion> = new Map();
  private defaultVersion: string = 'v1';

  /**
   * Register an API version
   */
  registerVersion(version: string, router: Router, options?: {
    deprecated?: boolean;
    sunsetDate?: Date;
  }) {
    this.versions.set(version, {
      version,
      deprecated: options?.deprecated,
      sunsetDate: options?.sunsetDate,
      router
    });
  }

  /**
   * Set default API version
   */
  setDefaultVersion(version: string) {
    if (!this.versions.has(version)) {
      throw new Error(`Version ${version} not registered`);
    }
    this.defaultVersion = version;
  }

  /**
   * Get version from request
   */
  getVersionFromRequest(req: Request): string {
    // Check URL path first (/api/v1/...)
    const pathMatch = req.path.match(/^\/v(\d+)\//);
    if (pathMatch) {
      return `v${pathMatch[1]}`;
    }

    // Check Accept header (Accept: application/vnd.stellar.v1+json)
    const acceptHeader = req.get('Accept');
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/vnd\.stellar\.v(\d+)/);
      if (versionMatch) {
        return `v${versionMatch[1]}`;
      }
    }

    // Check custom header (X-API-Version: v1)
    const versionHeader = req.get('X-API-Version');
    if (versionHeader) {
      return versionHeader;
    }

    // Return default version
    return this.defaultVersion;
  }

  /**
   * Version middleware
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const version = this.getVersionFromRequest(req);
      const versionInfo = this.versions.get(version);

      if (!versionInfo) {
        throw new AppError(
          `API version ${version} not found`,
          404,
          undefined,
          'API_VERSION_NOT_FOUND'
        );
      }

      // Add deprecation warnings
      if (versionInfo.deprecated) {
        res.setHeader('X-API-Deprecated', 'true');
        res.setHeader('X-API-Deprecated-Message', `API version ${version} is deprecated`);
        
        if (versionInfo.sunsetDate) {
          res.setHeader('X-API-Sunset-Date', versionInfo.sunsetDate.toISOString());
          res.setHeader('Sunset', versionInfo.sunsetDate.toUTCString());
        }
      }

      // Add version header to response
      res.setHeader('X-API-Version', version);

      // Attach version info to request
      (req as any).apiVersion = version;
      (req as any).apiVersionInfo = versionInfo;

      next();
    };
  }

  /**
   * Create router that handles all versions
   */
  createVersionRouter(): Router {
    const router = Router();

    // Add version middleware
    router.use(this.middleware());

    // Mount version routers
    for (const [version, versionInfo] of this.versions) {
      router.use(`/${version}`, versionInfo.router);
      
      // Also mount without version prefix for default version
      if (version === this.defaultVersion) {
        router.use('/', versionInfo.router);
      }
    }

    // List available versions
    router.get('/', (req: Request, res: Response) => {
      const versions = Array.from(this.versions.values()).map(v => ({
        version: v.version,
        deprecated: v.deprecated || false,
        sunsetDate: v.sunsetDate?.toISOString(),
        endpoint: `/api/${v.version}`
      }));

      res.json({
        defaultVersion: this.defaultVersion,
        versions
      });
    });

    return router;
  }

  /**
   * Get all registered versions
   */
  getVersions(): APIVersion[] {
    return Array.from(this.versions.values());
  }
}

// Create singleton instance
export const apiVersionManager = new APIVersionManager();

// Response wrapper for consistent API responses
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    version: string;
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function createSuccessResponse<T>(
  data: T,
  meta?: { version?: string; requestId?: string }
): APIResponse<T> {
  return {
    success: true,
    data,
    meta: {
      version: meta?.version || 'v1',
      timestamp: new Date().toISOString(),
      requestId: meta?.requestId
    }
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  meta?: { version?: string; requestId?: string }
): APIResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      version: meta?.version || 'v1',
      timestamp: new Date().toISOString(),
      requestId: meta?.requestId
    }
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  meta?: { version?: string; requestId?: string }
): APIResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      version: meta?.version || 'v1',
      timestamp: new Date().toISOString(),
      requestId: meta?.requestId,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  };
}

export default {
  apiVersionManager,
  APIVersionManager,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse
};
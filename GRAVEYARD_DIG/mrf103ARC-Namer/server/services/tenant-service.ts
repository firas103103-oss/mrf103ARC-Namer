/**
 * ARC Tenant Service
 * Phase 2: SaaS Core (Single Tenant)
 * 
 * Manages tenant context and enforces isolation.
 * Current mode: PRIVATE / SINGLE-TENANT / OWNER-ONLY
 */

import { supabase, isSupabaseConfigured } from "../supabase";
import logger from "../utils/logger";

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_TENANT_SLUG = "mrf-primary";

export type UserRole = "OWNER" | "ADMIN" | "AGENT";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "deleted";
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  permissions: string[];
  created_at: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

// ============================================
// TENANT CONTEXT
// ============================================

/**
 * Get the current tenant (single-tenant mode)
 * Always returns the default tenant
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("[TenantService] Supabase not configured");
    return null;
  }

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", DEFAULT_TENANT_SLUG)
    .single();

  if (error) {
    console.error("[TenantService] Failed to get tenant:", (error instanceof Error ? error.message : 'Unknown error'));
    return null;
  }

  return data as Tenant;
}

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();

  if (error) return null;
  return data as Tenant;
}

/**
 * Get tenant by slug
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Tenant;
}

// ============================================
// USER ROLES & PERMISSIONS
// ============================================

/**
 * Get user's role in the current tenant
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("tenant_users")
    .select("role")
    .eq("tenant_id", DEFAULT_TENANT_ID)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data?.role as UserRole;
}

/**
 * Check if user has a specific role or higher
 */
export function hasMinimumRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    OWNER: 3,
    ADMIN: 2,
    AGENT: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Add user to tenant with role
 */
export async function addUserToTenant(
  userId: string,
  role: UserRole = "AGENT",
  tenantId: string = DEFAULT_TENANT_ID
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase.from("tenant_users").upsert({
    tenant_id: tenantId,
    user_id: userId,
    role,
    permissions: [],
  });

  if (error) {
    console.error("[TenantService] Failed to add user:", (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }

  return true;
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  tenantId: string = DEFAULT_TENANT_ID
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from("tenant_users")
    .update({ role: newRole })
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);

  if (error) {
    console.error("[TenantService] Failed to update role:", (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }

  return true;
}

/**
 * Remove user from tenant
 */
export async function removeUserFromTenant(
  userId: string,
  tenantId: string = DEFAULT_TENANT_ID
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from("tenant_users")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);

  if (error) {
    console.error("[TenantService] Failed to remove user:", (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }

  return true;
}

// ============================================
// FEATURE FLAGS
// ============================================

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { data, error } = await supabase
    .from("feature_flags")
    .select("enabled")
    .eq("key", key)
    .single();

  if (error) return false;
  return data?.enabled ?? false;
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("feature_flags")
    .select("key, enabled, config")
    .order("key");

  if (error) return [];
  return (data || []) as FeatureFlag[];
}

/**
 * Set feature flag value
 */
export async function setFeatureFlag(key: string, enabled: boolean): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled })
    .eq("key", key);

  if (error) {
    console.error("[TenantService] Failed to set flag:", (error instanceof Error ? error.message : 'Unknown error'));
    return false;
  }

  return true;
}

// ============================================
// TENANT-SCOPED QUERIES
// ============================================

/**
 * Add tenant_id filter to any Supabase query
 * Use this to ensure all queries are tenant-scoped
 */
export function withTenantScope<T>(
  query: any,
  tenantId: string = DEFAULT_TENANT_SLUG
): any {
  return query.eq("tenant_id", tenantId);
}

/**
 * Verify the operator is the owner (for private mode)
 */
export async function verifyOwnerAccess(): Promise<boolean> {
  // In private single-tenant mode, the operator IS the owner
  // This will be expanded when multi-tenant is enabled
  const publicOnboarding = await isFeatureEnabled("public_onboarding");
  const multiTenantUI = await isFeatureEnabled("multi_tenant_ui");
  
  // If both are OFF, we're in private mode = owner has access
  return !publicOnboarding && !multiTenantUI;
}

// ============================================
// BOOTSTRAP
// ============================================

/**
 * Ensure default tenant exists (called at server startup)
 */
export async function bootstrapTenant(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn("[TenantService] Supabase not configured, skipping bootstrap");
    return;
  }

  const tenant = await getCurrentTenant();
  
  if (tenant) {
    console.log(`✅ Tenant ready: ${tenant.name} (${tenant.slug})`);
  } else {
    console.error("❌ Default tenant not found! Run migration.");
  }

  // Log feature flags status
  const flags = await getAllFeatureFlags();
  const enabledFlags = flags.filter(f => f.enabled).map(f => f.key);
  const disabledFlags = flags.filter(f => !f.enabled).map(f => f.key);
  
  console.log(`📋 Feature Flags:`);
  console.log(`   ✅ Enabled: ${enabledFlags.join(", ") || "none"}`);
  console.log(`   ❌ Disabled: ${disabledFlags.join(", ") || "none"}`);
}

// ============================================
// EXPORTS
// ============================================

export const TenantService = {
  // Constants
  DEFAULT_TENANT_ID,
  DEFAULT_TENANT_SLUG,
  
  // Tenant
  getCurrentTenant,
  getTenantById,
  getTenantBySlug,
  
  // Users & Roles
  getUserRole,
  hasMinimumRole,
  addUserToTenant,
  updateUserRole,
  removeUserFromTenant,
  
  // Feature Flags
  isFeatureEnabled,
  getAllFeatureFlags,
  setFeatureFlag,
  
  // Utilities
  withTenantScope,
  verifyOwnerAccess,
  bootstrapTenant,
};

export default TenantService;

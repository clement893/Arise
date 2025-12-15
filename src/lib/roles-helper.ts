/**
 * Helper functions for role management
 * Optimized to avoid repeated JSON parsing
 */

/**
 * Parse roles from Prisma JSON field
 * Caches parsed results to avoid repeated parsing
 */
const rolesCache = new Map<string, string[]>();

export function parseRoles(roles: unknown, fallbackRole?: string): string[] {
  if (!roles) {
    return fallbackRole ? [fallbackRole] : [];
  }

  // If already an array, return it
  if (Array.isArray(roles)) {
    return roles;
  }

  // Check cache first
  const cacheKey = typeof roles === 'string' ? roles : JSON.stringify(roles);
  if (rolesCache.has(cacheKey)) {
    return rolesCache.get(cacheKey)!;
  }

  // Parse JSON string
  try {
    const parsed = typeof roles === 'string' 
      ? JSON.parse(roles) 
      : roles;
    
    const result = Array.isArray(parsed) ? parsed : [fallbackRole || 'participant'];
    
    // Cache result (limit cache size to prevent memory issues)
    if (rolesCache.size < 1000) {
      rolesCache.set(cacheKey, result);
    }
    
    return result;
  } catch {
    return fallbackRole ? [fallbackRole] : [];
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(roles: unknown, role: string, fallbackRole?: string): boolean {
  const parsedRoles = parseRoles(roles, fallbackRole);
  return parsedRoles.includes(role);
}

/**
 * Check if user is participant (not admin or coach)
 */
export function isParticipant(roles: unknown, fallbackRole?: string): boolean {
  const parsedRoles = parseRoles(roles, fallbackRole);
  return parsedRoles.includes('participant') && 
         !parsedRoles.includes('admin') && 
         !parsedRoles.includes('coach');
}

/**
 * Clear roles cache (useful for testing or memory management)
 */
export function clearRolesCache(): void {
  rolesCache.clear();
}


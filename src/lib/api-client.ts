/**
 * API Client utility for authenticated requests
 * Handles JWT token management and automatic token refresh
 */

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('arise_access_token');
}

/**
 * Get refresh token from cookie (handled by browser)
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('arise_access_token', data.accessToken);
        return data.accessToken;
      }
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }
  return null;
}

/**
 * Make an authenticated API request
 * Automatically includes JWT token and handles refresh if needed
 */
export async function apiRequest(
  url: string,
  options: ApiOptions = {}
): Promise<Response> {
  const { skipAuth = false, headers = {}, ...restOptions } = options;

  // Prepare headers as Record<string, string>
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add authentication token if not skipped
  if (!skipAuth) {
    let token = getAccessToken();
    
    // If no token, try to refresh
    if (!token) {
      token = await refreshAccessToken();
    }

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Make the request
  let response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
    credentials: 'include',
  });

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      requestHeaders['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        credentials: 'include',
      });
    }
  }

  return response;
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (url: string, options?: ApiOptions) =>
    apiRequest(url, { ...options, method: 'GET' }),
  
  post: (url: string, data?: any, options?: ApiOptions) =>
    apiRequest(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: (url: string, data?: any, options?: ApiOptions) =>
    apiRequest(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (url: string, options?: ApiOptions) =>
    apiRequest(url, { ...options, method: 'DELETE' }),
};

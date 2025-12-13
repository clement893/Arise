/**
 * Utility functions for token refresh
 */

/**
 * Refresh access token using refresh token from cookie
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    console.log('Attempting to refresh access token...');
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    console.log('Refresh token response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        console.log('Access token refreshed successfully');
        localStorage.setItem('arise_access_token', data.accessToken);
        return data.accessToken;
      } else {
        console.error('Refresh response missing accessToken');
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to refresh token:', errorData);
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }
  return null;
}

/**
 * Make an authenticated fetch request with automatic token refresh
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = localStorage.getItem('arise_access_token');

  // If no token, try to refresh
  if (!accessToken) {
    accessToken = await refreshAccessToken();
  }

  // Helper function to create request options with token
  const createRequestOptions = (token: string | null): RequestInit => {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return {
      ...options,
      headers,
      credentials: 'include',
    };
  };

  // Make the initial request
  let response = await fetch(url, createRequestOptions(accessToken));

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401 && accessToken) {
    console.log('Token expired, refreshing...');
    const newToken = await refreshAccessToken();
    if (newToken) {
      console.log('Token refreshed successfully, retrying request with new token...');
      // Create fresh request options with new token
      response = await fetch(url, createRequestOptions(newToken));
      console.log('Retry response status:', response.status);
    } else {
      console.error('Failed to refresh token, user may need to login again');
    }
  }

  return response;
}

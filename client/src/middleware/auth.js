/**
 * Client-side Auth Middleware
 * Redirects to login if not authenticated
 */

export function requireAuth() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return false;
  }
  
  try {
    const userData = JSON.parse(user);
    return userData && userData.id;
  } catch {
    return false;
  }
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUserId() {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || userData._id;
    }
  } catch {
    return null;
  }
  return null;
}


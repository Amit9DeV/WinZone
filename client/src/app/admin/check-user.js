/**
 * Quick script to check current user role
 * Run in browser console
 */

// Check current user
const userStr = localStorage.getItem('user');
if (userStr) {
  const user = JSON.parse(userStr);
  console.log('Current User:', user);
  console.log('User Role:', user.role);
  console.log('Is Admin:', user.role === 'ADMIN');
} else {
  console.log('No user found in localStorage');
}


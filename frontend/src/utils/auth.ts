// Authentication utilities

/**
 * Logs out the current user by removing their data from localStorage
 */
export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};
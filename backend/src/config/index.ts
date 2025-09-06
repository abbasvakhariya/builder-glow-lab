export const JWT_ACCESS_EXPIRES_IN = '15m';
export const JWT_REFRESH_EXPIRES_IN = '7d';
export const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change_me_access';
export const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change_me_refresh';

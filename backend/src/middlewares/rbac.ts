import { Request, Response, NextFunction } from 'express';

export function permit(...roles: string[]) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (roles.includes(user.role) || user.role === 'owner') return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
}

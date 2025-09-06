import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { ACCESS_SECRET, REFRESH_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from '../config';

function signAccess(user: any) {
  return jwt.sign({ id: user._id, role: user.role }, ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
}
function signRefresh(user: any) {
  return jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.active) return res.status(403).json({ message: 'User inactive' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const payload: any = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh' });
    if (!user.active) return res.status(403).json({ message: 'User inactive' });
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: 7 * 24 * 3600 * 1000 });
    res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ ok: true });
};

export const me = async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Not authenticated' });
  const u = await User.findById(user.id).select('-password');
  res.json({ user: u });
};

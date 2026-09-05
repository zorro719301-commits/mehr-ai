import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mehr_jwt_super_secret_key_2026_clinical_secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'mehr_jwt_refresh_super_secret_key_2026';
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN as any });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN as any });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};

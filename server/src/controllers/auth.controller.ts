import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email va parol kiritilishi shart' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        parentProfile: true,
        specialistProfile: { include: { specialistType: true } },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Email yoki parol noto‘g‘ri yoki hisob faol emas' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Email yoki parol noto‘g‘ri' });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Save session in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.get('user-agent') || null,
        expiresAt,
      },
    });

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          parentProfile: user.parentProfile,
          specialistProfile: user.specialistProfile,
        },
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Tizimga kirishda xatolik yuz berdi' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, role = 'PARENT', relationType = 'MOTHER', address } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: 'Barcha majburiy maydonlarni to‘ldiring' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Ushbu email manzil bilan foydalanuvchi allaqachon mavjud' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName,
        phone,
        role,
        parentProfile:
          role === 'PARENT'
            ? {
                create: {
                  relationType,
                  address,
                },
              }
            : undefined,
      },
      include: { parentProfile: true },
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          parentProfile: user.parentProfile,
        },
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Ro‘yxatdan o‘tishda xatolik yuz berdi' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Refresh token taqdim etilmadi' });
    }

    const decoded = verifyRefreshToken(token);
    const session = await prisma.session.findUnique({
      where: { refreshToken: token },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return res.status(401).json({ success: false, error: 'Refresh token bekor qilingan yoki muddati o‘tgan' });
    }

    // Token rotation
    const newPayload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    // Revoke old session and issue new
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        userId: decoded.userId,
        refreshToken: newRefreshToken,
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.get('user-agent') || null,
        expiresAt: newExpiresAt,
      },
    });

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    return res.status(401).json({ success: false, error: 'Yaroqsiz refresh token' });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        parentProfile: {
          include: {
            children: {
              include: {
                child: {
                  include: {
                    conditions: { include: { condition: true } },
                    packages: { where: { status: 'APPROVED' }, take: 1 },
                  },
                },
              },
            },
          },
        },
        specialistProfile: { include: { specialistType: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        parentProfile: user.parentProfile,
        specialistProfile: user.specialistProfile,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Profil ma’lumotlarini olishda xatolik' });
  }
};

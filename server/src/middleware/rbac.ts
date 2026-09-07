import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { prisma } from '../utils/prisma.js';

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Foydalanuvchi tizimga kirmagan' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Ruxsat berilmagan. Talab qilinadigan rol: ${allowedRoles.join(' yoki ')}`,
      });
    }

    next();
  };
};

export const verifyChildAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Avtorizatsiya zarur' });
    }

    // Admin-tier, specialist and auditor roles have broad clinical (read) access
    const broadAccessRoles = ['SUPER_ADMIN', 'MEDICAL_ADMIN', 'SPECIALIST', 'AUDITOR'];
    if (broadAccessRoles.includes(req.user.role)) {
      return next();
    }

    const childId = req.params.childId || req.body.childId || req.query.childId;
    if (!childId) {
      return next();
    }

    // Check if the authenticated parent owns this child
    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!parentProfile) {
      return res.status(403).json({ success: false, error: 'Ota-ona profili topilmadi' });
    }

    const link = await prisma.childParent.findUnique({
      where: {
        childId_parentId: {
          childId: String(childId),
          parentId: parentProfile.id,
        },
      },
    });

    if (!link) {
      return res.status(403).json({
        success: false,
        error: 'Siz faqat o‘zingizga biriktirilgan bolaning ma’lumotlariga kirishingiz mumkin',
      });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Ruxsatni tekshirishda xatolik yuz berdi' });
  }
};

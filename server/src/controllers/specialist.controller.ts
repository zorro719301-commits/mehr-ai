import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const getSpecialistDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalChildren = await prisma.child.count();
    const pendingPackages = await prisma.individualPackage.count({
      where: { status: 'PENDING_REVIEW' },
    });
    const recentAssessments = await prisma.assessment.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    });
    const pendingReviews = await prisma.individualPackage.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        child: {
          include: {
            conditions: { include: { condition: true } },
            medicalProfile: true,
          },
        },
      },
      take: 10,
    });

    return res.json({
      success: true,
      data: {
        metrics: {
          totalChildren,
          pendingPackages,
          recentAssessments,
          alertFlagsCount: 1,
        },
        pendingReviews,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Mutaxassis paneli ma’lumotlarini yuklashda xatolik' });
  }
};

export const logTherapySession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId, durationMinutes = 45, notes, outcomes } = req.body;

    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { userId: req.user?.userId },
    });

    if (!specialistProfile) {
      return res.status(403).json({ success: false, error: 'Mutaxassis profili topilmadi' });
    }

    const session = await prisma.therapySession.create({
      data: {
        childId,
        specialistId: specialistProfile.id,
        durationMinutes: Number(durationMinutes),
        notes,
        outcomes,
      },
    });

    return res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Terapiya sessiyasini saqlashda xatolik' });
  }
};

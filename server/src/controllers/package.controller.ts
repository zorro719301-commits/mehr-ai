import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { AiClinicalService } from '../services/ai.service.js';

export const generateAiPackage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId, parentGoals } = req.body;
    if (!childId) {
      return res.status(400).json({ success: false, error: 'Bola ID talab qilinadi' });
    }

    // Call 13-step AI algorithm
    const aiOutput = await AiClinicalService.generateIndividualPackage({
      childId,
      parentGoals,
    });

    // Save package in database
    const pkg = await prisma.individualPackage.create({
      data: {
        childId,
        title: aiOutput.title,
        summary: aiOutput.summary,
        durationDays: aiOutput.durationDays,
        priorityDomains: JSON.stringify(aiOutput.priorityDomains),
        status: 'PENDING_REVIEW', // Awaits specialist review
        dangerSignsWarning: aiOutput.dangerSignsWarning,
        modules: {
          create: aiOutput.modules.map((m) => ({
            weekNumber: m.weekNumber,
            focusArea: m.focusArea,
            weeklyGoal: m.weeklyGoal,
            expectedOutcome: m.expectedOutcome,
            parentAdvice: m.parentAdvice,
          })),
        },
        dailyTasks: {
          create: aiOutput.dailyTasks.map((t) => ({
            dayNumber: t.dayNumber,
            title: t.title,
            durationMinutes: t.durationMinutes,
            materials: t.materials,
            instructions: t.instructions,
            parentTip: t.parentTip,
            targetBehavior: t.targetBehavior,
          })),
        },
      },
      include: {
        modules: { orderBy: { weekNumber: 'asc' } },
        dailyTasks: { orderBy: { dayNumber: 'asc' } },
      },
    });

    // Notify specialists if any
    const specialists = await prisma.user.findMany({ where: { role: 'SPECIALIST' } });
    for (const s of specialists) {
      await prisma.notification.create({
        data: {
          userId: s.id,
          title: 'Yangi AI Individual Paket ko‘rib chiqishga tayyor',
          message: `${aiOutput.title} yaratildi va mutaxassis tasdig‘ini kutmoqda.`,
          type: 'PACKAGE_UPDATE',
          linkUrl: `/specialist/packages/${pkg.id}`,
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        package: pkg,
        aiRecommendations: aiOutput.specialistReferrals,
        disclaimer: aiOutput.disclaimer,
      },
    });
  } catch (error: any) {
    console.error('Error generating AI package:', error);
    return res.status(500).json({ success: false, error: error.message || 'AI paketini yaratishda xatolik' });
  }
};

export const getActivePackage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;

    const pkg = await prisma.individualPackage.findFirst({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      include: {
        modules: { orderBy: { weekNumber: 'asc' } },
        dailyTasks: {
          orderBy: { dayNumber: 'asc' },
          include: {
            results: {
              where: { childId },
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
        },
        specialistReviews: {
          orderBy: { reviewedAt: 'desc' },
          include: { specialist: { include: { user: true, specialistType: true } } },
        },
      },
    });

    if (!pkg) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: pkg });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Faol paketni olishda xatolik' });
  }
};

export const recordDailyTaskResult = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { childId, status = 'COMPLETED', assistanceLevel = 3, childReaction = 'POSITIVE', durationSpent = 15, parentNotes } = req.body;

    if (!taskId || !childId) {
      return res.status(400).json({ success: false, error: 'Vazifa ID va bola ID talab qilinadi' });
    }

    const result = await prisma.dailyTaskResult.create({
      data: {
        taskId,
        childId,
        status,
        assistanceLevel: Number(assistanceLevel),
        childReaction,
        durationSpent: Number(durationSpent),
        parentNotes,
      },
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Mashg‘ulot natijasini saqlashda xatolik' });
  }
};

export const reviewPackage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { packageId } = req.params;
    const { status, comments, modifications } = req.body; // status: APPROVED, MODIFIED, REJECTED

    if (!['APPROVED', 'MODIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Noto‘g‘ri tasdiq holati (APPROVED, MODIFIED, REJECTED)' });
    }

    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { userId: req.user?.userId },
    });

    if (!specialistProfile) {
      return res.status(403).json({ success: false, error: 'Faqat mutaxassislar paketni tasdiqlashi mumkin' });
    }

    // Update package status
    const updatedPackage = await prisma.individualPackage.update({
      where: { id: packageId },
      data: {
        status: status === 'REJECTED' ? 'REJECTED' : 'APPROVED',
        specialistFeedback: comments,
      },
    });

    // Create SpecialistReview record
    await prisma.specialistReview.create({
      data: {
        packageId,
        specialistId: specialistProfile.id,
        status,
        comments,
        modificationsJson: modifications ? JSON.stringify(modifications) : null,
      },
    });

    return res.json({ success: true, data: updatedPackage });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Paketni ko‘rib chiqishda xatolik' });
  }
};

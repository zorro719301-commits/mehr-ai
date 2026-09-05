import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const getParentReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;

    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        medicalProfile: true,
        conditions: { include: { condition: true } },
        packages: {
          where: { status: 'APPROVED' },
          take: 1,
          include: {
            modules: true,
            dailyTasks: {
              include: { results: { orderBy: { date: 'desc' }, take: 1 } },
            },
          },
        },
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { results: { include: { domain: true } } },
        },
        progressRecords: { orderBy: { date: 'desc' }, take: 10 },
      },
    });

    if (!child) {
      return res.status(404).json({ success: false, error: 'Bola topilmadi' });
    }

    const activePkg = child.packages[0];
    const completedTasksCount = activePkg?.dailyTasks.filter((t) => t.results[0]?.status === 'COMPLETED').length || 0;

    return res.json({
      success: true,
      data: {
        reportType: 'OTA-ONA RIVOJLANISH HISOBOTI',
        generatedAt: new Date(),
        child: {
          fullName: `${child.firstName} ${child.lastName}`,
          dob: child.dateOfBirth,
          region: child.region,
          conditions: child.conditions.map((c) => c.condition.name),
        },
        developmentalProfile: child.assessments[0]?.results || [],
        activeProgram: activePkg ? {
          title: activePkg.title,
          completedTasks: completedTasksCount,
          totalTasks: activePkg.dailyTasks.length,
          specialistFeedback: activePkg.specialistFeedback,
        } : null,
        disclaimer: 'Ushbu hisobot MEHR AI platformasida shakllantirilgan bo‘lib, axborot va monitoring maqsadlariga xizmat qiladi.',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Hisobotni shakllantirishda xatolik' });
  }
};

export const getSpecialistReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;

    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        medicalProfile: true,
        conditions: { include: { condition: true } },
        assessments: {
          orderBy: { createdAt: 'desc' },
          include: { results: { include: { domain: true } }, answers: true },
        },
        packages: {
          include: {
            specialistReviews: { include: { specialist: { include: { user: true } } } },
            modules: true,
          },
        },
        behaviorLogs: { orderBy: { timestamp: 'desc' }, take: 10 },
        therapySessions: { orderBy: { sessionDate: 'desc' }, take: 5 },
      },
    });

    if (!child) {
      return res.status(404).json({ success: false, error: 'Bola topilmadi' });
    }

    return res.json({
      success: true,
      data: {
        reportType: 'MUTAXASSIS KLINIK VA REABILITATSIYA DOSYESI',
        generatedAt: new Date(),
        child,
        disclaimer: 'Tibbiy va klinik xulosalar faqat vakolatli shifokor va reabilitolog tomonidan tasdiqlanadi.',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Klinik dosye shakllantirishda xatolik' });
  }
};

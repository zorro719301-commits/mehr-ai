import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const getAdminMetrics = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalParents = await prisma.user.count({ where: { role: 'PARENT' } });
    const totalSpecialists = await prisma.user.count({ where: { role: 'SPECIALIST' } });
    const totalChildren = await prisma.child.count();
    const totalPackages = await prisma.individualPackage.count();
    const totalAssessments = await prisma.assessment.count();
    const totalExercises = await prisma.exercise.count();
    const totalAacCards = await prisma.aacCard.count();

    // Regional breakdown
    const childrenByRegion = await prisma.child.groupBy({
      by: ['region'],
      _count: { id: true },
    });

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalParents,
        totalSpecialists,
        totalChildren,
        totalPackages,
        totalAssessments,
        totalExercises,
        totalAacCards,
        childrenByRegion,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Admin statistikasini olishda xatolik' });
  }
};

export const getConditions = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const conditions = await prisma.conditionOrDiagnosis.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { childConditions: true } } },
    });
    return res.json({ success: true, data: conditions });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Kasalliklar katalogini olishda xatolik' });
  }
};

export const createCondition = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, name, description, symptoms, riskSigns, recommendedSpecialists, defaultDurationDays = 30 } = req.body;

    if (!code || !name || !description) {
      return res.status(400).json({ success: false, error: 'Kod, nom va tavsif talab qilinadi' });
    }

    const condition = await prisma.conditionOrDiagnosis.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        description,
        symptoms: symptoms || '',
        riskSigns,
        recommendedSpecialists: recommendedSpecialists || 'LOGOPED,PSIXOLOG',
        defaultDurationDays: Number(defaultDurationDays),
      },
    });

    return res.status(201).json({ success: true, data: condition });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Yangi kasallik/holat qo‘shishda xatolik' });
  }
};

export const updateCondition = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, symptoms, riskSigns, recommendedSpecialists, defaultDurationDays, isActive } = req.body;

    const updated = await prisma.conditionOrDiagnosis.update({
      where: { id },
      data: {
        name,
        description,
        symptoms,
        riskSigns,
        recommendedSpecialists,
        defaultDurationDays: defaultDurationDays ? Number(defaultDurationDays) : undefined,
        isActive,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Kasallik/holatni yangilashda xatolik' });
  }
};

export const getAuditLogs = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { fullName: true, email: true, role: true } } },
    });
    return res.json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Audit loglarni olishda xatolik' });
  }
};

export const getAiLogs = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await prisma.aiRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { response: true, child: true },
    });
    return res.json({ success: true, data: requests });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'AI loglarni olishda xatolik' });
  }
};

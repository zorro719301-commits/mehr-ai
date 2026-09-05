import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { AiClinicalService } from '../services/ai.service.js';

export const getChildProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;

    // 1. Task Results
    const taskResults = await prisma.dailyTaskResult.findMany({
      where: { childId },
      orderBy: { date: 'asc' },
      include: { task: true },
    });

    // 2. Latest Assessment Results per Domain
    const latestAssessment = await prisma.assessment.findFirst({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      include: { results: { include: { domain: true } } },
    });

    // 3. Historical Domain Progress Records
    const progressRecords = await prisma.progressRecord.findMany({
      where: { childId },
      orderBy: { date: 'asc' },
      include: { domain: true },
    });

    // 4. Assistance Level Trajectory
    const assistanceTrajectory = taskResults.map((r) => ({
      date: r.date,
      assistanceLevel: r.assistanceLevel, // 0 to 5
      status: r.status,
      reaction: r.childReaction,
    }));

    // 5. Calculate Metrics
    const totalAssigned = taskResults.length;
    const totalCompleted = taskResults.filter((r) => r.status === 'COMPLETED').length;
    const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

    // 6. AI Re-plan Evaluation
    const replanEvaluation = await AiClinicalService.evaluateReplan(childId);

    return res.json({
      success: true,
      data: {
        completionRate,
        totalCompleted,
        totalAssigned,
        assistanceTrajectory,
        latestAssessment: latestAssessment?.results || [],
        historicalRecords: progressRecords,
        replanEvaluation,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Progress ma’lumotlarini olishda xatolik' });
  }
};

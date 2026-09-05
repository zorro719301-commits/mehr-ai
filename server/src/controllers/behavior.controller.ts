import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';
import { AiClinicalService } from '../services/ai.service.js';

export const createBehaviorLog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId, situation, behaviorDescription, antecedent, parentResponse, outcome, severity = 'MILD' } = req.body;

    if (!childId || !behaviorDescription || !antecedent) {
      return res.status(400).json({ success: false, error: 'Bola ID, xatti-harakat va sabab (antecedent) talab qilinadi' });
    }

    const log = await prisma.behaviorLog.create({
      data: {
        childId,
        situation: situation || 'Uy muhiti',
        behaviorDescription,
        antecedent,
        parentResponse: parentResponse || 'Kuzatuv ostida tinchlantirildi',
        outcome: outcome || 'Vaziyat barqarorlashdi',
        severity,
      },
    });

    // Run quick AI pattern recognition
    const aiAnalysis = await AiClinicalService.analyzeBehaviorLog(childId);

    return res.status(201).json({
      success: true,
      data: {
        log,
        aiAnalysis,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Xulq-atvor kundaligiga yozishda xatolik' });
  }
};

export const getChildBehaviorLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;
    const logs = await prisma.behaviorLog.findMany({
      where: { childId },
      orderBy: { timestamp: 'desc' },
    });

    const aiAnalysis = await AiClinicalService.analyzeBehaviorLog(childId);

    return res.json({
      success: true,
      data: {
        logs,
        aiAnalysis,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Xulq-atvor yozuvlarini olishda xatolik' });
  }
};

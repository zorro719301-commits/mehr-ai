import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const getQuestions = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const domains = await prisma.developmentDomain.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return res.json({ success: true, data: domains });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Baholash savollarini olishda xatolik' });
  }
};

export const submitAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId, answers = [], notes, type = 'PERIODIC' } = req.body;

    if (!childId || answers.length === 0) {
      return res.status(400).json({ success: false, error: 'Bola ID va savollarga javoblar talab qilinadi' });
    }

    // Calculate domain scores
    // answers format: [{ questionId: string, score: number }] (score 0-5)
    const questions = await prisma.assessmentQuestion.findMany({
      where: { id: { in: answers.map((a: any) => a.questionId) } },
      include: { domain: true },
    });

    const domainAggregates: Record<
      string,
      { domainId: string; totalScore: number; maxScore: number; count: number }
    > = {};

    let grandTotal = 0;
    let grandMax = 0;

    for (const ans of answers) {
      const q = questions.find((item) => item.id === ans.questionId);
      if (q) {
        if (!domainAggregates[q.domainId]) {
          domainAggregates[q.domainId] = {
            domainId: q.domainId,
            totalScore: 0,
            maxScore: 0,
            count: 0,
          };
        }
        const score = Math.max(0, Math.min(5, Number(ans.score) || 0));
        domainAggregates[q.domainId].totalScore += score;
        domainAggregates[q.domainId].maxScore += 5;
        domainAggregates[q.domainId].count += 1;

        grandTotal += score;
        grandMax += 5;
      }
    }

    // Create Assessment record
    const assessment = await prisma.assessment.create({
      data: {
        childId,
        conductedById: req.user?.userId || null,
        type,
        totalScore: grandTotal,
        maxScore: grandMax,
        notes,
        answers: {
          create: answers.map((a: any) => ({
            questionId: a.questionId,
            score: Math.max(0, Math.min(5, Number(a.score) || 0)),
            notes: a.notes || null,
          })),
        },
      },
    });

    // Create AssessmentResult per domain
    for (const agg of Object.values(domainAggregates)) {
      const avgScore = agg.count > 0 ? Number((agg.totalScore / agg.count).toFixed(1)) : 0;
      const percentage = agg.maxScore > 0 ? Math.round((agg.totalScore / agg.maxScore) * 100) : 0;

      let level = 'EMERGING';
      let interpretation = 'Ko‘nikmalar shakllanish bosqichida.';

      if (percentage <= 30) {
        level = 'CRITICAL';
        interpretation = 'Ushbu sohada jiddiy ehtiyoj mavjud, ustuvor reabilitatsiya zarur.';
      } else if (percentage <= 50) {
        level = 'EMERGING';
        interpretation = 'Ko‘nikma faqat yordam bilan namoyon bo‘lmoqda.';
      } else if (percentage <= 75) {
        level = 'DEVELOPING';
        interpretation = 'Rivojlanish dinamikasi yaxshi, mustaqillikni oshirish tavsiya etiladi.';
      } else {
        level = 'MASTERED';
        interpretation = 'Ko‘nikma barqaror shakllangan va deyarli mustaqil bajarilmoqda.';
      }

      await prisma.assessmentResult.create({
        data: {
          assessmentId: assessment.id,
          domainId: agg.domainId,
          score: avgScore,
          percentage,
          level,
          interpretation,
        },
      });

      // Also record in ProgressRecord for historical trend analysis
      await prisma.progressRecord.create({
        data: {
          childId,
          domainId: agg.domainId,
          score: avgScore,
          metricType: 'ASSESSMENT_SCORE',
          notes: `Baholash: ${type} (${percentage}%)`,
        },
      });
    }

    const completeAssessment = await prisma.assessment.findUnique({
      where: { id: assessment.id },
      include: {
        results: { include: { domain: true } },
      },
    });

    return res.status(201).json({ success: true, data: completeAssessment });
  } catch (error: any) {
    console.error('Submit assessment error:', error);
    return res.status(500).json({ success: false, error: 'Baholashni saqlashda xatolik yuz berdi' });
  }
};

export const getChildAssessments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;
    const assessments = await prisma.assessment.findMany({
      where: { childId },
      include: {
        results: { include: { domain: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: assessments });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Baholashlar tarixini olishda xatolik' });
  }
};

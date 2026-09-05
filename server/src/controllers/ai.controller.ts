import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AiClinicalService } from '../services/ai.service.js';

export const analyzeAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.body;
    if (!childId) {
      return res.status(400).json({ success: false, error: 'Bola ID talab qilinadi' });
    }

    const output = await AiClinicalService.generateIndividualPackage({ childId });
    return res.json({
      success: true,
      data: {
        analysis: output.summary,
        strengths: output.strengths,
        needs: output.needs,
        goals: output.goals,
        disclaimer: output.disclaimer,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const generatePackage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId, parentGoals } = req.body;
    const output = await AiClinicalService.generateIndividualPackage({ childId, parentGoals });
    return res.json({ success: true, data: output });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const analyzeBehavior = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.body;
    const analysis = await AiClinicalService.analyzeBehaviorLog(childId);
    return res.json({ success: true, data: analysis });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const evaluateReplan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.body;
    const evaluation = await AiClinicalService.evaluateReplan(childId);
    return res.json({ success: true, data: evaluation });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const chatAssistant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId, message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Xabar matni talab qilinadi' });
    }

    const response = await AiClinicalService.answerParentQuestion(childId, message);
    return res.json({ success: true, data: response });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

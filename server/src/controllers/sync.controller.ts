import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export interface SyncMutationItem {
  clientMutationId: string;
  entityType: 'DAILY_TASK_RESULT' | 'BEHAVIOR_LOG' | 'SPEECH_LOG';
  action: 'CREATE' | 'UPDATE';
  payload: any;
  createdAt: string;
}

export const batchSync = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { mutations = [] }: { mutations: SyncMutationItem[] } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Avtorizatsiya talab qilinadi' });
    }

    const syncResults: { clientMutationId: string; status: string; error?: string }[] = [];

    for (const item of mutations) {
      try {
        // Check idempotency (if already processed)
        const existingQueueItem = await prisma.offlineSyncQueue.findUnique({
          where: { clientMutationId: item.clientMutationId },
        });

        if (existingQueueItem && existingQueueItem.status === 'SYNCED') {
          syncResults.push({ clientMutationId: item.clientMutationId, status: 'ALREADY_SYNCED' });
          continue;
        }

        if (item.entityType === 'DAILY_TASK_RESULT') {
          const p = item.payload;
          await prisma.dailyTaskResult.create({
            data: {
              taskId: p.taskId,
              childId: p.childId,
              date: p.date ? new Date(p.date) : new Date(),
              status: p.status || 'COMPLETED',
              assistanceLevel: Number(p.assistanceLevel) || 0,
              childReaction: p.childReaction || 'POSITIVE',
              durationSpent: Number(p.durationSpent) || 15,
              parentNotes: p.parentNotes,
            },
          });
        } else if (item.entityType === 'BEHAVIOR_LOG') {
          const p = item.payload;
          await prisma.behaviorLog.create({
            data: {
              childId: p.childId,
              timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
              situation: p.situation || 'Oflayn qayd',
              behaviorDescription: p.behaviorDescription,
              antecedent: p.antecedent,
              parentResponse: p.parentResponse || 'Tinchlantirildi',
              outcome: p.outcome || 'Barqaror',
              severity: p.severity || 'MILD',
            },
          });
        } else if (item.entityType === 'SPEECH_LOG') {
          const p = item.payload;
          await prisma.speechLog.create({
            data: {
              childId: p.childId,
              wordUttered: p.wordUttered,
              context: p.context,
              communicationMode: p.communicationMode || 'AAC',
              promptLevel: Number(p.promptLevel) || 0,
              timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
            },
          });
        }

        // Record successful sync in OfflineSyncQueue
        await prisma.offlineSyncQueue.upsert({
          where: { clientMutationId: item.clientMutationId },
          update: {
            status: 'SYNCED',
            syncedAt: new Date(),
          },
          create: {
            clientMutationId: item.clientMutationId,
            userId,
            entityType: item.entityType,
            action: item.action,
            payloadJson: JSON.stringify(item.payload),
            status: 'SYNCED',
            syncedAt: new Date(),
          },
        });

        syncResults.push({ clientMutationId: item.clientMutationId, status: 'SYNCED' });
      } catch (err: any) {
        console.error(`Sync error for ${item.clientMutationId}:`, err);
        await prisma.offlineSyncQueue.upsert({
          where: { clientMutationId: item.clientMutationId },
          update: { status: 'FAILED', error: err.message },
          create: {
            clientMutationId: item.clientMutationId,
            userId,
            entityType: item.entityType,
            action: item.action,
            payloadJson: JSON.stringify(item.payload),
            status: 'FAILED',
            error: err.message,
          },
        });
        syncResults.push({ clientMutationId: item.clientMutationId, status: 'FAILED', error: err.message });
      }
    }

    return res.json({
      success: true,
      syncedCount: syncResults.filter((r) => r.status === 'SYNCED').length,
      results: syncResults,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Sinxronizatsiyada xatolik yuz berdi' });
  }
};

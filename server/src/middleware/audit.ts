import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { prisma } from '../utils/prisma.js';

export const logAudit = (action: string, entity: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Run next() first, then asynchronously log
    const originalSend = res.send;
    res.send = function (data) {
      res.send = originalSend;
      const result = originalSend.apply(res, arguments as any);

      // Async log to DB without blocking response
      (async () => {
        try {
          if (res.statusCode < 400) {
            const entityId = req.params.id || req.params.childId || req.body.id || req.body.childId || null;
            await prisma.auditLog.create({
              data: {
                userId: req.user?.userId || null,
                action,
                entity,
                entityId: entityId ? String(entityId) : null,
                detailsJson: JSON.stringify({
                  method: req.method,
                  url: req.originalUrl,
                  ip: req.ip || req.socket.remoteAddress,
                }),
                ipAddress: req.ip || req.socket.remoteAddress || null,
                userAgent: req.get('user-agent') || null,
              },
            });
          }
        } catch (e) {
          console.error('Audit log failed:', e);
        }
      })();

      return result;
    };
    next();
  };
};

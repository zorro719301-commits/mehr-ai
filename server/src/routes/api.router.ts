import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize, verifyChildAccess } from '../middleware/rbac.js';
import { logAudit } from '../middleware/audit.js';

import * as authCtrl from '../controllers/auth.controller.js';
import * as childCtrl from '../controllers/child.controller.js';
import * as assessmentCtrl from '../controllers/assessment.controller.js';
import * as packageCtrl from '../controllers/package.controller.js';
import * as aacCtrl from '../controllers/aac.controller.js';
import * as behaviorCtrl from '../controllers/behavior.controller.js';
import * as progressCtrl from '../controllers/progress.controller.js';
import * as specialistCtrl from '../controllers/specialist.controller.js';
import * as adminCtrl from '../controllers/admin.controller.js';
import * as syncCtrl from '../controllers/sync.controller.js';
import * as aiCtrl from '../controllers/ai.controller.js';
import * as reportCtrl from '../controllers/report.controller.js';

const router = Router();

// 1. Auth routes
router.post('/auth/login', logAudit('LOGIN', 'User'), authCtrl.login);
router.post('/auth/register', logAudit('REGISTER', 'User'), authCtrl.register);
router.post('/auth/refresh-token', authCtrl.refreshToken);
router.get('/auth/me', authenticate, authCtrl.me);

// 2. Child routes
router.get('/children', authenticate, childCtrl.getChildren);
router.get('/children/:id', authenticate, verifyChildAccess, childCtrl.getChildById);
router.post('/children', authenticate, logAudit('CREATE_CHILD', 'Child'), childCtrl.createChild);
router.put('/children/:childId/medical-profile', authenticate, verifyChildAccess, logAudit('UPDATE_MEDICAL', 'ChildMedicalProfile'), childCtrl.updateMedicalProfile);

// 3. Digital Assessment routes
router.get('/assessments/questions', authenticate, assessmentCtrl.getQuestions);
router.post('/assessments', authenticate, logAudit('SUBMIT_ASSESSMENT', 'Assessment'), assessmentCtrl.submitAssessment);
router.get('/assessments/child/:childId', authenticate, verifyChildAccess, assessmentCtrl.getChildAssessments);

// 4. Individual Packages routes
router.post('/packages/generate', authenticate, logAudit('GENERATE_PACKAGE', 'IndividualPackage'), packageCtrl.generateAiPackage);
router.get('/packages/active/:childId', authenticate, verifyChildAccess, packageCtrl.getActivePackage);
router.post('/packages/tasks/:taskId/result', authenticate, logAudit('RECORD_TASK_RESULT', 'DailyTaskResult'), packageCtrl.recordDailyTaskResult);
router.post('/packages/:packageId/review', authenticate, authorize(['SPECIALIST', 'ADMIN']), logAudit('REVIEW_PACKAGE', 'SpecialistReview'), packageCtrl.reviewPackage);

// 5. AAC Communication routes
router.get('/aac/cards', authenticate, aacCtrl.getAacCategoriesAndCards);
router.post('/aac/cards', authenticate, aacCtrl.createAacCard);
router.get('/aac/board/:childId', authenticate, verifyChildAccess, aacCtrl.getChildBoard);
router.put('/aac/board/:childId', authenticate, verifyChildAccess, aacCtrl.updateChildBoard);

// 6. Behavior Diary routes
router.post('/behavior', authenticate, logAudit('RECORD_BEHAVIOR', 'BehaviorLog'), behaviorCtrl.createBehaviorLog);
router.get('/behavior/child/:childId', authenticate, verifyChildAccess, behaviorCtrl.getChildBehaviorLogs);

// 7. Progress & Analytics routes
router.get('/progress/child/:childId', authenticate, verifyChildAccess, progressCtrl.getChildProgress);

// 8. Specialist Dashboard routes
router.get('/specialist/dashboard', authenticate, authorize(['SPECIALIST', 'ADMIN']), specialistCtrl.getSpecialistDashboard);
router.post('/specialist/sessions', authenticate, authorize(['SPECIALIST']), specialistCtrl.logTherapySession);

// 9. Admin routes
router.get('/admin/metrics', authenticate, authorize(['ADMIN']), adminCtrl.getAdminMetrics);
router.get('/admin/conditions', authenticate, adminCtrl.getConditions);
router.post('/admin/conditions', authenticate, authorize(['ADMIN']), adminCtrl.createCondition);
router.put('/admin/conditions/:id', authenticate, authorize(['ADMIN']), adminCtrl.updateCondition);
router.get('/admin/audit-logs', authenticate, authorize(['ADMIN']), adminCtrl.getAuditLogs);
router.get('/admin/ai-logs', authenticate, authorize(['ADMIN']), adminCtrl.getAiLogs);

// 10. Offline PWA Batch Sync route
router.post('/sync', authenticate, syncCtrl.batchSync);

// 11. AI Dedicated Service routes
router.post('/ai/assessment-analysis', authenticate, aiCtrl.analyzeAssessment);
router.post('/ai/generate-package', authenticate, logAudit('AI_GENERATE_PACKAGE', 'IndividualPackage'), aiCtrl.generatePackage);
router.post('/ai/behavior-analysis', authenticate, aiCtrl.analyzeBehavior);
router.post('/ai/replan', authenticate, aiCtrl.evaluateReplan);
router.post('/ai/chat', authenticate, aiCtrl.chatAssistant);

// 12. PDF/JSON Report routes
router.get('/reports/parent/:childId', authenticate, verifyChildAccess, reportCtrl.getParentReport);
router.get('/reports/specialist/:childId', authenticate, authorize(['SPECIALIST', 'ADMIN']), reportCtrl.getSpecialistReport);

export default router;

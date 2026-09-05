import request from 'supertest';
import app from '../src/index.js';
import { prisma } from '../src/utils/prisma.js';

describe('MEHR AI Comprehensive Backend Test Suite', () => {
  let parentToken = '';
  let specialistToken = '';
  let testChildId = '';

  beforeAll(async () => {
    // Find seeded test child
    const child = await prisma.child.findFirst({
      where: { firstName: 'Jasur' },
    });
    if (child) {
      testChildId = child.id;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Health & Security Verification', () => {
    it('should return 200 and healthy status for /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('HEALTHY');
      expect(res.body.database).toBe('CONNECTED');
    });

    it('should block protected routes without token', async () => {
      const res = await request(app).get('/api/children');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Authentication & RBAC', () => {
    it('should successfully log in as seeded parent (Dilnoza)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'dilnoza@mehr.uz', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.role).toBe('PARENT');
      parentToken = res.body.data.accessToken;
    });

    it('should successfully log in as seeded specialist (Dr. Nodira)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'dr.nodira@mehr.uz', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('SPECIALIST');
      specialistToken = res.body.data.accessToken;
    });

    it('should return current user profile via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('dilnoza@mehr.uz');
      expect(res.body.data.parentProfile).toBeDefined();
    });

    it('should reject specialist-only dashboard for parent role', async () => {
      const res = await request(app)
        .get('/api/specialist/dashboard')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow specialist-only dashboard for specialist role', async () => {
      const res = await request(app)
        .get('/api/specialist/dashboard')
        .set('Authorization', `Bearer ${specialistToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics).toBeDefined();
    });
  });

  describe('3. Digital Assessment System', () => {
    it('should fetch 6 developmental domains and assessment questions', async () => {
      const res = await request(app)
        .get('/api/assessments/questions')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(6);
    });

    it('should submit an assessment with 0-5 scale answers and compute domain percentages', async () => {
      const questions = await prisma.assessmentQuestion.findMany({ take: 3 });

      const answers = questions.map((q, idx) => ({
        questionId: q.id,
        score: idx + 2, // 2, 3, 4
      }));

      const res = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: testChildId,
          type: 'PERIODIC',
          answers,
          notes: 'Test assessment submission',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalScore).toBeGreaterThan(0);
      expect(res.body.data.results.length).toBeGreaterThan(0);
    });
  });

  describe('4. AI Individual Package Generator (13-step Algorithm)', () => {
    it('should generate an individual development package with 30 daily tasks', async () => {
      const res = await request(app)
        .post('/api/packages/generate')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: testChildId,
          parentGoals: 'Bolaning nutqini va o‘z-o‘ziga xizmat ko‘nikmalarini oshirish',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const pkg = res.body.data.package;
      expect(pkg.title).toContain('MEHR Individual Rivojlantirish Paketi');
      expect(pkg.durationDays).toBe(30);
      expect(pkg.modules.length).toBe(4); // 4 weekly progression modules
      expect(pkg.dailyTasks.length).toBe(30); // 30 daily 15-minute tasks
      expect(res.body.data.aiRecommendations).toBeDefined();
      expect(res.body.data.disclaimer).toContain('AI yordamchi tavsiyasi');
    });

    it('should record a daily task completion result', async () => {
      const task = await prisma.dailyTask.findFirst();
      expect(task).toBeDefined();

      const res = await request(app)
        .post(`/api/packages/tasks/${task!.id}/result`)
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: testChildId,
          status: 'COMPLETED',
          assistanceLevel: 3,
          childReaction: 'POSITIVE',
          durationSpent: 15,
          parentNotes: 'Muvaffaqiyatli bajarildi',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });

  describe('5. Behavior Diary (ABC Log) & AI Trigger Recognition', () => {
    it('should create an ABC behavior log and return AI pattern analysis', async () => {
      const res = await request(app)
        .post('/api/behavior')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: testChildId,
          situation: 'Mehmonxonada televizor o‘chirilganda',
          behaviorDescription: 'Yig‘i va polga yotib oyoq tepish',
          antecedent: 'Multfilmni to‘satdan to‘xtatish',
          parentResponse: 'Sokin quchoqlab, qumsoat ko‘rsatildi',
          outcome: '3 daqiqada tinchlandi',
          severity: 'MILD',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiAnalysis.triggers.length).toBeGreaterThan(0);
      expect(res.body.data.aiAnalysis.suggestedStrategies.length).toBeGreaterThan(0);
    });
  });

  describe('6. Interactive AAC Communication Module', () => {
    it('should return AAC categories and cards with labels and icons', async () => {
      const res = await request(app)
        .get('/api/aac/cards')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
      const firstCat = res.body.data[0];
      expect(firstCat.cards.length).toBeGreaterThan(0);
    });
  });

  describe('7. Offline PWA Batch Synchronization', () => {
    it('should process offline batch mutations idempotently', async () => {
      const clientMutationId = `mut-${Date.now()}`;
      const res = await request(app)
        .post('/api/sync')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          mutations: [
            {
              clientMutationId,
              entityType: 'BEHAVIOR_LOG',
              action: 'CREATE',
              payload: {
                childId: testChildId,
                situation: 'Bog‘chadan qaytganda',
                behaviorDescription: 'Eshik tagida o‘tirib oldi',
                antecedent: 'Oyoq kiyimini yechishni so‘rash',
                parentResponse: 'Yordam berib birga yechildi',
                outcome: 'Kirdi',
                severity: 'MILD',
              },
              createdAt: new Date().toISOString(),
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.syncedCount).toBe(1);

      // Repeat request to check idempotency
      const resRepeat = await request(app)
        .post('/api/sync')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          mutations: [
            {
              clientMutationId,
              entityType: 'BEHAVIOR_LOG',
              action: 'CREATE',
              payload: {},
              createdAt: new Date().toISOString(),
            },
          ],
        });

      expect(resRepeat.status).toBe(200);
      expect(resRepeat.body.results[0].status).toBe('ALREADY_SYNCED');
    });
  });

  describe('8. AI Pediatric Assistant Chat', () => {
    it('should answer parental questions with empathetic, sensory-aware advice', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: testChildId,
          message: 'Bugun bola mashq qilishni xohlamayapti, nima qilish kerak?',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answer).toContain('mashg‘ulotdan bosh tortishi');
      expect(res.body.data.suggestedActions.length).toBeGreaterThan(0);
      expect(res.body.data.disclaimer).toContain('AI yordamchi tavsiyasi');
    });

    it('should trigger medical escalation if questions mention emergency signs', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: testChildId,
          message: 'Bolada tutqanoq bo‘lyapti, nima dori beray?',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.escalateToSpecialist).toBe(true);
      expect(res.body.data.answer).toContain('103');
    });
  });
});

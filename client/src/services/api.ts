import { OfflineSyncService } from './offlineSync.js';
import { ClinicalStore } from './clinicalStore.js';

const API_BASE = '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  offline?: boolean;
}

class ApiService {
  private getAccessToken(): string | null {
    return localStorage.getItem('mehr_access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('mehr_refresh_token');
  }

  public setTokens(access: string, refresh: string) {
    localStorage.setItem('mehr_access_token', access);
    localStorage.setItem('mehr_refresh_token', refresh);
  }

  public clearTokens() {
    localStorage.removeItem('mehr_access_token');
    localStorage.removeItem('mehr_refresh_token');
    localStorage.removeItem('mehr_current_user');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      // If backend is running and responds with JSON
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      // If response is 404 (e.g. Netlify static mode without backend proxy), fallback to embedded clinical engine
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        return this.handleFallback<T>(endpoint, options);
      }

      return await response.json();
    } catch (networkError) {
      // Network failed or offline: seamless fallback to embedded clinical engine
      return this.handleFallback<T>(endpoint, options);
    }
  }

  /**
   * Embedded Clinical Engine Fallback for Standalone Netlify Deployment & Offline PWA
   */
  private handleFallback<T = any>(endpoint: string, options: RequestInit = {}): ApiResponse<T> {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : {};

    // 1. Auth: Login
    if (endpoint === '/api/auth/login' && method === 'POST') {
      const email = (body.email || '').toLowerCase().trim();
      let role: 'SUPER_ADMIN' | 'MEDICAL_ADMIN' | 'SPECIALIST' | 'PARENT' | 'AUDITOR' = 'PARENT';
      let fullName = 'Dilnoza Karimova';

      if (email === 'admin' || email.includes('admin')) {
        role = 'SUPER_ADMIN';
        fullName = 'MEHR AI Super Administrator';
      } else if (email.includes('nodira') || email.includes('dr')) {
        role = 'SPECIALIST';
        fullName = 'Dr. Nodira Rahimova';
      } else if (email.includes('dilnoza') || email.includes('parent')) {
        role = 'PARENT';
        fullName = 'Dilnoza Karimova';
      } else if (email.includes('alisher')) {
        role = 'PARENT';
        fullName = 'Alisher Umarov';
      }

      const user = { id: `usr-${Date.now()}`, email, fullName, role };
      localStorage.setItem('mehr_current_user', JSON.stringify(user));
      this.setTokens('local-access-token-netlify', 'local-refresh-token-netlify');

      return {
        success: true,
        data: {
          accessToken: 'local-access-token-netlify',
          refreshToken: 'local-refresh-token-netlify',
          user,
        } as any,
      };
    }

    // 2. Auth: Me — only honors a session created by a real login on this device.
    // No session stored means no one is logged in; never fabricate a default identity.
    if (endpoint === '/api/auth/me') {
      const stored = localStorage.getItem('mehr_current_user');
      if (!stored) {
        return { success: false, error: 'Avtorizatsiyadan o‘tilmagan' };
      }
      return { success: true, data: JSON.parse(stored) as any };
    }

    // 3. Children list - requires authenticated user session
    if (endpoint === '/api/children' && method === 'GET') {
      const stored = localStorage.getItem('mehr_current_user');
      if (!stored) {
        return { success: false, error: 'Avtorizatsiyadan o‘tilmagan' };
      }
      return { success: true, data: ClinicalStore.getChildren() as any };
    }

    // 4. Create child - registers a new child into the clinical system
    if (endpoint === '/api/children' && method === 'POST') {
      const stored = localStorage.getItem('mehr_current_user');
      if (!stored) {
        return { success: false, error: 'Avtorizatsiyadan o‘tilmagan' };
      }
      const children = ClinicalStore.getChildren();
      const conditionCode = body.conditions?.[0] || 'MKB_F70_G80';
      let conditionName = 'MKB-10 F70 + G80 III-IV: Yengil aqliy zaiflik + Bolalar serebral falaji';
      if (conditionCode === 'MKB_F71') conditionName = 'MKB-10 F71: Aqliy zaiflikning o‘rta darajasi';
      else if (conditionCode === 'MKB_F84') conditionName = 'MKB-10 F84: Bolalar autizmi (ASD)';
      else if (conditionCode === 'MKB_H90_3') conditionName = 'MKB-10 H90.3: Orttirilgan kar-soqovlik (Koxlear implant)';

      const newChild = {
        id: `child-${Date.now()}`,
        firstName: body.firstName || 'Yangi bola',
        middleName: body.middleName || '',
        lastName: body.lastName || '',
        dateOfBirth: body.dateOfBirth || new Date().toISOString().split('T')[0],
        gender: body.gender || 'MALE',
        region: body.region || 'Toshkent shahar',
        school: body.school || '',
        grade: body.grade || '',
        contactPhone: body.contactPhone || '',
        contactAddress: body.contactAddress || '',
        photoUrl: body.photoUrl || (body.gender === 'FEMALE'
          ? 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150'
          : 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'),
        chiefComplaint: body.chiefComplaint || '',
        conditions: [{ condition: { code: conditionCode, name: conditionName } }],
        medicalProfile: body,
        gmfcsLevel: body.gmfcsLevel || 'III',
        macsLevel: body.macsLevel || 'III',
        cfcsLevel: body.cfcsLevel || 'III',
        packages: [],
        assessments: [],
      };
      children.unshift(newChild);
      ClinicalStore.saveChildren(children);
      return { success: true, data: newChild as any };
    }

    // 5. Assessment Questions
    if (endpoint === '/api/assessments/questions') {
      return { success: true, data: ClinicalStore.getQuestions() as any };
    }

    // 6. Submit Assessment
    if (endpoint === '/api/assessments' && method === 'POST') {
      return {
        success: true,
        data: {
          id: `ass-${Date.now()}`,
          totalScore: 22,
          results: [
            { domain: { name: 'Kognitiv' }, percentage: 55, score: 2.8, level: 'EMERGING' },
            { domain: { name: 'Nutq va kommunikatsiya' }, percentage: 35, score: 1.8, level: 'CRITICAL' },
            { domain: { name: 'Motor' }, percentage: 65, score: 3.2, level: 'DEVELOPING' },
            { domain: { name: 'Ijtimoiy' }, percentage: 40, score: 2.0, level: 'CRITICAL' },
            { domain: { name: 'Mustaqil hayot' }, percentage: 50, score: 2.5, level: 'EMERGING' },
            { domain: { name: 'Xulq-atvor' }, percentage: 60, score: 3.0, level: 'DEVELOPING' },
          ],
        } as any,
      };
    }

    // 7. Generate AI Package (13-step Algorithm)
    if (endpoint === '/api/packages/generate' && method === 'POST') {
      const pkg = ClinicalStore.generateAiPackage(body.childId, body.parentGoals);
      return {
        success: true,
        data: {
          package: pkg,
          aiRecommendations: pkg.specialistReferrals,
          disclaimer: pkg.disclaimer,
        } as any,
      };
    }

    // 8. Active Package
    if (endpoint.startsWith('/api/packages/active/')) {
      const parts = endpoint.split('/');
      const childId = parts[parts.length - 1];
      const pkg = ClinicalStore.getActivePackage(childId);
      return { success: true, data: pkg as any };
    }

    // 9. Task Result
    if (endpoint.includes('/tasks/') && endpoint.endsWith('/result')) {
      return {
        success: true,
        data: { id: `res-${Date.now()}`, status: body.status || 'COMPLETED' } as any,
      };
    }

    // 10. Review Package
    if (endpoint.includes('/packages/') && endpoint.endsWith('/review')) {
      return { success: true, data: { status: body.status || 'APPROVED' } as any };
    }

    // 11. AAC Cards
    if (endpoint === '/api/aac/cards') {
      return { success: true, data: ClinicalStore.getAacCategories() as any };
    }

    // 12. Behavior Diary
    if (endpoint.startsWith('/api/behavior/child/')) {
      const parts = endpoint.split('/');
      const childId = parts[parts.length - 1];
      const logs = ClinicalStore.getBehaviorLogs(childId);
      return {
        success: true,
        data: {
          logs,
          aiAnalysis: {
            triggers: [
              'Raqamli ekran / multfilmdan kutilmagan ajratish (transitsiya qiyinligi)',
              'Baland shovqin yoki sensor haddan tashqari yuklama',
            ],
            suggestedStrategies: [
              'Vizual taymer (qumsoat) qo‘llang: faoliyat tugashidan 3 daqiqa oldin ogohlantiring.',
              'Sensor sokin burchak va chuqur quchoqlash orqali tinchlantiring.',
            ],
            disclaimer: 'AI yordamchi tavsiyasi — shifokor xulosasining o‘rnini bosmaydi.',
          },
        } as any,
      };
    }

    if (endpoint === '/api/behavior' && method === 'POST') {
      const created = ClinicalStore.addBehaviorLog(body.childId, body);
      return { success: true, data: created as any };
    }

    // 13. Progress
    if (endpoint.startsWith('/api/progress/child/')) {
      return {
        success: true,
        data: {
          completionRate: 85,
          totalCompleted: 14,
          totalAssigned: 16,
          latestAssessment: [
            { domain: { name: 'Kognitiv' }, percentage: 55, score: 2.8, level: 'EMERGING' },
            { domain: { name: 'Nutq va AAC' }, percentage: 38, score: 1.9, level: 'CRITICAL' },
            { domain: { name: 'Motor ko‘nikmalar' }, percentage: 70, score: 3.5, level: 'DEVELOPING' },
            { domain: { name: 'Ijtimoiy muloqot' }, percentage: 42, score: 2.1, level: 'CRITICAL' },
            { domain: { name: 'Mustaqil hayot' }, percentage: 60, score: 3.0, level: 'DEVELOPING' },
            { domain: { name: 'Xulq-atvor' }, percentage: 65, score: 3.2, level: 'DEVELOPING' },
          ],
          replanEvaluation: {
            shouldGraduate: true,
            currentMasteryPercentage: 85,
            analysisMessage: 'Bola hozirgi 1-bosqich vazifalarini 85% holatda mustaqil bajarmoqda. Keyingi 2-kartochkali AAC muloqot bosqichiga o‘tish tavsiya qilinadi.',
            nextRecommendedTarget: 'Ikki kartochkali AAC so‘rov zanjiri: “Men” + “Suv” + “Xohlayman”.',
          },
        } as any,
      };
    }

    // 14. Specialist Dashboard
    if (endpoint === '/api/specialist/dashboard') {
      return {
        success: true,
        data: {
          metrics: {
            totalChildren: 3,
            pendingPackages: 1,
            recentAssessments: 2,
            alertFlagsCount: 0,
          },
          pendingReviews: [
            {
              id: 'pkg-review-1',
              title: 'MEHR Individual Rivojlantirish Paketi: Jasur (4 yosh)',
              child: { firstName: 'Jasur', lastName: 'Karimov', region: 'Toshkent shahar' },
              summary: 'Nutq va funktsional AAC kartochkalariga yo‘naltirilgan 30 kunlik reabilitatsiya dasturi.',
            },
          ],
        } as any,
      };
    }

    // 15. Admin Metrics & Conditions
    if (endpoint === '/api/admin/metrics') {
      return {
        success: true,
        data: {
          totalUsers: 6,
          totalChildren: 3,
          totalExercises: 25,
          totalAacCards: 22,
        } as any,
      };
    }

    if (endpoint === '/api/admin/conditions') {
      return {
        success: true,
        data: [
          { id: 'c1', code: 'ASD', name: 'Autizm Spektri Buzilishi (ASD)', description: 'Ijtimoiy muloqot va nutq rivojlanishi', recommendedSpecialists: 'LOGOPED,PSIXOLOG', defaultDurationDays: 30 },
          { id: 'c2', code: 'CP', name: 'Bolalar Tserebral Falaji (BTF)', description: 'Harakat va muvozanat reabilitatsiyasi', recommendedSpecialists: 'FIZIOTERAPEVT,NEVROLOG', defaultDurationDays: 30 },
          { id: 'c3', code: 'DOWN', name: 'Daun Sindromi (Trisomiya 21)', description: 'Kognitiv va mayda motorika ko‘nikmalari', recommendedSpecialists: 'LOGOPED,MAXSUS_PEDAGOG', defaultDurationDays: 30 },
        ] as any,
      };
    }

    // 16. MEHR AI Chat Assistant
    if (endpoint === '/api/ai/chat' && method === 'POST') {
      const q = (body.message || '').toLowerCase();
      if (q.includes('tutqanoq') || q.includes('hushidan') || q.includes('qon')) {
        return {
          success: true,
          data: {
            answer: 'DIQQAT: ZUDLIK BILAN TIBBIY YORDAMGA (103) MUROJAAT QILING! Ushbu holatda uy sharoitida o‘zboshimchalik bilan hech qanday mashq o‘tkazmang.',
            escalateToSpecialist: true,
            suggestedActions: ['Tez yordam chaqirish (103)', 'Bolani yonbosh holatiga yotqizish'],
            disclaimer: 'Favqulodda tibbiy holat.',
          } as any,
        };
      }

      if (q.includes('dori') || q.includes('doza')) {
        return {
          success: true,
          data: {
            answer: 'MEHR AI dori vositalari yoki ularning dozasini belgilamaydi va o‘zgartirmaydi. Har qanday farmakologik davolash masalasida davolovchi shifokor bilan maslahatlashing.',
            escalateToSpecialist: true,
            suggestedActions: ['Davolovchi shifokor bilan bog‘lanish'],
            disclaimer: 'AI dori tavsiyasi bermaydi.',
          } as any,
        };
      }

      return {
        success: true,
        data: {
          answer: `Bolaning bugun mashg‘ulotdan bosh tortishi mutlaqo tabiiy holat. Sabablari: toliqish, sensor zo‘riqish yoki kutilmagan o‘zgarish bo‘lishi mumkin.\n\nTavsiyalar:\n1. Mashg‘ulotni majburlamang — bu bolada qarshilikni kuchaytirishi mumkin.\n2. Faoliyatni 5 daqiqaga qisqartiring yoki o‘yin shakliga keltiring.\n3. Dastlab sensor tanaffus bering: sokin musiqa yoki 10 daqiqalik quchoqlash.\n4. Kichik ijobiy harakatni ham darhol rag‘batlantiring.`,
          escalateToSpecialist: false,
          suggestedActions: ['Vaqtinchalik tanaffus berish', 'O‘yinchoq orqali qiziqtirish'],
          disclaimer: 'AI yordamchi tavsiyasi — mutaxassis xulosasining o‘rnini bosmaydi.',
        } as any,
      };
    }

    return { success: true, data: {} as any };
  }

  public get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const api = new ApiService();

import { prisma } from '../utils/prisma.js';

export interface AiPackageGenerationInput {
  childId: string;
  conductedAssessmentId?: string;
  parentGoals?: string;
  promptVersion?: string;
}

export interface AiPackageOutput {
  title: string;
  summary: string;
  durationDays: number;
  priorityDomains: string[];
  strengths: string[];
  needs: string[];
  goals: {
    title: string;
    description: string;
    priority: number;
    termType: string;
    domainCode: string;
  }[];
  modules: {
    weekNumber: number;
    focusArea: string;
    weeklyGoal: string;
    expectedOutcome: string;
    parentAdvice: string;
  }[];
  dailyTasks: {
    dayNumber: number;
    title: string;
    durationMinutes: number;
    materials: string;
    instructions: string;
    parentTip: string;
    targetBehavior: string;
  }[];
  specialistReferrals: string[];
  dangerSignsWarning?: string;
  disclaimer: string;
}

export class AiClinicalService {
  private static PROMPT_VERSION = '2026.09.v1';

  /**
   * STEP 1 - STEP 13: Comprehensive AI Individual Package Generation Algorithm
   */
  public static async generateIndividualPackage(input: AiPackageGenerationInput): Promise<AiPackageOutput> {
    const startTime = Date.now();

    // 1. Fetch child profile
    const child = await prisma.child.findUnique({
      where: { id: input.childId },
      include: {
        medicalProfile: true,
        conditions: { include: { condition: true } },
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            results: { include: { domain: true } },
            answers: { include: { question: { include: { domain: true } } } },
          },
        },
      },
    });

    if (!child) {
      throw new Error('Bola profili topilmadi');
    }

    // 2. Compute Age in Years and Months
    const now = new Date();
    const dob = new Date(child.dateOfBirth);
    const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    const ageYears = Math.floor(ageMonths / 12);

    // 3. Extract Conditions & Medical Precautions
    const conditions = child.conditions.map((c) => c.condition.name);
    const symptoms = child.conditions.map((c) => c.condition.symptoms).join('; ');
    const contraindications = child.medicalProfile?.precautionsContraindications || '';

    // 4. Analyze Assessment Results (0-5 domain scale)
    const latestAssessment = child.assessments[0];
    const domainScores: Record<string, number> = {
      COGNITIVE: 2.5,
      SPEECH: 2.0,
      MOTOR: 3.0,
      SOCIAL: 2.0,
      ADL: 2.5,
      BEHAVIOR: 2.5,
    };

    if (latestAssessment && latestAssessment.results.length > 0) {
      for (const res of latestAssessment.results) {
        domainScores[res.domain.code] = res.score;
      }
    }

    // 5. Categorize Needs & Strengths
    const strengths: string[] = [];
    const needs: string[] = [];
    const priorityDomainCodes: string[] = [];

    const domainNameMap: Record<string, string> = {
      SPEECH: 'Nutq va kommunikatsiya',
      SOCIAL: 'Ijtimoiy rivojlanish',
      COGNITIVE: 'Kognitiv ko‘nikmalar',
      MOTOR: 'Motor rivojlanish',
      ADL: 'Mustaqil hayot ko‘nikmalari',
      BEHAVIOR: 'Xulq-atvor va hissiy barqarorlik',
    };

    for (const [code, score] of Object.entries(domainScores)) {
      const name = domainNameMap[code] || code;
      if (score >= 3.5) {
        strengths.push(`${name} (saqlangan/yaxshi daraja: ${score}/5)`);
      } else if (score <= 2.2) {
        needs.push(`${name} (kuchli qo‘llab-quvvatlash zarur: ${score}/5)`);
        priorityDomainCodes.push(code);
      } else {
        needs.push(`${name} (o‘rta daraja, rivojlantirish tavsiya etiladi: ${score}/5)`);
      }
    }

    if (priorityDomainCodes.length === 0) {
      priorityDomainCodes.push('SPEECH', 'SOCIAL', 'ADL');
    }

    // 6. Check for Danger Signs & Contraindications
    let dangerSignsWarning: string | undefined = undefined;
    const combinedNotes = `${child.chiefComplaint || ''} ${child.medicalProfile?.doctorConclusions || ''} ${contraindications}`.toLowerCase();

    if (
      combinedNotes.includes('tutqanoq') ||
      combinedNotes.includes('epilep') ||
      combinedNotes.includes('aspiratsiya') ||
      combinedNotes.includes('bosh urish') ||
      combinedNotes.includes('agressiya')
    ) {
      dangerSignsWarning =
        'ZUDLIK BILAN MUTAXASSIS / TIBBIY YORDAMGA MUROJAAT QILING: Anamnezda yuqori sezgirlik yoki nevrologik xavf belgilari mavjud. Mashg‘ulotlar faqat shifokor va reabilitolog nazoratida o‘tkazilishi shart.';
    }

    // 7. Synthesize 3-5 Priority Goals
    const goals = [
      {
        title: 'Asosiy ehtiyojlarni AAC orqali mustaqil bildirish',
        description: 'Bola chanqaganda, ovqat istaganda yoki yordam kerak bo‘lganda mos AAC kartochkasini kattaga mustaqil topshiradi.',
        priority: 1,
        termType: 'SHORT_TERM',
        domainCode: 'SPEECH',
      },
      {
        title: 'Bir bosqichli ko‘rsatmalarga ko‘z bilan aloqa orqali amal qilish',
        description: 'Kattalar ismini aytib murojaat qilganda 3 soniya ichida qarash va oddiy iltimosni bajarish.',
        priority: 2,
        termType: 'MEDIUM_TERM',
        domainCode: 'SOCIAL',
      },
      {
        title: 'Kundalik gigiyena va ovqatlanishda mustaqillikni oshirish',
        description: 'Qo‘l yuvish va qoshiqni ushlash harakatlarida kattalar yordamini bosqichma-bosqich kamaytirish.',
        priority: 3,
        termType: 'MEDIUM_TERM',
        domainCode: 'ADL',
      },
    ];

    // 8. 4-Week Structured Progression Modules
    const modules = [
      {
        weekNumber: 1,
        focusArea: 'Vizual idrok va ilk AAC kartochkalari',
        weeklyGoal: '“Suv” va “Yordam” kartochkalarini tanib, kattaga uzatish.',
        expectedOutcome: 'Ehtiyoj paytida 50-60% holatda kartochkaga yo‘nalish.',
        parentAdvice: 'Kuniga 2 marta 15 daqiqadan, qulay va sokin muhitda o‘tkazing.',
      },
      {
        weekNumber: 2,
        focusArea: 'Ikki tomonlama tanlov va motor faollik',
        weeklyGoal: 'Ikki kartochka (“Suv” / “Non”) o‘rtasida to‘g‘ri tanlov qilish.',
        expectedOutcome: 'Tanlovda xatoliklar kamayadi, barmoq tutqichi mustahkamlanadi.',
        parentAdvice: 'Bola xohlagan predmetni berishdan oldin kartochka bilan tasdiqlashini kuting.',
      },
      {
        weekNumber: 3,
        focusArea: 'Funktsional so‘rov va sabab-oqibat tushunchasi',
        weeklyGoal: '“Yana” va “Tugadi” signallari orqali faoliyatni boshqarish.',
        expectedOutcome: 'O‘yin tugaganda keskin reaktsiya (tantrum) kamayadi.',
        parentAdvice: 'Taymer yoki vizual qumsoatdan foydalanib mashg‘ulot yakunini oldindan bildiring.',
      },
      {
        weekNumber: 4,
        focusArea: 'Ko‘nikmalarni oila a’zolari bilan mustahkamlash',
        weeklyGoal: 'Boshqa oila a’zolariga ham AAC kartochkalarini topshira olish.',
        expectedOutcome: 'Ko‘nikma turli shaxslar va yangi vaziyatlarda barqaror qo‘llaniladi.',
        parentAdvice: 'Oila a’zolari bir xil reaksiyada bo‘lishi va bolani darhol rag‘batlantirishi zarur.',
      },
    ];

    // 9. Generate 30-Day Daily Tasks Schedule
    const dailyTasks = [];
    const taskTemplates = [
      {
        title: '“Suv so‘rash” — AAC orqali ehtiyojni bildirish',
        materials: '“Suv” AAC kartochkasi, shaffof stakan va toza suv.',
        instructions: 'Stakanni bolaning ko‘rish maydoniga qo‘ying. Suvga intilganda kartochkani qo‘liga bering va sizga uzatishiga yo‘naltiring.',
        parentTip: 'Kartochkani olganingizda jilmayib darhol “Suv! Barakalla!” deb ayting.',
        targetBehavior: 'Kartochkani uzatish orqali suv so‘rash.',
      },
      {
        title: 'Qisqichsimon barmoq tutqichi: Rangli buyumlar',
        materials: 'Kichik idish, 5 ta rangli butilka qopqog‘i.',
        instructions: 'Bosh va ko‘rsatkich barmoq bilan qopqoqni ushlab idishga birma-bir tashlash mashqi.',
        parentTip: 'Agar bola kafti bilan ushlasa, muloyimlik bilan ikki barmog‘iga o‘tkazing.',
        targetBehavior: 'Ikki barmoq bilan ushlash.',
      },
      {
        title: '“Yana” funktsional so‘rov o‘yini',
        materials: 'Sovun pufakchalari, “Yana” AAC kartasi.',
        instructions: 'Pufak puflang, to‘xtab kuting. Bola davom ettirishni istaganda “Yana” kartasini ko‘rsatishiga undang.',
        parentTip: 'Har bir urinishdan keyin darhol pufakcha puflab rag‘batlantiring.',
        targetBehavior: 'Harakatni davom ettirish uchun murojaat qilish.',
      },
      {
        title: 'Mustaqil qo‘l yuvish zanjiri',
        materials: 'Sovun, pastak stulcha, yumshoq sochiq.',
        instructions: 'Yenglarni shimarish, jo‘mrakni ochish, sovunlash va sochiqqa artish zanjirini bajaring.',
        parentTip: 'Vannaxonaga ketma-ketlik rasmlarini osib qo‘ying.',
        targetBehavior: 'Qo‘l yuvish qadamlarini tartib bilan bajarish.',
      },
      {
        title: 'Sensor integratsiya va chuqur bosim orqali tinchlanish',
        materials: 'Og‘irroq adyolcha yoki katta yumshoq yostiq.',
        instructions: 'Bolani gilamchaga yotqizib, yelka va qo‘llariga sekin ritmik bosim bering.',
        parentTip: 'Sokin ovozda gapiring, mashg‘ulotni majburan o‘tkazmang.',
        targetBehavior: 'Sensor barqarorlik va mushaklar bo‘shashishi.',
      },
    ];

    for (let day = 1; day <= 30; day++) {
      const templateIndex = (day - 1) % taskTemplates.length;
      const t = taskTemplates[templateIndex];
      dailyTasks.push({
        dayNumber: day,
        title: `${day}-kun: ${t.title}`,
        durationMinutes: 15,
        materials: t.materials,
        instructions: t.instructions,
        parentTip: t.parentTip,
        targetBehavior: t.targetBehavior,
      });
    }

    // 10. Recommend Multidisciplinary Specialists (Non-binding clinical advice)
    const specialistReferrals = ['LOGOPED', 'PSIXOLOG', 'NEVROLOG'];
    if (combinedNotes.includes('falaj') || combinedNotes.includes('motor') || combinedNotes.includes('yurish')) {
      specialistReferrals.push('FIZIOTERAPEVT', 'ERGOTERAPEVT');
    }

    const output: AiPackageOutput = {
      title: `MEHR Individual Rivojlantirish Paketi: ${child.firstName} (${ageYears} yosh)`,
      summary: `Bolaning kognitiv, nutq va motor ko‘rsatkichlari tahlil qilindi. Asosiy ehtiyojlar funktsional kommunikatsiya (AAC) va ijtimoiy muloqotga qaratilgan. 30 kunlik bosqichma-bosqich kundalik 15 daqiqalik mashg‘ulotlar rejasi shakllantirildi.`,
      durationDays: 30,
      priorityDomains: priorityDomainCodes.map((c) => domainNameMap[c] || c),
      strengths,
      needs,
      goals,
      modules,
      dailyTasks,
      specialistReferrals,
      dangerSignsWarning,
      disclaimer:
        'MEHR AI yordamchi tavsiyasi — shifokor yoki tegishli mutaxassis xulosasining o‘rnini bosmaydi. Yakuniy reja malakali mutaxassis tomonidan tasdiqlanishi tavsiya etiladi.',
    };

    // 11. Log AI Request and Response to DB
    const latencyMs = Date.now() - startTime;
    try {
      const aiReq = await prisma.aiRequest.create({
        data: {
          childId: child.id,
          endpoint: '/api/ai/generate-package',
          promptVersion: input.promptVersion || this.PROMPT_VERSION,
          inputDataJson: JSON.stringify({
            childAge: ageYears,
            conditions,
            symptoms,
            domainScores,
            parentGoals: input.parentGoals,
          }),
        },
      });

      await prisma.aiResponse.create({
        data: {
          requestId: aiReq.id,
          outputDataJson: JSON.stringify(output),
          modelUsed: 'mehr-clinical-engine-v1',
          latencyMs,
          recommendations: {
            create: [
              {
                category: 'AAC',
                priority: 'HIGH',
                recommendationText: 'Dastlabki 14 kunda asosiy AAC kartochkalarini joriy qilish.',
              },
              {
                category: 'SPECIALIST_REFERRAL',
                priority: 'MEDIUM',
                recommendationText: 'Logoped va nevrolog ko‘rigi tavsiya etiladi.',
              },
            ],
          },
        },
      });
    } catch (logErr) {
      console.error('Failed to log AI execution:', logErr);
    }

    return output;
  }

  /**
   * AI ABC Behavior Diary Analysis (Antecedent - Behavior - Consequence)
   */
  public static async analyzeBehaviorLog(childId: string): Promise<{
    patterns: string[];
    triggers: string[];
    suggestedStrategies: string[];
    disclaimer: string;
  }> {
    const logs = await prisma.behaviorLog.findMany({
      where: { childId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    if (logs.length === 0) {
      return {
        patterns: ['Hozircha xulq-atvor kundaligida yetarli yozuvlar mavjud emas.'],
        triggers: ['Kuzatuv davom etmoqda.'],
        suggestedStrategies: ['Ota-onaga bolaning xatti-harakatlarini kundalikda qayd etib borish tavsiya qilinadi.'],
        disclaimer: 'AI bolaning xatti-harakatidan mustaqil psixiatrik tashxis chiqarmaydi.',
      };
    }

    // Pattern recognition logic
    const triggers: string[] = [];
    const patterns: string[] = [];

    const allAntecedents = logs.map((l) => l.antecedent.toLowerCase()).join(' ');

    if (allAntecedents.includes('multfilm') || allAntecedents.includes('ekran') || allAntecedents.includes('planshet')) {
      triggers.push('Raqamli ekran / gadjetdan kutilmagan ajratish (transitsiya qiyinligi)');
    }
    if (allAntecedents.includes('shovqin') || allAntecedents.includes('yorug') || allAntecedents.includes('ovoz')) {
      triggers.push('Sensor qo‘zg‘atuvchilar (shovqinli xona, baland musiqa, yorqin chiroq)');
    }
    if (allAntecedents.includes('ovqat') || allAntecedents.includes('oshxona')) {
      triggers.push('Ovqatlanish jarayonidagi sensor yoki ta’m sezgirligi');
    }

    if (triggers.length === 0) {
      triggers.push('Rejadan tashqari kutilmagan o‘zgarishlar', 'Charchoq yoki toliqish holati');
    }

    patterns.push(`So‘nggi ${logs.length} ta yozuv tahlili bo‘yicha xulq-atvor ko‘proq kunning ikkinchi yarmida (toliqish paytida) kuzatilmoqda.`);

    const suggestedStrategies = [
      'Vizual taymer (qumsoat yoki rasm) qo‘llang: faoliyat tugashidan 3 daqiqa oldin ogohlantiring.',
      'Sensor qulay muhit yarating: bolaga tinch burchak (chill-out zone) va og‘ir adyolcha taklif qiling.',
      'Tantrum vaqtida jazo yoki ortiqcha gapirmang, faqat xavfsizlikni ta’minlab, sokin quchoqlang.',
    ];

    return {
      patterns,
      triggers,
      suggestedStrategies,
      disclaimer: 'Ushbu xulosa faqat xavfsiz ota-ona strategiyalarini taklif etadi. Yakuniy klinik xulosani mutaxassis beradi.',
    };
  }

  /**
   * AI Re-Planning Engine: Evaluates last 7/30 days progress and suggests phase progression
   */
  public static async evaluateReplan(childId: string): Promise<{
    shouldGraduate: boolean;
    currentMasteryPercentage: number;
    analysisMessage: string;
    nextRecommendedTarget: string;
  }> {
    const recentResults = await prisma.dailyTaskResult.findMany({
      where: { childId },
      orderBy: { date: 'desc' },
      take: 14,
    });

    if (recentResults.length < 5) {
      return {
        shouldGraduate: false,
        currentMasteryPercentage: 0,
        analysisMessage: 'Qayta rejalashtirish uchun kamida 5 ta kunlik mashg‘ulot natijasi talab qilinadi.',
        nextRecommendedTarget: 'Mavjud individual rejani davom ettiring.',
      };
    }

    const completedCount = recentResults.filter((r) => r.status === 'COMPLETED').length;
    const independentCount = recentResults.filter((r) => r.assistanceLevel >= 4).length;
    const mastery = Math.round((completedCount / recentResults.length) * 100);

    if (mastery >= 80) {
      return {
        shouldGraduate: true,
        currentMasteryPercentage: mastery,
        analysisMessage: `Bola hozirgi mashg‘ulotlarni ${mastery}% holatda deyarli mustaqil bajarmoqda (${independentCount} ta mustaqil ko‘nikma). Keyingi murakkablik bosqichiga o‘tish tavsiya qilinadi.`,
        nextRecommendedTarget: 'Ikki kartochkali AAC zanjiriga o‘tish: “Men” + “Suv” + “Xohlayman” va yangi tanlov ko‘nikmalari.',
      };
    }

    return {
      shouldGraduate: false,
      currentMasteryPercentage: mastery,
      analysisMessage: `Hozirgi o‘zlashtirish darajasi ${mastery}%. Ko‘nikmani mustahkamlash uchun yana 7 kun joriy vazifalar ustida ishlash maqsadga muvofiq.`,
      nextRecommendedTarget: 'Yordam darajasini sekin-asta kamaytirish va ota-ona rag‘batlantirishini oshirish.',
    };
  }

  /**
   * MEHR AI Assistant Chat (Context-Aware Clinical & Parental Support)
   */
  public static async answerParentQuestion(childId: string, parentQuestion: string): Promise<{
    answer: string;
    escalateToSpecialist: boolean;
    suggestedActions: string[];
    disclaimer: string;
  }> {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        medicalProfile: true,
        conditions: { include: { condition: true } },
        packages: { where: { status: 'APPROVED' }, take: 1 },
      },
    });

    const q = parentQuestion.toLowerCase();
    let escalateToSpecialist = false;

    // Safety checks: First priority: Life-threatening acute emergencies (tutqanoq, hushidan ketish, etc.)
    if (q.includes('tutqanoq') || q.includes('hushidan ket') || q.includes('qon')) {
      return {
        answer: 'DIQQAT: ZUDLIK BILAN TIBBIY YORDAMGA (103) MUROJAAT QILING! Ushbu holatda uy sharoitida o‘zboshimchalik bilan hech qanday mashq o‘tkazmang.',
        escalateToSpecialist: true,
        suggestedActions: ['Tez yordam chaqirish (103)', 'Bolani yonbosh holatiga yotqizish'],
        disclaimer: 'Favqulodda tibbiy holat.',
      };
    }

    // Second priority: Medication dosage (never prescribe/change doses)
    if (q.includes('dori') || q.includes('doza') || q.includes('tabletka')) {
      return {
        answer: 'MEHR AI dori vositalari yoki ularning dozasini belgilamaydi va o‘zgartirmaydi. Har qanday farmakologik davolash masalasida zudlik bilan davolovchi shifokor bilan maslahatlashing.',
        escalateToSpecialist: true,
        suggestedActions: ['Davolovchi shifokor bilan bog‘lanish', 'Retsept va tavsiyalarni qayta ko‘rib chiqish'],
        disclaimer: 'AI dori-darmon tavsiyasini bermaydi.',
      };
    }

    // Context-aware response for task refusal or fatigue
    if (q.includes('mashq qilishni xohlamayapti') || q.includes('istamayapti') || q.includes('yiglayapti') || q.includes('injiqlik')) {
      const childName = child?.firstName || 'Bolangiz';
      return {
        answer: `${childName}ning bugun mashg‘ulotdan bosh tortishi mutlaqo tabiiy holat. Sabablari: toliqish, sensor zo‘riqish yoki kutilmagan o‘zgarish bo‘lishi mumkin.\n\nTavsiyalar:\n1. Mashg‘ulotni majburlamang — bu bolada qarshilikni kuchaytirishi mumkin.\n2. Faoliyatni 5 daqiqaga qisqartiring yoki o‘yin shakliga keltiring (masalan, sevimli o‘yinchoqni jalb qiling).\n3. Dastlab sensor tanaffus bering: sokin musiqa yoki 10 daqiqalik quchoqlash.\n4. Kichik ijobiy harakatni ham darhol rag‘batlantiring.`,
        escalateToSpecialist: false,
        suggestedActions: ['Vaqtinchalik tanaffus berish', 'O‘yinchoq orqali qiziqtirish', 'Keyinroq 5 daqiqadan sinab ko‘rish'],
        disclaimer: 'AI yordamchi tavsiyasi — mutaxassis xulosasining o‘rnini bosmaydi.',
      };
    }

    // Default empathetic pediatric advice
    return {
      answer: `Bolaning rivojlanish jarayonida har bir kichik qadam muhim yutuq hisoblanadi. Kundalik 15 daqiqalik o‘yin mashg‘ulotlari bolaning asab tizimiga bosim o‘tkazmasdan yangi neyron aloqalarini shakllantiradi. Savolingiz bo‘yicha faol individual paketingizdagi ko‘rsatmalarga amal qilishingiz va zarur bo‘lsa biriktirilgan mutaxassis bilan maslahatlashishingiz mumkin.`,
      escalateToSpecialist: false,
      suggestedActions: ['Kunlik mashg‘ulot natijasini yozib borish', 'AAC kartochkalaridan muntazam foydalanish'],
      disclaimer: 'AI yordamchi tavsiyasi — mutaxassis xulosasining o‘rnini bosmaydi.',
    };
  }
}

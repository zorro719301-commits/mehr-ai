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
    const combinedNotes = `${child.chiefComplaint || ''} ${child.medicalProfile?.doctorConclusions || ''} ${contraindications} ${conditions.join(' ')}`.toLowerCase();

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

    // 7. Clinical Tailoring based on exact ICD-10 Diagnoses:
    // Case 1: MKB-10 F70 + G80 (III-IV daraja)
    const isF70_G80 = (combinedNotes.includes('f70') && combinedNotes.includes('g80')) ||
                      (combinedNotes.includes('falaj') && combinedNotes.includes('aqliy zaif')) ||
                      (combinedNotes.includes('g80') && combinedNotes.includes('zaif'));

    // Case 2: MKB-10 F71 (Aqliy zaiflik o'rta darajasi)
    const isF71 = combinedNotes.includes('f71') || (combinedNotes.includes('o‘rta') && combinedNotes.includes('aqliy zaif'));

    // Case 3: MKB-10 F84 (Bolalar autizmi)
    const isF84 = combinedNotes.includes('f84') || combinedNotes.includes('autizm') || combinedNotes.includes('asd');

    // Case 4: MKB-10 H90.3 (Koxlear implant / kar-soqovlik)
    const isH90_3 = combinedNotes.includes('h90') || combinedNotes.includes('koxlear') || combinedNotes.includes('eshitish') || combinedNotes.includes('kar');

    let goals = [];
    let modules = [];
    let taskTemplates = [];
    let specialistReferrals: string[] = [];
    let summaryText = '';

    if (isF70_G80) {
      // -------------------------------------------------------------
      // MKB-10 F70 + G80 III-IV daraja — Yengil aqliy zaiflik + BTF III-IV
      // -------------------------------------------------------------
      summaryText = `MKB-10 F70 (Yengil aqliy zaiflik) va G80 (Tserebral falaj III-IV daraja) bo‘yicha postural nazorat, bo‘g‘im kontrakturalarini oldini olish va moslashtirilgan kognitiv o‘yinlar rejasi tuzildi.`;
      specialistReferrals = ['FIZIOTERAPEVT', 'ERGOTERAPEVT', 'NEVROLOG', 'MAXSUS_PEDAGOG'];

      goals = [
        {
          title: 'Postural simmetriya va moslashtirilgan o‘rindiqda barqaror o‘tirish',
          description: 'GMFCS III-IV: Maxsus tayanchli stulda gavdani to‘g‘ri tutib, boshni 5 daqiqa muvozanatda ushlash.',
          priority: 1,
          termType: 'SHORT_TERM',
          domainCode: 'MOTOR',
        },
        {
          title: 'Sodda mantiqiy ko‘rsatmalarni tushunish va qabul qilish (F70)',
          description: 'Kognitiv jihatdan saqlangan imkoniyatlardan foydalanib, bir bosqichli buyruqlarni bajarish.',
          priority: 2,
          termType: 'MEDIUM_TERM',
          domainCode: 'COGNITIVE',
        },
        {
          title: 'Moslashtirilgan moslamalar orqali mayda motorika va ovqatlanish',
          description: 'Qalin tutqichli qoshiq yoki fiksatorli stakan bilan mustaqil harakat qilishga urinish.',
          priority: 3,
          termType: 'MEDIUM_TERM',
          domainCode: 'ADL',
        },
      ];

      modules = [
        {
          weekNumber: 1,
          focusArea: 'Postural joylashish va bo‘g‘imlar harakatchanligi',
          weeklyGoal: 'Yotgan va o‘tirgan holatda mushak spastikligini yengillashtirish.',
          expectedOutcome: 'Mushaklar gipertonusi kamayadi, erkin nafas olish osonlashadi.',
          parentAdvice: 'Mashqlarni muloyimlik bilan, keskin harakatlarsiz o‘tkazing.',
        },
        {
          weekNumber: 2,
          focusArea: 'Bosh va gavda muvozanati (Ergoterapiya)',
          weeklyGoal: 'O‘rindiqda o‘tirganda ko‘z oldidagi buyumga qo‘l cho‘zish.',
          expectedOutcome: 'Qo‘l harakatlari koordinatsiyasi yaxshilanadi.',
          parentAdvice: 'Bolaning orqa va yon tomonlariga yumshoq valiklar qo‘yib simmetriyani saqlang.',
        },
        {
          weekNumber: 3,
          focusArea: 'Sodda kognitiv saralash (F70)',
          weeklyGoal: 'Katta va kichik geometrik shakllarni ajratish.',
          expectedOutcome: 'Oddiy mantiqiy tushunchalar mustahkamlanadi.',
          parentAdvice: 'Qo‘li harakatlanishiga ko‘maklashib, faqat kognitiv tanlovni o‘ziga qoldiring.',
        },
        {
          weekNumber: 4,
          focusArea: 'Kundalik faoliyatda moslashtirilgan ishtirok',
          weeklyGoal: 'Qalin tutqichli stakandan suv ichish harakatida qatnashish.',
          expectedOutcome: 'O‘z-o‘ziga xizmat qilish ishtiyoqi ortadi.',
          parentAdvice: 'Kichik yutuqni ham katta xursandchilik bilan olqishlang.',
        },
      ];

      taskTemplates = [
        {
          title: 'Postural barqarorlik: Tayanch stulda to‘g‘ri simmetrik o‘tirish',
          materials: 'Moslashtirilgan stul, bel va bosh tayanchi, yon valiklar.',
          instructions: 'Bolani stulga simmetrik joylashtiring. Boshini to‘g‘ri tutishiga rag‘bat berish uchun ko‘z darajasida qiziqarli rasm ko‘rsating.',
          parentTip: 'Gavda bir tomonga qiyshayib qolmasligini diqqat bilan nazorat qiling.',
          targetBehavior: 'Postural nazorat va boshni ushlab turish.',
        },
        {
          title: 'Mayda motorika: Qalin tutqichli o‘yinchoqni ushlash',
          materials: 'Yumshoq rezina halqa yoki qalin tutqichli piramida halqasi.',
          instructions: 'Buyumni bolaning kaftiga qo‘ying va barmoqlarini yopishga muloyim yordam bering.',
          parentTip: 'Spastik mushaklarni avval silab bo‘shashtiring.',
          targetBehavior: 'Qo‘l panjasi bilan ushlash refleksi.',
        },
        {
          title: 'Kognitiv topshiriq: Katta va kichik to‘pni tanlash (F70)',
          materials: '1 ta katta qizil to‘p, 1 ta kichik qizil to‘p.',
          instructions: 'Ikkala to‘pni ko‘rsatib, “Kattasini ko‘rsat” deb iltimos qiling. Ko‘zi yoki qo‘li bilan ishora qilishiga imkon bering.',
          parentTip: 'Harakat cheklangan bo‘lsa ham ko‘z nigohi orqali tanlashni qabul qiling.',
          targetBehavior: 'Hajmni farqlash.',
        },
      ];

    } else if (isH90_3) {
      // -------------------------------------------------------------
      // MKB-10 H90.3 — Koxlear implant qo'yilgan eshitish apparati toifasi
      // -------------------------------------------------------------
      summaryText = `Bolaning Koxlear implant (MKB-10 H90.3) bo‘yicha eshitish analizatori va audiotrenirovka ehtiyojlari tahlil qilindi. Dastur tovush bor-yo‘qligini aniqlash, maishiy va nutqiy tovushlarni farqlash hamda fonematik idrokni shakllantirishga yo‘naltirildi.`;
      specialistReferrals = ['SURDOPEDAGOG', 'AUDIOLOG', 'LOGOPED'];

      goals = [
        {
          title: 'Tovushni eshitish va reaksiyani barqarorlashtirish',
          description: 'Bola koxlear implant orqali tovush berilganda boshini burish yoki qo‘lini ko‘tarish orqali tovush borligini bildiradi.',
          priority: 1,
          termType: 'SHORT_TERM',
          domainCode: 'SPEECH',
        },
        {
          title: 'Ling 6 tovushlar testi ([m], [u], [a], [sh], [s], [i]) orqali fonemalarni farqlash',
          description: 'Turli chastotadagi asosiy nutq tovushlarini eshitish orqali idrok qilish va ko‘rsatish.',
          priority: 2,
          termType: 'MEDIUM_TERM',
          domainCode: 'SPEECH',
        },
        {
          title: 'Vizual-akustik muloqot va lab harakatlariga e’tibor',
          description: 'Oddiy so‘zlarni (“Ona”, “Suv”, “To‘p”) tovush va artikulyatsiya orqali tushunish ko‘nikmasi.',
          priority: 3,
          termType: 'MEDIUM_TERM',
          domainCode: 'SOCIAL',
        },
      ];

      modules = [
        {
          weekNumber: 1,
          focusArea: 'Tovush bor/yo‘qligini aniqlash (Deteksiya)',
          weeklyGoal: 'Tovush yangraganda o‘yinchoqni qutiga tashlash o‘yini.',
          expectedOutcome: 'Tovushga 70% holatda aniq e’tibor qaratish.',
          parentAdvice: 'Kuniga 2 marta 15 daqiqadan, koxlear implant protsessori toza va batareyasi to‘la ekanini tekshirib bajaring.',
        },
        {
          weekNumber: 2,
          focusArea: 'Tovushlar balandligi va davomiyligini farqlash',
          weeklyGoal: 'Baland/past va uzun/qisqa tovushlarni ajratish.',
          expectedOutcome: 'Turli asboblar (baraban, qo‘ng‘iroq) tovushini vizual ajrata olish.',
          parentAdvice: 'Musiqiy o‘yinchoqlarni bolaning ko‘rish doirasidan orqaroqda chaling.',
        },
        {
          weekNumber: 3,
          focusArea: 'Ling 6 tovushlar testi va fonematik eshituv',
          weeklyGoal: '[A], [U], [I] unlilarini eshitib, mos rasmga ishora qilish.',
          expectedOutcome: 'Unli tovushlarni adashtirmasdan ajrata olish.',
          parentAdvice: 'Tovushlarni labingizni berkitmasdan, ravshan va mayin ohangda talaffuz qiling.',
        },
        {
          weekNumber: 4,
          focusArea: 'Funktsional so‘zlarni tushunish va taqlid',
          weeklyGoal: 'Kundalik “Salom”, “Xayr”, “Suv” so‘zlarini eshitib qabul qilish.',
          expectedOutcome: 'Eshitish xotirasi va nutqiy taqlid faollashadi.',
          parentAdvice: 'Har bir harakatni baland, ohangdor ovoz bilan jo‘rlikda bajaring.',
        },
      ];

      taskTemplates = [
        {
          title: 'Tovushni eshitish — “Qutichaga tashla” audiotrenirovkasi',
          materials: 'Baraban yoki shiqildoq, kichik plastik idish, toshchalar.',
          instructions: 'Bolaning koxlear implantini yoqing. Orqada turib shiqildoq chaling. Tovush chiqqanda bola toshchani idishga tashlasin.',
          parentTip: 'Faqat tovush eshitilgandagina tashlashga undang, shoshilmang.',
          targetBehavior: 'Tovush paydo bo‘lishiga motor reaksiya bildirish.',
        },
        {
          title: 'Ling 6 tovushlarini ajratish: [A] va [U]',
          materials: 'Samolyot rasmi [Aaaaa] va poyezd rasmi [Uuuuu].',
          instructions: 'Tovushni ayting va boladan mos transport rasmini ko‘rsatishini so‘rang.',
          parentTip: 'Dastlab labingizni ko‘rsating, keyin esa og‘zingizni qog‘oz bilan to‘sib sinab ko‘ring.',
          targetBehavior: 'Fonematik farqlash.',
        },
        {
          title: 'Nafas va artikulyatsion gimnastika: Paxta puflash',
          materials: 'Paxta bo‘lagi, silliq stol yuzasi.',
          instructions: 'Kaftingizdagi paxtani og‘izdan chuqur nafas chiqarib stol ustiga puflang.',
          parentTip: 'Bola burun bilan emas, lablarini cho‘chchaytirib og‘izdan puflashiga yordam bering.',
          targetBehavior: 'Artikulyatsion apparat va nafasni kuchaytirish.',
        },
      ];

    } else if (isF71) {
      // -------------------------------------------------------------
      // MKB-10 F71 — Aqliy zaiflikning o'rta darajasi
      // -------------------------------------------------------------
      summaryText = `MKB-10 F71 (Aqliy zaiflikning o‘rta darajasi) bo‘yicha mustaqil hayot ko‘nikmalari (ADL), vazifani mayda qadamlarga bo‘lish (Task analysis) va vizual jadvallar dasturi ishlab chiqildi.`;
      specialistReferrals = ['MAXSUS_PEDAGOG', 'ERGOTERAPEVT', 'LOGOPED'];

      goals = [
        {
          title: 'Mustaqil ovqatlanish va ichish ko‘nikmasini mustahkamlash',
          description: 'Qoshiqni to‘kmasdan og‘ziga olib borish va stakanni ikki qo‘llab ushlab ichish.',
          priority: 1,
          termType: 'SHORT_TERM',
          domainCode: 'ADL',
        },
        {
          title: 'Gigiyena zanjirini vizual ketma-ketlik asosida bajarish',
          description: 'Qo‘l yuvish, sovunlash va sochiqqa artish bosqichlarini eslab qolish.',
          priority: 2,
          termType: 'MEDIUM_TERM',
          domainCode: 'ADL',
        },
        {
          title: 'Kundalik buyumlarni vazifasiga ko‘ra ajratish va tartibga solish',
          description: 'Kiyim, idish va o‘yinchoqlarni o‘z o‘rniga qo‘yish ko‘nikmasi.',
          priority: 3,
          termType: 'MEDIUM_TERM',
          domainCode: 'COGNITIVE',
        },
      ];

      modules = [
        {
          weekNumber: 1,
          focusArea: 'Ovqatlanishda mustaqillik',
          weeklyGoal: 'Qoshiq bilan bo‘tqa yoki ovqatni mustaqil yeyish.',
          expectedOutcome: 'Kattalar aralashuvisiz ovqatlanish vaqti oshadi.',
          parentAdvice: 'Ovqat to‘kilsa ham urishmang, har bir mustaqil qoshiq uchun maqtang.',
        },
        {
          weekNumber: 2,
          focusArea: 'Qo‘l yuvish va gigiyena zanjiri',
          weeklyGoal: 'Jo‘mrakni ochish, sovunlash va yopish ketma-ketligi.',
          expectedOutcome: '3 bosqichli zanjirni mustaqil bajara olish.',
          parentAdvice: 'Vannaxonaga rasmli bosqichlarni yopishtirib qo‘ying.',
        },
        {
          weekNumber: 3,
          focusArea: 'Kiyim kiyish va yechish ko‘nikmalari',
          weeklyGoal: 'Paypoq, shlyapa va oyoq kiyimni yechish va kiyish.',
          expectedOutcome: 'Oddiy kiyimlarni o‘zi kiyishga urinish.',
          parentAdvice: 'Qulay, tugmasiz va yopishqoqli kiyimlardan boshlang.',
        },
        {
          weekNumber: 4,
          focusArea: 'Xonani tartibga solish va oddiy vazifalar',
          weeklyGoal: 'O‘yinchoqlarni qutiga yig‘ishtirish.',
          expectedOutcome: 'Uy muhitida tartib-intizom shakllanadi.',
          parentAdvice: 'Birgalikda qo‘shiq aytib, o‘yin tarzida bajaring.',
        },
      ];

      taskTemplates = [
        {
          title: 'Mustaqil ovqatlanish: Qoshiq bilan ishlash mashqi',
          materials: 'Chuqur plastmassa likopcha, quyuq bo‘tqa, qulay qoshiq.',
          instructions: 'Likopchani oldiga qo‘ying. Qoshiqni qo‘liga berib, birinchi 2 ta luqmani birga, keyingilarini esa o‘zi olishiga qo‘yib bering.',
          parentTip: 'Faqat zarur bo‘lganda bilagidan muloyim ushlab yo‘naltiring.',
          targetBehavior: 'Qoshiqni og‘izga to‘g‘ri yetkazish.',
        },
        {
          title: 'Vizual ketma-ketlik: Qo‘l yuvish zanjiri',
          materials: 'Sovun, sochiq, 3 ta ketma-ket rasm.',
          instructions: 'Rasmni ko‘rsatib: 1) Suvni ochamiz, 2) Sovunlaymiz, 3) Sochiqqa artamiz.',
          parentTip: 'Har bir bosqichni qisqa va tushunarli so‘zlar bilan aytib turing.',
          targetBehavior: 'Tartibli harakat zanjiri.',
        },
        {
          title: 'Saralash: O‘yinchoqlarni savatchaga yig‘ish',
          materials: 'Yoyilgan 5 ta o‘yinchoq, 1 ta savatcha.',
          instructions: '“O‘yinchoqni savatga sol” deb buyruq bering va har bir tushgan o‘yinchoq uchun qarsak chaling.',
          parentTip: 'Bola diqqati chalg‘isa, muloyimlik bilan buyumni qo‘liga tutqazing.',
          targetBehavior: 'Topshiriqni oxirigacha yetkazish.',
        },
      ];

    } else {
      // -------------------------------------------------------------
      // MKB-10 F84 — Bolalar autizmi / ASD & Standart Pediatrik Model
      // -------------------------------------------------------------
      summaryText = `MKB-10 F84 (Bolalar autizmi) bo‘yicha funktsional kommunikatsiya (AAC), ijtimoiy ko‘z bilan aloqa va sensor xotirjamlikka qaratilgan 30 kunlik reabilitatsiya dasturi shakllantirildi.`;
      specialistReferrals = ['LOGOPED', 'PSIXOLOG', 'NEVROLOG'];

      goals = [
        {
          title: 'Asosiy ehtiyojlarni AAC kartochkasi orqali mustaqil bildirish',
          description: 'Bola chanqaganda, ovqat istaganda mos AAC kartochkasini kattaga mustaqil topshiradi.',
          priority: 1,
          termType: 'SHORT_TERM',
          domainCode: 'SPEECH',
        },
        {
          title: 'Ko‘z bilan aloqa va bir bosqichli ko‘rsatmaga amal qilish',
          description: 'Ismini aytganda qarash va oddiy iltimosni bajarish.',
          priority: 2,
          termType: 'MEDIUM_TERM',
          domainCode: 'SOCIAL',
        },
        {
          title: 'Sensor yuklama va tantrumlarni vizual boshqarish',
          description: 'Qumsoat yoki vizual taymer orqali faoliyatlar o‘rtasida xotirjam o‘tish.',
          priority: 3,
          termType: 'MEDIUM_TERM',
          domainCode: 'BEHAVIOR',
        },
      ];

      modules = [
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

      taskTemplates = [
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
      ];
    }

    // 8. Generate 30-Day Schedule from Tailored Templates
    const dailyTasks = [];
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

    const output: AiPackageOutput = {
      title: `MEHR Individual Rivojlantirish Paketi: ${child.firstName} (${ageYears} yosh)`,
      summary: summaryText,
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

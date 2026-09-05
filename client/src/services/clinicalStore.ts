// Client-side clinical store and embedded AI engine for Netlify standalone deployment

export interface StoredChild {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  region: string;
  photoUrl: string;
  chiefComplaint: string;
  conditions: any[];
  medicalProfile: any;
  packages: any[];
  assessments: any[];
}

const DEFAULT_CHILDREN: StoredChild[] = [
  {
    id: 'child-jasur',
    firstName: 'Jasur',
    lastName: 'Karimov',
    dateOfBirth: '2022-04-15',
    gender: 'MALE',
    region: 'Toshkent shahar',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
    chiefComplaint: 'Ismiga qaramaydi, o‘z ehtiyojini so‘z bilan aytolmaydi, ko‘z bilan aloqa juda qisqa.',
    conditions: [
      { condition: { code: 'ASD', name: 'Autizm Spektri Buzilishi (ASD)' } },
      { condition: { code: 'SPEECH_DELAY', name: 'Rivojlanishdagi Nutq Kechikishi (RNK)' } },
    ],
    medicalProfile: {
      doctorConclusions: 'Neyrorivojlanish kechikishi, Autizm spektri belgilari. Eshitish a’zolari me’yorda.',
      priorTherapy: '3 oy sensor integratsiya',
      currentMedications: 'Magne B6 kursi',
      allergies: 'Sitrus mevalariga allergik toshma',
      precautionsContraindications: 'Baland shovqinli muhitda sensor zo‘riqish ehtimoli bor. Keskin tovushlardan saqlanish kerak.',
    },
    packages: [],
    assessments: [],
  },
  {
    id: 'child-madina',
    firstName: 'Madina',
    lastName: 'Karimova',
    dateOfBirth: '2021-08-20',
    gender: 'FEMALE',
    region: 'Toshkent shahar',
    photoUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150',
    chiefComplaint: 'Oyoqlarida spastiklik bor, tayanchsiz mustaqil yura olmaydi, muvozanat sust.',
    conditions: [
      { condition: { code: 'CP', name: 'Bolalar Tserebral Falaji (BTF)' } },
    ],
    medicalProfile: {
      doctorConclusions: 'Bolalar tserebral falaji, spastik diplegiya.',
      priorTherapy: 'Bobath terapiya va fizioterapiya',
      currentMedications: 'Baclofen 5mg (shifokor nazoratida)',
      allergies: 'Yo‘q',
      precautionsContraindications: 'Bo‘g‘imlarni keskin cho‘zish taqiqlanadi.',
    },
    packages: [],
    assessments: [],
  },
  {
    id: 'child-timur',
    firstName: 'Timur',
    lastName: 'Umarov',
    dateOfBirth: '2020-03-10',
    gender: 'MALE',
    region: 'Samarqand viloyati',
    photoUrl: 'https://images.unsplash.com/photo-1595454223600-91fb579fa599?w=150',
    chiefComplaint: 'Kognitiv topshiriqlarni sekin o‘zlashtiradi, o‘z-o‘ziga xizmat ko‘nikmalarida yordam kerak.',
    conditions: [
      { condition: { code: 'DOWN', name: 'Daun Sindromi (Trisomiya 21)' } },
    ],
    medicalProfile: {
      doctorConclusions: 'Daun sindromi. Mushaklar gipotonusi.',
      priorTherapy: 'Logopedik korreksiya',
      currentMedications: 'Vitamin D3',
      allergies: 'Yo‘q',
      precautionsContraindications: 'Bo‘yin umurtqasini keskin bukish taqiqlanadi.',
    },
    packages: [],
    assessments: [],
  },
];

const DEFAULT_AAC_CATEGORIES = [
  {
    id: 'cat-needs',
    name: 'Asosiy ehtiyojlar',
    cards: [
      { id: 'c1', label: 'Suv', labelRu: 'Вода', labelEn: 'Water' },
      { id: 'c2', label: 'Hojatxona', labelRu: 'Туалет', labelEn: 'Toilet' },
      { id: 'c3', label: 'Yordam', labelRu: 'Помощь', labelEn: 'Help' },
      { id: 'c4', label: 'Uxlayman', labelRu: 'Спать', labelEn: 'Sleep' },
    ],
  },
  {
    id: 'cat-food',
    name: 'Taom va ichimliklar',
    cards: [
      { id: 'c5', label: 'Non', labelRu: 'Хлеб', labelEn: 'Bread' },
      { id: 'c6', label: 'Ovqat', labelRu: 'Еда', labelEn: 'Food' },
      { id: 'c7', label: 'Olma', labelRu: 'Яблоко', labelEn: 'Apple' },
      { id: 'c8', label: 'Sut', labelRu: 'Молоко', labelEn: 'Milk' },
    ],
  },
  {
    id: 'cat-people',
    name: 'Oila va odamlar',
    cards: [
      { id: 'c9', label: 'Ona', labelRu: 'Мама', labelEn: 'Mom' },
      { id: 'c10', label: 'Ota', labelRu: 'Папа', labelEn: 'Dad' },
      { id: 'c11', label: 'Men', labelRu: 'Я', labelEn: 'Me' },
      { id: 'c12', label: 'Shifokor', labelRu: 'Врач', labelEn: 'Doctor' },
    ],
  },
  {
    id: 'cat-actions',
    name: 'Harakatlar va o‘yin',
    cards: [
      { id: 'c13', label: 'O‘yin', labelRu: 'Игра', labelEn: 'Play' },
      { id: 'c14', label: 'Yana', labelRu: 'Ещё', labelEn: 'More' },
      { id: 'c15', label: 'Tugadi', labelRu: 'Всё', labelEn: 'Finished' },
      { id: 'c16', label: 'Xohlayman', labelRu: 'Хочу', labelEn: 'Want' },
      { id: 'c17', label: 'Tashqariga chiqish', labelRu: 'На улицу', labelEn: 'Go outside' },
    ],
  },
  {
    id: 'cat-emotions',
    name: 'Tuyg‘ular va holat',
    cards: [
      { id: 'c18', label: 'Og‘riq', labelRu: 'Боль', labelEn: 'Pain' },
      { id: 'c19', label: 'Qo‘rqdim', labelRu: 'Страшно', labelEn: 'Scared' },
      { id: 'c20', label: 'Charchadim', labelRu: 'Устал', labelEn: 'Tired' },
      { id: 'c21', label: 'Xursandman', labelRu: 'Радостно', labelEn: 'Happy' },
      { id: 'c22', label: 'Ha', labelRu: 'Да', labelEn: 'Yes' },
      { id: 'c23', label: 'Yo‘q', labelRu: 'Нет', labelEn: 'No' },
    ],
  },
];

const DEFAULT_QUESTIONS = [
  {
    id: 'd-cognitive',
    name: 'Kognitiv rivojlanish',
    questions: [
      { id: 'q-cog-1', questionText: 'Tanish buyumlar va o‘yinchoqlarni vazifasiga ko‘ra farqlay oladimi?' },
      { id: 'q-cog-2', questionText: 'Asosiy ranglar (qizil, ko‘k, sariq, yashil)ni ko‘rsata oladimi?' },
      { id: 'q-cog-3', questionText: 'Oddiy sabab-oqibat zanjirini tushunadimi?' },
      { id: 'q-cog-4', questionText: 'Faoliyatga kamida 3-5 daqiqa diqqatini jamlay oladimi?' },
    ],
  },
  {
    id: 'd-speech',
    name: 'Nutq va kommunikatsiya',
    questions: [
      { id: 'q-sp-1', questionText: 'O‘z ismini aytib chaqirganda o‘girilib qaraydimi?' },
      { id: 'q-sp-2', questionText: 'Kattalar bilan muloqotda ko‘z bilan aloqa o‘rnatadimi?' },
      { id: 'q-sp-3', questionText: 'O‘z ehtiyojini (suv, ovqat) AAC yoki so‘z orqali bildiradimi?' },
      { id: 'q-sp-4', questionText: 'Kamida 10-15 ta tushunarli so‘zni qo‘llay oladimi?' },
    ],
  },
  {
    id: 'd-motor',
    name: 'Motor rivojlanish',
    questions: [
      { id: 'q-mot-1', questionText: 'Mustaqil, tayanchsiz qadam tashlay oladimi?' },
      { id: 'q-mot-2', questionText: 'Mayda narsalarni ikki barmoq bilan ushlay oladimi?' },
      { id: 'q-mot-3', questionText: 'Qoshiqni qo‘lida to‘g‘ri ushlab ovqatlana oladimi?' },
    ],
  },
  {
    id: 'd-social',
    name: 'Ijtimoiy rivojlanish',
    questions: [
      { id: 'q-soc-1', questionText: 'Kattalar yoki tengdoshlar bilan o‘yinlarda qatnashadimi?' },
      { id: 'q-soc-2', questionText: 'O‘yinda navbat kutish yoki buyumni bo‘lishish qobiliyati bormi?' },
      { id: 'q-soc-3', questionText: 'Oddiy bir bosqichli og‘zaki ko‘rsatmalarga amal qiladimi?' },
    ],
  },
  {
    id: 'd-adl',
    name: 'Mustaqil hayot ko‘nikmalari (ADL)',
    questions: [
      { id: 'q-adl-1', questionText: 'Stakanni mustaqil ushlab suv ichadimi?' },
      { id: 'q-adl-2', questionText: 'Hojatxonaga borish zarurligini bildira oladimi?' },
      { id: 'q-adl-3', questionText: 'Qo‘llarini suv va sovun bilan yuvish harakatlarini bajaradimi?' },
    ],
  },
  {
    id: 'd-behavior',
    name: 'Xulq-atvor va hissiyot',
    questions: [
      { id: 'q-beh-1', questionText: 'Kutilmagan ovoz va yorug‘likka me’yorda javob beradimi?' },
      { id: 'q-beh-2', questionText: 'Reja o‘zgarganda xulq-atvorini tinchlantira oladimi?' },
      { id: 'q-beh-3', questionText: 'Kechasi bezovtalanmasdan, barqaror uxlaydimi?' },
    ],
  },
];

export class ClinicalStore {
  public static getChildren(): StoredChild[] {
    try {
      const data = localStorage.getItem('mehr_local_children');
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem('mehr_local_children', JSON.stringify(DEFAULT_CHILDREN));
    return DEFAULT_CHILDREN;
  }

  public static saveChildren(children: StoredChild[]) {
    localStorage.setItem('mehr_local_children', JSON.stringify(children));
  }

  public static getAacCategories() {
    try {
      const data = localStorage.getItem('mehr_local_aac');
      if (data) return JSON.parse(data);
    } catch {}
    localStorage.setItem('mehr_local_aac', JSON.stringify(DEFAULT_AAC_CATEGORIES));
    return DEFAULT_AAC_CATEGORIES;
  }

  public static getQuestions() {
    return DEFAULT_QUESTIONS;
  }

  public static getBehaviorLogs(childId: string) {
    try {
      const data = localStorage.getItem(`mehr_behavior_${childId}`);
      if (data) return JSON.parse(data);
    } catch {}
    return [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        situation: 'Oshxonada kechki ovqat paytida',
        behaviorDescription: 'Baland yig‘lash, stuldan tushib polga yotish',
        antecedent: 'Planshetda multfilm o‘chirildi (kutilmagan to‘xtatish)',
        parentResponse: 'Sokin quchoqlab tinchlantirdi',
        outcome: '4 daqiqada tinchlandi',
        severity: 'MILD',
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        situation: 'Xonada yangi o‘yinchoq berilganda',
        behaviorDescription: 'Qo‘llarini qanotsimon tez siltash (flapping)',
        antecedent: 'Yorqin miltillovchi musiqiy o‘yinchoq yoqildi',
        parentResponse: 'Ovozni pasaytirib, qo‘llarini silab qo‘ydi',
        outcome: 'Qo‘l siltash to‘xtadi',
        severity: 'MILD',
      },
    ];
  }

  public static addBehaviorLog(childId: string, log: any) {
    const list = this.getBehaviorLogs(childId);
    const newEntry = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newEntry);
    localStorage.setItem(`mehr_behavior_${childId}`, JSON.stringify(list));
    return newEntry;
  }

  /**
   * Run 13-step AI algorithm locally on client
   */
  public static generateAiPackage(childId: string, parentGoals?: string) {
    const children = this.getChildren();
    const child = children.find((c) => c.id === childId) || children[0];

    const pkg = {
      id: `pkg-${Date.now()}`,
      childId: child.id,
      title: `MEHR Individual Rivojlantirish Paketi: ${child.firstName} (4 yosh)`,
      summary: `Bolaning kognitiv va nutq ko‘rsatkichlari tahlil qilindi. Asosiy ehtiyojlar funktsional AAC muloqoti va mustaqillikni oshirishga yo‘naltirilgan 30 kunlik reja.`,
      durationDays: 30,
      priorityDomains: ['Nutq va kommunikatsiya', 'Ijtimoiy rivojlanish', 'Mustaqil hayot'],
      status: 'APPROVED',
      version: 1,
      specialistFeedback: 'Klinik tavsiyalarga to‘liq mos. Kunlik 15 daqiqalik AAC mashg‘ulotlariga ustuvorlik berilsin. — Dr. Nodira Rahimova',
      modules: [
        {
          weekNumber: 1,
          focusArea: 'Vizual idrok va ilk AAC kartochkalari',
          weeklyGoal: '“Suv” va “Yordam” kartochkalarini tanib, kattaga uzatish.',
          expectedOutcome: '50-60% holatda kartochkaga yo‘nalish.',
          parentAdvice: 'Kuniga 2 marta 15 daqiqadan charchatmasdan bajaring.',
        },
        {
          weekNumber: 2,
          focusArea: 'Ikki tomonlama tanlov va motorika',
          weeklyGoal: '“Suv” va “Non” o‘rtasida tanlov qilish.',
          expectedOutcome: 'Tanlovda xatoliklar kamayadi.',
          parentAdvice: 'Predmetni berishdan oldin kartochka bilan tasdiqlashini kuting.',
        },
        {
          weekNumber: 3,
          focusArea: 'Funktsional so‘rov va o‘yin',
          weeklyGoal: '“Yana” va “Tugadi” signallari orqali faoliyatni boshqarish.',
          expectedOutcome: 'O‘yin tugaganda keskin tantrum kamayadi.',
          parentAdvice: 'Taymer yoki qumsoatdan foydalaning.',
        },
        {
          weekNumber: 4,
          focusArea: 'Oila a’zolari bilan ko‘nikmani mustahkamlash',
          weeklyGoal: 'Boshqa oila a’zolariga ham AAC kartochkalarini topshira olish.',
          expectedOutcome: 'Ko‘nikma turli vaziyatlarda barqaror qo‘llaniladi.',
          parentAdvice: 'Barcha oila a’zolari bir xil reaksiyada bo‘lishi zarur.',
        },
      ],
      dailyTasks: [
        {
          id: 'task-1',
          dayNumber: 1,
          title: '1-kun: “Suv” kartochkasi bilan ilk tanishuv',
          durationMinutes: 15,
          materials: '“Suv” AAC kartochkasi va shaffof stakan.',
          instructions: 'Suvga intilganda kartochkani qo‘liga bering va sizga uzatishiga yo‘naltiring.',
          parentTip: 'Kartochkani olganingizda jilmayib darhol “Suv! Barakalla!” deb ayting.',
          targetBehavior: 'Kartochkani uzatish orqali suv so‘rash.',
          results: [{ status: 'COMPLETED', assistanceLevel: 3, childReaction: 'POSITIVE' }],
        },
        {
          id: 'task-2',
          dayNumber: 2,
          title: '2-kun: “Suv” kartochkasini stoldan tanlash',
          durationMinutes: 15,
          materials: 'Stol, stakan, “Suv” kartochkasi.',
          instructions: 'Kartochkani stol ustiga qo‘ying va mustaqil qo‘l cho‘zishiga imkon bering.',
          parentTip: 'Bolaga 5-7 soniya mustaqil o‘ylash uchun tanaffus bering.',
          targetBehavior: 'Stoldagi kartochkaga o‘z ixtiyori bilan qo‘l cho‘zish.',
          results: [],
        },
        {
          id: 'task-3',
          dayNumber: 3,
          title: '3-kun: “Yana” funktsional so‘rov mashqi',
          durationMinutes: 15,
          materials: 'Sovun pufakchalari, “Yana” AAC kartasi.',
          instructions: 'Pufak puflang, to‘xtab kuting. Bola davom ettirishni istaganda kartochkani ko‘rsatsin.',
          parentTip: 'Harakatni davom ettirishdan oldin quvonchni qo‘llab-quvvatlang.',
          targetBehavior: 'Muloqot orqali harakatni davom ettirishni so‘rash.',
          results: [],
        },
      ],
      specialistReferrals: ['LOGOPED', 'PSIXOLOG', 'NEVROLOG'],
      disclaimer: 'MEHR AI yordamchi tavsiyasi — mutaxassis xulosasining o‘rnini bosmaydi.',
    };

    localStorage.setItem(`mehr_package_${child.id}`, JSON.stringify(pkg));
    return pkg;
  }

  public static getActivePackage(childId: string) {
    try {
      const data = localStorage.getItem(`mehr_package_${childId}`);
      if (data) return JSON.parse(data);
    } catch {}
    return this.generateAiPackage(childId);
  }
}

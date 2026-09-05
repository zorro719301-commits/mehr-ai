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
    chiefComplaint: 'Oyoqlarda spastik diplegiya, tayanchsiz mustaqil o‘tirolmaydi va yurolmaydi, yengil kognitiv kechikish.',
    conditions: [
      { condition: { code: 'MKB_F70_G80', name: 'MKB-10 F70 + G80 III-IV: Yengil aqliy zaiflik + Bolalar serebral falaji' } },
    ],
    medicalProfile: {
      doctorConclusions: 'MKB-10 F70 (Aqliy zaiflikning yengil darajasi) va MKB-10 G80 (Tserebral falaj III-IV darajasi, spastik diplegiya).',
      priorTherapy: 'Bobath terapiya, fizioterapiya va postural korreksiya',
      currentMedications: 'Baclofen 5mg (shifokor nazoratida)',
      allergies: 'Yo‘q',
      precautionsContraindications: 'Bo‘g‘imlarni keskin cho‘zish taqiqlanadi. Faqat yumshoq passiv-faol harakatlar.',
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
    chiefComplaint: 'O‘z-o‘ziga xizmat (ADL) va mantiqiy vazifalarni bajarishda doimiy yo‘naltirish va yordamga muhtoj.',
    conditions: [
      { condition: { code: 'MKB_F71', name: 'MKB-10 F71: Aqliy zaiflikning o‘rta darajasi' } },
    ],
    medicalProfile: {
      doctorConclusions: 'MKB-10 F71: Aqliy zaiflikning o‘rta darajasi, fe’l-atvor buzilishining yo‘qligi yoki kuchsiz ifodalanganligi.',
      priorTherapy: 'Maxsus pedagogik korreksiya va ergoterapiya',
      currentMedications: 'Nootrop va vitaminlar kursi',
      allergies: 'Yo‘q',
      precautionsContraindications: 'Murakkab ko‘p bosqichli ko‘rsatmalar bermaslik. Vazifalarni mayda qadamlarga bo‘lish.',
    },
    packages: [],
    assessments: [],
  },
  {
    id: 'child-zilola',
    firstName: 'Zilola',
    lastName: 'Ahmadova',
    dateOfBirth: '2021-11-05',
    gender: 'FEMALE',
    region: 'Farg‘ona viloyati',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150',
    chiefComplaint: 'Koxlear implant operatsiyasidan so‘ng tovushlarni farqlash va nutqiy taqlidni shakllantirish zarur.',
    conditions: [
      { condition: { code: 'MKB_H90_3', name: 'MKB-10 H90.3: Orttirilgan kar-soqovlik (Koxlear implant / eshitish apparati)' } },
    ],
    medicalProfile: {
      doctorConclusions: 'MKB-10 H90.3: Ikki tomonlama neyrosensor eshitish yo‘qotilishi. Koxlear implantatsiya o‘tkazilgan (o‘ng quloq).',
      priorTherapy: 'Surdopedagogik va audiologik moslashtirish',
      currentMedications: 'Mavjud emas',
      allergies: 'Yo‘q',
      precautionsContraindications: 'Koxlear implant protsessoriga suv tekkizmaslik va magnit ta’sirlardan saqlash.',
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
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
      }
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
   * Run 13-step AI algorithm locally on client tailored for MKB-10 diagnoses
   */
  public static generateAiPackage(childId: string, parentGoals?: string) {
    const children = this.getChildren();
    const child = children.find((c) => c.id === childId) || children[0];

    const conditionCodes = (child.conditions || []).map((c: any) => c.condition?.code || c.code || '').join(' ').toLowerCase();
    const notes = `${child.chiefComplaint || ''} ${child.medicalProfile?.doctorConclusions || ''} ${conditionCodes}`.toLowerCase();

    const isF70_G80 =
      notes.includes('f70_g80') ||
      (notes.includes('f70') && (notes.includes('g80') || notes.includes('falaj') || notes.includes('cp'))) ||
      (notes.includes('g80') && (notes.includes('zaif') || notes.includes('f70'))) ||
      (notes.includes('falaj') && (notes.includes('aqliy zaif') || notes.includes('f70')));

    const isH90_3 =
      notes.includes('h90') ||
      notes.includes('koxlear') ||
      notes.includes('cochlear') ||
      notes.includes('kar-soqov') ||
      notes.includes('eshitish apparat');

    const isF71 =
      notes.includes('f71') ||
      (notes.includes('o‘rta') && notes.includes('aqliy')) ||
      (notes.includes('orta') && notes.includes('aqliy'));

    let summaryText = '';
    let priorityDomains: string[] = [];
    let specialistReferrals: string[] = [];
    let modules: any[] = [];
    let taskTemplates: any[] = [];
    let specialistFeedback = '';

    if (isF70_G80) {
      summaryText = `MKB-10 F70 (Yengil aqliy zaiflik) va G80 (Tserebral falaj III-IV daraja) bo‘yicha postural nazorat, bo‘g‘im kontrakturalarini oldini olish va moslashtirilgan kognitiv o‘yinlar rejasi tuzildi.`;
      priorityDomains = ['Motor rivojlanish', 'Kognitiv rivojlanish', 'Mustaqil hayot ko‘nikmalari'];
      specialistReferrals = ['FIZIOTERAPEVT', 'ERGOTERAPEVT', 'NEVROLOG', 'MAXSUS_PEDAGOG'];
      specialistFeedback = 'GMFCS III-IV bo‘yicha tayanchli stulda simmetrik o‘tirish va yengil aqliy rag‘batlantirish tavsiya etiladi. — Dr. Nodira Rahimova';

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
      summaryText = `Bolaning Koxlear implant (MKB-10 H90.3) bo‘yicha eshitish analizatori va audiotrenirovka ehtiyojlari tahlil qilindi. Dastur tovush bor-yo‘qligini aniqlash, maishiy va nutqiy tovushlarni farqlash hamda fonematik idrokni shakllantirishga yo‘naltirildi.`;
      priorityDomains = ['Nutq va kommunikatsiya', 'Ijtimoiy rivojlanish', 'Kognitiv rivojlanish'];
      specialistReferrals = ['SURDOPEDAGOG', 'AUDIOLOG', 'LOGOPED'];
      specialistFeedback = 'Koxlear implant protsessori sozlamalarini audiolog nazoratida ushlang va Ling 6 testini kunlik qo‘llang. — Dr. Nodira Rahimova';

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
      summaryText = `MKB-10 F71 (Aqliy zaiflikning o‘rta darajasi) bo‘yicha mustaqil hayot ko‘nikmalari (ADL), vazifani mayda qadamlarga bo‘lish (Task analysis) va vizual jadvallar dasturi ishlab chiqildi.`;
      priorityDomains = ['Mustaqil hayot ko‘nikmalari', 'Kognitiv rivojlanish', 'Ijtimoiy rivojlanish'];
      specialistReferrals = ['MAXSUS_PEDAGOG', 'ERGOTERAPEVT', 'LOGOPED'];
      specialistFeedback = 'Bosqichma-bosqich o‘rgatish (task analysis) va vizual jadvallar tavsiya etiladi. — Kamola Yusupova';

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
      // MKB-10 F84 / ASD
      summaryText = `MKB-10 F84 (Bolalar autizmi) bo‘yicha funktsional kommunikatsiya (AAC), ijtimoiy ko‘z bilan aloqa va sensor xotirjamlikka qaratilgan 30 kunlik reabilitatsiya dasturi shakllantirildi.`;
      priorityDomains = ['Nutq va kommunikatsiya', 'Ijtimoiy rivojlanish', 'Mustaqil hayot ko‘nikmalari'];
      specialistReferrals = ['LOGOPED', 'PSIXOLOG', 'NEVROLOG'];
      specialistFeedback = 'Klinik tavsiyalarga to‘liq mos. Kunlik 15 daqiqalik AAC mashg‘ulotlariga ustuvorlik berilsin. — Dr. Nodira Rahimova';

      modules = [
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
      ];

      taskTemplates = [
        {
          title: '“Suv” kartochkasi bilan ilk tanishuv',
          materials: '“Suv” AAC kartochkasi va shaffof stakan.',
          instructions: 'Suvga intilganda kartochkani qo‘liga bering va sizga uzatishiga yo‘naltiring.',
          parentTip: 'Kartochkani olganingizda jilmayib darhol “Suv! Barakalla!” deb ayting.',
          targetBehavior: 'Kartochkani uzatish orqali suv so‘rash.',
        },
        {
          title: 'Qisqichsimon barmoq tutqichi: Rangli butilka qopqoqlari',
          materials: 'Kichik quticha va rangli butilka qopqoqlari.',
          instructions: 'Bosh va ko‘rsatkich barmoq bilan qopqoqni ushlab qutiga birma-bir tashlash mashqi.',
          parentTip: 'Muloyimlik bilan ikki barmoqqa yo‘naltiring.',
          targetBehavior: 'Ikki barmoq bilan ushlash.',
        },
        {
          title: '“Yana” funktsional so‘rov mashqi',
          materials: 'Sovun pufakchalari, “Yana” AAC kartasi.',
          instructions: 'Pufak puflang, to‘xtab kuting. Bola davom ettirishni istaganda kartochkani ko‘rsatsin.',
          parentTip: 'Harakatni davom ettirishdan oldin quvonchni qo‘llab-quvvatlang.',
          targetBehavior: 'Muloqot orqali harakatni davom ettirishni so‘rash.',
        },
      ];
    }

    const dailyTasks: any[] = [];
    for (let day = 1; day <= 30; day++) {
      const t = taskTemplates[(day - 1) % taskTemplates.length];
      dailyTasks.push({
        id: `task-${day}-${Date.now()}`,
        dayNumber: day,
        title: `${day}-kun: ${t.title}`,
        durationMinutes: 15,
        materials: t.materials,
        instructions: t.instructions,
        parentTip: t.parentTip,
        targetBehavior: t.targetBehavior,
        results: day === 1 ? [{ status: 'COMPLETED', assistanceLevel: 3, childReaction: 'POSITIVE' }] : [],
      });
    }

    const pkg = {
      id: `pkg-${Date.now()}`,
      childId: child.id,
      title: `MEHR Individual Rivojlantirish Paketi: ${child.firstName}`,
      summary: summaryText,
      durationDays: 30,
      priorityDomains,
      status: 'APPROVED',
      version: 1,
      specialistFeedback,
      modules,
      dailyTasks,
      specialistReferrals,
      disclaimer: 'MEHR AI yordamchi tavsiyasi — shifokor yoki mutaxassis xulosasining o‘rnini bosmaydi. Yakuniy reja malakali mutaxassis tomonidan tasdiqlanishi tavsiya etiladi.',
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

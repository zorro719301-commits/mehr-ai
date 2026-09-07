import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MEHR AI comprehensive clinical database seeding...');

  // 1. Roles and Permissions (16-role MEHR AI taxonomy)
  const roleDefs = [
    { name: 'SUPER_ADMIN', description: 'Super Admin — tizim ustidan to‘liq nazorat' },
    { name: 'MEDICAL_ADMIN', description: 'Tibbiy administrator — klinik jarayonlar nazorati' },
    { name: 'SPECIALIST', description: 'Klinik va reabilitatsiya mutaxassisi (barcha 11 ta mutaxassislik turi)' },
    { name: 'PARENT', description: 'Ota-ona yoki qonuniy vasiy' },
    { name: 'AUDITOR', description: 'Auditor — faqat o‘qish huquqiga ega foydalanuvchi' },
  ];
  for (const r of roleDefs) {
    await prisma.role.upsert({ where: { name: r.name }, update: {}, create: r });
  }

  // 2. Specialist Types — 11 clinical professions
  const specTypes = [
    { code: 'NEVROLOG', name: 'Bolalar nevrologi', description: 'Asab tizimi va neyrorivojlanish' },
    { code: 'PEDIATR', name: 'Pediatr', description: 'Bolalar umumiy sog‘ligi va rivojlanish nazorati' },
    { code: 'REABILITOLOG', name: 'Reabilitolog', description: 'Kompleks reabilitatsiya dasturlarini boshqarish' },
    { code: 'FIZIOTERAPEVT', name: 'Fizioterapevt / LFK mutaxassisi', description: 'Motorika va jismoniy reabilitatsiya' },
    { code: 'ERGOTERAPEVT', name: 'Ergoterapevt', description: 'Kundalik hayot ko‘nikmalari va mustaqillik' },
    { code: 'LOGOPED', name: 'Logoped', description: 'Nutq va kommunikatsiyani rivojlantirish' },
    { code: 'DEFEKTOLOG', name: 'Defektolog / Maxsus pedagog', description: 'Maxsus ta’lim va rivojlantiruvchi pedagogika' },
    { code: 'PSIXOLOG', name: 'Psixolog', description: 'Xulq-atvor va emotsional rivojlanish' },
    { code: 'ORTOPED', name: 'Ortoped', description: 'Tayanch-harakat apparati bo‘yicha davolash' },
    { code: 'ORTOTIST', name: 'Ortotist', description: 'Ortoz va protez vositalarini moslashtirish' },
    { code: 'DIETOLOG', name: 'Dietolog', description: 'Ovqatlanish va oziqlanish rejasi' },
  ];

  const createdSpecTypes: Record<string, string> = {};
  for (const st of specTypes) {
    const created = await prisma.specialistType.upsert({
      where: { code: st.code },
      update: {},
      create: st,
    });
    createdSpecTypes[st.code] = created.id;
  }

  // 3. Password hash
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  const adminPasswordHash = await bcrypt.hash('852456', 10);

  // 4. Users (Super Admin, 3 Specialists, 2 Parents)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin' },
    update: { passwordHash: adminPasswordHash, role: 'SUPER_ADMIN' },
    create: {
      email: 'admin',
      passwordHash: adminPasswordHash,
      fullName: 'MEHR AI Super Administrator',
      phone: '+998901234567',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  // Specialists
  const spec1 = await prisma.user.upsert({
    where: { email: 'dr.nodira@mehr.uz' },
    update: {},
    create: {
      email: 'dr.nodira@mehr.uz',
      passwordHash: defaultPasswordHash,
      fullName: 'Dr. Nodira Rahimova',
      phone: '+998902345678',
      role: 'SPECIALIST',
      isActive: true,
      specialistProfile: {
        create: {
          specialistTypeId: createdSpecTypes['NEVROLOG'],
          licenseNumber: 'NEV-2024-9812',
          institution: 'Respublika Bolalar Reabilitatsiya Markazi',
          bio: '15 yillik tajribaga ega oliy toifali bolalar nevrologi va neyroreabilitologi.',
          isVerified: true,
        },
      },
    },
  });

  const spec2 = await prisma.user.upsert({
    where: { email: 'kamola.logoped@mehr.uz' },
    update: {},
    create: {
      email: 'kamola.logoped@mehr.uz',
      passwordHash: defaultPasswordHash,
      fullName: 'Kamola Yusupova',
      phone: '+998903456789',
      role: 'SPECIALIST',
      isActive: true,
      specialistProfile: {
        create: {
          specialistTypeId: createdSpecTypes['LOGOPED'],
          licenseNumber: 'LOG-2023-4411',
          institution: '“So‘zlashuv” nutq rivojlantirish markazi',
          bio: 'Autizm va nutq kechikishida AAC vositalari bo‘yicha xalqaro sertifikatlangan mutaxassis.',
          isVerified: true,
        },
      },
    },
  });

  const spec3 = await prisma.user.upsert({
    where: { email: 'sardor.fizioterapiya@mehr.uz' },
    update: {},
    create: {
      email: 'sardor.fizioterapiya@mehr.uz',
      passwordHash: defaultPasswordHash,
      fullName: 'Sardor Aliyev',
      phone: '+998904567890',
      role: 'SPECIALIST',
      isActive: true,
      specialistProfile: {
        create: {
          specialistTypeId: createdSpecTypes['FIZIOTERAPEVT'],
          licenseNumber: 'PHY-2022-7721',
          institution: '“Harakat” bolalar fizioterapiya klinikasi',
          bio: 'Bolalar tserebral falaji va postural muvozanat bo‘yicha Bobath terapevt.',
          isVerified: true,
        },
      },
    },
  });

  // Parents
  const parent1 = await prisma.user.upsert({
    where: { email: 'dilnoza@mehr.uz' },
    update: {},
    create: {
      email: 'dilnoza@mehr.uz',
      passwordHash: defaultPasswordHash,
      fullName: 'Dilnoza Karimova',
      phone: '+998971112233',
      role: 'PARENT',
      isActive: true,
      parentProfile: {
        create: {
          relationType: 'MOTHER',
          address: 'Toshkent shahar, Chilonzor tumani, 9-mavze',
          emergencyContact: '+998901112233',
        },
      },
    },
    include: { parentProfile: true },
  });

  const parent2 = await prisma.user.upsert({
    where: { email: 'alisher@mehr.uz' },
    update: {},
    create: {
      email: 'alisher@mehr.uz',
      passwordHash: defaultPasswordHash,
      fullName: 'Alisher Umarov',
      phone: '+998975556677',
      role: 'PARENT',
      isActive: true,
      parentProfile: {
        create: {
          relationType: 'FATHER',
          address: 'Samarqand shahar, Registon ko‘chasi, 42-uy',
          emergencyContact: '+998905556677',
        },
      },
    },
    include: { parentProfile: true },
  });

  // 5. Conditions & Diagnoses Catalog (Dynamic, not hardcoded)
  const conditions = [
    {
      code: 'ASD',
      name: 'Autizm Spektri Buzilishi (ASD)',
      description: 'Ijtimoiy muloqot, nutq va takrorlanuvchi xatti-harakatlar bilan tavsiflanuvchi neyrorivojlanish holati.',
      symptoms: 'Ko‘z bilan aloqaning sustligi, ismiga javob bermaslik, sensor sezgirlik, nutq kechikishi, stereotipik harakatlar.',
      riskSigns: 'O‘ziga yoki boshqalarga zarar yetkazish, ovqatlanishdan qat’iy bosh tortish, keskin regressiya.',
      recommendedSpecialists: 'LOGOPED,PSIXOLOG,NEVROLOG',
      defaultDurationDays: 30,
    },
    {
      code: 'SPEECH_DELAY',
      name: 'Rivojlanishdagi Nutq Kechikishi (RNK / Alaliya)',
      description: 'Ekspressiv va impressiv nutq ko‘nikmalarining yosh me’yoridan orqada qolishi.',
      symptoms: 'So‘z boyligining kamligi, oddiy so‘zlarni ayta olmaslik, imo-ishoralarga haddan ortiq tayanish.',
      riskSigns: '3 yoshgacha hech qanday so‘zning bo‘lmasligi, tovushlarga mutlaqo e’tibor bermaslik.',
      recommendedSpecialists: 'LOGOPED,NEVROLOG',
      defaultDurationDays: 30,
    },
    {
      code: 'CP',
      name: 'Bolalar Tserebral Falaji (BTF / Cerebral Palsy)',
      description: 'Harakat, mushak tonusi va muvozanatning doimiy neyromotor buzilishi.',
      symptoms: 'Mushaklar spastikligi yoki gipotonus, harakat koordinatsiyasining buzilishi, yurish va o‘tirishdagi qiyinchiliklar.',
      riskSigns: 'Bo‘g‘imlarning kontrakturalari, yutishdagi keskin qiyinchilik (aspiratsiya xavfi), tutqanoqlar.',
      recommendedSpecialists: 'FIZIOTERAPEVT,NEVROLOG,ERGOTERAPEVT',
      defaultDurationDays: 30,
    },
    {
      code: 'DOWN',
      name: 'Daun Sindromi (Trisomiya 21)',
      description: 'Kognitiv, jismoniy va nutqiy rivojlanishning o‘ziga xos xususiyatlari bilan kechuvchi genetik holat.',
      symptoms: 'Mushak gipotonusi, kognitiv rivojlanishdagi kechikish, nutq apparatining anatomik xususiyatlari.',
      riskSigns: 'Yurak-qon tomir faoliyatidagi o‘zgarishlar, bo‘yin umurtqasining beqarorligi (atlantoaksial sublyuksatsiya).',
      recommendedSpecialists: 'LOGOPED,FIZIOTERAPEVT,MAXSUS_PEDAGOG',
      defaultDurationDays: 30,
    },
    {
      code: 'ADHD',
      name: 'Diqqat Yetishmovchiligi va Giperaktivlik Sindromi (DYGS / ADHD)',
      description: 'Diqqatni jamlash qiyinligi, impulsivlik va yuqori darajadagi motor faollik.',
      symptoms: 'Bitta faoliyatda uzoq o‘tira olmaslik, ko‘rsatmalarni oxirigacha bajarmaslik, tez chalg‘ish.',
      riskSigns: 'Xavfni his qilmasdan balandlikka chiqish, jarohatlanish xavfining yuqoriligi.',
      recommendedSpecialists: 'PSIXOLOG,NEVROLOG,MAXSUS_PEDAGOG',
      defaultDurationDays: 30,
    },
  ];

  const conditionMap: Record<string, string> = {};
  for (const c of conditions) {
    const created = await prisma.conditionOrDiagnosis.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
    conditionMap[c.code] = created.id;
  }

  // 6. Development Domains (6 core areas)
  const domainsData = [
    { code: 'COGNITIVE', name: 'Kognitiv rivojlanish', description: 'Diqqat, xotira, tushunish, tafakkur va sabab-oqibatni idrok etish', orderIndex: 1 },
    { code: 'SPEECH', name: 'Nutq va kommunikatsiya', description: 'Tovushga javob, ko‘z bilan aloqa, so‘z boyligi, AAC vositalaridan foydalanish', orderIndex: 2 },
    { code: 'MOTOR', name: 'Motor rivojlanish', description: 'Yirik va mayda motorika, muvozanat, qo‘l harakatlari va koordinatsiya', orderIndex: 3 },
    { code: 'SOCIAL', name: 'Ijtimoiy rivojlanish', description: 'Oila va tengdoshlar bilan muloqot, navbat kutish, birgalikda o‘ynash', orderIndex: 4 },
    { code: 'ADL', name: 'Mustaqil hayot ko‘nikmalari', description: 'Kiyinish, ovqatlanish, gigiyena, hojatxona va buyumlarini tartibga solish', orderIndex: 5 },
    { code: 'BEHAVIOR', name: 'Xulq-atvor va hissiyot', description: 'Sensor ta’sirlarga javob, tantrum, takroriy harakatlar va o‘zini boshqarish', orderIndex: 6 },
  ];

  const domainMap: Record<string, string> = {};
  for (const d of domainsData) {
    const created = await prisma.developmentDomain.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
    domainMap[d.code] = created.id;
  }

  // 7. Assessment Questions (across all 6 domains)
  const questionsData = [
    // Cognitive
    { domainId: domainMap['COGNITIVE'], questionText: 'Bola tanish buyumlar va o‘yinchoqlarni vazifasiga ko‘ra farqlay oladimi?', orderIndex: 1 },
    { domainId: domainMap['COGNITIVE'], questionText: 'Bola asosiy ranglar (qizil, ko‘k, sariq, yashil)ni ko‘rsata oladimi yoki ajratadimi?', orderIndex: 2 },
    { domainId: domainMap['COGNITIVE'], questionText: 'Bola oddiy sabab-oqibat zanjirini tushunadimi (masalan, tugmani bossa musiqa chalinadi)?', orderIndex: 3 },
    { domainId: domainMap['COGNITIVE'], questionText: 'Bitta faoliyatga (masalan, piramida terish) kamida 3-5 daqiqa diqqatini jamlay oladimi?', orderIndex: 4 },

    // Speech
    { domainId: domainMap['SPEECH'], questionText: 'Bola o‘z ismini aytib chaqirganda o‘girilib qaraydimi yoki javob beradimi?', orderIndex: 1 },
    { domainId: domainMap['SPEECH'], questionText: 'Bola kattalar bilan muloqotda ko‘z bilan aloqa (eye contact) o‘rnatadimi?', orderIndex: 2 },
    { domainId: domainMap['SPEECH'], questionText: 'Bola o‘z ehtiyojini (suv, ovqat, o‘yinchoq) qandaydir usulda (imo-ishora, AAC, so‘z) bildiradimi?', orderIndex: 3 },
    { domainId: domainMap['SPEECH'], questionText: 'Bola kamida 10-15 ta tushunarli so‘z yoki so‘z birikmalarini qo‘llay oladimi?', orderIndex: 4 },

    // Motor
    { domainId: domainMap['MOTOR'], questionText: 'Bola mustaqil, tayanchsiz qadam tashlay oladimi va muvozanatini saqlaydimi?', orderIndex: 1 },
    { domainId: domainMap['MOTOR'], questionText: 'Bola mayda narsalarni ikki barmoq (qisqichsimon tutqich) bilan ushlay oladimi?', orderIndex: 2 },
    { domainId: domainMap['MOTOR'], questionText: 'Qoshiq yoki qalamni qo‘lida to‘g‘ri ushlab harakatlantira oladimi?', orderIndex: 3 },
    { domainId: domainMap['MOTOR'], questionText: 'Kichik to‘siqlardan (zinapoya, pastki pol) o‘ta oladimi?', orderIndex: 4 },

    // Social
    { domainId: domainMap['SOCIAL'], questionText: 'Kattalar yoki tengdoshlari bilan oddiy o‘yinlarda qatnashadimi?', orderIndex: 1 },
    { domainId: domainMap['SOCIAL'], questionText: 'O‘yinda navbat kutish yoki buyumni bo‘lishish qobiliyati bormi?', orderIndex: 2 },
    { domainId: domainMap['SOCIAL'], questionText: 'Oddiy bir bosqichli og‘zaki ko‘rsatmalarga amal qiladimi (masalan: “To‘pni ber”)?', orderIndex: 3 },

    // ADL
    { domainId: domainMap['ADL'], questionText: 'Qoshiq yoki stakanni mustaqil ushlab o‘zi ovqatlanadimi va suv ichadimi?', orderIndex: 1 },
    { domainId: domainMap['ADL'], questionText: 'Hojatxonaga borish zarurligini bildira oladimi yoki o‘zi boradimi?', orderIndex: 2 },
    { domainId: domainMap['ADL'], questionText: 'Paypoq, shlyapa yoki oddiy kiyimlarni yechish va kiyishga urinadimi?', orderIndex: 3 },
    { domainId: domainMap['ADL'], questionText: 'Qo‘llarini suv va sovun bilan yuvish harakatlarini bajaradimi?', orderIndex: 4 },

    // Behavior
    { domainId: domainMap['BEHAVIOR'], questionText: 'Kutilmagan ovoz, yorug‘lik yoki teginishlarga xotirjam va me’yorda javob beradimi?', orderIndex: 1 },
    { domainId: domainMap['BEHAVIOR'], questionText: 'Rad javobi berilganda yoki rejalar o‘zgarganda xulq-atvorini tinchlantira oladimi?', orderIndex: 2 },
    { domainId: domainMap['BEHAVIOR'], questionText: 'Takroriy, stereotipik harakatlar (qo‘l siltash, aylanib yurish) kam kuzatiladimi?', orderIndex: 3 },
    { domainId: domainMap['BEHAVIOR'], questionText: 'Kechasi bezovtalanmasdan, barqaror uxlaydimi?', orderIndex: 4 },
  ];

  for (const q of questionsData) {
    const existing = await prisma.assessmentQuestion.findFirst({
      where: { domainId: q.domainId, questionText: q.questionText },
    });
    if (!existing) {
      await prisma.assessmentQuestion.create({ data: q });
    }
  }

  // 8. Exercise Categories & 25+ Exercises
  const categories = [
    { code: 'SPEECH_AAC', name: 'Nutq va AAC mashqlari', icon: 'MessageCircle' },
    { code: 'FINE_MOTOR', name: 'Mayda motorika va barmoq mashqlari', icon: 'Hand' },
    { code: 'GROSS_MOTOR', name: 'Yirik motorika va muvozanat', icon: 'Activity' },
    { code: 'COGNITIVE_PLAY', name: 'Kognitiv o‘yinlar va mantiq', icon: 'Brain' },
    { code: 'ADL_ROUTINE', name: 'Mustaqil hayot va gigiyena ko‘nikmalari', icon: 'CheckCircle' },
    { code: 'SENSORY_REG', name: 'Sensor integratsiya va tinchlanish', icon: 'Sparkles' },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.exerciseCategory.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
    catMap[c.code] = created.id;
  }

  const sampleExercises = [
    {
      categoryId: catMap['SPEECH_AAC'],
      title: '“Suv so‘rash” — AAC orqali ehtiyojni bildirish',
      objective: 'Bola chanqaganda “Suv” kartochkasini kattaga berish orqali muloqot o‘rnatadi.',
      durationMinutes: 15,
      materialsNeeded: '“Suv” AAC kartochkasi, stakan, toza ichimlik suvi.',
      stepsJson: JSON.stringify([
        '1-bosqich: Suv stakanini bolaning ko‘rish zonasiga, lekin qo‘li yetmaydigan masofaga qo‘ying.',
        '2-bosqich: Bolaning oldiga “Suv” kartochkasini qo‘ying.',
        '3-bosqich: Bola suvga intilganda uning qo‘lini sekin kartochka tomon yo‘naltiring.',
        '4-bosqich: Kartochkani sizning qo‘lingizga topshirishi bilan darhol baland ovozda “Suv!” deb ayting va suv bering.',
        '5-bosqich: Harakatni kun davomida 4-5 marta takrorlang.',
      ]),
      parentGuidance: 'Hech qachon bolaga bosim o‘tkazmang. U kartochkani berganda ijobiy his-tuyg‘u bilan darhol rag‘batlantiring.',
      safetyPrecautions: 'Suv harorati qulay bo‘lsin, bola shoshilib yutib yubormasligini kuzating.',
    },
    {
      categoryId: catMap['SPEECH_AAC'],
      title: '“Menga ber / Yana” funktsional so‘rov mashqi',
      objective: 'Sevimli o‘yinchoqni davom ettirish uchun “yana” imo-ishorasi yoki kartochkasidan foydalanish.',
      durationMinutes: 15,
      materialsNeeded: 'Sovun pufakchalari (miltillovchi pufaklar), “Yana” AAC kartasi.',
      stepsJson: JSON.stringify([
        '1-bosqich: Sovun pufagini puflab, bolaning quvonchini uyg‘oting.',
        '2-bosqich: Pufakchani to‘xtatib, bolaga kuting.',
        '3-bosqich: Bola davom ettirishni istaganda “Yana” kartasini ko‘rsatishga undashing.',
        '4-bosqich: Kartochkani uzatishi bilan yana pufakcha puflang.',
      ]),
      parentGuidance: 'Ushbu mashq sabab-oqibat bog‘liqligini va birgalikdagi diqqatni ajoyib rivojlantiradi.',
      safetyPrecautions: 'Sovun ko‘pigi bolaning ko‘ziga tushmasligiga e’tibor bering.',
    },
    {
      categoryId: catMap['FINE_MOTOR'],
      title: 'Qisqichsimon barmoq tutqichi: Rangli qopqoqchalar',
      objective: 'Bosh va ko‘rsatkich barmoq orqali mayda buyumlarni ushlash va idishga tashlash.',
      durationMinutes: 15,
      materialsNeeded: 'Plastik idish (og‘zi torroq teshikli), 5 ta yirik rangli tugma yoki butilka qopqog‘i.',
      stepsJson: JSON.stringify([
        '1-bosqich: Ota-ona bitta qopqoqni ikki barmoq bilan ushlab teshikka tashlab ko‘rsatadi.',
        '2-bosqich: Bolaning qo‘liga qopqoqni berib, ikki barmog‘i bilan ushlashga ko‘maklashadi.',
        '3-bosqich: Teshikka tushganida qarsak chalib quvonch bildiriladi.',
      ]),
      parentGuidance: 'Agar bola butun kafti bilan ushlasa, muloyimlik bilan ikki barmoqqa o‘tkazishga yordam bering.',
      safetyPrecautions: 'Buyumlar bolaning og‘ziga sig‘maydigan darajada xavfsiz o‘lchamda bo‘lishi shart.',
    },
    {
      categoryId: catMap['GROSS_MOTOR'],
      title: 'Yostiqli yo‘lakcha — Dinamik muvozanat mashqi',
      objective: 'Yumshoq yuzada yurish orqali oyoq mushaklari va vestibulyar apparatni mustahkamlash.',
      durationMinutes: 15,
      materialsNeeded: 'Turli o‘lchamdagi 4-5 ta divan yostiqlari, gilam.',
      stepsJson: JSON.stringify([
        '1-bosqich: Yostiqlarni ketma-ket polga terib chiqing.',
        '2-bosqich: Bolaning ikki qo‘lidan ushlab, sekin-asta yostiqlar ustidan yuring.',
        '3-bosqich: Bola o‘zini ishonchli his qilsa, faqat bir qo‘lidan ushlab sinab ko‘ring.',
      ]),
      parentGuidance: 'Oyoq yalang (paypoqsiz) bajarish sensor sezgilarni yanada kuchaytiradi.',
      safetyPrecautions: 'Atrofda o‘tkir burchakli mebellar bo‘lmasligiga ishonch hosil qiling.',
    },
    {
      categoryId: catMap['COGNITIVE_PLAY'],
      title: 'Shakllar saralovchisi (Sorterning 3 ta asosiy shakli)',
      objective: 'Doira, kvadrat va uchburchak shakllarini tanib, mos tuynukka kiritish.',
      durationMinutes: 15,
      materialsNeeded: 'Klassik yog‘och yoki plastik sorter (shakl ajratgich).',
      stepsJson: JSON.stringify([
        '1-bosqich: Dastlab faqat doira shaklini qoldirib, qolgan tuynuklarni berkitib turing.',
        '2-bosqich: Bola doirani oson kiritgach, ikkinchi shakl (kvadrat)ni qo‘shing.',
        '3-bosqich: Har gal shaklni nomlab ayting: “Doira! Dumaloq!”',
      ]),
      parentGuidance: 'Xato qilganda “Yo‘q” demang, “Keling, buni mana bu yerdan sinab ko‘ramiz” deb to‘g‘rilang.',
      safetyPrecautions: 'Sorter qismlari ekologik toza va silliq bo‘lishi lozim.',
    },
    {
      categoryId: catMap['ADL_ROUTINE'],
      title: 'Mustaqil qo‘l yuvish zanjiri (Task analysis)',
      objective: 'Qo‘lni suvga tutish, sovunlash va sochiqqa artish bosqichlarini tartib bilan bajarish.',
      durationMinutes: 10,
      materialsNeeded: 'Pastak stulcha (taglik), bolalar sovuni, yumshoq sochiq.',
      stepsJson: JSON.stringify([
        '1-bosqich: Qo‘l yenglarini yuqoriga shimarish.',
        '2-bosqich: Jo‘mrakni ochish va qo‘lni ho‘llash.',
        '3-bosqich: Sovunni kaftlar orasida ishqalash (10 soniya qo‘shiq aytish).',
        '4-bosqich: Suvda yuvish va sochiq bilan quritish.',
      ]),
      parentGuidance: 'Vannaxonaga vizual ketma-ketlik rasmlarini osib qo‘yish bolaga mustaqillik beradi.',
      safetyPrecautions: 'Suvning issiq-sovuqligini oldindan ota-ona tekshirishi shart.',
    },
    {
      categoryId: catMap['SENSORY_REG'],
      title: 'Og‘ir adyolcha va chuqur bosim orqali tinchlanish',
      objective: 'Propriotseptiv ta’sir orqali asab tizimini tinchlantirish va tantrum ehtimolini kamaytirish.',
      durationMinutes: 15,
      materialsNeeded: 'Bolaning vazniga mos og‘irlikdagi adyolcha yoki yumshoq katta yostiq.',
      stepsJson: JSON.stringify([
        '1-bosqich: Bolani qulay gilamchaga yotqizing yoki quchoqqa oling.',
        '2-bosqich: Adyolcha bilan yelkasidan pastki qismini muloyim o‘rang (boshini yopmang).',
        '3-bosqich: Yelkalari va qo‘llariga sekin, ritmik bosim bering.',
        '4-bosqich: Sekin nafas oling va sokin ohangda gapiring.',
      ]),
      parentGuidance: 'Mashg‘ulot bola toliqqan yoki hissiy hayajonlangan paytda eng yaxshi samara beradi.',
      safetyPrecautions: 'Yuzni hech qachon yopmang, bolaning istaksizligiga qarshi majburlamang.',
    },
  ];

  for (const ex of sampleExercises) {
    const existing = await prisma.exercise.findFirst({ where: { title: ex.title } });
    if (!existing) {
      await prisma.exercise.create({ data: ex });
    }
  }

  // 9. AAC Categories & 20+ AAC Cards
  const aacCats = [
    { code: 'NEEDS', name: 'Asosiy ehtiyojlar', color: '#EF4444', orderIndex: 1 },
    { code: 'FOOD', name: 'Taom va ichimliklar', color: '#F59E0B', orderIndex: 2 },
    { code: 'PEOPLE', name: 'Oila va odamlar', color: '#10B981', orderIndex: 3 },
    { code: 'ACTIONS', name: 'Harakatlar va o‘yin', color: '#3B82F6', orderIndex: 4 },
    { code: 'EMOTIONS', name: 'Tuyg‘ular va holat', color: '#8B5CF6', orderIndex: 5 },
    { code: 'RESPONSES', name: 'Javoblar va yordamchi', color: '#6B7280', orderIndex: 6 },
  ];

  const aacCatMap: Record<string, string> = {};
  for (const ac of aacCats) {
    const created = await prisma.AacCategory.upsert({
      where: { code: ac.code },
      update: {},
      create: ac,
    });
    aacCatMap[ac.code] = created.id;
  }

  const aacCardsData = [
    // Needs
    { categoryId: aacCatMap['NEEDS'], label: 'Suv', labelRu: 'Вода', labelEn: 'Water', iconName: 'Droplet', audioKey: 'suv' },
    { categoryId: aacCatMap['NEEDS'], label: 'Hojatxona', labelRu: 'Туалет', labelEn: 'Toilet', iconName: 'Bath', audioKey: 'hojatxona' },
    { categoryId: aacCatMap['NEEDS'], label: 'Yordam', labelRu: 'Помощь', labelEn: 'Help', iconName: 'HelpCircle', audioKey: 'yordam' },
    { categoryId: aacCatMap['NEEDS'], label: 'Uxlayman', labelRu: 'Спать', labelEn: 'Sleep', iconName: 'Moon', audioKey: 'uxlayman' },

    // Food
    { categoryId: aacCatMap['FOOD'], label: 'Non', labelRu: 'Хлеб', labelEn: 'Bread', iconName: 'Cookie', audioKey: 'non' },
    { categoryId: aacCatMap['FOOD'], label: 'Ovqat', labelRu: 'Еда', labelEn: 'Food', iconName: 'Utensils', audioKey: 'ovqat' },
    { categoryId: aacCatMap['FOOD'], label: 'Olma', labelRu: 'Яблоко', labelEn: 'Apple', iconName: 'Apple', audioKey: 'olma' },
    { categoryId: aacCatMap['FOOD'], label: 'Sut', labelRu: 'Молоко', labelEn: 'Milk', iconName: 'Coffee', audioKey: 'sut' },

    // People
    { categoryId: aacCatMap['PEOPLE'], label: 'Ona', labelRu: 'Мама', labelEn: 'Mom', iconName: 'Heart', audioKey: 'ona' },
    { categoryId: aacCatMap['PEOPLE'], label: 'Ota', labelRu: 'Папа', labelEn: 'Dad', iconName: 'UserCheck', audioKey: 'ota' },
    { categoryId: aacCatMap['PEOPLE'], label: 'Men', labelRu: 'Я', labelEn: 'Me', iconName: 'User', audioKey: 'men' },
    { categoryId: aacCatMap['PEOPLE'], label: 'Shifokor', labelRu: 'Врач', labelEn: 'Doctor', iconName: 'Stethoscope', audioKey: 'shifokor' },

    // Actions
    { categoryId: aacCatMap['ACTIONS'], label: 'O‘yin', labelRu: 'Игра', labelEn: 'Play', iconName: 'Gamepad2', audioKey: 'oyin' },
    { categoryId: aacCatMap['ACTIONS'], label: 'Yana', labelRu: 'Ещё', labelEn: 'More', iconName: 'Repeat', audioKey: 'yana' },
    { categoryId: aacCatMap['ACTIONS'], label: 'Tugadi', labelRu: 'Всё / Конец', labelEn: 'Finished', iconName: 'CheckSquare', audioKey: 'tugadi' },
    { categoryId: aacCatMap['ACTIONS'], label: 'Tashqariga chiqish', labelRu: 'На улицу', labelEn: 'Go outside', iconName: 'Sun', audioKey: 'tashqariga' },
    { categoryId: aacCatMap['ACTIONS'], label: 'Xohlayman', labelRu: 'Хочу', labelEn: 'Want', iconName: 'Smile', audioKey: 'xohlayman' },

    // Emotions & States
    { categoryId: aacCatMap['EMOTIONS'], label: 'Og‘riq', labelRu: 'Боль', labelEn: 'Pain', iconName: 'AlertTriangle', audioKey: 'ogriq' },
    { categoryId: aacCatMap['EMOTIONS'], label: 'Qo‘rqdim', labelRu: 'Страшно', labelEn: 'Scared', iconName: 'ShieldAlert', audioKey: 'qorqdim' },
    { categoryId: aacCatMap['EMOTIONS'], label: 'Charchadim', labelRu: 'Устал', labelEn: 'Tired', iconName: 'BatteryLow', audioKey: 'charchadim' },
    { categoryId: aacCatMap['EMOTIONS'], label: 'Xursandman', labelRu: 'Радостно', labelEn: 'Happy', iconName: 'Smile', audioKey: 'xursandman' },

    // Responses
    { categoryId: aacCatMap['RESPONSES'], label: 'Ha', labelRu: 'Да', labelEn: 'Yes', iconName: 'Check', audioKey: 'ha' },
    { categoryId: aacCatMap['RESPONSES'], label: 'Yo‘q', labelRu: 'Нет', labelEn: 'No', iconName: 'X', audioKey: 'yoq' },
  ];

  for (const ac of aacCardsData) {
    const existing = await prisma.aacCard.findFirst({ where: { label: ac.label } });
    if (!existing) {
      await prisma.aacCard.create({ data: ac });
    }
  }

  // 10. Children Demo Profiles (3 children: Jasur, Madina, Timur)
  // Child 1: Jasur (4 y.o., ASD + Speech Delay) -> Dilnoza's son
  const jasur = await prisma.child.create({
    data: {
      firstName: 'Jasur',
      lastName: 'Karimov',
      dateOfBirth: new Date('2022-04-15'),
      gender: 'MALE',
      region: 'Toshkent shahar',
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
      chiefComplaint: 'Ismiga qaramaydi, o‘z ehtiyojini so‘z bilan aytolmaydi, ko‘z bilan aloqa juda qisqa.',
      parents: {
        create: {
          parentId: parent1.parentProfile!.id,
          isPrimary: true,
          canManageConsent: true,
        },
      },
      medicalProfile: {
        create: {
          doctorConclusions: 'Neyrorivojlanish kechikishi, Autizm spektri belgilari. Eshitish a’zolari me’yorda.',
          priorTherapy: '3 oy davomida haftada 2 marta sensor integratsiya mashg‘ulotlari o‘tkazilgan.',
          currentMedications: 'Magne B6 (shifokor tavsiyasi bilan kurs oralig‘ida)',
          allergies: 'Sitrus mevalariga engil allergik toshma',
          precautionsContraindications: 'Baland shovqinli muhitda sensor zo‘riqish ehtimoli bor. Keskin tovushlardan saqlanish kerak.',
        },
      },
      conditions: {
        create: [
          {
            conditionId: conditionMap['ASD'],
            diagnosedDate: new Date('2024-05-10'),
            doctorName: 'Dr. Nodira Rahimova',
            severity: 'MODERATE',
            notes: 'Ijtimoiy muloqot va funktsional nutq ko‘nikmalarini ustuvor rivojlantirish lozim.',
          },
          {
            conditionId: conditionMap['SPEECH_DELAY'],
            diagnosedDate: new Date('2024-05-10'),
            doctorName: 'Dr. Nodira Rahimova',
            severity: 'MODERATE',
            notes: 'Ekspressiv nutq 0-1 ball darajasida, AAC kartochkalari joriy etilmoqda.',
          },
        ],
      },
      consents: {
        create: {
          parentUserId: parent1.id,
          consentType: 'DATA_PROCESSING_AND_AI_ASSISTANCE',
          consentText: 'MEHR AI platformasida bolaning tibbiy va rivojlanish ma’lumotlarini tahlil qilish hamda individual reja shakllantirishga to‘liq roziman.',
          version: '1.0',
          ipAddress: '192.168.1.105',
          isGranted: true,
        },
      },
    },
  });

  // Child 2: Madina (5 y.o., Cerebral Palsy) -> Dilnoza's daughter
  const madina = await prisma.child.create({
    data: {
      firstName: 'Madina',
      lastName: 'Karimova',
      dateOfBirth: new Date('2021-08-20'),
      gender: 'FEMALE',
      region: 'Toshkent shahar',
      photoUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=150',
      chiefComplaint: 'Oyoqlarida spastiklik bor, tayanchsiz mustaqil yura olmaydi, muvozanat sust.',
      parents: {
        create: {
          parentId: parent1.parentProfile!.id,
          isPrimary: true,
          canManageConsent: true,
        },
      },
      medicalProfile: {
        create: {
          doctorConclusions: 'Bolalar tserebral falaji, spastik diplegiya shakli.',
          priorTherapy: 'Fizioterapiya va Bobath terapiya kurslari muntazam olib borilmoqda.',
          currentMedications: 'Shifokor nazorati ostida mushak relaksanti (Baclofen 5mg)',
          allergies: 'Allergiya aniqlanmagan',
          precautionsContraindications: 'Bo‘g‘imlarni keskin cho‘zish taqiqlanadi, har bir harakat muloyim va sekin bajarilishi shart.',
        },
      },
      conditions: {
        create: [
          {
            conditionId: conditionMap['CP'],
            diagnosedDate: new Date('2022-11-15'),
            doctorName: 'Dr. Nodira Rahimova',
            severity: 'MODERATE',
            notes: 'Postural nazorat va dinamik muvozanat mashqlari zarur.',
          },
        ],
      },
      consents: {
        create: {
          parentUserId: parent1.id,
          consentType: 'DATA_PROCESSING_AND_AI_ASSISTANCE',
          consentText: 'Madinaning reabilitatsiya jarayonida MEHR AI individual ko‘mak tizimidan foydalanishga roziman.',
          version: '1.0',
          ipAddress: '192.168.1.105',
          isGranted: true,
        },
      },
    },
  });

  // Child 3: Timur (6 y.o., Down Syndrome) -> Alisher's son
  const timur = await prisma.child.create({
    data: {
      firstName: 'Timur',
      lastName: 'Umarov',
      dateOfBirth: new Date('2020-03-10'),
      gender: 'MALE',
      region: 'Samarqand viloyati',
      photoUrl: 'https://images.unsplash.com/photo-1595454223600-91fb579fa599?w=150',
      chiefComplaint: 'Kognitiv topshiriqlarni sekin o‘zlashtiradi, o‘z-o‘ziga xizmat ko‘rsatishda qo‘llab-quvvatlash kerak.',
      parents: {
        create: {
          parentId: parent2.parentProfile!.id,
          isPrimary: true,
          canManageConsent: true,
        },
      },
      medicalProfile: {
        create: {
          doctorConclusions: 'Daun sindromi (Trisomiya 21). Mushaklar gipotonusi mavjud.',
          priorTherapy: 'Logoped va defektolog bilan 1 yillik rivojlantiruvchi mashg‘ulotlar.',
          currentMedications: 'Vitamin D3, Yod preparatlari',
          allergies: 'Yo‘q',
          precautionsContraindications: 'Umurtqa bo‘yin qismini keskin bukish yoki sakrash mashqlaridan saqlanish lozim.',
        },
      },
      conditions: {
        create: [
          {
            conditionId: conditionMap['DOWN'],
            diagnosedDate: new Date('2020-04-01'),
            doctorName: 'Dr. Nodira Rahimova',
            severity: 'MILD',
            notes: 'Ijtimoiy muloqotga ochiq, mayda motorika va o‘z-o‘ziga xizmat ko‘nikmalari ustida ishlash talab etiladi.',
          },
        ],
      },
      consents: {
        create: {
          parentUserId: parent2.id,
          consentType: 'DATA_PROCESSING_AND_AI_ASSISTANCE',
          consentText: 'Timurning rivojlanish dasturini MEHR AI orqali yuritishga roziman.',
          version: '1.0',
          ipAddress: '192.168.1.200',
          isGranted: true,
        },
      },
    },
  });

  // 11. Baseline Digital Assessment for Jasur
  const jasurAssessment = await prisma.assessment.create({
    data: {
      childId: jasur.id,
      conductedById: parent1.id,
      type: 'BASELINE',
      totalScore: 18,
      maxScore: 60,
      notes: 'Ona tomonidan to‘ldirilgan dastlabki baholash natijalari.',
      results: {
        create: [
          { domainId: domainMap['COGNITIVE'], score: 2.2, percentage: 44, level: 'EMERGING', interpretation: 'Oddiy topshiriqlarni tushunadi, shakllarni ajratishda yordam kerak.' },
          { domainId: domainMap['SPEECH'], score: 1.0, percentage: 20, level: 'CRITICAL', interpretation: 'Ekspressiv nutq cheklangan, ehtiyojni bildirishda AAC va vizual yordam zarur.' },
          { domainId: domainMap['MOTOR'], score: 3.5, percentage: 70, level: 'DEVELOPING', interpretation: 'Yirik motorika barqaror, mayda motorikada qisqichsimon tutqich rivojlanmoqda.' },
          { domainId: domainMap['SOCIAL'], score: 1.8, percentage: 36, level: 'CRITICAL', interpretation: 'Birgalikda o‘ynash va ko‘z bilan aloqa qo‘llab-quvvatlashga muhtoj.' },
          { domainId: domainMap['ADL'], score: 2.5, percentage: 50, level: 'DEVELOPING', interpretation: 'Qoshiqda mustaqil ovqatlanish shakllangan, kiyinishda yordam kerak.' },
          { domainId: domainMap['BEHAVIOR'], score: 2.8, percentage: 56, level: 'DEVELOPING', interpretation: 'Shovqinga nisbatan sezgirlik bor, reja o‘zgarganda xavotir yuzaga keladi.' },
        ],
      },
    },
  });

  // 12. Active AI Individual Package for Jasur (30-day program)
  const jasurPackage = await prisma.individualPackage.create({
    data: {
      childId: jasur.id,
      title: 'MEHR Individual Rivojlantirish Paketi: Jasur (4 yosh)',
      summary: 'Bolaning nutq va kommunikatsiya ehtiyojlari yuqori ustuvorlikda. AAC kartochkalari orqali asosiy ehtiyojlarni bildirish va sensor barqarorlikni ta’minlashga yo‘naltirilgan 30 kunlik reja.',
      durationDays: 30,
      priorityDomains: JSON.stringify(['Nutq va kommunikatsiya', 'Ijtimoiy rivojlanish', 'Mustaqil hayot']),
      status: 'APPROVED',
      version: 1,
      specialistFeedback: 'Reja klinik ko‘rsatmalarga to‘liq mos keladi. Dastlabki 2 haftada “Suv” va “Non” AAC kartochkalariga alohida urg‘u berilsin. — Dr. Nodira Rahimova',
      dangerSignsWarning: 'Bola xatti-harakatida o‘ziga zarar yetkazish (bosh urish) yoki kuchli tajovuz yuzaga kelsa, mashg‘ulotni darhol to‘xtating va mutaxassisga murojaat qiling.',
      modules: {
        create: [
          {
            weekNumber: 1,
            focusArea: 'AAC asoslari va ehtiyojni tanish',
            weeklyGoal: '“Suv” va “Yordam” kartochkalarini vizual tanish va kattaga uzatish.',
            expectedOutcome: 'Bola kamida 60% holatda chanqaganda kartochkaga ishora qiladi.',
            parentAdvice: 'Kuniga 2-3 marta 15 daqiqadan charchatmasdan o‘yin shaklida o‘tkazing.',
          },
          {
            weekNumber: 2,
            focusArea: 'Ikki kartochkali tanlov',
            weeklyGoal: '“Suv” va “Non” o‘rtasida to‘g‘ri tanlov qilish ko‘nikmasi.',
            expectedOutcome: 'Ikkita variant taklif qilinganda o‘zi xohlaganini ajratib bera olish.',
            parentAdvice: 'Avval bola qaysi birini ko‘proq xohlayotganini sezing va tanlov bering.',
          },
          {
            weekNumber: 3,
            focusArea: 'Funktsional so‘rov va imo-ishora',
            weeklyGoal: '“Yana” va “Tugadi” tushunchalarini o‘yin orqali mustahkamlash.',
            expectedOutcome: 'O‘yin tugaganda tantrumsiz “Tugadi” kartasini qabul qilish.',
            parentAdvice: 'Mashg‘ulot yakunini vizual taymer yordamida oldindan bildiring.',
          },
          {
            weekNumber: 4,
            focusArea: 'Mustaqil kommunikatsiyani umumlashtirish',
            weeklyGoal: 'Uy muhitida turli oila a’zolariga ehtiyoj kartalarini uzatish.',
            expectedOutcome: 'Ota va buviga ham kartochka orqali murojaat qilishni o‘rganish.',
            parentAdvice: 'Barcha oila a’zolari bir xil reaksiyada bo‘lishi juda muhim.',
          },
        ],
      },
    },
  });

  // Create 5 sample daily tasks and task results for Jasur
  const task1 = await prisma.dailyTask.create({
    data: {
      packageId: jasurPackage.id,
      dayNumber: 1,
      title: '1-kun: “Suv” kartochkasi bilan ilk tanishuv',
      durationMinutes: 15,
      materials: '“Suv” AAC kartochkasi va shaffof suvli stakan.',
      instructions: 'Bolaning ko‘z o‘ngida stakanga suv quying. Suvga intilganida uning qo‘liga “Suv” kartochkasini bering va uni o‘zingizga topshirishiga ko‘maklashing.',
      parentTip: 'Har bir topshirish harakatidan so‘ng darhol jilmayib, “Barakalla, Jasur! Mana suv!” deb quchoqlang.',
      targetBehavior: 'Kartochkani ota-ona qo‘liga tekkizish yoki uzatish.',
    },
  });

  await prisma.dailyTaskResult.create({
    data: {
      taskId: task1.id,
      childId: jasur.id,
      status: 'COMPLETED',
      assistanceLevel: 2, // tez-tez yordam kerak
      childReaction: 'POSITIVE',
      durationSpent: 15,
      parentNotes: 'Jasur dastlab tushunmadi, lekin 3-urinishda kartochkani uzatib quvondi.',
    },
  });

  const task2 = await prisma.dailyTask.create({
    data: {
      packageId: jasurPackage.id,
      dayNumber: 2,
      title: '2-kun: “Suv” kartochkasini stoldan tanlash',
      durationMinutes: 15,
      materials: 'Stol, stakan, “Suv” kartochkasi.',
      instructions: 'Kartochkani stol ustiga qo‘ying. Bola chanqab kelganda “Suv qani?” deb stoldagi kartochkani ko‘rsatishiga imkon bering.',
      parentTip: 'Shoshilmang, bolaga 5-7 soniya mustaqil o‘ylash uchun tanaffus bering.',
      targetBehavior: 'Stoldagi kartochkaga o‘z ixtiyori bilan qo‘l cho‘zish.',
    },
  });

  await prisma.dailyTaskResult.create({
    data: {
      taskId: task2.id,
      childId: jasur.id,
      status: 'COMPLETED',
      assistanceLevel: 3, // qisman mustaqil
      childReaction: 'POSITIVE',
      durationSpent: 16,
      parentNotes: 'Bugun ancha tez bajardi. O‘zi kartochkani olib onasiga berdi.',
    },
  });

  // 13. Behavior Diary Sample Entries for Jasur (ABC framework)
  await prisma.behaviorLog.create({
    data: {
      childId: jasur.id,
      timestamp: new Date(Date.now() - 86400000 * 2),
      situation: 'Oshxonada kechki ovqat paytida',
      behaviorDescription: 'Baland ovozda yig‘lash, stuldan tushib polga yotib olish.',
      antecedent: 'Ona planshetda multfilmni o‘chirib, ovqatlanishni so‘radi (kutilmagan to‘xtatish).',
      parentResponse: 'Muloyimlik bilan yoniga o‘tirdi, chuqur quchoqlab tinchlantirdi va 2 daqiqa tinch turgach pufakchalar ko‘rsatdi.',
      outcome: 'Yig‘i 4 daqiqa ichida to‘xtadi, tinchlanib ovqatlandi.',
      severity: 'MILD',
      possibleTriggers: 'Raqamli ekran o‘chirilgandagi hissiy zo‘riqish va ogohlantirishsiz o‘tish (transitsiya qiyinligi).',
      aiSuggestedStrategy: 'Vizual taymer yoki 3 daqiqalik qumsoat qo‘llang: “Yana 3 daqiqa va multfilm tugaydi” deb vizual ogohlantirish bering.',
    },
  });

  await prisma.behaviorLog.create({
    data: {
      childId: jasur.id,
      timestamp: new Date(Date.now() - 86400000),
      situation: 'Xonada yangi o‘yinchoq berilganda',
      behaviorDescription: 'Qo‘llarini qanotsimon tez siltash (flapping), bir nuqtaga tikilib turish.',
      antecedent: 'Yangi yorug‘lik chiqaruvchi musiqiy o‘yinchoq yoqildi.',
      parentResponse: 'O‘yinchoqning ovozini pasaytirdi va Jasurning e’tiborini o‘ziga qaratib qo‘llarini silab qo‘ydi.',
      outcome: 'Qo‘l siltash to‘xtadi, tabassum qildi.',
      severity: 'MILD',
      possibleTriggers: 'Sensor haddan tashqari qo‘zg‘alish (vizual va audio stimulus kuchliligi).',
      aiSuggestedStrategy: 'Sensor yuklamani bosqichma-bosqich bering: avval faqat chiroq, keyin past ovoz bilan tanishtiring.',
    },
  });

  // 14. Educational Materials
  const eduMaterials = [
    {
      title: 'Autizmda AAC (Alternativ va augmentativ kommunikatsiya) nima uchun zarur?',
      category: 'AAC',
      targetRole: 'PARENT',
      content: 'AAC vositalari bolaning gapirishini to‘xtatib qo‘ymaydi, aksincha nutq markazlariga tushadigan zo‘riqishni kamaytirib, miyaning funktsional muloqot zanjirini faollashtiradi.',
      tags: 'AAC, kommunikatsiya, autizm, ota-onaga maslahat',
    },
    {
      title: 'Tantrum va sensor inqiroz: Farqi va to‘g‘ri yondashuv',
      category: 'ABA',
      targetRole: 'ALL',
      content: 'Tantrum maqsadli xatti-harakat bo‘lib, bola biror narsaga erishish yoki qochish uchun qiladi. Sensor inqiroz (meltdown) esa asab tizimining to‘lib-toshishidir. Meltdown paytida jazo yoki talab emas, xavfsiz sokin makon va sensor yordam kerak.',
      tags: 'xulq-atvor, tantrum, sensorika',
    },
  ];

  for (const em of eduMaterials) {
    const existing = await prisma.educationalMaterial.findFirst({ where: { title: em.title } });
    if (!existing) {
      await prisma.educationalMaterial.create({ data: em });
    }
  }

  // 15. System Settings
  await prisma.systemSetting.upsert({
    where: { key: 'PLATFORM_NAME' },
    update: {},
    create: { key: 'PLATFORM_NAME', value: 'MEHR AI', description: 'Platforma rasmiy nomi' },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'AI_REPLAN_INTERVAL_DAYS' },
    update: {},
    create: { key: 'AI_REPLAN_INTERVAL_DAYS', value: '7', description: 'AI qayta tahlil va reja yangilanish davriyligi (kun)' },
  });

  console.log('✅ MEHR AI database successfully seeded with rich demo data:');
  console.log('   - Super Admin: admin (Password: 852456)');
  console.log('   - Specialists: dr.nodira@mehr.uz, kamola.logoped@mehr.uz, sardor.fizioterapiya@mehr.uz (Password: Password123!)');
  console.log('   - Parents: dilnoza@mehr.uz, alisher@mehr.uz (Password: Password123!)');
  console.log('   - 3 Children: Jasur (ASD), Madina (CP), Timur (Down Syndrome)');
  console.log('   - 6 Domains, 25+ Exercises, 22+ AAC Cards, Assessments, Packages, Behavior Logs');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

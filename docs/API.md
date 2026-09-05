# MEHR AI — REST API Hujjatlari (API Documentation)

MEHR AI pediatrik reabilitatsiya platformasining barcha REST API endpointlari, xavfsizlik talablari va ma’lumotlar sxemasi.

---

## 1. Asosiy Prinsiplar & Xavfsizlik

- **Base URL**: `https://api.mehr.uz/api` (yoki mahalliy: `http://localhost:5000/api`)
- **Autentifikatsiya**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Format**: JSON (`Content-Type: application/json`)
- **Tezlik chegarasi (Rate Limiting)**: 15 daqiqada 500 ta so‘rov (har bir IP bo‘yicha)
- **Klinik Xavfsizlik Qoidasi**: AI hech qachon yakuniy tibbiy tashxis qo‘ymaydi va dori dozasini belgilamaydi.

---

## 2. Autentifikatsiya (Auth)

### `POST /api/auth/login`
Foydalanuvchi tizimga kirishi va JWT tokenlarini olishi.
- **Body**:
  ```json
  {
    "email": "dilnoza@mehr.uz",
    "password": "Password123!"
  }
  ```
- **Javob**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "email": "dilnoza@mehr.uz",
        "role": "PARENT",
        "fullName": "Dilnoza Karimova"
      }
    }
  }
  ```

### `POST /api/auth/refresh-token`
Token rotatsiyasi orqali yangi access va refresh tokenlarini olish.

### `GET /api/auth/me`
Hozirgi foydalanuvchining to‘liq profili va biriktirilgan bolalari.

---

## 3. Bolalar Profili (Children)

### `GET /api/children`
Foydalanuvchiga tegishli (yoki mutaxassisga biriktirilgan) bolalar ro‘yxati.

### `GET /api/children/:id`
Bolaning to‘liq klinik profili, tibbiy ko‘rsatmalari va faol individual dasturi.

### `POST /api/children`
Yangi bola profilini yaratish, tibbiy ma’lumotlarni kiritish va ota-ona roziligini (Consent) rasmiylashtirish.

---

## 4. Raqamli Baholash (Digital Assessment - 0-5 Ball)

### `GET /api/assessments/questions`
6 ta rivojlanish sohasi (Kognitiv, Nutq, Motor, Ijtimoiy, Mustaqillik, Xulq-atvor) bo‘yicha standart savollar katalogi.

### `POST /api/assessments`
0–5 shkala bo‘yicha to‘ldirilgan baholash javoblarini yuborish.
- **Body**:
  ```json
  {
    "childId": "uuid",
    "type": "BASELINE",
    "answers": [
      { "questionId": "q1", "score": 2 },
      { "questionId": "q2", "score": 1 }
    ],
    "notes": "Ona tomonidan to‘ldirilgan"
  }
  ```

---

## 5. AI Individual Paket Generator (13-step Algorithm)

### `POST /api/packages/generate`
AI 13 bosqichli algoritmi asosida 30 kunlik individual rivojlantirish dasturini shakllantirish.
- **Body**:
  ```json
  {
    "childId": "uuid",
    "parentGoals": "Mustaqil nutq va ovqatlanish ko‘nikmalari"
  }
  ```
- **Javob**: 30 kunlik reja, 4 ta haftalik modul, kunlik 15 daqiqalik o‘yin mashg‘ulotlari va mutaxassislar tavsiyasi.

### `GET /api/packages/active/:childId`
Bolaning hozirgi faol individual paketi va kunlik topshiriqlar holati.

### `POST /api/packages/tasks/:taskId/result`
Kunlik 15 daqiqalik mashg‘ulot natijasini kiritish (Bajarildi, qisman, yordam darajasi 0-5, bola reaksiyasi va ota-ona izohi).

### `POST /api/packages/:packageId/review` (Faqat mutaxassislar uchun)
Mutaxassis tomonidan AI yaratgan paketni tasdiqlash (`APPROVED`), o‘zgartirish (`MODIFIED`) yoki rad etish (`REJECTED`).

---

## 6. AAC Ovozli Aloqa Doskasi

### `GET /api/aac/cards`
AAC toifalari (Ehtiyojlar, Taomlar, Oila, Harakatlar, Tuyg‘ular) va barcha kartochkalar ro‘yxati.

### `POST /api/aac/cards`
Yangi shaxsiy AAC kartochkasini qo‘shish.

---

## 7. Xulq-atvor Kundaligi (ABC Tizimi)

### `POST /api/behavior`
ABC hodisasini qayd etish (Antecedent -> Behavior -> Consequence).

### `GET /api/behavior/child/:childId`
Bolaning xulq-atvor yozuvlari va AI trigger pattern tahlili.

---

## 8. Progress Monitoring & AI Re-Planning

### `GET /api/progress/child/:childId`
Dinamik ko‘rsatkichlar, 6 yo‘nalish bo‘yicha radar/foizlar va AI Re-planning tahlili (85% o‘zlashtirish aniqlanganda yangi bosqichga o‘tish tavsiyasi).

---

## 9. Oflayn PWA Sinxronizatsiyasi (Sync Queue)

### `POST /api/sync`
Internet bo‘lmaganda qurilmada to‘plangan mutatsiyalarni (kunlik natijalar, xulq-atvor yozuvlari) server bilan avtomatik va ziddiyatsiz sinxronlash.

---

## 10. MEHR AI Yordamchi Chat

### `POST /api/ai/chat`
Bolaning yoshi, tashxislari va faol individual paketi doirasida ota-onaga xavfsiz va amaliy yordam berish. Xavfli holatlarda darhol 103 ga murojaat qilish ogohlantirishini chiqaradi.

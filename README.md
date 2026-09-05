# MEHR AI — Bolalar Uchun Sun’iy Intellekt Asosidagi Individual Rivojlantirish, Reabilitatsiya va Ota-Ona Ko‘mak Platformasi

> **“Har bir bola — alohida imkoniyat. Har bir qadam — yangi yutuq.”**

MEHR AI — 2026-yil darajasidagi zamonaviy, professional, xavfsiz, mobilga mos, **ONLINE va OFFLINE (PWA)** rejimlarida ishlovchi pediatrik raqamli reabilitatsiya ekotizimi. U bolalar, ota-onalar, shifokorlar, logopedlar, psixologlar, fizioterapevtlar va administratorlarni yagona raqamli muhitga birlashtiradi.

---

## 🌟 Platformaning 4 Asosiy Yuragi

1. **Digital Assessment**: 6 ta yo‘nalish (Kognitiv, Nutq, Motor, Ijtimoiy, ADL, Xulq-atvor) bo‘yicha 0–5 klinik standart shkalasida chuqur baholash.
2. **AI Individual Paket Generator**: 13 bosqichli klinik algoritm: 30 kunlik reja, kunlik 15 daqiqalik topshiriqlar, AAC integratsiyasi va haftalik monitoring.
3. **Continuous Monitoring & ABC Diary**: Kunlik mashg‘ulot natijalari, ota-ona izohlari va triggerlarni aniqlovchi xulq-atvor jurnali.
4. **AI Re-Planning**: 80–85% o‘zlashtirish ko‘rsatkichida rejani avtomatik ravishda keyingi bosqichga ko‘tarish va mutaxassisga yuborish.

---

## 🏗 Arxitektura

- **Frontend**: React 18/19 + Vite + Tailwind CSS + Lucide Icons + Canvas Confetti + Web Speech API (AAC audio) + PWA Service Worker
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL (Production Docker) / SQLite (Mahalliy darhol ishga tushirish uchun)
- **Kesh & Xavfsizlik**: Redis, JWT (Access & Refresh rotation), Helmet, CORS, Rate Limiting, Audit Logging
- **Oflayn Sinxronizatsiya**: IndexedDB offline queue (`/api/sync`) bilan internet tiklanganda avtomatik ziddiyatsiz sinxronlash
- **Tillar**: 🇺🇿 O‘zbek, 🇷🇺 Rus, 🇬🇧 Ingliz (JSON lug‘atlar orqali kengaytiriladi)

---

## 🚀 Mahalliy Ishga Tushirish (Local Setup)

### 1. Backend Serverni Ishga Tushirish:
```bash
cd server
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
Backend API manzili: `http://localhost:5000/api`

### 2. Frontend Mijozni Ishga Tushirish:
```bash
cd client
npm install
npm run dev
```
Frontend manzili: `http://localhost:3000`

---

## 👥 Demo Akkauntlar (Baza avtomatik to‘ldirilgan)

| Rol | Email | Parol | Tavsif |
|---|---|---|---|
| **Ota-ona** | `dilnoza@mehr.uz` | `Password123!` | Jasurning onasi (4 yosh, ASD + Nutq kechikishi) |
| **Ota-ona** | `alisher@mehr.uz` | `Password123!` | Timurning otasi (6 yosh, Daun sindromi) |
| **Shifokor** | `dr.nodira@mehr.uz` | `Password123!` | Oliy toifali bolalar nevrologi |
| **Logoped** | `kamola.logoped@mehr.uz` | `Password123!` | AAC va nutq bo‘yicha mutaxassis |
| **Fizioterapevt** | `sardor.fizioterapiya@mehr.uz` | `Password123!` | Reabilitolog / Bobath terapevt |
| **Administrator** | `admin@mehr.uz` | `AdminSecret2026!` | Tizim ma’muri (Dinamik kataloglar & audit) |

---

## 🧪 Avtomatlashtirilgan Testlarni O‘tkazish

```bash
cd server
npm test
```
Barcha 16 ta integratsion va klinik testlar muvaffaqiyatli o‘tgan.

---

## 🚢 Docker & Production Deployment

Batafsil ma’lumot uchun:
- [API Hujjatlari](file:///C:/Users/1/.gemini/antigravity/scratch/mehr-ai/docs/API.md)
- [Serverga O‘rnatish Qo‘llanmasi](file:///C:/Users/1/.gemini/antigravity/scratch/mehr-ai/docs/DEPLOYMENT.md)

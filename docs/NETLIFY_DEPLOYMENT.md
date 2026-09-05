# MEHR AI — Netlify Bepul Hostingiga Joylash Qo‘llanmasi

MEHR AI platformasi Netlify platformasida 100% bepul, tezkor va to‘liq ishlaydigan qilib sozlangan.

Loyiha ichiga allaqachon quyidagi sozlamalar kiritilgan:
- **`netlify.toml`**: build buyruqlari (`npm run build`), `dist` papkasi va SPA router yo‘naltirishlari (`/* -> /index.html 200`).
- **Dual-Mode Clinical Engine**: Netlify serverless rejimida ham barcha 13 bosqichli AI algoritmi, AAC ovozli kartochkalari, 0–5 baholash, xulq kundaligi va demo profillar (Dilnoza, Dr. Nodira, Admin) brauzer ichida to‘liq ishlaydi.
- **PWA Service Worker & Web App Manifest**: Telefon va kompyuterga ilova (PWA) sifatida o‘rnatish imkoniyati.

---

## 🚀 1-USUL: Netlify Drop (Eng Tezkor — 1 daqiqada, GitHubsiz)

1. [https://app.netlify.com/drop](https://app.netlify.com/drop) sahifasiga kiring (yoki Netlify hisobingizga kiring).
2. Quyidagi papkani oching:
   `C:\Users\1\.gemini\antigravity\scratch\mehr-ai\client\dist`
3. Ushbu `dist` papkasini sichqoncha bilan ushlab, Netlify sahifasidagi **"Drag and drop your site output folder here"** maydoniga tashlang.
4. Bir necha soniyada Netlify sizga bepul ishchi domen taqdim etadi (masalan: `https://mehr-ai-uz.netlify.app`).
5. Sayt darhol to‘liq ishga tushadi!

---

## 🌐 2-USUL: GitHub Orqali Bepul Ulab Berish (Tavsiya etiladi)

Ushbu usul har safar kodingizga yangilik qo‘shganingizda Netlify saytni avtomatik yangilashini ta’minlaydi:

### 1-qadam: GitHub Repositoriy Yaratish
1. [GitHub.com](https://github.com/new) da yangi shaxsiy yoki ommaviy repozitoriy oching (masalan, `mehr-ai`).
2. Terminalda quyidagi buyruqni bering:
   ```bash
   cd C:\Users\1\.gemini\antigravity\scratch\mehr-ai
   git remote add origin https://github.com/SIZNING_USERNAME/mehr-ai.git
   git branch -M main
   git push -u origin main
   ```

### 2-qadam: Netlify ga Ulanish
1. [Netlify.com](https://app.netlify.com/) ga kiring va **"Add new site" ➔ "Import an existing project"** tugmasini bosing.
2. **GitHub** ni tanlang va `mehr-ai` repozitoriyingizni tanlang.
3. Sozlamalar allaqachon `netlify.toml` faylimizdan avtomatik o‘qib olinadi:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **"Deploy site"** tugmasini bosing.
5. 1 daqiqa ichida Netlify loyihani yig‘adi va sizga bepul HTTPS domen beradi!

---

## ⚙️ 3-USUL: Netlify CLI Orqali Terminaldan Deploy Qilish

Agar terminaldan to‘g‘ridan-to‘g‘ri deploy qilmoqchi bo‘lsangiz:

```bash
cd C:\Users\1\.gemini\antigravity\scratch\mehr-ai

# Netlify ga tizimga kirish
npx netlify-cli login

# Saytni deploy qilish
npx netlify-cli deploy --prod --dir=client/dist
```

---

## ✅ Netlify da Tekshiriladigan Imkoniyatlar:
- **Demo Kirish**: Dilnoza (Ota-ona), Dr. Nodira (Shifokor) va Admin tugmalari 1-klikda kiradi.
- **AI Individual Paket Generator**: 30 kunlik reja, haftalik modullar va kunlik 15 daqiqalik mashqlar.
- **Ovozli AAC Doskasi**: Kartochkalarni bosganda brauzer nutq sintezi orqali ovoz chiqaradi.
- **ABC Xulq Kundaligi**: Yangi xatti-harakat va triggerlarni kiritish hamda AI tahlili.
- **Rivojlanish Progressi**: 6 ta soha bo‘yicha radar va o‘sish ko‘rsatkichlari.
- **PWA**: Telefon brauzerida "Bosh ekranga qo‘shish" (Install App) orqali to‘liq mobil ilovaga aylanadi.

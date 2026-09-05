# MEHR AI — Serverga O‘rnatish va Ishga Tushirish Qo‘llanmasi (Production Deployment)

MEHR AI platformasini real domen (`mehr.uz`, `api.mehr.uz`, `admin.mehr.uz`) va Linux VPS serveriga to‘liq o‘rnatish bo‘yicha batafsil qo‘llanma.

---

## 1. Minimal Server Talablari

- **OS**: Ubuntu 22.04 LTS / 24.04 LTS yoki Debian 12
- **CPU**: 2 vCPU (tavsiya etiladi: 4 vCPU)
- **RAM**: 4 GB (tavsiya etiladi: 8 GB)
- **Disk**: 40 GB SSD / NVMe
- **Tarmoq**: Ochiq portlar: `80` (HTTP), `443` (HTTPS), `22` (SSH). PostgreSQL (5432) tashqi internetdan yopiq bo‘lishi shart!

---

## 2. Server Muhitini Tayyorlash

Serverga SSH orqali kiring va kerakli dasturlarni o‘rnating:

```bash
# Tizimni yangilash
sudo apt update && sudo apt upgrade -y

# Docker va Docker Compose o‘rnatish
sudo apt install -y docker.io docker-compose git ufw curl

# Docker xizmatini yoqish
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# Xavfsizlik devori (Firewall) sozlash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 3. Loyihani Serverga Yuklash va Sozlash

```bash
# Loyihani klonlash
git clone https://github.com/your-org/mehr-ai.git /var/www/mehr-ai
cd /var/www/mehr-ai

# Muhit o‘zgaruvchilarini sozlash
cp server/.env.example server/.env
nano server/.env
```

`.env` faylida quyidagi parametrlarni o‘zgartiring:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://mehr_user:STRONG_SECURE_PASSWORD_2026@postgres:5432/mehr_db?schema=public
JWT_SECRET=YOUR_SUPER_SECRET_256_BIT_JWT_KEY_HERE
JWT_REFRESH_SECRET=YOUR_SUPER_SECRET_REFRESH_KEY_HERE
CORS_ORIGIN=https://mehr.uz,https://admin.mehr.uz
GEMINI_API_KEY=YOUR_OPTIONAL_GEMINI_KEY
```

---

## 4. Docker Konteynerlarini Ishga Tushirish

```bash
# Loyihani build qilish va ishga tushirish
docker-compose up -d --build

# Baza migratsiyasi va demo ma’lumotlarni yuklash (Seed)
docker exec -it mehr_backend npx prisma db push
docker exec -it mehr_backend npx tsx prisma/seed.ts
```

---

## 5. SSL Sertifikatini O‘rnatish (Let's Encrypt Certbot)

```bash
# Certbot o‘rnatish
sudo apt install -y certbot python3-certbot-nginx

# Domenlar uchun SSL sertifikati olish
sudo certbot --nginx -d mehr.uz -d api.mehr.uz -d admin.mehr.uz

# Sertifikat avtomatik yangilanishini tekshirish
sudo certbot renew --dry-run
```

---

## 6. Avtomatik Zaxiralashni (Cron Backup) Sozlash

Har kecha soat 03:00 da avtomatik zaxira olish uchun crontab ga qo‘shing:

```bash
sudo chmod +x /var/www/mehr-ai/deploy/scripts/backup.sh
sudo crontab -e
```

Quyidagi qatorni qo‘shing:
```cron
0 3 * * * /var/www/mehr-ai/deploy/scripts/backup.sh >> /var/log/mehr-backup.log 2>&1
```

---

## 7. Ishga Tushirishni Tekshirish

- **Asosiy portal**: `https://mehr.uz`
- **Admin paneli**: `https://admin.mehr.uz`
- **API Health Check**: `https://api.mehr.uz/api/health`

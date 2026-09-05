#!/bin/bash
# ==============================================================================
# MEHR AI — Avtomatik Kundalik Zaxiralash (Backup) Skripti
# ==============================================================================

set -e

BACKUP_DIR="/var/backups/mehr-ai"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "🔄 [${TIMESTAMP}] MEHR AI zaxiralash jarayoni boshlandi..."

# 1. PostgreSQL ma’lumotlar bazasi dump (siqilgan gzip)
echo "📦 1. Database zaxiralanmoqda..."
docker exec mehr_postgres pg_dump -U mehr_user -d mehr_db -F c -b -v -f /tmp/db_${TIMESTAMP}.dump
docker cp mehr_postgres:/tmp/db_${TIMESTAMP}.dump "${BACKUP_DIR}/db_${TIMESTAMP}.dump"
docker exec mehr_postgres rm /tmp/db_${TIMESTAMP}.dump

# 2. Hujjatlar va fayllarni zaxiralash
echo "📁 2. Hujjatlar va media fayllar zaxiralanmoqda..."
tar -czf "${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz" -C /var/www/mehr-ai/uploads . 2>/dev/null || true

# 3. Konfiguratsiya fayllarini zaxiralash (.env va nginx)
echo "⚙️ 3. Konfiguratsiya zaxiralanmoqda..."
tar -czf "${BACKUP_DIR}/config_${TIMESTAMP}.tar.gz" -C /var/www/mehr-ai deploy/nginx .env 2>/dev/null || true

# 4. Eski zaxiralarni tozalash (30 kundan kattalarini o‘chirish)
echo "🧹 4. 30 kundan eski zaxira nusxalari tozalanmoqda..."
find "${BACKUP_DIR}" -type f -name "*.dump" -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}" -type f -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "✅ [${TIMESTAMP}] MEHR AI zaxiralash muvaffaqiyatli yakunlandi: ${BACKUP_DIR}"

#!/bin/bash
# ==============================================================================
# MEHR AI — Zaxiradan Qayta Tiklash (Restore) Skripti
# ==============================================================================

set -e

if [ -z "$1" ]; then
    echo "Foydalanish: ./restore.sh <BACKUP_FILE_PATH>"
    echo "Misol: ./restore.sh /var/backups/mehr-ai/db_20260905_120000.dump"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Xatolik: Ko‘rsatilgan zaxira fayli topilmadi: ${BACKUP_FILE}"
    exit 1
fi

echo "⚠️ DIQQAT: Mavjud ma’lumotlar zaxiradagi holatga qaytariladi!"
read -p "Davom ettirasizmi? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Jarayon bekor qilindi."
    exit 0
fi

echo "🔄 Zaxiradan tiklash boshlandi..."

# Faylni konteynerga nusxalash
docker cp "${BACKUP_FILE}" mehr_postgres:/tmp/restore.dump

# Bazani tozalash va qayta tiklash
docker exec mehr_postgres pg_restore -U mehr_user -d mehr_db --clean --if-exists /tmp/restore.dump

# Vaqtinchalik faylni o‘chirish
docker exec mehr_postgres rm /tmp/restore.dump

echo "✅ MEHR AI ma’lumotlar bazasi muvaffaqiyatli qayta tiklandi!"

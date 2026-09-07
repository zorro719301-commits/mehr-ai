import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const getChildren = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (userRole === 'PARENT') {
      const parentProfile = await prisma.parentProfile.findUnique({
        where: { userId },
      });

      if (!parentProfile) {
        return res.json({ success: true, data: [] });
      }

      const links = await prisma.childParent.findMany({
        where: { parentId: parentProfile.id },
        include: {
          child: {
            include: {
              conditions: { include: { condition: true } },
              medicalProfile: true,
              packages: { orderBy: { createdAt: 'desc' }, take: 1 },
              assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
          },
        },
      });

      const children = links.map((l) => l.child);
      return res.json({ success: true, data: children });
    }

    // Specialist or Admin
    const children = await prisma.child.findMany({
      include: {
        conditions: { include: { condition: true } },
        medicalProfile: true,
        packages: { orderBy: { createdAt: 'desc' }, take: 1 },
        assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: children });
  } catch (error: any) {
    console.error('Error in getChildren:', error);
    return res.status(500).json({ success: false, error: 'Bolalar ro‘yxatini yuklashda xatolik' });
  }
};

export const getChildById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const child = await prisma.child.findUnique({
      where: { id },
      include: {
        parents: { include: { parent: { include: { user: true } } } },
        medicalProfile: true,
        conditions: { include: { condition: true } },
        assessments: {
          orderBy: { createdAt: 'desc' },
          include: { results: { include: { domain: true } } },
        },
        packages: {
          orderBy: { createdAt: 'desc' },
          include: {
            modules: { orderBy: { weekNumber: 'asc' } },
            dailyTasks: {
              orderBy: { dayNumber: 'asc' },
              include: { results: { orderBy: { date: 'desc' }, take: 1 } },
            },
          },
        },
        behaviorLogs: { orderBy: { timestamp: 'desc' }, take: 5 },
        consents: { orderBy: { grantedAt: 'desc' }, take: 1 },
      },
    });

    if (!child) {
      return res.status(404).json({ success: false, error: 'Bola topilmadi' });
    }

    return res.json({ success: true, data: child });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Bola profilini olishda xatolik' });
  }
};

export const createChild = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      region,
      school,
      grade,
      contactPhone,
      contactAddress,
      photoUrl,
      chiefComplaint,
      diagnosisDate,
      conditionIds = [],
      doctorConclusions,
      previousTreatment,
      priorTherapy,
      surgicalHistory,
      currentMedications,
      allergies,
      precautionsContraindications,
      epilepsy,
      vision,
      hearing,
      swallowing,
      sleep,
      pain,
      nutrition,
      orthosis,
      assistiveDevices,
      consentAgreed,
    } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !gender || !region) {
      return res.status(400).json({ success: false, error: 'Majburiy ma’lumotlarni to‘ldiring' });
    }

    let parentProfile = await prisma.parentProfile.findUnique({
      where: { userId },
    });

    if (!parentProfile && req.user?.role === 'PARENT') {
      parentProfile = await prisma.parentProfile.create({
        data: { userId: userId! },
      });
    }

    // Create child record with medical profile and parental consent
    const child = await prisma.child.create({
      data: {
        firstName,
        middleName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        region,
        school,
        grade,
        contactPhone,
        contactAddress,
        photoUrl,
        chiefComplaint,
        parents: parentProfile
          ? {
              create: {
                parentId: parentProfile.id,
                isPrimary: true,
                canManageConsent: true,
              },
            }
          : undefined,
        medicalProfile: {
          create: {
            doctorConclusions,
            previousTreatment,
            priorTherapy,
            surgicalHistory,
            currentMedications,
            allergies,
            precautionsContraindications,
            epilepsy,
            vision,
            hearing,
            swallowing,
            sleep,
            pain,
            nutrition,
            orthosis,
            assistiveDevices,
          },
        },
        conditions: {
          create: conditionIds.map((cId: string) => ({
            conditionId: cId,
            severity: 'MODERATE',
            diagnosedDate: diagnosisDate ? new Date(diagnosisDate) : undefined,
          })),
        },
        consents: {
          create: {
            parentUserId: userId!,
            consentType: 'DATA_PROCESSING_AND_AI_ASSISTANCE',
            consentText:
              'MEHR AI platformasida bolaning rivojlanish va tibbiy ma’lumotlarini tahlil qilish hamda individual reja shakllantirishga roziman.',
            isGranted: consentAgreed ?? true,
            ipAddress: req.ip || null,
          },
        },
      },
      include: {
        medicalProfile: true,
        conditions: { include: { condition: true } },
      },
    });

    return res.status(201).json({ success: true, data: child });
  } catch (error: any) {
    console.error('Error in createChild:', error);
    return res.status(500).json({ success: false, error: 'Bolani ro‘yxatdan o‘tkazishda xatolik yuz berdi' });
  }
};

export const updateMedicalProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;
    const {
      doctorConclusions,
      previousTreatment,
      priorTherapy,
      surgicalHistory,
      currentMedications,
      allergies,
      pastMedicalConditions,
      precautionsContraindications,
      epilepsy,
      vision,
      hearing,
      swallowing,
      sleep,
      pain,
      nutrition,
      orthosis,
      assistiveDevices,
    } = req.body;

    const data = {
      doctorConclusions,
      previousTreatment,
      priorTherapy,
      surgicalHistory,
      currentMedications,
      allergies,
      pastMedicalConditions,
      precautionsContraindications,
      epilepsy,
      vision,
      hearing,
      swallowing,
      sleep,
      pain,
      nutrition,
      orthosis,
      assistiveDevices,
    };

    const medicalProfile = await prisma.childMedicalProfile.upsert({
      where: { childId },
      update: data,
      create: { childId, ...data },
    });

    return res.json({ success: true, data: medicalProfile });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Tibbiy profilni yangilashda xatolik' });
  }
};

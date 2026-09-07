import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

// The 16-role MEHR AI taxonomy. "CHILD" is intentionally excluded — children are
// represented by the Child model, not a login-capable User account.
const VALID_STAFF_ROLES = ['SUPER_ADMIN', 'MEDICAL_ADMIN', 'SPECIALIST', 'PARENT', 'AUDITOR'];

export const getAdminMetrics = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalParents = await prisma.user.count({ where: { role: 'PARENT' } });
    const totalSpecialists = await prisma.user.count({ where: { role: 'SPECIALIST' } });
    const totalAdmins = await prisma.user.count({ where: { role: { in: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] } } });
    const totalAuditors = await prisma.user.count({ where: { role: 'AUDITOR' } });
    const totalChildren = await prisma.child.count();
    const totalPackages = await prisma.individualPackage.count();
    const totalAssessments = await prisma.assessment.count();
    const totalExercises = await prisma.exercise.count();
    const totalAacCards = await prisma.aacCard.count();

    // Regional breakdown
    const childrenByRegion = await prisma.child.groupBy({
      by: ['region'],
      _count: { id: true },
    });

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalParents,
        totalSpecialists,
        totalAdmins,
        totalAuditors,
        totalChildren,
        totalPackages,
        totalAssessments,
        totalExercises,
        totalAacCards,
        childrenByRegion,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Admin statistikasini olishda xatolik' });
  }
};

export const getConditions = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const conditions = await prisma.conditionOrDiagnosis.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { childConditions: true } } },
    });
    return res.json({ success: true, data: conditions });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Kasalliklar katalogini olishda xatolik' });
  }
};

export const createCondition = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, name, description, symptoms, riskSigns, recommendedSpecialists, defaultDurationDays = 30 } = req.body;

    if (!code || !name || !description) {
      return res.status(400).json({ success: false, error: 'Kod, nom va tavsif talab qilinadi' });
    }

    const condition = await prisma.conditionOrDiagnosis.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        description,
        symptoms: symptoms || '',
        riskSigns,
        recommendedSpecialists: recommendedSpecialists || 'LOGOPED,PSIXOLOG',
        defaultDurationDays: Number(defaultDurationDays),
      },
    });

    return res.status(201).json({ success: true, data: condition });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Yangi kasallik/holat qo‘shishda xatolik' });
  }
};

export const updateCondition = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, symptoms, riskSigns, recommendedSpecialists, defaultDurationDays, isActive } = req.body;

    const updated = await prisma.conditionOrDiagnosis.update({
      where: { id },
      data: {
        name,
        description,
        symptoms,
        riskSigns,
        recommendedSpecialists,
        defaultDurationDays: defaultDurationDays ? Number(defaultDurationDays) : undefined,
        isActive,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Kasallik/holatni yangilashda xatolik' });
  }
};

export const getAuditLogs = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { fullName: true, email: true, role: true } } },
    });
    return res.json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Audit loglarni olishda xatolik' });
  }
};

export const getAiLogs = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await prisma.aiRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { response: true, child: true },
    });
    return res.json({ success: true, data: requests });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'AI loglarni olishda xatolik' });
  }
};

export const getSpecialistTypes = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const types = await prisma.specialistType.findMany({ orderBy: { name: 'asc' } });
    return res.json({ success: true, data: types });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Mutaxassislik turlarini olishda xatolik' });
  }
};

export const getUsers = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        specialistProfile: { include: { specialistType: true } },
        parentProfile: true,
      },
    });
    return res.json({ success: true, data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Foydalanuvchilar ro‘yxatini olishda xatolik' });
  }
};

// Super Admin creates a login (email/password) for any of the 16 MEHR AI roles.
// This is the only way non-parent staff accounts get created — there is no public
// self-registration for staff in this platform.
export const createStaffUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      role,
      specialistTypeId,
      licenseNumber,
      institution,
      relationType,
      address,
    } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ success: false, error: 'Login, parol, F.I.Sh. va rol talab qilinadi' });
    }

    if (!VALID_STAFF_ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: `Noto‘g‘ri rol. Ruxsat etilgan: ${VALID_STAFF_ROLES.join(', ')}` });
    }

    if (role === 'SPECIALIST' && !specialistTypeId) {
      return res.status(400).json({ success: false, error: 'Mutaxassis uchun mutaxassislik turi (specialistTypeId) talab qilinadi' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Ushbu login bilan foydalanuvchi allaqachon mavjud' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName,
        phone,
        role,
        isActive: true,
        specialistProfile:
          role === 'SPECIALIST'
            ? { create: { specialistTypeId, licenseNumber, institution, isVerified: true } }
            : undefined,
        parentProfile:
          role === 'PARENT'
            ? { create: { relationType: relationType || 'MOTHER', address } }
            : undefined,
      },
      include: { specialistProfile: { include: { specialistType: true } }, parentProfile: true },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        specialistProfile: user.specialistProfile,
        parentProfile: user.parentProfile,
      },
    });
  } catch (error: any) {
    console.error('Error in createStaffUser:', error);
    return res.status(500).json({ success: false, error: 'Xodim hisobini yaratishda xatolik yuz berdi' });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, phone, role, isActive, password } = req.body;

    const dataToUpdate: any = {};
    if (fullName !== undefined) dataToUpdate.fullName = fullName;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (role !== undefined && VALID_STAFF_ROLES.includes(role)) dataToUpdate.role = role;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true },
    });

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Foydalanuvchini yangilashda xatolik yuz berdi' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, message: 'Foydalanuvchi muvaffaqiyatli o‘chirildi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Foydalanuvchini o‘chirishda xatolik yuz berdi' });
  }
};


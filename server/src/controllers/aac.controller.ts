import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const getAacCategoriesAndCards = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await prisma.aacCategory.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        cards: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'AAC kartochkalarini olishda xatolik' });
  }
};

export const createAacCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { categoryId, label, labelRu, labelEn, iconName = 'Square', imageUrl, audioKey } = req.body;

    if (!categoryId || !label) {
      return res.status(400).json({ success: false, error: 'Kategoriya va kartochka matni talab qilinadi' });
    }

    const card = await prisma.aacCard.create({
      data: {
        categoryId,
        label,
        labelRu,
        labelEn,
        iconName,
        imageUrl,
        audioKey: audioKey || label.toLowerCase(),
        isSystem: req.user?.role === 'ADMIN',
      },
    });

    return res.status(201).json({ success: true, data: card });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Yangi AAC kartochka qo‘shishda xatolik' });
  }
};

export const getChildBoard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;

    let board = await prisma.childAacBoard.findFirst({
      where: { childId, isDefault: true },
    });

    if (!board) {
      // Create default board with primary cards
      const defaultCards = await prisma.aacCard.findMany({ take: 12 });
      const cardIds = defaultCards.map((c) => c.id);

      board = await prisma.childAacBoard.create({
        data: {
          childId,
          name: 'Mening AAC Doskam',
          cardIdsJson: JSON.stringify(cardIds),
          isDefault: true,
        },
      });
    }

    const cardIds: string[] = JSON.parse(board.cardIdsJson || '[]');
    const cards = await prisma.aacCard.findMany({
      where: { id: { in: cardIds } },
      include: { category: true },
    });

    return res.json({
      success: true,
      data: {
        board,
        cards,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Bola AAC doskasini olishda xatolik' });
  }
};

export const updateChildBoard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;
    const { cardIds } = req.body;

    const board = await prisma.childAacBoard.upsert({
      where: { id: req.body.boardId || 'default' },
      update: {
        cardIdsJson: JSON.stringify(cardIds || []),
      },
      create: {
        childId,
        name: req.body.name || 'Mening AAC Doskam',
        cardIdsJson: JSON.stringify(cardIds || []),
        isDefault: true,
      },
    });

    return res.json({ success: true, data: board });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'AAC doskasini saqlashda xatolik' });
  }
};

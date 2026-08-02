import { Router, Request, Response, NextFunction } from 'express';
import { COSMETIC_CATALOG } from '../../lib/avatar';

const router = Router();

const mockUserAvatarStore = new Map<string, { equipped: Record<string, string>; owned: string[] }>();

router.get('/catalog', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: COSMETIC_CATALOG,
  });
});

router.get('/:uid', (req: Request, res: Response) => {
  const { uid } = req.params;
  const userAvatar = mockUserAvatarStore.get(uid) || {
    equipped: { base: 'b1', head: 'h1', apparel: 'a1' },
    owned: ['b1', 'h1', 'a1'],
  };

  res.json({
    success: true,
    data: {
      uid,
      equipped: userAvatar.equipped,
      owned: userAvatar.owned,
    },
  });
});

router.post('/equip', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid = 'default_user', base, head, apparel, accessory } = req.body;
    const current = mockUserAvatarStore.get(uid) || {
      equipped: { base: 'b1', head: 'h1', apparel: 'a1' },
      owned: ['b1', 'h1', 'a1'],
    };

    if (base) current.equipped.base = base;
    if (head) current.equipped.head = head;
    if (apparel) current.equipped.apparel = apparel;
    if (accessory) current.equipped.accessory = accessory;

    mockUserAvatarStore.set(uid, current);

    res.json({
      success: true,
      data: {
        equipped: current.equipped,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

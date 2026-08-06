// src/entities/item/api/itemApi.ts
import type { IItem } from '../../../shared/api/types';
// import { apiClient } from '../../../shared/api/client';

// Items organized by user (authorId)
// Each user has their own unique items with specific wishes
export const mockItems: IItem[] = [
  // === Alex_Dev (id: 1) items ===
  {
    id: 102,
    title: 'Игровая приставка PS5',
    description: 'Полный комплект, 2 геймпада, 3 диска в подарок. Без царапин.',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
    images: [
        'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
        'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80'
    ],
    category: 'Электроника',
    quantity: 1,
    unit: 'шт',
    authorId: 1,
    holderId: 1,
    isLocked: false,
    createdAt: '2026-08-02T12:00:00Z',
    wishes: ['Смартфон', 'Наушники'],
  },
  {
    id: 107,
    title: 'Кофемашина',
    description: 'Автоматическая, делает капучино. Требует чистки от накипи.',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80'],
    category: 'Бытовая техника',
    quantity: 1,
    unit: 'шт',
    authorId: 1, // Alex's coffee machine
    holderId: 1,
    isLocked: false,
    createdAt: '2026-08-05T08:00:00Z',
    wishes: ['Книги', 'Винил'],
  },

  // === Dima_Biker (id: 2) items ===
  {
    id: 101,
    title: 'Велосипед горный',
    description: 'Хорошее состояние, 21 скорость. Идеален для города. Торг уместен при быстром обмене.',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_z4VgQKopNA_8vUS1LOGJ_UFbohFi7gYI_TuzfNMtlYQW4GaRnZn9xf4&s=10',
    images: [
        'https://pro-bike.ru/data/images/posts/32/40932/am9a8836-edit-285f332.jpg',
        'https://images.unsplash.com/photo-1576435728678-38d01d12e3b5?w=800&q=80',
        'https://images.unsplash.com/photo-1511994298220-412704691162?w=800&q=80'
    ],
    category: 'Спорт',
    quantity: 1,
    unit: 'шт',
    authorId: 2,
    holderId: 1, // Transferred to Alex
    isLocked: false,
    createdAt: '2026-08-01T10:00:00Z',
    wishes: ['Апельсины', 'Лодка', 'Гитара'],
  },
  {
    id: 201,
    title: 'Мотоциклетный шлем',
    description: 'Полная защита, размер L. Новый, в коробке.',
    imageUrl: 'https://images.unsplash.com/photo-1591635566279-7838f5f075ae?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1591635566279-7838f5f075ae?w=800&q=80'],
    category: 'Мототехника',
    quantity: 1,
    unit: 'шт',
    authorId: 2,
    holderId: 2,
    isLocked: false,
    createdAt: '2026-08-03T14:00:00Z',
    wishes: ['Кофемашина', 'Футболка'],
  },

  // === Max_Gamer (id: 3) items ===
  {
    id: 301,
    title: 'Игровой монитор 27"',
    description: '144Hz, 1ms, G-Sync. Идеален для игр.',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80'],
    category: 'Электроника',
    quantity: 1,
    unit: 'шт',
    authorId: 3,
    holderId: 3,
    isLocked: false,
    createdAt: '2026-08-04T09:00:00Z',
    wishes: ['Игры PS5', 'Клавиатура'],
  },
  {
    id: 302,
    title: 'Геймерское кресло',
    description: 'С подсветкой, регулировкой высоты. Ортопедическое.',
    imageUrl: 'https://images.unsplash.com/photo-1598550476439-c948388916ea?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1598550476439-c948388916ea?w=800&q=80'],
    category: 'Мебель',
    quantity: 1,
    unit: 'шт',
    authorId: 3,
    holderId: 3,
    isLocked: false,
    createdAt: '2026-08-04T10:00:00Z',
    wishes: ['Монитор', 'Мышь'],
  },

  // === Photo_Master (id: 4) items ===
  {
    id: 109,
    title: 'Коллекция книг',
    description: 'Фантастика, 20 томов в отличном состоянии. Азимов, Лем, Брэдбери.',
    imageUrl: 'https://s0.rbk.ru/v6_top_pics/media/img/0/73/347151579745730.webp',
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80'],
    category: 'Книги',
    quantity: 20,
    unit: 'шт',
    authorId: 4,
    holderId: 4,
    isLocked: false,
    createdAt: '2026-08-05T12:00:00Z',
    wishes: ['Кофемашина', 'Чайный сервиз'],
  },
  {
    id: 401,
    title: 'Фотоаппарат Canon EOS',
    description: 'Полупрофессиональный, с объективом 50mm. Отличное состояние.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'],
    category: 'Фотография',
    quantity: 1,
    unit: 'шт',
    authorId: 4,
    holderId: 4,
    isLocked: false,
    createdAt: '2026-08-05T15:00:00Z',
    wishes: ['Штатив', 'Сумка для камеры'],
  },

  // === Music_Lover (id: 5) items ===
  {
    id: 108,
    title: 'Палатка 4-местная',
    description: 'Для кемпинга, водонепроницаемая. Использовали 2 раза.',
    imageUrl: 'https://www.shibargan.ru/wp-content/uploads/2025/08/armejskaja-dvuhslojnaja-vsesezonnaja-palatka-m-10-11.jpg',
    category: 'Туризм',
    quantity: 1,
    unit: 'шт',
    authorId: 5, // Changed from 3 to 5
    holderId: 5,
    isLocked: false,
    createdAt: '2026-08-05T10:00:00Z',
    wishes: ['Гитара', 'Укулеле'],
  },
  {
    id: 110,
    title: 'Скейтборд',
    description: 'Профессиональная доска, колеса мягкие.',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO7nc6o6b3b68E7tSxFmMqhL4lCP3fcWuCf1KtG8mSMMxPhFYy0noobXaU&s=10',
    category: 'Спорт',
    quantity: 1,
    unit: 'шт',
    authorId: 5,
    holderId: 5,
    isLocked: false,
    createdAt: '2026-08-05T14:00:00Z',
    wishes: ['Защита', 'Кроссовки'],
  },
  {
    id: 501,
    title: 'Виниловый проигрыватель',
    description: 'Ретро стиль, USB оцифровка. Комплект пластинок в подарок.',
    imageUrl: 'https://images.unsplash.com/photo-1563351989-32234e6c3ac8?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1563351989-32234e6c3ac8?w=800&q=80'],
    category: 'Музыка',
    quantity: 1,
    unit: 'шт',
    authorId: 5,
    holderId: 5,
    isLocked: false,
    createdAt: '2026-08-06T11:00:00Z',
    wishes: ['Виниловые пластинки', 'Наушники'],
  },
];

// Helper function to get items by userId
export const getItemsByUserId = (userId: number): IItem[] => {
  return mockItems.filter(item => item.authorId === userId);
};

// Helper function to get available items for exchange (not locked, owned by user)
export const getAvailableItemsForUser = (userId: number): IItem[] => {
  return mockItems.filter(item => item.authorId === userId && !item.isLocked);
};

export const itemApi = {
  getMyItems: async (userId?: number): Promise<IItem[]> => {
    await new Promise(r => setTimeout(r, 300));
    if (userId) {
      return getItemsByUserId(userId);
    }
    // For backward compatibility, return all items if no userId provided
    return mockItems;
  },

  createItem: async (data: Partial<IItem>): Promise<IItem> => {
    await new Promise(r => setTimeout(r, 500));
    // Добавляем новый товар в начало массива (локально)
    const newItem = {
      ...mockItems[0],
      ...data,
      id: Date.now(),
      authorId: data.authorId || 1, // Use provided authorId or default
      holderId: data.holderId || data.authorId || 1,
      isLocked: false,
      createdAt: new Date().toISOString()
    } as IItem;

    mockItems.unshift(newItem); // Добавляем в мок, чтобы он появился в списке
    return newItem;
  },

  searchItems: async (query: string): Promise<IItem[]> => {
    console.log(`Searching: ${query}`);
    await new Promise(r => setTimeout(r, 300));
    return mockItems.filter(i =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
    );
  },

  transferRight: async (itemId: number, toUserId: number): Promise<void> => {
    console.log(`CHOWN: Item ${itemId} -> User ${toUserId}`);
    await new Promise(r => setTimeout(r, 500));
  },

  addWish: async (itemId: number): Promise<void> => {
    console.log(`Adding wish for item: ${itemId}`);
    await new Promise(r => setTimeout(r, 300));
  }
};
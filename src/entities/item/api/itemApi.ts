// src/entities/item/api/itemApi.ts
import type { IItem } from '../../../shared/api/types';
// import { apiClient } from '../../../shared/api/client'; 

// Расширенный список моковых данных (10 товаров)
export const mockItems: IItem[] = [
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
    holderId: 1, 
    isLocked: false,
    createdAt: '2026-08-01T10:00:00Z',
    wishes: ['Апельсины', 'Лодка', 'Гитара'], // Дима хочет апельсины
  },
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
    isLocked: true,
    createdAt: '2026-08-02T12:00:00Z',
    wishes: ['Смартфон', 'Наушники'],
  },
  // ... остальные товары можно оставить без wishes для краткости, или добавить по желанию ...
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
    id: 107,
    title: 'Кофемашина',
    description: 'Автоматическая, делает капучино. Требует чистки от накипи.',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80'],
    category: 'Бытовая техника',
    quantity: 1,
    unit: 'шт',
    authorId: 1, // Твоя кофемашина
    holderId: 1,
    isLocked: false,
    createdAt: '2026-08-05T08:00:00Z',
    wishes: ['Книги', 'Винил'],
  },
  {
    id: 108,
    title: 'Палатка 4-местная',
    description: 'Для кемпинга, водонепроницаемая. Использовали 2 раза.',
    imageUrl: 'https://www.shibargan.ru/wp-content/uploads/2025/08/armejskaja-dvuhslojnaja-vsesezonnaja-palatka-m-10-11.jpg',
    category: 'Туризм',
    quantity: 1,
    unit: 'шт',
    authorId: 3,
    holderId: 3,
    isLocked: false,
    createdAt: '2026-08-05T10:00:00Z',
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
  },
];

export const itemApi = {
  getMyItems: async (): Promise<IItem[]> => {
    await new Promise(r => setTimeout(r, 300));
    return mockItems;
  },

  createItem: async (data: Partial<IItem>): Promise<IItem> => {
    await new Promise(r => setTimeout(r, 500));
    // Добавляем новый товар в начало массива (локально)
    const newItem = { 
      ...mockItems[0], 
      ...data, 
      id: Date.now(),
      authorId: 1, // Текущий юзер
      holderId: 1,
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
// src/pages/exchange-page/ExchangePage.tsx
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChainVisualizer } from '../../widgets/chain-visualizer/ui/ChainVisualizer';
import type { IExchangeDeal } from '../../shared/api/types';
import { DealStatus, ChainLinkStatus, LogisticsStatus } from '../../shared/api/types';
import { mockUsers } from '../../entities/user/api/userApi';
import { mockItems } from '../../entities/item/api/itemApi';

export const ExchangePage = () => {
  const { dealId } = useParams();
  const [deal, setDeal] = useState<IExchangeDeal | null>(null);
  const [currentUserId] = useState(1); // ID Alex_Dev

// ... внутри ExchangePage ...
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockDeal: IExchangeDeal = {
        id: dealId || 'deal-101',
        status: DealStatus.CONFIRMING,
        deadline: '2026-08-11T23:59:59Z',
        initiatorId: 3,
        chain: [
          // 1. Саша (Max_Gamer в моке пользователей, но пусть будет Саша по логике)
          // Саша имеет Апельсин, хочет Велосипед. Отдает Апельсин Мне.
          {
            userId: 3,
            user: { ...mockUsers[3], username: 'Sasha_Owner' }, // Переименуем для наглядности
            status: ChainLinkStatus.ACCEPTED,
            givingItemId: 111, // Апельсин
            givingItem: {
                id: 111, title: 'Апельсин', description: 'Сладкий', imageUrl: 'https://placehold.co/100/orange/white?text=Orange',
                category: 'Еда', quantity: 1, unit: 'кг', authorId: 3, holderId: 3, isLocked: false, createdAt: ''
            },
            logisticsStatus: LogisticsStatus.NONE,
          },
          // 2. Я (Alex_Dev)
          // Я имею Лодку, хочу Апельсин. Отдаю Лодку Максиму.
          {
            userId: 1,
            user: mockUsers[1],
            status: ChainLinkStatus.PENDING,
            givingItemId: 112, // Лодка
            givingItem: {
                id: 112, title: 'Лодка ПВХ', description: 'Надувная', imageUrl: 'https://placehold.co/100/blue/white?text=Boat',
                category: 'Спорт', quantity: 1, unit: 'шт', authorId: 1, holderId: 1, isLocked: false, createdAt: ''
            },
            logisticsStatus: LogisticsStatus.NONE,
          },
          // 3. Максим (Dima_Biker в моке, пусть будет Максим)
          // Максим имеет Велосипед, хочет Лодку. Отдает Велосипед Саше.
          {
            userId: 2,
            user: { ...mockUsers[2], username: 'Max_Biker' },
            status: ChainLinkStatus.WAITING,
            givingItemId: 101, // Велосипед
            givingItem: mockItems.find(i => i.id === 101) || mockItems[0],
            logisticsStatus: LogisticsStatus.NONE,
          }
        ]
      };
      setDeal(mockDeal);
    }, 500);

    return () => clearTimeout(timer);
  }, [dealId]);

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00AAFF]"></div>
        <p className="text-gray-500">Загрузка схемы обмена...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/exchange/active" className="hover:text-[#00AAFF]">Мои обмены</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Сделка #{deal.id}</span>
      </div>

      <ChainVisualizer
        deal={deal}
        currentUserId={currentUserId}
      />

      <div className="bg-white p-6 rounded-xl border border-gray-200 opacity-60 grayscale pointer-events-none relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50/50 z-10 flex items-center justify-center">
           <span className="bg-white px-3 py-1 rounded shadow-sm text-xs font-bold text-gray-500 border border-gray-200">
             Логистика начнется после подтверждения всех участников
           </span>
        </div>
        <h3 className="font-bold text-gray-900 mb-6">Трекинг ПВЗ</h3>
        <div className="flex justify-between text-sm text-gray-500 px-4">
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">📦</div>
                <span>Сдача в ПВЗ</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mt-5 mx-4"></div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">🔍</div>
                <span>Проверка</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mt-5 mx-4"></div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">🏁</div>
                <span>Получение</span>
            </div>
        </div>
      </div>
    </div>
  );
};
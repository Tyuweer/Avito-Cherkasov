// src/pages/home-page/HomePage.tsx
import { useEffect, useState } from 'react';
import { ItemCard } from '../../entities/item/ui/ItemCard';
import { itemApi } from '../../entities/item/api/itemApi';
import type { IItem } from '../../shared/api/types';
import { useAuthStore } from '../../app/hooks/useAuthStore';

export const HomePage = () => {
  const authStore = useAuthStore();
  const currentUserId = authStore.user?.id;

  const [items, setItems] = useState<IItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState<IItem[]>([]);

  const loadItems = () => {
    itemApi.getMyItems().then(data => {
      let filtered: IItem[];

      if (currentUserId !== undefined && currentUserId !== null) {
        // Пользователь авторизован - применяем логику видимости:
        // 1. Скрываем товары, где isLocked === true И holderId !== currentUserId (товары в сделке, не принадлежащие мне)
        // 2. Показываем товары, где !isLocked (свободные товары для обмена)
        // Свои товары (authorId === currentUserId или holderId === currentUserId) показываем только в профиле
        filtered = data.filter(i => {
          // Если товар заблокирован и я не держатель права - скрываем
          if (i.isLocked && i.holderId !== currentUserId) {
            return false;
          }
          // Свои товары и товары с исключительным правом скрываем из поиска (они в профиле)
          if (i.authorId === currentUserId || i.holderId === currentUserId) {
            return false;
          }
          // Показываем только свободные товары других пользователей
          return true;
        });
      } else {
        // Пользователь не авторизован - показываем все незаблокированные товары
        filtered = data.filter(i => !i.isLocked);
      }

      setAllItems(filtered);
      setItems(filtered); // Изначально показываем все доступные
    });
  };

  useEffect(() => {
    loadItems();
  }, [currentUserId]);

  const handleSearch = () => {
    // Убрали setHasSearched(true);
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      // Если поиск пустой - возвращаем все товары
      setItems(allItems);
      return;
    }

    // Фильтрация
    const results = allItems.filter(i =>
      i.title.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query)
    );
    setItems(results);
  };

  return (
    <div className="space-y-8 w-full pb-20">

      {/* Hero Search */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 w-full flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">Найти обмен</h1>

        {/* Принудительное центрирование текста */}
        <p className="text-gray-500 mb-8 max-w-2xl text-center mx-auto">
          Введите название товара, который вы хотите получить, или смотрите все доступные варианты ниже.
        </p>

        <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Например: Велосипед, Апельсин..."
            className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00AAFF] focus:border-transparent text-lg shadow-inner text-center sm:text-left"
          />
          <button
            onClick={handleSearch}
            className="px-10 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Найти
          </button>
        </div>
      </div>

      {/* Результаты */}
      <div className="w-full">
          <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-bold text-gray-900">
                  {searchQuery ? `Результаты: "${searchQuery}"` : 'Все доступные обмены'}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Найдено: {items.length}
              </span>
          </div>

          {items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
                  {items.map(item => (
                      <ItemCard key={item.id} item={item} />
                  ))}
              </div>
          ) : (
              // Блок "Ничего не найдено"
              <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 w-full flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4 opacity-50">🔍</div>
                  <p className="text-xl font-bold text-gray-600 mb-2">Ничего не найдено</p>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                      По вашему запросу "{searchQuery}" нет товаров. Попробуйте изменить название или добавьте свой товар в профиле, чтобы запустить цепочку.
                  </p>
                  <button
                    onClick={() => {setSearchQuery(''); setItems(allItems);}}
                    className="mt-6 text-[#00AAFF] font-medium hover:underline"
                  >
                      Сбросить поиск
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};
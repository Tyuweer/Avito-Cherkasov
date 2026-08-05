// src/pages/profile-page/ProfilePage.tsx
import { useState, useEffect } from "react";
import { useStore } from "../../app/providers/StoreProvider";
import { ItemCard } from "../../entities/item/ui/ItemCard";
import { itemApi } from "../../entities/item/api/itemApi";
import type { IItem } from "../../shared/api/types";
import { useNavigate } from "react-router-dom";
import { CreateItemForm } from "../../features/create-item/ui/CreateItemForm";

type Tab = "items" | "wishes" | "deals" | "settings";

export const ProfilePage = () => {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("items");
  const [myItems, setMyItems] = useState<IItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Мок пожеланий
  const [myWishes, setMyWishes] = useState<string[]>([
    "Велосипед",
    "Апельсины",
  ]);

  useEffect(() => {
    itemApi.getMyItems().then((items) => {
      // ИСПРАВЛЕНИЕ: Фильтруем по holderId (кто распоряжается), а не по authorId (кто создал)
      // Теперь тут будут и свои товары, и те, на которые вам передали право (Велосипед)
      setMyItems(items.filter((i) => i.holderId === 1));
    });
  }, []);

  const handleItemCreated = () => {
    setIsCreateModalOpen(false);
    itemApi
      .getMyItems()
      .then((items) => setMyItems(items.filter((i) => i.holderId === 1))); // Тут тоже меняем
  };

  const handleAddWish = () => {
    const newWish = prompt("Что вы хотите найти?");
    if (newWish) {
      setMyWishes([...myWishes, newWish]);
    }
  };

  if (!currentUser)
    return <div className="p-10 text-center">Загрузка профиля...</div>;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Шапка профиля */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-blue-100 text-[#00AAFF] flex items-center justify-center text-3xl font-bold shrink-0 shadow-inner">
          {currentUser.username.charAt(0)}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentUser.username}
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded">
              ★ {currentUser.rating}
            </span>
            <span className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded">
              ⚠ Отказов: {currentUser.declineCount}
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span
              className="truncate max-w-[200px] sm:max-w-none"
              title={currentUser.pvzAddress}
            >
              📍 {currentUser.pvzAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto pb-px scrollbar-hide">
        {(["items", "wishes", "deals", "settings"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "bg-white text-[#00AAFF] border border-b-0 border-gray-200 shadow-sm -mb-px z-10"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab === "items" && "Мои предметы"}
            {tab === "wishes" && "Мои пожелания"}
            {tab === "deals" && "Мои сделки"}
            {tab === "settings" && "Настройки"}
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="bg-white p-6 rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-200 min-h-[500px]">
        {/* Вкладка: Мои предметы */}
        {activeTab === "items" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Ваши товары и права
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-[#00AAFF] text-white rounded-lg text-sm font-medium hover:bg-[#0095E0] transition-colors shadow-sm flex items-center gap-2"
              >
                <span>+</span> Добавить предмет
              </button>
            </div>

            {myItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myItems.map((item) => (
                  <div key={item.id} className="relative group flex flex-col">
                    {item.authorId !== 1 && (
                      <div className="absolute -top-3 left-2 z-20 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 pointer-events-none">
                        <span>⚡</span> Исключительное право
                      </div>
                    )}
                    <div
                      className={`
                            bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col
                            ${item.authorId !== 1 ? "border-purple-200 ring-1 ring-purple-100" : "border-gray-200"}
                        `}
                    >
                      <ItemCard item={item} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl">
                  📦
                </div>
                <p>У вас пока нет товаров</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-[#00AAFF] text-sm font-medium hover:underline"
                >
                  Добавить первый товар
                </button>
              </div>
            )}
          </div>
        )}

        {/* Вкладка: Мои пожелания */}
        {activeTab === "wishes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Что я ищу</h2>
              <button
                onClick={handleAddWish}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                + Добавить пожелание
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {myWishes.map((wish, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between group hover:shadow-md transition-shadow"
                >
                  <span className="font-medium text-blue-900">{wish}</span>
                  <button
                    onClick={() =>
                      setMyWishes(myWishes.filter((_, i) => i !== idx))
                    }
                    className="text-blue-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {myWishes.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-400">
                  Список пуст. Добавьте то, что хотите найти.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Вкладка: Мои сделки */}
        {activeTab === "deals" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-gray-900">
                Активные обмены
              </h2>
            </div>

            <div
              onClick={() => navigate("/exchange/deal-101")}
              className="group bg-white hover:bg-blue-50/30 p-6 rounded-2xl border border-gray-200 hover:border-[#00AAFF] transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
            >
              <div className="flex items-center gap-4 flex-1 w-full sm:w-auto justify-center sm:justify-start">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 shadow-inner">
                    <img
                      src="https://placehold.co/100/blue/white?text=Boat"
                      alt="Лодка"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Отдаете
                  </span>
                  <span className="text-sm font-bold text-gray-900 text-center leading-tight max-w-[100px] truncate">
                    Лодка ПВХ
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center px-2">
                  <div className="text-2xl text-[#00AAFF] animate-pulse">⇄</div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    Обмен
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-green-100 bg-green-50 shadow-inner">
                    <img
                      src="https://placehold.co/100/orange/white?text=Orange"
                      alt="Апельсин"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                    Получаете
                  </span>
                  <span className="text-sm font-bold text-gray-900 text-center leading-tight max-w-[100px] truncate">
                    Апельсин
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase border border-yellow-200">
                    Подтверждение
                  </span>
                </div>
                <div className="text-sm text-gray-500 text-center sm:text-right">
                  Участников: <span className="font-bold text-gray-900">3</span>{" "}
                  • Дедлайн:{" "}
                  <span className="font-bold text-gray-900">11 авг</span>
                </div>
                <button className="mt-1 px-6 py-2.5 bg-gray-100 group-hover:bg-[#00AAFF] group-hover:text-white text-gray-700 rounded-xl text-sm font-bold transition-all w-full sm:w-auto shadow-sm">
                  Подробнее о цепочке
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Вкладка: Настройки */}
        {activeTab === "settings" && (
          <div className="max-w-md space-y-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Настройки аккаунта
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  defaultValue={currentUser.username}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес ПВЗ
                </label>
                <input
                  type="text"
                  defaultValue={currentUser.pvzAddress}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] outline-none"
                />
              </div>
            </div>
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
              Сохранить
            </button>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <CreateItemForm
            onSuccess={handleItemCreated}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

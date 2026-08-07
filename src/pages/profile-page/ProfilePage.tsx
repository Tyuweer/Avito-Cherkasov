// src/pages/profile-page/ProfilePage.tsx
import { useState, useEffect } from "react";
import { useAuthStore } from "../../app/hooks/useAuthStore";
import { ItemCard } from "../../entities/item/ui/ItemCard";
import { itemApi, mockItems } from "../../entities/item/api/itemApi";
import type { IItem } from "../../shared/api/types";
import { useNavigate } from "react-router-dom";
import { CreateItemForm } from "../../features/create-item/ui/CreateItemForm";
import { AuthModal } from "../../features/auth/ui/AuthModal";
import { SuccessSticker } from "../../shared/ui/SuccessSticker";

type Tab = "items" | "wishes" | "deals" | "settings";

export const ProfilePage = () => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("items");
  const [myItems, setMyItems] = useState<IItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<{ open: boolean; itemId?: number }>({ open: false });
  const [showSuccessSticker, setShowSuccessSticker] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Settings form state
  const [newUsername, setNewUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Use authStore user for profile data
  const currentUser = authStore.user;

  // Мок пожеланий
  const [myWishes, setMyWishes] = useState<string[]>([
    "Велосипед",
    "Апельсины",
  ]);

  useEffect(() => {
    if (currentUser) {
      itemApi.getMyItems().then((items) => {
        // ИСПРАВЛЕНИЕ: Фильтруем по holderId (кто распоряжается), а не по authorId (кто создал)
        // Теперь тут будут и свои товары, и те, на которые вам передали право (Велосипед)
        setMyItems(items.filter((i) => i.holderId === currentUser.id));
      });
      setNewUsername(currentUser.username);
      setAvatarUrl(currentUser.avatarUrl || "");
    }
  }, [currentUser?.id]);

  const handleItemCreated = () => {
    setIsCreateModalOpen(false);
    if (currentUser) {
      itemApi
        .getMyItems()
        .then((items) => setMyItems(items.filter((i) => i.holderId === currentUser.id)));
    }
  };

  const handleDeleteItem = (itemId: number) => {
    // Check if item exists and belongs to user
    const item = mockItems.find(i => i.id === itemId);
    if (!item) return;

    // Cannot delete items with exclusive rights (authorId !== holderId)
    if (item.authorId !== item.holderId) {
      alert("Нельзя удалить товар с исключительным правом. Сначала нужно вернуть право владельцу или дождаться отмены сделки.");
      return;
    }

    // Cannot delete items that are part of an active deal
    if (item.isLocked) {
      alert("Нельзя удалить товар, который участвует в активной сделке. Дождитесь завершения или отмены сделки.");
      return;
    }

    // Remove from mockItems
    const index = mockItems.findIndex(i => i.id === itemId);
    if (index !== -1) {
      mockItems.splice(index, 1);
      // Update state
      setMyItems(myItems.filter(i => i.id !== itemId));
    }
    setIsDeleteModalOpen({ open: false });
  };

  const handleAddWish = (wishText: string) => {
    if (wishText.trim()) {
      setMyWishes([...myWishes, wishText.trim()]);
      setIsWishModalOpen(false);
    }
  };

  const handleRemoveWish = (idx: number) => {
    setMyWishes(myWishes.filter((_, i) => i !== idx));
  };

  const handleSaveSettings = async () => {
    setSettingsError("");
    setSettingsSuccess("");

    if (!currentUser) {
      setSettingsError("Пользователь не авторизован");
      return;
    }

    // Validate password change
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setSettingsError("Новые пароли не совпадают");
        return;
      }
      if (newPassword.length < 6) {
        setSettingsError("Новый пароль должен быть не менее 6 символов");
        return;
      }
      if (!oldPassword) {
        setSettingsError("Введите старый пароль для смены пароля");
        return;
      }
    }

    const success = await authStore.changeProfile(
      oldPassword || undefined,
      newPassword || undefined,
      newUsername !== currentUser.username ? newUsername : undefined,
      avatarUrl !== currentUser.avatarUrl ? avatarUrl : undefined
    );

    if (success) {
      // Показываем красивый стикер успеха вместо текста
      setSuccessMessage(avatarUrl && avatarUrl !== currentUser.avatarUrl
        ? "Аватарка обновлена!"
        : "Профиль успешно обновлен!");
      setShowSuccessSticker(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSettingsSuccess("");
    } else {
      setSettingsError(authStore.error || "Ошибка обновления профиля");
    }
  };

  // Redirect to home if not authenticated
  if (!currentUser) {
    navigate("/");
    return <div className="p-10 text-center">Загрузка профиля...</div>;
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Шапка профиля */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-blue-100 text-[#00AAFF] flex items-center justify-center text-3xl font-bold shrink-0 shadow-inner overflow-hidden">
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            currentUser.username.charAt(0)
          )}
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
                {myItems.map((item) => {
                  const originalOwner = item.authorId !== item.holderId;
                  return (
                    <div key={item.id} className="relative group flex flex-col">
                      {originalOwner && (
                        <div className="absolute -top-3 left-2 z-20 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 pointer-events-none">
                          <span>⚡</span> Исключительное право
                        </div>
                      )}
                      <div
                        className={`
                              bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col
                              ${originalOwner ? "border-purple-200 ring-1 ring-purple-100" : "border-gray-200"}
                          `}
                      >
                        <div className="relative">
                          <ItemCard item={item} />
                          {!originalOwner && !item.isLocked && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleteModalOpen({ open: true, itemId: item.id });
                              }}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              title="Удалить предмет"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                onClick={() => setIsWishModalOpen(true)}
                className="px-4 py-2 bg-[#00AAFF] text-white rounded-lg text-sm font-medium hover:bg-[#0095E0] transition-colors shadow-sm flex items-center gap-2"
              >
                <span>+</span> Добавить пожелание
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
                    onClick={() => handleRemoveWish(idx)}
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

            {settingsSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-600">{settingsSuccess}</p>
              </div>
            )}

            {settingsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{settingsError}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Avatar section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Аватар пользователя
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      newUsername.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="URL аватара (необязательно)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] outline-none text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Оставьте пустым, чтобы использовать инициалы</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAvatarUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="mt-2 text-sm text-[#00AAFF] hover:text-[#0095E0] font-medium"
                >
                  📷 Загрузить с устройства
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Смена пароля</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Старый пароль
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Введите старый пароль"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Введите новый пароль"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Подтверждение нового пароля
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите новый пароль"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={authStore.isLoading}
              className="px-6 py-2.5 bg-[#00AAFF] text-white rounded-lg text-sm font-medium hover:bg-[#0095E0] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {authStore.isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Create Item Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <CreateItemForm
            onSuccess={handleItemCreated}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </div>
      )}

      {/* Wish Modal */}
      {isWishModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Добавить пожелание</h3>
              <button
                onClick={() => setIsWishModalOpen(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements[0] as HTMLInputElement);
                handleAddWish(input.value);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Что вы хотите найти?
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Например: Велосипед, Книги, Кофемашина..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00AAFF] outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsWishModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#00AAFF] text-white rounded-xl text-sm font-medium hover:bg-[#0095E0] transition-colors"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal for unauthenticated users */}
      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen.open && isDeleteModalOpen.itemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                ⚠️
              </div>
              <h3 className="text-lg font-bold text-gray-900">Удаление предмета</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить этот предмет? Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen({ open: false })}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isDeleteModalOpen.itemId) {
                    handleDeleteItem(isDeleteModalOpen.itemId);
                    setIsDeleteModalOpen({ open: false });
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Sticker for profile update */}
      <SuccessSticker
        message={successMessage}
        isVisible={showSuccessSticker}
        onClose={() => setShowSuccessSticker(false)}
        duration={2500}
      />
    </div>
  );
};
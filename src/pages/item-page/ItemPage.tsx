// src/pages/item-page/ItemPage.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { mockItems } from '../../entities/item/api/itemApi';
import { mockUsers } from '../../entities/user/api/userApi';
import type { IItem } from '../../shared/api/types';
import { UserBadge } from '../../entities/user/ui/UserBadge';
import { JoinChainModal } from '../../features/join-chain/ui/JoinChainModal';
import { useAuthStore } from '../../app/hooks/useAuthStore';
import { getAvailableItemsForUser } from '../../entities/item/api/itemApi';

export const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [item, setItem] = useState<IItem | null>(null);
  const [mainImage, setMainImage] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const currentUser = authStore.user;
  const isAuthenticated = authStore.isAuthenticated;

  // Get user's available items for exchange
  const myAvailableItems = currentUser ? getAvailableItemsForUser(currentUser.id) : [];
  const hasItemsToExchange = myAvailableItems.length > 0;

  useEffect(() => {
    const found = mockItems.find(i => i.id === Number(id));
    if (found) {
      setItem(found);
      setMainImage(found.images?.[0] || found.imageUrl);
    }
  }, [id]);

  if (!item) return <div className="p-10 text-center">Товар не найден</div>;

  const owner = mockUsers[item.authorId];

  // Check if I have what the owner wants (for direct exchange)
  const hasDesiredItem = item.wishes?.some(wish =>
    myAvailableItems.some(myItem =>
      myItem.title.toLowerCase().includes(wish.toLowerCase()) ||
      wish.toLowerCase().includes(myItem.title.toLowerCase())
    )
  );

  const handleDirectExchange = () => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в аккаунт чтобы предложить обмен');
      return;
    }
    if (hasDesiredItem) {
        alert('Заявка на прямой обмен отправлена! Владелец получил уведомление.');
    } else {
        setIsJoinModalOpen(true);
    }
  };

  const handleJoinChain = () => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в аккаунт чтобы встать в цепочку');
      return;
    }
    if (!hasItemsToExchange) {
      alert('У вас нет товаров для обмена. Добавьте товар в профиле чтобы участвовать в цепочке.');
      return;
    }
    setIsJoinModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-500 hover:text-[#00AAFF] flex items-center gap-1 transition-colors">
        ← Назад к поиску
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* Left column: Gallery */}
          <div className="bg-gray-50 p-6 flex flex-col gap-4 border-r border-gray-100">
            <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-inner relative group">
              <img src={mainImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {item.isLocked && (
                  <div className="absolute top-4 right-4 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                      Товар в сделке
                  </div>
              )}
            </div>

            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${mainImage === img ? 'border-[#00AAFF] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Security block */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800 flex items-start gap-3">
                <span className="text-lg">🔒</span>
                <div>
                    <p className="font-bold mb-1">Безопасная сделка</p>
                    <p className="opacity-80 leading-relaxed">
                        Контакты продавца скрыты до момента подтверждения сделки и сдачи товара в ПВЗ.
                        Общение вне платформы запрещено правилами безопасности.
                    </p>
                </div>
            </div>
          </div>

          {/* Right column: Info */}
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide">{item.category}</span>
                <span className="text-sm text-gray-400 font-medium">ID: {item.id}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{item.title}</h1>

            <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
              {item.description}
            </div>

            {/* Owner wishes block */}
            {item.wishes && item.wishes.length > 0 && (
                <div className="bg-blue-50/50 rounded-2xl p-5 mb-8 border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span>🎁</span> Что хочет владелец взамен:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {item.wishes.map((wish, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-sm rounded-lg shadow-sm font-medium">
                                {wish}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-wider">Владелец товара</span>
                    {owner ? (
                        <Link to={`/user/${owner.id}`} className="flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-xl border border-gray-100 hover:border-[#00AAFF] transition-colors">
                            <UserBadge user={owner} />
                        </Link>
                    ) : (
                        <span className="text-gray-400 text-sm">Неизвестен</span>
                    )}
                </div>

                {!item.isLocked ? (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                        {/* Direct Exchange Button - Active only if user has what owner wants */}
                        <button
                            onClick={handleDirectExchange}
                            disabled={!isAuthenticated || !hasDesiredItem}
                            className={`w-full px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex flex-col items-center justify-center ${
                                hasDesiredItem && isAuthenticated
                                    ? 'bg-green-500 hover:bg-green-600 shadow-green-200 hover:-translate-y-0.5'
                                    : 'bg-gray-300 cursor-not-allowed shadow-none'
                            }`}
                        >
                            <span className="text-xs opacity-90 font-medium">
                                {isAuthenticated ? (hasDesiredItem ? 'Есть нужный товар!' : 'Нет нужного товара') : 'Требуется вход'}
                            </span>
                            <span className="text-sm">
                                {hasDesiredItem ? 'Предложить обмен' : 'Недоступно'}
                            </span>
                        </button>

                        {/* Join Chain Button - Always active if user has any items */}
                        <button
                            onClick={handleJoinChain}
                            disabled={!isAuthenticated || !hasItemsToExchange}
                            className={`w-full px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex flex-col items-center justify-center ${
                                isAuthenticated && hasItemsToExchange
                                    ? 'bg-[#00AAFF] hover:bg-[#0095E0] shadow-blue-200 hover:-translate-y-0.5'
                                    : 'bg-gray-300 cursor-not-allowed shadow-none'
                            }`}
                        >
                            <span className="text-xs opacity-90 font-medium">
                                {isAuthenticated ? (hasItemsToExchange ? `${myAvailableItems.length} товар(а) доступно` : 'Нет товаров') : 'Требуется вход'}
                            </span>
                            <span className="text-sm">
                                Встать в цепочку
                            </span>
                        </button>

                        {!isAuthenticated && (
                            <p className="text-xs text-center text-gray-500 mt-1">
                                <Link to="#" onClick={(e) => { e.preventDefault(); window.location.href='/profile'; }} className="text-[#00AAFF] hover:underline">
                                    Войдите
                                </Link> чтобы участвовать в обмене
                            </p>
                        )}
                    </div>
                ) : (
                     <div className="px-8 py-4 rounded-xl font-bold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed text-center min-w-[200px]">
                        Недоступно для обмена
                     </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {isJoinModalOpen && item && (
        <JoinChainModal
            targetItem={item}
            onClose={() => setIsJoinModalOpen(false)}
            onConfirm={() => {
                setIsJoinModalOpen(false);
                alert('Вы успешно встали в цепочку! Ожидайте подбора вариантов.');
            }}
        />
      )}
    </div>
  );
};
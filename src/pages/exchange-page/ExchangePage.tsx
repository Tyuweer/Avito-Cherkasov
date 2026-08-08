// src/pages/exchange-page/ExchangePage.tsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { ChainVisualizer } from "../../widgets/chain-visualizer/ui/ChainVisualizer";
import type { IExchangeDeal, IItem } from "../../shared/api/types";
import {
  DealStatus,
  ChainLinkStatus,
  LogisticsStatus,
} from "../../shared/api/types";
import { mockUsers } from "../../entities/user/api/userApi";
import {
  mockItems,
  itemApi,
  getItemsByUserId,
} from "../../entities/item/api/itemApi";
import { useAuthStore } from "../../app/hooks/useAuthStore";
import { useStore } from "../../app/providers/StoreProvider";
import { JoinChainModal } from "../../features/join-chain/ui/JoinChainModal";

type FilterType = "active" | "completed" | "cancelled" | "all";

export const ExchangePage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<IExchangeDeal | null>(null);
  const [filter, setFilter] = useState<FilterType>("active");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [targetItem, setTargetItem] = useState<IItem | null>(null);

  const authStore = useAuthStore();
  const store = useStore();
  const currentUserId = authStore.user?.id ?? 1;

  // Фильтруем товары - оставляем только те, где currentUserId является authorId или holderId
  const myItems = useMemo(() => {
    return mockItems.filter(
      (item) =>
        item.authorId === currentUserId || item.holderId === currentUserId,
    );
  }, [currentUserId]);

  // Массив сделок теперь берется только из store
  // Mock-данные удалены - сделки создаются только при нажатии "Встать в цепочку"
  const allDeals = store.activeDeals;

  useEffect(() => {
    if (dealId) {
      const foundDeal = allDeals.find((d) => d.id === dealId);
      if (foundDeal) {
        setDeal(foundDeal);
      } else {
        // Если сделка не найдена, показываем заглушку
        setDeal(null);
      }
    }
  }, [dealId, allDeals]);

  const filteredDeals = allDeals.filter((deal) => {
    const isInChain = deal.chain.some((link) => link.userId === currentUserId);
    if (!isInChain) return false;

    if (filter === "active") {
      return (
        deal.status !== DealStatus.COMPLETED &&
        deal.status !== DealStatus.CANCELLED
      );
    }
    if (filter === "completed") {
      return deal.status === DealStatus.COMPLETED;
    }
    if (filter === "cancelled") {
      return deal.status === DealStatus.CANCELLED;
    }
    return true;
  });

  const handleJoinChain = (item: IItem) => {
    setTargetItem(item);
    setShowJoinModal(true);
  };

  const handleDealConfirmed = (deal: IExchangeDeal) => {
    setShowJoinModal(false);
    // Сделка уже создана в JoinChainModal и добавлена в store
    // Просто перенаправляем на страницу созданной сделки
    navigate(`/exchange/${deal.id}`);
  };

  // Если указан dealId, показываем детальную страницу
  if (dealId && deal) {
    return (
      <>
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={() => navigate("/exchange")}
              className="hover:text-[#00AAFF] cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Мои обмены
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">Сделка #{deal.id}</span>
          </div>

          <ChainVisualizer deal={deal} currentUserId={currentUserId} />

          {/* Информация об обмене */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Детали обмена</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Статус</p>
                <p className="font-medium text-gray-900">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      deal.status === DealStatus.COMPLETED
                        ? "bg-green-100 text-green-700"
                        : deal.status === DealStatus.CANCELLED
                          ? "bg-red-100 text-red-700"
                          : deal.status === DealStatus.ACTIVE
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {deal.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Участников</p>
                <p className="font-medium text-gray-900">{deal.chain.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Дедлайн</p>
                <p className="font-medium text-gray-900">
                  {new Date(deal.deadline).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Инициатор</p>
                <p className="font-medium text-gray-900">
                  {mockUsers[deal.initiatorId]?.username || "Неизвестно"}
                </p>
              </div>
            </div>
          </div>

          {/* Список участников с профилями */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Участники сделки</h3>
            <div className="space-y-3">
              {deal.chain.map((link, index) => (
                <div
                  key={link.userId}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/user/${link.userId}`)}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-lg font-bold overflow-hidden">
                    {link.user.avatarUrl ? (
                      <img
                        src={link.user.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      link.user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {link.user.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      Отдает:{" "}
                      <span className="font-medium">
                        {link.givingItem.title}
                      </span>
                    </p>
                    {link.receivingItem && (
                      <p className="text-sm text-gray-500">
                        Получает:{" "}
                        <span className="font-medium">
                          {link.receivingItem.title}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        link.status === ChainLinkStatus.ACCEPTED
                          ? "bg-green-100 text-green-700"
                          : link.status === ChainLinkStatus.DECLINED
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {link.status}
                    </span>
                    {index === 0 && (
                      <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        Инициатор
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showJoinModal && targetItem && (
          <JoinChainModal
            targetItem={targetItem}
            onClose={() => setShowJoinModal(false)}
            onConfirm={handleDealConfirmed}
          />
        )}
      </>
    );
  }

  // Главная страница обменов со списком и фильтром
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои обмены</h1>
          <p className="text-gray-500 text-sm mt-1">
            Отслеживайте текущие и прошедшие обмены
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-[#00AAFF] text-white rounded-lg text-sm font-medium hover:bg-[#0095E0] transition-colors shadow-sm flex items-center gap-2"
        >
          <span>+</span> Создать обмен
        </button>
      </div>

      {/* Фильтр */}
      <div className="flex gap-2 bg-white p-2 rounded-xl border border-gray-200">
        {(["active", "completed", "cancelled", "all"] as FilterType[]).map(
          (filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? "bg-[#00AAFF] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {filterType === "active" && "Активные"}
              {filterType === "completed" && "Завершенные"}
              {filterType === "cancelled" && "Отмененные"}
              {filterType === "all" && "Все обмены"}
            </button>
          ),
        )}
      </div>

      {/* Список обменов */}
      {filteredDeals.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
            📦
          </div>
          <p className="text-gray-500 font-medium">Обменов не найдено</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === "active"
              ? "У вас нет активных обменов"
              : filter === "completed"
                ? "У вас нет завершенных обменов"
                : filter === "cancelled"
                  ? "У вас нет отмененных обменов"
                  : "Создайте свой первый обмен"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.map((deal) => {
            const currentUserLink = deal.chain.find(
              (link) => link.userId === currentUserId,
            );
            const givingItem = currentUserLink?.givingItem;
            const receivingItem =
              currentUserLink?.receivingItem ||
              deal.chain.find((link) => link.userId === deal.initiatorId)
                ?.givingItem;

            return (
              <div
                key={deal.id}
                onClick={() => navigate(`/exchange/${deal.id}`)}
                className="group bg-white hover:bg-blue-50/30 p-6 rounded-2xl border border-gray-200 hover:border-[#00AAFF] transition-all cursor-pointer shadow-sm"
              >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Товары */}
                  <div className="flex items-center gap-4 w-full lg:w-auto justify-center">
                    {givingItem && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 shadow-inner">
                          <img
                            src={givingItem.imageUrl}
                            alt={givingItem.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Отдаете
                        </span>
                        <span className="text-sm font-bold text-gray-900 text-center leading-tight max-w-[100px] truncate">
                          {givingItem.title}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col items-center justify-center px-2">
                      <div className="text-2xl text-[#00AAFF] group-hover:animate-pulse">
                        ⇄
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                        Обмен
                      </span>
                    </div>

                    {receivingItem && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-green-100 bg-green-50 shadow-inner">
                          <img
                            src={receivingItem.imageUrl}
                            alt={receivingItem.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                          Получаете
                        </span>
                        <span className="text-sm font-bold text-gray-900 text-center leading-tight max-w-[100px] truncate">
                          {receivingItem.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                          deal.status === DealStatus.COMPLETED
                            ? "bg-green-100 text-green-700 border-green-200"
                            : deal.status === DealStatus.CANCELLED
                              ? "bg-red-100 text-red-700 border-red-200"
                              : deal.status === DealStatus.ACTIVE
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {deal.status === DealStatus.COMPLETED && "Завершен"}
                        {deal.status === DealStatus.CANCELLED && "Отменен"}
                        {deal.status === DealStatus.ACTIVE && "Активен"}
                        {deal.status === DealStatus.CONFIRMING &&
                          "Подтверждение"}
                        {deal.status === DealStatus.PENDING && "Ожидание"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 text-center lg:text-right">
                      Участников:{" "}
                      <span className="font-bold text-gray-900">
                        {deal.chain.length}
                      </span>{" "}
                      • Дедлайн:{" "}
                      <span className="font-bold text-gray-900">
                        {new Date(deal.deadline).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                    <button className="mt-1 px-6 py-2.5 bg-gray-100 group-hover:bg-[#00AAFF] group-hover:text-white text-gray-700 rounded-xl text-sm font-bold transition-all w-full lg:w-auto shadow-sm">
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

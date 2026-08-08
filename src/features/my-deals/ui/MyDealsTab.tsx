// src/features/my-deals/ui/MyDealsTab.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../app/providers/StoreProvider";
import { DealStatus } from "../../../shared/api/types";

type DealStatusType = "active" | "completed" | "cancelled";
type ParticipantStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface DealParticipant {
  userId: number;
  username: string;
  givesItemId: number;
  givesItemName: string;
  givesItemImage: string;
  receivesItemId: number;
  receivesItemName: string;
  receivesItemImage: string;
  status: ParticipantStatus;
}

interface Deal {
  id: string;
  title: string;
  status: DealStatusType;
  participants: DealParticipant[];
  deadline: string;
  initiatorId: number;
}

interface MyDealsTabProps {
  currentUserId: number;
}

export const MyDealsTab = ({ currentUserId }: MyDealsTabProps) => {
  const navigate = useNavigate();
  const store = useStore();
  const [filter, setFilter] = useState<"active" | "completed" | "cancelled" | "all">("active");

  // Конвертируем сделки из store в формат для отображения
  const myDeals: Deal[] = useMemo(() => {
    return store.activeDeals
      .filter((deal) => deal.chain.some((link) => link.userId === currentUserId))
      .map((deal) => {
        // Находим участника с текущим пользователем
        const currentUserLink = deal.chain.find((link) => link.userId === currentUserId);

        // Формируем участников для отображения
        const participants: DealParticipant[] = deal.chain.map((link) => {
          // Находим следующий звено для получения предмета
          const currentIndex = deal.chain.findIndex((l) => l.userId === link.userId);
          const nextIndex = currentIndex === deal.chain.length - 1 ? 0 : currentIndex + 1;
          const nextLink = deal.chain[nextIndex];

          return {
            userId: link.userId,
            username: link.user.username,
            givesItemId: link.givingItem.id,
            givesItemName: link.givingItem.title,
            givesItemImage: link.givingItem.imageUrl,
            receivesItemId: nextLink.givingItem.id,
            receivesItemName: nextLink.givingItem.title,
            receivesItemImage: nextLink.givingItem.imageUrl,
            status: link.status === 'ACCEPTED' ? 'confirmed' : link.status === 'DECLINED' ? 'cancelled' : 'pending',
          };
        });

        // Статус сделки
        let status: DealStatusType = "active";
        if (deal.status === DealStatus.COMPLETED) status = "completed";
        else if (deal.status === DealStatus.CANCELLED) status = "cancelled";

        return {
          id: deal.id,
          title: `Обмен #${deal.id}`,
          status,
          participants,
          deadline: new Date(deal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
          initiatorId: deal.initiatorId,
        };
      });
  }, [store.activeDeals, currentUserId]);

  // Применяем фильтр по статусу
  const filteredDeals = useMemo(() => {
    if (filter === "all") return myDeals;
    return myDeals.filter((deal) => deal.status === filter);
  }, [myDeals, filter]);

  const getStatusLabel = (status: "active" | "completed" | "cancelled" | "all") => {
    switch (status) {
      case "active":
        return "Активные";
      case "completed":
        return "Завершенные";
      case "cancelled":
        return "Отмененные";
      case "all":
        return "Все сделки";
      default:
        return status;
    }
  };

  const getStatusBadge = (status: DealStatusType) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase border border-yellow-200">
            Активен
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase border border-green-200">
            Завершен
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase border border-red-200">
            Отменен
          </span>
        );
    }
  };

  // Находим роль текущего пользователя в сделке
  const getUserRole = (deal: Deal) => {
    const participant = deal.participants.find((p) => p.userId === currentUserId);
    if (!participant) return null;
    return {
      givesItemName: participant.givesItemName,
      givesItemImage: participant.givesItemImage,
      receivesItemName: participant.receivesItemName,
      receivesItemImage: participant.receivesItemImage,
    };
  };

  return (
    <div className="space-y-4">
      {/* Заголовок и фильтр */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h2 className="text-lg font-bold text-gray-900">Мои сделки</h2>

        <div className="flex gap-2">
          {(["active", "completed", "cancelled", "all"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === status
                  ? "bg-[#00AAFF] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Список сделок */}
      {filteredDeals.length > 0 ? (
        <div className="space-y-4">
          {filteredDeals.map((deal) => {
            const role = getUserRole(deal);
            return (
              <div
                key={deal.id}
                onClick={() => navigate(`/exchange/${deal.id}`)}
                className="group bg-white hover:bg-blue-50/30 p-6 rounded-2xl border border-gray-200 hover:border-[#00AAFF] transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
              >
                {/* Визуализация: что отдаю ↔ что получаю */}
                {role && (
                  <div className="flex items-center gap-4 flex-1 w-full sm:w-auto justify-center sm:justify-start">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 shadow-inner">
                        <img
                          src={role.givesItemImage}
                          alt={role.givesItemName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Отдаю
                      </span>
                      <span className="text-sm font-bold text-gray-900 text-center leading-tight max-w-[100px] truncate">
                        {role.givesItemName}
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
                          src={role.receivesItemImage}
                          alt={role.receivesItemName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                        Получаю
                      </span>
                      <span className="text-sm font-bold text-gray-900 text-center leading-tight max-w-[100px] truncate">
                        {role.receivesItemName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Информация о сделке */}
                <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(deal.status)}
                  </div>
                  <div className="text-sm text-gray-500 text-center sm:text-right">
                    Участников:{" "}
                    <span className="font-bold text-gray-900">{deal.participants.length}</span>{" "}
                    • Дедлайн:{" "}
                    <span className="font-bold text-gray-900">{deal.deadline}</span>
                  </div>
                  <button className="mt-1 px-6 py-2.5 bg-gray-100 group-hover:bg-[#00AAFF] group-hover:text-white text-gray-700 rounded-xl text-sm font-bold transition-all w-full sm:w-auto shadow-sm">
                    Подробнее
                  </button>
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
          <p>
            {filter === "active" && "У вас нет активных обменов"}
            {filter === "completed" && "У вас нет завершенных обменов"}
            {filter === "cancelled" && "У вас нет отмененных обменов"}
            {filter === "all" && "У вас пока нет сделок"}
          </p>
          {filter === "active" && (
            <button
              onClick={() => navigate("/")}
              className="text-[#00AAFF] text-sm font-medium hover:underline"
            >
              Создать новый обмен
            </button>
          )}
        </div>
      )}
    </div>
  );
};
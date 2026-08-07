// src/features/my-deals/ui/MyDealsTab.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

type DealStatus = "active" | "completed" | "cancelled";
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
  status: DealStatus;
  participants: DealParticipant[];
  deadline: string;
  initiatorId: number;
}

// Тестовые данные для сделок
const mockDeals: Deal[] = [
  {
    id: "deal-101",
    title: "Обмен лодки на апельсин",
    status: "active",
    deadline: "11 авг 2025",
    initiatorId: 1,
    participants: [
      {
        userId: 1,
        username: "alex",
        givesItemId: 1,
        givesItemName: "Лодка ПВХ",
        givesItemImage: "https://placehold.co/100/blue/white?text=Boat",
        receivesItemId: 2,
        receivesItemName: "Апельсин",
        receivesItemImage: "https://placehold.co/100/orange/white?text=Orange",
        status: "confirmed",
      },
      {
        userId: 2,
        username: "dima",
        givesItemId: 2,
        givesItemName: "Апельсин",
        givesItemImage: "https://placehold.co/100/orange/white?text=Orange",
        receivesItemId: 3,
        receivesItemName: "Наушники",
        receivesItemImage: "https://placehold.co/100/purple/white?text=Headphones",
        status: "pending",
      },
      {
        userId: 3,
        username: "max",
        givesItemId: 3,
        givesItemName: "Наушники",
        givesItemImage: "https://placehold.co/100/purple/white?text=Headphones",
        receivesItemId: 1,
        receivesItemName: "Лодка ПВХ",
        receivesItemImage: "https://placehold.co/100/blue/white?text=Boat",
        status: "pending",
      },
    ],
  },
  {
    id: "deal-102",
    title: "Обмен фотоаппарата",
    status: "completed",
    deadline: "5 авг 2025",
    initiatorId: 4,
    participants: [
      {
        userId: 1,
        username: "alex",
        givesItemId: 5,
        givesItemName: "Велосипед",
        givesItemImage: "https://placehold.co/100/green/white?text=Bike",
        receivesItemId: 6,
        receivesItemName: "Фотоаппарат",
        receivesItemImage: "https://placehold.co/100/black/white?text=Camera",
        status: "completed",
      },
      {
        userId: 4,
        username: "photo",
        givesItemId: 6,
        givesItemName: "Фотоаппарат",
        givesItemImage: "https://placehold.co/100/black/white?text=Camera",
        receivesItemId: 5,
        receivesItemName: "Велосипед",
        receivesItemImage: "https://placehold.co/100/green/white?text=Bike",
        status: "completed",
      },
    ],
  },
  {
    id: "deal-103",
    title: "Музыкальный обмен",
    status: "active",
    deadline: "15 авг 2025",
    initiatorId: 5,
    participants: [
      {
        userId: 1,
        username: "alex",
        givesItemId: 7,
        givesItemName: "Гитара",
        givesItemImage: "https://placehold.co/100/brown/white?text=Guitar",
        receivesItemId: 8,
        receivesItemName: "Укулеле",
        receivesItemImage: "https://placehold.co/100/yellow/white?text=Ukulele",
        status: "confirmed",
      },
      {
        userId: 5,
        username: "music",
        givesItemId: 8,
        givesItemName: "Укулеле",
        givesItemImage: "https://placehold.co/100/yellow/white?text=Ukulele",
        receivesItemId: 7,
        receivesItemName: "Гитара",
        receivesItemImage: "https://placehold.co/100/brown/white?text=Guitar",
        status: "pending",
      },
    ],
  },
  {
    id: "deal-104",
    title: "Отмененный обмен",
    status: "cancelled",
    deadline: "1 авг 2025",
    initiatorId: 2,
    participants: [
      {
        userId: 1,
        username: "alex",
        givesItemId: 9,
        givesItemName: "Часы",
        givesItemImage: "https://placehold.co/100/silver/white?text=Watch",
        receivesItemId: 10,
        receivesItemName: "Рюкзак",
        receivesItemImage: "https://placehold.co/100/gray/white?text=Backpack",
        status: "cancelled",
      },
      {
        userId: 2,
        username: "dima",
        givesItemId: 10,
        givesItemName: "Рюкзак",
        givesItemImage: "https://placehold.co/100/gray/white?text=Backpack",
        receivesItemId: 9,
        receivesItemName: "Часы",
        receivesItemImage: "https://placehold.co/100/silver/white?text=Watch",
        status: "cancelled",
      },
    ],
  },
];

interface MyDealsTabProps {
  currentUserId: number;
}

export const MyDealsTab = ({ currentUserId }: MyDealsTabProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"active" | "completed" | "all">("active");

  // Фильтруем сделки, где пользователь участвует
  const myDeals = useMemo(() => {
    return mockDeals.filter((deal) =>
      deal.participants.some((p) => p.userId === currentUserId)
    );
  }, [currentUserId]);

  // Применяем фильтр по статусу
  const filteredDeals = useMemo(() => {
    if (filter === "all") return myDeals;
    return myDeals.filter((deal) => deal.status === filter);
  }, [myDeals, filter]);

  const getStatusLabel = (status: "active" | "completed" | "all") => {
    switch (status) {
      case "active":
        return "Активные";
      case "completed":
        return "Завершенные";
      case "all":
        return "Все сделки";
      default:
        return status;
    }
  };

  const getStatusBadge = (status: DealStatus) => {
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
          {(["active", "completed", "all"] as const).map((status) => (
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
import { observer } from 'mobx-react-lite';
import type { Chain } from '../../../shared/types';
import { getStatusColor, getStatusLabel, formatDeadline, formatRating } from '../../../shared/lib/utils';
import { chainsStore, notificationsStore } from '../../../app/stores';

interface ChainVisualizerProps {
  chain: Chain;
}

export const ChainVisualizer = observer(({ chain }: ChainVisualizerProps) => {
  const handleAccept = async (linkId: string) => {
    try {
      await chainsStore.acceptLink(chain.id, linkId);
      notificationsStore.addNotification('success', 'Вы подтвердили обмен');
    } catch (error) {
      notificationsStore.addNotification(
        'error',
        error instanceof Error ? error.message : 'Ошибка при подтверждении'
      );
    }
  };

  const handleDecline = async (linkId: string) => {
    if (!window.confirm('Отказ повлечёт потерю залога и снижение рейтинга. Продолжить?')) {
      return;
    }
    try {
      await chainsStore.declineLink(chain.id, linkId);
      notificationsStore.addNotification('warning', 'Вы отказались от обмена');
    } catch (error) {
      notificationsStore.addNotification(
        'error',
        error instanceof Error ? error.message : 'Ошибка при отказе'
      );
    }
  };

  // Определяем текущее звено пользователя (если он в цепочке)
  const currentUserLinkId = chain.links.find(
    (link) => link.status === 'PENDING' && !link.nextItemId
  )?.id;

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h3 className="font-semibold text-lg">Цепочка обмена #{chain.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-500">
            Участников: {chain.links.length} | Создана: {new Date(chain.createdAt).toLocaleDateString()}
          </p>
        </div>
        {chain.links[0]?.deadline && (
          <div className="text-right">
            <p className="text-sm text-gray-500">До завершения</p>
            <p className="font-medium text-[#F5A623]">
              {formatDeadline(chain.links[0].deadline)}
            </p>
          </div>
        )}
      </div>

      {/* Chain visualization - horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-4 min-w-max px-4">
          {chain.links.map((link, index) => {
            const statusColor = getStatusColor(link.status);
            const isLast = index === chain.links.length - 1;
            const canAct = link.id === currentUserLinkId;

            return (
              <div key={link.id} className="flex flex-col items-center">
                {/* User card */}
                <div
                  className={`w-48 p-4 rounded-lg border-2 transition-all ${
                    canAct ? 'border-[#F5A623] chain-link-pending' : ''
                  }`}
                  style={{ borderColor: statusColor }}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: statusColor }}
                    >
                      {link.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{link.user.name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>★</span>
                        <span>{formatRating(link.user.rating)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Item info */}
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm font-medium truncate">{link.item.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {link.item.description}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div
                    className="text-center py-1.5 px-3 rounded text-sm font-medium"
                    style={{ backgroundColor: statusColor + '20', color: statusColor }}
                  >
                    {getStatusLabel(link.status)}
                  </div>

                  {/* Action buttons for pending links */}
                  {canAct && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleDecline(link.id)}
                        className="flex-1 py-1.5 px-3 border border-red-500 text-red-500 rounded hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        Отказ
                      </button>
                      <button
                        onClick={() => handleAccept(link.id)}
                        className="flex-1 py-1.5 px-3 bg-[#00AAFF] text-white rounded hover:bg-[#0099E6] transition-colors text-sm font-medium"
                      >
                        ОК
                      </button>
                    </div>
                  )}
                </div>

                {/* Arrow to next link */}
                {!isLast && (
                  <div className="flex items-center justify-center w-8 pt-20">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F5A623]"></div>
          <span>Ожидает подтверждения</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00AAFF]"></div>
          <span>Подтверждено</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF3B30]"></div>
          <span>Отказано</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8E8E93]"></div>
          <span>Ожидает участников</span>
        </div>
      </div>
    </div>
  );
});

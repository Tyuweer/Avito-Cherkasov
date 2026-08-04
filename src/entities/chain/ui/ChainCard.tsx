import { observer } from 'mobx-react-lite';
import type { Chain } from '../../../shared/types';
import { getStatusColor, formatDeadline } from '../../../shared/lib/utils';

interface ChainCardProps {
  chain: Chain;
  onClick: (chain: Chain) => void;
}

export const ChainCard = observer(({ chain, onClick }: ChainCardProps) => {
  const pendingCount = chain.links.filter((l) => l.status === 'PENDING').length;
  const acceptedCount = chain.links.filter((l) => l.status === 'ACCEPTED').length;
  const firstLink = chain.links[0];
  const statusColor = getStatusColor(firstLink?.status || 'WAITING');

  return (
    <div
      onClick={() => onClick(chain)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-[#00AAFF] hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium">Цепочка #{chain.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {chain.links.length} участников
          </p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: statusColor + '20', color: statusColor }}
        >
          {pendingCount > 0 ? 'Активна' : chain.status === 'COMPLETED' ? 'Завершена' : 'Отменена'}
        </div>
      </div>

      {/* Mini chain preview */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto">
        {chain.links.slice(0, 5).map((link, index) => (
          <div key={link.id} className="flex items-center gap-2 min-w-max">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: getStatusColor(link.status) }}
            >
              {link.user.name.charAt(0).toUpperCase()}
            </div>
            {index < chain.links.length - 1 && (
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
        {chain.links.length > 5 && (
          <span className="text-sm text-gray-400">+{chain.links.length - 5}</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="text-green-600">✓ {acceptedCount}</span>
          <span className="text-orange-500">◷ {pendingCount}</span>
        </div>
        {firstLink?.deadline && (
          <span className="text-gray-500">{formatDeadline(firstLink.deadline)}</span>
        )}
      </div>
    </div>
  );
});

import { observer } from 'mobx-react-lite';
import type { Item } from '../../../shared/types';
import { itemsStore } from '../../../app/stores';

interface ItemCardProps {
  item: Item;
  onEdit?: (item: Item) => void;
}

export const ItemCard = observer(({ item, onEdit }: ItemCardProps) => {
  const isLocked = item.isLocked;
  const isOwner = item.authorId === item.holderId;

  return (
    <div
      className={`bg-white rounded-lg border transition-all ${
        isLocked ? 'border-gray-200 opacity-75' : 'border-gray-200 hover:border-[#00AAFF] hover:shadow-md'
      }`}
    >
      {/* Image placeholder */}
      <div className="h-40 bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium truncate flex-1">{item.title}</h3>
          {isLocked && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              В сделке
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>

        {/* Owner/Holder info */}
        {!isOwner && (
          <div className="text-xs text-gray-400 mb-3">
            Права переданы: {item.holderId.slice(0, 8)}...
          </div>
        )}

        {/* PVZ info */}
        {item.pvzId && (
          <div className="text-xs text-gray-500 flex items-center gap-1 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            ПВЗ выбран
          </div>
        )}

        {/* Actions */}
        {!isLocked && onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="w-full py-2 px-4 border border-[#00AAFF] text-[#00AAFF] rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
          >
            Редактировать
          </button>
        )}

        {isLocked && (
          <div className="text-center py-2 px-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            Товар участвует в обмене
          </div>
        )}
      </div>
    </div>
  );
});

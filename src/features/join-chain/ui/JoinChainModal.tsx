import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import type { Chain, Item } from '../../../shared/types';
import { chainsStore, notificationsStore, itemsStore } from '../../../app/stores';

interface JoinChainModalProps {
  chain: Chain;
  isOpen: boolean;
  onClose: () => void;
}

export const JoinChainModal = observer(({ chain, isOpen, onClose }: JoinChainModalProps) => {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableItems = itemsStore.availableItems;

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    if (selectedItemIds.length === 0) {
      notificationsStore.addNotification('warning', 'Выберите хотя бы один товар');
      return;
    }

    setIsSubmitting(true);
    try {
      await chainsStore.joinChain(chain.id, selectedItemIds);
      notificationsStore.addNotification('success', 'Вы успешно вступили в цепочку');
      onClose();
      setSelectedItemIds([]);
    } catch (error) {
      notificationsStore.addNotification(
        'error',
        error instanceof Error ? error.message : 'Ошибка при вступлении в цепочку'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Находим товары, которые ищет следующий участник в цепочке
  const wantedItems = chain.links
    .filter((link) => link.status === 'PENDING')
    .map((link) => link.nextItemId)
    .filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Встать в цепочку обмена</h2>
          <p className="text-sm text-gray-500 mt-1">
            Выберите товары, права на которые вы передадите
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {availableItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              У вас нет доступных товаров. Добавьте товар в инвентаре.
            </div>
          ) : (
            <div className="space-y-3">
              {availableItems.map((item) => {
                const isWanted = wantedItems.includes(item.id);
                const isSelected = selectedItemIds.includes(item.id);

                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-[#00AAFF] bg-blue-50'
                        : isWanted
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleItem(item.id)}
                      className="mt-1 h-4 w-4 text-[#00AAFF] border-gray-300 rounded focus:ring-[#00AAFF]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.title}</span>
                        {isWanted && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Ищут
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedItemIds.length === 0}
            className="flex-1 px-4 py-2.5 bg-[#00AAFF] text-white rounded-lg font-medium hover:bg-[#0099E6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Обработка...' : `Вступить (${selectedItemIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
});

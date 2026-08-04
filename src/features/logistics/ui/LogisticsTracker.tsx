import { observer } from 'mobx-react-lite';
import type { DealLogistics } from '../../../shared/types';
import { logisticsStore, notificationsStore } from '../../../app/stores';

interface LogisticsTrackerProps {
  chainId: string;
}

const stepLabels: Record<string, { title: string; description: string }> = {
  CREATED: { title: 'Сделка создана', description: 'Ожидается доставка товаров на ПВЗ' },
  PVZ_ACCEPTED: { title: 'Принято на ПВЗ', description: 'Товары проверены и приняты' },
  IN_TRANSIT: { title: 'В пути', description: 'Товары перемещаются между ПВЗ' },
  DELIVERED: { title: 'Доставлено', description: 'Товары готовы к выдаче' },
  READY_FOR_PICKUP: { title: 'Готово к выдаче', description: 'Можно забирать товары' },
  COMPLETED: { title: 'Завершено', description: 'Все участники получили товары' },
  FAILED: { title: 'Не удалось', description: 'Сделка отменена' },
};

export const LogisticsTracker = observer(({ chainId }: LogisticsTrackerProps) => {
  const dealStatus = logisticsStore.dealStatus;
  const isLoading = logisticsStore.isLoading;

  const handleConfirmDelivery = async () => {
    try {
      await logisticsStore.confirmDelivery(chainId);
      notificationsStore.addNotification('success', 'Подтверждение доставки отправлено');
    } catch (error) {
      notificationsStore.addNotification(
        'error',
        error instanceof Error ? error.message : 'Ошибка при подтверждении'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00AAFF]"></div>
      </div>
    );
  }

  if (!dealStatus) {
    return (
      <div className="text-center py-8 text-gray-500">
        Информация о логистике недоступна
      </div>
    );
  }

  const steps = dealStatus.steps;
  const currentStepIndex = steps.findIndex((s) => s.isActive);

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Статус доставки</h3>

      {/* Vertical timeline */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
          <div
            className="bg-[#00AAFF] transition-all duration-500"
            style={{
              height: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isActive = step.isActive;
            const label = stepLabels[step.step] || {
              title: step.title,
              description: step.description,
            };

            return (
              <div key={step.step} className="relative flex gap-4 pl-12">
                {/* Step indicator */}
                <div
                  className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-[#00AAFF] border-[#00AAFF] text-white'
                      : isActive
                      ? 'border-[#00AAFF] bg-white text-[#00AAFF]'
                      : 'border-gray-300 bg-white text-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-medium ${
                        isActive ? 'text-[#00AAFF]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {label.title}
                    </h4>
                    {isActive && (
                      <span className="text-xs bg-blue-100 text-[#00AAFF] px-2 py-0.5 rounded animate-pulse">
                        Текущий
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{label.description}</p>
                  {step.completedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(step.completedAt).toLocaleString('ru-RU')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action button for current step */}
      {dealStatus.currentStep === 'READY_FOR_PICKUP' && (
        <div className="pt-4 border-t">
          <button
            onClick={handleConfirmDelivery}
            className="w-full bg-[#00AAFF] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#0099E6] transition-colors"
          >
            Подтвердить получение товара
          </button>
        </div>
      )}

      {/* PVZ info notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Важно:</strong> Контакты других участников будут доступны только после
          подтверждения получения товара на ПВЗ. Это гарантирует безопасность сделки.
        </p>
      </div>
    </div>
  );
});

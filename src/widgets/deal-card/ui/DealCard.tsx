// src/widgets/deal-card/ui/DealCard.tsx
import React from 'react';
import type { IExchangeDeal } from '../../../shared/api/types';
import { DealStatus, ChainLinkStatus } from '../../../shared/api/types';

interface DealCardProps {
  deal: IExchangeDeal;
  currentUserId: number;
  onConfirm?: (dealId: string) => void;
  onCancel?: (dealId: string, reason?: string) => void;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  currentUserId,
  onConfirm,
  onCancel
}) => {
  // Find the current user's link in the chain
  const myLink = deal.chain.find(link => link.userId === currentUserId);

  if (!myLink) return null;

  // Determine if I'm the recipient (need to confirm)
  const isRecipient = myLink.status === ChainLinkStatus.PENDING && deal.status === DealStatus.PENDING;

  // Determine if I can cancel (any participant can cancel PENDING deal, initiator can cancel ACTIVE)
  const canCancel = deal.status === DealStatus.PENDING ||
                    (deal.status === DealStatus.ACTIVE && deal.initiatorId === currentUserId);

  // Get status badge
  const getStatusBadge = () => {
    switch (deal.status) {
      case DealStatus.PENDING:
        return (
          <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase border border-yellow-200">
            Ожидает подтверждения
          </span>
        );
      case DealStatus.ACTIVE:
        return (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase border border-green-200">
            Активен
          </span>
        );
      case DealStatus.CANCELLED:
        return (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase border border-red-200">
            Отменен
          </span>
        );
      case DealStatus.COMPLETED:
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase border border-blue-200">
            Завершен
          </span>
        );
      default:
        return null;
    }
  };

  // Get item info for display
  const givesItem = myLink.givingItem;
  const receivesItem = myLink.receivingItem;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Сделка #{deal.id}</h3>
          <p className="text-sm text-gray-500">
            Дедлайн: {new Date(deal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Exchange visualization */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 shadow-inner">
            <img src={givesItem.imageUrl} alt={givesItem.title} className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Отдаю</span>
          <span className="text-sm font-medium text-gray-900 text-center leading-tight max-w-[100px] truncate">
            {givesItem.title}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center px-2">
          <div className="text-2xl text-[#00AAFF]">⇄</div>
          <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Обмен</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-green-100 bg-green-50 shadow-inner">
            <img src={receivesItem?.imageUrl || ''} alt={receivesItem?.title || ''} className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Получаю</span>
          <span className="text-sm font-medium text-gray-900 text-center leading-tight max-w-[100px] truncate">
            {receivesItem?.title || '—'}
          </span>
        </div>
      </div>

      {/* Participants list */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Участники:</h4>
        <div className="space-y-2">
          {deal.chain.map((link, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {link.user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">{link.user.username}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                link.status === ChainLinkStatus.ACCEPTED
                  ? 'bg-green-100 text-green-700'
                  : link.status === ChainLinkStatus.DECLINED
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {link.status === ChainLinkStatus.ACCEPTED ? 'Подтвердил' :
                 link.status === ChainLinkStatus.DECLINED ? 'Отказался' : 'Ожидает'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {deal.status !== DealStatus.CANCELLED && deal.status !== DealStatus.COMPLETED && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          {isRecipient && onConfirm && (
            <button
              onClick={() => onConfirm(deal.id)}
              className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-md shadow-green-200"
            >
              Подтвердить обмен
            </button>
          )}

          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(deal.id, 'Пользователь отказался от сделки')}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-md shadow-red-200"
            >
              {isRecipient ? 'Отказаться' : 'Отменить сделку'}
            </button>
          )}
        </div>
      )}

      {deal.status === DealStatus.CANCELLED && deal.declineReason && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-700">
            <span className="font-bold">Причина отмены:</span> {deal.declineReason}
          </p>
        </div>
      )}
    </div>
  );
};
// src/widgets/chain-visualizer/ui/ChainVisualizer.tsx
import type { IExchangeDeal } from '../../../shared/api/types';
import { DealStatus, ChainLinkStatus } from '../../../shared/api/types';
import { UserBadge } from '../../../entities/user/ui/UserBadge';
import { observer } from 'mobx-react-lite';

interface ChainVisualizerProps {
  deal: IExchangeDeal;
  currentUserId: number;
  onConfirm: () => void;
  onDecline: () => void;
}

export const ChainVisualizer = observer(({ deal, currentUserId, onConfirm, onDecline }: ChainVisualizerProps) => {
  
  const myLink = deal.chain.find(l => l.userId === currentUserId);
  const canAct = myLink?.status === ChainLinkStatus.PENDING && deal.status === DealStatus.CONFIRMING;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 overflow-x-auto">
      <div className="flex items-center justify-between mb-16 min-w-[1000px]">
        <h2 className="text-2xl font-bold text-gray-900">Схема обмена</h2>
        <div className="flex items-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 shadow-sm">
          <span className="text-lg">⏳</span>
          <span className="font-bold">Дедлайн: {new Date(deal.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Контейнер схемы - УВЕЛИЧЕННАЯ ШИРИНА */}
      <div className="relative min-w-[1200px] pb-32"> 
        
        {/* Основная линия цепи (Участники + Стрелки) */}
        <div className="flex items-start justify-between w-full relative z-10">
          
          {deal.chain.map((link, index) => {
            const isMe = link.userId === currentUserId;
            const isLast = index === deal.chain.length - 1;
            const itemToGive = link.givingItem;

            return (
              <div key={`${link.userId}-${index}`} className="flex items-start w-full last:w-48">
                
                {/* Узел участника */}
                <div className="flex flex-col items-center relative w-48 shrink-0 z-20">
                  <div className={`
                    relative flex flex-col items-center p-5 rounded-2xl border-2 bg-white shadow-md transition-all w-full
                    ${isMe ? 'border-[#00AAFF] ring-4 ring-blue-100 scale-110 z-30' : 'border-gray-200'}
                    ${link.status === ChainLinkStatus.ACCEPTED ? 'border-green-500 bg-green-50/50' : ''}
                    ${link.status === ChainLinkStatus.DECLINED ? 'border-red-500 bg-red-50/50 opacity-60' : ''}
                    ${link.status === ChainLinkStatus.PENDING ? 'border-yellow-400 bg-yellow-50/50' : ''}
                  `}>
                    {isMe && (
                      <div className="absolute -top-4 bg-[#00AAFF] text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg tracking-wide">
                        Вы
                      </div>
                    )}
                    <UserBadge user={link.user} size="md" />
                    <div className="mt-4 text-xs font-bold uppercase tracking-wide text-center">
                      {link.status === ChainLinkStatus.WAITING && <span className="text-gray-400">Ожидание</span>}
                      {link.status === ChainLinkStatus.PENDING && <span className="text-yellow-600">На рассмотрении</span>}
                      {link.status === ChainLinkStatus.ACCEPTED && <span className="text-green-600">Согласен</span>}
                    </div>
                  </div>

                  {/* Кнопки действий */}
                  {isMe && canAct && (
                    <div className="absolute -bottom-16 flex gap-2 bg-white p-1.5 rounded-xl shadow-xl border border-gray-100 z-40">
                      <button onClick={onDecline} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors">Отказаться</button>
                      <button onClick={onConfirm} className="px-6 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 shadow-md transition-all">Подтвердить</button>
                    </div>
                  )}
                  {isMe && link.status === ChainLinkStatus.ACCEPTED && (
                    <div className="absolute -bottom-14 text-green-600 text-sm font-bold bg-green-50 px-4 py-2 rounded-full border border-green-200 shadow-sm flex items-center gap-2">
                      <span className="text-lg">✓</span> Вы подтвердили
                    </div>
                  )}
                </div>

                {/* СТРЕЛКА И ТОВАР (между участниками) */}
                {!isLast && (
                  <div className="flex-1 flex flex-col items-center justify-start pt-4 px-6 relative h-48">
                     
                     {/* Карточка товара */}
                     <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 shadow-lg mb-4 w-32 text-center z-20 relative hover:scale-105 transition-transform">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap">
                          Передает
                        </div>
                        <img src={itemToGive.imageUrl} alt="" className="w-full h-20 object-cover rounded-xl mb-2" />
                        <span className="text-xs font-bold text-gray-900 leading-tight block line-clamp-2">
                          {itemToGive.title}
                        </span>
                     </div>
                     
                     {/* Четкая стрелка (Линия + Треугольник) */}
                     <div className="absolute top-24 left-0 right-0 flex items-center justify-center px-4">
                        <div className="h-1 w-full bg-gray-200 relative">
                            {/* Наконечник стрелки */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-gray-300"></div>
                        </div>
                     </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* НИЖНЯЯ ДУГА ВОЗВРАТА (Замыкание цикла) */}
        {/* Рисуем большую понятную дугу от последнего к первому */}
        <div className="absolute bottom-0 left-24 right-24 h-24 border-b-4 border-l-4 border-r-4 border-purple-200 rounded-b-[40px] flex items-end justify-center pb-4 bg-purple-50/30">
           
           {/* Товар замыкания */}
           <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white border-2 border-purple-300 rounded-2xl p-3 shadow-xl w-36 text-center z-20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] px-3 py-1 rounded-full font-bold whitespace-nowrap shadow-md">
                Замыкает цепь
              </div>
              <img 
                src={deal.chain[deal.chain.length - 1].givingItem.imageUrl} 
                alt="" 
                className="w-full h-16 object-cover rounded-xl mb-2" 
              />
              <span className="text-xs font-bold text-purple-900 leading-tight block line-clamp-1">
                {deal.chain[deal.chain.length - 1].givingItem.title}
              </span>
           </div>

           {/* Большая стрелка возврата (влево) */}
           <div className="absolute bottom-[-14px] left-[-14px] w-8 h-8 border-b-4 border-l-4 border-purple-300 rounded-bl-[20px] flex items-center justify-center">
               {/* Треугольник стрелки вверх/влево */}
               <div className="absolute -top-2 -left-1 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-purple-300 rotate-45"></div>
           </div>
           
           <span className="text-purple-600 text-sm font-bold uppercase tracking-widest bg-white px-6 py-2 rounded-full shadow-sm border border-purple-100">
             Возврат к началу (Первому участнику)
           </span>
        </div>

      </div>

      {/* Легенда */}
      <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap gap-8 justify-center text-sm text-gray-500 font-medium">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-400 shadow-sm"></div> Требуется ваше действие</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div> Участник согласен</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div> Замыкающий обмен</div>
      </div>
    </div>
  );
});
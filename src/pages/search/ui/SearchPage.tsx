import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { chainsStore } from '../../app/stores';
import { ChainCard } from '../../entities/chain';
import { JoinChainModal } from '../../features/join-chain';

export const SearchPage = observer(() => {
  const navigate = useNavigate();
  const [selectedChain, setSelectedChain] = useState<typeof chainsStore.activeChain | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    chainsStore.fetchChains();
  }, []);

  const handleChainClick = (chain: typeof chainsStore.activeChain) => {
    setSelectedChain(chain);
    setShowJoinModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Поиск цепочек обмена</h1>
        <p className="text-gray-500 mt-1">
          Найдите подходящую цепочку и обменяйте свой товар
        </p>
      </div>

      {/* Search and filters placeholder */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Поиск по названию товара..."
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AAFF]"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AAFF] bg-white">
          <option>Все категории</option>
          <option>Электроника</option>
          <option>Одежда</option>
          <option>Дом и сад</option>
          <option>Хобби</option>
        </select>
      </div>

      {/* Chains grid */}
      {chainsStore.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00AAFF]"></div>
        </div>
      ) : chainsStore.chains.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <p className="text-gray-500 mb-4">Нет доступных цепочек для поиска</p>
          <button
            onClick={() => navigate('/inventory')}
            className="text-[#00AAFF] font-medium hover:underline"
          >
            Создать свою цепочку из инвентаря
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chainsStore.chains.map((chain) => (
            <ChainCard key={chain.id} chain={chain} onClick={handleChainClick} />
          ))}
        </div>
      )}

      {/* Join modal */}
      {selectedChain && (
        <JoinChainModal
          chain={selectedChain}
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedChain(null);
          }}
        />
      )}
    </div>
  );
});

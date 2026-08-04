import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { itemsStore } from '../../app/stores';
import { ItemCard } from '../../entities/item';
import { AddItemForm } from '../../features/add-item';

export const InventoryPage = observer(() => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'locked'>('all');

  useEffect(() => {
    itemsStore.fetchItems();
  }, []);

  const filteredItems = itemsStore.items.filter((item) => {
    if (filter === 'available') return !item.isLocked;
    if (filter === 'locked') return item.isLocked;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Мой инвентарь</h1>
          <p className="text-gray-500 mt-1">
            {itemsStore.availableItems.length} доступно, {itemsStore.lockedItems.length} в сделках
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#00AAFF] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#0099E6] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить товар
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="mb-8 bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Новый товар</h2>
          <AddItemForm onSuccess={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#00AAFF] text-white'
              : 'bg-white border hover:border-[#00AAFF]'
          }`}
        >
          Все ({itemsStore.items.length})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'available'
              ? 'bg-[#00AAFF] text-white'
              : 'bg-white border hover:border-[#00AAFF]'
          }`}
        >
          Доступные ({itemsStore.availableItems.length})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'locked'
              ? 'bg-[#00AAFF] text-white'
              : 'bg-white border hover:border-[#00AAFF]'
          }`}
        >
          В сделках ({itemsStore.lockedItems.length})
        </button>
      </div>

      {/* Items grid */}
      {itemsStore.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00AAFF]"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-gray-500">
            {filter === 'all'
              ? 'У вас пока нет товаров. Добавьте первый!'
              : filter === 'available'
              ? 'Нет доступных товаров'
              : 'Нет товаров в сделках'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
});

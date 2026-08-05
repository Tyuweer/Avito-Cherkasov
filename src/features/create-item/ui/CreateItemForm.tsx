// src/features/create-item/ui/CreateItemForm.tsx
import { useState } from 'react';
import type { IItem } from '../../../shared/api/types';
import { itemApi } from '../../../entities/item/api/itemApi';

interface CreateItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateItemForm = ({ onSuccess, onCancel }: CreateItemFormProps) => {
  const [formData, setFormData] = useState<Partial<IItem>>({
    title: '',
    description: '',
    category: '',
    quantity: 1,
    unit: 'шт',
    imageUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image', // Дефолтная заглушка
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await itemApi.createItem(formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create item', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Добавить вещь</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
          <input 
            required
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] focus:border-transparent outline-none"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="Например: Велосипед"
          />
        </div>

        {/* Новое поле для фото */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на фото</label>
          <input 
            type="url" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] focus:border-transparent outline-none text-sm"
            value={formData.imageUrl}
            onChange={e => setFormData({...formData, imageUrl: e.target.value})}
            placeholder="https://..."
          />
          <p className="text-xs text-gray-400 mt-1">Вставьте прямую ссылку на изображение</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
          <textarea 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] focus:border-transparent outline-none h-20 resize-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Состояние, комплектация..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] outline-none"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
            <input 
              required
              type="number" 
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AAFF] outline-none"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2 bg-[#00AAFF] text-white rounded-lg font-medium hover:bg-[#0095E0] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Сохранение...' : 'Добавить'}
          </button>
        </div>
      </form>
    </div>
  );
};
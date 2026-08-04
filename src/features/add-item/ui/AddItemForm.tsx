import { observer } from 'mobx-react-lite';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createItemSchema, type CreateItemFormData } from '../../../shared/lib/validators';
import { itemsStore, notificationsStore } from '../../../app/stores';

interface AddItemFormProps {
  onSuccess?: () => void;
}

export const AddItemForm = observer(({ onSuccess }: AddItemFormProps) => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<CreateItemFormData>({
      resolver: zodResolver(createItemSchema),
      defaultValues: {
        title: '',
        description: '',
        imageUrl: '',
      },
    });

  const onSubmit = async (data: CreateItemFormData) => {
    try {
      await itemsStore.createItem(data);
      notificationsStore.addNotification('success', 'Товар успешно добавлен');
      reset();
      onSuccess?.();
    } catch (error) {
      notificationsStore.addNotification(
        'error',
        error instanceof Error ? error.message : 'Ошибка при добавлении товара'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Название товара
        </label>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AAFF] focus:border-transparent"
              placeholder="Например: Велосипед"
            />
          )}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Описание
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AAFF] focus:border-transparent"
              placeholder="Опишите состояние, особенности товара"
            />
          )}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
          URL изображения (необязательно)
        </label>
        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="imageUrl"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AAFF] focus:border-transparent"
              placeholder="https://..."
            />
          )}
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.imageUrl.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#00AAFF] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#0099E6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Добавление...' : 'Добавить товар'}
      </button>
    </form>
  );
});

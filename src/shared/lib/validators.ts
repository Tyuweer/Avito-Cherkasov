import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  imageUrl: z.string().url('Некорректный URL изображения').optional().or(z.literal('')),
  pvzId: z.string().optional(),
});

export type CreateItemFormData = z.infer<typeof createItemSchema>;

export const joinChainSchema = z.object({
  itemIds: z.array(z.string()).min(1, 'Выберите хотя бы один товар'),
});

export type JoinChainFormData = z.infer<typeof joinChainSchema>;

export const declineReasonSchema = z.object({
  reason: z.string().min(5, 'Укажите причину отказа (минимум 5 символов)'),
});

export type DeclineReasonFormData = z.infer<typeof declineReasonSchema>;

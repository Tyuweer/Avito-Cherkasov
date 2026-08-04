import { LinkStatus } from '../../shared/types';

export const getStatusColor = (status: LinkStatus): string => {
  switch (status) {
    case 'PENDING':
      return '#F5A623'; // Orange - ожидание подтверждения
    case 'ACCEPTED':
      return '#00AAFF'; // Avito blue - подтверждено
    case 'DECLINED':
      return '#FF3B30'; // Red - отказ
    case 'WAITING':
      return '#8E8E93'; // Gray - ожидание действий других участников
    default:
      return '#8E8E93';
  }
};

export const getStatusLabel = (status: LinkStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'Ожидает подтверждения';
    case 'ACCEPTED':
      return 'Подтверждено';
    case 'DECLINED':
      return 'Отказано';
    case 'WAITING':
      return 'Ожидает участников';
    default:
      return status;
  }
};

export const formatDeadline = (deadline?: string): string => {
  if (!deadline) return '';
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 0) return 'Истекло';
  if (diffHours < 24) return `${diffHours} ч.`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} дн.`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

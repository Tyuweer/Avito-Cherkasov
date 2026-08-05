export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Статусы звеньев (участников) в цепочке
export const ChainLinkStatus = {
  WAITING: 'WAITING',     // Ждет своей очереди (справа еще не подтвердили)
  PENDING: 'PENDING',     // На рассмотрении (можно подтвердить/отклонить)
  ACCEPTED: 'ACCEPTED',   // Подтвердил участие
  DECLINED: 'DECLINED',   // Отказался (триггерит CANCELLED для всей сделки)
} as const;
export type ChainLinkStatus = (typeof ChainLinkStatus)[keyof typeof ChainLinkStatus];

// Статусы всей сделки (из схемы БД оркестратора)
export const DealStatus = {
  PENDING: 'PENDING',    
  CONFIRMING: 'CONFIRMING',               // Цепочка формируется / ждет действий
  WAITING_FOR_REQUIRED_USER: 'WAITING_FOR_REQUIRED_USER', // Не нашли кого-то в цепочку
  CONFIRMED: 'CONFIRMED',               // Все подтвердили -> переход к логистике
  CANCELLED: 'CANCELLED',               // Кто-то отказался
  COMPLETED: 'COMPLETED',               // Успешно завершена
} as const;
export type DealStatus = (typeof DealStatus)[keyof typeof DealStatus];

// Статусы логистики (ПВЗ)
export const LogisticsStatus = {
  NONE: 'NONE',
  PENDING_DROP_OFF: 'PENDING_DROP_OFF', // Ожидает сдачи в ПВЗ
  DROPPED_OFF: 'DROPPED_OFF',           // Сдано (проверено сотрудником)
  IN_TRANSIT: 'IN_TRANSIT',             // Едет между ПВЗ
  DELIVERED_TO_PVZ: 'DELIVERED_TO_PVZ', // Приехало в целевой ПВЗ
  COMPLETED: 'COMPLETED',               // Забрано
} as const;
export type LogisticsStatus = (typeof LogisticsStatus)[keyof typeof LogisticsStatus];

// --- Interfaces ---

export interface IUser {
  id: number;
  username: string;
  rating: number;        // Влияет на доверие
  declineCount: number;  // Счетчик отказов (из спеки)
  avatarUrl?: string;
  pvzAddress?: string;   // Удобный ПВЗ
}

export interface IItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  images?: string[];
  category: string;
  quantity: number;
  unit: string;
  wishes?: string[];
  
  authorId: number;      // Владелец (неизменно)
  holderId: number;      // Распорядитель (исключительное право)
  
  isLocked: boolean;     // Заблокирован в сделке
  createdAt: string;
}

// Звено цепочки (участник + его роль в конкретном обмене)
export interface IChainLink {
  userId: number;
  user: IUser;
  status: ChainLinkStatus;
  
  // Что отдает (пробрасывает право или свой товар)
  givingItemId: number; 
  givingItem: IItem;
  
  // Что получает (если это конечная цель для него)
  receivingItemId?: number;
  receivingItem?: IItem;
}

// Полная сделка (ответ от Get оркестратора)
export interface IExchangeDeal {
  id: string;
  status: DealStatus;
  deadline: string; // ISO Date
  
  // Массив звеньев. Порядок важен для логики "справа налево".
  // Пусть index 0 - инициатор (кто хочет), index N - владелец цели.
  chain: IChainLink[]; 
  
  logistics?: ILogisticsStep[];
}

export interface ILogisticsStep {
  itemId: number;
  status: LogisticsStatus;
  fromPvz: string;
  toPvz: string;
  updatedAt: string;
}

// Ответы API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
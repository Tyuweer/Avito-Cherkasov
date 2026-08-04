// Shared types for the entire application

export interface User {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  declinedCount: number;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  authorId: string; // Owner of the item
  holderId: string; // Current rights holder (may differ from author)
  isLocked: boolean; // Locked if in active deal
  pvzId?: string; // Preferred pickup point
}

export interface ChainLink {
  id: string;
  userId: string;
  user: User;
  itemId: string;
  item: Item;
  nextItemId?: string; // Item they want to receive
  status: LinkStatus;
  deadline?: string; // ISO date
}

export type LinkStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WAITING';

export interface Chain {
  id: string;
  links: ChainLink[];
  createdAt: string;
  updatedAt: string;
  status: ChainStatus;
  totalValue: number;
}

export type ChainStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface PVZ {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
}

export interface DealLogistics {
  chainId: string;
  currentStep: LogisticsStep;
  steps: LogisticsStepInfo[];
}

export type LogisticsStep = 
  | 'CREATED'
  | 'PVZ_ACCEPTED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'FAILED';

export interface LogisticsStepInfo {
  step: LogisticsStep;
  title: string;
  description: string;
  completedAt?: string;
  isActive?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
}

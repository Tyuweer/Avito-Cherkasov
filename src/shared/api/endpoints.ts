import { api } from '../api/client';
import type { Item, Chain, DealLogistics, PVZ } from '../types';

export interface CreateItemDto {
  title: string;
  description: string;
  imageUrl?: string;
  pvzId?: string;
}

export interface JoinChainDto {
  chainId: string;
  itemIds: string[]; // Items user offers for rights transfer
}

export const itemsApi = {
  getAll: () => api.get<Item[]>('/items'),
  getById: (id: string) => api.get<Item>(`/items/${id}`),
  create: (data: CreateItemDto) => api.post<Item>('/items', data),
  update: (id: string, data: Partial<CreateItemDto>) => 
    api.put<Item>(`/items/${id}`, data),
  delete: (id: string) => api.delete<void>(`/items/${id}`),
};

export const chainsApi = {
  getAll: () => api.get<Chain[]>('/chains'),
  getById: (id: string) => api.get<Chain>(`/chains/${id}`),
  create: () => api.post<Chain>('/chains', {}),
  join: (data: JoinChainDto) => api.post<Chain>('/chains/join', data),
  acceptLink: (chainId: string, linkId: string) => 
    api.post<Chain>(`/chains/${chainId}/links/${linkId}/accept`, {}),
  declineLink: (chainId: string, linkId: string, reason?: string) => 
    api.post<Chain>(`/chains/${chainId}/links/${linkId}/decline`, { reason }),
  leaveChain: (chainId: string) => 
    api.post<Chain>(`/chains/${chainId}/leave`, {}),
};

export const logisticsApi = {
  getDealStatus: (chainId: string) => 
    api.get<DealLogistics>(`/logistics/${chainId}`),
  confirmDelivery: (chainId: string) => 
    api.post<DealLogistics>(`/logistics/${chainId}/confirm`, {}),
};

export const pvzApi = {
  getAll: () => api.get<PVZ[]>('/pvz'),
  getById: (id: string) => api.get<PVZ>(`/pvz/${id}`),
};

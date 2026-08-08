// src/app/providers/RootStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import type { IUser, IExchangeDeal, IChainLink } from '../../shared/api/types';
import { DealStatus } from '../../shared/api/types';
import { AuthStore } from '../hooks/stores/AuthStore';

class RootStore {
  auth: AuthStore;
  currentUser: IUser | null = null;
  activeDeals: IExchangeDeal[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
    this.auth = new AuthStore();
  }

  // Простой мок-логин без аргументов (для быстрой демонстрации)
  login = async () => {
    this.isLoading = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      runInAction(() => {
        this.currentUser = {
          id: 1,
          username: 'Alex_Dev',
          rating: 4.8,
          declineCount: 1,
          pvzAddress: 'ПВЗ №123, ул. Ленина 10'
        };
        this.isLoading = false;
      });
    } catch {
      runInAction(() => { this.isLoading = false; });
    }
  };

  logout = () => {
    this.currentUser = null;
    this.auth.logout();
  };

  fetchCurrentUser = async () => {
    // Можно раскомментировать для авто-входа
    // this.login();
  };

  updateDealStatus = (dealId: string, newStatus: DealStatus) => {
    const deal = this.activeDeals.find(d => d.id === dealId);
    if (deal) {
      deal.status = newStatus;
      // При отмене или завершении сделки - разблокируем все товары
      if (newStatus === DealStatus.CANCELLED || newStatus === DealStatus.COMPLETED) {
        deal.chain.forEach((link: IChainLink) => {
          link.givingItem.isLocked = false;
        });
      }
    }
  };

  setDeals = (deals: IExchangeDeal[]) => {
    this.activeDeals = deals;
  };
}

export const rootStore = new RootStore();
// src/app/providers/RootStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import type { IUser, IExchangeDeal, IChainLink } from '../../shared/api/types';
import { DealStatus } from '../../shared/api/types';

class RootStore {
  currentUser: IUser | null = null;
  activeDeals: IExchangeDeal[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Простой мок-логин без аргументов
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
    } catch (error) {
      runInAction(() => { this.isLoading = false; });
    }
  };

  logout = () => {
    this.currentUser = null;
  };

  fetchCurrentUser = async () => {
    // Можно раскомментировать для авто-входа
    // this.login();
  };

  updateDealStatus = (dealId: string, newStatus: DealStatus) => {
    const deal = this.activeDeals.find(d => d.id === dealId);
    if (deal) {
      deal.status = newStatus;
      if (newStatus === DealStatus.CANCELLED) {
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
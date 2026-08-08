// src/app/providers/DealStore.ts
import { makeAutoObservable, runInAction, reaction } from 'mobx';
import type { IExchangeDeal, IItem, DealStatus } from '../../shared/api/types';
import { DealStatus as DealStatusEnum, ChainLinkStatus, LogisticsStatus } from '../../shared/api/types';
import { mockItems } from '../../entities/item/api/itemApi';
import { mockUsers } from '../../entities/user/api/userApi';

const STORAGE_KEY = 'exchange_app_deals';

export class DealStore {
  deals: IExchangeDeal[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();

    // Auto-save on any changes to deals array
    reaction(
      () => this.deals.length + this.deals.map(d => d.status).join(','),
      () => this.saveToStorage(),
      { delay: 100 }
    );
  }

  // Load deals from localStorage
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedDeals = JSON.parse(stored) as IExchangeDeal[];
        runInAction(() => {
          this.deals = parsedDeals;
          // Sync item lock states based on active deals
          this.syncItemLockStates();
        });
      }
    } catch (e) {
      console.error('Failed to load deals from storage:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Save deals to localStorage
  saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.deals));
    } catch (e) {
      console.error('Failed to save deals to storage:', e);
    }
  }

  // Sync item lock states based on deal statuses
  syncItemLockStates(): void {
    // First, unlock all items
    mockItems.forEach(item => {
      item.isLocked = false;
    });

    // Then lock items in ACTIVE or CONFIRMING deals
    this.deals.forEach(deal => {
      if (deal.status === DealStatusEnum.ACTIVE ||
          deal.status === DealStatusEnum.CONFIRMING ||
          deal.status === DealStatusEnum.CONFIRMED) {
        deal.chain.forEach(link => {
          const item = mockItems.find(i => i.id === link.givingItem.id);
          if (item) {
            item.isLocked = true;
          }
        });
      }
    });
  }

  // Create a new deal
  createDeal = async (
    initiatorId: number,
    targetItem: IItem,
    selectedGivingItems: IItem[],
    dealType: 'DIRECT' | 'CHAIN' = 'DIRECT'
  ): Promise<IExchangeDeal> => {
    this.isLoading = true;

    await new Promise(r => setTimeout(r, 500));

    const chain: IExchangeDeal['chain'] = [];
    const givingItem = selectedGivingItems[0];
    const targetOwner = mockUsers[targetItem.holderId] || mockUsers[1];

    // First link: initiator
    chain.push({
      userId: initiatorId,
      user: mockUsers[initiatorId] || mockUsers[1],
      status: ChainLinkStatus.ACCEPTED,
      givingItemId: givingItem.id,
      givingItem: givingItem,
      receivingItemId: targetItem.id,
      receivingItem: targetItem,
      logisticsStatus: LogisticsStatus.NONE,
    });

    // Second link: target owner (needs to confirm)
    chain.push({
      userId: targetItem.holderId,
      user: targetOwner,
      status: ChainLinkStatus.PENDING,
      givingItemId: targetItem.id,
      givingItem: targetItem,
      receivingItemId: givingItem.id,
      receivingItem: givingItem,
      logisticsStatus: LogisticsStatus.NONE,
    });

    // Lock all items in the deal
    selectedGivingItems.forEach(item => {
      const idx = mockItems.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        mockItems[idx].isLocked = true;
      }
    });

    const targetIdx = mockItems.findIndex(i => i.id === targetItem.id);
    if (targetIdx !== -1) {
      mockItems[targetIdx].isLocked = true;
    }

    const newDeal: IExchangeDeal = {
      id: `deal-${Date.now()}`,
      status: DealStatusEnum.PENDING,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      initiatorId,
      chain,
    };

    runInAction(() => {
      this.deals.push(newDeal);
      this.syncItemLockStates();
      this.saveToStorage();
      this.isLoading = false;
    });

    return newDeal;
  };

  // Confirm a deal (for the recipient)
  confirmDeal = (dealId: string): void => {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) return;

    runInAction(() => {
      deal.status = DealStatusEnum.ACTIVE;
      deal.chain.forEach(link => {
        link.status = ChainLinkStatus.ACCEPTED;
      });
      this.syncItemLockStates();
      this.saveToStorage();
    });
  };

  // Cancel/decline a deal
  cancelDeal = (dealId: string, reason?: string): void => {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) return;

    runInAction(() => {
      deal.status = DealStatusEnum.CANCELLED;
      deal.declineReason = reason;

      // Unlock all items in the deal
      deal.chain.forEach(link => {
        const item = mockItems.find(i => i.id === link.givingItem.id);
        if (item) {
          item.isLocked = false;
        }
        // Reset holderId to authorId for chain deals
        link.status = ChainLinkStatus.DECLINED;
      });

      this.syncItemLockStates();
      this.saveToStorage();
    });
  };

  // Get pending deals for a specific user (Inbox)
  getPendingDealsForUser(userId: number): IExchangeDeal[] {
    return this.deals.filter(deal =>
      deal.status === DealStatusEnum.PENDING &&
      deal.chain.some(link => link.userId === userId && link.status === ChainLinkStatus.PENDING)
    );
  }

  // Get all deals involving a specific user
  getDealsForUser(userId: number): IExchangeDeal[] {
    return this.deals.filter(deal =>
      deal.chain.some(link => link.userId === userId)
    );
  }

  // Get deal by ID
  getDealById(dealId: string): IExchangeDeal | undefined {
    return this.deals.find(d => d.id === dealId);
  }

  // Reset all deals (for debug purposes)
  resetAllDeals = (): void => {
    runInAction(() => {
      // Unlock all items
      mockItems.forEach(item => {
        item.isLocked = false;
        // Reset holderId to authorId
        item.holderId = item.authorId;
      });

      // Clear all deals
      this.deals = [];

      // Save to storage
      this.saveToStorage();

      // Reload page to refresh state
      window.location.reload();
    });
  };
}

export const dealStore = new DealStore();
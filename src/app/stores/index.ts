import { makeAutoObservable, runInAction } from 'mobx';
import type { User, Item, Chain, DealLogistics, LinkStatus } from '../../shared/types';
import { itemsApi, chainsApi, logisticsApi } from '../../shared/api/endpoints';

class UserStore {
  currentUser: User | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: User) {
    this.currentUser = user;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  updateRating(newRating: number) {
    if (this.currentUser) {
      this.currentUser.rating = newRating;
    }
  }

  incrementDeclinedCount() {
    if (this.currentUser) {
      this.currentUser.declinedCount += 1;
    }
  }
}

class ItemsStore {
  items: Item[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setItems(items: Item[]) {
    this.items = items;
  }

  addItem(item: Item) {
    this.items.push(item);
  }

  updateItem(id: string, updates: Partial<Item>) {
    const index = this.items.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...updates };
    }
  }

  removeItem(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
  }

  get availableItems() {
    return this.items.filter((item) => !item.isLocked);
  }

  get lockedItems() {
    return this.items.filter((item) => item.isLocked);
  }

  async fetchItems() {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    try {
      const data = await itemsApi.getAll();
      runInAction(() => {
        this.items = data;
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Failed to fetch items';
        this.isLoading = false;
      });
    }
  }

  async createItem(data: { title: string; description: string; imageUrl?: string }) {
    try {
      const newItem = await itemsApi.create(data);
      runInAction(() => {
        this.addItem(newItem);
      });
      return newItem;
    } catch (e) {
      throw e;
    }
  }
}

class ChainsStore {
  chains: Chain[] = [];
  activeChain: Chain | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setChains(chains: Chain[]) {
    this.chains = chains;
  }

  setActiveChain(chain: Chain | null) {
    this.activeChain = chain;
  }

  updateLinkStatus(chainId: string, linkId: string, status: LinkStatus) {
    const chain = this.chains.find((c) => c.id === chainId);
    if (chain) {
      const link = chain.links.find((l) => l.id === linkId);
      if (link) {
        link.status = status;
      }
    }
    if (this.activeChain?.id === chainId) {
      const link = this.activeChain.links.find((l) => l.id === linkId);
      if (link) {
        link.status = status;
      }
    }
  }

  get pendingChains() {
    return this.chains.filter((c) => c.status === 'ACTIVE');
  }

  async fetchChains() {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    try {
      const data = await chainsApi.getAll();
      runInAction(() => {
        this.setChains(data);
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Failed to fetch chains';
        this.isLoading = false;
      });
    }
  }

  async fetchChainById(id: string) {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    try {
      const data = await chainsApi.getById(id);
      runInAction(() => {
        this.setActiveChain(data);
        this.isLoading = false;
      });
      return data;
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Failed to fetch chain';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async joinChain(chainId: string, itemIds: string[]) {
    try {
      const chain = await chainsApi.join({ chainId, itemIds });
      runInAction(() => {
        this.setActiveChain(chain);
      });
      return chain;
    } catch (e) {
      throw e;
    }
  }

  async acceptLink(chainId: string, linkId: string) {
    try {
      const chain = await chainsApi.acceptLink(chainId, linkId);
      runInAction(() => {
        this.setActiveChain(chain);
        this.updateLinkStatus(chainId, linkId, 'ACCEPTED');
      });
      return chain;
    } catch (e) {
      throw e;
    }
  }

  async declineLink(chainId: string, linkId: string, reason?: string) {
    try {
      const chain = await chainsApi.declineLink(chainId, linkId, reason);
      runInAction(() => {
        this.setActiveChain(chain);
        this.updateLinkStatus(chainId, linkId, 'DECLINED');
      });
      return chain;
    } catch (e) {
      throw e;
    }
  }
}

class LogisticsStore {
  dealStatus: DealLogistics | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setDealStatus(status: DealLogistics) {
    this.dealStatus = status;
  }

  async fetchDealStatus(chainId: string) {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    try {
      const data = await logisticsApi.getDealStatus(chainId);
      runInAction(() => {
        this.setDealStatus(data);
        this.isLoading = false;
      });
      return data;
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Failed to fetch logistics';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async confirmDelivery(chainId: string) {
    try {
      const data = await logisticsApi.confirmDelivery(chainId);
      runInAction(() => {
        this.setDealStatus(data);
      });
      return data;
    } catch (e) {
      throw e;
    }
  }
}

class NotificationsStore {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }> = [];

  constructor() {
    makeAutoObservable(this);
  }

  addNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  ) {
    const id = Date.now().toString();
    this.notifications.unshift({
      id,
      type,
      message,
      timestamp: Date.now(),
    });
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(id);
    }, 5000);
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  clearAll() {
    this.notifications = [];
  }
}

// Export singleton instances
export const userStore = new UserStore();
export const itemsStore = new ItemsStore();
export const chainsStore = new ChainsStore();
export const logisticsStore = new LogisticsStore();
export const notificationsStore = new NotificationsStore();
